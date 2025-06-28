import React, { useState, useEffect } from 'react'
import OperationForm from '../components/operations/OperationForm'

// Define Operation interface to match OperationForm component's type
interface Operation {
  id: string
  patientId: string
  patientName: string
  dateOfAdmit?: string
  timeOfAdmit?: string
  dateOfOperation?: string
  timeOfOperation?: string
  dateOfDischarge?: string
  timeOfDischarge?: string
  operationDetails?: string
  operationProcedure?: string
  provisionDiagnosis?: string
  part1?: string
  amount1?: string
  days1?: number
  part2?: string
  amount2?: string
  days2?: number
  part3?: string
  amount3?: string
  days3?: number
  part4?: string
  amount4?: string
  days4?: number
  part5?: string
  amount5?: string
  days5?: number
  part6?: string
  amount6?: string
  days6?: number
  part7?: string
  amount7?: string
  days7?: number
  part8?: string
  amount8?: string
  days8?: number
  part9?: string
  amount9?: string
  days9?: number
  part10?: string
  amount10?: string
  days10?: number
  reviewOn?: string
  totalAmount?: number
  modeOfPayment?: string
  pdeReOpticDisk?: string
  pdeReOpticMacula?: string
  pdeReOpticBloodVessels?: string
  pdeRePr?: string
  pdeLeOpticDisk?: string
  pdeLeOpticMacula?: string
  pdeLeOpticBloodVessels?: string
  pdeLePr?: string
  operatedBy?: string
  date?: string
  operationType?: string
  surgeon?: string
  preOpDiagnosis?: string
  procedure?: string
  [key: string]: unknown
}

// Define API interface for window.api
interface API {
  // Operation methods
  getOperations?: () => Promise<Operation[]>
  getPatientOperations?: (patientId: string) => Promise<Operation[]>
  addOperation?: (operation: Omit<Operation, 'id'>) => Promise<Operation>
  updateOperation?: (id: string, operation: Operation) => Promise<Operation>
  deleteOperation?: (id: string) => Promise<void>

  // Other methods that might be used
  getPatients?: () => Promise<Patient[]>
  searchPatients?: (searchTerm: string) => Promise<Patient[]>
}

// Define Patient type to match both modules
type Patient = {
  'PATIENT ID': string
  'PATIENT NAME'?: string
  'GUARDIAN NAME'?: string
  'PHONE NUMBER'?: string
  DOB?: string
  AGE?: number | string
  GENDER?: string
  ADDRESS?: string
  id?: string
  name?: string
  phone?: string
  [key: string]: unknown
}

// Define FormPatient type to match OperationForm component's expected Patient type
type FormPatient = {
  patientId: string
  name: string
  guardian?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  [key: string]: unknown
}

// Using Operation interface imported from api.d.ts

const Operations: React.FC = () => {
  const [selectedPatient, setSelectedPatient] = useState<Patient | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [patients, setPatients] = useState<Patient[]>([]) /* State for loading indicator */
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [foundPatient, setFoundPatient] = useState<Patient | null>(null)
  const [patientOperations, setPatientOperations] = useState<Operation[]>([])
  const [allOperations, setAllOperations] = useState<Operation[]>([])
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  const [showOperationForm, setShowOperationForm] = useState(false)

  // Load patients and operations on component mount
  useEffect(() => {
    loadPatients()
    loadAllOperations()
  }, [])

  // Function to load patients from the backend
  const loadPatients = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as API
      if (api.getPatients) {
        const data = await api.getPatients()
        setPatients(data)
        setError('')
      } else {
        console.error('getPatients method is not available')
        setError('Failed to load patients: API method not available')
      }
    } catch (err) {
      console.error('Error loading patients:', err)
      setError(`Failed to load patients: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Function to load all operations
  const loadAllOperations = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as API
      if (api.getOperations) {
        const operations = await api.getOperations()
        setAllOperations(operations)
      } else {
        console.error('getOperations method is not available')
        setError('Failed to load operations: API method not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError('Failed to load operations')
    } finally {
      setLoading(false)
    }
  }

  // Convert Patient to FormPatient for the OperationForm component
  const convertToFormPatient = (patient: Patient): FormPatient => {
    // Ensure all fields are of the correct type
    const patientId =
      typeof patient['PATIENT ID'] === 'string'
        ? patient['PATIENT ID']
        : typeof patient.patientId === 'string'
          ? patient.patientId
          : ''

    const name =
      typeof patient['PATIENT NAME'] === 'string'
        ? patient['PATIENT NAME']
        : typeof patient.name === 'string'
          ? patient.name
          : ''

    const guardian = typeof patient.guardian === 'string' ? patient.guardian : ''

    const phone = typeof patient.phone === 'string' ? patient.phone : ''

    const age =
      typeof patient.age === 'string' || typeof patient.age === 'number' ? patient.age : ''

    const gender = typeof patient.gender === 'string' ? patient.gender : ''

    const address = typeof patient.address === 'string' ? patient.address : ''

    console.log('Converting patient with ID:', patientId)

    return {
      patientId,
      name,
      guardian,
      phone,
      age,
      gender,
      address
    }
  }

  // Handle operation save (both add and update)
  const handleOperationSave = async (
    operation: Operation | Omit<Operation, 'id'>
  ): Promise<void> => {
    try {
      if ('id' in operation && operation.id) {
        // It's an update operation with a valid ID
        await handleUpdateOperation(operation as Operation)
      } else {
        // It's a new operation or has an invalid ID
        // Create a new operation without the ID to ensure we're adding a new operation
        const operationData = { ...operation } as Partial<Operation>
        // Delete any existing ID to force creation of a new operation
        delete operationData.id
        await handleAddOperation(operationData as Omit<Operation, 'id'>)
      }
    } catch (err) {
      console.error('Error in handleOperationSave:', err)
      setError(`Failed to save operation: ${err instanceof Error ? err.message : 'Unknown error'}`)
    }
  }

  // Handle operation delete
  const handleDeleteOperation = async (operationId: string): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as API
      if (api.deleteOperation) {
        await api.deleteOperation(operationId)
        setAllOperations(allOperations.filter((op) => op.id !== operationId))
        setPatientOperations(patientOperations.filter((op) => op.id !== operationId))
        setSelectedOperation(null)
      } else {
        console.error('deleteOperation method is not available')
        setError('Failed to delete operation: API method not available')
      }
    } catch (err) {
      console.error('Error deleting operation:', err)
      setError(
        `Failed to delete operation: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Handle selecting an operation for editing
  const handleOperationSelect = (operation: Operation): void => {
    setSelectedOperation(operation)
    setShowOperationForm(true)
  }

  // Handle adding a new operation
  const handleAddOperation = async (operationData: Omit<Operation, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as API
      if (api.addOperation) {
        const newOperation = await api.addOperation(operationData)
        setAllOperations([...allOperations, newOperation])
        if (
          selectedPatient &&
          operationData.patientId === (selectedPatient['PATIENT ID'] || selectedPatient.id)
        ) {
          setPatientOperations([...patientOperations, newOperation])
        }
        setShowOperationForm(false)
        setSelectedOperation(null)
      } else {
        console.error('addOperation method is not available')
        setError('Failed to add operation: API method not available')
      }
    } catch (err) {
      console.error('Error adding operation:', err)
      setError(`Failed to add operation: ${err instanceof Error ? err.message : 'Unknown error'}`)
    } finally {
      setLoading(false)
    }
  }

  // Handle updating an existing operation
  const handleUpdateOperation = async (operationData: Operation): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as API
      if (api.updateOperation) {
        const updatedOperation = await api.updateOperation(operationData.id, operationData)
        setAllOperations(
          allOperations.map((op) => (op.id === updatedOperation.id ? updatedOperation : op))
        )
        if (
          selectedPatient &&
          operationData.patientId === (selectedPatient['PATIENT ID'] || selectedPatient.id)
        ) {
          setPatientOperations(
            patientOperations.map((op) => (op.id === updatedOperation.id ? updatedOperation : op))
          )
        }
        setShowOperationForm(false)
        setSelectedOperation(null)
      } else {
        console.error('updateOperation method is not available')
        setError('Failed to update operation: API method not available')
      }
    } catch (err) {
      console.error('Error updating operation:', err)
      setError(
        `Failed to update operation: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  // Function to load operations for a specific patient
  const loadPatientOperations = async (patientId: string): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as API
      if (api.getPatientOperations) {
        const operations = await api.getPatientOperations(patientId)
        setPatientOperations(operations)
      } else {
        console.error('getPatientOperations method is not available')
        setError('Failed to load patient operations: API method not available')
      }
    } catch (err) {
      console.error('Error loading patient operations:', err)
      setError('Failed to load patient operations')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle patient search - modified to not automatically show operation form
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      setLoading(true)
      setError('') // Clear any previous errors
      setFoundPatient(null)
      setSelectedPatient(null)
      setPatientOperations([])
      setSelectedOperation(null)
      setShowOperationForm(false)

      if (!searchTerm.trim()) {
        setError('Please enter a search term')
        setLoading(false)
        return
      }

      const searchValue = searchTerm.toLowerCase().trim()
      console.log('Searching for:', searchValue)

      if (!patients || patients.length === 0) {
        console.log('No patients available in the system')
        setError('No patient data available. Please check the patient database.')
        setLoading(false)
        return
      }

      console.log(`Searching through ${patients.length} patients`)

      // First try to find an exact match by patient ID
      let matchedPatient = patients.find((patient) => {
        const patientId = String(patient['PATIENT ID'] || patient.patientId || '').toLowerCase()
        return patientId === searchValue
      })

      // If no exact match by ID, try partial match on name
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          const patientName = String(patient['PATIENT NAME'] || patient.name || '').toLowerCase()
          return patientName.includes(searchValue)
        })
      }

      // If still no match, try partial match on phone
      if (!matchedPatient) {
        matchedPatient = patients.find((patient) => {
          const phoneNumber = String(patient['PHONE NUMBER'] || patient.phone || '').toLowerCase()
          return phoneNumber.includes(searchValue)
        })
      }

      // If still no match, try partial match on any field
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
        setSelectedPatient(matchedPatient)

        // Fetch operations for this patient
        const patientId = String(matchedPatient['PATIENT ID'] || matchedPatient.patientId || '')
        if (!patientId) {
          console.error('Patient ID is missing in the matched patient')
          setError('Patient ID is missing. Cannot fetch operations.')
          setLoading(false)
          return
        }

        // Load operations for the found patient
        await loadPatientOperations(patientId)
      } else {
        console.log('No matching patient found for:', searchValue)
        setError(`No patients found matching "${searchTerm}"`)
      }
    } catch (err) {
      console.error('Error searching patients:', err)
      setError(
        `Error searching for patients: ${err instanceof Error ? err.message : 'Unknown error'}`
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Operations / Surgeries</h1>
            <p className="text-sm text-gray-500">Sri Harshini Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
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
        <div className="flex-1 overflow-auto">
          {/* Patient Search Section */}
          <div className="mb-6 bg-white p-4 rounded-lg shadow-sm border border-gray-100">
            <label htmlFor="search" className="block text-sm font-medium text-gray-700 mb-2">
              Search Patients
            </label>
            <div className="flex items-center gap-2">
              <div className="flex-grow">
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
              <div className="flex">
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
                    setSelectedPatient(null)
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
            {error && <p className="text-red-500 mt-2">{error}</p>}
            {loading && <p className="text-blue-500 mt-2">Searching...</p>}
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
                  onClick={() => {
                    setFoundPatient(null)
                    setSelectedPatient(null)
                  }}
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
                        const nextValue = nextKey ? foundPatient[nextKey as keyof Patient] : null

                        // Format the field names for display
                        const formatFieldName = (field: string): string => {
                          return field
                            .replace(/_/g, ' ')
                            .split(' ')
                            .map(
                              (word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()
                            )
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
            </div>
          )}

          {/* Previous Operations Table - Show when a patient is selected */}
          {selectedPatient && patientOperations.length > 0 && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                      clipRule="evenodd"
                    />
                  </svg>
                  Previous Operations
                </h2>
                <button
                  onClick={() => setShowOperationForm(true)}
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
                      d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <span>Add New Operation</span>
                </button>
              </div>

              {loading ? (
                <div className="text-center py-4">
                  <p className="text-blue-500">Loading operations...</p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operation Details
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Procedure
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Provision Diagnosis
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operated By
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Review On
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {patientOperations.map((operation) => (
                        <tr
                          key={operation.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOperationSelect(operation)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfAdmit || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfAdmit || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfOperation || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfOperation || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfDischarge || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfDischarge || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationDetails && operation.operationDetails.length > 30
                              ? `${operation.operationDetails.substring(0, 30)}...`
                              : operation.operationDetails || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationProcedure &&
                            operation.operationProcedure.length > 30
                              ? `${operation.operationProcedure.substring(0, 30)}...`
                              : operation.operationProcedure || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.provisionDiagnosis &&
                            operation.provisionDiagnosis.length > 30
                              ? `${operation.provisionDiagnosis.substring(0, 30)}...`
                              : operation.provisionDiagnosis || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {typeof operation.operatedBy === 'object' &&
                            operation.operatedBy !== null &&
                            Object.keys(operation.operatedBy).length === 0
                              ? 'N/A'
                              : typeof operation.operatedBy === 'string'
                                ? operation.operatedBy
                                : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.reviewOn || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOperationSelect(operation)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-green-600 hover:text-green-800 mr-3"
                              onClick={(e) => {
                                e.stopPropagation()
                              }}
                            >
                              Send Receipt
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this operation?')) {
                                  handleDeleteOperation(operation.id)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Show Add New Operation button if patient is selected but no operations exist */}
          {selectedPatient && patientOperations.length === 0 && !loading && (
            <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 text-center">
              <p className="text-gray-500 mb-4">No previous operations found for this patient.</p>
              <button
                onClick={() => setShowOperationForm(true)}
                className="px-4 py-2 bg-green-500 cursor-pointer hover:bg-green-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5 mx-auto"
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
                <span>Add First Operation</span>
              </button>
            </div>
          )}

          {/* Operation Form - Only show when showOperationForm is true */}
          {selectedPatient && showOperationForm && (
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-medium text-gray-800">
                  {selectedOperation ? 'Edit' : 'Add'} Operation for{' '}
                  {selectedPatient['PATIENT NAME'] || selectedPatient.name || 'Patient'}
                </h2>
                <button
                  onClick={() => setShowOperationForm(false)}
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
              <OperationForm
                patient={{
                  patientId: String(selectedPatient?.['PATIENT ID'] || ''),
                  name: String(selectedPatient?.['PATIENT NAME'] || selectedPatient?.name || ''),
                  guardianName: String(selectedPatient?.['GUARDIAN NAME'] || ''),
                  phone: String(selectedPatient?.['PHONE NUMBER'] || selectedPatient?.phone || ''),
                  age: selectedPatient?.AGE || '',
                  gender: String(selectedPatient?.GENDER || ''),
                  address: String(selectedPatient?.ADDRESS || '')
                }}
                operation={selectedOperation}
                onSave={handleOperationSave}
                onCancel={() => {
                  setShowOperationForm(false)
                  setSelectedOperation(null)
                }}
              />
            </div>
          )}

          {/* All Operations Records Section */}
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
                Operation Records
              </h2>
              <div className="text-sm text-gray-500">
                {!loading && allOperations.length > 0 && (
                  <span>
                    {
                      allOperations.filter((operation) => {
                        const today = new Date().toISOString().split('T')[0] // YYYY-MM-DD format
                        const operationDate = operation.date
                          ? typeof operation.date === 'string'
                            ? operation.date.split('T')[0]
                            : operation.date
                          : ''
                        return operationDate === today
                      }).length
                    }{' '}
                    today&apos;s{' '}
                    {allOperations.filter((operation) => {
                      const today = new Date().toISOString().split('T')[0]
                      const operationDate = operation.date
                        ? typeof operation.date === 'string'
                          ? operation.date.split('T')[0]
                          : operation.date
                        : ''
                      return operationDate === today
                    }).length === 1
                      ? 'record'
                      : 'records'}{' '}
                    found
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
                  <p className="mt-3 text-gray-500">Loading operations...</p>
                </div>
              </div>
            )}
            {!loading && allOperations.length === 0 ? (
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
                <p className="text-gray-600 text-lg mb-2">No operations found</p>
                <p className="text-gray-500 mb-6">
                  Click the &quot;New Entry&quot; button to create your first operation record
                </p>
                <button
                  onClick={() => setShowOperationForm(true)}
                  className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
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
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Patient
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Admit
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Operation
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Date of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Time of Discharge
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operation Details
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Procedure
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Provision Diagnosis
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Operated By
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Review On
                        </th>
                        <th
                          scope="col"
                          className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
                        >
                          Actions
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {allOperations.map((operation) => (
                        <tr
                          key={operation.id}
                          className="hover:bg-gray-50 cursor-pointer"
                          onClick={() => handleOperationSelect(operation)}
                        >
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.patientName || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfAdmit || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfAdmit || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfOperation || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfOperation || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.dateOfDischarge || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.timeOfDischarge || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationDetails && operation.operationDetails.length > 30
                              ? `${operation.operationDetails.substring(0, 30)}...`
                              : operation.operationDetails || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.operationProcedure &&
                            operation.operationProcedure.length > 30
                              ? `${operation.operationProcedure.substring(0, 30)}...`
                              : operation.operationProcedure || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.provisionDiagnosis &&
                            operation.provisionDiagnosis.length > 30
                              ? `${operation.provisionDiagnosis.substring(0, 30)}...`
                              : operation.provisionDiagnosis || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {typeof operation.operatedBy === 'object' &&
                            operation.operatedBy !== null &&
                            Object.keys(operation.operatedBy).length === 0
                              ? 'N/A'
                              : typeof operation.operatedBy === 'string'
                                ? operation.operatedBy
                                : 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                            {operation.reviewOn || 'N/A'}
                          </td>
                          <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                            <button
                              className="text-blue-600 hover:text-blue-800 mr-3"
                              onClick={(e) => {
                                e.stopPropagation()
                                handleOperationSelect(operation)
                              }}
                            >
                              Edit
                            </button>
                            <button
                              className="text-red-600 hover:text-red-800"
                              onClick={(e) => {
                                e.stopPropagation()
                                if (confirm('Are you sure you want to delete this operation?')) {
                                  handleDeleteOperation(operation.id)
                                }
                              }}
                            >
                              Delete
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )
            )}
          </div>
        </div>
      </main>

      {/* Operation Form Modal */}
      {showOperationForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold text-gray-800">
                  {selectedOperation ? 'Edit Operation' : 'New Operation'}
                </h2>
                <button
                  onClick={() => {
                    setShowOperationForm(false)
                    setSelectedOperation(null)
                  }}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </button>
              </div>

              {selectedPatient && (
                <OperationForm
                  patient={convertToFormPatient(selectedPatient)}
                  operation={selectedOperation}
                  onSave={handleOperationSave}
                  onCancel={() => {
                    setShowOperationForm(false)
                    setSelectedOperation(null)
                  }}
                />
              )}

              {!selectedPatient && (
                <div className="text-center py-8">
                  <p className="text-gray-600 mb-4">
                    Please select a patient first to add an operation.
                  </p>
                  <button
                    onClick={() => {
                      setShowOperationForm(false)
                      setSelectedOperation(null)
                    }}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default Operations
