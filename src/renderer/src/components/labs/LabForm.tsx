import React, { useState, useEffect } from 'react'
import EditableCombobox from '../common/EditableCombobox'

// Define the Lab type to match with other components
type Lab = {
  id: string
  [key: string]: unknown
}

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define the Patient type
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

// Extend window.api interface to include lab methods
declare global {
  interface Window {
    api: {
      // Lab-specific methods
      getLabs: () => Promise<Lab[]>
      addLab: (lab: Omit<Lab, 'id'>) => Promise<Lab>
      updateLab: (lab: Lab) => Promise<Lab>
      deleteLab: (id: string) => Promise<boolean>
      searchLabs: (patientId: string) => Promise<Lab[]>
      getTodaysLabs: () => Promise<Lab[]>
      getLabTestOptions: () => Promise<string[]>
      addLabTestOption: (value: string) => Promise<boolean>
      getPatients: () => Promise<Patient[]>
      getPrescriptions: () => Promise<Prescription[]>
      addPrescription: (prescription: Omit<Prescription, 'id'>) => Promise<Prescription>
      updatePrescription: (id: string, prescription: Prescription) => Promise<Prescription>
      deletePrescription: (id: string) => Promise<void>
      searchPrescriptions: (searchTerm: string) => Promise<Prescription[]>
      getTodaysPrescriptions: () => Promise<Prescription[]>
      getDropdownOptions: (fieldName: string) => Promise<string[]>
      addDropdownOption: (fieldName: string, value: string) => Promise<void>
      openPdfInWindow: (pdfBuffer: Uint8Array) => Promise<{ success: boolean; error?: string }>
      getLatestPatientId: () => Promise<number>
    }
  }
}

interface LabFormProps {
  onSubmit: (lab: Omit<Lab, 'id'>) => Promise<void>
  onCancel: () => void
  labCount: number
  initialData?: Partial<Lab>
  selectedPatient?: Patient | null
  // Removed unused patients parameter
}

const LabForm: React.FC<LabFormProps> = ({
  onSubmit,
  onCancel,
  labCount,
  initialData = {},
  selectedPatient = null
  // Removing unused patients parameter
}) => {
  // Form state
  const [formData, setFormData] = useState<Omit<Lab, 'id'>>(() => {
    // Initialize with default values or initial data
    return {
      'DOCTOR NAME': 'Dr. Srilatha ch',
      DEPARTMENT: 'Opthalmology',
      'REFFERED BY': 'Self',

      // Lab test fields - we'll start with 5 rows
      'LAB TEST 1': '',
      'AMOUNT 1': '',
      'LAB TEST 2': '',
      'AMOUNT 2': '',
      'LAB TEST 3': '',
      'AMOUNT 3': '',
      'LAB TEST 4': '',
      'AMOUNT 4': '',
      'LAB TEST 5': '',
      'AMOUNT 5': '',

      // Billing fields
      'TOTAL AMOUNT': 0,
      'DISCOUNT PERCENTAGE': 0,
      'AMOUNT RECEIVED': 0,
      'AMOUNT DUE': 0,

      // Add patient information if a patient is selected
      ...(selectedPatient
        ? {
            'PATIENT ID': selectedPatient['PATIENT ID'],
            'PATIENT NAME': selectedPatient['GUARDIAN NAME'], // Using guardian name as patient name
            'PHONE NUMBER': selectedPatient['PHONE NUMBER'],
            AGE: selectedPatient.AGE,
            GENDER: selectedPatient.GENDER,
            ADDRESS: selectedPatient.ADDRESS
          }
        : {}),
      ...initialData,

      // Add current date
      DATE: new Date().toISOString().split('T')[0]
    } as Omit<Lab, 'id'>
  })

  // State to track number of visible lab test fields
  const [visibleLabTests, setVisibleLabTests] = useState(2)

  // Dynamic dropdown options state
  const [dynamicLabTestOptions, setDynamicLabTestOptions] = useState<string[]>([])

  // Effect to fetch dropdown options on component mount
  useEffect(() => {
    fetchDropdownOptions()
  }, [])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (): Promise<void> => {
    try {
      // Fetch lab test options
      const labTestOptions = await window.api.getLabTestOptions()
      if (labTestOptions && labTestOptions.length > 0) {
        setDynamicLabTestOptions(labTestOptions)
      }
    } catch (error) {
      console.error('Error fetching dropdown options:', error)
    }
  }

  // Helper function to add new option permanently
  const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
    try {
      if (fieldName === 'labTestOptions') {
        // Use the lab-specific API method
        await window.api.addLabTestOption(value)
      } else {
        // Use the general dropdown API method
        await window.api.addDropdownOption(fieldName, value)
      }
    } catch (error) {
      console.error(`Error adding new option to ${fieldName}:`, error)
    }
  }

  // Helper function to get current user
  const getCurrentUser = (): string => {
    try {
      const currentUser = JSON.parse(localStorage.getItem('currentUser') || '{}')
      return currentUser.fullName || currentUser.username || 'Unknown User'
    } catch (error) {
      console.error('Error getting current user:', error)
      return 'Unknown User'
    }
  }

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value } = e.target

    // Update the form data
    setFormData((prevData) => {
      const updatedData = { ...prevData, [name]: value }

      // If this is an amount field, recalculate total
      if (name.startsWith('AMOUNT ')) {
        let total = 0
        // Sum all amount fields
        for (let i = 1; i <= 10; i++) {
          const amountKey = `AMOUNT ${i}`
          const amountValue = updatedData[amountKey]
          if (amountValue && !isNaN(Number(amountValue))) {
            total += Number(amountValue)
          }
        }

        // Update total amount
        updatedData['TOTAL AMOUNT'] = total

        // Recalculate amount due
        const discount = updatedData['DISCOUNT PERCENTAGE']
          ? (total * Number(updatedData['DISCOUNT PERCENTAGE'])) / 100
          : 0
        const amountReceived = updatedData['AMOUNT RECEIVED']
          ? Number(updatedData['AMOUNT RECEIVED'])
          : 0

        updatedData['AMOUNT DUE'] = total - discount - amountReceived
      }

      // If discount percentage or amount received changes, recalculate amount due
      if (name === 'DISCOUNT PERCENTAGE' || name === 'AMOUNT RECEIVED') {
        const total = updatedData['TOTAL AMOUNT'] ? Number(updatedData['TOTAL AMOUNT']) : 0
        const discount = updatedData['DISCOUNT PERCENTAGE']
          ? (total * Number(updatedData['DISCOUNT PERCENTAGE'])) / 100
          : 0
        const amountReceived = updatedData['AMOUNT RECEIVED']
          ? Number(updatedData['AMOUNT RECEIVED'])
          : 0

        updatedData['AMOUNT DUE'] = total - discount - amountReceived
      }

      return updatedData
    })
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    // Add createdBy field
    const submissionData = {
      ...formData,
      createdBy: getCurrentUser(),
      Sno: labCount + 1 // Set the serial number
    }

    await onSubmit(submissionData)

    // Reset form after submission
    setFormData({
      'DOCTOR NAME': 'Dr. Srilatha ch',
      DEPARTMENT: 'Opthalmology',
      'REFFERED BY': 'Self',

      // Lab test fields
      'LAB TEST 1': '',
      'AMOUNT 1': '',
      'LAB TEST 2': '',
      'AMOUNT 2': '',
      'LAB TEST 3': '',
      'AMOUNT 3': '',
      'LAB TEST 4': '',
      'AMOUNT 4': '',
      'LAB TEST 5': '',
      'AMOUNT 5': '',

      // Billing fields
      'TOTAL AMOUNT': 0,
      'DISCOUNT PERCENTAGE': 0,
      'AMOUNT RECEIVED': 0,
      'AMOUNT DUE': 0,

      DATE: new Date().toISOString().split('T')[0],
      createdBy: getCurrentUser()
    } as Omit<Lab, 'id'>)

    setVisibleLabTests(2)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Patient Information Section */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-3 gap-4">
          {/* PATIENT ID */}
          <div>
            <label htmlFor="PATIENT ID" className="block text-sm font-medium text-gray-700">
              Patient ID
            </label>
            <input
              type="text"
              name="PATIENT ID"
              id="PATIENT ID"
              value={(formData['PATIENT ID'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly={!!selectedPatient}
            />
          </div>

          {/* PATIENT NAME */}
          <div>
            <label htmlFor="PATIENT NAME" className="block text-sm font-medium text-gray-700">
              Patient Name
            </label>
            <input
              type="text"
              name="PATIENT NAME"
              id="PATIENT NAME"
              value={(formData['PATIENT NAME'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly={!!selectedPatient}
            />
          </div>

          {/* AGE */}
          <div>
            <label htmlFor="AGE" className="block text-sm font-medium text-gray-700">
              Age
            </label>
            <input
              type="number"
              name="AGE"
              id="AGE"
              value={(formData.AGE as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly={!!selectedPatient}
            />
          </div>

          {/* GENDER */}
          <div>
            <label htmlFor="GENDER" className="block text-sm font-medium text-gray-700">
              Gender
            </label>
            <select
              name="GENDER"
              id="GENDER"
              value={(formData.GENDER as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              disabled={!!selectedPatient}
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          {/* PHONE NUMBER */}
          <div>
            <label htmlFor="PHONE NUMBER" className="block text-sm font-medium text-gray-700">
              Phone Number
            </label>
            <input
              type="text"
              name="PHONE NUMBER"
              id="PHONE NUMBER"
              value={(formData['PHONE NUMBER'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly={!!selectedPatient}
            />
          </div>

          {/* ADDRESS */}
          <div>
            <label htmlFor="ADDRESS" className="block text-sm font-medium text-gray-700">
              Address
            </label>
            <input
              type="text"
              name="ADDRESS"
              id="ADDRESS"
              value={(formData.ADDRESS as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              readOnly={!!selectedPatient}
            />
          </div>

          {/* DOCTOR NAME */}
          <div>
            <label htmlFor="DOCTOR NAME" className="block text-sm font-medium text-gray-700">
              Doctor Name
            </label>
            <input
              type="text"
              name="DOCTOR NAME"
              id="DOCTOR NAME"
              value={(formData['DOCTOR NAME'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* DEPARTMENT */}
          <div>
            <label htmlFor="DEPARTMENT" className="block text-sm font-medium text-gray-700">
              Department
            </label>
            <input
              type="text"
              name="DEPARTMENT"
              id="DEPARTMENT"
              value={(formData.DEPARTMENT as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* REFERRED BY */}
          <div>
            <label htmlFor="REFFERED BY" className="block text-sm font-medium text-gray-700">
              Referred By
            </label>
            <input
              type="text"
              name="REFFERED BY"
              id="REFFERED BY"
              value={(formData['REFFERED BY'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Lab Tests Section */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Lab Tests</h3>
        <div className="space-y-4">
          {Array.from({ length: visibleLabTests }).map((_, index) => {
            const testNumber = index + 1
            const testKey = `LAB TEST ${testNumber}`
            const amountKey = `AMOUNT ${testNumber}`

            return (
              <div key={testNumber} className="grid grid-cols-2 gap-4">
                {/* Lab Test Name */}
                <div>
                  <label htmlFor={testKey} className="block text-sm font-medium text-gray-700">
                    Lab Test {testNumber}
                  </label>
                  <EditableCombobox
                    id={testKey}
                    name={testKey}
                    value={(formData[testKey] as string) || ''}
                    onChange={(e) => handleChange(e)}
                    options={dynamicLabTestOptions}
                    placeholder={`Enter lab test name ${testNumber}`}
                    onAddNewOption={(fieldName, value) =>
                      addNewOptionPermanently('labTestOptions', value)
                    }
                  />
                </div>

                {/* Amount */}
                <div>
                  <label htmlFor={amountKey} className="block text-sm font-medium text-gray-700">
                    Amount {testNumber}
                  </label>
                  <div className="mt-1 relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <span className="text-gray-500 sm:text-sm">₹</span>
                    </div>
                    <input
                      type="number"
                      name={amountKey}
                      id={amountKey}
                      value={(formData[amountKey] as string) || ''}
                      onChange={handleChange}
                      className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                      placeholder="0.00"
                    />
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        {visibleLabTests < 10 && (
          <button
            type="button"
            onClick={() => setVisibleLabTests(Math.min(visibleLabTests + 1, 10))}
            className="mt-4 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 6v6m0 0v6m0-6h6m-6 0H6"
              />
            </svg>
            Add More Lab Tests
          </button>
        )}
      </div>

      {/* Billing Section */}
      <div className="bg-white p-4 rounded-md shadow">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Billing Information</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* Total Amount */}
          <div>
            <label htmlFor="TOTAL AMOUNT" className="block text-sm font-medium text-gray-700">
              Total Amount
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                name="TOTAL AMOUNT"
                id="TOTAL AMOUNT"
                value={(formData['TOTAL AMOUNT'] as number) || 0}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              />
            </div>
          </div>

          {/* Discount Percentage */}
          <div>
            <label
              htmlFor="DISCOUNT PERCENTAGE"
              className="block text-sm font-medium text-gray-700"
            >
              Discount (%)
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <input
                type="number"
                name="DISCOUNT PERCENTAGE"
                id="DISCOUNT PERCENTAGE"
                value={(formData['DISCOUNT PERCENTAGE'] as number) || 0}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                max="100"
                step="0.01"
              />
              <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">%</span>
              </div>
            </div>
          </div>

          {/* Amount Received */}
          <div>
            <label htmlFor="AMOUNT RECEIVED" className="block text-sm font-medium text-gray-700">
              Amount Received
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                name="AMOUNT RECEIVED"
                id="AMOUNT RECEIVED"
                value={(formData['AMOUNT RECEIVED'] as number) || 0}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                min="0"
                step="0.01"
              />
            </div>
          </div>

          {/* Amount Due */}
          <div>
            <label htmlFor="AMOUNT DUE" className="block text-sm font-medium text-gray-700">
              Amount Due
            </label>
            <div className="mt-1 relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <span className="text-gray-500 sm:text-sm">₹</span>
              </div>
              <input
                type="number"
                name="AMOUNT DUE"
                id="AMOUNT DUE"
                value={(formData['AMOUNT DUE'] as number) || 0}
                readOnly
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 pl-8 pr-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-gray-100"
              />
            </div>
          </div>
        </div>
      </div>

      <div className="pt-5 border-t border-gray-200">
        <div className="flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-white text-gray-700 border border-gray-300 rounded-md shadow-sm hover:bg-gray-50 mr-3"
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-500 text-white rounded-md shadow-sm hover:bg-blue-600"
          >
            Save
          </button>
        </div>
      </div>
    </form>
  )
}

export default LabForm
