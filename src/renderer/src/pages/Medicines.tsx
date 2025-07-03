import React, { useState, useEffect } from 'react'
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
  const [statusFilter, setStatusFilter] = useState<
    'all' | 'available' | 'completed' | 'out_of_stock'
  >('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Dispensing related state
  const [dispensingMedicine, setDispensingMedicine] = useState<Medicine | null>(null)
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing-history'>('inventory')
  const [dispenseRecords, setDispenseRecords] = useState<MedicineDispenseRecord[]>([])
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')

  // Load medicines on component mount
  useEffect(() => {
    const fetchMedicines = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const data = await api.getMedicines()
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

  // Load dispensing records when activeTab changes to dispensing-history
  useEffect(() => {
    if (activeTab === 'dispensing-history') {
      fetchDispenseRecords()
    }
  }, [activeTab])

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
    status: 'all' | 'available' | 'completed' | 'out_of_stock'
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
  const handleDispenseMedicine = async (
    id: string,
    quantity: number,
    patientName: string,
    patientId?: string
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Call API to dispense medicine
      const result = await api.dispenseMedicine(id, quantity, patientName, patientId)

      // Update medicine in state with new quantity
      const updatedMedicine = result as Medicine
      setMedicines(medicines.map((m) => (m.id === id ? updatedMedicine : m)))

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

  // Function to fetch medicine dispensing records
  const fetchDispenseRecords = async (): Promise<void> => {
    try {
      setLoadingRecords(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const data = await api.getMedicineDispenseRecords()
      setDispenseRecords(data as MedicineDispenseRecord[])
      setRecordsError('')
    } catch (err) {
      console.error('Error loading dispensing records:', err)
      setRecordsError('Failed to load dispensing records')
    } finally {
      setLoadingRecords(false)
    }
  }

  // Filter medicines based on search term
  const filteredMedicines = searchTerm
    ? medicines.filter(
        (medicine) =>
          medicine.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          medicine.batchNumber.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : medicines

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Medicines Management</h1>
            <p className="text-sm text-gray-500">Sri Harsha Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex border-b border-gray-200">
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'inventory' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
                onClick={() => setActiveTab('inventory')}
              >
                Inventory
              </button>
              <button
                className={`px-4 py-2 font-medium ${activeTab === 'dispensing-history' ? 'text-blue-600 border-b-2 border-blue-600' : 'text-gray-500 hover:text-gray-700'}`}
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

      <main className="max-w-7xl mx-auto px-6 py-8 sm:px-8 lg:px-10">
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
                    onClick={() => handleFilterByStatus('completed')}
                    className={`px-3 py-1 text-sm rounded-md ${
                      statusFilter === 'completed'
                        ? 'bg-blue-100 text-blue-700 border border-blue-200'
                        : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                    }`}
                  >
                    Completed
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
