import React, { useState, useEffect } from 'react'
import OpticalForm from '../components/opticals/OpticalForm'
import OpticalTable from '../components/opticals/OpticalTable'
import OpticalEditModal from '../components/opticals/OpticalEditModal'
import OpticalDispenseModal from '../components/opticals/OpticalDispenseModal'
import OpticalDispenseHistory from '../components/opticals/OpticalDispenseHistory'

interface Optical {
  id: string
  type: 'frame' | 'lens'
  brand: string
  model: string
  size: string
  power?: string // Optional for lenses
  quantity: number
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface OpticalDispenseRecord {
  id: string
  opticalId: string
  opticalType: 'frame' | 'lens'
  brand: string
  model: string
  quantity: number
  price: number
  patientName: string
  patientId?: string
  dispensedAt: string
}

const Opticals: React.FC = () => {
  const [opticals, setOpticals] = useState<Optical[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [editingOptical, setEditingOptical] = useState<Optical | null>(null)
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [showAddForm, setShowAddForm] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'available' | 'out_of_stock'>('available')
  const [typeFilter, setTypeFilter] = useState<'all' | 'frame' | 'lens'>('all')
  const [searchTerm, setSearchTerm] = useState('')

  // Dispensing related state
  const [dispensingOptical, setDispensingOptical] = useState<Optical | null>(null)
  const [isDispenseModalOpen, setIsDispenseModalOpen] = useState(false)
  const [activeTab, setActiveTab] = useState<'inventory' | 'dispensing-history'>('inventory')
  const [dispenseRecords, setDispenseRecords] = useState<OpticalDispenseRecord[]>([]) // Used to track and display dispense history
  const [loadingRecords, setLoadingRecords] = useState(false)
  const [recordsError, setRecordsError] = useState('')

  // Load opticals on component mount
  useEffect(() => {
    const fetchData = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        // Load only available opticals by default
        const opticalData = await api.getOpticalItemsByStatus('available')
        setOpticals(opticalData as Optical[])
        setError('')
      } catch (err) {
        console.error('Error loading data:', err)
        setError('Failed to load data')
      } finally {
        setLoading(false)
      }
    }

    fetchData()
  }, [])

  // Load dispensing records when activeTab changes to dispensing-history
  useEffect(() => {
    if (activeTab === 'dispensing-history') {
      fetchDispenseRecords()
    }
  }, [activeTab])

  // Function to fetch optical dispense records
  const fetchDispenseRecords = async (): Promise<void> => {
    try {
      setLoadingRecords(true)
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const records = await api.getOpticalDispenseRecords()
      setDispenseRecords(records as OpticalDispenseRecord[])
      setRecordsError('')
    } catch (err) {
      console.error('Error fetching dispense records:', err)
      setRecordsError('Failed to load dispensing records')
    } finally {
      setLoadingRecords(false)
    }
  }

  // Function to handle adding a new optical
  const handleAddOptical = async (optical: Omit<Optical, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newOptical = await api.addOpticalItem(optical)

      setOpticals([...opticals, newOptical as Optical])
      setShowAddForm(false)
      setError('')
    } catch (err) {
      console.error('Error adding optical:', err)
      setError('Failed to add optical')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle updating an optical
  const handleUpdateOptical = async (id: string, optical: Omit<Optical, 'id'>): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const updatedOptical = await api.updateOpticalItem(id, { ...optical, id })
      setOpticals(opticals.map((o) => (o.id === id ? (updatedOptical as Optical) : o)))
      setIsModalOpen(false)
      setEditingOptical(null)
      setError('')
    } catch (err) {
      console.error('Error updating optical:', err)
      setError('Failed to update optical')
    } finally {
      setLoading(false)
    }
  }

  // Function to handle dispensing optical item
  const handleDispenseOptical = async (
    id: string,
    quantity: number,
    patientName: string,
    patientId?: string
  ): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      // Call API to dispense optical
      const result = await api.dispenseOptical(id, quantity, patientName, patientId)

      // Update optical in state with new quantity/status
      const updatedOptical = result as Optical
      setOpticals(opticals.map((o) => (o.id === id ? updatedOptical : o)))

      // Refresh dispensing records
      await fetchDispenseRecords()

      setError('')
    } catch (err) {
      console.error('Error dispensing optical:', err)
      setError('Failed to dispense optical item')
    } finally {
      setLoading(false)
      setIsDispenseModalOpen(false)
      setDispensingOptical(null)
    }
  }

  // Function to handle search
  const handleSearch = async (): Promise<void> => {
    try {
      setLoading(true)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const data = await api.searchOpticalItems(searchTerm)
      setOpticals(data as Optical[])
      setError('')
    } catch (err) {
      console.error('Error searching opticals:', err)
      setError('Failed to search opticals')
    } finally {
      setLoading(false)
    }
  }

  // Function to filter opticals by status
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
        if (typeFilter === 'all') {
          data = await api.getOpticalItems()
        } else {
          data = await api.getOpticalItemsByType(typeFilter)
        }
      } else {
        if (typeFilter === 'all') {
          data = await api.getOpticalItemsByStatus(status)
        } else {
          data = await api.getOpticalItemsByStatusAndType(status, typeFilter)
        }
      }

      setOpticals(data as Optical[])
      setError('')
    } catch (err) {
      console.error('Error filtering opticals:', err)
      setError('Failed to filter opticals')
    } finally {
      setLoading(false)
    }
  }

  // Function to filter opticals by type
  const handleFilterByType = async (type: 'all' | 'frame' | 'lens'): Promise<void> => {
    try {
      setLoading(true)
      setTypeFilter(type)
      // Use type assertion for API calls with more specific types
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>

      let data
      if (type === 'all') {
        if (statusFilter === 'all') {
          data = await api.getOpticalItems()
        } else {
          data = await api.getOpticalItemsByStatus(statusFilter)
        }
      } else {
        if (statusFilter === 'all') {
          data = await api.getOpticalItemsByType(type)
        } else {
          data = await api.getOpticalItemsByStatusAndType(statusFilter, type)
        }
      }

      setOpticals(data as Optical[])
      setError('')
    } catch (err) {
      console.error('Error filtering opticals by type:', err)
      setError('Failed to filter opticals by type')
    } finally {
      setLoading(false)
    }
  }

  // Function to open edit modal
  const openEditModal = (optical: Optical): void => {
    setEditingOptical(optical)
    setIsModalOpen(true)
  }

  // Function to open the dispense modal
  const openDispenseModal = (optical: Optical): void => {
    setDispensingOptical(optical)
    setIsDispenseModalOpen(true)
  }

  // Filter opticals based on search term and status filter
  const filteredOpticals = opticals.filter((optical) => {
    // First apply status filter if not 'all'
    if (statusFilter !== 'all' && optical.status !== statusFilter) {
      return false
    }
    
    // Then apply search term filter if present
    if (searchTerm) {
      return (
        optical.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
        optical.model.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }
    
    return true
  })

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Opticals Management</h1>
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
              <span>{showAddForm ? 'Hide Form' : 'Add Optical Item'}</span>
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
                Add New Optical Item
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
            <OpticalForm onSubmit={handleAddOptical} />
          </div>
        )}

        <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
          {activeTab === 'inventory' ? (
            // Inventory Tab Content
            <>
              {showAddForm && (
                <div className="bg-white shadow-sm rounded-lg p-6 mb-6">
                  <h2 className="text-lg font-medium text-gray-800 mb-4">Add New Optical Item</h2>
                  <OpticalForm onSubmit={handleAddOptical} onCancel={() => setShowAddForm(false)} />
                </div>
              )}
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
                  Optical Inventory
                </h2>
                <div className="text-sm text-gray-500">
                  {!loading && opticals.length > 0 && (
                    <span>
                      {opticals.length} {opticals.length === 1 ? 'item' : 'items'} found
                    </span>
                  )}
                </div>
              </div>

              <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex flex-wrap gap-2">
                  <div className="mr-4">
                    <span className="text-sm text-gray-600 mr-2">Status:</span>
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
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        statusFilter === 'available'
                          ? 'bg-green-100 text-green-700 border border-green-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Available
                    </button>

                    <button
                      onClick={() => handleFilterByStatus('out_of_stock')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        statusFilter === 'out_of_stock'
                          ? 'bg-red-100 text-red-700 border border-red-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Out of Stock
                    </button>
                  </div>

                  <div className="mt-2 sm:mt-0">
                    <span className="text-sm text-gray-600 mr-2">Type:</span>
                    <button
                      onClick={() => handleFilterByType('all')}
                      className={`px-3 py-1 text-sm rounded-md ${
                        typeFilter === 'all'
                          ? 'bg-blue-100 text-blue-700 border border-blue-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      All
                    </button>
                    <button
                      onClick={() => handleFilterByType('frame')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        typeFilter === 'frame'
                          ? 'bg-purple-100 text-purple-700 border border-purple-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Frames
                    </button>
                    <button
                      onClick={() => handleFilterByType('lens')}
                      className={`px-3 py-1 text-sm rounded-md ml-1 ${
                        typeFilter === 'lens'
                          ? 'bg-indigo-100 text-indigo-700 border border-indigo-200'
                          : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
                      }`}
                    >
                      Lenses
                    </button>
                  </div>
                </div>

                <div className="flex w-full sm:w-auto mt-4 sm:mt-0">
                  <input
                    type="text"
                    placeholder="Search opticals..."
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
                    <p className="mt-3 text-gray-500">Loading optical items...</p>
                  </div>
                </div>
              )}
              {!loading && filteredOpticals.length === 0 ? (
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
                  <p className="text-gray-600 text-lg mb-2">No optical items found</p>
                  <p className="text-gray-500 mb-6">
                    {searchTerm || statusFilter !== 'all' || typeFilter !== 'all'
                      ? 'Try a different search term or clear the filters'
                      : 'Click the "Add Optical Item" button to create your first optical record'}
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
                    Add Optical Item
                  </button>
                </div>
              ) : (
                !loading && (
                  <div className="overflow-x-auto">
                    <OpticalTable
                      opticals={filteredOpticals}
                      onEdit={openEditModal}
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
                  Optical Dispensing History
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

              <OpticalDispenseHistory
                records={dispenseRecords}
                loading={loadingRecords}
                error={recordsError}
              />
            </>
          )}
        </div>
      </main>

      {isModalOpen && editingOptical && (
        <OpticalEditModal
          optical={editingOptical}
          isOpen={isModalOpen}
          onClose={() => {
            setIsModalOpen(false)
            setEditingOptical(null)
          }}
          onSave={handleUpdateOptical}
        />
      )}

      {isDispenseModalOpen && dispensingOptical && (
        <OpticalDispenseModal
          optical={dispensingOptical}
          isOpen={isDispenseModalOpen}
          onClose={() => {
            setIsDispenseModalOpen(false)
            setDispensingOptical(null)
          }}
          onDispense={handleDispenseOptical}
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

export default Opticals
