import { ElectronAPI } from '@electron-toolkit/preload'

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

interface API {
  // Authentication
  login: (username: string, password: string) => Promise<boolean>

  // Patient Management
  getPatients: () => Promise<Patient[]>
  addPatient: (patient: Patient) => Promise<Patient>
  updatePatient: (id: string, patient: Patient) => Promise<Patient>
  deletePatient: (id: string) => Promise<boolean>
}

declare global {
  interface Window {
    electron: ElectronAPI
    api: API
  }
}
