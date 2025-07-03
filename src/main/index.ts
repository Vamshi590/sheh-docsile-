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

// Initialize operations Excel file if it doesn't exist
if (!fs.existsSync(operationsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Operations')
  XLSX.writeFile(workbook, operationsFilePath)
  hideFile(operationsFilePath)
}

// Initialize medicines Excel file if it doesn't exist
if (!fs.existsSync(medicinesFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Medicines')
  XLSX.writeFile(workbook, medicinesFilePath)
  hideFile(medicinesFilePath)
}

// Initialize opticals Excel file if it doesn't exist
if (!fs.existsSync(opticalsFilePath)) {
  const workbook = XLSX.utils.book_new()
  const worksheet = XLSX.utils.json_to_sheet([])
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Opticals')
  XLSX.writeFile(workbook, opticalsFilePath)
  hideFile(opticalsFilePath)
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
      id: string
      'PATIENT ID': string
      'GUARDIAN NAME': string
      'PHONE NUMBER': string
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
        (p['GUARDIAN NAME'] &&
          p['GUARDIAN NAME'].toString().toLowerCase().includes(searchTermLower)) ||
        (p['PHONE NUMBER'] && p['PHONE NUMBER'].toString().toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching prescriptions:', error)
    return []
  }
})

// Search patients by ID, name, or phone number
ipcMain.handle('searchPatients', async (_, searchTerm) => {
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

    const searchTermLower = searchTerm.toLowerCase()
    return patients.filter(
      (p) =>
        (p.patientId && p.patientId.toString().toLowerCase().includes(searchTermLower)) ||
        (p.name && p.name.toString().toLowerCase().includes(searchTermLower)) ||
        (p.phone && p.phone.toString().toLowerCase().includes(searchTermLower))
    )
  } catch (error) {
    console.error('Error searching patients:', error)
    return []
  }
})

// Get all operations
ipcMain.handle('getOperations', async () => {
  try {
    if (!fs.existsSync(operationsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(operationsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]

    return XLSX.utils.sheet_to_json(worksheet)
  } catch (error) {
    console.error('Error getting operations:', error)
    return []
  }
})

// Get operations for a specific patient
ipcMain.handle('getPatientOperations', async (_, patientId) => {
  try {
    if (!fs.existsSync(operationsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(operationsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const operations = XLSX.utils.sheet_to_json(worksheet) as Array<{ patientId: string }>

    // Filter operations for the specific patient
    return operations.filter((operation) => operation.patientId === patientId)
  } catch (error) {
    console.error('Error getting patient operations:', error)
    return []
  }
})

// Add a new operation
ipcMain.handle('addOperation', async (_, operation) => {
  try {
    // Generate a unique ID for the operation
    const operationWithId = { ...operation, id: uuidv4() }

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

    return operationWithId
  } catch (error) {
    console.error('Error adding operation:', error)
    throw error
  }
})

// Update an existing operation
ipcMain.handle('updateOperation', async (_, id, updatedOperation) => {
  try {
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

    return operations[operationIndex]
  } catch (error) {
    console.error('Error updating operation:', error)
    throw error
  }
})

// Delete an operation
ipcMain.handle('deleteOperation', async (_, id) => {
  try {
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
    const opticalItems: Array<{ status: string; type?: string; [key: string]: unknown }> =
      XLSX.utils.sheet_to_json(worksheet)

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
