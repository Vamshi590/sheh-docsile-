import React, { useState } from 'react'

// Define the Patient type
type Patient = {
  id: string
  name: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  [key: string]: unknown
}

// Define the Operation type
type Operation = {
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
  part2?: string
  amount2?: string
  part3?: string
  amount3?: string
  part4?: string
  amount4?: string
  part5?: string
  amount5?: string
  part6?: string
  amount6?: string
  part7?: string
  amount7?: string
  part8?: string
  amount8?: string
  part9?: string
  amount9?: string
  part10?: string
  amount10?: string
  reviewOn?: string
  pdeReOpticDisk?: string
  pdeReOpticMacula?: string
  pdeReOpticBloodVessels?: string
  pdeRePr?: string
  pdeLeOpticDisk?: string
  pdeLeOpticMacula?: string
  pdeLeOpticBloodVessels?: string
  pdeLePr?: string
  operatedBy?: string
  [key: string]: unknown
}

interface OperationFormProps {
  patient: Patient
  operation: Operation | null
  onSave: (operation: Operation | Omit<Operation, 'id'>) => Promise<void>
  onCancel: () => void
}

const OperationForm: React.FC<OperationFormProps> = ({ patient, operation, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Operation>>({
    patientId: patient.id,
    patientName: patient.name,
    dateOfAdmit: operation?.dateOfAdmit || new Date().toISOString().split('T')[0],
    timeOfAdmit: operation?.timeOfAdmit || '',
    dateOfOperation: operation?.dateOfOperation || new Date().toISOString().split('T')[0],
    timeOfOperation: operation?.timeOfOperation || '',
    dateOfDischarge: operation?.dateOfDischarge || '',
    timeOfDischarge: operation?.timeOfDischarge || '',
    operationDetails: operation?.operationDetails || '',
    operationProcedure: operation?.operationProcedure || '',
    provisionDiagnosis: operation?.provisionDiagnosis || '',
    part1: operation?.part1 || '',
    amount1: operation?.amount1 || '',
    part2: operation?.part2 || '',
    amount2: operation?.amount2 || '',
    part3: operation?.part3 || '',
    amount3: operation?.amount3 || '',
    part4: operation?.part4 || '',
    amount4: operation?.amount4 || '',
    part5: operation?.part5 || '',
    amount5: operation?.amount5 || '',
    part6: operation?.part6 || '',
    amount6: operation?.amount6 || '',
    part7: operation?.part7 || '',
    amount7: operation?.amount7 || '',
    part8: operation?.part8 || '',
    amount8: operation?.amount8 || '',
    part9: operation?.part9 || '',
    amount9: operation?.amount9 || '',
    part10: operation?.part10 || '',
    amount10: operation?.amount10 || '',
    reviewOn: operation?.reviewOn || '',
    pdeReOpticDisk: operation?.pdeReOpticDisk || '',
    pdeReOpticMacula: operation?.pdeReOpticMacula || '',
    pdeReOpticBloodVessels: operation?.pdeReOpticBloodVessels || '',
    pdeRePr: operation?.pdeRePr || '',
    pdeLeOpticDisk: operation?.pdeLeOpticDisk || '',
    pdeLeOpticMacula: operation?.pdeLeOpticMacula || '',
    pdeLeOpticBloodVessels: operation?.pdeLeOpticBloodVessels || '',
    pdeLePr: operation?.pdeLePr || '',
    operatedBy: operation?.operatedBy || '',
    id: operation?.id
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{ 
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // Handle form input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Validate required fields
      if (
        !formData.dateOfAdmit || 
        !formData.dateOfOperation || 
        !formData.operationDetails || 
        !formData.operationProcedure || 
        !formData.provisionDiagnosis || 
        !formData.operatedBy
      ) {
        setSubmitMessage({
          type: 'error',
          message: 'Please fill in all required fields marked with *'
        })
        setIsSubmitting(false)
        return
      }

      // Call the onSave prop with the form data
      await onSave(operation ? { ...formData, id: operation.id } : formData)
      
      // Show success message
      setSubmitMessage({
        type: 'success',
        message: 'Operation record saved successfully!'
      })

      // Reset form (except patient info)
      setFormData({
        patientId: patient.id,
        patientName: patient.name,
        date: new Date().toISOString().split('T')[0],
        operationType: '',
        surgeon: '',
        preOpDiagnosis: '',
        procedure: ''
      })
      
      // Wait a short time to show success message before closing
      setTimeout(() => {
        onCancel() // Close the form after successful save
      }, 1000)
    } catch (error) {
      console.error('Error saving operation record:', error)
      setSubmitMessage({
        type: 'error',
        message: 'Failed to save operation record. Please try again.'
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Patient Information (Read-only) */}
          <div className="md:col-span-2 p-4 bg-blue-50 rounded-md">
            <h3 className="text-md font-medium mb-2">Patient Information</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-700">Name</p>
                <p className="text-sm text-gray-900">{patient.name}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">ID</p>
                <p className="text-sm text-gray-900">{patient.id}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700">Age/Gender</p>
                <p className="text-sm text-gray-900">
                  {String(patient.age || 'N/A')} / {String(patient.gender || 'N/A')}
                </p>
              </div>
            </div>
          </div>

          {/* Date and Time of Admit */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date of Admit *</label>
            <input
              type="date"
              name="dateOfAdmit"
              value={formData.dateOfAdmit || ''}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Time of Admit</label>
            <input
              type="time"
              name="timeOfAdmit"
              value={formData.timeOfAdmit || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date and Time of Operation */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Operation *
            </label>
            <input
              type="date"
              name="dateOfOperation"
              value={formData.dateOfOperation || ''}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Operation
            </label>
            <input
              type="time"
              name="timeOfOperation"
              value={formData.timeOfOperation || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Date and Time of Discharge */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Date of Discharge
            </label>
            <input
              type="date"
              name="dateOfDischarge"
              value={formData.dateOfDischarge || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Time of Discharge
            </label>
            <input
              type="time"
              name="timeOfDischarge"
              value={formData.timeOfDischarge || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Operation Details and Procedure */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Details *
            </label>
            <textarea
              name="operationDetails"
              value={formData.operationDetails || ''}
              onChange={handleInputChange}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Procedure *
            </label>
            <textarea
              name="operationProcedure"
              value={formData.operationProcedure || ''}
              onChange={handleInputChange}
              rows={3}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Provision Diagnosis */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provision Diagnosis *
            </label>
            <textarea
              name="provisionDiagnosis"
              value={formData.provisionDiagnosis || ''}
              onChange={handleInputChange}
              rows={2}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            ></textarea>
          </div>

          {/* Parts and Amounts */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 1</label>
            <input
              type="text"
              name="part1"
              value={formData.part1 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 1</label>
            <input
              type="text"
              name="amount1"
              value={formData.amount1 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 2</label>
            <input
              type="text"
              name="part2"
              value={formData.part2 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 2</label>
            <input
              type="text"
              name="amount2"
              value={formData.amount2 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 3</label>
            <input
              type="text"
              name="part3"
              value={formData.part3 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 3</label>
            <input
              type="text"
              name="amount3"
              value={formData.amount3 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 4</label>
            <input
              type="text"
              name="part4"
              value={formData.part4 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 4</label>
            <input
              type="text"
              name="amount4"
              value={formData.amount4 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 5</label>
            <input
              type="text"
              name="part5"
              value={formData.part5 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 5</label>
            <input
              type="text"
              name="amount5"
              value={formData.amount5 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Parts 6-10 and Amounts 6-10 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 6</label>
            <input
              type="text"
              name="part6"
              value={formData.part6 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 6</label>
            <input
              type="text"
              name="amount6"
              value={formData.amount6 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 7</label>
            <input
              type="text"
              name="part7"
              value={formData.part7 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 7</label>
            <input
              type="text"
              name="amount7"
              value={formData.amount7 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 8</label>
            <input
              type="text"
              name="part8"
              value={formData.part8 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 8</label>
            <input
              type="text"
              name="amount8"
              value={formData.amount8 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 9</label>
            <input
              type="text"
              name="part9"
              value={formData.part9 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 9</label>
            <input
              type="text"
              name="amount9"
              value={formData.amount9 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Part 10</label>
            <input
              type="text"
              name="part10"
              value={formData.part10 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount 10</label>
            <input
              type="text"
              name="amount10"
              value={formData.amount10 || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Review On */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Review On</label>
            <input
              type="date"
              name="reviewOn"
              value={formData.reviewOn || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PDE (Post-Discharge Examination) - Right Eye */}
          <div className="md:col-span-2">
            <h3 className="text-md font-medium text-gray-800 mb-2">PDE - Right Eye</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RE - Optic Disk</label>
            <input
              type="text"
              name="pdeReOpticDisk"
              value={formData.pdeReOpticDisk || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RE - Optic Macula
            </label>
            <input
              type="text"
              name="pdeReOpticMacula"
              value={formData.pdeReOpticMacula || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              RE - Optic Blood Vessels
            </label>
            <input
              type="text"
              name="pdeReOpticBloodVessels"
              value={formData.pdeReOpticBloodVessels || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">RE - PR</label>
            <input
              type="text"
              name="pdeRePr"
              value={formData.pdeRePr || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* PDE (Post-Discharge Examination) - Left Eye */}
          <div className="md:col-span-2">
            <h3 className="text-md font-medium text-gray-800 mb-2">PDE - Left Eye</h3>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LE - Optic Disk</label>
            <input
              type="text"
              name="pdeLeOpticDisk"
              value={formData.pdeLeOpticDisk || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LE - Optic Macula
            </label>
            <input
              type="text"
              name="pdeLeOpticMacula"
              value={formData.pdeLeOpticMacula || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              LE - Optic Blood Vessels
            </label>
            <input
              type="text"
              name="pdeLeOpticBloodVessels"
              value={formData.pdeLeOpticBloodVessels || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">LE - PR</label>
            <input
              type="text"
              name="pdeLePr"
              value={formData.pdeLePr || ''}
              onChange={handleInputChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          {/* Operated By */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">Operated By *</label>
            <input
              type="text"
              name="operatedBy"
              value={formData.operatedBy || ''}
              onChange={handleInputChange}
              required
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2 mt-4">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Saving...' : (operation ? 'Update' : 'Save')} Operation
          </button>
        </div>

        {/* Success/Error Message */}
        {submitMessage && (
          <div
            className={`mt-4 p-3 rounded-md ${submitMessage?.type === 'success'
              ? 'bg-green-50 text-green-800'
              : 'bg-red-50 text-red-800'
            }`}
          >
            {submitMessage.message}
          </div>
        )}
      </form>
    </div>
  )
}

export default OperationForm
