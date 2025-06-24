import React from 'react'
import PatientForm from './PatientForm'

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

interface PatientEditModalProps {
  patient: Patient
  isOpen: boolean
  onClose: () => void
  onSave: (id: string, patient: Omit<Patient, 'id'>) => void
}

const PatientEditModal = ({
  patient,
  isOpen,
  onClose,
  onSave
}: PatientEditModalProps): React.ReactNode => {
  if (!isOpen) return null

  const handleSubmit = (formData: Omit<Patient, 'id'>): void => {
    onSave(patient.id, formData)
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-semibold text-gray-800">Edit Patient</h2>
            <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
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

          <PatientForm
            initialValues={{
              date: patient.date,
              patientId: patient.patientId,
              name: patient.name,
              guardian: patient.guardian,
              dob: patient.dob,
              age: patient.age,
              gender: patient.gender,
              phone: patient.phone,
              address: patient.address
            }}
            onSubmit={handleSubmit}
          />

          <div className="mt-6 flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded mr-2 hover:bg-gray-100"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PatientEditModal
