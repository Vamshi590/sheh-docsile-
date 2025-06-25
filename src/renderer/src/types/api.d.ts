export interface Patient {
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

export interface Prescription {
  id: string
  [key: string]: unknown
}

export interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  assistants?: string
  anesthesia?: string
  anesthesiologist?: string
  preOpDiagnosis: string
  postOpDiagnosis?: string
  procedure: string
  findings?: string
  complications?: string
  implants?: string
  specimens?: string
  estimatedBloodLoss?: string
  fluids?: string
  postOpPlan?: string
  followUpDate?: string
  notes?: string
}

interface API {
  login: (username: string, password: string) => Promise<boolean>
  logout: () => Promise<void>

  // Prescription methods
  getPrescriptions: () => Promise<Prescription[]>
  addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
  updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
  deletePrescription: (id: string) => Promise<void>
  searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>

  // Patient methods
  getPatients: () => Promise<Patient[]>
  addPatient: (patient: Omit<Patient, 'id'>) => Promise<Patient>
  updatePatient: (id: string, patient: Patient) => Promise<Patient>
  deletePatient: (id: string) => Promise<void>
  searchPatients: (searchTerm: string) => Promise<Patient[]>

  // Operation methods
  getPatientOperations: (patientId: string) => Promise<Operation[]>
  saveOperation: (operation: Omit<Operation, 'id'>) => Promise<Operation>
  updateOperation: (id: string, operation: Operation) => Promise<Operation>
  deleteOperation: (id: string) => Promise<void>
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
