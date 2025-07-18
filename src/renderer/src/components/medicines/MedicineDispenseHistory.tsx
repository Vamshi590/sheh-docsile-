import React, { useState, useEffect } from 'react'

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

interface MedicineDispenseHistoryProps {
  records: MedicineDispenseRecord[]
  loading: boolean
  error: string
  onPageChange?: (page: number) => void
  totalCount?: number
  currentPage?: number
  pageSize?: number
}

const MedicineDispenseHistory: React.FC<MedicineDispenseHistoryProps> = ({
  records = [],
  loading,
  error,
  onPageChange,
  totalCount = 0,
  currentPage: externalCurrentPage,
  pageSize = 10
}) => {
  // Internal pagination state (used if not controlled externally)
  const [internalCurrentPage, setInternalCurrentPage] = useState(1)

  // Use external pagination state if provided, otherwise use internal
  const currentPage = externalCurrentPage || internalCurrentPage
  const totalPages = Math.ceil(totalCount / pageSize) || Math.ceil(records.length / pageSize) || 1

  // Handle page change
  const handlePageChange = (page: number): void => {
    if (onPageChange) {
      // If controlled externally, call the provided handler
      onPageChange(page)
    } else {
      // Otherwise, update internal state
      setInternalCurrentPage(page)
    }
  }

  // Reset to first page when records change if using internal pagination
  useEffect(() => {
    if (!externalCurrentPage) {
      setInternalCurrentPage(1)
    }
  }, [records.length, externalCurrentPage])
  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
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
          <p className="mt-3 text-gray-500">Loading dispensing history...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="text-center py-10">
        <svg
          className="mx-auto h-12 w-12 text-red-400"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
        <p className="mt-2 text-sm text-red-500">{error}</p>
      </div>
    )
  }

  if (records.length === 0) {
    return (
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
        <p className="text-gray-600 text-lg mb-2">No dispensing records found</p>
        <p className="text-gray-500 mb-6">
          Records will appear here when medicines are dispensed to patients
        </p>
      </div>
    )
  }

  return (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date & Time
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Medicine
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Batch No.
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Quantity
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Price
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
              Dispensed By
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(records) &&
            records.map((record) => (
              <tr key={record.id} className="hover:bg-gray-50">
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{formatDate(record.dispensedDate)}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">{record.medicineName}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{record.batchNumber}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">{record.quantity}</div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-500">
                    ₹
                    {typeof record.price === 'number'
                      ? record.price.toFixed(2)
                      : parseFloat(record.price || '0').toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm font-medium text-gray-900">
                    ₹
                    {typeof record.totalAmount === 'number'
                      ? record.totalAmount.toFixed(2)
                      : parseFloat(record.totalAmount || '0').toFixed(2)}
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="text-sm text-gray-900">{record.patientName}</div>
                  {record.patientId && (
                    <div className="text-xs text-gray-500">ID: {record.patientId}</div>
                  )}
                </td>
              </tr>
            ))}
        </tbody>
      </table>
      {/* Pagination */}
      {totalPages > 1 && (
        <div className="px-6 py-3 flex items-center justify-between border-t border-gray-200">
          <div className="flex-1 flex justify-between items-center">
            <button
              onClick={() => handlePageChange(Math.max(currentPage - 1, 1))}
              disabled={currentPage === 1}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Previous
            </button>
            <div className="hidden md:flex">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map((number) => (
                <button
                  key={number}
                  onClick={() => handlePageChange(number)}
                  className={`mx-1 relative inline-flex items-center px-4 py-2 border text-sm font-medium rounded-md ${currentPage === number ? 'bg-blue-500 text-white border-blue-500' : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'}`}
                >
                  {number}
                </button>
              ))}
            </div>
            <div className="md:hidden text-sm text-gray-700">
              Page {currentPage} of {totalPages}
            </div>
            <button
              onClick={() => handlePageChange(Math.min(currentPage + 1, totalPages))}
              disabled={currentPage === totalPages}
              className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
            >
              Next
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default MedicineDispenseHistory
