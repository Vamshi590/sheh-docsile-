import React, { useState, useEffect, useCallback } from 'react'
import MedicineForm from '../components/medicines/MedicineForm'
import MedicineTable from '../components/medicines/MedicineTable'
import MedicineEditModal from '../components/medicines/MedicineEditModal'
import MedicineDispenseModal from '../components/medicines/MedicineDispenseModal'
import MedicineDispenseHistory from '../components/medicines/MedicineDispenseHistory'

interface Medicine {
  id: string
  name: string
  quantity: number
  expiryDate: string
  batchNumber: string
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface MedicineDispenseRecord {
  id: string
  medicineId: string
  medicineName: string
  batchNumber: string
  quantity: number
  price: number
  totalAmount: number
  dispensedDate: string
  patientName: string
  patientId?: string
}

const Medicines: React.FC = () => {
  const [medicines, setMedicines] = useState<Medicine[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingMedicine, setEditingMedicine] = useState<Medicine | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>(
    'available'
  )
  const [searchTerm, setSearchTerm] = useState('')

  // Dispensing related state
  const [dispensingMedicine, setDispensingMedicine] = useState<Medicine | null>(null)
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing-history'>('inventory')
  const [dispenseRecords, setDispenseRecords] = useState<MedicineDispenseRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')

  // State for pagination
  const [currentPage, setCurrentPage] = useState(1)
  const [pageSize] = useState(10)
  const [totalCount, setTotalCount] = useState(0)

  // Dispense form state
  const [showDispenseForm, setShowDispenseForm] = useState(false)
  const [patientId, setPatientId] = useState('')
  const [patientName, setPatientName] = useState('')
  const [dispensedBy, setDispensedBy] = useState('')
  const [selectedMedicines, setSelectedMedicines] = useState<
    { id: string; name: string; quantity: number; price: number }[]
  >([])
  const [totalAmount, setTotalAmount] = useState(0)
  const [loadingPatient, setLoadingPatient] = useState(false)

  // Function to calculate total amount
  const calculateTotalAmount = useCallback((): void => {
    const total = selectedMedicines.reduce((sum, medicine) => {
      return sum + medicine.price * medicine.quantity
    }, 0)
    setTotalAmount(total)
  }, [selectedMedicines])

  // Remove this duplicate definition as filteredMedicines is defined below

  // Load medicines on component mount
  useEffect(() => {
    const fetchMedicines = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        // Load only available medicines by default
        const data = await api.getMedicinesByStatus('available')
        setMedicines(data as Medicine[])
        setError('')
      } catch (err) {
        console.error('Error loading medicines:', err)
        setError('Failed to load medicines')
      } finally {
        setLoading(false)
      }
    }

    fetchMedicines()
  }, [])

  // Function to fetch medicine dispensing records with pagination
  const fetchDispenseRecords = useCallback(
    async (page = currentPage) => {
      try {
        setLoadingRecords(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const response = await api.getMedicineDispenseRecords(page, pageSize)

        // The response now includes data, totalCount, page, and pageSize
        if (response && typeof response === 'object' && 'data' in response) {
          const { data, totalCount: total } = response as {
            data: MedicineDispenseRecord[]
            totalCount: number
            page: number
            pageSize: number
          }
          setDispenseRecords(data)
          setTotalCount(total)
          setCurrentPage(page)
          setRecordsError('')
        } else {
          // Fallback for unexpected response format
          setDispenseRecords(response as MedicineDispenseRecord[])
          setRecordsError('')
        }
      } catch (err) {
        console.error('Error loading dispensing records:', err)
        setRecordsError('Failed to load dispensing records')
      } finally {
        setLoadingRecords(false)
      }
    },
    [currentPage, pageSize]
  )

  // Load dispensing records when activeTab changes to dispensing-history
  useEffect(() => {
    if (activeTab === 'dispensing-history') {
      fetchDispenseRecords()
    }
  }, [activeTab, fetchDispenseRecords])

  // Recalculate total amount whenever selectedMedicines changes
  useEffect(() => {
    calculateTotalAmount()
  }, [calculateTotalAmount])

  // Function to handle adding a new medicine
  const handleAddMedicine = async (medicine: Omit<Medicine, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newMedicine = await api.addMedicine(medicine)

      setMedicines([...medicines, newMedicine as Medicine])
      setShowAddForm(false)
      setError('')
    } catch (err) {
      console.error('Error adding medicine:', err)
      setError('Failed to add medicine')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating a medicine
  const handleUpdateMedicine = async (
    id: string,
    medicine: Omit<Medicine, 'id'>
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const updatedMedicine = await api.updateMedicine(id, { ...medicine, id })
      setMedicines(medicines.map((m) => (m.id === id ? (updatedMedicine as Medicine) : m)))
      setIsModalOpen(false)
      setEditingMedicine(null)
      setError('')
    } catch (err) {
      console.error('Error updating medicine:', err)
      setError('Failed to update medicine')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle deleting a medicine
  const handleDeleteMedicine = async (id: string): Promise<void> => {
    if (window.confirm('Are you sure you want to delete this medicine?')) {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        await api.deleteMedicine(id)
        setMedicines(medicines.filter((m) => m.id !== id))
        setError('')
      } catch (err) {
        console.error('Error deleting medicine:', err)
        setError('Failed to delete medicine')
      } finally {
        setLoading(false)
      }
    }
  }

  // Function to handle updating medicine status
  const handleUpdateStatus = async (
    id: string,
    status: 'available' | 'completed' | 'out_of_stock'
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const updatedMedicine = await api.updateMedicineStatus(id, status)
      setMedicines(medicines.map((m) => (m.id === id ? (updatedMedicine as Medicine) : m)))
      setError('')
    } catch (err) {
      console.error('Error updating medicine status:', err)
      setError('Failed to update medicine status')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle search
  const handleSearch = async (): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const data = await api.searchMedicines(searchTerm)
      setMedicines(data as Medicine[])
      setError('')
    } catch (err) {
      console.error('Error searching medicines:', err)
      setError('Failed to search medicines')
    } finally {
      setLoading(false)
    }
  }

  // Function to filter medicines by status
  const handleFilterByStatus = async (
    status: 'all' | 'available' | 'out_of_stock'
  ): Promise<void> => {
    try {
      setLoading(true)
      setStatusFilter(status)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      let data
      if (status === 'all') {
        data = await api.getMedicines()
      } else {
        data = await api.getMedicinesByStatus(status)
      }

      setMedicines(data as Medicine[])
      setError('')
    } catch (err) {
      console.error('Error filtering medicines:', err)
      setError('Failed to filter medicines')
    } finally {
      setLoading(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (medicine: Medicine): void => {
    setEditingMedicine(medicine)
    setIsModalOpen(true)
  }

  // Function to open the dispense modal
  const openDispenseModal = (medicine: Medicine): void => {
    setDispensingMedicine(medicine)
    setIsDispenseModalOpen(true)
  }

  // Function to handle dispensing medicine
  const handleDispenseMedicine = async (medicineData: {
    id: string
    quantity: number
    patientId?: string
    dispensedBy?: string
    name?: string
    price?: number
  }): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Calculate total amount
      const price = medicineData.price || 0
      const totalAmount = price * medicineData.quantity

      // Call API to dispense medicine
      const result = await api.dispenseMedicine(
        medicineData.id,
        medicineData.quantity,
        medicineData.dispensedBy || '',
        medicineData.patientId || '',
        price,
        totalAmount
      )

      // Update medicine in state with new quantity
      const updatedMedicine = result as Medicine
      setMedicines(medicines.map((m) => (m.id === medicineData.id ? updatedMedicine : m)))

      // Refresh dispensing records
      fetchDispenseRecords()

      setError('')
    } catch (err) {
      console.error('Error dispensing medicine:', err)
      setError('Failed to dispense medicine')
    } finally {
      setLoading(false)
      setIsDispenseModalOpen(false)
      setDispensingMedicine(null)
    }
  }

  // Function to handle patient search by ID
  const handlePatientSearch = async (): Promise<void> => {
    if (!patientId.trim()) return

    try {
      setLoadingPatient(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const patients = (await api.getPatients()) as { patientId: string; name: string }[]
      console.log(patients)

      const patient = patients.find((p) => p.patientId == patientId)
      if (patient) {
        setPatientName(patient.name || '')
      } else {
        setPatientName('')
        alert('Patient not found')
      }
    } catch (err) {
      console.error('Error searching for patient:', err)
      alert('Failed to search for patient')
    } finally {
      setLoadingPatient(false)
    }
  }

  // Function to add medicine to dispense list
  const addMedicineToDispense = (medicine: Medicine, quantity: number): void => {
    if (quantity <= 0) return

    // Check if medicine is already in the list
    const existingIndex = selectedMedicines.findIndex((m) => m.id === medicine.id)

    if (existingIndex >= 0) {
      // Update quantity if medicine already exists in the list
      const updatedMedicines = [...selectedMedicines]
      updatedMedicines[existingIndex].quantity = quantity
      setSelectedMedicines(updatedMedicines)
    } else {
      // Add new medicine to the list
      setSelectedMedicines([
        ...selectedMedicines,
        {
          id: medicine.id,
          name: medicine.name,
          quantity,
          price: medicine.price
        }
      ])
    }

    // Update the available quantity in the medicines list
    setMedicines(
      medicines.map((m) => {
        if (m.id === medicine.id) {
          // Calculate the new quantity
          const newQuantity = m.quantity - quantity
          // Return updated medicine with reduced quantity
          return {
            ...m,
            quantity: newQuantity,
            // If quantity becomes 0, update status to out_of_stock
            status: newQuantity <= 0 ? 'out_of_stock' : m.status
          }
        }
        return m
      })
    )

    // Update total amount
    calculateTotalAmount()
  }

  // Function to remove medicine from dispense list
  const removeMedicineFromDispense = (id: string): void => {
    setSelectedMedicines(selectedMedicines.filter((m) => m.id !== id))
    calculateTotalAmount()
  }

  // This function is now defined above using useCallback

  // Function to handle save dispense
  const handleSaveDispense = async (shouldPrint = false): Promise<void> => {
    try {
      if (!patientId || selectedMedicines.length === 0) {
        alert('Please enter patient ID and add medicines to dispense')
        return
      }

      // Save each medicine dispense record
      for (const medicine of selectedMedicines) {
        await handleDispenseMedicine({
          ...medicine,
          patientId,
          dispensedBy,
          price: medicine.price
        })
      }

      // Reset form
      setPatientId('')
      setPatientName('')
      setSelectedMedicines([])
      setTotalAmount(0)
      setShowDispenseForm(false)

      // If print is requested, handle printing logic here
      if (shouldPrint) {
        // Implement printing logic
        console.log('Printing dispense receipt')
      }

      alert('Medicines dispensed successfully')
    } catch (err) {
      console.error('Error dispensing medicines:', err)
      alert('Failed to dispense medicines')
    } finally {
      setLoading(false)
    }
  }

  // Function to toggle dispense form
  const toggleDispenseForm = (): void => {
    // Load current user from localStorage when opening the form
    if (!showDispenseForm) {
      try {
        const currentUserStr = localStorage.getItem('currentUser')
        if (currentUserStr) {
          const currentUser = JSON.parse(currentUserStr)
          setDispensedBy(currentUser.fullName || '')
        }
      } catch (err) {
        console.error('Error loading current user:', err)
      }
    }

    setShowDispenseForm(!showDispenseForm)

    // Reset form when closing
    if (showDispenseForm) {
      setPatientId('')
      setPatientName('')
      setSelectedMedicines([])
      setTotalAmount(0)
    }
  }

  // Handle page change
  const handlePageChange = useCallback(
    (page: number): void => {
      fetchDispenseRecords(page)
    },
    [fetchDispenseRecords]
  )

  // Filter medicines based on search term and status filter
  const filteredMedicines = medicines.filter((medicine) => {
    // First apply status filter
    if (statusFilter !== 'all' && medicine.status !== statusFilter) {
      return false
    }

    // Then apply search term filter if present
    if (searchTerm) {
      return (
        medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Medicines Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex cursor-pointer border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 cursor-pointer border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'dispensing-history' ? 'text-blue-600 border-b-2 cursor-pointer border-blue-600' : 'text-gray-500 hover:text-gray-700 cursor-pointer'}`}
                onClick={() => setActiveTab('dispensing-history')}
              >
                Dispensing History
              </button>
            </div>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>{showAddForm ? 'Hide Form' : 'Add Medicine'}</span>
            </button>
            <button
              onClick={() => (window.location.hash = '/dashboard')}
              className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-md transition-colors shadow-sm flex items-center space-x-1.5"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M9.707 16.707a1 1 0 01-1.414 0l-6-6a1 1 0 010-1.414l6-6a1 1 0 011.414 1.414L5.414 9H17a1 1 0 110 2H5.414l4.293 4.293a1 1 0 010 1.414z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Back</span>
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10 flex-grow w-full">
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-100 text-red-700 rounded-lg flex items-center">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-3 text-red-500"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z"
                clipRule="evenodd"
              />
            </svg>
            {error}
          </div>
        )}

        {showAddForm && (
          <div className="mb-8 bg-white p-6 rounded-lg shadow-sm border border-gray-100 transition-all">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-medium text-gray-800 flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6 mr-2 text-blue-500"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Add New Medicine
              </h2>
              <button
                onClick={() => setShowAddForm(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                    clipRule="evenodd"
                  />
                </svg>
              </button>
            </div>
            <MedicineForm onSubmit={handleAddMedicine} />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {activeTab === 'inventory' ? (
            // Inventory Tab Content
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10"
                    />
                  </svg>
                  Medicine Inventory
                </h2>
                <div className="text-sm text-gray-500">
                  {!loading && medicines.length > 0 && (
                    <span>
                      {medicines.length} {medicines.length === 1 ? 'medicine' : 'medicines'} found
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <button
                    onClick={() => handleFilterByStatus('all')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'all'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    All
                  </button>
                  <button
                    onClick={() => handleFilterByStatus('available')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'available'
                        ? 'bg-green-100 text-green-700 border border-green-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Available
                  </button>
                  <button
                    onClick={() => handleFilterByStatus('out_of_stock')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'out_of_stock'
                        ? 'bg-red-100 text-red-700 border border-red-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Out of Stock
                  </button>
                </div>

                <div className="flex items-center justify-center space-x-2">
                  {/* Dispense Button */}
                  <div className="ml-2">
                    <button
                      onClick={toggleDispenseForm}
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 flex items-center"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5 mr-1"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                      </svg>
                      Dispense
                    </button>
                  </div>

                  <div className="flex w-full sm:w-auto">
                    <input
                      type="text"
                      placeholder="Search medicines..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="px-4 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                    />
                    <button
                      onClick={handleSearch}
                      className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-5 w-5"
                        viewBox="0 0 20 20"
                        fill="currentColor"
                      >
                        <path
                          fillRule="evenodd"
                          d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
              </div>

              {/* Dispense Form */}
              {showDispenseForm && (
                <div className="mt-4 mb-4 p-4 bg-white border border-gray-200 rounded-lg shadow-sm">
                  <h3 className="text-lg font-medium text-gray-900 mb-4">Dispense Medicines</h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    {/* Patient ID */}
                    <div>
                      <label
                        htmlFor="patientId"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Patient ID *
                      </label>
                      <div className="flex">
                        <input
                          type="text"
                          id="patientId"
                          value={patientId}
                          onChange={(e) => setPatientId(e.target.value)}
                          className="px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 flex-grow"
                          placeholder="Enter patient ID"
                        />
                        <button
                          onClick={handlePatientSearch}
                          disabled={loadingPatient}
                          className="px-3 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300"
                        >
                          {loadingPatient ? (
                            <svg
                              className="animate-spin h-5 w-5"
                              xmlns="http://www.w3.org/2000/svg"
                              fill="none"
                              viewBox="0 0 24 24"
                            >
                              <circle
                                className="opacity-25"
                                cx="12"
                                cy="12"
                                r="10"
                                stroke="currentColor"
                                strokeWidth="4"
                              ></circle>
                              <path
                                className="opacity-75"
                                fill="currentColor"
                                d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                              ></path>
                            </svg>
                          ) : (
                            'Search'
                          )}
                        </button>
                      </div>
                    </div>

                    {/* Patient Name */}
                    <div>
                      <label
                        htmlFor="patientName"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Patient Name *
                      </label>
                      <input
                        type="text"
                        id="patientName"
                        value={patientName}
                        readOnly
                        className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                        placeholder="Auto-filled after patient search"
                      />
                    </div>

                    {/* Dispensed By */}
                    <div>
                      <label
                        htmlFor="dispensedBy"
                        className="block text-sm font-medium text-gray-700 mb-1"
                      >
                        Dispensed By
                      </label>
                      <input
                        type="text"
                        id="dispensedBy"
                        value={dispensedBy}
                        readOnly
                        className="px-3 py-2 border border-gray-300 rounded-md bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 w-full"
                      />
                    </div>
                  </div>

                  {/* Selected Medicines */}
                  <div className="mb-4">
                    <h4 className="text-md font-medium text-gray-800 mb-2">Selected Medicines</h4>
                    {selectedMedicines.length > 0 ? (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                          <thead className="bg-gray-50">
                            <tr>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Name
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Quantity
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Price
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Total
                              </th>
                              <th
                                scope="col"
                                className="px-4 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                              >
                                Action
                              </th>
                            </tr>
                          </thead>
                          <tbody className="bg-white divide-y divide-gray-200">
                            {selectedMedicines.map((medicine) => (
                              <tr key={medicine.id}>
                                <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900">
                                  {medicine.name}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  {medicine.quantity}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  ₹{medicine.price.toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                                  ₹{(medicine.price * medicine.quantity).toFixed(2)}
                                </td>
                                <td className="px-4 py-3 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => removeMedicineFromDispense(medicine.id)}
                                    className="text-red-600 hover:text-red-900 focus:outline-none focus:underline"
                                  >
                                    Remove
                                  </button>
                                </td>
                              </tr>
                            ))}
                            <tr className="bg-gray-50">
                              <td
                                colSpan={3}
                                className="px-4 py-3 whitespace-nowrap text-sm font-medium text-right text-gray-900"
                              >
                                Total Amount:
                              </td>
                              <td className="px-4 py-3 whitespace-nowrap text-sm font-bold text-gray-900">
                                ₹{totalAmount.toFixed(2)}
                              </td>
                              <td></td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    ) : (
                      <div className="text-sm text-gray-500 italic">
                        No medicines selected. Add medicines from the table below.
                      </div>
                    )}
                  </div>

                  {/* Action Buttons */}
                  <div className="flex justify-end space-x-3">
                    <button
                      onClick={() => setShowDispenseForm(false)}
                      className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveDispense(false)}
                      disabled={selectedMedicines.length === 0 || !patientId || !patientName}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:bg-blue-300"
                    >
                      Save
                    </button>
                    <button
                      onClick={() => handleSaveDispense(true)}
                      disabled={selectedMedicines.length === 0 || !patientId || !patientName}
                      className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-green-300"
                    >
                      Save & Print
                    </button>
                  </div>
                </div>
              )}

              {loading && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-3 text-gray-500">Loading medicines...</p>
                  </div>
                </div>
              )}
              {!loading && filteredMedicines.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-2">No medicines found</p>
                  <p className="text-gray-500 mb-6">
                    {searchTerm
                      ? 'Try a different search term or clear the filter'
                      : 'Click the "Add Medicine" button to create your first medicine record'}
                  </p>
                  <button
                    onClick={() => setShowAddForm(true)}
                    className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition-colors shadow-sm inline-flex items-center"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-5 w-5 mr-1.5"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Add Medicine
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="overflow-x-auto">
                    <MedicineTable
                      medicines={filteredMedicines}
                      onEdit={openEditModal}
                      onDelete={handleDeleteMedicine}
                      onUpdateStatus={handleUpdateStatus}
                      onDispense={openDispenseModal}
                      onAddToDispense={addMedicineToDispense}
                      showDispenseControls={showDispenseForm}
                    />
                  </div>
                )
              )}
            </>
          ) : (
            // Dispensing History Tab Content
            <>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-medium text-gray-800 flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-6 w-6 mr-2 text-blue-500"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  Medicine Dispensing History
                </h2>
                <div className="text-sm text-gray-500">
                  {!loadingRecords && dispenseRecords.length > 0 && (
                    <span>
                      {dispenseRecords.length} {dispenseRecords.length === 1 ? 'record' : 'records'}{' '}
                      found
                    </span>
                  )}
                </div>
              </div>

              {loadingRecords && (
                <div className="flex items-center justify-center py-10">
                  <div className="flex flex-col items-center">
                    <svg
                      className="animate-spin h-8 w-8 text-blue-500"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="3"
                      ></circle>
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      ></path>
                    </svg>
                    <p className="mt-3 text-gray-500">Loading dispensing records...</p>
                  </div>
                </div>
              )}
              {!loadingRecords && recordsError && (
                <div className="text-red-500 text-center py-10">{recordsError}</div>
              )}
              {!loadingRecords && !recordsError && dispenseRecords.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-gray-200 rounded-lg bg-gray-50">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-16 w-16 mx-auto text-gray-300 mb-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1}
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2"
                    />
                  </svg>
                  <p className="text-gray-600 text-lg mb-2">No dispensing records found</p>
                  <p className="text-gray-500 mb-6">
                    Switch to the Inventory tab and dispense medicines to create dispensing records
                  </p>
                </div>
              ) : (
                !loadingRecords &&
                !recordsError && (
                  <div className="overflow-x-auto">
                    <MedicineDispenseHistory
                      records={dispenseRecords}
                      loading={loadingRecords}
                      error={recordsError}
                      onPageChange={handlePageChange}
                      totalCount={totalCount}
                      currentPage={currentPage}
                      pageSize={pageSize}
                    />
                  </div>
                )
              )}
            </>
          )}
        </div>
      </main>

      {isModalOpen && editingMedicine && (
        <MedicineEditModal
          medicine={editingMedicine}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingMedicine(null)
          }}
          onSave={handleUpdateMedicine}
        />
      )}

      {isDispenseModalOpen && dispensingMedicine && (
        <MedicineDispenseModal
          medicine={dispensingMedicine}
          isOpen={isDispenseModalOpen}
          onClose={() => {
            setIsDispenseModalOpen(false)
            setDispensingMedicine(null)
          }}
          onDispense={handleDispenseMedicine}
        />
      )}

      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Medicines
