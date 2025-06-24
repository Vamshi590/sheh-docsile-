import React, { useState, useEffect } from 'react'
import { medicineOptions, adviceOptions, timingOptions } from '../../utils/dropdownOptions'

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

// Extend window.api interface to include getPatients method
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

interface PrescriptionFormProps {
  onSubmit: (prescription: Omit<Prescription, 'id'>) => Promise<void>
  onCancel: () => void
  prescriptionCount: number
  initialData?: Partial<Prescription>
  selectedPatient?: Patient | null
  patients?: Patient[]
}

const PrescriptionForm: React.FC<PrescriptionFormProps> = ({
  onSubmit,
  onCancel,
  prescriptionCount,
  initialData = {},
  selectedPatient = null,
  patients = []
}) => {
  // Form state
  const [formData, setFormData] = useState<Omit<Prescription, 'id'>>(() => {
    // Initialize with default values or initial data
    return {
      'DOCTOR NAME': 'Dr. Srilatha ch',
      DEPARTMENT: 'Opthalmology',
      'REFFERED BY': 'Self',
      'PRESENT COMPLAIN': '',
      'PREVIOUS HISTORY': '',
      OTHERS: '',
      OTHERS1: '',
      // Initialize prescription fields
      ...Object.fromEntries(
        Array.from({ length: 10 }).flatMap((_, index) => [
          [`PRESCRIPTION ${index + 1}`, ''],
          [`DAYS ${index + 1}`, ''],
          [`TIMING ${index + 1}`, '']
        ])
      ),
      // Initialize advice fields
      ...Object.fromEntries(
        Array.from({ length: 10 }).map((_, index) => [`ADVICE ${index + 1}`, ''])
      ),
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
      ...initialData
    } as Omit<Prescription, 'id'>
  })

  // State to track number of visible prescription and advice fields
  const [visiblePrescriptions, setVisiblePrescriptions] = useState(2)
  const [visibleAdvice, setVisibleAdvice] = useState(2)

  // No need to fetch patients as they are passed as props

  // Auto-generate Sno based on prescription count
  useEffect(() => {
    if (!initialData.Sno) {
      setFormData((prev) => ({
        ...prev,
        Sno: prescriptionCount + 1
      }))
    }
  }, [prescriptionCount, initialData])

  // Handle form input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ): void => {
    const { name, value, type } = e.target
    let processedValue: string | number = value

    // Convert numeric fields to numbers
    if (
      type === 'number' ||
      name === 'AGE' ||
      name === 'TOTAL AMOUNT' ||
      name === 'ADVANCE PAID' ||
      name === 'AMOUNT RECEIVED' ||
      name === 'DISCOUNT PERCENTAG' ||
      name === 'DISCOUNT AMOUNT' ||
      name === 'AMOUNT DUE' ||
      name === 'TEMPARATURE' ||
      name === 'P.R.' ||
      name === 'SPO2'
    ) {
      processedValue = value === '' ? '' : Number(value)
    }

    setFormData((prev) => ({
      ...prev,
      [name]: processedValue
    }))

    // Auto-fill patient information when patient ID, name, or phone number is entered
    if (name === 'PATIENT ID' || name === 'GUARDIAN NAME' || name === 'PHONE NUMBER') {
      const searchValue = value.toString().trim().toLowerCase()
      if (searchValue) {
        const foundPatient = patients.find((patient) => {
          return (
            (patient['PATIENT ID'] &&
              patient['PATIENT ID'].toString().toLowerCase().includes(searchValue)) ||
            (patient['GUARDIAN NAME'] &&
              patient['GUARDIAN NAME'].toString().toLowerCase().includes(searchValue)) ||
            (patient['PHONE NUMBER'] &&
              patient['PHONE NUMBER'].toString().toLowerCase().includes(searchValue))
          )
        })

        if (foundPatient) {
          setFormData((prev) => ({
            ...prev,
            'PATIENT ID': foundPatient['PATIENT ID'] || prev['PATIENT ID'],
            'GUARDIAN NAME': foundPatient['GUARDIAN NAME'] || prev['GUARDIAN NAME'],
            'PHONE NUMBER': foundPatient['PHONE NUMBER'] || prev['PHONE NUMBER'],
            DOB: foundPatient.DOB || prev.DOB,
            AGE: foundPatient.AGE || prev.AGE,
            GENDER: foundPatient.GENDER || prev.GENDER,
            ADDRESS: foundPatient.ADDRESS || prev.ADDRESS
          }))
        }
      }
    }
  }

  // Auto-calculate financial fields
  useEffect(() => {
    const totalAmount =
      typeof formData['TOTAL AMOUNT'] === 'number' ? (formData['TOTAL AMOUNT'] as number) : 0
    const advancePaid =
      typeof formData['ADVANCE PAID'] === 'number' ? (formData['ADVANCE PAID'] as number) : 0
    const amountReceived =
      typeof formData['AMOUNT RECEIVED'] === 'number' ? (formData['AMOUNT RECEIVED'] as number) : 0
    const discountPercentage =
      typeof formData['DISCOUNT PERCENTAG'] === 'number'
        ? (formData['DISCOUNT PERCENTAG'] as number)
        : 0

    // Calculate discount amount
    const discountAmount = (totalAmount * discountPercentage) / 100

    // Calculate amount due
    const amountDue = totalAmount - advancePaid - amountReceived - discountAmount

    setFormData((prev) => ({
      ...prev,
      'DISCOUNT AMOUNT': discountAmount,
      'AMOUNT DUE': amountDue
    }))
  }, [formData])

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    try {
      // Add current date if not present
      if (!formData['DATE']) {
        formData['DATE'] = new Date().toISOString().split('T')[0]
      }

      await onSubmit(formData)

      // Reset form after submission
      setFormData({
        Sno: prescriptionCount + 2 // Increment for next entry
      })
    } catch (error) {
      console.error('Error submitting form:', error)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <p className="text-sm text-gray-500 mb-4">Fields marked with * are required</p>

      {/* Vital Signs Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Vital Signs</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* TEMPARATURE */}
          <div>
            <label htmlFor="TEMPARATURE" className="block text-sm font-medium text-gray-700">
              Temperature (°F)
            </label>
            <input
              type="number"
              name="TEMPARATURE"
              id="TEMPARATURE"
              step="0.1"
              value={(formData.TEMPARATURE as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* P.R. (Pulse Rate) */}
          <div>
            <label htmlFor="P.R." className="block text-sm font-medium text-gray-700">
              Pulse Rate (bpm)
            </label>
            <input
              type="number"
              name="P.R."
              id="P.R."
              value={(formData['P.R.'] as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* SPO2 */}
          <div>
            <label htmlFor="SPO2" className="block text-sm font-medium text-gray-700">
              SPO2 (%)
            </label>
            <input
              type="number"
              name="SPO2"
              id="SPO2"
              min="0"
              max="100"
              value={(formData.SPO2 as number) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Patient Complaint Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Present Complain */}
          <div>
            <label htmlFor="PRESENT COMPLAIN" className="block text-sm font-medium text-gray-700">
              Present Complain
            </label>
            <input
              type="text"
              name="PRESENT COMPLAIN"
              id="PRESENT COMPLAIN"
              value={(formData['PRESENT COMPLAIN'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Previous History */}
          <div>
            <label htmlFor="PREVIOUS HISTORY" className="block text-sm font-medium text-gray-700">
              Previous History
            </label>
            <input
              type="text"
              name="PREVIOUS HISTORY"
              id="PREVIOUS HISTORY"
              value={(formData['PREVIOUS HISTORY'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Others */}
          <div>
            <label htmlFor="OTHERS" className="block text-sm font-medium text-gray-700">
              Others
            </label>
            <input
              type="text"
              name="OTHERS"
              id="OTHERS"
              value={(formData['OTHERS'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>

          {/* Others1 */}
          <div>
            <label htmlFor="OTHERS1" className="block text-sm font-medium text-gray-700">
              Others1
            </label>
            <input
              type="text"
              name="OTHERS1"
              id="OTHERS1"
              value={(formData['OTHERS1'] as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
            />
          </div>
        </div>
      </div>

      {/* Prescription Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Prescription Details</h3>

        {/* Dynamic Prescription Fields */}
        {Array.from({ length: visiblePrescriptions }).map((_, index) => (
          <div
            key={`prescription-${index + 1}`}
            className="mb-4 p-3 border border-gray-200 rounded-md"
          >
            <h4 className="font-medium mb-2">Prescription {index + 1}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Prescription */}
              <div>
                <label
                  htmlFor={`PRESCRIPTION ${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Prescription {index + 1}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name={`PRESCRIPTION ${index + 1}`}
                    id={`PRESCRIPTION ${index + 1}`}
                    value={(formData[`PRESCRIPTION ${index + 1}`] as string) || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="Medicine name, dosage"
                    list={`medicine-options-${index}`}
                    autoComplete="off"
                  />
                  <datalist id={`medicine-options-${index}`}>
                    {medicineOptions.map((option, i) => (
                      <option key={i} value={option} />
                    ))}
                  </datalist>
                </div>
              </div>

              {/* Days */}
              <div>
                <label
                  htmlFor={`DAYS ${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Days {index + 1}
                </label>
                <input
                  type="text"
                  name={`DAYS ${index + 1}`}
                  id={`DAYS ${index + 1}`}
                  value={(formData[`DAYS ${index + 1}`] as string) || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Number of days"
                />
              </div>

              {/* Timing */}
              <div>
                <label
                  htmlFor={`TIMING ${index + 1}`}
                  className="block text-sm font-medium text-gray-700"
                >
                  Timing {index + 1}
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name={`TIMING ${index + 1}`}
                    id={`TIMING ${index + 1}`}
                    value={(formData[`TIMING ${index + 1}`] as string) || ''}
                    onChange={handleChange}
                    className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                    placeholder="e.g., Morning, Afternoon, Night"
                    list={`timing-options-${index}`}
                    autoComplete="off"
                  />
                  <datalist id={`timing-options-${index}`}>
                    {timingOptions.map((option, i) => (
                      <option key={i} value={option} />
                    ))}
                  </datalist>
                </div>
              </div>
            </div>
          </div>
        ))}

        {/* Add More Prescription Button */}
        {visiblePrescriptions < 10 && (
          <button
            type="button"
            onClick={() => setVisiblePrescriptions((prev) => Math.min(prev + 1, 10))}
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
            Add More Prescription
          </button>
        )}
      </div>

      {/* Advice Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor's Advice</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: visibleAdvice }).map((_, index) => (
            <div key={`advice-${index + 1}`}>
              <label
                htmlFor={`ADVICE ${index + 1}`}
                className="block text-sm font-medium text-gray-700"
              >
                Advice {index + 1}
              </label>
              <div className="relative">
                <input
                  type="text"
                  name={`ADVICE ${index + 1}`}
                  id={`ADVICE ${index + 1}`}
                  value={(formData[`ADVICE ${index + 1}`] as string) || ''}
                  onChange={handleChange}
                  className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                  placeholder="Enter advice"
                  list={`advice-options-${index}`}
                  autoComplete="off"
                />
                <datalist id={`advice-options-${index}`}>
                  {adviceOptions.map((option, i) => (
                    <option key={i} value={option} />
                  ))}
                </datalist>
              </div>
            </div>
          ))}
        </div>
        {visibleAdvice < 10 && (
          <button
            type="button"
            onClick={() => setVisibleAdvice(Math.min(visibleAdvice + 1, 10))}
            className="mt-2 inline-flex items-center px-3 py-2 border border-transparent text-sm leading-4 font-medium rounded-md shadow-sm text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
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
            Add More Advice
          </button>
        )}
      </div>

      {/* Additional Notes Section */}
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Additional Notes</h3>
        <div className="grid grid-cols-2 gap-4">
          {/* NOTES */}
          <div>
            <label htmlFor="NOTES" className="block text-sm font-medium text-gray-700">
              Notes
            </label>
            <input
              type="text"
              name="NOTES"
              id="NOTES"
              value={(formData.NOTES as string) || ''}
              onChange={handleChange}
              className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              placeholder="Additional notes"
            />
          </div>

          {/* FOLLOW UP DATE */}
          <div>
            <label htmlFor="FOLLOW UP DATE" className="block text-sm font-medium text-gray-700">
              Follow Up Date
            </label>
            <div className="relative">
              <input
                type="date"
                name="FOLLOW UP DATE"
                id="FOLLOW UP DATE"
                value={(formData['FOLLOW UP DATE'] as string) || ''}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
              <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none mt-1">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                  />
                </svg>
              </div>
            </div>
            <p className="mt-1 text-xs text-gray-500">Click to select a date</p>
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

export default PrescriptionForm
