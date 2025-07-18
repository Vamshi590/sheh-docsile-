import { app, shell, BrowserWindow, ipcMain } from 'electron'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
import fs from 'fs'
import { promisify } from 'util'
import { exec } from 'child_process'
import bcrypt from 'bcryptjs'
// No longer using electron-store
import XLSX from 'xlsx'
import { v4 as uuidv4 } from 'uuid'
import crypto from 'crypto'

// Define interfaces for better type safety
interface StaffMember {
  id: string
  username: string
  passwordHash?: string
  fullName?: string
  position?: string
  salary?: number
  permissions?: Record<string, boolean>
  isAdmin?: boolean
  createdAt: string
  updatedAt: string
  [key: string]: unknown
}
interface Patient {
  id: string
  date: string
  patientId: string
  name: string
  guardian: string
  dob: string
  age: number
  gender: string
  phone: string
  address: string
}

// Get the AppData path for storing user data
const appDataPath = join(app.getPath('appData'), 'ShehData')

// Create the directory if it doesn't exist
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true })
}

// Path to the staff users file
const staffFilePath = join(appDataPath, 'staff.xlsx')

// Path to the patients Excel file
const patientsFilePath = join(appDataPath, 'patients.xlsx')

// Path to the prescriptions and receipts Excel file
const prescriptionsFilePath = join(appDataPath, 'prescriptions_and_receipts.xlsx')

// Path to the operations Excel file
const operationsFilePath = join(appDataPath, 'operations.xlsx')

// Path to the medicines Excel file
const medicinesFilePath = join(appDataPath, 'medicines.xlsx')

// Path to the opticals Excel file
const opticalsFilePath = join(appDataPath, 'opticals.xlsx')

// Note: opticalDispenseFilePath is defined later in the file

// Path to the settings JSON file
const settingsFilePath = join(appDataPath, 'settings.json')

// Create settings file if it doesn't exist
if (!fs.existsSync(settingsFilePath)) {
  fs.writeFileSync(
    settingsFilePath,
    JSON.stringify({
      // Default settings here
      theme: 'light',
      language: 'en'
    }),
    'utf8'
  )
}

// Helper functions to read/write settings
const getSettings = (): Record<string, unknown> => {
  try {
    return JSON.parse(fs.readFileSync(settingsFilePath, 'utf8'))
  } catch (error) {
    console.error('Error reading settings:', error)
    return {}
  }
}

const setSetting = (key: string, value: unknown): void => {
  try {
    const settings = getSettings()
    settings[key] = value
    fs.writeFileSync(settingsFilePath, JSON.stringify(settings), 'utf8')
  } catch (error) {
    console.error(`Error saving setting ${key}:`, error)
  }
}

// Helper function to hide a file
const hideFile = async (path: string): Promise<void> => {
  if (process.platform === 'win32') {
    const execPromise = promisify(exec)
    await execPromise(`attrib +h "${path}"`)
  }
}

// Initialize staff file if it doesn't exist
if (!fs.existsSync(staffFilePath)) {
  const workbook = XLSX.utils.book_new()

  // Create default admin user
  const defaultAdmin = {
    id: uuidv4(),
    username: 'srilathach',
    passwordHash: bcrypt.hashSync('9573076861', 10),
    fullName: 'Srilatha Ch',
    position: 'Admin',
    salary: 0,
    permissions: {
      patients: true,
      prescriptions: true,
      medicines: true,
      opticals: true,
      receipts: true,
      analytics: true,
      staff: true,
      operations: true,
      reports: true,
      duesFollowUp: true,
      data: true
    },
    isAdmin: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString()
  }

  const worksheet = XLSX.utils.json_to_sheet([defaultAdmin])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff')
  XLSX.writeFile(workbook, staffFilePath)
}

// Initialize patients Excel file if it doesn't exist
if (!fs.existsSync(patientsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients')
  XLSX.writeFile(workbook, patientsFilePath)
}

// Initialize prescriptions and receipts Excel file if it doesn't exist
if (!fs.existsSync(prescriptionsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Prescriptions')
  XLSX.writeFile(workbook, prescriptionsFilePath)
}

// Initialize operations Excel file if it doesn't exist
if (!fs.existsSync(operationsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Operations')
  XLSX.writeFile(workbook, operationsFilePath)
}

// Initialize medicines Excel file if it doesn't exist
if (!fs.existsSync(medicinesFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines')
  XLSX.writeFile(workbook, medicinesFilePath)
}

// Initialize opticals Excel file if it doesn't exist
if (!fs.existsSync(opticalsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Opticals')
  XLSX.writeFile(workbook, opticalsFilePath)
}

function createWindow(): void {
  // Create the browser window.
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 670,
    show: false,
    autoHideMenuBar: true,
    ...(process.platform === 'linux' ? { icon } : {}),
    webPreferences: {
      preload: join(__dirname, '../preload/index.js'),
      sandbox: false
    }
  })

  mainWindow.on('ready-to-show', () => {
    mainWindow.show()
  })

  mainWindow.webContents.setWindowOpenHandler((details) => {
    shell.openExternal(details.url)
    return { action: 'deny' }
  })

  // HMR for renderer base on electron-vite cli.
  // Load the remote URL for development or the local html file for production.
  if (is.dev && process.env['ELECTRON_RENDERER_URL']) {
    mainWindow.loadURL(process.env['ELECTRON_RENDERER_URL'])
  } else {
    mainWindow.loadFile(join(__dirname, '../renderer/index.html'))
  }
}

// Authentication and Staff Management
// Hard-coded default admin credentials (bypass Excel file)
const HARDCODED_ADMIN_USERNAME = 'srilathach'
const HARDCODED_ADMIN_PASSWORD_HASH = bcrypt.hashSync('9573076861', 10)
const HARDCODED_ADMIN_USER: StaffMember = {
  id: 'hardcoded-admin',
  username: HARDCODED_ADMIN_USERNAME,
  passwordHash: HARDCODED_ADMIN_PASSWORD_HASH,
  fullName: 'Srilatha Ch',
  position: 'Admin',
  salary: 0,
  permissions: {
    patients: true,
    prescriptions: true,
    medicines: true,
    opticals: true,
    receipts: true,
    analytics: true,
    staff: true,
    operations: true,
    reports: true,
    duesFollowUp: true,
    data: true
  },
  isAdmin: true,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString()
}

// Login handler
ipcMain.handle('login', async (_, username: string, password: string) => {
  try {
    // Check if credentials match hard-coded admin first
    if (username.trim().toLowerCase() === HARDCODED_ADMIN_USERNAME.toLowerCase()) {
      const isPasswordValid = bcrypt.compareSync(password.trim(), HARDCODED_ADMIN_PASSWORD_HASH)
      if (!isPasswordValid) {
        return { success: false, error: 'Invalid username or password' }
      }
      setSetting('currentUser', { username: HARDCODED_ADMIN_USERNAME, id: HARDCODED_ADMIN_USER.id })
      const { passwordHash: _ph, ...userWithoutPassword } = HARDCODED_ADMIN_USER // eslint-disable-line @typescript-eslint/no-unused-vars
      return { success: true, user: userWithoutPassword }
    }

    // Check if staff file exists
    if (!fs.existsSync(staffFilePath)) {
      return { success: false, error: 'Staff database not found' }
    }

    // Read staff file
    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Find user by username
    const normalizedUsername = username.trim().toLowerCase()
    const user = staff.find((s) => (s.username || '').toLowerCase() === normalizedUsername)

    if (!user) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Verify password
    const isPasswordValid = bcrypt.compareSync(password.trim(), user.passwordHash || '')

    if (!isPasswordValid) {
      return { success: false, error: 'Invalid username or password' }
    }

    // Return user without password hash (exclude passwordHash from the returned object)
    const { passwordHash, ...userWithoutPassword } = user // eslint-disable-line @typescript-eslint/no-unused-vars
    // Store the logged-in user information
    setSetting('currentUser', { username: user.username, id: user.id })
    return { success: true, user: userWithoutPassword }
  } catch (error) {
    console.error('Login error:', error)
    return { success: false, error: 'An error occurred during login' }
  }
})

// Get staff list
ipcMain.handle('getStaffList', async () => {
  try {
    if (!fs.existsSync(staffFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Reconstruct permissions from flat columns and return staff list without password hashes
    return staff.map((user) => {
      const {
        patients = false,
        prescriptions = false,
        medicines = false,
        opticals = false,
        receipts = false,
        analytics = false,
        staff: staffPerm = false,
        operations = false,
        reports = false,
        duesFollowUp = false,
        data = false,
        ...rest
      } = user as unknown as Record<string, unknown>

      const reconstructedPermissions: StaffMember['permissions'] = {
        patients: Boolean(patients),
        prescriptions: Boolean(prescriptions),
        medicines: Boolean(medicines),
        opticals: Boolean(opticals),
        receipts: Boolean(receipts),
        analytics: Boolean(analytics),
        staff: Boolean(staffPerm),
        operations: Boolean(operations),
        reports: Boolean(reports),
        duesFollowUp: Boolean(duesFollowUp),
        data: Boolean(data)
      }

      return { ...(rest as object), permissions: reconstructedPermissions } as StaffMember
    })
  } catch (error) {
    console.error('Error getting staff list:', error)
    throw error
  }
})

// Add new staff member
ipcMain.handle('addStaff', async (_, staffData: Partial<StaffMember>) => {
  try {
    // Generate ID if not provided
    const staffWithId: StaffMember = {
      ...(staffData as object),
      id: staffData.id || uuidv4(),
      username: staffData.username || '',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }

    // Hash the password if provided
    if (staffWithId.passwordHash) {
      staffWithId.passwordHash = bcrypt.hashSync(staffWithId.passwordHash, 10)
    }

    // Read existing staff
    let staff: StaffMember[] = []
    if (fs.existsSync(staffFilePath)) {
      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
    }

    // Flatten permissions into separate columns for Excel storage
    const { permissions, ...restStaff } = staffWithId
    const staffToSave = {
      ...restStaff,
      ...permissions
    } as unknown as StaffMember

    // Add new staff member
    staff.push(staffToSave)

    // Write back to file
    const workbook = XLSX.utils.book_new()
    const worksheet = XLSX.utils.json_to_sheet(staff)
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Staff')
    XLSX.writeFile(workbook, staffFilePath)

    // Return the new staff member without password hash
    const { passwordHash, ...staffWithoutPassword } = staffWithId // eslint-disable-line @typescript-eslint/no-unused-vars
    return staffWithoutPassword
  } catch (error) {
    console.error('Error adding staff:', error)
    throw error
  }
})

// Update staff member
ipcMain.handle('updateStaff', async (_, id: string, staffData: Partial<StaffMember>) => {
  try {
    if (!fs.existsSync(staffFilePath)) {
      throw new Error('Staff file does not exist')
    }

    // Read existing staff
    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Find the staff member to update
    const staffIndex = staff.findIndex((s) => s.id === id)

    if (staffIndex === -1) {
      throw new Error('Staff member not found')
    }

    // Update the staff member
    const updatedStaff = {
      ...(staff[staffIndex] as object),
      ...(staffData as object),
      updatedAt: new Date().toISOString()
    } as StaffMember

    // Hash the password if it was updated
    if (staffData.passwordHash) {
      updatedStaff.passwordHash = bcrypt.hashSync(staffData.passwordHash, 10)
    }

    // Replace the staff member in the array
    staff[staffIndex] = updatedStaff

    // Write back to file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(staff)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
    XLSX.writeFile(newWorkbook, staffFilePath)

    // Return the updated staff member without password hash
    const { passwordHash, ...staffWithoutPassword } = updatedStaff // eslint-disable-line @typescript-eslint/no-unused-vars
    return staffWithoutPassword
  } catch (error) {
    console.error('Error updating staff:', error)
    throw error
  }
})

// Delete staff member
ipcMain.handle('deleteStaff', async (_, id: string) => {
  try {
    if (!fs.existsSync(staffFilePath)) {
      throw new Error('Staff file does not exist')
    }

    // Read existing staff
    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Filter out the staff member to delete
    const updatedStaff = staff.filter((s) => s.id !== id)

    // Make sure we're not deleting the last admin
    const remainingAdmins = updatedStaff.filter((s) => s.isAdmin)
    if (remainingAdmins.length === 0) {
      throw new Error('Cannot delete the last administrator')
    }

    // Write back to file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(updatedStaff)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
    XLSX.writeFile(newWorkbook, staffFilePath)

    return { success: true }
  } catch (error) {
    console.error('Error deleting staff:', error)
    throw error
  }
})

// Reset staff password
ipcMain.handle('resetStaffPassword', async (_, id: string) => {
  try {
    if (!fs.existsSync(staffFilePath)) {
      throw new Error('Staff file does not exist')
    }

    // Read existing staff
    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Find the staff member
    const staffIndex = staff.findIndex((s) => s.id === id)

    if (staffIndex === -1) {
      throw new Error('Staff member not found')
    }

    // Generate a random password
    const newPassword = crypto.randomBytes(4).toString('hex')

    // Update the staff member's password
    staff[staffIndex] = {
      ...staff[staffIndex],
      passwordHash: bcrypt.hashSync(newPassword, 10),
      updatedAt: new Date().toISOString()
    }

    // Write back to file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(staff)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
    XLSX.writeFile(newWorkbook, staffFilePath)

    // Return the new password
    return newPassword
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
})

// Check if user has permission for a module
ipcMain.handle('checkPermission', async (_, userId: string, module: string) => {
  try {
    if (!fs.existsSync(staffFilePath)) {
      return { hasAccess: false, module }
    }

    // Read staff file
    const workbook = XLSX.readFile(staffFilePath)
    const worksheet = workbook.Sheets[workbook.SheetNames[0]]
    const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

    // Find user by ID
    const user = staff.find((s) => s.id === userId)

    if (!user) {
      return { hasAccess: false, module }
    }

    // Check if user is admin or has specific permission
    const hasAccess = user.isAdmin || (user.permissions && user.permissions[module])

    return { hasAccess, module }
  } catch (error) {
    console.error('Permission check error:', error)
    return { hasAccess: false, module }
  }
})

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.whenReady().then(() => {
  // Set app user model id for windows
  electronApp.setAppUserModelId('com.electron')

  // Default open or close DevTools by F12 in development
  // and ignore CommandOrControl + R in production.
  // see https://github.com/alex8088/electron-toolkit/tree/master/packages/utils
  app.on('browser-window-created', (_, window) => {
    optimizer.watchWindowShortcuts(window)
  })

  // IPC test
  ipcMain.on('ping', () => console.log('pong'))

  createWindow()

  app.on('activate', function () {
    // On macOS it's common to re-create a window in the app when the
    // dock icon is clicked and there are no other windows open.
    if (BrowserWindow.getAllWindows().length === 0) createWindow()
  })
})

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit()
  }
})

// IPC handlers for authentication and patient management

// Authentication handler is already defined above

// Import Supabase client
import { supabase } from './supabaseClient'

// Get today's patients
ipcMain.handle('getTodaysPatients', async () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().split('T')[0]

    // Fetch today's patients from Supabase
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('date', todayDate)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log("Today's patients fetched from Supabase successfully")
    return patients || []
  } catch (error) {
    console.error("Error getting today's patients from Supabase:", error)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(patientsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      const patients = XLSX.utils.sheet_to_json(worksheet) as Patient[]
      const todayDate = new Date().toISOString().split('T')[0]
      const todaysPatients = patients.filter((patient) => patient.date === todayDate)

      console.log("Falling back to local Excel file for today's patients data")
      return todaysPatients
    } catch (localError) {
      console.error("Error getting today's patients from local file:", localError)
      return []
    }
  }
})

// Get all patients
ipcMain.handle('getPatients', async () => {
  try {
    // Fetch all patients from Supabase
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .order('date', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Patients fetched from Supabase successfully')
    return patients || []
  } catch (error) {
    console.error('Error getting patients from Supabase:', error)
    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(patientsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const patients = XLSX.utils.sheet_to_json(worksheet) as Patient[]

      console.log('Falling back to local Excel file for patients data')
      return patients
    } catch (excelError) {
      console.error('Error reading from Excel file:', excelError)
      return []
    }
  }
})

// Add a new patient
ipcMain.handle('addPatient', async (_, patient) => {
  try {
    // Generate a unique ID for the patient
    const patientWithId = { ...patient, id: uuidv4() }

    // Read existing patients from Excel to maintain local data consistency
    let patients: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(patientsFilePath)) {
      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      patients = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add the new patient to the local array
    patients.push(patientWithId)

    // Write back to Excel file to maintain local data
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(patients)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
    XLSX.writeFile(newWorkbook, patientsFilePath)

    // Also add the patient to Supabase
    try {
      // Insert patient into Supabase
      const { data, error } = await supabase.from('patients').insert([patientWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      console.log('Patient added to Supabase:', data)
    } catch (supabaseError) {
      console.error('Error adding patient to Supabase:', supabaseError)
      // We don't throw this error to maintain backward compatibility
      // The patient is still added to the local Excel file
    }

    return patientWithId
  } catch (error) {
    console.error('Error adding patient:', error)
    throw error
  }
})

// Update an existing patient
ipcMain.handle('updatePatient', async (_, id, updatedPatient) => {
  try {
    // Read existing patients
    if (!fs.existsSync(patientsFilePath)) {
      throw new Error('Patients file does not exist')
    }

    const workbook = XLSX.readFile(patientsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const patients: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find and update the patient
    const patientIndex = patients.findIndex((p) => p.id === id)

    if (patientIndex === -1) {
      throw new Error('Patient not found')
    }

    patients[patientIndex] = { ...updatedPatient, id }

    // Write back to Excel file
    try {
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(patients)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
      // Use a retry mechanism with timeout to handle file locks
      let retries = 3
      let success = false
      while (retries > 0 && !success) {
        try {
          XLSX.writeFile(newWorkbook, patientsFilePath)
          success = true
        } catch (error) {
          // Define a type for filesystem errors
          interface FileSystemError extends Error {
            code?: string
          }
          const writeError = error as FileSystemError
          if (writeError.code === 'EBUSY' && retries > 1) {
            // File is locked, wait a bit and retry
            console.log(`File is locked, retrying... (${retries - 1} attempts left)`)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
            retries--
          } else {
            // Either not a busy error or last retry failed
            throw writeError
          }
        }
      }
    } catch (excelError) {
      console.error('Error writing to Excel file:', excelError)
      // Continue with Google Sheets attempt even if Excel fails
    }
    // Also update the patient in Supabase
    try {
      // Update patient in Supabase
      const { data, error } = await supabase
        .from('patients')
        .update(patients[patientIndex])
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      console.log('Patient updated in Supabase:', data)
    } catch (supabaseError) {
      console.error('Error updating patient in Supabase:', supabaseError)
      // We don't throw this error to maintain backward compatibility
      // The patient is still updated in the local Excel file
    }

    return patients[patientIndex]
  } catch (error) {
    console.error('Error updating patient:', error)
    throw error
  }
})

// Delete a patient
ipcMain.handle('deletePatient', async (_, id) => {
  try {
    // Read existing patients
    if (!fs.existsSync(patientsFilePath)) {
      throw new Error('Patients file does not exist')
    }

    const workbook = XLSX.readFile(patientsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const patients: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Filter out the patient to delete
    const updatedPatients = patients.filter((p) => p.id !== id)

    // Write back to Excel file
    try {
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(updatedPatients)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
      // Use a retry mechanism with timeout to handle file locks
      let retries = 3
      let success = false
      while (retries > 0 && !success) {
        try {
          XLSX.writeFile(newWorkbook, patientsFilePath)
          success = true
        } catch (error) {
          // Define a type for filesystem errors
          interface FileSystemError extends Error {
            code?: string
          }
          const writeError = error as FileSystemError
          if (writeError.code === 'EBUSY' && retries > 1) {
            // File is locked, wait a bit and retry
            console.log(`File is locked, retrying... (${retries - 1} attempts left)`)
            await new Promise((resolve) => setTimeout(resolve, 1000)) // Wait 1 second
            retries--
          } else {
            // Either not a busy error or last retry failed
            throw writeError
          }
        }
      }
    } catch (excelError) {
      console.error('Error writing to Excel file:', excelError)
      // Continue with Google Sheets attempt even if Excel fails
    }
    // Also delete the patient from Supabase
    try {
      // Delete patient from Supabase
      const { error } = await supabase.from('patients').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }
      console.log('Patient deleted from Supabase successfully')
    } catch (supabaseError) {
      console.error('Error deleting patient from Supabase:', supabaseError)
      // We don't throw this error to maintain backward compatibility
      // The patient is still deleted from the local Excel file
    }

    return true
  } catch (error) {
    console.error('Error deleting patient:', error)
    return false
  }
})

// Get all prescriptions and receipts
ipcMain.handle('getPrescriptions', async () => {
  try {
    // Fetch all prescriptions from Supabase
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .order('DATE', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log('Prescriptions fetched from Supabase successfully')
    return prescriptions || []
  } catch (error) {
    console.error('Error getting prescriptions from Supabase:', error)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(prescriptionsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const prescriptions = XLSX.utils.sheet_to_json(worksheet)

      console.log('Falling back to local Excel file for prescriptions data')
      return prescriptions
    } catch (excelError) {
      console.error('Error reading from Excel file:', excelError)
      return []
    }
  }
})

// Get today's prescriptions
ipcMain.handle('getTodaysPrescriptions', async () => {
  try {
    // Get today's date in YYYY-MM-DD format
    const todayDate = new Date().toISOString().split('T')[0]

    // Fetch today's prescriptions from Supabase
    const { data: prescriptions, error } = await supabase
      .from('prescriptions')
      .select('*')
      .eq('DATE', todayDate)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    console.log("Today's prescriptions fetched from Supabase successfully")
    return prescriptions || []
  } catch (error) {
    console.error("Error getting today's prescriptions from Supabase:", error)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(prescriptionsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const prescriptions = XLSX.utils.sheet_to_json(worksheet) as Array<{ date?: string }>

      // Filter for today's date
      const todayDate = new Date().toISOString().split('T')[0]
      const todaysPrescriptions = prescriptions.filter((p) => {
        if (!p.date) return false
        return p.date.toString() === todayDate
      })

      console.log("Falling back to local Excel file for today's prescriptions data")
      return todaysPrescriptions
    } catch (excelError) {
      console.error('Error reading from Excel file:', excelError)
      return []
    }
  }
})

// Add a new prescription and receipt
ipcMain.handle('addPrescription', async (_, prescription) => {
  try {
    // Generate a unique ID for the prescription
    const prescriptionWithId = { ...prescription, id: uuidv4() }

    // Read existing prescriptions from local file for Sno calculation
    let prescriptions: Array<{ id: string; Sno?: number; [key: string]: unknown }> = []
    if (fs.existsSync(prescriptionsFilePath)) {
      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      prescriptions = XLSX.utils.sheet_to_json(worksheet)
    }

    // Also get the highest Sno from Supabase
    let highestSnoFromSupabase = 0
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('Sno')
        .order('Sno', { ascending: false })
        .limit(1)

      if (!error && data && data.length > 0 && data[0].Sno) {
        highestSnoFromSupabase = data[0].Sno as number
      }
    } catch (supabaseError) {
      console.error('Error getting highest Sno from Supabase:', supabaseError)
      // Continue with local calculation if Supabase fails
    }

    // Calculate highest Sno from local file
    const highestSnoFromLocal = prescriptions.reduce((max, item) => {
      const sno = typeof item.Sno === 'number' ? item.Sno : 0
      return sno > max ? sno : max
    }, 0)

    // Use the higher of the two values
    const highestSno = Math.max(highestSnoFromSupabase, highestSnoFromLocal)

    // Add the new prescription with Sno
    const prescriptionWithSno = { ...prescriptionWithId, Sno: highestSno + 1 }

    // Add to Supabase
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .insert([prescriptionWithSno])
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription added to Supabase:', data)
    } catch (supabaseError) {
      console.error('Error adding prescription to Supabase:', supabaseError)
      // Continue with local file update even if Supabase fails
    }

    // Also update local Excel file for backup
    prescriptions.push(prescriptionWithSno)
    try {
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(prescriptions)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
      XLSX.writeFile(newWorkbook, prescriptionsFilePath)
    } catch (excelError) {
      console.error('Error writing to Excel file:', excelError)
      // Continue even if Excel update fails
    }

    return prescriptionWithSno
  } catch (error) {
    console.error('Error adding prescription:', error)
    throw error
  }
})

// Update an existing prescription and receipt
ipcMain.handle('updatePrescription', async (_, id, updatedPrescription) => {
  try {
    // Update in Supabase first
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .update(updatedPrescription)
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription updated in Supabase:', data)

      // If Supabase update was successful, also update local Excel file
      try {
        // Read existing prescriptions
        if (!fs.existsSync(prescriptionsFilePath)) {
          return data[0] // Return Supabase data if Excel file doesn't exist
        }

        const workbook = XLSX.readFile(prescriptionsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const prescriptions: Array<{ id: string; [key: string]: unknown }> =
          XLSX.utils.sheet_to_json(worksheet) as Array<{ id: string; [key: string]: unknown }>

        // Find and update the prescription
        const prescriptionIndex = prescriptions.findIndex((p) => p.id === id)

        if (prescriptionIndex === -1) {
          // If not found in Excel, add it
          prescriptions.push({ ...updatedPrescription, id })
        } else {
          // Update existing record
          prescriptions[prescriptionIndex] = { ...updatedPrescription, id }
        }

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(prescriptions)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
        XLSX.writeFile(newWorkbook, prescriptionsFilePath)
      } catch (excelError) {
        console.error('Error updating prescription in Excel file:', excelError)
        // Return Supabase data even if Excel update fails
        return data[0]
      }

      return data[0]
    } catch (supabaseError) {
      console.error('Error updating prescription in Supabase:', supabaseError)
      // Fall back to Excel-only update if Supabase fails
    }

    // Fallback to Excel-only update
    // Read existing prescriptions
    if (!fs.existsSync(prescriptionsFilePath)) {
      throw new Error('Prescriptions file does not exist')
    }

    const workbook = XLSX.readFile(prescriptionsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const prescriptions: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find and update the prescription
    const prescriptionIndex = prescriptions.findIndex((p) => p.id === id)

    if (prescriptionIndex === -1) {
      throw new Error('Prescription not found')
    }

    prescriptions[prescriptionIndex] = { ...updatedPrescription, id }

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(prescriptions)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
    XLSX.writeFile(newWorkbook, prescriptionsFilePath)

    return prescriptions[prescriptionIndex]
  } catch (error) {
    console.error('Error updating prescription:', error)
    throw error
  }
})

// Delete a prescription and receipt
ipcMain.handle('deletePrescription', async (_, id) => {
  try {
    // Delete from Supabase first
    try {
      const { error } = await supabase.from('prescriptions').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescription deleted from Supabase successfully')
    } catch (supabaseError) {
      console.error('Error deleting prescription from Supabase:', supabaseError)
      // Continue with local file update even if Supabase fails
    }

    // Also update local Excel file
    try {
      // Read existing prescriptions
      if (!fs.existsSync(prescriptionsFilePath)) {
        return true // Return success if Excel file doesn't exist
      }

      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const prescriptions: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
        worksheet
      ) as Array<{ id: string; [key: string]: unknown }>

      // Filter out the prescription to delete
      const updatedPrescriptions = prescriptions.filter((p) => p.id !== id)

      // Write back to Excel file
      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(updatedPrescriptions)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
      XLSX.writeFile(newWorkbook, prescriptionsFilePath)
    } catch (excelError) {
      console.error('Error updating Excel file after deletion:', excelError)
      // Return success even if Excel update fails, as Supabase delete was successful
    }

    return true
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return false
  }
})

// Search prescriptions by patient ID, name, or phone number
ipcMain.handle('searchPrescriptions', async (_, searchTerm) => {
  try {
    // If no search term, return all prescriptions
    if (!searchTerm || searchTerm.trim() === '') {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('All prescriptions fetched from Supabase for search')
      return data || []
    }

    // Search in Supabase using ilike for case-insensitive search
    const searchTermLower = `%${searchTerm.toLowerCase()}%`

    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .or(
          `patientId.ilike.${searchTermLower},` +
            `name.ilike.${searchTermLower},` +
            `phone.ilike.${searchTermLower},` +
            `guardian.ilike.${searchTermLower}`
        )
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Prescriptions search results fetched from Supabase')
      return data || []
    } catch (supabaseError) {
      console.error('Error searching prescriptions in Supabase:', supabaseError)
      // Fall back to local Excel search if Supabase fails
    }

    // Fallback to local Excel search
    if (!fs.existsSync(prescriptionsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(prescriptionsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const prescriptions = XLSX.utils.sheet_to_json(worksheet) as Array<Record<string, unknown>>

    // Filter prescriptions based on search term
    const searchTermForComparison = searchTerm.toLowerCase()
    return prescriptions.filter((p) => {
      // Check all fields that might contain the search term
      for (const key in p) {
        const value = p[key]
        if (
          value &&
          typeof value.toString === 'function' &&
          value.toString().toLowerCase().includes(searchTermForComparison)
        ) {
          return true
        }
      }
      return false
    })
  } catch (error) {
    console.error('Error searching prescriptions:', error)
    return []
  }
})

// Search patients by ID, name, or phone number
ipcMain.handle('searchPatients', async (_, searchTerm) => {
  // If search term is empty, return all patients
  if (!searchTerm || searchTerm.trim() === '') {
    try {
      // Get all patients from Supabase
      const { data: patients, error } = await supabase.from('patients').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      return patients || []
    } catch (supabaseError) {
      console.error('Error getting patients from Supabase:', supabaseError)
      // Fall back to Excel
    }
  }

  // Search in Supabase using ilike for case-insensitive search
  const searchTermLower = `%${searchTerm.toLowerCase()}%`

  try {
    const { data, error } = await supabase
      .from('patients')
      .select('*')
      .or(
        `patientId.ilike.${searchTermLower},` +
          `name.ilike.${searchTermLower},` +
          `phone.ilike.${searchTermLower}`
      )

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return data || []
  } catch (supabaseError) {
    console.error('Error searching patients in Supabase:', supabaseError)
    // Fall back to local Excel search if Supabase fails
  }

  // Fallback to local Excel search
  try {
    if (!fs.existsSync(patientsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(patientsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const patients: Array<{
      id: string
      patientId: string
      name: string
      phone: string
      [key: string]: unknown
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Filter patients based on search term
    if (!searchTerm || searchTerm.trim() === '') {
      return patients
    }

    const searchTermForComparison = searchTerm.toLowerCase()
    return patients.filter(
      (p) =>
        (p.patientId && p.patientId.toString().toLowerCase().includes(searchTermForComparison)) ||
        (p.name && p.name.toString().toLowerCase().includes(searchTermForComparison)) ||
        (p.phone && p.phone.toString().toLowerCase().includes(searchTermForComparison))
    )
  } catch (error) {
    console.error('Error searching patients in Excel:', error)
    return []
  }
})

// Get all operations
ipcMain.handle('getOperations', async () => {
  try {
    // Fetch all operations from Supabase
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .order('dateOfAdmit', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return operations || []
  } catch (supabaseError) {
    console.error('Error getting operations from Supabase:', supabaseError)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(operationsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(operationsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]

      console.log('Falling back to local Excel file for operations data')
      return XLSX.utils.sheet_to_json(worksheet)
    } catch (excelError) {
      console.error('Error reading from Excel file:', excelError)
      return []
    }
  }
})

// Get operations for a specific patient
ipcMain.handle('getPatientOperations', async (_, patientId) => {
  try {
    // Fetch patient operations from Supabase
    const { data: operations, error } = await supabase
      .from('operations')
      .select('*')
      .eq('patientId', patientId)
      .order('dateOfAdmit', { ascending: false })

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    return operations || []
  } catch (supabaseError) {
    console.error('Error getting patient operations from Supabase:', supabaseError)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(operationsFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(operationsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const operations = XLSX.utils.sheet_to_json(worksheet) as Array<{ patientId: string }>

      // Filter operations for the specific patient
      console.log('Falling back to local Excel file for patient operations data')
      return operations.filter((operation) => operation.patientId === patientId)
    } catch (excelError) {
      console.error('Error reading from Excel file:', excelError)
      return []
    }
  }
})

// Add a new operation
ipcMain.handle('addOperation', async (_, operation) => {
  try {
    // Generate a unique ID for the operation
    const operationWithId = { ...operation, id: uuidv4() }

    // Insert operation into Supabase
    try {
      const { data, error } = await supabase.from('operations').insert([operationWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation added to Supabase:', data)

      // If Supabase insert was successful, also update local Excel file
      try {
        // Read existing operations
        let operations: Array<{ id: string; [key: string]: unknown }> = []
        if (fs.existsSync(operationsFilePath)) {
          const workbook = XLSX.readFile(operationsFilePath)
          const sheetName = workbook.SheetNames[0]
          const worksheet = workbook.Sheets[sheetName]
          operations = XLSX.utils.sheet_to_json(worksheet)
        }

        // Add the new operation
        operations.push(operationWithId)

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(operations)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
        XLSX.writeFile(newWorkbook, operationsFilePath)

        console.log('Operation also added to Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return Supabase data even if Excel update fails
        return data[0]
      }

      return data[0]
    } catch (supabaseError) {
      console.error('Error adding operation to Supabase:', supabaseError)
      // Fall back to Excel-only operation if Supabase fails
    }

    // Fallback to Excel-only add
    // Read existing operations
    let operations: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(operationsFilePath)) {
      const workbook = XLSX.readFile(operationsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      operations = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add the new operation
    operations.push(operationWithId)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(operations)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
    XLSX.writeFile(newWorkbook, operationsFilePath)

    console.log('Operation added to Excel file only (Supabase failed)')
    return operationWithId
  } catch (error) {
    console.error('Error adding operation:', error)
    throw error
  }
})

// Update an existing operation
ipcMain.handle('updateOperation', async (_, id, updatedOperation) => {
  try {
    // Update operation in Supabase first
    try {
      const { data, error } = await supabase
        .from('operations')
        .update({ ...updatedOperation })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation updated in Supabase:', data)

      // If Supabase update was successful, also update local Excel file
      try {
        // Read existing operations
        if (!fs.existsSync(operationsFilePath)) {
          // Return Supabase data if Excel file doesn't exist
          return data[0]
        }

        const workbook = XLSX.readFile(operationsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const operations: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
          worksheet
        ) as Array<{ id: string; [key: string]: unknown }>

        // Find and update the operation
        const operationIndex = operations.findIndex((op) => op.id === id)

        if (operationIndex === -1) {
          // If operation not found in Excel, return Supabase data
          return data[0]
        }

        operations[operationIndex] = { ...updatedOperation, id }

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(operations)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
        XLSX.writeFile(newWorkbook, operationsFilePath)

        console.log('Operation also updated in Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return Supabase data even if Excel update fails
        return data[0]
      }

      return data[0]
    } catch (supabaseError) {
      console.error('Error updating operation in Supabase:', supabaseError)
      // Fall back to Excel-only update if Supabase fails
    }

    // Fallback to Excel-only update
    // Read existing operations
    if (!fs.existsSync(operationsFilePath)) {
      throw new Error('Operations file does not exist')
    }

    const workbook = XLSX.readFile(operationsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const operations: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find and update the operation
    const operationIndex = operations.findIndex((op) => op.id === id)

    if (operationIndex === -1) {
      throw new Error('Operation not found')
    }

    operations[operationIndex] = { ...updatedOperation, id }

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(operations)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
    XLSX.writeFile(newWorkbook, operationsFilePath)

    console.log('Operation updated in Excel file only (Supabase failed)')
    return operations[operationIndex]
  } catch (error) {
    console.error('Error updating operation:', error)
    throw error
  }
})

// Delete an operation
ipcMain.handle('deleteOperation', async (_, id) => {
  try {
    // Delete from Supabase first
    try {
      const { error } = await supabase.from('operations').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Operation deleted from Supabase')

      // Also delete from local Excel file
      try {
        // Read existing operations
        if (!fs.existsSync(operationsFilePath)) {
          return { success: true } // Return success if Excel file doesn't exist
        }

        const workbook = XLSX.readFile(operationsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        let operations: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
          worksheet
        ) as Array<{ id: string; [key: string]: unknown }>

        // Find the operation to delete
        const operationIndex = operations.findIndex((op) => op.id === id)

        if (operationIndex === -1) {
          // If operation not found in Excel, still return success
          return { success: true }
        }

        // Remove the operation
        operations = operations.filter((op) => op.id !== id)

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(operations)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
        XLSX.writeFile(newWorkbook, operationsFilePath)

        console.log('Operation also deleted from Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return success even if Excel update fails
        return { success: true }
      }

      return { success: true }
    } catch (supabaseError) {
      console.error('Error deleting operation from Supabase:', supabaseError)
      // Fall back to Excel-only delete if Supabase fails
    }

    // Fallback to Excel-only delete
    // Read existing operations
    if (!fs.existsSync(operationsFilePath)) {
      throw new Error('Operations file does not exist')
    }

    const workbook = XLSX.readFile(operationsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    let operations: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find the operation to delete
    const operationIndex = operations.findIndex((op) => op.id === id)

    if (operationIndex === -1) {
      throw new Error('Operation not found')
    }

    // Remove the operation
    operations = operations.filter((op) => op.id !== id)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(operations)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Operations')
    XLSX.writeFile(newWorkbook, operationsFilePath)

    console.log('Operation deleted from Excel file only (Supabase failed)')
    return { success: true }
  } catch (error) {
    console.error('Error deleting operation:', error)
    throw error
  }
})

// ==================== MEDICINES MANAGEMENT ====================

// Get all medicines
ipcMain.handle('getMedicines', async () => {
  try {
    if (!fs.existsSync(medicinesFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting medicines:', error)
    return []
  }
})

// Search medicines by name
ipcMain.handle('searchMedicines', async (_, searchTerm) => {
  try {
    if (!fs.existsSync(medicinesFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{ id: string; name: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter medicines based on search term
    if (!searchTerm || searchTerm.trim() === '') {
      return medicines
    }

    const searchTermLower = searchTerm.toLowerCase()
    return medicines.filter(
      (m) => m.name && m.name.toString().toLowerCase().includes(searchTermLower)
    )
  } catch (error) {
    console.error('Error searching medicines:', error)
    return []
  }
})

// Add a new medicine
ipcMain.handle('addMedicine', async (_, medicine) => {
  try {
    // Generate a unique ID for the medicine
    const medicineWithId = { ...medicine, id: uuidv4() }

    // Read existing medicines
    let medicines: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(medicinesFilePath)) {
      const workbook = XLSX.readFile(medicinesFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      medicines = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add the new medicine
    medicines.push(medicineWithId)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(medicines)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
    XLSX.writeFile(newWorkbook, medicinesFilePath)

    return medicineWithId
  } catch (error) {
    console.error('Error adding medicine:', error)
    throw error
  }
})

// Update an existing medicine
ipcMain.handle('updateMedicine', async (_, id, updatedMedicine) => {
  try {
    // Read existing medicines
    if (!fs.existsSync(medicinesFilePath)) {
      throw new Error('Medicines file does not exist')
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find and update the medicine
    const medicineIndex = medicines.findIndex((m) => m.id === id)

    if (medicineIndex === -1) {
      throw new Error('Medicine not found')
    }

    medicines[medicineIndex] = { ...updatedMedicine, id }

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(medicines)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
    XLSX.writeFile(newWorkbook, medicinesFilePath)

    return medicines[medicineIndex]
  } catch (error) {
    console.error('Error updating medicine:', error)
    throw error
  }
})

// Delete a medicine
ipcMain.handle('deleteMedicine', async (_, id) => {
  try {
    // Read existing medicines
    if (!fs.existsSync(medicinesFilePath)) {
      throw new Error('Medicines file does not exist')
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Filter out the medicine to delete
    const updatedMedicines = medicines.filter((m) => m.id !== id)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(updatedMedicines)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
    XLSX.writeFile(newWorkbook, medicinesFilePath)

    return true
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return false
  }
})

// Update medicine status
ipcMain.handle('updateMedicineStatus', async (_, id, status) => {
  try {
    // Read existing medicines
    if (!fs.existsSync(medicinesFilePath)) {
      throw new Error('Medicines file does not exist')
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{ id: string; status: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Find and update the medicine status
    const medicineIndex = medicines.findIndex((m) => m.id === id)

    if (medicineIndex === -1) {
      throw new Error('Medicine not found')
    }

    medicines[medicineIndex].status = status

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(medicines)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
    XLSX.writeFile(newWorkbook, medicinesFilePath)

    return medicines[medicineIndex]
  } catch (error) {
    console.error('Error updating medicine status:', error)
    throw error
  }
})

// Get medicines by status
ipcMain.handle('getMedicinesByStatus', async (_, status) => {
  try {
    if (!fs.existsSync(medicinesFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{ status: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter medicines by status
    return medicines.filter((m) => m.status === status)
  } catch (error) {
    console.error('Error getting medicines by status:', error)
    return []
  }
})

// ==================== OPTICALS MANAGEMENT ====================

// Get all optical items
ipcMain.handle('getOpticalItems', async () => {
  try {
    if (!fs.existsSync(opticalsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting optical items:', error)
    return []
  }
})

// Search optical items
ipcMain.handle('searchOpticalItems', async (_, searchTerm, type) => {
  try {
    if (!fs.existsSync(opticalsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{
      id: string
      type: string
      brand: string
      model?: string
      [key: string]: unknown
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Filter by type if provided
    let filteredItems = opticalItems
    if (type) {
      filteredItems = opticalItems.filter((item) => item.type === type)
    }

    // Filter by search term if provided
    if (!searchTerm || searchTerm.trim() === '') {
      return filteredItems
    }

    const searchTermLower = searchTerm.toLowerCase()
    return filteredItems.filter(
      (item) =>
        (item.brand && item.brand.toString().toLowerCase().includes(searchTermLower)) ||
        (item.model && item.model.toString().toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching optical items:', error)
    return []
  }
})

// Add a new optical item
ipcMain.handle('addOpticalItem', async (_, item) => {
  try {
    // Generate a unique ID for the optical item
    const itemWithId = { ...item, id: uuidv4() }

    // Read existing optical items
    let opticalItems: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(opticalsFilePath)) {
      const workbook = XLSX.readFile(opticalsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      opticalItems = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add the new optical item
    opticalItems.push(itemWithId)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(opticalItems)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Opticals')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    return itemWithId
  } catch (error) {
    console.error('Error adding optical item:', error)
    throw error
  }
})

// Update an existing optical item
ipcMain.handle('updateOpticalItem', async (_, id, updatedItem) => {
  try {
    // Read existing optical items
    if (!fs.existsSync(opticalsFilePath)) {
      throw new Error('Opticals file does not exist')
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Find and update the optical item
    const itemIndex = opticalItems.findIndex((item) => item.id === id)

    if (itemIndex === -1) {
      throw new Error('Optical item not found')
    }

    opticalItems[itemIndex] = { ...updatedItem, id }

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(opticalItems)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Opticals')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    return opticalItems[itemIndex]
  } catch (error) {
    console.error('Error updating optical item:', error)
    throw error
  }
})

// Delete an optical item
ipcMain.handle('deleteOpticalItem', async (_, id) => {
  try {
    // Read existing optical items
    if (!fs.existsSync(opticalsFilePath)) {
      throw new Error('Opticals file does not exist')
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
      worksheet
    ) as Array<{ id: string; [key: string]: unknown }>

    // Filter out the optical item to delete
    const updatedItems = opticalItems.filter((item) => item.id !== id)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(updatedItems)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Opticals')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    return true
  } catch (error) {
    console.error('Error deleting optical item:', error)
    return false
  }
})

// Update optical item status
ipcMain.handle('updateOpticalItemStatus', async (_, id, status) => {
  try {
    // Read existing optical items
    if (!fs.existsSync(opticalsFilePath)) {
      throw new Error('Opticals file does not exist')
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{ id: string; status: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Find and update the optical item status
    const itemIndex = opticalItems.findIndex((item) => item.id === id)

    if (itemIndex === -1) {
      throw new Error('Optical item not found')
    }

    opticalItems[itemIndex].status = status

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(opticalItems)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Opticals')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    return opticalItems[itemIndex]
  } catch (error) {
    console.error('Error updating optical item status:', error)
    throw error
  }
})

// Get optical items by status
ipcMain.handle('getOpticalItemsByStatus', async (_, status, type) => {
  try {
    if (!fs.existsSync(opticalsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{
      type: string
      brand: string
      model: string
      size: string
      power: string
      quantity: number
      price: number
      status: string
      id: string
      [key: string]: unknown
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Filter by status
    let filteredItems = opticalItems.filter((item) => item.status === status)

    // Further filter by type if provided
    if (type) {
      filteredItems = filteredItems.filter((item) => item.type === type)
    }

    return filteredItems
  } catch (error) {
    console.error('Error getting optical items by status:', error)
    return []
  }
})

// Get optical items by type
ipcMain.handle('getOpticalItemsByType', async (_, type) => {
  try {
    if (!fs.existsSync(opticalsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{ type: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter by type
    return opticalItems.filter((item) => item.type === type)
  } catch (error) {
    console.error('Error getting optical items by type:', error)
    return []
  }
})

// ==================== MEDICINE DISPENSING ====================

// Path to the medicine dispensing records Excel file
const medicineDispenseFilePath = join(appDataPath, 'medicine_dispense_records.xlsx')

// Initialize medicine dispensing records Excel file if it doesn't exist
if (!fs.existsSync(medicineDispenseFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'MedicineDispenseRecords')
  XLSX.writeFile(workbook, medicineDispenseFilePath)
  hideFile(medicineDispenseFilePath)
}

// Dispense medicine
ipcMain.handle('dispenseMedicine', async (_, id, quantity, patientName, patientId) => {
  try {
    // Read existing medicines
    if (!fs.existsSync(medicinesFilePath)) {
      throw new Error('Medicines file does not exist')
    }

    const workbook = XLSX.readFile(medicinesFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const medicines: Array<{
      id: string
      name: string
      quantity: number
      batchNumber: string
      [key: string]: unknown
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Find the medicine to dispense
    const medicineIndex = medicines.findIndex((m) => m.id === id)

    if (medicineIndex === -1) {
      throw new Error('Medicine not found')
    }

    const medicine = medicines[medicineIndex]

    // Check if there's enough quantity
    if (medicine.quantity < quantity) {
      throw new Error('Not enough medicine in stock')
    }

    // Update the medicine quantity
    medicines[medicineIndex].quantity = medicine.quantity - quantity

    // Update medicine status if needed
    if (medicines[medicineIndex].quantity === 0) {
      medicines[medicineIndex].status = 'out_of_stock'
    }

    // Write updated medicines back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(medicines)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
    XLSX.writeFile(newWorkbook, medicinesFilePath)

    // Create a dispense record
    const dispenseRecord = {
      id: uuidv4(),
      medicineId: id,
      medicineName: medicine.name,
      batchNumber: medicine.batchNumber,
      quantity: quantity,
      dispensedDate: new Date().toISOString(),
      patientName: patientName,
      patientId: patientId || ''
    }

    // Read existing dispense records
    let dispenseRecords: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(medicineDispenseFilePath)) {
      const dispenseWorkbook = XLSX.readFile(medicineDispenseFilePath)
      const dispenseSheetName = dispenseWorkbook.SheetNames[0]
      const dispenseWorksheet = dispenseWorkbook.Sheets[dispenseSheetName]
      dispenseRecords = XLSX.utils.sheet_to_json(dispenseWorksheet)
    }

    // Add the new dispense record
    dispenseRecords.push(dispenseRecord)

    // Write back to Excel file
    const dispenseWorkbook = XLSX.utils.book_new()
    const dispenseWorksheet = XLSX.utils.json_to_sheet(dispenseRecords)
    XLSX.utils.book_append_sheet(dispenseWorkbook, dispenseWorksheet, 'MedicineDispenseRecords')
    XLSX.writeFile(dispenseWorkbook, medicineDispenseFilePath)

    return medicines[medicineIndex]
  } catch (error) {
    console.error('Error dispensing medicine:', error)
    throw error
  }
})

// Get medicine dispense records
ipcMain.handle('getMedicineDispenseRecords', async () => {
  try {
    if (!fs.existsSync(medicineDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicineDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting medicine dispense records:', error)
    return []
  }
})

// Get medicine dispense records by patient ID
ipcMain.handle('getMedicineDispenseRecordsByPatient', async (_, patientId) => {
  try {
    if (!fs.existsSync(medicineDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicineDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records: Array<{ patientId: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter records by patient ID
    return records.filter((record) => record.patientId === patientId)
  } catch (error) {
    console.error('Error getting medicine dispense records by patient:', error)
    return []
  }
})

// Get medicine dispense records by medicine ID
ipcMain.handle('getMedicineDispenseRecordsByMedicine', async (_, medicineId) => {
  try {
    if (!fs.existsSync(medicineDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(medicineDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records: Array<{ medicineId: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter records by medicine ID
    return records.filter((record) => record.medicineId === medicineId)
  } catch (error) {
    console.error('Error getting medicine dispense records by medicine:', error)
    return []
  }
})

// ==================== OPTICAL DISPENSING ====================

// Path to the optical dispensing records Excel file
const opticalDispenseFilePath = join(appDataPath, 'optical_dispense_records.xlsx')

// Initialize optical dispensing records Excel file if it doesn't exist
if (!fs.existsSync(opticalDispenseFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'OpticalDispenseRecords')
  XLSX.writeFile(workbook, opticalDispenseFilePath)
  hideFile(opticalDispenseFilePath)
}

// Dispense optical item
ipcMain.handle('dispenseOptical', async (_, id, quantity, patientName, patientId) => {
  try {
    // Read existing optical items
    if (!fs.existsSync(opticalsFilePath)) {
      throw new Error('Opticals file does not exist')
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const opticalItems: Array<{
      id: string
      type: string
      brand: string
      model?: string
      size?: string
      power?: string
      quantity: number
      price: number
      status: string
      [key: string]: unknown
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Find the optical item to dispense
    const itemIndex = opticalItems.findIndex((item) => item.id === id)

    if (itemIndex === -1) {
      throw new Error('Optical item not found')
    }

    const opticalItem = opticalItems[itemIndex]

    // Check if the item is available
    if (opticalItem.status !== 'available') {
      throw new Error('Optical item is not available')
    }

    // Check if there's enough quantity
    if ((opticalItem.quantity as number) < quantity) {
      throw new Error(`Only ${opticalItem.quantity} units available`)
    }

    // Update the optical item quantity and status
    opticalItems[itemIndex].quantity = (opticalItems[itemIndex].quantity as number) - quantity

    // If quantity becomes 0, mark as out of stock
    if ((opticalItems[itemIndex].quantity as number) <= 0) {
      opticalItems[itemIndex].status = 'out_of_stock'
    }

    // Write updated optical items back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(opticalItems)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Opticals')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    // Create a dispense record
    const dispenseRecord = {
      id: uuidv4(),
      opticalId: id,
      opticalType: opticalItem.type,
      brand: opticalItem.brand,
      model: opticalItem.model || '',
      quantity: quantity,
      price: opticalItem.price || 0,
      patientName: patientName,
      patientId: patientId || '',
      dispensedAt: new Date().toISOString()
    }

    // Read existing dispense records
    let dispenseRecords: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(opticalDispenseFilePath)) {
      const dispenseWorkbook = XLSX.readFile(opticalDispenseFilePath)
      const dispenseSheetName = dispenseWorkbook.SheetNames[0]
      const dispenseWorksheet = dispenseWorkbook.Sheets[dispenseSheetName]
      dispenseRecords = XLSX.utils.sheet_to_json(dispenseWorksheet)
    }

    // Add the new dispense record
    dispenseRecords.push(dispenseRecord)

    // Write back to Excel file
    const dispenseWorkbook = XLSX.utils.book_new()
    const dispenseWorksheet = XLSX.utils.json_to_sheet(dispenseRecords)
    XLSX.utils.book_append_sheet(dispenseWorkbook, dispenseWorksheet, 'OpticalDispenseRecords')
    XLSX.writeFile(dispenseWorkbook, opticalDispenseFilePath)

    return opticalItems[itemIndex]
  } catch (error) {
    console.error('Error dispensing optical item:', error)
    throw error
  }
})

// Get optical dispense records
ipcMain.handle('getOpticalDispenseRecords', async () => {
  try {
    if (!fs.existsSync(opticalDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting optical dispense records:', error)
    return []
  }
})

// Get optical dispense records by patient ID
ipcMain.handle('getOpticalDispenseRecordsByPatient', async (_, patientId) => {
  try {
    if (!fs.existsSync(opticalDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records: Array<{ patientId: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter records by patient ID
    return records.filter((record) => record.patientId === patientId)
  } catch (error) {
    console.error('Error getting optical dispense records by patient:', error)
    return []
  }
})

// Get optical dispense records by type
ipcMain.handle('getOpticalDispenseRecordsByType', async (_, type) => {
  try {
    if (!fs.existsSync(opticalDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records: Array<{ opticalType: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter records by optical type
    return records.filter((record) => record.opticalType === type)
  } catch (error) {
    console.error('Error getting optical dispense records by type:', error)
    return []
  }
})

// Get optical dispense records by optical ID
ipcMain.handle('getOpticalDispenseRecordsByOptical', async (_, opticalId) => {
  try {
    if (!fs.existsSync(opticalDispenseFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const records: Array<{ opticalId: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

    // Filter records by optical ID
    return records.filter((record) => record.opticalId === opticalId)
  } catch (error) {
    console.error('Error getting optical dispense records by optical ID:', error)
    return []
  }
})

// ==================== ANALYTICS MODULE ====================

// Define interfaces for analytics data
interface ConditionStat {
  name: string
  count: number
  quantity?: number
}

interface PeakHourStat {
  hour: number
  count: number
}

interface TimeSeriesData {
  labels: string[]
  patients: number[]
  revenue: number[]
  medicines: number[]
  opticals: number[]
}

interface AnalyticsData {
  patientStats: {
    total: number
    new: number
    returning: number
    gender: { male: number; female: number; other: number }
    ageGroups: { [key: string]: number }
    conditions: ConditionStat[]
  }
  revenueStats: {
    total: number
    consultations: number
    medicines: number
    opticals: number
    operations: number
    pending: number
  }
  medicineStats: {
    totalDispensed: number
    topMedicines: ConditionStat[]
    outOfStock: number
    lowStock: number
    revenue: number
  }
  opticalStats: {
    totalDispensed: number
    frames: number
    lenses: number
    revenue: number
    topBrands: ConditionStat[]
  }
  eyeConditionStats: {
    conditions: ConditionStat[]
    treatmentSuccess: number
  }
  patientTreatmentStats: {
    completedTreatments: number
    ongoingTreatments: number
    followUps: number
    peakHours: PeakHourStat[]
  }
  timeSeriesData: TimeSeriesData
}

// Helper function to generate analytics data
async function generateAnalyticsData(
  startDate: string | Date,
  endDate: string | Date
): Promise<AnalyticsData | null> {
  try {
    const start = startDate instanceof Date ? startDate : new Date(startDate)
    const end = endDate instanceof Date ? endDate : new Date(endDate)

    // Initialize analytics data structure to match OverviewDashboard component expectations
    const analyticsData = {
      patientStats: {
        total: 0,
        new: 0,
        returning: 0,
        gender: { male: 0, female: 0, other: 0 },
        ageGroups: { 'under 18': 0, '18 to 30': 0, '31 to 45': 0, '46 to 60': 0, 'above 60': 0 },
        conditions: [] as ConditionStat[],
        // Required by OverviewDashboard
        followUp: 0,
        average: 0,
        change: 0,
        averageChange: 0
      },
      revenueStats: {
        total: 0,
        consultations: 0,
        medicines: 0,
        opticals: 0,
        operations: 0,
        pending: 0,
        // Required by OverviewDashboard
        change: 0
      },
      medicineStats: {
        totalDispensed: 0,
        topMedicines: [] as ConditionStat[],
        outOfStock: 0,
        lowStock: 0, // Keep as number to match existing interface
        revenue: 0,
        // Required by OverviewDashboard
        dispensed: 0,
        topItems: [] as Array<{
          name: string
          quantity: number
          revenue: number
          percentage: number
        }>
      },
      opticalStats: {
        totalDispensed: 0,
        frames: 0,
        lenses: 0,
        revenue: 0,
        topBrands: [] as ConditionStat[],
        // Required by OverviewDashboard
        sold: 0,
        topItems: [] as Array<{
          name: string
          quantity: number
          revenue: number
          percentage: number
          type: string
        }>
      },
      eyeConditionStats: {
        conditions: [] as Array<{ name: string; count: number }>,
        treatmentSuccess: 0
      },
      patientTreatmentStats: {
        completedTreatments: 0,
        ongoingTreatments: 0,
        followUps: 0,
        peakHours: [] as PeakHourStat[],
        // Required by OverviewDashboard
        labels: [] as string[],
        inflow: [] as number[],
        treatments: [] as number[],
        operations: 0
      },
      // Required by OverviewDashboard
      receiptStats: {
        total: 0,
        change: 0,
        prescriptions: 0,
        pending: 0,
        completed: 0
      },
      timeSeriesData: {
        labels: [] as string[],
        patients: [] as number[],
        revenue: [] as number[],
        medicines: [] as number[],
        opticals: [] as number[]
      } as TimeSeriesData
    }

    // Get patients data
    if (fs.existsSync(patientsFilePath)) {
      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      // Field names from Excel: date, patientId, name, guardian, dob, age, gender, phone, address, id
      const patients: Array<{
        id: string
        date: string
        gender: string
        dob: string
        name: string
        patientId: string
        age: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      // Filter patients by date range
      const filteredPatients = patients.filter((patient) => {
        const patientDate = new Date(patient.date)
        return patientDate >= start && patientDate <= end
      })

      // Calculate patient statistics
      analyticsData.patientStats.total = filteredPatients.length

      // Count new vs returning patients (simplified logic - could be enhanced)
      const patientVisitCounts = new Map<string, number>()
      filteredPatients.forEach((patient) => {
        const count = patientVisitCounts.get(patient.id) || 0
        patientVisitCounts.set(patient.id, count + 1)
      })

      analyticsData.patientStats.new = Array.from(patientVisitCounts.values()).filter(
        (count) => count === 1
      ).length
      analyticsData.patientStats.returning =
        analyticsData.patientStats.total - analyticsData.patientStats.new

      // Calculate followUp, average, and change metrics required by OverviewDashboard
      analyticsData.patientStats.followUp = Math.round(analyticsData.patientStats.returning / 100) // Estimate 70% of returning patients are follow-ups

      // Calculate average patients per day
      const daysDifference = Math.max(
        1,
        Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
      )
      analyticsData.patientStats.average = Math.round(
        analyticsData.patientStats.total / daysDifference
      )

      // Calculate change metrics (simulated for now - would need historical data)
      analyticsData.patientStats.change = Math.round(analyticsData.patientStats.total * 0.1) // Assume 10% growth
      analyticsData.patientStats.averageChange = Math.round(
        analyticsData.patientStats.average * 0.05
      ) // Assume 5% growth in average

      // Gender distribution
      filteredPatients.forEach((patient) => {
        if (patient.gender) {
          const gender = patient.gender.toString().toLowerCase()
          if (gender === 'male') analyticsData.patientStats.gender.male++
          else if (gender === 'female') analyticsData.patientStats.gender.female++
          else analyticsData.patientStats.gender.other++
        }
      })

      // Age groups
      filteredPatients.forEach((patient) => {
        if (patient.dob) {
          const birthDate = new Date(patient.dob)
          const age = new Date().getFullYear() - birthDate.getFullYear()

          if (age < 18) analyticsData.patientStats.ageGroups['under 18']++
          else if (age <= 30) analyticsData.patientStats.ageGroups['18 to 30']++
          else if (age <= 45) analyticsData.patientStats.ageGroups['31 to 45']++
          else if (age <= 60) analyticsData.patientStats.ageGroups['46 to 60']++
          else analyticsData.patientStats.ageGroups['above 60']++
        }
      })
    }

    // Get prescriptions data for revenue and conditions
    if (fs.existsSync(prescriptionsFilePath)) {
      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      // Field names from Excel: Sno, DATE, RECEIPT NO, PATIENT ID, PATIENT NAME, etc.
      const prescriptions: Array<{
        DATE: string
        'RECEIPT NO': string
        'PATIENT ID': string
        'PATIENT NAME': string
        'AMOUNT RECEIVED': number
        'PAID FOR': string
        'TOTAL AMOUNT': number
        'AMOUNT DUE': number
        'PRESENT COMPLAIN': string
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      // Filter prescriptions by date range
      const filteredPrescriptions = prescriptions.filter((prescription) => {
        if (!prescription.DATE) return false
        const prescriptionDate = new Date(prescription.DATE.toString())
        return prescriptionDate >= start && prescriptionDate <= end
      })

      analyticsData.receiptStats.total = filteredPrescriptions.length
      analyticsData.receiptStats.completed = filteredPrescriptions.filter((prescription) => {
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        return dueamount === 0
      }).length
      analyticsData.receiptStats.pending = filteredPrescriptions.filter((prescription) => {
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        return dueamount > 0
      }).length
      analyticsData.receiptStats.prescriptions = filteredPrescriptions.length
      analyticsData.receiptStats.change =
        analyticsData.receiptStats.completed - analyticsData.receiptStats.pending

      // Calculate revenue statistics
      filteredPrescriptions.forEach((prescription) => {
        const amount = Number(prescription['AMOUNT RECEIVED']) || 0
        const dueamount = Number(prescription['AMOUNT DUE']) || 0
        analyticsData.revenueStats.total += amount
        if (prescription['PAID FOR']?.toLowerCase() === 'consultation') {
          analyticsData.revenueStats.consultations += amount
        }

        // Check payment status for pending amount
        if (dueamount > 0) {
          analyticsData.revenueStats.pending += dueamount
        }

        // Collect eye conditions
        if (prescription['PRESENT COMPLAIN']) {
          const diagnosis = prescription['PRESENT COMPLAIN'].toString()
          const existingCondition = analyticsData.patientStats.conditions.find(
            (c) => c.name === diagnosis
          )

          if (existingCondition) {
            existingCondition.count++
          } else {
            analyticsData.patientStats.conditions.push({ name: diagnosis, count: 1 })
          }

          // Also add to eye condition stats
          const existingEyeCondition = analyticsData.eyeConditionStats.conditions.find(
            (c) => c.name === diagnosis
          )
          if (existingEyeCondition) {
            existingEyeCondition.count++
          } else {
            analyticsData.eyeConditionStats.conditions.push({ name: diagnosis, count: 1 })
          }
        }
      })

      // Sort conditions by count
      analyticsData.patientStats.conditions.sort((a, b) => b.count - a.count)
      analyticsData.eyeConditionStats.conditions.sort((a, b) => b.count - a.count)

      // Limit to top 5 conditions
      analyticsData.patientStats.conditions = analyticsData.patientStats.conditions.slice(0, 5)
      analyticsData.eyeConditionStats.conditions = analyticsData.eyeConditionStats.conditions.slice(
        0,
        5
      )
    }

    // Get medicine dispense records
    if (fs.existsSync(medicineDispenseFilePath)) {
      const workbook = XLSX.readFile(medicineDispenseFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const dispenseRecords: Array<{
        dispensedDate: string
        medicineName: string
        quantity: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      //get medicine records
      const workbook2 = XLSX.readFile(medicinesFilePath)
      const sheetName2 = workbook2.SheetNames[0]
      const worksheet2 = workbook2.Sheets[sheetName2]
      const medicineRecords: Array<{ name: string; price: number; [key: string]: unknown }> =
        XLSX.utils.sheet_to_json(worksheet2)

      // Format dates to DD/MM/YYYY
      const formattedRecords = dispenseRecords.map((record) => ({
        ...record,
        dispensedDate: new Date(record.dispensedDate).toISOString().split('T')[0] // For format: DD/MM/YYYY
      }))

      // Filter records by date range
      const filteredRecords = formattedRecords.filter((record) => {
        const recordDate = new Date(record.dispensedDate)
        return recordDate >= start && recordDate <= end
      })

      // Calculate medicine statistics
      analyticsData.medicineStats.totalDispensed = filteredRecords.reduce(
        (total, record) => total + (Number(record.quantity) || 0),
        0
      )

      //calculate revenue from medicines
      filteredRecords.forEach((record) => {
        const medicine = medicineRecords.find((m) => m.name === record.medicineName)
        if (medicine) {
          analyticsData.medicineStats.revenue += medicine.price * Number(record.quantity)
          analyticsData.revenueStats.medicines += medicine.price * Number(record.quantity)
          analyticsData.revenueStats.total += medicine.price * Number(record.quantity)
        }
      })

      // Get top medicines
      const medicineMap = new Map<string, number>()
      filteredRecords.forEach((record) => {
        if (record.medicineName) {
          const name = record.medicineName.toString()
          const count = medicineMap.get(name) || 0
          medicineMap.set(name, count + (Number(record.quantity) || 0))
        }
      })

      analyticsData.medicineStats.topMedicines = Array.from(medicineMap.entries())
        .map(([name, count]) => ({
          name,
          count
        }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Get current medicine stock status
      if (fs.existsSync(medicinesFilePath)) {
        // Field names from Excel: name, quantity, expiryDate, batchNumber, price, status, id
        const medicineWorkbook = XLSX.readFile(medicinesFilePath)
        const medicineSheetName = medicineWorkbook.SheetNames[0]
        const medicineWorksheet = medicineWorkbook.Sheets[medicineSheetName]
        const medicines: Array<{
          name: string
          quantity: number
          expiryDate: string
          batchNumber: string
          price: number
          status: string
          id: string
          [key: string]: unknown
        }> = XLSX.utils.sheet_to_json(medicineWorksheet)

        // Update medicine stats based on Excel data
        analyticsData.medicineStats.outOfStock = medicines.filter(
          (m) => m.status === 'out_of_stock'
        ).length
        analyticsData.medicineStats.lowStock = medicines.filter(
          (m) => m.quantity && Number(m.quantity) < 10 && m.status !== 'out_of_stock'
        ).length

        // Update dispensed count for OverviewDashboard
        analyticsData.medicineStats.dispensed = analyticsData.medicineStats.totalDispensed

        // Create topItems for OverviewDashboard
        analyticsData.medicineStats.topItems = analyticsData.medicineStats.topMedicines.map(
          (medicine) => ({
            name: medicine.name,
            quantity: medicine.quantity || 0,
            revenue: Math.round(
              (medicine.quantity || 0) *
                (medicines.find((m) => m.name === medicine.name)?.price || 100)
            ),
            percentage: Math.round(
              ((medicine.quantity || 0) / (analyticsData.medicineStats.totalDispensed || 1)) * 100
            )
          })
        )
      }
    }

    // Get optical dispense records
    if (fs.existsSync(opticalDispenseFilePath)) {
      const workbook = XLSX.readFile(opticalDispenseFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const dispenseRecords: Array<{
        dispensedAt: string
        opticalType: string
        brand: string
        quantity: number
        price: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      //formated records
      const formattedRecords = dispenseRecords.map((record) => ({
        ...record,
        dispensedAt: new Date(record.dispensedAt).toISOString().split('T')[0]
      }))

      // Filter records by date range
      const filteredRecords = formattedRecords.filter((record) => {
        const recordDate = new Date(record.dispensedAt)
        return recordDate >= start && recordDate <= end
      })

      // Calculate optical statistics
      analyticsData.opticalStats.totalDispensed = filteredRecords.reduce(
        (total, record) => total + (Number(record.quantity) || 0),
        0
      )
      analyticsData.opticalStats.sold = analyticsData.opticalStats.totalDispensed

      // Count frames vs lenses
      filteredRecords.forEach((record) => {
        if (record.opticalType === 'frame') {
          analyticsData.opticalStats.frames += Number(record.quantity) || 0
        } else if (record.opticalType === 'lens') {
          analyticsData.opticalStats.lenses += Number(record.quantity) || 0
        }
      })

      // Calculate revenue from opticals
      analyticsData.revenueStats.opticals = filteredRecords.reduce(
        (total, record) => total + (Number(record.price) || 0) * (Number(record.quantity) || 0),
        0
      )
      analyticsData.opticalStats.revenue = analyticsData.revenueStats.opticals
      analyticsData.revenueStats.total += analyticsData.revenueStats.opticals

      // Get top brands
      const brandMap = new Map<string, number>()
      filteredRecords.forEach((record) => {
        if (record.brand) {
          const brand = record.brand.toString()
          const count = brandMap.get(brand) || 0
          brandMap.set(brand, count + (Number(record.quantity) || 0))
        }
      })

      // Create top brands for optical stats
      analyticsData.opticalStats.topBrands = Array.from(brandMap.entries())
        .map(([name, count]) => ({ name, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)
    }

    // Get operations data
    if (fs.existsSync(operationsFilePath)) {
      const workbook = XLSX.readFile(operationsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      // Field names from Excel: patientId, patientName, dateOfAdmit, timeOfAdmit, dateOfOperation, timeOfOperation,
      // dateOfDischarge, timeOfDischarge, operationDetails, operationProcedure, provisionDiagnosis, reviewOn, operatedBy, id
      const operations: Array<{
        patientId: string
        patientName: string
        dateOfAdmit: string
        timeOfAdmit: string
        dateOfOperation: string
        timeOfOperation: string
        dateOfDischarge: string
        timeOfDischarge: string
        operationDetails: string
        operationProcedure: string
        provisionDiagnosis: string
        reviewOn: string
        operatedBy: string
        totalAmount: number
        id: string
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      // Filter operations by date range
      const filteredOperations = operations.filter((operation) => {
        if (!operation.dateOfAdmit) return false
        const operationDate = new Date(operation.dateOfAdmit.toString())
        return operationDate >= start && operationDate <= end
      })
      const today = new Date().toLocaleDateString()
      // Calculate revenue from operations (estimated)
      analyticsData.revenueStats.operations = filteredOperations.reduce(
        (total, operation) => total + (Number(operation.totalAmount) || 0),
        0
      )
      analyticsData.revenueStats.total += analyticsData.revenueStats.operations
      // Calculate treatment statistics
      analyticsData.patientTreatmentStats.completedTreatments = filteredOperations.length
      analyticsData.patientTreatmentStats.ongoingTreatments = Math.round(
        filteredOperations.filter((operations) => !operations.dateOfDischarge).length
      )
      analyticsData.patientTreatmentStats.followUps = Math.round(
        filteredOperations.filter((operations) => operations.reviewOn > today).length
      )

      // Calculate peak hours (simulated data)
      const hourCounts = new Array(24).fill(0)
      filteredOperations.forEach(() => {
        // Simulate peak hours - more operations between 9 AM and 5 PM
        const hour = Math.floor(Math.random() * 8) + 9
        hourCounts[hour]++
      })

      analyticsData.patientTreatmentStats.peakHours = hourCounts
        .map((count, hour) => ({ hour, count }))
        .filter((item) => item.count > 0)
        .sort((a, b) => b.count - a.count)
        .slice(0, 5)

      // Calculate treatment success rate (simulated)
      analyticsData.eyeConditionStats.treatmentSuccess = Math.round(90 + Math.random() * 10) // 90-100%
    }

    // Generate time series data from actual records
    const timeSeriesData: TimeSeriesData = {
      labels: [],
      patients: [],
      revenue: [],
      medicines: [],
      opticals: []
    }

    // Generate dates between start and end
    const dateArray: Date[] = []
    const currentDate = new Date(start)
    while (currentDate <= end) {
      dateArray.push(new Date(currentDate))
      currentDate.setDate(currentDate.getDate() + 1)
    }

    // Prepare data maps for each date
    const patientCountByDate = new Map<string, number>()
    const revenueByDate = new Map<string, number>()
    const medicineDispenseByDate = new Map<string, number>()
    const opticalSalesByDate = new Map<string, number>()

    // Initialize maps with zero values for all dates
    dateArray.forEach((date) => {
      const dateString = date.toISOString().split('T')[0]
      patientCountByDate.set(dateString, 0)
      revenueByDate.set(dateString, 0)
      medicineDispenseByDate.set(dateString, 0)
      opticalSalesByDate.set(dateString, 0)
    })

    // Calculate patient counts by date
    if (fs.existsSync(patientsFilePath)) {
      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const patients: Array<{
        id: string
        date: string
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      patients.forEach((patient) => {
        if (patient.date) {
          const patientDate = new Date(patient.date)
          if (patientDate >= start && patientDate <= end) {
            const dateString = patientDate.toISOString().split('T')[0]
            const currentCount = patientCountByDate.get(dateString) || 0
            patientCountByDate.set(dateString, currentCount + 1)
          }
        }
      })
    }

    // Calculate revenue by date from prescriptions
    if (fs.existsSync(prescriptionsFilePath)) {
      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const prescriptions: Array<{
        DATE: string
        'AMOUNT RECEIVED': number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      prescriptions.forEach((prescription) => {
        if (prescription.DATE) {
          const prescriptionDate = new Date(prescription.DATE.toString())
          if (prescriptionDate >= start && prescriptionDate <= end) {
            const dateString = prescriptionDate.toISOString().split('T')[0]
            const amount = Number(prescription['AMOUNT RECEIVED']) || 0
            const currentRevenue = revenueByDate.get(dateString) || 0
            revenueByDate.set(dateString, currentRevenue + amount)
          }
        }
      })
    }

    // Calculate medicine dispense by date
    if (fs.existsSync(medicineDispenseFilePath)) {
      const workbook = XLSX.readFile(medicineDispenseFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const dispenseRecords: Array<{
        dispensedDate: string
        quantity: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      // Get medicine prices
      const medicineWorkbook = XLSX.readFile(medicinesFilePath)
      const medicineSheetName = medicineWorkbook.SheetNames[0]
      const medicineWorksheet = medicineWorkbook.Sheets[medicineSheetName]
      const medicines: Array<{
        name: string
        price: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(medicineWorksheet)

      dispenseRecords.forEach((record) => {
        if (record.dispensedDate) {
          const recordDate = new Date(record.dispensedDate)
          if (recordDate >= start && recordDate <= end) {
            const dateString = recordDate.toISOString().split('T')[0]
            // Update medicine dispense count
            const quantity = Number(record.quantity) || 0
            const currentDispense = medicineDispenseByDate.get(dateString) || 0
            medicineDispenseByDate.set(dateString, currentDispense + quantity)
            // Update revenue from medicine sales
            const medicineName = record.medicineName?.toString()
            const medicine = medicineName ? medicines.find((m) => m.name === medicineName) : null
            if (medicine) {
              const medicineRevenue = (medicine.price || 0) * quantity
              const currentRevenue = revenueByDate.get(dateString) || 0
              revenueByDate.set(dateString, currentRevenue + medicineRevenue)
            }
          }
        }
      })
    }

    // Calculate optical sales by date
    if (fs.existsSync(opticalDispenseFilePath)) {
      const workbook = XLSX.readFile(opticalDispenseFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const dispenseRecords: Array<{
        dispensedAt: string
        quantity: number
        price: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      dispenseRecords.forEach((record) => {
        if (record.dispensedAt) {
          const recordDate = new Date(record.dispensedAt)
          if (recordDate >= start && recordDate <= end) {
            const dateString = recordDate.toISOString().split('T')[0]
            // Update optical sales count
            const quantity = Number(record.quantity) || 0
            const currentSales = opticalSalesByDate.get(dateString) || 0
            opticalSalesByDate.set(dateString, currentSales + quantity)
            // Update revenue from optical sales
            const price = Number(record.price) || 0
            const opticalRevenue = price * quantity
            const currentRevenue = revenueByDate.get(dateString) || 0
            revenueByDate.set(dateString, currentRevenue + opticalRevenue)
          }
        }
      })
    }

    // Add operations revenue to the revenue by date
    if (fs.existsSync(operationsFilePath)) {
      const workbook = XLSX.readFile(operationsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const operations: Array<{
        dateOfAdmit: string
        totalAmount: number
        [key: string]: unknown
      }> = XLSX.utils.sheet_to_json(worksheet)

      operations.forEach((operation) => {
        if (operation.dateOfAdmit) {
          const operationDate = new Date(operation.dateOfAdmit.toString())
          if (operationDate >= start && operationDate <= end) {
            const dateString = operationDate.toISOString().split('T')[0]
            const amount = Number(operation.totalAmount) || 0
            const currentRevenue = revenueByDate.get(dateString) || 0
            revenueByDate.set(dateString, currentRevenue + amount)
          }
        }
      })
    }

    // Populate time series data from the maps
    dateArray.forEach((date) => {
      const dateString = date.toISOString().split('T')[0]
      timeSeriesData.labels.push(dateString)
      timeSeriesData.patients.push(patientCountByDate.get(dateString) || 0)
      timeSeriesData.revenue.push(revenueByDate.get(dateString) || 0)
      timeSeriesData.medicines.push(medicineDispenseByDate.get(dateString) || 0)
      timeSeriesData.opticals.push(opticalSalesByDate.get(dateString) || 0)
    })

    // Assign time series data to analytics data
    analyticsData.timeSeriesData = timeSeriesData

    return analyticsData
  } catch (error) {
    console.error('Error generating analytics data:', error)
    return null
  }
}

// Get analytics data for the dashboard
ipcMain.handle('getAnalyticsData', async (_, startDate, endDate) => {
  return await generateAnalyticsData(startDate, endDate)
})

ipcMain.handle(
  'exportAnalyticsData',
  async (_, section, startDate, endDate, _timeFilter, format) => {
    try {
      // Get analytics data by directly calling the generateAnalyticsData function
      const defaultStartDate = new Date(new Date().setDate(new Date().getDate() - 30))
        .toISOString()
        .split('T')[0]
      const defaultEndDate = new Date().toISOString().split('T')[0]

      const analyticsData = await generateAnalyticsData(
        startDate || defaultStartDate,
        endDate || defaultEndDate
      )

      if (!analyticsData) {
        throw new Error('Failed to get analytics data')
      }

      // Create export directory if it doesn't exist
      const exportPath = join(app.getPath('documents'), 'ShehExports')
      if (!fs.existsSync(exportPath)) {
        fs.mkdirSync(exportPath, { recursive: true })
      }

      // Generate filename
      const timestamp = new Date().toISOString().replace(/[:.]/g, '-')
      const filename = `analytics_${section}_${timestamp}`

      // Export based on format
      if (format === 'excel') {
        const workbook = XLSX.utils.book_new()

        // Create worksheet based on section
        let worksheet
        switch (section) {
          case 'overview':
            worksheet = XLSX.utils.json_to_sheet([
              { metric: 'Total Patients', value: analyticsData.patientStats.total },
              { metric: 'New Patients', value: analyticsData.patientStats.new },
              { metric: 'Returning Patients', value: analyticsData.patientStats.returning },
              { metric: 'Total Revenue', value: analyticsData.revenueStats.total },
              { metric: 'Pending Revenue', value: analyticsData.revenueStats.pending },
              { metric: 'Medicines Dispensed', value: analyticsData.medicineStats.totalDispensed },
              { metric: 'Opticals Dispensed', value: analyticsData.opticalStats.totalDispensed },
              {
                metric: 'Completed Treatments',
                value: analyticsData.patientTreatmentStats.completedTreatments
              },
              {
                metric: 'Ongoing Treatments',
                value: analyticsData.patientTreatmentStats.ongoingTreatments
              },
              { metric: 'Follow-ups', value: analyticsData.patientTreatmentStats.followUps }
            ])
            break

          case 'trends': {
            // Use time series data directly (no need to parse)
            const { timeSeriesData } = analyticsData
            const trendsData = timeSeriesData.labels.map((date, i) => ({
              date,
              patients: timeSeriesData.patients[i],
              revenue: timeSeriesData.revenue[i],
              medicines: timeSeriesData.medicines[i],
              opticals: timeSeriesData.opticals[i]
            }))
            worksheet = XLSX.utils.json_to_sheet(trendsData)
            break
          }

          case 'suggestions':
            worksheet = XLSX.utils.json_to_sheet([
              {
                suggestion: 'Top Eye Condition',
                value: analyticsData.eyeConditionStats.conditions[0]?.name || 'N/A'
              },
              {
                suggestion: 'Treatment Success Rate',
                value: `${analyticsData.eyeConditionStats.treatmentSuccess}%`
              },
              {
                suggestion: 'Top Medicine',
                value: analyticsData.medicineStats.topMedicines[0]?.name || 'N/A'
              },
              {
                suggestion: 'Medicines Out of Stock',
                value: analyticsData.medicineStats.outOfStock
              },
              { suggestion: 'Low Stock Medicines', value: analyticsData.medicineStats.lowStock },
              {
                suggestion: 'Top Optical Brand',
                value: analyticsData.opticalStats.topBrands[0]?.name || 'N/A'
              },
              {
                suggestion: 'Peak Hour',
                value: `${analyticsData.patientTreatmentStats.peakHours[0]?.hour || 'N/A'}:00`
              }
            ])
            break

          default:
            worksheet = XLSX.utils.json_to_sheet([{ error: 'Invalid section' }])
        }

        XLSX.utils.book_append_sheet(workbook, worksheet, 'Analytics')
        XLSX.writeFile(workbook, join(exportPath, `${filename}.xlsx`))

        return { success: true, path: join(exportPath, `${filename}.xlsx`) }
      } else if (format === 'csv') {
        // Create CSV content based on section
        let csvContent = ''

        switch (section) {
          case 'overview':
            csvContent =
              'Metric,Value\n' +
              `Total Patients,${analyticsData.patientStats.total}\n` +
              `New Patients,${analyticsData.patientStats.new}\n` +
              `Returning Patients,${analyticsData.patientStats.returning}\n` +
              `Total Revenue,${analyticsData.revenueStats.total}\n` +
              `Pending Revenue,${analyticsData.revenueStats.pending}\n` +
              `Medicines Dispensed,${analyticsData.medicineStats.totalDispensed}\n` +
              `Opticals Dispensed,${analyticsData.opticalStats.totalDispensed}\n` +
              `Completed Treatments,${analyticsData.patientTreatmentStats.completedTreatments}\n` +
              `Ongoing Treatments,${analyticsData.patientTreatmentStats.ongoingTreatments}\n` +
              `Follow-ups,${analyticsData.patientTreatmentStats.followUps}`
            break

          case 'trends': {
            // Use time series data directly (no need to parse)
            const { timeSeriesData } = analyticsData
            csvContent =
              'Date,Patients,Revenue,Medicines,Opticals\n' +
              timeSeriesData.labels
                .map(
                  (date, i) =>
                    `${date},${timeSeriesData.patients[i]},${timeSeriesData.revenue[i]},${timeSeriesData.medicines[i]},${timeSeriesData.opticals[i]}`
                )
                .join('\n')
            break
          }

          case 'suggestions':
            csvContent =
              'Suggestion,Value\n' +
              `Top Eye Condition,${analyticsData.eyeConditionStats.conditions[0]?.name || 'N/A'}\n` +
              `Treatment Success Rate,${analyticsData.eyeConditionStats.treatmentSuccess}%\n` +
              `Top Medicine,${analyticsData.medicineStats.topMedicines[0]?.name || 'N/A'}\n` +
              `Medicines Out of Stock,${analyticsData.medicineStats.outOfStock}\n` +
              `Low Stock Medicines,${analyticsData.medicineStats.lowStock}\n` +
              `Top Optical Brand,${analyticsData.opticalStats.topBrands[0]?.name || 'N/A'}\n` +
              `Peak Hour,${analyticsData.patientTreatmentStats.peakHours[0]?.hour || 'N/A'}:00`
            break

          default:
            csvContent = 'error,Invalid section'
        }

        fs.writeFileSync(join(exportPath, `${filename}.csv`), csvContent, 'utf8')
        return { success: true, path: join(exportPath, `${filename}.csv`) }
      } else if (format === 'pdf') {
        // For PDF, we'll just return a message since PDF generation would require additional libraries
        return {
          success: false,
          message: 'PDF export requires additional setup. Please use Excel or CSV format.'
        }
      } else {
        throw new Error('Invalid export format')
      }
    } catch (error) {
      console.error('Error exporting analytics data:', error)
      return { success: false, error: error instanceof Error ? error.message : String(error) }
    }
  }
)
