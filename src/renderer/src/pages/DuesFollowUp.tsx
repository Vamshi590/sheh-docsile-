import React, { useState, useEffect } from 'react'
import DuesSection from '../components/duesFollowUp/DuesSection'
import FollowUpSection from '../components/duesFollowUp/FollowUpSection'
import ToastContainer, { ToastMessage } from '../components/ui/ToastContainer'

// Define the Prescription type
type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  date?: string
  receiptId?: string
  amount?: string | number
  paymentMethod?: string
  amountReceived?: number
  amountDue?: number
  totalAmount?: number
  [key: string]: unknown
}

// Define Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  operatedBy: string
  followUpDate?: string
  reviewOn?: string
  [key: string]: unknown
}

// Define API interface for window.api
interface API {
  // Operation methods
  getOperations?: () => Promise<Operation[]>
  getPatientOperations?: (patientId: string) => Promise<Operation[]>
  addOperation?: (operation: Omit<Operation, 'id'>) => Promise<Operation>
  updateOperation?: (id: string, operation: Operation) => Promise<Operation>
  deleteOperation?: (id: string) => Promise<void>
}

const DuesFollowUp: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'dues' | 'followup'>('dues')
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  // Toast notifications state
  const [toasts, setToasts] = useState<ToastMessage[]>([])
  const [followUpPrescriptions, setFollowUpPrescriptions] = useState<Prescription[]>([])

  // Load prescriptions and operations on component mount
  useEffect(() => {
    loadPrescriptions()
    loadOperations()
    loadFollowUpPrescriptions()
  }, [])

  // Function to add a toast notification
  const addToast = (message: string, type: 'success' | 'error' | 'info' = 'success'): void => {
    const id = Math.random().toString(36).substring(2, 9)
    setToasts((prevToasts) => [...prevToasts, { id, message, type }])
  }

  // Function to remove a toast notification
  const removeToast = (id: string): void => {
    setToasts((prevToasts) => prevToasts.filter((toast) => toast.id !== id))
  }

  // Function to load prescriptions from the backend
  const loadPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPrescriptions()

      // Filter prescriptions with due amounts
      const prescriptionsWithDues = data.filter((prescription) => {
        const totalAmount = Number(prescription['TOTAL AMOUNT'] || prescription.AMOUNT || 0)
        const amountReceived = Number(
          prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
        )
        const amountDue = totalAmount - amountReceived
        return amountDue > 0
      })

      setPrescriptions(prescriptionsWithDues)
      setError('')
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to load operations from the backend
  const loadOperations = async (): Promise<void> => {
    try {
      setLoading(true)
      const api = window.api as API
      // Check if getOperations method exists
      if (api.getOperations) {
        const data = await api.getOperations()

        // Filter operations with follow-up dates set to today
        const today = new Date().toISOString().split('T')[0]
        const followUpsToday = data.filter((operation) => {
          const followUpDate = operation.followUpDate || operation.reviewOn || ''
          return followUpDate === today
        })

        setOperations(followUpsToday)
      } else {
        console.error('getOperations method not available')
        setError('Failed to load operations: API method not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError('Failed to load operations')
    } finally {
      setLoading(false)
    }
  }

  const loadFollowUpPrescriptions = async (): Promise<void> => {
    try {
      setLoading(true)
      const data = await window.api.getPrescriptions()
      // Check if getOperations method exists
      if (data) {
        // Filter operations with follow-up dates set to today
        const today = new Date().toISOString().split('T')[0]
        const followUpsToday = data.filter((prescription) => {
          const followUpDate = prescription['FOLLOW UP DATE'] || ''
          return followUpDate === today
        })

        setFollowUpPrescriptions(followUpsToday)
      } else {
        console.error('getPrescriptions method not available')
        setError('Failed to load prescriptions: API method not available')
      }
    } catch (err) {
      console.error('Error loading prescriptions:', err)
      setError('Failed to load prescriptions')
    } finally {
      setLoading(false)
    }
  }

  // Function to update due amount
  const handleUpdateDue = async (id: string, updatedAmount: number): Promise<void> => {
    try {
      setLoading(true)

      // Find the prescription to update
      const prescription = prescriptions.find((p) => p.id === id)

      if (!prescription) {
        throw new Error('Prescription not found')
      }

      // Calculate total amount from the prescription
      const totalAmount = Number(
        prescription['TOTAL AMOUNT'] || prescription.AMOUNT || prescription.amount || 0
      )

      // If marking as paid (updatedAmount = 0), set amountReceived to totalAmount
      const amountReceived =
        updatedAmount === 0
          ? totalAmount
          : Number(prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0)

      // Update both amountDue and amountReceived fields
      const updatedPrescription = {
        ...prescription,
        amountDue: updatedAmount,
        'AMOUNT DUE': updatedAmount,
        amountReceived: amountReceived,
        'AMOUNT RECEIVED': amountReceived // Update both formats for compatibility
      }

      // Call the API to update the prescription
      await window.api.updatePrescription(id, updatedPrescription)

      // Refresh the prescriptions list
      await loadPrescriptions()

      const message =
        updatedAmount === 0 ? 'Payment marked as complete' : 'Due amount updated successfully'
      addToast(message, 'success')
    } catch (err) {
      console.error('Error updating due amount:', err)
      addToast('Failed to update due amount', 'error')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow-sm sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-6 py-4 sm:px-8 lg:px-10 flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-medium text-gray-800">Dues & Follow-Up</h1>
            <p className="text-sm text-gray-500">Sri Harshini Eye Hospital</p>
          </div>
          <div className="flex items-center space-x-3">
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
            <span>{error}</span>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="mb-6">
          <div className="border-b border-gray-200">
            <nav className="-mb-px flex space-x-8">
              <button
                onClick={() => setActiveTab('dues')}
                className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === 'dues'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Dues
              </button>
              <button
                onClick={() => setActiveTab('followup')}
                className={`py-4 px-1 border-b-2 cursor-pointer font-medium text-sm ${
                  activeTab === 'followup'
                    ? 'border-indigo-500 text-indigo-600'
                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                Follow-Up
              </button>
            </nav>
          </div>
        </div>

        {/* Content based on active tab */}
        {activeTab === 'dues' ? (
          <DuesSection
            prescriptions={prescriptions}
            loading={loading}
            onUpdateDue={handleUpdateDue}
          />
        ) : (
          <FollowUpSection
            operations={operations}
            prescriptions={followUpPrescriptions}
            loading={loading}
          />
        )}

        {/* Toast Container */}
        <ToastContainer toasts={toasts} removeToast={removeToast} />
      </main>
    </div>
  )
}

export default DuesFollowUp
