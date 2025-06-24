import React, { useState, useEffect } from 'react'
import PrescriptionForm from '../components/prescriptions/PrescriptionForm'
import PrescriptionTable from '../components/prescriptions/PrescriptionTable'
import PrescriptionEditModal from '../components/prescriptions/PrescriptionEditModal'
import ReceiptForm, { Patient as ReceiptFormPatient } from '../components/prescriptions/ReceiptForm'
import ReadingForm from '../components/prescriptions/ReadingForm'

// Define the Prescription type
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Patient type
type Patient = {
  'PATIENT ID': string
  'GUARDIAN NAME': string
  DOB: string
  AGE: number
  GENDER: string
  'PHONE NUMBER': string
  ADDRESS: string
  [key: string]: unknown
}

// Define the window API interface for TypeScript
declare global {
  interface Window {
    api: {
      getPatients: () => Promise<Patient[]>
      getPrescriptions: () => Promise<Prescription[]>
      addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
      updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
      deletePrescription: (id: string) => Promise<void>
      searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>
    }
  }
}

const Prescriptions: React.FC = () => {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [patients, setPatients] = useState<Patient[]>([])
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPrescription, setEditingPrescription] = useState<Prescription | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [showReceiptForm, setShowReceiptForm] = useState(false)
  const [showReadingForm, setShowReadingForm] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  // Track the current active receipt to link prescriptions and readings to it
  const [currentReceipt, setCurrentReceipt] = useState<Prescription | null>(null)

  // Load prescriptions and patients on component mount
  useEffect(() => {
    loadPrescriptions()
    loadPatients()
  }, [])

  // Function to load patients from the backend
  const loadPatients = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPatients()
      setPatients(data)
    } catch (err) {
      console.error('Error loading patients:', err)
      setError('Failed to load patients')
    } finally {
      setLoading(false)
    }
  }

  // Function to load prescriptions from the backend
  const loadPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPrescriptions()
      setPrescriptions(data)
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle adding a new prescription
  const handleAddPrescription = async (formData: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      
      // If we have a found patient from search, add their details to the prescription
      let patientDetails = {}
      if (foundPatient) {
        patientDetails = {
          'PATIENT ID': foundPatient['PATIENT ID'] || '',
          'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || '',
          'PHONE NUMBER': foundPatient['PHONE NUMBER'] || '',
          AGE: foundPatient.AGE || '',
          GENDER: foundPatient.GENDER || '',
          ADDRESS: foundPatient.ADDRESS || ''
        }
      }
      
      // If we have a current receipt, link this prescription to it
      if (currentReceipt) {
        const receiptId = typeof currentReceipt.id === 'string' ? currentReceipt.id : ''
        const patientId = typeof currentReceipt.patientId === 'string' ? currentReceipt.patientId : ''
        
        const prescriptionData = {
          ...formData,
          ...patientDetails, // Include patient details from search
          TYPE: 'PRESCRIPTION',
          receiptId, // Link to the receipt
          patientId, // Use the patient from the receipt
          DATE: formData.DATE || currentReceipt.DATE || new Date().toISOString().split('T')[0] // Use receipt date if available
        }
        const newPrescription = await window.api.addPrescription(prescriptionData)
        console.log('Added prescription with receipt link and patient details:', newPrescription)
      } else {
        // If no receipt exists, just add the prescription with patient details
        const prescriptionData = {
          ...formData,
          ...patientDetails, // Include patient details from search
          TYPE: 'PRESCRIPTION',
          DATE: formData.DATE || new Date().toISOString().split('T')[0] // Ensure we have a date
        }
        const newPrescription = await window.api.addPrescription(prescriptionData)
        console.log('Added standalone prescription with patient details:', newPrescription)
      }
      
      await loadPrescriptions()
      setShowAddForm(false)
      setError('')
    } catch (err) {
      console.error('Error adding prescription:', err)
      setError('Failed to add prescription')
    } finally {
      setLoading(false)
    }
  }

  // Convert Patient type from Prescriptions.tsx to the Patient interface expected by ReceiptForm.tsx
  const convertToReceiptFormPatient = (patient: Patient): ReceiptFormPatient => {
    return {
      id: patient['PATIENT ID'] || '',
      date: new Date().toISOString().split('T')[0],
      patientId: patient['PATIENT ID'] || '',
      name: patient['GUARDIAN NAME'] || '',
      guardian: patient['GUARDIAN NAME'] || '',
      phone: patient['PHONE NUMBER'] || '',
      age: String(patient.AGE || ''),
      gender: patient.GENDER || '',
      address: patient.ADDRESS || ''
    }
  }

  // Function to handle adding a new receipt
  const handleAddReceipt = async (formData: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      
      // Ensure patientId is a string
      const patientId = formData.patientId 
        ? typeof formData.patientId === 'string' 
          ? formData.patientId 
          : String(formData.patientId)
        : ''
      
      // If we have a found patient from search, add their details to the receipt
      let patientDetails = {}
      if (foundPatient) {
        patientDetails = {
          'PATIENT ID': foundPatient['PATIENT ID'] || '',
          'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || '',
          'PHONE NUMBER': foundPatient['PHONE NUMBER'] || '',
          'AGE': foundPatient.AGE || '',
          'GENDER': foundPatient.GENDER || '',
          'ADDRESS': foundPatient.ADDRESS || ''
        }
      }
      
      // Add a receipt type field to differentiate from prescriptions
      const receiptData = {
        ...formData,
        ...patientDetails, // Include patient details from search
        patientId,
        TYPE: 'RECEIPT',
        DATE: formData.DATE || new Date().toISOString().split('T')[0] // Ensure we have a date
      }
      
      // Add the receipt and get the newly created receipt with its ID
      const newReceipt = await window.api.addPrescription(receiptData) 
      console.log('Added receipt with patient details:', newReceipt)
      
      // Set this as the current receipt we're working with
      setCurrentReceipt(newReceipt)
      
      // Hide the receipt form after creating
      setShowReceiptForm(false)
      
      await loadPrescriptions()
      setError('')
    } catch (err) {
      console.error('Error adding receipt:', err)
      setError('Failed to add receipt')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle adding a new eye reading
  const handleAddReading = async (reading: Omit<Prescription, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      setError('')

      // If we have a found patient from search, add their details to the reading
      let patientDetails = {}
      if (foundPatient) {
        patientDetails = {
          'PATIENT ID': foundPatient['PATIENT ID'] || '',
          'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || '',
          'PHONE NUMBER': foundPatient['PHONE NUMBER'] || '',
          AGE: foundPatient.AGE || '',
          GENDER: foundPatient.GENDER || '',
          ADDRESS: foundPatient.ADDRESS || ''
        }
      }

      // If we have a current receipt, link this reading to it
      if (currentReceipt) {
        const receiptId = typeof currentReceipt.id === 'string' ? currentReceipt.id : ''
        const patientId = typeof currentReceipt.patientId === 'string' ? currentReceipt.patientId : ''
        
        // Create reading data with receipt link and patient details
        const readingData = {
          ...reading,
          ...patientDetails,
          TYPE: 'READING',
          receiptId,
          patientId,
          DATE: reading.DATE || currentReceipt.DATE || new Date().toISOString().split('T')[0]
        }
        
        const newReading = await window.api.addPrescription(readingData)
        console.log('Added reading with receipt link and patient details:', newReading)
      } else {
        // If no receipt exists, just add the reading with patient details
        const readingData = {
          ...reading,
          ...patientDetails,
          TYPE: 'READING',
          DATE: reading.DATE || new Date().toISOString().split('T')[0]
        }
        
        const newReading = await window.api.addPrescription(readingData)
        console.log('Added standalone reading with patient details:', newReading)
      }

      // Refresh prescriptions list
      await loadPrescriptions()
      setShowReadingForm(false)
    } catch (err) {
      console.error('Error adding reading:', err)
      setError('Failed to add reading')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating a prescription
  const handleUpdatePrescription = async (prescription: Prescription): Promise<void> => {
    try {
      setLoading(true)
      const id = prescription.id
      const updatedPrescription = await window.api.updatePrescription(id, prescription)
      setPrescriptions(prescriptions.map((p) => (p.id === id ? updatedPrescription : p)))
      setIsModalOpen(false)
      setEditingPrescription(null)
      setError('')
    } catch (err) {
      console.error('Error updating prescription:', err)
      setError('Failed to update prescription')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a prescription
  const handleDeletePrescription = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this prescription?')) {
      try {
        setLoading(true)
        await window.api.deletePrescription(id)
        setPrescriptions(prescriptions.filter((p) => p.id !== id))
        setError('')
      } catch (err) {
        console.error('Error deleting prescription:', err)
        setError('Failed to delete prescription')
      } finally {
        setLoading(false)
      }
    }
  }

  // Function to open edit modal
  const openEditModal = (prescription: Prescription): void => {
    setEditingPrescription(prescription)
    setIsModalOpen(true)
  }

  // Function to find receipts for a patient
  const findReceiptsForPatient = (patientId: string): Prescription[] => {
    return prescriptions.filter(
      (p) => p.patientId === patientId && p.TYPE === 'RECEIPT'
    )
  }

  // Function to handle patient search
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setFoundPatient(null)
      setCurrentReceipt(null)
      
      // Close any open forms first
      setShowAddForm(false)
      setShowReadingForm(false)

      if (!searchTerm.trim()) {
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue)
      console.log('Available patients:', patients)

      // First try to find an exact match by patient ID
      let matchedPatient = patients.find((patient) => {
        const patientId = String(patient['PATIENT ID'] || '').toLowerCase()
        return patientId === searchValue
      })

      // If no exact match by ID, try partial match on any field
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          // Check all properties of the patient object for matches
          return Object.entries(patient).some(([key, value]) => {
            // Skip null/undefined values
            if (value == null) return false

            // Convert value to string and check if it includes the search term
            const stringValue = String(value).toLowerCase()
            const matches = stringValue.includes(searchValue)

            if (matches) {
              console.log(`Match found in field ${key}: ${stringValue}`)
            }

            return matches
          })
        })
      }

      if (matchedPatient) {
        console.log('Found patient:', matchedPatient)
        setFoundPatient(matchedPatient)
        
        // Check if this patient has any existing receipts
        const patientId = String(matchedPatient['PATIENT ID'] || '')
        const patientReceipts = findReceiptsForPatient(patientId)
        console.log('Existing receipts for patient:', patientReceipts)
        
        // If there are existing receipts, set the most recent one as current
        if (patientReceipts.length > 0) {
          // Sort by date descending and take the most recent
          const sortedReceipts = [...patientReceipts].sort((a, b) => {
            const dateA = new Date(String(a.DATE || '')).getTime()
            const dateB = new Date(String(b.DATE || '')).getTime()
            return dateB - dateA
          })
          
          setCurrentReceipt(sortedReceipts[0])
          console.log('Set current receipt to:', sortedReceipts[0])
        } else {
          // If no receipts exist, automatically show the receipt form
          setShowReceiptForm(true)
          console.log('Automatically showing receipt form for new patient')
        }
        
        setError('')
      } else {
        setFoundPatient(null)
        setError('No patients found')
      }
    } catch (err) {
      console.error('Error searching patients:', err)
      setError('Failed to search patients')
      setFoundPatient(null)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Receipts & Prescriptions</h1>
            <p className="text-sm text-gray-500">Sri Harshini Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{showAddForm ? 'Hide Form' : 'New Entry'}</span>
            </button>
            <button
              onClick={() => (window.location.hash = '/dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {/* Search Bar */}
        <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center gap-4">
            <div className="flex-grow">
              <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-1">
                Search Patients
              </label>
              <input
                type="text"
                id="search"
                placeholder="Search by Patient ID, Name, or Phone Number"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault()
                    handleSearch(e)
                  }
                }}
              />
            </div>
            <div className="flex items-end">
              <button
                onClick={(e) => handleSearch(e)}
                type="button"
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Search</span>
              </button>
              <button
                onClick={() => {
                  setSearchTerm('')
                  setFoundPatient(null)
                  setError('')
                }}
                className="ml-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Clear</span>
              </button>
            </div>
          </div>
        </div>

        {/* Patient Details Display */}
        {foundPatient && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" />
                </svg>
                Patient Details
              </h2>
              <button
                onClick={() => setFoundPatient(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>

            {/* Patient Information Table */}
            <div className="overflow-x-auto mb-6">
              <table className="min-w-full divide-y divide-gray-200">
                <tbody className="bg-white divide-y divide-gray-200">
                  {/* Display all patient fields dynamically */}
                  {Object.entries(foundPatient).map(([key, value], index) => {
                    // Skip the id field as it's internal
                    if (key === 'id') return null

                    // Create a new row for every two fields
                    if (index % 2 === 0) {
                      const nextKey = Object.keys(foundPatient)[index + 1]
                      const nextValue = nextKey ? foundPatient[nextKey] : null

                      // Format the field names for display
                      const formatFieldName = (field: string): string => {
                        return field
                          .replace(/_/g, ' ')
                          .split(' ')
                          .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
                          .join(' ')
                      }

                      return (
                        <tr key={key}>
                          <td className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                            {formatFieldName(key)}
                          </td>
                          <td className="px-4 py-3 text-sm text-gray-900">
                            {value !== null && value !== undefined ? String(value) : 'N/A'}
                          </td>

                          {nextKey && nextKey !== 'id' && (
                            <>
                              <td className="px-4 py-3 text-sm font-medium text-gray-500 bg-gray-50">
                                {formatFieldName(nextKey)}
                              </td>
                              <td className="px-4 py-3 text-sm text-gray-900">
                                {nextValue !== null && nextValue !== undefined
                                  ? String(nextValue)
                                  : 'N/A'}
                              </td>
                            </>
                          )}
                        </tr>
                      )
                    }
                    return null
                  })}
                </tbody>
              </table>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mt-6">
              {/* Show existing receipts for the patient if any */}
              {foundPatient && !currentReceipt && (
                <div className="w-full mb-4">
                  {/* Check for existing receipts */}
                  {(() => {
                    // Make sure we have a valid patient ID
                    const patientId = typeof foundPatient.id === 'string' ? foundPatient.id : ''
                    const patientReceipts = findReceiptsForPatient(patientId)
                    
                    if (patientReceipts.length > 0) {
                      return (
                        <div className="bg-white p-4 rounded-md shadow-sm mb-4">
                          <h3 className="text-lg font-medium text-gray-800 mb-2">
                            Existing Receipts
                          </h3>
                          <p className="text-sm text-gray-600 mb-3">
                            This patient has {patientReceipts.length} existing receipt(s). You can
                            continue with an existing receipt or create a new one.
                          </p>
                          
                          <div className="space-y-2 mb-4">
                            {patientReceipts.map((receipt) => (
                              <div 
                                key={receipt.id}
                                className="border border-gray-200 rounded-md p-3 hover:bg-gray-50"
                              >
                                <div className="flex justify-between items-center">
                                  <div>
                                    <p className="font-medium">
                                      Receipt #
                                      {typeof receipt.id === 'string'
                                        ? receipt.id.substring(0, 8)
                                        : 'N/A'}
                                    </p>
                                    <p className="text-sm text-gray-500">
                                      Date: {' '}
                                      {new Date(
                                        receipt.createdAt && typeof receipt.createdAt === 'string'
                                          ? receipt.createdAt
                                          : receipt.createdAt && typeof receipt.createdAt === 'number'
                                            ? receipt.createdAt
                                            : Date.now()
                                      ).toLocaleDateString()}
                                    </p>
                                  </div>
                                  <button
                                    onClick={() => {
                                      // Set this receipt as the current receipt
                                      setCurrentReceipt(receipt)
                                      // Close any open forms
                                      setShowAddForm(false)
                                      setShowReceiptForm(false)
                                      setShowReadingForm(false)
                                    }}
                                    className="px-3 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-md text-sm font-medium"
                                  >
                                    Continue with this receipt
                                  </button>
                                </div>
                              </div>
                            ))}
                          </div>
                          
                          <div className="border-t border-gray-200 pt-3 mt-2">
                            <button
                              onClick={() => {
                                // Close other forms if open
                                if (showAddForm) setShowAddForm(false)
                                if (showReadingForm) setShowReadingForm(false)
                                // Open receipt form
                                setShowReceiptForm(true)
                              }}
                              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                className="h-5 w-5"
                                viewBox="0 0 20 20"
                                fill="currentColor"
                              >
                                <path
                                  fillRule="evenodd"
                                  d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                  clipRule="evenodd"
                                />
                              </svg>
                              <span>Create New Receipt</span>
                            </button>
                          </div>
                        </div>
                      )
                    } else {
                      // No existing receipts, show the create receipt button prominently
                      return (
                        <div className="bg-green-50 p-4 rounded-md shadow-sm mb-4 border border-green-200">
                          <h3 className="text-lg font-medium text-gray-800 mb-2 flex items-center">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5 mr-2 text-green-500"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            Patient Found - Create Receipt First
                          </h3>
                          <p className="text-sm text-gray-600 mb-4">
                            Please create a receipt for this patient before adding prescriptions or readings.
                          </p>
                          <button
                            onClick={() => {
                              // Close other forms if open
                              if (showAddForm) setShowAddForm(false)
                              if (showReadingForm) setShowReadingForm(false)
                              // Open receipt form
                              setShowReceiptForm(true)
                            }}
                            className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              className="h-5 w-5"
                              viewBox="0 0 20 20"
                              fill="currentColor"
                            >
                              <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                                clipRule="evenodd"
                              />
                            </svg>
                            <span>Create Receipt</span>
                          </button>
                        </div>
                      )
                    }
                  })()} 
                </div>
              )}
              
              {/* Show Prescription and Reading buttons only after a receipt has been created */}
              {currentReceipt && (
                <>
                  <button
                    onClick={() => {
                      // Close other forms if open
                      if (showReceiptForm) setShowReceiptForm(false)
                      if (showReadingForm) setShowReadingForm(false)
                      // Open prescription form
                      setShowAddForm(true)
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                      <path
                        fillRule="evenodd"
                        d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Add Prescription</span>
                  </button>

                  <button
                    onClick={() => {
                      // Close other forms if open
                      if (showAddForm) setShowAddForm(false)
                      if (showReceiptForm) setShowReceiptForm(false)
                      // Open reading form
                      setShowReadingForm(true)
                    }}
                    className="px-4 py-2 bg-purple-500 hover:bg-purple-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                    </svg>
                    <span>Add Eye Reading</span>
                  </button>
                </>
              )}
              
              {/* If there's a current receipt, show a button to finish and reset */}
              {currentReceipt && (
                <button
                  onClick={() => {
                    // Reset everything
                    setCurrentReceipt(null)
                    setFoundPatient(null)
                    setShowAddForm(false)
                    setShowReceiptForm(false)
                    setShowReadingForm(false)
                  }}
                  className="px-4 py-2 bg-gray-500 hover:bg-gray-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>Complete Patient Visit</span>
                </button>
              )}
            </div>
          </div>
        )}

        {/* Add Prescription Form */}
        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                  <path
                    fillRule="evenodd"
                    d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                    clipRule="evenodd"
                  />
                </svg>
                New Prescription
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <PrescriptionForm
              onSubmit={handleAddPrescription}
              onCancel={() => setShowAddForm(false)}
              prescriptionCount={prescriptions.length}
              patients={patients}
              selectedPatient={foundPatient}
            />
          </div>
        )}

        {/* Add Receipt Form */}
        {showReceiptForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-green-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                    clipRule="evenodd"
                  />
                </svg>
                New Receipt
              </h2>
              <button
                onClick={() => setShowReceiptForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <ReceiptForm
              onSubmit={handleAddReceipt}
              onCancel={() => setShowReceiptForm(false)}
              patients={patients.map(convertToReceiptFormPatient)}
              selectedPatient={foundPatient ? convertToReceiptFormPatient(foundPatient) : null}
            />
          </div>
        )}

        {/* Add Reading Form */}
        {showReadingForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-purple-500"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path d="M2 11a1 1 0 011-1h2a1 1 0 011 1v5a1 1 0 01-1 1H3a1 1 0 01-1-1v-5zM8 7a1 1 0 011-1h2a1 1 0 011 1v9a1 1 0 01-1 1H9a1 1 0 01-1-1V7zM14 4a1 1 0 011-1h2a1 1 0 011 1v12a1 1 0 01-1 1h-2a1 1 0 01-1-1V4z" />
                </svg>
                New Eye Reading
              </h2>
              <button
                onClick={() => setShowReadingForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <ReadingForm
              onSubmit={handleAddReading}
              onCancel={() => setShowReadingForm(false)}
              patients={patients.map(convertToReceiptFormPatient)}
              selectedPatient={foundPatient ? convertToReceiptFormPatient(foundPatient) : null}
            />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-medium text-gray-800 flex items-center">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 mr-2 text-blue-500"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path
                  fillRule="evenodd"
                  d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z"
                  clipRule="evenodd"
                />
              </svg>
              Prescription Records
            </h2>
            <div className="text-sm text-gray-500">
              {!loading && prescriptions.length > 0 && (
                <span>
                  {prescriptions.length} {prescriptions.length === 1 ? 'record' : 'records'} found
                </span>
              )}
            </div>
          </div>
          {loading && (
            <div className="flex items-center justify-center py-10">
              <div className="flex flex-col items-center">
                <svg
                  className="animate-spin h-8 w-8 text-blue-500"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle
                    className="opacity-25"
                    cx="12"
                    cy="12"
                    r="10"
                    stroke="currentColor"
                    strokeWidth="3"
                  ></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                <p className="mt-3 text-gray-500">Loading prescriptions...</p>
              </div>
            </div>
          )}
          {!loading && prescriptions.length === 0 ? (
            <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-16 w-16 mx-auto text-gray-300 mb-4"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No prescriptions found</p>
              <p className="text-gray-500 mb-6">
                Click the &quot;New Entry&quot; button to create your first prescription record
              </p>
              <button
                onClick={() => setShowAddForm(true)}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm inline-flex items-center"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-1.5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                    clipRule="evenodd"
                  />
                </svg>
                New Entry
              </button>
            </div>
          ) : (
            !loading && (
              <div>
                <PrescriptionTable
                  prescriptions={prescriptions}
                  onEdit={openEditModal}
                  onDelete={handleDeletePrescription}
                />
              </div>
            )
          )}
        </div>
      </main>

      {isModalOpen && editingPrescription && (
        <PrescriptionEditModal
          prescription={editingPrescription}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPrescription(null)
          }}
          onSave={handleUpdatePrescription}
          prescriptionCount={prescriptions.length}
        />
      )}
    </div>
  )
}

export default Prescriptions
