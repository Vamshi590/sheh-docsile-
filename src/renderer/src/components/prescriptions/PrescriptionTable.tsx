import React from 'react'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

interface PrescriptionTableProps {
  prescriptions: Prescription[]
  onEdit: (prescription: Prescription) => void
  onDelete: (id: string) => void
}

const PrescriptionTable: React.FC<PrescriptionTableProps> = ({
  prescriptions,
  onEdit,
  onDelete
}) => {
  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No prescriptions found</p>
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
              Sno
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Date
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Patient ID
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Guardian Name
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Phone Number
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Doctor
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
              Amount Due
            </th>
            <th
              scope="col"
              className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Actions
            </th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {prescriptions.map((prescription) => (
            <tr key={prescription.id as string} className="hover:bg-gray-50">
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription.Sno as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription.DATE as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription['PATIENT ID'] as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription['GUARDIAN NAME'] as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription['PHONE NUMBER'] as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {(prescription['DOCTOR NAME'] as React.ReactNode) || '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {typeof prescription['TOTAL AMOUNT'] === 'number'
                  ? `₹${prescription['TOTAL AMOUNT']}`
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                {typeof prescription['AMOUNT DUE'] === 'number'
                  ? `₹${prescription['AMOUNT DUE']}`
                  : '-'}
              </td>
              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                <button
                  onClick={() => onEdit(prescription)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  Edit
                </button>
                <button
                  onClick={() => onDelete(prescription.id as string)}
                  className="text-red-600 hover:text-red-900"
                >
                  Delete
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default PrescriptionTable
