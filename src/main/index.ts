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

// Get the AppData path for storing user data
const appDataPath = join(app.getPath('appData'), 'ShehData')

// Create the directory if it doesn't exist
if (!fs.existsSync(appDataPath)) {
  fs.mkdirSync(appDataPath, { recursive: true })
}

// Path to the users.dat file
const usersFilePath = join(appDataPath, 'users.dat')

// Path to the patients Excel file
const patientsFilePath = join(appDataPath, 'patients.xlsx')

// Path to the prescriptions and receipts Excel file
const prescriptionsFilePath = join(appDataPath, 'prescriptions_and_receipts.xlsx')

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

// Initialize users file if it doesn't exist
if (!fs.existsSync(usersFilePath)) {
  const defaultAdmin = {
    username: 'admin',
    // Default password: admin123
    passwordHash: bcrypt.hashSync('admin123', 10)
  }

  fs.writeFileSync(usersFilePath, JSON.stringify([defaultAdmin]), 'utf-8')
  hideFile(usersFilePath)
}

// Initialize patients Excel file if it doesn't exist
if (!fs.existsSync(patientsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Patients')
  XLSX.writeFile(workbook, patientsFilePath)
  hideFile(patientsFilePath)
}

// Initialize prescriptions and receipts Excel file if it doesn't exist
if (!fs.existsSync(prescriptionsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Prescriptions')
  XLSX.writeFile(workbook, prescriptionsFilePath)
  hideFile(prescriptionsFilePath)
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

// Authentication handler
ipcMain.handle('login', async (_, username: string, password: string) => {
  try {
    const usersData = JSON.parse(fs.readFileSync(usersFilePath, 'utf-8'))
    const user = usersData.find(
      (u: { username: string; passwordHash: string }) => u.username === username
    )

    if (!user) {
      return false
    }

    const isPasswordValid = bcrypt.compareSync(password, user.passwordHash)

    if (isPasswordValid) {
      // Store the logged-in user information
      setSetting('currentUser', { username: user.username })
      return true
    }

    return false
  } catch (error) {
    console.error('Login error:', error)
    return false
  }
})

// Get all patients
ipcMain.handle('getPatients', async () => {
  try {
    if (!fs.existsSync(patientsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(patientsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting patients:', error)
    return []
  }
})

// Add a new patient
ipcMain.handle('addPatient', async (_, patient) => {
  try {
    // Generate a unique ID for the patient
    const patientWithId = { ...patient, id: uuidv4() }

    // Read existing patients
    let patients: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(patientsFilePath)) {
      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      patients = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add the new patient
    patients.push(patientWithId)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(patients)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
    XLSX.writeFile(newWorkbook, patientsFilePath)

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
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(patients)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
    XLSX.writeFile(newWorkbook, patientsFilePath)

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
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(updatedPatients)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Patients')
    XLSX.writeFile(newWorkbook, patientsFilePath)

    return true
  } catch (error) {
    console.error('Error deleting patient:', error)
    return false
  }
})

// Get all prescriptions and receipts
ipcMain.handle('getPrescriptions', async () => {
  try {
    if (!fs.existsSync(prescriptionsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(prescriptionsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting prescriptions:', error)
    return []
  }
})

// Add a new prescription and receipt
ipcMain.handle('addPrescription', async (_, prescription) => {
  try {
    // Generate a unique ID for the prescription
    const prescriptionWithId = { ...prescription, id: uuidv4() }

    // Read existing prescriptions
    let prescriptions: Array<{ id: string; [key: string]: unknown }> = []
    if (fs.existsSync(prescriptionsFilePath)) {
      const workbook = XLSX.readFile(prescriptionsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      prescriptions = XLSX.utils.sheet_to_json(worksheet)
    }

    // Add serial number (Sno) to the new prescription
    // Find the highest existing Sno and increment by 1, or start at 1 if none exist
    const highestSno = prescriptions.reduce((max, item) => {
      const sno = typeof item.Sno === 'number' ? item.Sno : 0
      return sno > max ? sno : max
    }, 0)
    
    // Add the new prescription with Sno
    const prescriptionWithSno = { ...prescriptionWithId, Sno: highestSno + 1 }
    prescriptions.push(prescriptionWithSno)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(prescriptions)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
    XLSX.writeFile(newWorkbook, prescriptionsFilePath)

    return prescriptionWithSno
  } catch (error) {
    console.error('Error adding prescription:', error)
    throw error
  }
})

// Update an existing prescription and receipt
ipcMain.handle('updatePrescription', async (_, id, updatedPrescription) => {
  try {
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

    // Filter out the prescription to delete
    const updatedPrescriptions = prescriptions.filter((p) => p.id !== id)

    // Write back to Excel file
    const newWorkbook = XLSX.utils.book_new()
    const newWorksheet = XLSX.utils.json_to_sheet(updatedPrescriptions)
    XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Prescriptions')
    XLSX.writeFile(newWorkbook, prescriptionsFilePath)

    return true
  } catch (error) {
    console.error('Error deleting prescription:', error)
    return false
  }
})

// Search prescriptions by patient ID, name, or phone number
ipcMain.handle('searchPrescriptions', async (_, searchTerm) => {
  try {
    if (!fs.existsSync(prescriptionsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(prescriptionsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const prescriptions: Array<{ 
      id: string; 
      'PATIENT ID': string; 
      'GUARDIAN NAME': string;
      'PHONE NUMBER': string;
      [key: string]: unknown 
    }> = XLSX.utils.sheet_to_json(worksheet)

    // Filter prescriptions based on search term
    if (!searchTerm || searchTerm.trim() === '') {
      return prescriptions
    }

    const searchTermLower = searchTerm.toLowerCase()
    return prescriptions.filter(
      (p) => 
        (p['PATIENT ID'] && p['PATIENT ID'].toString().toLowerCase().includes(searchTermLower)) ||
        (p['GUARDIAN NAME'] && p['GUARDIAN NAME'].toString().toLowerCase().includes(searchTermLower)) ||
        (p['PHONE NUMBER'] && p['PHONE NUMBER'].toString().toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching prescriptions:', error)
    return []
  }
})
