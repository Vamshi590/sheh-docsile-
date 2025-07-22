import { ipcMain } from 'electron'
import * as fs from 'fs'
import { join } from 'path'
import XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import { createClient } from '@supabase/supabase-js'

// Define Lab interface
interface Lab {
  id: string
  [key: string]: unknown
}

// Get the AppData path for storing user data
const appDataPath = join(process.env.APPDATA || '', 'ShehData')

// Path to the labs Excel file
const labsFilePath = join(appDataPath, 'labs.xlsx')

// Initialize labs file if it doesn't exist
const initLabsFile = (): void => {
  if (!fs.existsSync(labsFilePath)) {
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet([])
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Labs')
    XLSX.writeFile(workbook, labsFilePath)
    console.log('Created new labs file')
  }
}

// Initialize the labs file
initLabsFile()

// Register IPC handlers for labs
export const registerLabHandlers = (): void => {
  // Get all labs
  ipcMain.handle('getLabs', async () => {
    try {
      // Try to get labs from Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data: labs, error } = await supabase
          .from('labs')
          .select('*')
          .order('DATE', { ascending: false })
        
        if (!error && labs) {
          console.log('Labs fetched from Supabase successfully')
          return labs
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      if (!fs.existsSync(labsFilePath)) {
        return []
      }
      
      const workbook = XLSX.readFile(labsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      
      console.log('Falling back to local Excel file for labs data')
      return labs
    } catch (error) {
      console.error('Error getting labs:', error)
      return []
    }
  })
  
  // Get today's labs
  ipcMain.handle('getTodaysLabs', async () => {
    try {
      // Get today's date in YYYY-MM-DD format
      const todayDate = new Date().toISOString().split('T')[0]
      
      // Try to get today's labs from Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data: labs, error } = await supabase
          .from('labs')
          .select('*')
          .eq('DATE', todayDate)
        
        if (!error && labs) {
          console.log("Today's labs fetched from Supabase successfully")
          return labs
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      if (!fs.existsSync(labsFilePath)) {
        return []
      }
      
      const workbook = XLSX.readFile(labsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      const todaysLabs = labs.filter((lab) => lab.DATE === todayDate)
      
      console.log("Falling back to local Excel file for today's labs data")
      return todaysLabs
    } catch (error) {
      console.error("Error getting today's labs:", error)
      return []
    }
  })
  
  // Add a new lab
  ipcMain.handle('addLab', async (_, labData: Omit<Lab, 'id'>) => {
    try {
      // Generate a unique ID for the new lab
      const newLab = {
        id: uuidv4(),
        ...labData
      }
      
      // Try to add lab to Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data, error } = await supabase
          .from('labs')
          .insert(newLab)
          .select()
        
        if (!error && data) {
          console.log('Lab added to Supabase successfully')
          return data[0]
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      let labs: Lab[] = []
      
      if (fs.existsSync(labsFilePath)) {
        const workbook = XLSX.readFile(labsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      }
      
      // Add the new lab
      labs.push(newLab)
      
      // Write back to Excel file
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(labs)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Labs')
      XLSX.writeFile(newWorkbook, labsFilePath)
      
      console.log('Lab added to Excel file successfully')
      return newLab
    } catch (error) {
      console.error('Error adding lab:', error)
      return null
    }
  })
  
  // Update an existing lab
  ipcMain.handle('updateLab', async (_, labData: Lab) => {
    try {
      const { id } = labData
      
      // Try to update lab in Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data, error } = await supabase
          .from('labs')
          .update(labData)
          .eq('id', id)
          .select()
        
        if (!error && data) {
          console.log('Lab updated in Supabase successfully')
          return data[0]
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      if (!fs.existsSync(labsFilePath)) {
        return null
      }
      
      const workbook = XLSX.readFile(labsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      
      // Find and update the lab
      const labIndex = labs.findIndex((lab) => lab.id === id)
      
      if (labIndex === -1) {
        return null
      }
      
      labs[labIndex] = labData
      
      // Write back to Excel file
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(labs)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Labs')
      XLSX.writeFile(newWorkbook, labsFilePath)
      
      console.log('Lab updated in Excel file successfully')
      return labData
    } catch (error) {
      console.error('Error updating lab:', error)
      return null
    }
  })
  
  // Delete a lab
  ipcMain.handle('deleteLab', async (_, id: string) => {
    try {
      // Try to delete lab from Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { error } = await supabase
          .from('labs')
          .delete()
          .eq('id', id)
        
        if (!error) {
          console.log('Lab deleted from Supabase successfully')
          return true
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      if (!fs.existsSync(labsFilePath)) {
        return false
      }
      
      const workbook = XLSX.readFile(labsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      
      // Filter out the lab to delete
      const filteredLabs = labs.filter((lab) => lab.id !== id)
      
      if (filteredLabs.length === labs.length) {
        // No lab was removed
        return false
      }
      
      // Write back to Excel file
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(filteredLabs)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Labs')
      XLSX.writeFile(newWorkbook, labsFilePath)
      
      console.log('Lab deleted from Excel file successfully')
      return true
    } catch (error) {
      console.error('Error deleting lab:', error)
      return false
    }
  })
  
  // Search labs by patient ID
  ipcMain.handle('searchLabs', async (_, patientId: string) => {
    try {
      // Try to search labs in Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data: labs, error } = await supabase
          .from('labs')
          .select('*')
          .eq('PATIENT ID', patientId)
          .order('DATE', { ascending: false })
        
        if (!error && labs) {
          console.log('Labs searched in Supabase successfully')
          return labs
        }
      }
      
      // Fallback to local Excel file if Supabase fails
      if (!fs.existsSync(labsFilePath)) {
        return []
      }
      
      const workbook = XLSX.readFile(labsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const labs = XLSX.utils.sheet_to_json(worksheet) as Lab[]
      
      // Filter labs by patient ID
      const patientLabs = labs.filter((lab) => lab['PATIENT ID'] === patientId)
      
      console.log('Labs searched in Excel file successfully')
      return patientLabs
    } catch (error) {
      console.error('Error searching labs:', error)
      return []
    }
  })
  
  // Get lab test options
  ipcMain.handle('getLabTestOptions', async () => {
    try {
      // Try to get options from Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        const { data: options, error } = await supabase
          .from('dropdown_options')
          .select('option_value')
          .eq('field_name', 'labTest')
          .order('option_value', { ascending: true })
        
        if (!error && options && options.length > 0) {
          return options.map(item => item.option_value)
        }
      }
      
      // Fall back to file-based options if Supabase fails or returns no results
      const optionsFilePath = join(appDataPath, 'labTestOptions.json')
      if (!fs.existsSync(optionsFilePath)) {
        return []
      }
      const data = fs.readFileSync(optionsFilePath, 'utf8')
      return JSON.parse(data)
    } catch (error) {
      console.error('Error getting lab test options:', error)
      return []
    }
  })
  
  // Add a lab test option
  ipcMain.handle('addLabTestOption', async (_, value: string) => {
    try {
      const trimmedValue = value.trim()
      if (!trimmedValue) return false
      
      // Try to add to Supabase first
      const supabaseUrl = process.env.SUPABASE_URL
      const supabaseKey = process.env.SUPABASE_KEY
      
      if (supabaseUrl && supabaseKey) {
        const supabase = createClient(supabaseUrl, supabaseKey)
        
        // Check if option already exists (case-insensitive)
        const { data: existingOptions, error: checkError } = await supabase
          .from('dropdown_options')
          .select('option_value')
          .eq('field_name', 'labTest')
          .ilike('option_value', trimmedValue)
        
        if (!checkError && existingOptions && existingOptions.length === 0) {
          // Option doesn't exist, add it
          const { error } = await supabase
            .from('dropdown_options')
            .insert({ field_name: 'labTest', option_value: trimmedValue })
          
          if (!error) {
            return true
          }
        } else if (!checkError && existingOptions && existingOptions.length > 0) {
          // Option already exists
          return true
        }
      }
      
      // Fall back to file-based storage if Supabase fails
      const optionsFilePath = join(appDataPath, 'labTestOptions.json')
      let options: string[] = []
      
      if (fs.existsSync(optionsFilePath)) {
        const data = fs.readFileSync(optionsFilePath, 'utf8')
        options = JSON.parse(data)
      }
      
      // Check if option already exists (case-insensitive)
      if (!options.some(option => option.toLowerCase() === trimmedValue.toLowerCase())) {
        options.push(trimmedValue)
        options.sort() // Sort alphabetically
        fs.writeFileSync(optionsFilePath, JSON.stringify(options))
      }
      
      return true
    } catch (error) {
      console.error('Error adding lab test option:', error)
      return false
    }
  })
}
