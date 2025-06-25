import React, { useState, useEffect } from 'react'
import { Patient } from './ReceiptForm'

interface ReadingFormData {
  patientId: string

  // Glasses Reading (GR)
  'GR-RE-D-SPH': string
  'GR-RE-D-CYL': string
  'GR-RE-D-AXIS': string
  'GR-RE-D-VISION': string
  'GR-RE-N-SPH': string
  'GR-RE-N-CYL': string
  'GR-RE-N-AXIS': string
  'GR-RE-N-VISION': string
  'GR-LE-D-SPH': string
  'GR-LE-D-CYL': string
  'GR-LE-D-AXIS': string
  'GR-LE-D-VISION': string
  'GR-LE-N-SPH': string
  'GR-LE-N-CYL': string
  'GR-LE-N-AXIS': string
  'GR-LE-N-VISION': string
  'ADVISED FOR': string
  // Auto Refractometer (AR)
  'AR-RE-SPH': string
  'AR-RE-CYL': string
  'AR-RE-AXIS': string
  'AR-RE-VA': string
  'AR-RE-VAC.P.H': string
  'AR-LE-SPH': string
  'AR-LE-CYL': string
  'AR-LE-AXIS': string
  'AR-LE-VA': string
  'AR-LE-VAC.P.H': string
  // Power Glass Prescription (PGP)
  'PGP-RE-D-SPH': string
  'PGP-RE-D-CYL': string
  'PGP-RE-D-AXIS': string
  'PGP-RE-D-VA': string
  'PGP-RE-N-SPH': string
  'PGP-RE-N-CYL': string
  'PGP-RE-N-AXIS': string
  'PGP-RE-N-VA': string
  'PGP-LE-D-SPH': string
  'PGP-LE-D-CYL': string
  'PGP-LE-D-AXIS': string
  'PGP-LE-D-BCVA': string
  'PGP-LE-N-SPH': string
  'PGP-LE-N-CYL': string
  'PGP-LE-N-AXIS': string
  'PGP-LE-N-BCVA': string
  // Subjective Refraction (SR)
  'SR-RE-D-SPH': string
  'SR-RE-D-CYL': string
  'SR-RE-D-AXIS': string
  'SR-RE-D-VA': string
  'SR-RE-N-SPH': string
  'SR-RE-N-CYL': string
  'SR-RE-N-AXIS': string
  'SR-RE-N-VA': string
  'SR-LE-D-SPH': string
  'SR-LE-D-CYL': string
  'SR-LE-D-AXIS': string
  'SR-LE-D-BCVA': string
  'SR-LE-N-SPH': string
  'SR-LE-N-CYL': string
  'SR-LE-N-AXIS': string
  'SR-LE-N-BCVA': string

  // Clinical Findings (CF)

  'CF-RE-LIDS': string
  'CF-RE-SAC': string
  'CF-RE-CONJUCTIVA': string
  'CF-RE-CORNEA': string
  'CF-RE-A.C.': string
  'CF-RE-IRIS': string
  'CF-RE-PUPIL': string
  'CF-RE-LENS': string
  'CF-RE-TENSION': string
  'CF-RE-FUNDUS': string
  'CF-RE-RETINO 1': string
  'CF-RE-RETINO 2': string
  'CF-RE-RETINO 3': string
  'CF-RE-RETINO 4': string
  'CF-LE-LIDS': string
  'CF-LE-SAC': string
  'CF-LE-CONJUCTIVA': string
  'CF-LE-CORNEA': string
  'CF-LE-A.C.': string
  'CF-LE-IRIS': string
  'CF-LE-PUPIL': string
  'CF-LE-LENS': string
  'CF-LE-TENSION': string
  'CF-LE-FUNDUS': string
  'CF-LE-RETINO 1': string
  'CF-LE-RETINO 2': string
  'CF-LE-RETINO 3': string
  'CF-LE-RETINO 4': string

  // Index signature for compatibility with Prescription type
  [key: string]: string | number | readonly string[] | undefined
}

interface ReadingFormProps {
  onSubmit: (formData: ReadingFormData) => Promise<void>
  onCancel: () => void
  // Keeping patients for API compatibility
  patients?: Patient[]
  selectedPatient: Patient | null
}

const ReadingForm: React.FC<ReadingFormProps> = ({ onSubmit, onCancel, selectedPatient }) => {
  const [formData, setFormData] = useState<ReadingFormData>({
    patientId: selectedPatient?.patientId || '',

    // Section 1: Glasses Reading (GR)
    'GR-RE-D-SPH': '',
    'GR-RE-D-CYL': '',
    'GR-RE-D-AXIS': '',
    'GR-RE-D-VISION': '',
    'GR-RE-N-SPH': '',
    'GR-RE-N-CYL': '',
    'GR-RE-N-AXIS': '',
    'GR-RE-N-VISION': '',
    'GR-LE-D-SPH': '',
    'GR-LE-D-CYL': '',
    'GR-LE-D-AXIS': '',
    'GR-LE-D-VISION': '',
    'GR-LE-N-SPH': '',
    'GR-LE-N-CYL': '',
    'GR-LE-N-AXIS': '',
    'GR-LE-N-VISION': '',
    'ADVISED FOR': '',

    // Section 2: Auto Refractometer (AR)
    'AR-RE-SPH': '',
    'AR-RE-CYL': '',
    'AR-RE-AXIS': '',
    'AR-RE-VA': '',
    'AR-RE-VAC.P.H': '',
    'AR-LE-SPH': '',
    'AR-LE-CYL': '',
    'AR-LE-AXIS': '',
    'AR-LE-VA': '',
    'AR-LE-VAC.P.H': '',

    // Section 3: Power Glass Prescription (PGP)
    'PGP-RE-D-SPH': '',
    'PGP-RE-D-CYL': '',
    'PGP-RE-D-AXIS': '',
    'PGP-RE-D-VA': '',
    'PGP-RE-N-SPH': '',
    'PGP-RE-N-CYL': '',
    'PGP-RE-N-AXIS': '',
    'PGP-RE-N-VA': '',
    'PGP-LE-D-SPH': '',
    'PGP-LE-D-CYL': '',
    'PGP-LE-D-AXIS': '',
    'PGP-LE-D-BCVA': '',
    'PGP-LE-N-SPH': '',
    'PGP-LE-N-CYL': '',
    'PGP-LE-N-AXIS': '',
    'PGP-LE-N-BCVA': '',

    // Section 4: Subjective Refraction (SR)
    'SR-RE-D-SPH': '',
    'SR-RE-D-CYL': '',
    'SR-RE-D-AXIS': '',
    'SR-RE-D-VA': '',
    'SR-RE-N-SPH': '',
    'SR-RE-N-CYL': '',
    'SR-RE-N-AXIS': '',
    'SR-RE-N-VA': '',
    'SR-LE-D-SPH': '',
    'SR-LE-D-CYL': '',
    'SR-LE-D-AXIS': '',
    'SR-LE-D-BCVA': '',
    'SR-LE-N-SPH': '',
    'SR-LE-N-CYL': '',
    'SR-LE-N-AXIS': '',
    'SR-LE-N-BCVA': '',

    // Section 5: Clinical Findings (CF) - Using the exact field names from Excel
    'CF-RE-LIDS': '',
    'CF-RE-SAC': '',
    'CF-RE-CONJUCTIVA': '',
    'CF-RE-CORNEA': '',
    'CF-RE-A.C.': '',
    'CF-RE-IRIS': '',
    'CF-RE-PUPIL': '',
    'CF-RE-LENS': '',
    'CF-RE-TENSION': '',
    'CF-RE-FUNDUS': '',
    'CF-RE-RETINO 1': '',
    'CF-RE-RETINO 2': '',
    'CF-RE-RETINO 3': '',
    'CF-RE-RETINO 4': '',
    'CF-LE-LIDS': '',
    'CF-LE-SAC': '',
    'CF-LE-CONJUCTIVA': '',
    'CF-LE-CORNEA': '',
    'CF-LE-A.C.': '',
    'CF-LE-IRIS': '',
    'CF-LE-PUPIL': '',
    'CF-LE-LENS': '',
    'CF-LE-TENSION': '',
    'CF-LE-FUNDUS': '',
    'CF-LE-RETINO 1': '',
    'CF-LE-RETINO 2': '',
    'CF-LE-RETINO 3': '',
    'CF-LE-RETINO 4': ''
  })

  // Update form data when selected patient changes
  useEffect(() => {
    if (selectedPatient) {
      setFormData((prevData) => ({
        ...prevData,
        patientId: selectedPatient.patientId,
        patientName: selectedPatient.name
      }))
    }
  }, [selectedPatient])

  // Handle input changes
  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ): void => {
    const { name, value } = e.target

    // Ensure the value is always a string to match our interface
    const stringValue = typeof value === 'string' ? value : String(value)

    setFormData((prevData) => ({
      ...prevData,
      [name]: stringValue
    }))
  }

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()
    await onSubmit(formData)
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <h2 className="text-xl font-medium">Eye Reading Form</h2>

      {/* Section 1: Glasses Reading (GR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Glasses Reading (GR)</h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance (GR-RE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="GR-RE-D-SPH"
                value={formData['GR-RE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="GR-RE-D-CYL"
                value={formData['GR-RE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="GR-RE-D-AXIS"
                value={formData['GR-RE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VISION</label>
              <input
                type="text"
                name="GR-RE-D-VISION"
                value={formData['GR-RE-D-VISION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Near (GR-RE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="GR-RE-N-SPH"
                value={formData['GR-RE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="GR-RE-N-CYL"
                value={formData['GR-RE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="GR-RE-N-AXIS"
                value={formData['GR-RE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VISION</label>
              <input
                type="text"
                name="GR-RE-N-VISION"
                value={formData['GR-RE-N-VISION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance (GR-LE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="GR-LE-D-SPH"
                value={formData['GR-LE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="GR-LE-D-CYL"
                value={formData['GR-LE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="GR-LE-D-AXIS"
                value={formData['GR-LE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VISION</label>
              <input
                type="text"
                name="GR-LE-D-VISION"
                value={formData['GR-LE-D-VISION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Near (GR-LE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="GR-LE-N-SPH"
                value={formData['GR-LE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="GR-LE-N-CYL"
                value={formData['GR-LE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="GR-LE-N-AXIS"
                value={formData['GR-LE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VISION</label>
              <input
                type="text"
                name="GR-LE-N-VISION"
                value={formData['GR-LE-N-VISION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 2: Auto Refractometer (AR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Auto Refractometer (AR)</h3>

        {/* Right Eye */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye (AR-RE):</h4>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="AR-RE-SPH"
                value={formData['AR-RE-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="AR-RE-CYL"
                value={formData['AR-RE-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="AR-RE-AXIS"
                value={formData['AR-RE-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="AR-RE-VA"
                value={formData['AR-RE-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VAC.P.H</label>
              <input
                type="text"
                name="AR-RE-VAC.P.H"
                value={formData['AR-RE-VAC.P.H']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Left Eye (AR-LE):</h4>
          <div className="grid grid-cols-5 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="AR-LE-SPH"
                value={formData['AR-LE-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="AR-LE-CYL"
                value={formData['AR-LE-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="AR-LE-AXIS"
                value={formData['AR-LE-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="AR-LE-VA"
                value={formData['AR-LE-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VAC.P.H</label>
              <input
                type="text"
                name="AR-LE-VAC.P.H"
                value={formData['AR-LE-VAC.P.H']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 3: Power Glass Prescription (PGP) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">
          Power Glass Prescription (PGP)
        </h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance (PGP-RE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="PGP-RE-D-SPH"
                value={formData['PGP-RE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="PGP-RE-D-CYL"
                value={formData['PGP-RE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="PGP-RE-D-AXIS"
                value={formData['PGP-RE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="PGP-RE-D-VA"
                value={formData['PGP-RE-D-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Near (PGP-RE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="PGP-RE-N-SPH"
                value={formData['PGP-RE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="PGP-RE-N-CYL"
                value={formData['PGP-RE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="PGP-RE-N-AXIS"
                value={formData['PGP-RE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="PGP-RE-N-VA"
                value={formData['PGP-RE-N-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance (PGP-LE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="PGP-LE-D-SPH"
                value={formData['PGP-LE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="PGP-LE-D-CYL"
                value={formData['PGP-LE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="PGP-LE-D-AXIS"
                value={formData['PGP-LE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">BCVA</label>
              <input
                type="text"
                name="PGP-LE-D-BCVA"
                value={formData['PGP-LE-D-BCVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Left Eye - Near (PGP-LE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="PGP-LE-N-SPH"
                value={formData['PGP-LE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="PGP-LE-N-CYL"
                value={formData['PGP-LE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="PGP-LE-N-AXIS"
                value={formData['PGP-LE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">BCVA</label>
              <input
                type="text"
                name="PGP-LE-N-BCVA"
                value={formData['PGP-LE-N-BCVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 4: Subjective Refraction (SR) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Subjective Refraction (SR)</h3>

        {/* Right Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Distance (SR-RE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="SR-RE-D-SPH"
                value={formData['SR-RE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="SR-RE-D-CYL"
                value={formData['SR-RE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="SR-RE-D-AXIS"
                value={formData['SR-RE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="SR-RE-D-VA"
                value={formData['SR-RE-D-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Right Eye - Near */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye - Near (SR-RE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="SR-RE-N-SPH"
                value={formData['SR-RE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="SR-RE-N-CYL"
                value={formData['SR-RE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="SR-RE-N-AXIS"
                value={formData['SR-RE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">VA</label>
              <input
                type="text"
                name="SR-RE-N-VA"
                value={formData['SR-RE-N-VA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Distance */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye - Distance (SR-LE-D):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="SR-LE-D-SPH"
                value={formData['SR-LE-D-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="SR-LE-D-CYL"
                value={formData['SR-LE-D-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="SR-LE-D-AXIS"
                value={formData['SR-LE-D-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">BCVA</label>
              <input
                type="text"
                name="SR-LE-D-BCVA"
                value={formData['SR-LE-D-BCVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye - Near */}
        <div className="mb-1">
          <h4 className="text-sm font-medium mb-1">Left Eye - Near (SR-LE-N):</h4>
          <div className="grid grid-cols-4 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">SPH</label>
              <input
                type="text"
                name="SR-LE-N-SPH"
                value={formData['SR-LE-N-SPH']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">CYL</label>
              <input
                type="text"
                name="SR-LE-N-CYL"
                value={formData['SR-LE-N-CYL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">AXIS</label>
              <input
                type="text"
                name="SR-LE-N-AXIS"
                value={formData['SR-LE-N-AXIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">BCVA</label>
              <input
                type="text"
                name="SR-LE-N-BCVA"
                value={formData['SR-LE-N-BCVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Section 5: Clinical Findings (CF) */}
      <div className="bg-gray-50 p-3 rounded-md">
        <h3 className="text-md font-medium mb-2 flex items-center">Clinical Findings (CF)</h3>

        {/* Right Eye Clinical Findings */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Right Eye:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Lid</label>
              <input
                type="text"
                name="CF-RE-LIDS"
                value={formData['CF-RE-LIDS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">SAC</label>
              <input
                type="text"
                name="CF-RE-SAC"
                value={formData['CF-RE-SAC']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Cornea</label>
              <input
                type="text"
                name="CF-RE-CORNEA"
                value={formData['CF-RE-CORNEA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
              <input
                type="text"
                name="CF-RE-CONJUCTIVA"
                value={formData['CF-RE-CONJUCTIVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
              <input
                type="text"
                name="CF-RE-A.C."
                value={formData['CF-RE-A.C.']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Iris</label>
              <input
                type="text"
                name="CF-RE-IRIS"
                value={formData['CF-RE-IRIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pupil</label>
              <input
                type="text"
                name="CF-RE-PUPIL"
                value={formData['CF-RE-PUPIL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Lens</label>
              <input
                type="text"
                name="CF-RE-LENS"
                value={formData['CF-RE-LENS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Tension</label>
              <input
                type="text"
                name="CF-RE-TENSION"
                value={formData['CF-RE-TENSION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Fundus</label>
              <input
                type="text"
                name="CF-RE-FUNDUS"
                value={formData['CF-RE-FUNDUS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 1</label>
              <input
                type="text"
                name="CF-RE-RETINO 1"
                value={formData['CF-RE-RETINO 1']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 2</label>
              <input
                type="text"
                name="CF-RE-RETINO 2"
                value={formData['CF-RE-RETINO 2']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 3</label>
              <input
                type="text"
                name="CF-RE-RETINO 3"
                value={formData['CF-RE-RETINO 3']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 4</label>
              <input
                type="text"
                name="CF-RE-RETINO 4"
                value={formData['CF-RE-RETINO 4']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Left Eye Clinical Findings */}
        <div className="mb-3">
          <h4 className="text-sm font-medium mb-1">Left Eye:</h4>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-gray-700">Lids</label>
              <input
                type="text"
                name="CF-LE-LIDS"
                value={formData['CF-LE-LIDS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">SAC</label>
              <input
                type="text"
                name="CF-LE-SAC"
                value={formData['CF-LE-SAC']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Cornea</label>
              <input
                type="text"
                name="CF-LE-CORNEA"
                value={formData['CF-LE-CORNEA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Conjunctiva</label>
              <input
                type="text"
                name="CF-LE-CONJUCTIVA"
                value={formData['CF-LE-CONJUCTIVA']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Anterior Chamber</label>
              <input
                type="text"
                name="CF-LE-A.C."
                value={formData['CF-LE-A.C.']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Iris</label>
              <input
                type="text"
                name="CF-LE-IRIS"
                value={formData['CF-LE-IRIS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Pupil</label>
              <input
                type="text"
                name="CF-LE-PUPIL"
                value={formData['CF-LE-PUPIL']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Lens</label>
              <input
                type="text"
                name="CF-LE-LENS"
                value={formData['CF-LE-LENS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Tension</label>
              <input
                type="text"
                name="CF-LE-TENSION"
                value={formData['CF-LE-TENSION']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Fundus</label>
              <input
                type="text"
                name="CF-LE-FUNDUS"
                value={formData['CF-LE-FUNDUS']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 1 </label>
              <input
                type="text"
                name="CF-LE-RETINO 1"
                value={formData['CF-LE-RETINO 1']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 2</label>
              <input
                type="text"
                name="CF-LE-RETINO 2"
                value={formData['CF-LE-RETINO 2']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 3</label>
              <input
                type="text"
                name="CF-LE-RETINO 3"
                value={formData['CF-LE-RETINO 3']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700">Retino 4</label>
              <input
                type="text"
                name="CF-LE-RETINO 4"
                value={formData['CF-LE-RETINO 4']}
                onChange={handleChange}
                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm py-1 px-2 text-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Submit and Cancel Buttons */}
      <div className="flex justify-end space-x-3 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700"
        >
          Save
        </button>
      </div>
    </form>
  )
}

export default ReadingForm
