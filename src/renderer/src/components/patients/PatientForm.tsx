import React, { useState, useEffect } from 'react'
import {
  statusOptions,
  doctorOptions,
  departmentOptions,
  referredByOptions
} from '../../utils/dropdownOptions'

interface PatientFormProps {
  onSubmit: (patient: {
    date: string
    patientId: string
    name: string
    guardian: string
    dob: string
    age: number
    gender: string
    phone: string
    address: string
    status: string
    doctorName: string
    department: string
    referredBy: string
  }) => void
  initialValues?: {
    date: string
    patientId: string
    name: string
    guardian: string
    dob: string
    age: number
    gender: string
    phone: string
    address: string
    status: string
    doctorName: string
    department: string
    referredBy: string
  }
  patientCount?: number
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, initialValues, patientCount = 0 }) => {
  const [formData, setFormData] = useState({
    date: initialValues?.date || String(new Date().toISOString().split('T')[0]),
    patientId: initialValues?.patientId || '',
    name: initialValues?.name || '',
    guardian: initialValues?.guardian || '',
    dob: initialValues?.dob || '',
    age: initialValues?.age || 0,
    gender: initialValues?.gender || '',
    phone: initialValues?.phone || '',
    address: initialValues?.address || '',
    status: initialValues?.status || 'Regular',
    doctorName: initialValues?.doctorName || 'Dr. Srilatha ch',
    department: initialValues?.department || 'Opthalmology',
    referredBy: initialValues?.referredBy || 'Self'
  })

  // Auto-generate patient ID based on patient count when creating a new patient
  useEffect(() => {
    if (!initialValues && !formData.patientId) {
      // Format patient ID as a 4-digit number (e.g., 0001, 0002, etc.)
      const nextId = (patientCount + 1).toString().padStart(4, '0')
      setFormData((prevData) => ({ ...prevData, patientId: nextId }))
    }
  }, [patientCount, initialValues, formData.patientId])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>): void => {
    const { name, value } = e.target

    // Calculate age if DOB changes
    if (name === 'dob') {
      const birthDate = new Date(value)
      const today = new Date()
      let age = today.getFullYear() - birthDate.getFullYear()
      const monthDiff = today.getMonth() - birthDate.getMonth()

      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
        age--
      }

      setFormData({
        ...formData,
        [name]: value,
        age: age
      })
    } else {
      setFormData({
        ...formData,
        [name]: name === 'age' ? parseInt(value) || 0 : value
      })
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()
    onSubmit(formData)

    // Clear form if it's not for editing (no initialValues)
    if (!initialValues) {
      setFormData({
        date: String(new Date().toISOString().split('T')[0]),
        patientId: '',
        name: '',
        guardian: '',
        dob: '',
        age: 0,
        gender: '',
        phone: '',
        address: '',
        doctorName: '',
        department: '',
        referredBy: '',
        status: ''
      })
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Patient Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="date" className="block text-sm font-medium text-gray-700 mb-1">
              Date
            </label>
            <input
              type="date"
              id="date"
              name="date"
              value={formData.date}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="patientId" className="block text-sm font-medium text-gray-700 mb-1">
              Patient ID
            </label>
            <input
              type="text"
              id="patientId"
              name="patientId"
              value={formData.patientId}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 bg-gray-50"
              readOnly={!initialValues} // Make it read-only for new patients
              required
            />
          </div>

          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
              Name
            </label>
            <input
              type="text"
              id="name"
              name="name"
              value={formData.name}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="guardian" className="block text-sm font-medium text-gray-700 mb-1">
              Guardian
            </label>
            <input
              type="text"
              id="guardian"
              name="guardian"
              value={formData.guardian}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            />
          </div>

          <div>
            <label htmlFor="dob" className="block text-sm font-medium text-gray-700 mb-1">
              Date of Birth
            </label>
            <input
              type="date"
              id="dob"
              name="dob"
              value={formData.dob}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div>
            <label htmlFor="age" className="block text-sm font-medium text-gray-700 mb-1">
              Age
            </label>
            <input
              type="number"
              id="age"
              name="age"
              value={formData.age}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              readOnly
            />
          </div>

          <div>
            <label htmlFor="gender" className="block text-sm font-medium text-gray-700 mb-1">
              Gender
            </label>
            <select
              id="gender"
              name="gender"
              value={formData.gender}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            >
              <option value="">Select Gender</option>
              <option value="Male">Male</option>
              <option value="Female">Female</option>
              <option value="Other">Other</option>
            </select>
          </div>

          <div>
            <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
              Status
            </label>
            <select
              id="status"
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            >
              <option value="">Select Status</option>
              {statusOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
              Phone
            </label>
            <input
              type="tel"
              id="phone"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>

          <div className="md:col-span-2 lg:col-span-3">
            <label htmlFor="address" className="block text-sm font-medium text-gray-700 mb-1">
              Address
            </label>
            <input
              type="text"
              id="address"
              name="address"
              value={formData.address}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            />
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-md">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Doctor Information</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div>
            <label htmlFor="doctorName" className="block text-sm font-medium text-gray-700 mb-1">
              Doctor Name
            </label>
            <select
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
              required
            >
              <option value="">Select Doctor</option>
              {doctorOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <select
              id="department"
              name="department"
              value={formData.department}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select Department</option>
              {departmentOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700 mb-1">
              Referred By
            </label>
            <select
              id="referredBy"
              name="referredBy"
              value={formData.referredBy}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500"
            >
              <option value="">Select</option>
              {referredByOptions.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <button
          type="submit"
          className="px-4 py-2 bg-blue-500 cursor-pointer hover:bg-blue-600 text-white font-medium rounded focus:outline-none focus:ring-2 focus:ring-blue-400 focus:ring-opacity-50"
        >
          {initialValues ? 'Update Patient' : 'Add Patient'}
        </button>
      </div>
    </form>
  )
}

export default PatientForm
