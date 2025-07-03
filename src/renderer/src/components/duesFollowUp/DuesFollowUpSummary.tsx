import React, { useState, useEffect } from 'react'

// Define Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  followUpDate?: string
  reviewOn?: string
  [key: string]: unknown
}

interface API {
  // Operation methods
  getOperations?: () => Promise<Operation[]>
  getPatientOperations?: (patientId: string) => Promise<Operation[]>
  addOperation?: (operation: Omit<Operation, 'id'>) => Promise<Operation>
  updateOperation?: (id: string, operation: Operation) => Promise<Operation>
  deleteOperation?: (id: string) => Promise<void>
}

interface DuesFollowUpSummaryProps {
  onClick?: () => void
}

const DuesFollowUpSummary: React.FC<DuesFollowUpSummaryProps> = ({ onClick }) => {
  const [duesCount, setDuesCount] = useState<number>(0)
  const [followUpsCount, setFollowUpsCount] = useState<number>(0)
  const [loading, setLoading] = useState<boolean>(true)

  useEffect(() => {
    // Load counts on component mount
    loadCounts()
  }, [])

  // Function to load dues and follow-up counts
  const loadCounts = async (): Promise<void> => {
    try {
      setLoading(true)

      // Load prescriptions to count dues
      if (window.api.getPrescriptions) {
        const prescriptions = await window.api.getPrescriptions()

        // Count prescriptions with due amounts
        const prescriptionsWithDues = prescriptions.filter((prescription) => {
          const totalAmount = Number(prescription['TOTAL AMOUNT'] || prescription.AMOUNT || 0)
          const amountReceived = Number(
            prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
          )
          const amountDue = totalAmount - amountReceived
          return amountDue > 0
        })
        setDuesCount(prescriptionsWithDues.length)
      }

      // Load operations to count follow-ups for today
      // Check if getOperations exists in the API
      try {
        // Use type assertion to handle potential missing method
        const api = window.api as API
        const getOperations = api.getOperations

        if (typeof getOperations === 'function') {
          const operations = await getOperations()

          // Filter operations with follow-up dates set to today
          const today = new Date().toISOString().split('T')[0]
          const followUpsToday = operations.filter((operation) => {
            const followUpDate = operation.followUpDate || operation.reviewOn || ''
            return followUpDate === today
          })

          setFollowUpsCount(followUpsToday.length)
        }
      } catch (error) {
        console.error('getOperations not available:', error)
      }
    } catch (err) {
      console.error('Error loading dues/follow-up counts:', err)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div
      onClick={onClick}
      className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
    >
      <div className="flex items-center mb-4">
        <div className="bg-indigo-100 p-3 rounded-full mr-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-8 w-8 text-indigo-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
            />
          </svg>
        </div>
        <h3 className="text-xl font-semibold text-gray-900">Dues / Follow-Up</h3>
      </div>

      <div className="ml-16 flex items-center space-x-4">
        {loading ? (
          <div className="text-gray-400">Loading...</div>
        ) : (
          <>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">📌 Dues:</span>
              <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {duesCount}
              </span>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-600 mr-2">Follow-Ups:</span>
              <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                {followUpsCount}
              </span>
            </div>
          </>
        )}
      </div>
    </div>
  )
}

export default DuesFollowUpSummary
