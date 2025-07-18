import React from 'react'

interface Medicine {
  id: string
  name: string
  quantity: number
  expiryDate: string
  batchNumber: string
  price: number
  status: 'available' | 'completed' | 'out_of_stock'
}

interface MedicineTableProps {
  medicines: Medicine[]
  onEdit: (medicine: Medicine) => void
  onDelete: (id: string) => Promise<void>
  onUpdateStatus: (id: string, status: 'available' | 'completed' | 'out_of_stock') => Promise<void>
  onDispense: (medicine: Medicine) => void
  onAddToDispense?: (medicine: Medicine, quantity: number) => void
  showDispenseControls?: boolean
}

const MedicineTable: React.FC<MedicineTableProps> = ({
  medicines,
  onEdit,
  onDispense,
  onAddToDispense,
  showDispenseControls = false
}) => {
  const [quantities, setQuantities] = React.useState<Record<string, number>>({})
  // Function to format date
  const formatDate = (dateString: string): string => {
    const date = new Date(dateString)
    return date.toLocaleDateString('en-IN', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    })
  }

  // Function to check if medicine is expiring soon (within 30 days)
  const isExpiringSoon = (expiryDate: string): boolean => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    const diffTime = expiry.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    return diffDays <= 30 && diffDays > 0
  }

  // Function to check if medicine is expired
  const isExpired = (expiryDate: string): boolean => {
    const today = new Date()
    const expiry = new Date(expiryDate)
    return expiry < today
  }

  // Function to get status badge class
  const getStatusBadgeClass = (status: string): string => {
    switch (status) {
      case 'available':
        return 'bg-green-100 text-green-800 border border-green-200'
      case 'completed':
        return 'bg-blue-100 text-blue-800 border border-blue-200'
      case 'out_of_stock':
        return 'bg-red-100 text-red-800 border border-red-200'
      default:
        return 'bg-gray-100 text-gray-800 border border-gray-200'
    }
  }

  return (
    <table className="min-w-full divide-y divide-gray-200">
      <thead className="bg-gray-50">
        <tr>
          <th
            scope="col"
            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Name
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
            Expiry Date
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
            Status
          </th>
          <th
            scope="col"
            className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
          >
            Actions
          </th>
          {showDispenseControls && (
            <th
              scope="col"
              className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
            >
              Dispense Quantity
            </th>
          )}
        </tr>
      </thead>
      <tbody className="bg-white divide-y divide-gray-200">
        {medicines.map((medicine) => (
          <tr key={medicine.id} className="hover:bg-gray-50">
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm font-medium text-gray-900">{medicine.name}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{medicine.batchNumber}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div
                className={`text-sm ${
                  isExpired(medicine.expiryDate)
                    ? 'text-red-600 font-medium'
                    : isExpiringSoon(medicine.expiryDate)
                      ? 'text-yellow-600 font-medium'
                      : 'text-gray-500'
                }`}
              >
                {formatDate(medicine.expiryDate)}
                {isExpired(medicine.expiryDate) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                    Expired
                  </span>
                )}
                {isExpiringSoon(medicine.expiryDate) && !isExpired(medicine.expiryDate) && (
                  <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-yellow-100 text-yellow-800">
                    Expiring Soon
                  </span>
                )}
              </div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">{medicine.quantity}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <div className="text-sm text-gray-500">₹{medicine.price.toFixed(2)}</div>
            </td>
            <td className="px-6 py-4 whitespace-nowrap">
              <span
                className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusBadgeClass(
                  medicine.status
                )}`}
              >
                {medicine.status === 'available'
                  ? 'Available'
                  : medicine.status === 'completed'
                    ? 'Completed'
                    : 'Out of Stock'}
              </span>
            </td>
            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
              <div className="flex justify-end space-x-2">
                {/* Edit button */}
                <button
                  onClick={() => onEdit(medicine)}
                  className="text-indigo-600 hover:text-indigo-900 focus:outline-none focus:underline"
                  title="Edit"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-5 w-5"
                    viewBox="0 0 20 20"
                    fill="currentColor"
                  >
                    <path d="M13.586 3.586a2 2 0 112.828 2.828l-.793.793-2.828-2.828.793-.793zM11.379 5.793L3 14.172V17h2.828l8.38-8.379-2.83-2.828z" />
                  </svg>
                </button>

                {/* Dispense button - only show for available medicines with quantity > 0 */}
                {medicine.status === 'available' && medicine.quantity > 0 && (
                  <button
                    onClick={() => onDispense(medicine)}
                    className="bg-blue-500 hover:bg-blue-600 text-white px-2 py-1 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-opacity-50 flex items-center"
                    title="Dispense Medicine"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path d="M11 17a1 1 0 001.447.894l4-2A1 1 0 0017 15V9.236a1 1 0 00-1.447-.894l-4 2a1 1 0 00-.553.894V17zM15.211 6.276a1 1 0 000-1.788l-4.764-2.382a1 1 0 00-.894 0L4.789 4.488a1 1 0 000 1.788l4.764 2.382a1 1 0 00.894 0l4.764-2.382zM4.447 8.342A1 1 0 003 9.236V15a1 1 0 00.553.894l4 2A1 1 0 009 17v-5.764a1 1 0 00-.553-.894l-4-2z" />
                    </svg>
                    Dispense
                  </button>
                )}
              </div>
            </td>
            {showDispenseControls && (
              <td className="px-6 py-4 whitespace-nowrap">
                {medicine.status === 'available' && medicine.quantity > 0 && (
                  <div className="flex items-center space-x-2">
                    <button
                      onClick={() => {
                        const currentQty = quantities[medicine.id] || 0
                        if (currentQty > 0) {
                          setQuantities({
                            ...quantities,
                            [medicine.id]: currentQty - 1
                          })
                        }
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm font-medium focus:outline-none"
                      disabled={(quantities[medicine.id] || 0) <= 0}
                    >
                      -
                    </button>
                    <span className="text-sm font-medium">{quantities[medicine.id] || 0}</span>
                    <button
                      onClick={() => {
                        const currentQty = quantities[medicine.id] || 0
                        if (currentQty < medicine.quantity) {
                          setQuantities({
                            ...quantities,
                            [medicine.id]: currentQty + 1
                          })
                        }
                      }}
                      className="bg-gray-200 hover:bg-gray-300 text-gray-700 px-2 py-1 rounded text-sm font-medium focus:outline-none"
                      disabled={(quantities[medicine.id] || 0) >= medicine.quantity}
                    >
                      +
                    </button>
                    <button
                      onClick={() => {
                        if (onAddToDispense && (quantities[medicine.id] || 0) > 0) {
                          onAddToDispense(medicine, quantities[medicine.id] || 0)
                          setQuantities({
                            ...quantities,
                            [medicine.id]: 0
                          })
                        }
                      }}
                      className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs font-medium focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50"
                      disabled={(quantities[medicine.id] || 0) <= 0}
                    >
                      Add
                    </button>
                  </div>
                )}
              </td>
            )}
          </tr>
        ))}
      </tbody>
    </table>
  )
}

export default MedicineTable
