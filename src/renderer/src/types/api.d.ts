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

interface Prescription {
  id: string
  [key: string]: unknown
}

interface API {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>
  getPrescriptions: () => Promise<Prescription[]>
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
  updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
  deletePrescription: (id: string) => Promise<void>
  searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>
  getPatients: () => Promise<Patient[]>
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>
  updatePatient: (id: string, patient: Patient) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
  searchPatients: (searchTerm: string) => Promise<Patient[]>
}

declare global {
  interface Window {
    api: API
    electron: {
      ipcRenderer: {
        on: (channel: string, listener: (...args: unknown[]) => void) => void
        once: (channel: string, listener: (...args: unknown[]) => void) => void
        send: (channel: string, ...args: unknown[]) => void
      }
    }
  }
}

export {}
