import React, { useState } from 'react'

// Define the Prescription type
type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  date?: string
  receiptId?: string
  amount?: string | number
  paymentMethod?: string
  amountReceived?: number
  amountDue?: number
  totalAmount?: number
  [key: string]: unknown
}

interface DuesSectionProps {
  prescriptions: Prescription[]
  loading: boolean
  onUpdateDue: (id: string, updatedAmount: number) => Promise<void>
}

const DuesSection: React.FC<DuesSectionProps> = ({ prescriptions, loading, onUpdateDue }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [editingDue, setEditingDue] = useState<string | null>(null)
  const [dueAmount, setDueAmount] = useState<number>(0)

  // Filter prescriptions based on search term
  const filteredPrescriptions = prescriptions.filter((prescription) => {
    const patientName = String(
      prescription.patientName || prescription['PATIENT NAME'] || ''
    ).toLowerCase()
    const patientId = String(
      prescription.patientId || prescription['PATIENT ID'] || ''
    ).toLowerCase()
    const searchLower = searchTerm.toLowerCase()

    return patientName.includes(searchLower) || patientId.includes(searchLower)
  })

  // Handle starting the edit process
  const handleEditDue = (prescription: Prescription): void => {
    setEditingDue(prescription.id)

    // Calculate due amount
    const totalAmount = Number(
      prescription['TOTAL AMOUNT'] || prescription.AMOUNT || prescription.amount || 0
    )
    const amountReceived = Number(
      prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
    )
    const amountDue = Number(prescription.amountDue || totalAmount - amountReceived)

    setDueAmount(amountDue)
  }

  // Handle saving the updated due amount
  const handleSaveDue = async (id: string): Promise<void> => {
    await onUpdateDue(id, dueAmount)
    setEditingDue(null)
  }

  // Handle marking as fully paid
  const handleMarkAsPaid = async (id: string): Promise<void> => {
    await onUpdateDue(id, 0)
    setEditingDue(null)
  }

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

  return (
    <div>
      <div className="mb-6 flex justify-between items-center">
        <h2 className="text-xl font-semibold">Dues</h2>
        <div className="relative">
          <input
            type="text"
            placeholder="Search by patient name or ID..."
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
      ) : filteredPrescriptions.length > 0 ? (
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
                    Receipt Date
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Total Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Paid Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Due Amount
                  </th>
                  <th
                    scope="col"
                    className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredPrescriptions.map((prescription) => {
                  const totalAmount = Number(
                    prescription['TOTAL AMOUNT'] || prescription.AMOUNT || prescription.amount || 0
                  )
                  const amountReceived = Number(
                    prescription.amountReceived || prescription['AMOUNT RECEIVED'] || 0
                  )
                  const amountDue = Number(prescription.amountDue || totalAmount - amountReceived)
                  const isEditing = editingDue === prescription.id
                  const patientName = String(
                    prescription.patientName || prescription['PATIENT NAME'] || 'N/A'
                  )
                  const patientId = String(
                    prescription.patientId || prescription['PATIENT ID'] || 'N/A'
                  )
                  return (
                    <tr key={prescription.id} className="hover:bg-gray-50">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-medium text-gray-900">{patientName}</div>
                        <div className="text-xs text-gray-500">ID: {patientId}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {formatDate(prescription.date || prescription.DATE)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{totalAmount.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        ₹{amountReceived.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        {isEditing ? (
                          <input
                            type="number"
                            value={dueAmount}
                            onChange={(e) => setDueAmount(Number(e.target.value))}
                            className="w-24 px-2 py-1 border border-gray-300 rounded-md focus:outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        ) : (
                          <span className="text-sm font-medium text-red-600">
                            ₹{amountDue.toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        {isEditing ? (
                          <div className="flex space-x-2 justify-end">
                            <button
                              onClick={() => handleSaveDue(prescription.id)}
                              className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-2 py-1 rounded-md"
                            >
                              Save
                            </button>
                            <button
                              onClick={() => handleMarkAsPaid(prescription.id)}
                              className="text-green-600 hover:text-green-900 bg-green-50 px-2 py-1 rounded-md"
                            >
                              Mark Paid
                            </button>
                            <button
                              onClick={() => setEditingDue(null)}
                              className="text-gray-600 hover:text-gray-900 bg-gray-50 px-2 py-1 rounded-md"
                            >
                              Cancel
                            </button>
                          </div>
                        ) : (
                          <button
                            onClick={() => handleEditDue(prescription)}
                            className="text-indigo-600 hover:text-indigo-900 bg-indigo-50 px-3 py-1 rounded-md"
                          >
                            Update Due
                          </button>
                        )}
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
          <p className="text-gray-500">No dues found.</p>
        </div>
      )}
    </div>
  )
}

export default DuesSection
