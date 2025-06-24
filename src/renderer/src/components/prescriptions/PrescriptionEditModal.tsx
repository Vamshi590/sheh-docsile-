import React from 'react'
import PrescriptionForm from './PrescriptionForm'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

interface PrescriptionEditModalProps {
  isOpen: boolean
  onClose: () => void
  onSave: (prescription: Prescription) => Promise<void>
  prescription: Prescription | null
  prescriptionCount: number
}

const PrescriptionEditModal: React.FC<PrescriptionEditModalProps> = ({
  isOpen,
  onClose,
  onSave,
  prescription,
  prescriptionCount
}) => {
  if (!isOpen || !prescription) return null

  const handleSubmit = async (updatedPrescription: Record<string, unknown>): Promise<void> => {
    // Ensure we keep the original ID
    const prescriptionWithId = {
      ...updatedPrescription,
      id: prescription?.id
    } as Prescription

    await onSave(prescriptionWithId)
    onClose()
  }

  return (
    <div className="fixed inset-0 z-10 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity" aria-hidden="true">
          <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
        </div>

        <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">
          &#8203;
        </span>

        <div
          className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-6xl sm:w-full"
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-headline"
        >
          <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
            <div className="sm:flex sm:items-start">
              <div className="mt-3 text-center sm:mt-0 sm:ml-4 sm:text-left w-full">
                <h3 className="text-lg leading-6 font-medium text-gray-900" id="modal-headline">
                  Edit Prescription
                </h3>
                <div className="mt-4 max-h-[70vh] overflow-y-auto">
                  <PrescriptionForm
                    onSubmit={handleSubmit}
                    onCancel={onClose}
                    initialData={prescription}
                    prescriptionCount={prescriptionCount}
                  />
                </div>
              </div>
            </div>
          </div>
          <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
            <button
              type="button"
              className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

export default PrescriptionEditModal
