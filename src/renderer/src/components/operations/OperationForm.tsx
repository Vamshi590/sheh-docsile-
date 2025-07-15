import React, { useState } from 'react'
import {
  doctorOptions,
  operationDetailsOptions,
  operationProcedureOptions,
  provisionDiagnosisOptions,
  partOptions
} from '../../utils/dropdownOptions'

// Define the Patient type
type Patient = {
  patientId: string
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
  parts?: Array<{
    part: string
    days: number
    amount: number
  }>
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
  totalAmount?: number
  modeOfPayment?: string
  reviewOn?: string
  discount?: string
  operatedBy?: string
  [key: string]: unknown
}

interface OperationFormProps {
  patient: Patient
  operation: Operation | null
  onSave: (operation: Operation | Omit<Operation, 'id'>) => Promise<void>
  onCancel: () => void
}

// Define part rates (amount per day)
const partRates: Record<string, number> = {
  Bed: 500,
  'General Ward': 1000,
  'Delux Room': 2500,
  ICU: 5000,
  'Operation Theatre': 10000,
  Consultation: 1000,
  Medicine: 0, // Can be updated later
  'Lab Tests': 0, // Can be updated later
  Imaging: 0, // Can be updated later
  Procedure: 0 // Can be updated later
}

const OperationForm: React.FC<OperationFormProps> = ({ patient, operation, onSave, onCancel }) => {
  const [formData, setFormData] = useState<Partial<Operation>>({
    patientId: patient.patientId,
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
    parts: operation?.parts || [{ part: '', days: 0, amount: 0 }],
    part1: operation?.part1 || '',
    amount1: operation?.amount1 || '',
    days1: operation?.days1 || 0,
    part2: operation?.part2 || '',
    amount2: operation?.amount2 || '',
    days2: operation?.days2 || 0,
    part3: operation?.part3 || '',
    amount3: operation?.amount3 || '',
    days3: operation?.days3 || 0,
    part4: operation?.part4 || '',
    amount4: operation?.amount4 || '',
    days4: operation?.days4 || 0,
    part5: operation?.part5 || '',
    amount5: operation?.amount5 || '',
    days5: operation?.days5 || 0,
    part6: operation?.part6 || '',
    amount6: operation?.amount6 || '',
    days6: operation?.days6 || 0,
    part7: operation?.part7 || '',
    amount7: operation?.amount7 || '',
    days7: operation?.days7 || 0,
    part8: operation?.part8 || '',
    amount8: operation?.amount8 || '',
    days8: operation?.days8 || 0,
    part9: operation?.part9 || '',
    amount9: operation?.amount9 || '',
    days9: operation?.days9 || 0,
    part10: operation?.part10 || '',
    amount10: operation?.amount10 || '',
    days10: operation?.days10 || 0,
    totalAmount: operation?.totalAmount || 0,
    modeOfPayment: operation?.modeOfPayment || '',
    discount: operation?.discount || '',
    reviewOn: operation?.reviewOn || '',
    operatedBy: operation?.operatedBy || 'Dr Srilatha ch',
    id: operation?.id
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // State to track parts entries
  const [parts, setParts] = useState<Array<{ part: string; days: number; amount: number }>>(() => {
    // Initialize with existing parts or create just one empty entry
    if (operation?.parts && operation.parts.length > 0) {
      return operation.parts
    } else {
      // Create a single empty part entry
      return [{ part: '', days: 0, amount: 0 }]
    }
  })

  // State to track visible parts (for UI display)
  const [visibleParts, setVisibleParts] = useState<number>(() => {
    return operation?.parts?.length || 1
  })

  // Function to calculate total amount
  const calculateTotalAmount = React.useCallback((): number => {
    return parts.reduce((total, item) => total + (item.amount || 0), 0)
  }, [parts])

  // Update total amount when parts change
  React.useEffect(() => {
    const total = calculateTotalAmount()
    setFormData((prev) => ({
      ...prev,
      totalAmount: total
    }))
  }, [parts, calculateTotalAmount])

  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }))
  }

  // Handle part selection
  const handlePartChange = (index: number, value: string): void => {
    const updatedParts = [...parts]
    updatedParts[index].part = value

    // Update amount based on part selection and days
    if (partRates[value] && updatedParts[index].days) {
      updatedParts[index].amount = partRates[value] * updatedParts[index].days
    }

    setParts(updatedParts)
    setFormData((prev) => ({
      ...prev,
      parts: updatedParts
    }))
  }

  // Handle days input
  const handleDaysChange = (index: number, value: number): void => {
    const updatedParts = [...parts]
    updatedParts[index].days = value

    // Update amount based on part selection and days
    if (partRates[updatedParts[index].part] && value) {
      updatedParts[index].amount = partRates[updatedParts[index].part] * value
    }

    setParts(updatedParts)
    setFormData((prev) => ({
      ...prev,
      parts: updatedParts
    }))
  }

  // Handle manual amount change
  const handleAmountChange = (index: number, value: number): void => {
    const updatedParts = [...parts]
    updatedParts[index].amount = value

    setParts(updatedParts)
    setFormData((prev) => ({
      ...prev,
      parts: updatedParts
    }))
  }

  // Function to add a new part entry
  const addPartEntry = (): void => {
    // Check if we need to add a new part to the parts array
    if (visibleParts >= parts.length) {
      const newPart = { part: '', days: 0, amount: 0 }
      setParts([...parts, newPart])
      setFormData((prev) => ({
        ...prev,
        parts: [...parts, newPart]
      }))
    }

    // Increase the visible parts count
    setVisibleParts(Math.min(visibleParts + 1, 10))
  }

  // Remove part entry
  const removePartEntry = (index: number): void => {
    // Only remove if we have more than one visible part
    if (visibleParts > 1) {
      // If we're removing the last visible part, just decrease visibility
      if (index === visibleParts - 1) {
        setVisibleParts(visibleParts - 1)
        return
      }

      // Otherwise, remove the part from the array and update state
      const updatedParts = [...parts]
      updatedParts.splice(index, 1)
      setParts(updatedParts)
      setFormData((prev) => ({
        ...prev,
        parts: updatedParts
      }))

      // Decrease visible parts count
      setVisibleParts(visibleParts - 1)
    }
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    setIsSubmitting(true)
    setSubmitMessage(null)

    try {
      // Validate required fields
      // if (
      //   !formData.dateOfAdmit ||
      //   !formData.dateOfOperation ||
      //   !formData.operationDetails ||
      //   formData.operationProcedure ||
      //   formData.provisionDiagnosis ||
      //   formData.operatedBy
      // ) {
      //   setSubmitMessage({
      //     type: 'error',
      //     message: 'Please fill in all required fields marked with *'
      //   })
      //   setIsSubmitting(false)
      //   return
      // }

      // Filter out empty parts (where part name is empty)
      const filteredParts = parts.filter((part) => part.part.trim() !== '')

      // Map parts to individual fields for backward compatibility
      const partsMapping: Record<string, string | number> = {}
      filteredParts.forEach((part, index) => {
        if (index < 10) {
          // Only map up to 10 parts
          partsMapping[`part${index + 1}`] = part.part
          partsMapping[`days${index + 1}`] = part.days
          partsMapping[`amount${index + 1}`] = part.amount
        }
      })

      // Create operation object with patient ID, parts data, and calculated total amount
      const operationData = {
        ...formData,
        ...partsMapping, // Add individual part fields
        // Explicitly set the patient ID from the patient prop to ensure consistency
        patientId: patient.patientId,
        patientName: patient.name,
        createdAt: formData.createdAt || new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        status: formData.status || 'Active',
        // Ensure parts array is included
        parts: filteredParts,
        // Ensure totalAmount is set correctly
        totalAmount: calculateTotalAmount()
      }

      // Log the patient ID being used for debugging
      console.log('Using patient ID for operation:', patient.patientId)

      // Save operation using the appropriate method
      if (operation?.id) {
        // Update existing operation
        await onSave({
          ...operationData,
          id: operation.id
        } as Operation)
      } else {
        // Add new operation
        await onSave(operationData as Omit<Operation, 'id'>)
      }

      // Show success message
      setSubmitMessage({
        type: 'success',
        message: 'Operation saved successfully!'
      })
    } catch (err) {
      console.error('Error saving operation:', err)
      setSubmitMessage({
        type: 'error',
        message: `Failed to save operation: ${err instanceof Error ? err.message : String(err)}`
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
                <p className="text-sm text-gray-900">{patient.patientId}</p>
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
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Details *
            </label>
            <div className="relative">
              <input
                type="text"
                name="operationDetails"
                id="operationDetails"
                list="operationDetailsList"
                value={formData.operationDetails || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="operationDetailsList">
                {operationDetailsOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Procedure *
            </label>
            <div className="relative">
              <input
                type="text"
                name="operationProcedure"
                id="operationProcedure"
                list="operationProcedureList"
                value={formData.operationProcedure || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="operationProcedureList">
                {operationProcedureOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Provision Diagnosis */}
          <div className="md:col-span-2">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provision Diagnosis *
            </label>
            <div className="relative">
              <input
                type="text"
                name="provisionDiagnosis"
                id="provisionDiagnosis"
                list="provisionDiagnosisList"
                value={formData.provisionDiagnosis || ''}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <datalist id="provisionDiagnosisList">
                {provisionDiagnosisOptions.map((option, index) => (
                  <option key={index} value={option} />
                ))}
              </datalist>
            </div>
          </div>

          {/* Parts and Amounts */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-2">Parts and Services</h3>
            <div className="space-y-4">
              {parts.slice(0, visibleParts).map((item, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4 p-3 bg-gray-50 rounded-md"
                >
                  <div className="col-span-2">
                    <label
                      htmlFor={`part-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Part/Service {index + 1}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        id={`part-${index}`}
                        name={`part-${index}`}
                        value={item.part || ''}
                        onChange={(e) => handlePartChange(index, e.target.value)}
                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Enter or select part/service"
                        list={`part-options-${index}`}
                        autoComplete="off"
                      />
                      <datalist id={`part-options-${index}`}>
                        {partOptions.map((option, i) => (
                          <option key={i} value={option} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  <div>
                    <label
                      htmlFor={`days-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Number of Days
                    </label>
                    <input
                      type="number"
                      id={`days-${index}`}
                      value={item.days}
                      onChange={(e) => handleDaysChange(index, parseInt(e.target.value) || 0)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      min="0"
                    />
                  </div>

                  <div>
                    <label
                      htmlFor={`amount-${index}`}
                      className="block text-sm font-medium text-gray-700"
                    >
                      Amount
                    </label>
                    <input
                      type="number"
                      id={`amount-${index}`}
                      value={item.amount}
                      onChange={(e) => handleAmountChange(index, parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      min="0"
                    />
                  </div>

                  <div className="flex items-end">
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePartEntry(index)}
                        className="inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More Parts Button */}
              <div className="col-span-2 flex flex-row w-full justify-between items-center">
                <div className="flex justify-between items-center mt-4">
                  <div className="text-right">
                    <span className="text-sm font-medium text-gray-700">Total Amount: </span>
                    <span className="text-lg font-bold">{calculateTotalAmount()}</span>
                  </div>
                </div>

                {visibleParts < 10 && (
                  <button
                    type="button"
                    onClick={addPartEntry}
                    className="mt-2 flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-2"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add More Part/Service
                  </button>
                )}
              </div>
            </div>
          </div>
          {/*financial details*/}

          <div className="col-span-2 flex flex-row w-full gap-4">
            {/* Mode of Payment */}
            <div className="w-1/2">
              <label
                htmlFor="modeOfPayment"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Mode of Payment
              </label>
              <select
                id="modeOfPayment"
                name="modeOfPayment"
                value={formData.modeOfPayment || ''}
                onChange={handleInputChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              >
                <option value="">Select payment mode</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Debit Card">Debit Card</option>
                <option value="UPI">UPI</option>
                <option value="Insurance">Insurance</option>
                <option value="Bank Transfer">Bank Transfer</option>
              </select>
            </div>

            {/* Discount */}
            <div className="w-1/2">
              <label htmlFor="discount" className="block text-sm font-medium text-gray-700 mb-1">
                Discount
              </label>
              <input
                type="number"
                id="discount"
                name="discount"
                value={formData.discount || ''}
                onChange={handleInputChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
              />
            </div>
          </div>

          {/* Review On */}
          <div className="col-span-2 flex flex-row w-full gap-4">
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Review On</label>
              <input
                type="date"
                name="reviewOn"
                value={formData.reviewOn || ''}
                onChange={handleInputChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Operated By */}
            <div className="w-1/2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Operated By *</label>
              <div className="relative">
                <input
                  type="text"
                  name="operatedBy"
                  id="operatedBy"
                  list="operatedByList"
                  value={formData.operatedBy || ''}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <datalist className="bg-white" id="operatedByList">
                  {doctorOptions.map((option, index) => (
                    <option className="bg-white text-black" key={index} value={option} />
                  ))}
                </datalist>
              </div>
            </div>
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
            {isSubmitting ? 'Saving...' : operation ? 'Update' : 'Save'} Operation
          </button>
        </div>

        {/* Success/Error Message */}
        {submitMessage && (
          <div
            className={`mt-4 p-3 rounded-md ${
              submitMessage?.type === 'success'
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
