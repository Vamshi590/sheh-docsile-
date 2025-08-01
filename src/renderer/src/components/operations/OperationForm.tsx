import React, { useState, useEffect } from 'react'
import { partOptions } from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'
import PrescriptionForm from '../prescriptions/PrescriptionForm'
import Modal from '../common/Modal' // This import is correct, but TypeScript might not find it

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
  discount?: number
  amountReceived?: number
  amountDue?: number
  operatedBy?: string
  billNumber?: string
  createdBy?: string
  updatedBy?: string
  [key: string]: unknown
}

interface OperationFormProps {
  patient: Patient
  operation: Operation | null
  onSave: (
    operation: Operation | Omit<Operation, 'id'>,
    prescriptionData?: string | null
  ) => Promise<void>
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
  // State for prescription modal
  const [isPrescriptionModalOpen, setIsPrescriptionModalOpen] = useState(false)
  const [prescriptionData, setPrescriptionData] = useState<Record<string, unknown> | null>(null)
  // Helper to convert partN/daysN/amountN fields into parts array
  const buildPartsFromFields = (
    op?: Operation | null
  ): Array<{ part: string; days: number; amount: number }> => {
    const list: Array<{ part: string; days: number; amount: number }> = []
    if (!op) return list

    console.log('Building parts from fields:', op)

    for (let i = 1; i <= 10; i++) {
      const part = op[`part${i}` as keyof Operation] as unknown as string | undefined
      const days = op[`days${i}` as keyof Operation] as unknown as number | undefined
      const amount = op[`amount${i}` as keyof Operation] as unknown as string | number | undefined

      // Log each part field for debugging
      console.log(`Part ${i}:`, { part, days, amount })

      if (part && part.trim() !== '') {
        // Convert amount to number if it's a string
        const numericAmount = typeof amount === 'string' ? parseFloat(amount) || 0 : amount || 0
        // Convert days to number if it's a string
        const numericDays = typeof days === 'string' ? parseInt(days) || 0 : days || 0

        list.push({ part, days: numericDays, amount: numericAmount })
      }
    }

    console.log('Built parts list:', list)
    return list
  }
  const [formData, setFormData] = useState<Partial<Operation>>(() => {
    // Initialize with patient data and default values
    const initialData: Partial<Operation> = {
      billNumber: operation?.billNumber || '',
      createdBy: operation?.createdBy || '',
      updatedBy: operation?.updatedBy || '',
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
      totalAmount: operation?.totalAmount || 0,
      modeOfPayment: operation?.modeOfPayment || 'Cash',
      discount: operation?.discount || 0,
      amountReceived: operation?.amountReceived || 0,
      amountDue: operation?.amountDue || 0,
      reviewOn: operation?.reviewOn || '',
      operatedBy: operation?.operatedBy || 'Dr Srilatha ch',
      id: operation?.id
    }

    // Add individual part fields for backward compatibility
    for (let i = 1; i <= 10; i++) {
      const partKey = `part${i}` as keyof Operation
      const daysKey = `days${i}` as keyof Operation
      const amountKey = `amount${i}` as keyof Operation

      initialData[partKey] = operation?.[partKey] || ''
      initialData[daysKey] = operation?.[daysKey] || 0
      initialData[amountKey] = operation?.[amountKey] || ''
    }

    return initialData
  })

  console.log('operation', operation)
  console.log('formData', formData)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitMessage, setSubmitMessage] = useState<{
    type: 'success' | 'error'
    message: string
  } | null>(null)

  // State to track parts entries
  const [parts, setParts] = useState<Array<{ part: string; days: number; amount: number }>>(() => {
    let initial: Array<{ part: string; days: number; amount: number }> = []
    if (operation?.parts && operation.parts.length > 0) {
      initial = operation.parts
    } else {
      initial = buildPartsFromFields(operation)
    }
    return initial.length > 0 ? initial : [{ part: '', days: 0, amount: 0 }]
  })

  // State to track visible parts (for UI display)
  const [visibleParts, setVisibleParts] = useState<number>(() => {
    const count = operation?.parts?.length || buildPartsFromFields(operation).length || 1
    return Math.max(count, 1) // Ensure at least 1 part is visible
  })

  // Reinitialize form when the `operation` prop changes (e.g., editing an existing record)
  useEffect(() => {
    if (!operation) return

    // Build parts from individual fields (part1, part2, etc.)
    const partsToUse = buildPartsFromFields(operation)

    // Make sure we have at least one part entry
    if (partsToUse.length === 0) {
      partsToUse.push({ part: '', days: 0, amount: 0 })
    }

    // Update the parts state and visible parts count
    setParts(partsToUse)
    setVisibleParts(Math.max(partsToUse.length, 1))

    // Reset formData with latest operation values
    setFormData({
      ...operation,
      modeOfPayment: operation.modeOfPayment || 'Cash',
      operatedBy: operation.operatedBy || 'Dr Srilatha ch'
    })

    // Log for debugging
    console.log(
      'Initialized parts from fields:',
      partsToUse,
      'Visible parts:',
      Math.max(partsToUse.length, 1)
    )
  }, [operation])

  // Function to calculate total amount
  const calculateTotalAmount = React.useCallback((): number => {
    if (!Array.isArray(parts) || parts.length === 0) return 0
    return parts.reduce((total, item) => total + (item?.amount || 0), 0)
  }, [parts])

  // Update total amount when parts change
  useEffect(() => {
    const total = calculateTotalAmount()
    setFormData((prev) => ({
      ...prev,
      totalAmount: total
    }))
  }, [parts, calculateTotalAmount])

  // Update amount due whenever total, discount, advance or received changes
  useEffect(() => {
    const due =
      (formData.totalAmount || 0) - (formData.discount || 0) - (formData.amountReceived || 0)
    setFormData((prev) => ({
      ...prev,
      amountDue: due
    }))
  }, [formData.totalAmount, formData.discount, formData.amountReceived])

  // Handle input changes
  // Handle input changes
  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === 'discount' || name === 'advanceAmount' || name === 'amountReceived'
          ? Number(value)
          : value
    }))
  }

  // Handle part selection
  const handlePartChange = (index: number, value: string): void => {
    // Make sure parts array exists and has enough elements
    const updatedParts = Array.isArray(parts) ? [...parts] : []

    // Ensure the index exists in the array
    while (updatedParts.length <= index) {
      updatedParts.push({ part: '', days: 0, amount: 0 })
    }

    updatedParts[index].part = value

    // Update amount based on part selection and days
    if (partRates[value] && updatedParts[index].days) {
      updatedParts[index].amount = partRates[value] * updatedParts[index].days
    }

    // Update parts array
    setParts(updatedParts)

    // Update individual part fields in formData
    const partNum = index + 1
    setFormData((prev) => ({
      ...prev,
      [`part${partNum}`]: value,
      [`days${partNum}`]: updatedParts[index].days,
      [`amount${partNum}`]: updatedParts[index].amount
    }))
  }

  // Handle days input
  const handleDaysChange = (index: number, value: number): void => {
    // Make sure parts array exists and has enough elements
    const updatedParts = Array.isArray(parts) ? [...parts] : []

    // Ensure the index exists in the array
    while (updatedParts.length <= index) {
      updatedParts.push({ part: '', days: 0, amount: 0 })
    }

    updatedParts[index].days = value

    // Update amount based on part selection and days
    if (partRates[updatedParts[index].part] && value) {
      updatedParts[index].amount = partRates[updatedParts[index].part] * value
    }

    // Update parts array
    setParts(updatedParts)

    // Update individual part fields in formData
    const partNum = index + 1
    setFormData((prev) => ({
      ...prev,
      [`days${partNum}`]: value,
      [`amount${partNum}`]: updatedParts[index].amount
    }))
  }

  // Handle manual amount change
  const handleAmountChange = (index: number, value: number): void => {
    // Make sure parts array exists and has enough elements
    const updatedParts = Array.isArray(parts) ? [...parts] : []

    // Ensure the index exists in the array
    while (updatedParts.length <= index) {
      updatedParts.push({ part: '', days: 0, amount: 0 })
    }

    updatedParts[index].amount = value

    // Update parts array
    setParts(updatedParts)

    // Update individual part fields in formData
    const partNum = index + 1
    setFormData((prev) => ({
      ...prev,
      [`amount${partNum}`]: value
    }))
  }

  // Function to add a new part entry
  const addPartEntry = (): void => {
    // Check if we need to add a new part to the parts array
    if (visibleParts >= parts.length) {
      const newPart = { part: '', days: 0, amount: 0 }
      const updatedParts = [...parts, newPart]
      setParts(updatedParts)

      // Update the individual field for the new part
      const newPartIndex = updatedParts.length
      if (newPartIndex <= 10) {
        setFormData((prev) => ({
          ...prev,
          [`part${newPartIndex}`]: '',
          [`days${newPartIndex}`]: 0,
          [`amount${newPartIndex}`]: 0
        }))
      }
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

      // Update formData by shifting all parts after the removed one
      const newFormData = { ...formData }

      // Clear the removed part's fields
      for (let i = index + 1; i <= 10; i++) {
        const currentPart = updatedParts[i - 1] || { part: '', days: 0, amount: 0 }
        newFormData[`part${i}`] = currentPart.part || ''
        newFormData[`days${i}`] = currentPart.days || 0
        newFormData[`amount${i}`] = currentPart.amount || 0
      }

      // Clear the last part if we removed one
      if (updatedParts.length < 10) {
        newFormData[`part${updatedParts.length + 1}`] = ''
        newFormData[`days${updatedParts.length + 1}`] = 0
        newFormData[`amount${updatedParts.length + 1}`] = 0
      }

      setFormData(newFormData)

      // Decrease visible parts count
      setVisibleParts(visibleParts - 1)
    }
  }

  // Handle prescription form submission
  const handlePrescriptionSubmit = async (prescription: Record<string, unknown>): Promise<void> => {
    try {
      // Add patient information to prescription
      const prescriptionWithPatient = {
        ...prescription,
        'PATIENT ID': patient.patientId,
        'PATIENT NAME': patient.name,
        'GUARDIAN NAME': patient.guardianName || '',
        'PHONE NUMBER': patient.phone || '',
        AGE: patient.age || '',
        GENDER: patient.gender || '',
        ADDRESS: patient.address || ''
      }

      // Store prescription data for later use with the operation
      // No longer saving to prescriptions table separately
      setPrescriptionData(prescriptionWithPatient)

      // Close modal
      setIsPrescriptionModalOpen(false)
      // Show success message
      setSubmitMessage({
        type: 'success',
        message: 'Prescription added to operation!'
      })
    } catch (error) {
      console.error('Error processing prescription:', error)
      setSubmitMessage({
        type: 'error',
        message: `Error processing prescription: ${error}`
      })
    }
  }

  // Handle form submission
  // Helper function to get current user from localStorage
  const getCurrentUser = (): string => {
    try {
      const currentUser = localStorage.getItem('currentUser')
      if (currentUser) {
        const user = JSON.parse(currentUser)
        return user.fullName || user.username || 'Unknown User'
      }
      return 'Unknown User'
    } catch (error) {
      console.error('Error getting current user:', error)
      return 'Unknown User'
    }
  }

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
      const filteredParts = parts.filter((part) => part && part.part && part.part.trim() !== '')

      // Map parts to individual fields - this is the primary way data is stored
      const partsMapping: Record<string, string | number> = {}

      // First clear all part fields
      for (let i = 1; i <= 10; i++) {
        partsMapping[`part${i}`] = ''
        partsMapping[`days${i}`] = 0
        partsMapping[`amount${i}`] = 0
      }

      // Then set the values for parts that exist
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
        // Include the parts array separately
        parts: filteredParts,
        // Ensure totalAmount is set correctly
        totalAmount: calculateTotalAmount(),
        amountReceived: formData.amountReceived,
        amountDue: formData.amountDue,
        discount: formData.discount,
        modeOfPayment: formData.modeOfPayment,
        // Handle bill number, createdBy and updatedBy fields
        billNumber: formData.billNumber || '', // Will be generated on backend if empty
        updatedBy: getCurrentUser() // Always set updatedBy to current user
      }

      // For new operations, set createdBy
      if (!operation?.id) {
        operationData.createdBy = getCurrentUser()
      }

      // Save operation using the appropriate method
      if (operation?.id) {
        // Update existing operation
        await onSave(
          {
            ...operationData,
            id: operation.id
          } as Operation,
          prescriptionData ? JSON.stringify(prescriptionData) : null
        )
      } else {
        // Add new operation
        await onSave(
          operationData as Omit<Operation, 'id'>,
          prescriptionData ? JSON.stringify(prescriptionData) : null
        )
      }

      // Reset form state
      setFormData({
        patientId: patient.patientId,
        patientName: patient.name,
        dateOfAdmit: new Date().toISOString().split('T')[0],
        timeOfAdmit: '',
        dateOfOperation: new Date().toISOString().split('T')[0],
        timeOfOperation: '',
        dateOfDischarge: '',
        timeOfDischarge: '',
        operationDetails: '',
        operationProcedure: '',
        provisionDiagnosis: '',
        totalAmount: 0,
        modeOfPayment: 'Cash',
        discount: 0,
        amountReceived: 0,
        amountDue: 0,
        reviewOn: '',
        operatedBy: 'Dr Srilatha ch'
      })
      setParts([{ part: '', days: 0, amount: 0 }])
      setPrescriptionData(null)

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

  // Dynamic dropdown options state
  const [dynamicOperationDetailsOptions, setDynamicOperationDetailsOptions] = useState<string[]>([])
  const [dynamicOperationProcedureOptions, setDynamicOperationProcedureOptions] = useState<
    string[]
  >([])
  const [dynamicProvisionDiagnosisOptions, setDynamicProvisionDiagnosisOptions] = useState<
    string[]
  >([])
  const [dynamicDoctorOptions, setDynamicDoctorOptions] = useState<string[]>([])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (): Promise<void> => {
    try {
      const [doctorOpts, provisionDiagnosisOpts, operationDetailsOpts, operationProcedureOpts] =
        await Promise.all([
          window.api.getDropdownOptions('doctorName'),
          window.api.getDropdownOptions('provisionDiagnosisOptions'),
          window.api.getDropdownOptions('operationDetailsOptions'),
          window.api.getDropdownOptions('operationProcedureOptions')
        ])
      console.log(
        'Dropdown options:',
        doctorOpts,
        provisionDiagnosisOpts,
        operationDetailsOpts,
        operationProcedureOpts
      )

      // Set dynamic options - API returns { success: boolean, options?: string[], error?: string }
      const doctorOptions = (doctorOpts as { options?: string[] })?.options || []
      const provisionDiagnosisOptions =
        (provisionDiagnosisOpts as { options?: string[] })?.options || []
      const operationDetailsOptions =
        (operationDetailsOpts as { options?: string[] })?.options || []
      const operationProcedureOptions =
        (operationProcedureOpts as { options?: string[] })?.options || []

      console.log(
        'Doctor options:',
        doctorOptions,
        'Provision Diagnosis options:',
        provisionDiagnosisOptions,
        'Operation Details options:',
        operationDetailsOptions,
        'Operation Procedure options:',
        operationProcedureOptions
      )

      setDynamicDoctorOptions([...new Set(doctorOptions as string[])])
      setDynamicProvisionDiagnosisOptions([...new Set(provisionDiagnosisOptions as string[])])
      setDynamicOperationDetailsOptions([...new Set(operationDetailsOptions as string[])])
      setDynamicOperationProcedureOptions([...new Set(operationProcedureOptions as string[])])
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    }
  }

  // Function to add a new option permanently
  const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
    try {
      const response = await window.api.addDropdownOption(fieldName, value)
      console.log('Response:', response)
      // Refresh options from backend
      await fetchDropdownOptions()
    } catch (err) {
      console.error('Error adding option:', err)
    }
  }

  // Fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  return (
    <div className="bg-white p-6 rounded-lg">
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
            <EditableCombobox
              id="operationDetails"
              name="operationDetails"
              value={(formData['operationDetails'] as string) || ''}
              options={dynamicOperationDetailsOptions}
              onChange={handleInputChange}
              onAddNewOption={(_, value) =>
                addNewOptionPermanently('operationDetailsOptions', value)
              }
              placeholder="Select or type previous history..."
            />
            {/* <div className="relative">
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
            </div> */}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Operation Procedure *
            </label>
            <EditableCombobox
              id="operationProcedure"
              name="operationProcedure"
              value={(formData['operationProcedure'] as string) || ''}
              options={dynamicOperationProcedureOptions}
              onChange={handleInputChange}
              onAddNewOption={(_, value) =>
                addNewOptionPermanently('operationProcedureOptions', value)
              }
              placeholder="Select or type previous history..."
            />
          </div>

          {/* Provision Diagnosis */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Provision Diagnosis *
            </label>
            <EditableCombobox
              id="provisionDiagnosis"
              name="provisionDiagnosis"
              value={(formData['provisionDiagnosis'] as string) || ''}
              options={dynamicProvisionDiagnosisOptions}
              onChange={handleInputChange}
              onAddNewOption={(_, value) =>
                addNewOptionPermanently('provisionDiagnosisOptions', value)
              }
              placeholder="Select or type previous history..."
            />
          </div>

          {/* Operated By */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Operated By *</label>
            <EditableCombobox
              id="operatedBy"
              name="operatedBy"
              value={(formData['operatedBy'] as string) || ''}
              options={dynamicDoctorOptions}
              onChange={handleInputChange}
              onAddNewOption={(_, value) => addNewOptionPermanently('doctorName', value)}
              placeholder="Select or type previous history..."
            />
          </div>

          {/* Parts and Amounts */}
          <div className="col-span-2 mt-4">
            <h3 className="text-lg font-semibold mb-2">Parts and Services</h3>
            <div className="space-y-4">
              {/* Make sure parts array is valid and has at least one entry */}
              {(Array.isArray(parts) && parts.length > 0
                ? parts.slice(0, visibleParts)
                : [{ part: '', days: 0, amount: 0 }]
              ).map((item, index) => (
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
                    <EditableCombobox
                      id={`part ${index + 1}`}
                      name={`part ${index + 1}`}
                      value={(formData[`part ${index + 1}`] as string) || ''}
                      options={partOptions}
                      onChange={(e) => handlePartChange(index, e.target.value)}
                      placeholder="Select or type medicine name, dosage..."
                    />
                    {/* <div className="relative">
                      <input
                        type="text"
                        id={`part-${index}`}
                        name={`part-${index}`}
                        value={item?.part || ''}
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
                    </div> */}
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
                      value={item?.days || 0}
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
                      value={item?.amount || 0}
                      onChange={(e) => handleAmountChange(index, parseFloat(e.target.value) || 0)}
                      className="mt-1 block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                      min="0"
                    />
                  </div>

                  <div className="flex">
                    {parts.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removePartEntry(index)}
                        className="inline-flex items-center justify-end cursor-pointer underline text-sm leading-4 font-medium rounded-md text-black"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                </div>
              ))}

              {/* Add More Parts Button */}
              <div className="col-span-2 flex w-full justify-end">
                {visibleParts < 10 && (
                  <button
                    type="button"
                    onClick={addPartEntry}
                    className="mt-2 flex items-center cursor-pointer text-sm font-medium rounded-md text-black underline"
                  >
                    + Add More Part/Service
                  </button>
                )}
              </div>
            </div>
          </div>
          {/*financial details*/}

          {/* Additional Financial Fields */}
          <div className="col-span-2 flex flex-row w-full gap-4 mt-4">
            {/* Total Amount */}
            <div className="w-1/2">
              <label htmlFor="totalAmount" className="block text-sm font-medium text-gray-700 mb-1">
                Total Amount
              </label>
              <input
                type="number"
                id="totalAmount"
                name="totalAmount"
                value={formData.totalAmount || 0}
                readOnly
                className="block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm"
              />
            </div>

            <div className="w-1/2">
              <label
                htmlFor="amountReceived"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Amount Received
              </label>
              <input
                type="number"
                id="amountReceived"
                name="amountReceived"
                value={formData.amountReceived || 0}
                onChange={handleInputChange}
                className="block w-full py-2 px-3 border border-gray-300 bg-white rounded-md shadow-sm sm:text-sm"
              />
            </div>
          </div>

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

          <div className="col-span-2 flex flex-row w-full gap-4">
            {/* Amount Due */}
            <div className="w-1/2">
              <label htmlFor="amountDue" className="block text-sm font-medium text-gray-700 mb-1">
                Amount Due
              </label>
              <input
                type="number"
                id="amountDue"
                name="amountDue"
                value={formData.amountDue || 0}
                readOnly
                className="block w-full py-2 px-3 border border-gray-300 bg-gray-100 rounded-md shadow-sm sm:text-sm"
              />
            </div>
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
          </div>
        </div>

        {/* Submit Button */}
        <div className="flex justify-end space-x-2 mt-12">
          <button
            type="button"
            className="px-4 py-2 bg-gray-300 text-gray-800 rounded hover:bg-gray-400"
            onClick={onCancel}
            disabled={isSubmitting}
          >
            Cancel
          </button>
          <button
            type="button"
            className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 mr-2"
            onClick={() => setIsPrescriptionModalOpen(true)}
            disabled={isSubmitting}
          >
            Add Prescription
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
            {submitMessage?.message}
          </div>
        )}
      </form>

      {/* Prescription Modal */}
      {isPrescriptionModalOpen && (
        <Modal
          isOpen={isPrescriptionModalOpen}
          onClose={() => setIsPrescriptionModalOpen(false)}
          title="Add Prescription"
          size="lg"
        >
          <PrescriptionForm
            onSubmit={handlePrescriptionSubmit}
            onCancel={() => setIsPrescriptionModalOpen(false)}
            prescriptionCount={0}
            selectedPatient={{
              'PATIENT ID': patient.patientId,
              'GUARDIAN NAME': patient.name,
              DOB: '',
              AGE: Number(patient.age) || 0,
              GENDER: patient.gender || '',
              'PHONE NUMBER': patient.phone || '',
              ADDRESS: patient.address || ''
            }}
          />
        </Modal>
      )}
    </div>
  )
}

export default OperationForm
