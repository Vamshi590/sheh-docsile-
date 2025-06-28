import React, { useState } from 'react'

// Define Operation type
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  assistants?: string
  preOpDiagnosis?: string
  postOpDiagnosis?: string
  procedure?: string
  findings?: string
  complications?: string
  followUpDate?: string
  reviewOn?: string
  notes?: string
  [key: string]: unknown
}

interface FollowUpSectionProps {
  operations: Operation[]
  loading: boolean
}

const FollowUpSection: React.FC<FollowUpSectionProps> = ({ operations, loading }) => {
  const [searchTerm, setSearchTerm] = useState('')

  // Filter operations based on search term
  const filteredOperations = operations.filter((operation) => {
    const patientName = String(operation.patientName || '').toLowerCase()
    const patientId = String(operation.patientId || '').toLowerCase()
    const doctorName = String(operation.surgeon || operation.operatedBy || '').toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return (
      patientName.includes(searchLower) ||
      patientId.includes(searchLower) ||
      doctorName.includes(searchLower)
    )
  })

  // Format date for display
  const formatDate = (dateString: unknown): string => {
    if (!dateString || typeof dateString !== 'string') return 'N/A'
    try {
      const date = new Date(dateString)
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    } catch (error) {
      console.error('Error formatting date:', error)
      return String(dateString)
    }
  }

  // Get reason for visit/follow-up
  const getFollowUpReason = (operation: Operation): string => {
    // Check various fields that might contain follow-up reason
    return (
      operation.notes ||
      operation.preOpDiagnosis ||
      operation.postOpDiagnosis ||
      operation.findings ||
      operation.operationType ||
      'Follow-up visit'
    )
  }

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Follow-Up / Review</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by patient name, ID or doctor..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
          />
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-5 w-5 text-gray-400 absolute left-3 top-1/2 transform -translate-y-1/2"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
            />
          </svg>
        </div>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-12">
          <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600"></div>
        </div>
      ) : filteredOperations.length > 0 ? (
        <div className="bg-white shadow-sm rounded-lg overflow-hidden border border-gray-200">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Patient Name
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Department/Doctor
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Reason for Visit / Follow-Up Notes
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Review Date
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredOperations.map((operation) => {
                  const reviewDate = operation.followUpDate || operation.reviewOn || ''
                  const doctorName = String(operation.surgeon || operation.operatedBy || 'N/A')
                  const followUpReason = getFollowUpReason(operation)
                  return (
                    <tr key={operation.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">
                          {operation.patientName || 'N/A'}
                        </div>
                        <div className="text-xs text-gray-500">
                          ID: {operation.patientId || 'N/A'}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{doctorName}</div>
                        <div className="text-xs text-gray-500">OPHTHALMOLOGY</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900 max-w-md truncate">
                          {followUpReason}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                          {formatDate(reviewDate)}
                        </span>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="bg-white p-8 rounded-lg shadow-sm border border-gray-200 text-center">
          <p className="text-gray-500">No follow-ups scheduled for today.</p>
        </div>
      )}
    </div>
  )
}

export default FollowUpSection
