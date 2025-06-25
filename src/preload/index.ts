import { contextBridge, ipcRenderer } from 'electron'
import { electronAPI } from '@electron-toolkit/preload'

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

interface Operation {
  id?: string
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
  [key: string]: unknown
}

// Custom APIs for renderer
const api = {
  // Authentication
  login: (username: string, password: string) => ipcRenderer.invoke('login', username, password),

  // Patient Management
  getPatients: () => ipcRenderer.invoke('getPatients'),
  addPatient: (patient: Patient) => ipcRenderer.invoke('addPatient', patient),
  updatePatient: (id: string, patient: Patient) => ipcRenderer.invoke('updatePatient', id, patient),
  deletePatient: (id: string) => ipcRenderer.invoke('deletePatient', id),

  // Prescriptions & Receipts Management
  getPrescriptions: () => ipcRenderer.invoke('getPrescriptions'),
  addPrescription: (prescription: Prescription) => ipcRenderer.invoke('addPrescription', prescription),
  updatePrescription: (id: string, prescription: Prescription) => 
    ipcRenderer.invoke('updatePrescription', id, prescription),
  deletePrescription: (id: string) => ipcRenderer.invoke('deletePrescription', id),
  searchPrescriptions: (searchTerm: string) => ipcRenderer.invoke('searchPrescriptions', searchTerm),
  
  // Operations Management
  getOperations: () => ipcRenderer.invoke('getOperations'),
  getPatientOperations: (patientId: string) => ipcRenderer.invoke('getPatientOperations', patientId),
  addOperation: (operation: Operation) => ipcRenderer.invoke('addOperation', operation),
  updateOperation: (id: string, operation: Operation) => ipcRenderer.invoke('updateOperation', id, operation),
  deleteOperation: (id: string) => ipcRenderer.invoke('deleteOperation', id),
  
  // Patient Search (used by multiple modules)
  searchPatients: (searchTerm: string) => ipcRenderer.invoke('searchPatients', searchTerm),
  
}

// Use `contextBridge` APIs to expose Electron APIs to
// renderer only if context isolation is enabled, otherwise
// just add to the DOM global.
if (process.contextIsolated) {
  try {
    contextBridge.exposeInMainWorld('electron', electronAPI)
    contextBridge.exposeInMainWorld('api', api)
  } catch (error) {
    console.error(error)
  }
} else {
  // @ts-ignore (define in dts)
  window.electron = electronAPI
  // @ts-ignore (define in dts)
  window.api = api
}
