import React, { useState, useEffect } from 'react'
import {
  departmentOptions,
  doctorOptions,
  referredByOptions,
  statusOptions
} from '../../utils/dropdownOptions'
import EditableCombobox from '../common/EditableCombobox'

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
  status: string
  doctorName: string
  department: string
  referredBy: string
  createdBy: string
}
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
    createdBy: string
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
    createdBy: string
  }
  patientCount?: number
}

const PatientForm: React.FC<PatientFormProps> = ({ onSubmit, initialValues, patientCount = 0 }) => {
  const [isExistingPatientMode, setIsExistingPatientMode] = useState(false)
  const [searchPatientId, setSearchPatientId] = useState('')
  const [searchedPatient, setSearchedPatient] = useState<Patient | null>(null)
  const [isSearching, setIsSearching] = useState(false)

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
    referredBy: initialValues?.referredBy || 'Self',
    createdBy: initialValues?.createdBy || getCurrentUser()
  })

  // Dynamic dropdown options state - fetched from backend
  const [dynamicDoctorOptions, setDynamicDoctorOptions] = useState<string[]>([])
  const [dynamicDepartmentOptions, setDynamicDepartmentOptions] = useState<string[]>([])
  const [dynamicReferredByOptions, setDynamicReferredByOptions] = useState<string[]>([])

  // Load dropdown options on component mount
  useEffect(() => {
    const loadDropdownOptions = async (): Promise<void> => {
      const [doctorOpts, departmentOpts, referredByOpts] = await Promise.all([
        fetchDropdownOptions('doctorName'),
        fetchDropdownOptions('department'),
        fetchDropdownOptions('referredBy')
      ])
      setDynamicDoctorOptions(doctorOpts)
      setDynamicDepartmentOptions(departmentOpts)
      setDynamicReferredByOptions(referredByOpts)
    }
    loadDropdownOptions()
  }, [])

  // Auto-generate patient ID based on patient count when creating a new patient
  useEffect(() => {
    if (!initialValues && patientCount !== null && !formData.patientId) {
      const nextId = String(patientCount + 1).padStart(4, '0')
      setFormData((prev) => ({ ...prev, patientId: nextId }))
    }
  }, [patientCount, initialValues, formData.patientId])

  // Helper function to fetch dropdown options from backend
  const fetchDropdownOptions = async (fieldName: string): Promise<string[]> => {
    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const result = (await api.getDropdownOptions(fieldName)) as {
        success: boolean
        options?: string[]
        error?: string
      }
      if (result.success && result.options) {
        return result.options
      } else {
        console.warn(`Failed to fetch ${fieldName} options:`, result.error)
        // Return fallback options from static imports
        switch (fieldName) {
          case 'doctorName':
            return doctorOptions
          case 'department':
            return departmentOptions
          case 'referredBy':
            return referredByOptions
          default:
            return []
        }
      }
    } catch (error) {
      console.error(`Error fetching ${fieldName} options:`, error)
      // Return fallback options from static imports
      switch (fieldName) {
        case 'doctorName':
          return doctorOptions
        case 'department':
          return departmentOptions
        case 'referredBy':
          return referredByOptions
        default:
          return []
      }
    }
  }

  // Helper function to add new option permanently and refresh options
  const addNewOptionPermanently = async (fieldName: string, value: string): Promise<void> => {
    if (!value.trim()) return

    try {
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const result = await api.addDropdownOption(fieldName, value)
      if (result) {
        console.log(`Added '${value}' to ${fieldName} options permanently`)
        // Refresh the options from backend to get the updated list
        const updatedOptions = await fetchDropdownOptions(fieldName)
        switch (fieldName) {
          case 'doctorName':
            setDynamicDoctorOptions(updatedOptions)
            break
          case 'department':
            setDynamicDepartmentOptions(updatedOptions)
            break
          case 'referredBy':
            setDynamicReferredByOptions(updatedOptions)
            break
        }
      }
    } catch (error) {
      console.error('Error adding dropdown option:', error)
    }
  }

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

  const handleExistingPatientClick = (): void => {
    setIsExistingPatientMode(!isExistingPatientMode)
    if (!isExistingPatientMode) {
      // Reset search when entering existing patient mode
      setSearchPatientId('')
      setSearchedPatient(null)
    }
  }

  const handleSearchPatient = async (): Promise<void> => {
    if (!searchPatientId.trim()) {
      alert('Please enter a Patient ID to search')
      return
    }

    setIsSearching(true)
    try {
      // Call the main process to search for patient
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const patient = (await api.getPatientById(searchPatientId)) as Patient

      if (patient) {
        setSearchedPatient(patient)
        // Populate form with patient data but keep status and doctor fields editable
        setFormData({
          ...patient,
          status: 'Regular', // Reset status for new visit
          doctorName: 'Dr. Srilatha ch', // Reset doctor
          department: 'Opthalmology', // Reset department
          referredBy: 'Self' // Reset referred by
        })
      } else {
        alert('Patient not found with ID: ' + searchPatientId)
        setSearchedPatient(null)
      }
    } catch (error) {
      console.error('Error searching patient:', error)
      alert('Error searching for patient. Please try again.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleSubmit = (e: React.FormEvent): void => {
    e.preventDefault()

    // Prepare data for submission
    let submissionData = { ...formData }

    // If we're in existing patient mode, ensure we create a new record
    // by removing the id field and updating createdBy
    if (isExistingPatientMode && searchedPatient) {
      // Create new record data for new visit (without id to force creation)
      submissionData = {
        ...submissionData,
        createdBy: getCurrentUser(), // Always use current user for new visits
        date: String(new Date().toISOString().split('T')[0]) // Use today's date for new visit
      }
      // Remove id property if it exists to force new record creation
      if ('id' in submissionData) {
        // eslint-disable-next-line @typescript-eslint/no-unused-vars
        const { id, ...dataWithoutId } = submissionData as Patient
        submissionData = dataWithoutId
      }
    }

    onSubmit(submissionData)

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
        doctorName: 'Dr. Srilatha ch',
        department: 'Opthalmology',
        referredBy: 'Self',
        status: 'Regular',
        createdBy: getCurrentUser()
      })
      // Reset existing patient mode
      setIsExistingPatientMode(false)
      setSearchPatientId('')
      setSearchedPatient(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow border border-gray-200">
      <div className="bg-gray-50 p-4 rounded-md">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-medium text-gray-900">Patient Information</h3>
          <p
            className="text-sm text-gray-600 underline cursor-pointer hover:text-blue-600"
            onClick={handleExistingPatientClick}
          >
            {isExistingPatientMode ? 'new patient' : 'existing patient'}
          </p>
        </div>

        {/* Search Interface for Existing Patient */}
        {isExistingPatientMode && (
          <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-md">
            <div className="flex items-center space-x-3">
              <div className="flex-1">
                <label
                  htmlFor="searchPatientId"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Search Patient by ID
                </label>
                <input
                  type="text"
                  id="searchPatientId"
                  value={searchPatientId}
                  onChange={(e) => setSearchPatientId(e.target.value)}
                  placeholder="Enter Patient ID (e.g., 0001)"
                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-blue-500"
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') {
                      handleSearchPatient()
                    }
                  }}
                />
              </div>
              <button
                type="button"
                onClick={handleSearchPatient}
                disabled={isSearching || !searchPatientId.trim()}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 disabled:bg-gray-400 text-white rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                {isSearching ? 'Searching...' : 'Search'}
              </button>
            </div>
            {searchedPatient && (
              <div className="mt-2 text-sm text-green-600">
                ✓ Patient found: {searchedPatient.name} (ID: {searchedPatient.patientId})
              </div>
            )}
          </div>
        )}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                (!initialValues && !isExistingPatientMode) ||
                (isExistingPatientMode && searchedPatient)
                  ? 'bg-gray-50'
                  : ''
              }`}
              readOnly={
                (!initialValues && !isExistingPatientMode) ||
                (isExistingPatientMode && !!searchedPatient)
              }
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              disabled={isExistingPatientMode && !!searchedPatient}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
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
              className={`w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-1 focus:ring-gray-500 ${
                isExistingPatientMode && !!searchedPatient ? 'bg-gray-50' : ''
              }`}
              readOnly={isExistingPatientMode && !!searchedPatient}
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
            <EditableCombobox
              id="doctorName"
              name="doctorName"
              value={formData.doctorName}
              options={dynamicDoctorOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type doctor name..."
              required
            />
          </div>

          <div>
            <label htmlFor="department" className="block text-sm font-medium text-gray-700 mb-1">
              Department
            </label>
            <EditableCombobox
              id="department"
              name="department"
              value={formData.department}
              options={dynamicDepartmentOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type department..."
            />
          </div>

          <div>
            <label htmlFor="referredBy" className="block text-sm font-medium text-gray-700 mb-1">
              Referred By
            </label>
            <EditableCombobox
              id="referredBy"
              name="referredBy"
              value={formData.referredBy}
              options={dynamicReferredByOptions}
              onChange={handleChange}
              onAddNewOption={addNewOptionPermanently}
              placeholder="Select or type referrer..."
            />
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
