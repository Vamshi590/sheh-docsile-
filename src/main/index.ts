import { app, shell, BrowserWindow, ipcMain } from 'electron'
import * as fs from 'fs'
import * as path from 'path'
import * as os from 'os'
import { join } from 'path'
import { electronApp, optimizer, is } from '@electron-toolkit/utils'
import icon from '../../resources/icon.png?asset'
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
  status: string
  doctorName: string
  department: string
  referredBy: string
  createdBy: string
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

    // Try to get staff from Supabase first, fallback to Excel
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase.from('staff').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseStaff && supabaseStaff.length > 0) {
        staff = supabaseStaff as StaffMember[]
        console.log('Staff data fetched from Supabase for login')
      } else {
        throw new Error('No staff data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting staff from Supabase for login:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return { success: false, error: 'Staff database not found' }
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      console.log('Falling back to Excel for staff login data')
    }

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
    // Try to get staff from Supabase first, fallback to Excel
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase
        .from('staff')
        .select('*')
        .order('createdAt', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseStaff && supabaseStaff.length > 0) {
        staff = supabaseStaff as StaffMember[]
        console.log('Staff list fetched from Supabase')
      } else {
        throw new Error('No staff data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting staff list from Supabase:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return []
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      console.log('Falling back to Excel for staff list')
    }

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

    // Flatten permissions object into individual columns for Supabase storage
    if (staffWithId.permissions) {
      const permissions = staffWithId.permissions
      staffWithId.patients = permissions.patients || false
      staffWithId.prescriptions = permissions.prescriptions || false
      staffWithId.medicines = permissions.medicines || false
      staffWithId.opticals = permissions.opticals || false
      staffWithId.receipts = permissions.receipts || false
      staffWithId.analytics = permissions.analytics || false
      staffWithId.staff = permissions.staff || false
      staffWithId.operations = permissions.operations || false
      staffWithId.reports = permissions.reports || false
      staffWithId.duesFollowUp = permissions.duesFollowUp || false
      staffWithId.data = permissions.data || false
    }

    // Try to add to Supabase first, fallback to Excel
    try {
      const { data, error } = await supabase.from('staff').insert([staffWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member added to Supabase:', data)

      // Also add to Excel for backup
      try {
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
        console.log('Staff member also added to Excel backup')
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      // Return the new staff member without password hash
      // eslint-disable-next-line @typescript-eslint/no-unused-vars
      const { passwordHash, ...staffWithoutPassword } = data[0] || staffWithId
      return staffWithoutPassword
    } catch (supabaseError) {
      console.error('Error adding staff to Supabase:', supabaseError)

      // Fallback to Excel only
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
      console.log('Staff member added to Excel only (Supabase failed)')
    }

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
    // Prepare updated staff data
    const updatedData = {
      ...staffData,
      updatedAt: new Date().toISOString()
    } as Partial<StaffMember>

    // Hash the password if it was updated
    if (staffData.passwordHash) {
      updatedData.passwordHash = bcrypt.hashSync(staffData.passwordHash, 10)
    }

    // Flatten permissions object into individual columns if permissions are being updated
    if (staffData.permissions) {
      const permissions = staffData.permissions
      updatedData.patients = permissions.patients || false
      updatedData.prescriptions = permissions.prescriptions || false
      updatedData.medicines = permissions.medicines || false
      updatedData.opticals = permissions.opticals || false
      updatedData.receipts = permissions.receipts || false
      updatedData.analytics = permissions.analytics || false
      updatedData.staff = permissions.staff || false
      updatedData.operations = permissions.operations || false
      updatedData.reports = permissions.reports || false
      updatedData.duesFollowUp = permissions.duesFollowUp || false
      updatedData.data = permissions.data || false
    }

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase.from('staff').update(updatedData).eq('id', id).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member updated in Supabase:', data)

      // Also update in Excel for backup
      try {
        if (!fs.existsSync(staffFilePath)) {
          // Return Supabase data if Excel file doesn't exist
          const { passwordHash, ...staffWithoutPassword } = data[0] || updatedData // eslint-disable-line @typescript-eslint/no-unused-vars
          return staffWithoutPassword
        }

        const workbook = XLSX.readFile(staffFilePath)
        const worksheet = workbook.Sheets[workbook.SheetNames[0]]
        const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

        const staffIndex = staff.findIndex((s) => s.id === id)
        if (staffIndex !== -1) {
          staff[staffIndex] = { ...staff[staffIndex], ...updatedData } as StaffMember

          const newWorkbook = XLSX.utils.book_new()
          const newWorksheet = XLSX.utils.json_to_sheet(staff)
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
          XLSX.writeFile(newWorkbook, staffFilePath)
          console.log('Staff member also updated in Excel backup')
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      // Return the updated staff member without password hash
      const { passwordHash, ...staffWithoutPassword } = data[0] || updatedData // eslint-disable-line @typescript-eslint/no-unused-vars
      return staffWithoutPassword
    } catch (supabaseError) {
      console.error('Error updating staff in Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

      const staffIndex = staff.findIndex((s) => s.id === id)
      if (staffIndex === -1) {
        throw new Error('Staff member not found')
      }

      const updatedStaff = {
        ...(staff[staffIndex] as object),
        ...updatedData
      } as StaffMember

      staff[staffIndex] = updatedStaff

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(staff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff member updated in Excel only (Supabase failed)')

      // Return the updated staff member without password hash
      const { passwordHash, ...staffWithoutPassword } = updatedStaff // eslint-disable-line @typescript-eslint/no-unused-vars
      return staffWithoutPassword
    }
  } catch (error) {
    console.error('Error updating staff:', error)
    throw error
  }
})

// Delete staff member
ipcMain.handle('deleteStaff', async (_, id: string) => {
  try {
    // First check admin constraint by getting all staff
    let staff: StaffMember[] = []
    try {
      const { data: supabaseStaff, error } = await supabase.from('staff').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      staff = supabaseStaff || []
    } catch (supabaseError) {
      console.error('Error getting staff from Supabase for delete check:', supabaseError)

      // Fallback to Excel for admin check
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
    }

    // Filter out the staff member to delete
    const updatedStaff = staff.filter((s) => s.id !== id)

    // Make sure we're not deleting the last admin
    const remainingAdmins = updatedStaff.filter((s) => s.isAdmin)
    if (remainingAdmins.length === 0) {
      throw new Error('Cannot delete the last administrator')
    }

    // Try to delete from Supabase first
    try {
      const { error } = await supabase.from('staff').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Staff member deleted from Supabase')

      // Also delete from Excel for backup
      try {
        if (fs.existsSync(staffFilePath)) {
          const workbook = XLSX.readFile(staffFilePath)
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const excelStaff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
          const updatedExcelStaff = excelStaff.filter((s) => s.id !== id)

          const newWorkbook = XLSX.utils.book_new()
          const newWorksheet = XLSX.utils.json_to_sheet(updatedExcelStaff)
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
          XLSX.writeFile(newWorkbook, staffFilePath)
          console.log('Staff member also deleted from Excel backup')
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      return { success: true }
    } catch (supabaseError) {
      console.error('Error deleting staff from Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const excelStaff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      const updatedExcelStaff = excelStaff.filter((s) => s.id !== id)

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(updatedExcelStaff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff member deleted from Excel only (Supabase failed)')

      return { success: true }
    }
  } catch (error) {
    console.error('Error deleting staff:', error)
    throw error
  }
})

// Reset staff password
ipcMain.handle('resetStaffPassword', async (_, id: string) => {
  try {
    // Generate a random password
    const newPassword = crypto.randomBytes(4).toString('hex')
    const hashedPassword = bcrypt.hashSync(newPassword, 10)
    const updatedAt = new Date().toISOString()

    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('staff')
        .update({
          passwordHash: hashedPassword,
          updatedAt: updatedAt
        })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (!data || data.length === 0) {
        throw new Error('Staff member not found')
      }

      console.log('Staff password reset in Supabase')

      // Also update in Excel for backup
      try {
        if (fs.existsSync(staffFilePath)) {
          const workbook = XLSX.readFile(staffFilePath)
          const worksheet = workbook.Sheets[workbook.SheetNames[0]]
          const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

          const staffIndex = staff.findIndex((s) => s.id === id)
          if (staffIndex !== -1) {
            staff[staffIndex] = {
              ...staff[staffIndex],
              passwordHash: hashedPassword,
              updatedAt: updatedAt
            }

            const newWorkbook = XLSX.utils.book_new()
            const newWorksheet = XLSX.utils.json_to_sheet(staff)
            XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
            XLSX.writeFile(newWorkbook, staffFilePath)
            console.log('Staff password also reset in Excel backup')
          }
        }
      } catch (excelError) {
        console.error('Error updating Excel backup:', excelError)
      }

      return newPassword
    } catch (supabaseError) {
      console.error('Error resetting password in Supabase:', supabaseError)

      // Fallback to Excel only
      if (!fs.existsSync(staffFilePath)) {
        throw new Error('Staff file does not exist')
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]

      const staffIndex = staff.findIndex((s) => s.id === id)
      if (staffIndex === -1) {
        throw new Error('Staff member not found')
      }

      staff[staffIndex] = {
        ...staff[staffIndex],
        passwordHash: hashedPassword,
        updatedAt: updatedAt
      }

      const newWorkbook = XLSX.utils.book_new()
      const newWorksheet = XLSX.utils.json_to_sheet(staff)
      XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Staff')
      XLSX.writeFile(newWorkbook, staffFilePath)
      console.log('Staff password reset in Excel only (Supabase failed)')

      return newPassword
    }
  } catch (error) {
    console.error('Error resetting password:', error)
    throw error
  }
})

// Check if user has permission for a module
ipcMain.handle('checkPermission', async (_, userId: string, module: string) => {
  try {
    let user: StaffMember | null = null

    // Try to get user from Supabase first
    try {
      const { data, error } = await supabase.from('staff').select('*').eq('id', userId).single()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      user = data
    } catch (supabaseError) {
      console.error('Error getting user from Supabase for permission check:', supabaseError)

      // Fallback to Excel
      if (!fs.existsSync(staffFilePath)) {
        return { hasAccess: false, module }
      }

      const workbook = XLSX.readFile(staffFilePath)
      const worksheet = workbook.Sheets[workbook.SheetNames[0]]
      const staff = XLSX.utils.sheet_to_json(worksheet) as StaffMember[]
      user = staff.find((s) => s.id === userId) || null
    }

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

// Get patient by ID
ipcMain.handle('getPatientById', async (_, patientId: string) => {
  try {
    // First try to fetch from Supabase
    const { data: patients, error } = await supabase
      .from('patients')
      .select('*')
      .eq('patientId', patientId)
      .limit(1)

    if (error) {
      throw new Error(`Supabase error: ${error.message}`)
    }

    if (patients && patients.length > 0) {
      console.log('Patient found in Supabase:', patients[0])
      return patients[0]
    }

    // If not found in Supabase, return null
    console.log('Patient not found in Supabase with ID:', patientId)
    return null
  } catch (error) {
    console.error('Error getting patient by ID from Supabase:', error)

    // Fallback to local Excel file if Supabase fails
    try {
      if (!fs.existsSync(patientsFilePath)) {
        console.log('Patients file does not exist')
        return null
      }

      const workbook = XLSX.readFile(patientsFilePath)
      const sheetName = workbook.SheetNames[0]
      const worksheet = workbook.Sheets[sheetName]
      const patients = XLSX.utils.sheet_to_json(worksheet) as Patient[]

      // Find patient by patientId
      const patient = patients.find((p) => p.patientId === patientId)

      if (patient) {
        console.log('Patient found in Excel file:', patient)
        return patient
      } else {
        console.log('Patient not found in Excel file with ID:', patientId)
        return null
      }
    } catch (excelError) {
      console.error('Error reading patient from Excel file:', excelError)
      return null
    }
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
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase.from('medicines').select('*')

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (data && data.length > 0) {
        console.log('Medicines fetched from Supabase')
        return data
      }
    } catch (supabaseError) {
      console.error('Error getting medicines from Supabase:', supabaseError)
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel
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
    // Try to search in Supabase first
    try {
      // If no search term, get all medicines
      if (!searchTerm || searchTerm.trim() === '') {
        const { data, error } = await supabase.from('medicines').select('*')

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        if (data && data.length > 0) {
          console.log('All medicines fetched from Supabase')
          return data
        }
      } else {
        // If there's a search term, use ilike for case-insensitive search
        const { data, error } = await supabase
          .from('medicines')
          .select('*')
          .ilike('name', `%${searchTerm}%`)

        if (error) {
          throw new Error(`Supabase error: ${error.message}`)
        }

        if (data) {
          console.log('Medicines search results fetched from Supabase')
          return data
        }
      }
    } catch (supabaseError) {
      console.error('Error searching medicines from Supabase:', supabaseError)
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel
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

    // Try to add to Supabase first
    try {
      const { data, error } = await supabase.from('medicines').insert([medicineWithId]).select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Medicine added to Supabase')

      // Also add to Excel for local backup
      try {
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

        console.log('Medicine also added to Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return success even if Excel update fails
      }

      return data[0] || medicineWithId
    } catch (supabaseError) {
      console.error('Error adding medicine to Supabase:', supabaseError)
      // Fall back to Excel-only add if Supabase fails
    }

    // Fallback to Excel-only add
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

    console.log('Medicine added to Excel file only (Supabase failed)')
    return medicineWithId
  } catch (error) {
    console.error('Error adding medicine:', error)
    throw error
  }
})

// Update an existing medicine
ipcMain.handle('updateMedicine', async (_, id, updatedMedicine) => {
  try {
    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({ ...updatedMedicine })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Medicine updated in Supabase')

      // Also update in Excel for local backup
      try {
        // Read existing medicines
        if (!fs.existsSync(medicinesFilePath)) {
          return data[0] || { ...updatedMedicine, id } // Return Supabase data if Excel file doesn't exist
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
          // If medicine not found in Excel, still return success
          return data[0] || { ...updatedMedicine, id }
        }

        medicines[medicineIndex] = { ...updatedMedicine, id }

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(medicines)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
        XLSX.writeFile(newWorkbook, medicinesFilePath)

        console.log('Medicine also updated in Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return success even if Excel update fails
      }

      return data[0] || { ...updatedMedicine, id }
    } catch (supabaseError) {
      console.error('Error updating medicine in Supabase:', supabaseError)
      // Fall back to Excel-only update if Supabase fails
    }

    // Fallback to Excel-only update
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

    console.log('Medicine updated in Excel file only (Supabase failed)')
    return medicines[medicineIndex]
  } catch (error) {
    console.error('Error updating medicine:', error)
    throw error
  }
})

// Delete a medicine
ipcMain.handle('deleteMedicine', async (_, id) => {
  try {
    // Delete from Supabase first
    try {
      const { error } = await supabase.from('medicines').delete().eq('id', id)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Medicine deleted from Supabase')

      // Also delete from local Excel file
      try {
        // Read existing medicines
        if (!fs.existsSync(medicinesFilePath)) {
          return { success: true } // Return success if Excel file doesn't exist
        }

        const workbook = XLSX.readFile(medicinesFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const medicines: Array<{ id: string; [key: string]: unknown }> = XLSX.utils.sheet_to_json(
          worksheet
        ) as Array<{ id: string; [key: string]: unknown }>

        // Find the medicine to delete
        const medicineIndex = medicines.findIndex((m) => m.id === id)

        if (medicineIndex === -1) {
          // If medicine not found in Excel, still return success
          return { success: true }
        }

        // Filter out the medicine to delete
        const updatedMedicines = medicines.filter((m) => m.id !== id)

        // Write back to Excel file
        const newWorkbook = XLSX.utils.book_new()
        const newWorksheet = XLSX.utils.json_to_sheet(updatedMedicines)
        XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
        XLSX.writeFile(newWorkbook, medicinesFilePath)

        console.log('Medicine also deleted from Excel file')
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return success even if Excel update fails
        return { success: true }
      }

      return { success: true }
    } catch (supabaseError) {
      console.error('Error deleting medicine from Supabase:', supabaseError)
      // Fall back to Excel-only delete if Supabase fails
    }

    // Fallback to Excel-only delete
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

    console.log('Medicine deleted from Excel file only (Supabase failed)')
    return { success: true }
  } catch (error) {
    console.error('Error deleting medicine:', error)
    return { success: false }
  }
})

// Update medicine status
ipcMain.handle('updateMedicineStatus', async (_, id, status) => {
  try {
    // Try to update in Supabase first
    try {
      const { data, error } = await supabase
        .from('medicines')
        .update({ status })
        .eq('id', id)
        .select()

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      console.log('Medicine status updated in Supabase')

      // Also update in Excel for local backup
      try {
        // Read existing medicines
        if (!fs.existsSync(medicinesFilePath)) {
          return data[0] || { id, status }
        }

        const workbook = XLSX.readFile(medicinesFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        const medicines: Array<{ id: string; status: string; [key: string]: unknown }> =
          XLSX.utils.sheet_to_json(worksheet)

        // Find and update the medicine status
        const medicineIndex = medicines.findIndex((m) => m.id === id)

        if (medicineIndex !== -1) {
          medicines[medicineIndex].status = status

          // Write back to Excel file
          const newWorkbook = XLSX.utils.book_new()
          const newWorksheet = XLSX.utils.json_to_sheet(medicines)
          XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
          XLSX.writeFile(newWorkbook, medicinesFilePath)

          console.log('Medicine status also updated in Excel file')
        }

        return data[0] || { id, status }
      } catch (excelError) {
        console.error('Error updating Excel file:', excelError)
        // Return Supabase data even if Excel update fails
        return data[0] || { id, status }
      }
    } catch (supabaseError) {
      console.error('Error updating medicine status in Supabase:', supabaseError)
      // Fall back to Excel-only update if Supabase fails
    }

    // Fallback to Excel-only update
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

    console.log('Medicine status updated in Excel file only (Supabase failed)')

    return medicines[medicineIndex]
  } catch (error) {
    console.error('Error updating medicine status:', error)
    throw error
  }
})

// Get medicines by status
ipcMain.handle('getMedicinesByStatus', async (_, status) => {
  try {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase.from('medicines').select('*').eq('status', status)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (data) {
        console.log('Medicines by status fetched from Supabase')
        return data
      }
    } catch (supabaseError) {
      console.error('Error getting medicines by status from Supabase:', supabaseError)
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel
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
    // Try to get data from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').select('*')

        if (error) {
          console.error('Error getting optical items from Supabase:', error)
        } else if (data && data.length > 0) {
          return data
        }
      } catch (supabaseError) {
        console.error('Error getting optical items from Supabase:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fallback to Excel
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
    let opticalItems: Array<{
      id: string
      type: string
      brand: string
      model?: string
      [key: string]: unknown
    }> = []

    // Try to get data from Supabase first
    if (supabase) {
      try {
        let query = supabase.from('opticals').select('*')

        // Apply type filter if provided
        if (type) {
          query = query.eq('type', type)
        }

        // Apply search term if provided
        if (searchTerm && searchTerm.trim() !== '') {
          const searchTermLower = searchTerm.toLowerCase()
          query = query.or(`brand.ilike.%${searchTermLower}%,model.ilike.%${searchTermLower}%`)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error searching optical items from Supabase:', error)
        } else if (data && data.length > 0) {
          return data
        }
      } catch (supabaseError) {
        console.error('Error searching optical items from Supabase:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fallback to Excel
    if (!fs.existsSync(opticalsFilePath)) {
      return []
    }

    const workbook = XLSX.readFile(opticalsFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    opticalItems = XLSX.utils.sheet_to_json(worksheet)

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

    // Try to add to Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').insert([itemWithId]).select()

        if (error) {
          console.error('Error adding optical item to Supabase:', error)
        } else if (data && data.length > 0) {
          // Successfully added to Supabase, still add to Excel as backup
          console.log('Successfully added optical item to Supabase')
        }
      } catch (supabaseError) {
        console.error('Error adding optical item to Supabase:', supabaseError)
      }
    }

    // Read existing optical items from Excel
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
    const itemWithId = { ...updatedItem, id }

    // Try to update in Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('opticals')
          .update(itemWithId)
          .eq('id', id)
          .select()

        if (error) {
          console.error('Error updating optical item in Supabase:', error)
        } else if (data && data.length > 0) {
          console.log('Successfully updated optical item in Supabase')
        }
      } catch (supabaseError) {
        console.error('Error updating optical item in Supabase:', supabaseError)
      }
    }

    // Update in Excel as well
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

    opticalItems[itemIndex] = itemWithId

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
    // Try to delete from Supabase first
    if (supabase) {
      try {
        const { error } = await supabase.from('opticals').delete().eq('id', id)

        if (error) {
          console.error('Error deleting optical item from Supabase:', error)
        } else {
          console.log('Successfully deleted optical item from Supabase')
        }
      } catch (supabaseError) {
        console.error('Error deleting optical item from Supabase:', supabaseError)
      }
    }

    // Delete from Excel as well
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
    // Try to update status in Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase
          .from('opticals')
          .update({ status })
          .eq('id', id)
          .select()

        if (error) {
          console.error('Error updating optical item status in Supabase:', error)
        } else if (data && data.length > 0) {
          console.log('Successfully updated optical item status in Supabase')
        }
      } catch (supabaseError) {
        console.error('Error updating optical item status in Supabase:', supabaseError)
      }
    }

    // Update in Excel as well
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
    // Try to get data from Supabase first
    if (supabase) {
      try {
        let query = supabase.from('opticals').select('*').eq('status', status)

        // Further filter by type if provided
        if (type) {
          query = query.eq('type', type)
        }

        const { data, error } = await query

        if (error) {
          console.error('Error getting optical items by status from Supabase:', error)
        } else if (data && data.length > 0) {
          return data
        }
      } catch (supabaseError) {
        console.error('Error getting optical items by status from Supabase:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fallback to Excel
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
    // Try to get data from Supabase first
    if (supabase) {
      try {
        const { data, error } = await supabase.from('opticals').select('*').eq('type', type)

        if (error) {
          console.error('Error getting optical items by type from Supabase:', error)
        } else if (data && data.length > 0) {
          return data
        }
      } catch (supabaseError) {
        console.error('Error getting optical items by type from Supabase:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fallback to Excel
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
ipcMain.handle(
  'dispenseMedicine',
  async (_, id, quantity, dispensedBy, patientId, price, totalAmount) => {
    try {
      let medicine
      let medicineIndex

      // Try to update in Supabase first
      try {
        // First get the medicine from Supabase
        const { data: medicineData, error: fetchError } = await supabase
          .from('medicines')
          .select('*')
          .eq('id', id)

        if (fetchError) {
          throw new Error(`Supabase fetch error: ${fetchError.message}`)
        }

        if (!medicineData || medicineData.length === 0) {
          throw new Error('Medicine not found in Supabase')
        }

        medicine = medicineData[0]

        // Check if there's enough quantity
        if (medicine.quantity < quantity) {
          throw new Error('Not enough medicine in stock')
        }

        // Update the medicine quantity in Supabase
        const updatedQuantity = medicine.quantity - quantity
        const updatedStatus = updatedQuantity === 0 ? 'out_of_stock' : medicine.status

        const { data: updatedMedicine, error: updateError } = await supabase
          .from('medicines')
          .update({
            quantity: updatedQuantity,
            status: updatedStatus
          })
          .eq('id', id)
          .select()

        if (updateError) {
          throw new Error(`Supabase update error: ${updateError.message}`)
        }

        console.log('Medicine quantity updated in Supabase')

        // Create a dispense record in Supabase
        const dispenseRecord = {
          id: uuidv4(),
          medicineId: id,
          medicineName: medicine.name,
          batchNumber: medicine.batchNumber,
          quantity: quantity,
          price: price,
          totalAmount: totalAmount,
          dispensedDate: new Date().toISOString(),
          patientName: dispensedBy,
          patientId: patientId || ''
        }

        const { error: dispenseError } = await supabase
          .from('medicine_dispense_records')
          .insert([dispenseRecord])

        if (dispenseError) {
          throw new Error(`Supabase dispense record error: ${dispenseError.message}`)
        }

        console.log('Medicine dispense record added to Supabase')

        // Also update Excel files for local backup
        try {
          // Update medicines Excel file
          if (fs.existsSync(medicinesFilePath)) {
            const workbook = XLSX.readFile(medicinesFilePath)
            const sheetName = workbook.SheetNames[0]
            const worksheet = workbook.Sheets[sheetName]
            const medicines = XLSX.utils.sheet_to_json(worksheet) as Array<{
              id: string
              name: string
              quantity: number
              batchNumber: string
              [key: string]: unknown
            }>

            medicineIndex = medicines.findIndex((m) => m.id === id)

            if (medicineIndex !== -1) {
              medicines[medicineIndex].quantity = updatedQuantity

              if (updatedQuantity === 0) {
                medicines[medicineIndex].status = 'out_of_stock'
              }

              // Write updated medicines back to Excel file
              const newWorkbook = XLSX.utils.book_new()
              const newWorksheet = XLSX.utils.json_to_sheet(medicines)
              XLSX.utils.book_append_sheet(newWorkbook, newWorksheet, 'Medicines')
              XLSX.writeFile(newWorkbook, medicinesFilePath)

              console.log('Medicine quantity also updated in Excel file')
            }
          }

          // Update dispense records Excel file
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
          XLSX.utils.book_append_sheet(
            dispenseWorkbook,
            dispenseWorksheet,
            'MedicineDispenseRecords'
          )
          XLSX.writeFile(dispenseWorkbook, medicineDispenseFilePath)

          console.log('Medicine dispense record also added to Excel file')
        } catch (excelError) {
          console.error('Error updating Excel files:', excelError)
          // Continue even if Excel update fails
        }

        return updatedMedicine[0] || medicine
      } catch (supabaseError) {
        console.error('Error updating medicine in Supabase:', supabaseError)
        // Fall back to Excel-only update if Supabase fails
      }

      // Fallback to Excel-only update
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
      medicineIndex = medicines.findIndex((m) => m.id === id)

      if (medicineIndex === -1) {
        throw new Error('Medicine not found')
      }

      medicine = medicines[medicineIndex]

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

      console.log('Medicine quantity updated in Excel file only (Supabase failed)')

      // Create a dispense record
      const dispenseRecord = {
        id: uuidv4(),
        medicineId: id,
        medicineName: medicine.name,
        batchNumber: medicine.batchNumber,
        quantity: quantity,
        price: price,
        totalAmount: totalAmount,
        dispensedDate: new Date().toISOString(),
        patientName: dispensedBy,
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

      console.log('Medicine dispense record added to Excel file only (Supabase failed)')

      return medicines[medicineIndex]
    } catch (error) {
      console.error('Error dispensing medicine:', error)
      throw error
    }
  }
)

// Get medicine dispense records with pagination
ipcMain.handle('getMedicineDispenseRecords', async (_, page = 1, pageSize = 10) => {
  try {
    // Try to get from Supabase first with pagination
    try {
      // Calculate range for pagination
      const from = (page - 1) * pageSize
      const to = from + pageSize - 1

      // Get total count for pagination info
      const { count, error: countError } = await supabase
        .from('medicine_dispense_records')
        .select('*', { count: 'exact', head: true })

      if (countError) {
        throw new Error(`Supabase count error: ${countError.message}`)
      }

      // Get paginated data ordered by dispensedDate desc (newest first)
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .order('dispensedDate', { ascending: false })
        .range(from, to)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (data) {
        console.log(`Medicine dispense records page ${page} fetched from Supabase`)
        return { data, totalCount: count, page, pageSize }
      }
    } catch (supabaseError) {
      console.error('Error getting medicine dispense records from Supabase:', supabaseError)
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel with manual pagination
    if (!fs.existsSync(medicineDispenseFilePath)) {
      return { data: [], totalCount: 0, page, pageSize }
    }

    const workbook = XLSX.readFile(medicineDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    // Get all records
    const allRecords = XLSX.utils.sheet_to_json(worksheet) as Array<{
      dispensedDate: string
      [key: string]: unknown
    }>
    // Sort by dispensedDate in descending order (newest first)
    const sortedRecords = allRecords.sort((a, b) => {
      const dateA = new Date(a.dispensedDate).getTime()
      const dateB = new Date(b.dispensedDate).getTime()
      return dateB - dateA
    })

    // Calculate pagination
    const totalCount = sortedRecords.length
    const from = (page - 1) * pageSize
    const to = Math.min(from + pageSize, totalCount)

    // Get paginated data
    const paginatedData = sortedRecords.slice(from, to)
    console.log(`Medicine dispense records page ${page} fetched from Excel fallback`)
    return { data: paginatedData, totalCount, page, pageSize }
  } catch (error) {
    console.error('Error getting medicine dispense records:', error)
    return { data: [], totalCount: 0, page, pageSize }
  }
})

// Get medicine dispense records by patient ID
ipcMain.handle('getMedicineDispenseRecordsByPatient', async (_, patientId) => {
  try {
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .eq('patientId', patientId)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (data) {
        console.log('Medicine dispense records by patient fetched from Supabase')
        return data
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records by patient from Supabase:',
        supabaseError
      )
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel
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
    // Try to get from Supabase first
    try {
      const { data, error } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .eq('medicineId', medicineId)

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (data) {
        console.log('Medicine dispense records by medicine fetched from Supabase')
        return data
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records by medicine from Supabase:',
        supabaseError
      )
      // Fall back to Excel if Supabase fails
    }

    // Fallback to Excel
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
ipcMain.handle('dispenseOptical', async (_, id, quantity, patientName, patientId, dispensedBy) => {
  try {
    let supabaseOpticalItem: Record<string, unknown> | null = null
    let excelOpticalItem: Record<string, unknown> | null = null
    let supabaseSuccess = false

    // Try to update in Supabase first
    if (supabase) {
      try {
        // First get the current item to check quantity
        const { data: opticalData, error: getError } = await supabase
          .from('opticals')
          .select('*')
          .eq('id', id)
          .single()

        if (getError) {
          console.error('Error getting optical item from Supabase:', getError)
        } else if (opticalData) {
          supabaseOpticalItem = opticalData as Record<string, unknown>

          // Check if the item is available
          if (supabaseOpticalItem && supabaseOpticalItem.status !== 'available') {
            throw new Error('Optical item is not available')
          }

          // Check if there's enough quantity
          if (supabaseOpticalItem && (supabaseOpticalItem.quantity as number) < quantity) {
            throw new Error(`Only ${supabaseOpticalItem.quantity} units available`)
          }

          // Calculate new quantity
          const newQuantity = supabaseOpticalItem
            ? (supabaseOpticalItem.quantity as number) - quantity
            : 0

          // Determine if status needs to be updated
          const newStatus =
            newQuantity <= 0 ? 'out_of_stock' : (supabaseOpticalItem?.status as string)

          // Update the item in Supabase
          const { data: updateData, error: updateError } = await supabase
            .from('opticals')
            .update({ quantity: newQuantity, status: newStatus })
            .eq('id', id)
            .select()

          if (updateError) {
            console.error('Error updating optical item in Supabase:', updateError)
          } else if (updateData && updateData.length > 0) {
            console.log('Successfully updated optical item in Supabase')
            supabaseSuccess = true

            // Create dispense record in Supabase
            if (supabaseOpticalItem) {
              const dispenseRecord = {
                id: uuidv4(),
                opticalId: id,
                opticalType: supabaseOpticalItem.type as string,
                brand: supabaseOpticalItem.brand as string,
                model: (supabaseOpticalItem.model as string) || '',
                quantity: quantity,
                price: (supabaseOpticalItem.price as number) || 0,
                patientName: patientName,
                patientId: patientId || '',
                dispensedBy: dispensedBy || '',
                dispensedAt: new Date().toISOString()
              }

              const { error: dispenseError } = await supabase
                .from('optical_dispense_records')
                .insert(dispenseRecord)

              if (dispenseError) {
                console.error('Error creating dispense record in Supabase:', dispenseError)
              } else {
                console.log('Successfully created dispense record in Supabase')
              }
            }
          }
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Read the optical items file
    let opticalItems: Record<string, unknown>[] = []

    if (fs.existsSync(opticalsFilePath)) {
      const workbook = XLSX.readFile(opticalsFilePath)
      const sheetName = workbook.SheetNames[0]
      opticalItems = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]) as Record<
        string,
        unknown
      >[]
    } else {
      throw new Error('Optical items file not found')
    }

    // Find the optical item by ID
    excelOpticalItem = opticalItems.find((item) => item.id === id) || null

    if (!excelOpticalItem) {
      throw new Error('Optical item not found')
    }

    // Check if the item is available
    if (excelOpticalItem.status !== 'available') {
      throw new Error('Optical item is not available')
    }

    // Check if there's enough quantity
    if ((excelOpticalItem.quantity as number) < quantity) {
      throw new Error(`Only ${excelOpticalItem.quantity} units available`)
    }

    // Update the quantity
    excelOpticalItem.quantity = (excelOpticalItem.quantity as number) - quantity

    // Update the status if needed
    if ((excelOpticalItem.quantity as number) <= 0) {
      excelOpticalItem.status = 'out_of_stock'
    }

    // Write the updated optical items back to the file
    const newWorkbook = XLSX.utils.book_new()
    const newSheet = XLSX.utils.json_to_sheet(opticalItems)
    XLSX.utils.book_append_sheet(newWorkbook, newSheet, 'Optical Items')
    XLSX.writeFile(newWorkbook, opticalsFilePath)

    // Create a dispense record
    const opticalDispenseFilePath = app.getPath('userData') + '/optical_dispense_records.xlsx'
    let dispenseRecords: Record<string, unknown>[] = []

    if (fs.existsSync(opticalDispenseFilePath)) {
      const dispenseWorkbook = XLSX.readFile(opticalDispenseFilePath)
      const dispenseSheetName = dispenseWorkbook.SheetNames[0]
      dispenseRecords = XLSX.utils.sheet_to_json(
        dispenseWorkbook.Sheets[dispenseSheetName]
      ) as Record<string, unknown>[]
    }

    // Add the new dispense record
    const excelDispenseRecord = {
      id: uuidv4(),
      opticalId: id,
      opticalType: excelOpticalItem.type,
      brand: excelOpticalItem.brand,
      model: excelOpticalItem.model || '',
      quantity: quantity,
      price: excelOpticalItem.price || 0,
      patientName: patientName,
      patientId: patientId || '',
      dispensedBy: dispensedBy || '',
      dispensedAt: new Date().toISOString()
    }

    dispenseRecords.push(excelDispenseRecord)

    // Write the updated dispense records back to the file
    const newDispenseWorkbook = XLSX.utils.book_new()
    const dispenseSheet = XLSX.utils.json_to_sheet(dispenseRecords)
    XLSX.utils.book_append_sheet(newDispenseWorkbook, dispenseSheet, 'Dispense Records')
    XLSX.writeFile(newDispenseWorkbook, opticalDispenseFilePath)

    // Return the updated item - prefer Supabase item if available, otherwise Excel item
    return supabaseSuccess && supabaseOpticalItem ? supabaseOpticalItem : excelOpticalItem
  } catch (error) {
    console.error('Error dispensing optical item:', error)
    throw error
  }
})

// Get optical dispense records with pagination
ipcMain.handle('getOpticalDispenseRecords', async (_, page = 1, pageSize = 10) => {
  try {
    let data: Record<string, unknown>[] = []
    let totalCount = 0

    // Try to get records from Supabase first
    if (supabase) {
      try {
        // Get total count first
        const { count, error: countError } = await supabase
          .from('optical_dispense_records')
          .select('*', { count: 'exact', head: true })

        if (countError) {
          console.error('Error getting optical dispense records count from Supabase:', countError)
        } else if (count !== null) {
          totalCount = count

          // Now get paginated data
          const { data: supabaseData, error: dataError } = await supabase
            .from('optical_dispense_records')
            .select('*')
            .order('dispensedAt', { ascending: false })
            .range((page - 1) * pageSize, page * pageSize - 1)

          if (dataError) {
            console.error('Error getting optical dispense records from Supabase:', dataError)
          } else if (supabaseData) {
            data = supabaseData as Record<string, unknown>[]

            // Return early with Supabase data
            return {
              data,
              totalCount,
              page,
              pageSize
            }
          }
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fall back to Excel if Supabase failed or is not available
    if (!fs.existsSync(opticalDispenseFilePath)) {
      return { data: [], totalCount: 0, page, pageSize }
    }

    const workbook = XLSX.readFile(opticalDispenseFilePath)
    const sheetName = workbook.SheetNames[0]
    const worksheet = workbook.Sheets[sheetName]
    const allRecords = XLSX.utils.sheet_to_json(worksheet) as Record<string, unknown>[]

    // Calculate pagination
    totalCount = allRecords.length
    const startIndex = (page - 1) * pageSize
    const endIndex = startIndex + pageSize
    data = allRecords.slice(startIndex, endIndex) as Record<string, unknown>[]

    // Return paginated data with metadata
    return {
      data,
      totalCount,
      page,
      pageSize
    }
  } catch (error) {
    console.error('Error getting optical dispense records:', error)
    return { data: [], totalCount: 0, page, pageSize }
  }
})

// Get optical dispense records by patient ID
ipcMain.handle('getOpticalDispenseRecordsByPatient', async (_, patientId) => {
  try {
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('patientId', patientId)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error('Error getting optical dispense records by patient from Supabase:', error)
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fall back to Excel if Supabase failed or is not available
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
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('opticalType', type)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error('Error getting optical dispense records by type from Supabase:', error)
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fall back to Excel if Supabase failed or is not available
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
    // Try to get records from Supabase first
    if (supabase) {
      try {
        const { data: supabaseData, error } = await supabase
          .from('optical_dispense_records')
          .select('*')
          .eq('opticalId', opticalId)
          .order('dispensedAt', { ascending: false })

        if (error) {
          console.error(
            'Error getting optical dispense records by optical ID from Supabase:',
            error
          )
        } else if (supabaseData && supabaseData.length > 0) {
          return supabaseData as Record<string, unknown>[]
        }
      } catch (supabaseError) {
        console.error('Error with Supabase operations:', supabaseError)
        // Fall back to Excel if Supabase fails
      }
    }

    // Fall back to Excel if Supabase failed or is not available
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

    // Get patients data - try Supabase first, fallback to Excel
    let patients: Array<{
      id: string
      date: string
      gender: string
      dob: string
      name: string
      patientId: string
      age: number
      [key: string]: unknown
    }> = []

    try {
      // Try to get patients from Supabase first
      const { data: supabasePatients, error } = await supabase
        .from('patients')
        .select('*')
        .gte('date', start.toISOString().split('T')[0])
        .lte('date', end.toISOString().split('T')[0])
        .order('date', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabasePatients && supabasePatients.length > 0) {
        patients = supabasePatients as Array<{
          id: string
          date: string
          gender: string
          dob: string
          name: string
          patientId: string
          age: number
          [key: string]: unknown
        }>
        console.log('Patients data fetched from Supabase for analytics')
      } else {
        throw new Error('No patients data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting patients from Supabase for analytics:', supabaseError)

      // Fallback to Excel
      if (fs.existsSync(patientsFilePath)) {
        const workbook = XLSX.readFile(patientsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        // Field names from Excel: date, patientId, name, guardian, dob, age, gender, phone, address, id
        const allPatients: Array<{
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
        patients = allPatients.filter((patient) => {
          const patientDate = new Date(patient.date)
          return patientDate >= start && patientDate <= end
        })
        console.log('Falling back to Excel for patients analytics data')
      }
    }

    if (patients.length > 0) {
      // Filter patients by date range (for Excel fallback)
      const filteredPatients = patients

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

    // Get prescriptions data for revenue and conditions - try Supabase first, fallback to Excel
    let prescriptions: Array<{
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
    }> = []

    try {
      // Try to get prescriptions from Supabase first
      const { data: supabasePrescriptions, error } = await supabase
        .from('prescriptions')
        .select('*')
        .gte('DATE', start.toISOString().split('T')[0])
        .lte('DATE', end.toISOString().split('T')[0])
        .order('DATE', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabasePrescriptions && supabasePrescriptions.length > 0) {
        prescriptions = supabasePrescriptions as Array<{
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
        }>
        console.log('Prescriptions data fetched from Supabase for analytics')
      } else {
        throw new Error('No prescriptions data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting prescriptions from Supabase for analytics:', supabaseError)

      // Fallback to Excel
      if (fs.existsSync(prescriptionsFilePath)) {
        const workbook = XLSX.readFile(prescriptionsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        // Field names from Excel: Sno, DATE, RECEIPT NO, PATIENT ID, PATIENT NAME, etc.
        const allPrescriptions: Array<{
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
        prescriptions = allPrescriptions.filter((prescription) => {
          if (!prescription.DATE) return false
          const prescriptionDate = new Date(prescription.DATE.toString())
          return prescriptionDate >= start && prescriptionDate <= end
        })
        console.log('Falling back to Excel for prescriptions analytics data')
      }
    }

    if (prescriptions.length > 0) {
      // Filter prescriptions by date range (for Excel fallback)
      const filteredPrescriptions = prescriptions

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

    // Get medicine dispense records - try Supabase first, fallback to Excel
    let dispenseRecords: Array<{
      dispensedDate: string
      medicineName: string
      quantity: number
      [key: string]: unknown
    }> = []
    let medicineRecords: Array<{ name: string; price: number; [key: string]: unknown }> = []

    try {
      // Try to get medicine dispense records from Supabase first
      const { data: supabaseDispenseRecords, error: dispenseError } = await supabase
        .from('medicine_dispense_records')
        .select('*')
        .gte('dispensedDate', start.toISOString().split('T')[0])
        .lte('dispensedDate', end.toISOString().split('T')[0])
        .order('dispensedDate', { ascending: false })

      if (dispenseError) {
        throw new Error(`Supabase dispense error: ${dispenseError.message}`)
      }

      // Get medicine records from Supabase
      const { data: supabaseMedicineRecords, error: medicineError } = await supabase
        .from('medicines')
        .select('name, price')

      if (medicineError) {
        throw new Error(`Supabase medicine error: ${medicineError.message}`)
      }

      if (supabaseDispenseRecords && supabaseDispenseRecords.length > 0) {
        dispenseRecords = supabaseDispenseRecords as Array<{
          dispensedDate: string
          medicineName: string
          quantity: number
          [key: string]: unknown
        }>
        medicineRecords = (supabaseMedicineRecords || []) as Array<{
          name: string
          price: number
          [key: string]: unknown
        }>
        console.log('Medicine dispense records fetched from Supabase for analytics')
      } else {
        throw new Error('No medicine dispense records from Supabase')
      }
    } catch (supabaseError) {
      console.error(
        'Error getting medicine dispense records from Supabase for analytics:',
        supabaseError
      )

      // Fallback to Excel
      if (fs.existsSync(medicineDispenseFilePath)) {
        const workbook = XLSX.readFile(medicineDispenseFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        dispenseRecords = XLSX.utils.sheet_to_json(worksheet)

        //get medicine records
        if (fs.existsSync(medicinesFilePath)) {
          const workbook2 = XLSX.readFile(medicinesFilePath)
          const sheetName2 = workbook2.SheetNames[0]
          const worksheet2 = workbook2.Sheets[sheetName2]
          medicineRecords = XLSX.utils.sheet_to_json(worksheet2)
        }
        console.log('Falling back to Excel for medicine dispense analytics data')
      }
    }

    if (dispenseRecords.length > 0) {
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

    // Get optical dispense records - try Supabase first, fallback to Excel
    let opticalDispenseRecords: Array<{
      dispensedAt: string
      opticalType: string
      brand: string
      quantity: number
      price: number
      [key: string]: unknown
    }> = []

    try {
      // Try to get optical dispense records from Supabase first
      const { data: supabaseOpticalRecords, error } = await supabase
        .from('optical_dispense_records')
        .select('*')
        .gte('dispensedAt', start.toISOString().split('T')[0])
        .lte('dispensedAt', end.toISOString().split('T')[0])
        .order('dispensedAt', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseOpticalRecords && supabaseOpticalRecords.length > 0) {
        opticalDispenseRecords = supabaseOpticalRecords as Array<{
          dispensedAt: string
          opticalType: string
          brand: string
          quantity: number
          price: number
          [key: string]: unknown
        }>
        console.log('Optical dispense records fetched from Supabase for analytics')
      } else {
        throw new Error('No optical dispense records from Supabase')
      }
    } catch (supabaseError) {
      console.error(
        'Error getting optical dispense records from Supabase for analytics:',
        supabaseError
      )

      // Fallback to Excel
      if (fs.existsSync(opticalDispenseFilePath)) {
        const workbook = XLSX.readFile(opticalDispenseFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        opticalDispenseRecords = XLSX.utils.sheet_to_json(worksheet)
        console.log('Falling back to Excel for optical dispense analytics data')
      }
    }

    if (opticalDispenseRecords.length > 0) {
      //formated records
      const formattedRecords = opticalDispenseRecords.map((record) => ({
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

    // Get operations data - try Supabase first, fallback to Excel
    let operations: Array<{
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
    }> = []

    try {
      // Try to get operations from Supabase first
      const { data: supabaseOperations, error } = await supabase
        .from('operations')
        .select('*')
        .gte('dateOfAdmit', start.toISOString().split('T')[0])
        .lte('dateOfAdmit', end.toISOString().split('T')[0])
        .order('dateOfAdmit', { ascending: false })

      if (error) {
        throw new Error(`Supabase error: ${error.message}`)
      }

      if (supabaseOperations && supabaseOperations.length > 0) {
        operations = supabaseOperations as Array<{
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
        }>
        console.log('Operations data fetched from Supabase for analytics')
      } else {
        throw new Error('No operations data from Supabase')
      }
    } catch (supabaseError) {
      console.error('Error getting operations from Supabase for analytics:', supabaseError)

      // Fallback to Excel
      if (fs.existsSync(operationsFilePath)) {
        const workbook = XLSX.readFile(operationsFilePath)
        const sheetName = workbook.SheetNames[0]
        const worksheet = workbook.Sheets[sheetName]
        // Field names from Excel: patientId, patientName, dateOfAdmit, timeOfAdmit, dateOfOperation, timeOfOperation,
        // dateOfDischarge, timeOfDischarge, operationDetails, operationProcedure, provisionDiagnosis, reviewOn, operatedBy, id
        operations = XLSX.utils.sheet_to_json(worksheet)
        console.log('Falling back to Excel for operations analytics data')
      }
    }

    if (operations.length > 0) {
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

    // Calculate patient counts by date using already fetched data
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

    // Calculate revenue by date from prescriptions using already fetched data
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

    // Calculate medicine dispense by date using already fetched data
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
          const medicine = medicineName
            ? medicineRecords.find((m) => m.name === medicineName)
            : null
          if (medicine) {
            const medicineRevenue = (medicine.price || 0) * quantity
            const currentRevenue = revenueByDate.get(dateString) || 0
            revenueByDate.set(dateString, currentRevenue + medicineRevenue)
          }
        }
      }
    })

    // Calculate optical sales by date using already fetched data
    opticalDispenseRecords.forEach((record) => {
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

    // Add operations revenue to the revenue by date using already fetched data
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

// Dropdown Options Management with Supabase
// Table: dropdown_options (columns: id, field_name, option_value, created_at)

// Fallback file path for when Supabase is unavailable
const dropdownOptionsPath = join(__dirname, '../../renderer/src/utils/dropdownOptions.ts')

// Helper function to add option to file system (fallback)
const addDropdownOptionToFile = async (
  fieldName: string,
  newValue: string
): Promise<{ success: boolean; message?: string; error?: string }> => {
  try {
    const fileContent = fs.readFileSync(dropdownOptionsPath, 'utf8')

    let arrayName = ''
    switch (fieldName) {
      case 'doctorName':
        arrayName = 'doctorOptions'
        break
      case 'department':
        arrayName = 'departmentOptions'
        break
      case 'referredBy':
        arrayName = 'referredByOptions'
        break
      default:
        return { success: false, error: 'Invalid field name' }
    }

    const arrayRegex = new RegExp(`export const ${arrayName} = \\[([\\s\\S]*?)\\]`, 'm')
    const match = fileContent.match(arrayRegex)

    if (!match) {
      return { success: false, error: `Array ${arrayName} not found` }
    }

    const currentArrayContent = match[1]
    const trimmedValue = newValue.trim()

    // Check if value already exists
    if (
      currentArrayContent.toLowerCase().includes(`'${trimmedValue.toLowerCase()}'`) ||
      currentArrayContent.toLowerCase().includes(`"${trimmedValue.toLowerCase()}"`)
    ) {
      return { success: true, message: 'Value already exists' }
    }

    // Add the new value
    const newArrayContent =
      currentArrayContent.trim() + (currentArrayContent.trim() ? ',\n' : '') + `  '${trimmedValue}'`
    const newFileContent = fileContent.replace(
      arrayRegex,
      `export const ${arrayName} = [\n${newArrayContent}\n]`
    )

    fs.writeFileSync(dropdownOptionsPath, newFileContent, 'utf8')
    console.log(`Added '${trimmedValue}' to ${arrayName} (file fallback)`)
    return { success: true, message: 'Option added successfully (file fallback)' }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// Helper function to get options from file system (fallback)
const getDropdownOptionsFromFile = async (
  fieldName: string
): Promise<{ success: boolean; options?: string[]; error?: string }> => {
  try {
    const fileContent = fs.readFileSync(dropdownOptionsPath, 'utf8')

    let arrayName = ''
    switch (fieldName) {
      case 'doctorName':
        arrayName = 'doctorOptions'
        break
      case 'department':
        arrayName = 'departmentOptions'
        break
      case 'referredBy':
        arrayName = 'referredByOptions'
        break
      default:
        return { success: false, error: 'Invalid field name' }
    }

    const arrayRegex = new RegExp(`export const ${arrayName} = \\[([\\s\\S]*?)\\]`, 'm')
    const match = fileContent.match(arrayRegex)

    if (!match) {
      return { success: false, error: `Array ${arrayName} not found` }
    }

    const arrayContent = match[1]
    const values = arrayContent
      .split(',\n')
      .map((line) => line.trim())
      .filter((line) => line.startsWith("'") || line.startsWith('"'))
      .map((line) => line.slice(1, -1))
      .filter((value) => value.length > 0)

    return { success: true, options: values }
  } catch (error) {
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
}

// Add new option to dropdown
ipcMain.handle('addDropdownOption', async (_, fieldName: string, newValue: string) => {
  try {
    if (!newValue || !newValue.trim()) {
      return { success: false, error: 'Value cannot be empty' }
    }

    const trimmedValue = newValue.trim()

    // Validate field name
    const validFields = [
      'doctorName',
      'department',
      'referredBy',
      'medicineOptions',
      'presentComplainOptions',
      'previousHistoryOptions',
      'othersOptions',
      'others1Options'
    ]
    if (!validFields.includes(fieldName)) {
      return { success: false, error: 'Invalid field name' }
    }

    try {
      // First, check if the value already exists in Supabase (case-insensitive)
      const { data: existingOptions, error: checkError } = await supabase
        .from('dropdown_options')
        .select('option_value')
        .eq('field_name', fieldName)
        .ilike('option_value', trimmedValue)
        .limit(1)

      if (checkError) {
        console.warn('Supabase check failed, falling back to file system:', checkError.message)
        return await addDropdownOptionToFile(fieldName, trimmedValue)
      }

      if (existingOptions && existingOptions.length > 0) {
        return { success: true, message: 'Value already exists' }
      }

      // Add new option to Supabase
      const { error: insertError } = await supabase.from('dropdown_options').insert({
        field_name: fieldName,
        option_value: trimmedValue
      })

      if (insertError) {
        console.warn('Supabase insert failed, falling back to file system:', insertError.message)
        return await addDropdownOptionToFile(fieldName, trimmedValue)
      }

      console.log(`Added '${trimmedValue}' to ${fieldName} options in Supabase`)
      return { success: true, message: 'Option added successfully' }
    } catch (supabaseError) {
      console.warn('Supabase operation failed, falling back to file system:', supabaseError)
      return await addDropdownOptionToFile(fieldName, trimmedValue)
    }
  } catch (error) {
    console.error('Error adding dropdown option:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// Get current dropdown options
ipcMain.handle('getDropdownOptions', async (_, fieldName: string) => {
  try {
    // Validate field name
    const validFields = [
      'doctorName',
      'department',
      'referredBy',
      'medicineOptions',
      'presentComplainOptions',
      'previousHistoryOptions',
      'othersOptions',
      'others1Options'
    ]
    if (!validFields.includes(fieldName)) {
      return { success: false, error: 'Invalid field name' }
    }

    try {
      // Try to get options from Supabase first
      const { data: options, error } = await supabase
        .from('dropdown_options')
        .select('option_value')
        .eq('field_name', fieldName)
        .order('option_value', { ascending: true })

      if (error) {
        console.warn('Supabase fetch failed, falling back to file system:', error.message)
        return await getDropdownOptionsFromFile(fieldName)
      }

      const values = options?.map((item) => item.option_value) || []

      // If no options in Supabase, fall back to file system
      if (values.length === 0) {
        console.log(`No options found in Supabase for ${fieldName}, falling back to file system`)
        return await getDropdownOptionsFromFile(fieldName)
      }

      return { success: true, options: values }
    } catch (supabaseError) {
      console.warn('Supabase operation failed, falling back to file system:', supabaseError)
      return await getDropdownOptionsFromFile(fieldName)
    }
  } catch (error) {
    console.error('Error getting dropdown options:', error)
    return { success: false, error: error instanceof Error ? error.message : String(error) }
  }
})

// Open PDF in a new BrowserWindow
ipcMain.handle('openPdfInWindow', async (_, pdfBuffer: Uint8Array) => {
  try {
    // Create a temporary file path
    const tempDir = path.join(os.tmpdir(), 'sheh-docsile-pdf')

    // Create directory if it doesn't exist
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true })
    }

    // Generate a unique filename
    const tempFile = path.join(tempDir, `receipt-${Date.now()}.pdf`)

    // Write the PDF buffer to the temporary file
    fs.writeFileSync(tempFile, Buffer.from(pdfBuffer))

    // Create a new browser window
    const pdfWindow = new BrowserWindow({
      width: 800,
      height: 1000,
      title: 'Prescription Receipt',
      autoHideMenuBar: true
    })

    // Load the PDF file
    await pdfWindow.loadURL(`file://${tempFile}`)

    // Clean up the file when the window is closed
    pdfWindow.on('closed', () => {
      try {
        if (fs.existsSync(tempFile)) {
          fs.unlinkSync(tempFile)
        }
      } catch (error) {
        console.error('Error deleting temporary PDF file:', error)
      }
    })

    return { success: true }
  } catch (error) {
    console.error('Error opening PDF in window:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : String(error)
    }
  }
})
