import React, { useState, useEffect } from 'react'
import PatientForm from '../components/patients/PatientForm'
import PatientTable from '../components/patients/PatientTable'
import PatientEditModal from '../components/patients/PatientEditModal'

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

const Patients: React.FC = () => {
  const [patients, setPatients] = useState<Patient[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingPatient, setEditingPatient] = useState<Patient | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)

  // Load patients on component mount
  useEffect(() => {
    const fetchPatients = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const data = await api.getPatients()
        setPatients(data as Patient[])
        setError('')
      } catch (err) {
        console.error('Error loading patients:', err)
        setError('Failed to load patients')
      } finally {
        setLoading(false)
      }
    }

    fetchPatients()
  }, [])

  // Function to handle adding a new patient
  const handleAddPatient = async (patient: Omit<Patient, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newPatient = await api.addPatient(patient)
      setPatients([...patients, newPatient as Patient])
      setError('')
    } catch (err) {
      console.error('Error adding patient:', err)
      setError('Failed to add patient')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating a patient
  const handleUpdatePatient = async (id: string, patient: Omit<Patient, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const updatedPatient = await api.updatePatient(id, { ...patient, id })
      setPatients(patients.map((p) => (p.id === id ? (updatedPatient as Patient) : p)))
      setIsModalOpen(false)
      setEditingPatient(null)
      setError('')
    } catch (err) {
      console.error('Error updating patient:', err)
      setError('Failed to update patient')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a patient
  const handleDeletePatient = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this patient?')) {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        await api.deletePatient(id)
        setPatients(patients.filter((p) => p.id !== id))
        setError('')
      } catch (err) {
        console.error('Error deleting patient:', err)
        setError('Failed to delete patient')
      } finally {
        setLoading(false)
      }
    }
  }

  // Function to open edit modal
  const openEditModal = (patient: Patient): void => {
    setEditingPatient(patient)
    setIsModalOpen(true)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Patient Management</h1>
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
              <span>{showAddForm ? 'Hide Form' : 'Add Patient'}</span>
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
                  <path d="M8 9a3 3 0 100-6 3 3 0 000 6zM8 11a6 6 0 016 6H2a6 6 0 016-6zM16 7a1 1 0 10-2 0v1h-1a1 1 0 100 2h1v1a1 1 0 102 0v-1h1a1 1 0 100-2h-1V7z" />
                </svg>
                New Patient Information
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
            <PatientForm onSubmit={handleAddPatient} patientCount={patients.length} />
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
                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
              </svg>
              Patient Records
            </h2>
            <div className="text-sm text-gray-500">
              {!loading && patients.length > 0 && (
                <span>
                  {patients.length} {patients.length === 1 ? 'patient' : 'patients'} found
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
                <p className="mt-3 text-gray-500">Loading patients...</p>
              </div>
            </div>
          )}
          {!loading && patients.length === 0 ? (
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
                  d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z"
                />
              </svg>
              <p className="text-gray-600 text-lg mb-2">No patients found</p>
              <p className="text-gray-500 mb-6">
                Click the &quot;Add Patient&quot; button to create your first patient record
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
                Add Patient
              </button>
            </div>
          ) : (
            !loading && (
              <div>
                <PatientTable
                  patients={patients}
                  onEdit={openEditModal}
                  onDelete={handleDeletePatient}
                />
              </div>
            )
          )}
        </div>
      </main>

      {isModalOpen && editingPatient && (
        <PatientEditModal
          patient={editingPatient}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingPatient(null)
          }}
          onSave={handleUpdatePatient}
        />
      )}

      <footer className="bg-white border-t border-gray-100 mt-12 py-6 shadow-inner">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-10">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Patients
