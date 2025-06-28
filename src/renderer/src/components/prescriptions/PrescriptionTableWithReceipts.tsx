import React, { useState } from 'react'
import ReceiptViewer from '../reports/ReceiptViewer'

// Define the Prescription type to match with other components
type Prescription = {
  id: string
  [key: string]: unknown
}

// Define Operation type for operation receipts
interface Operation {
  id: string
  patientId: string
  patientName: string
  date: string
  operationType: string
  surgeon: string
  procedure?: string
  findings?: string
  dateOfAdmit?: string
  dateOfDischarge?: string
  dateOfOperation?: string
  operationDate?: string
  billingItems?: Array<{ description: string; amount: number }>
  totalAmount?: number
  advancePaid?: number
  discount?: number
  amountReceived?: number
  balance?: number
  [key: string]: unknown
}

interface PrescriptionTableWithReceiptsProps {
  prescriptions: Prescription[]
  onEditPrescription?: (prescription: Prescription) => void
  onDeletePrescription?: (id: string) => void
}

const PrescriptionTableWithReceipts: React.FC<PrescriptionTableWithReceiptsProps> = ({
  prescriptions,
  onEditPrescription,
  onDeletePrescription
}) => {
  const [selectedPrescription, setSelectedPrescription] = useState<Prescription | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<string | null>(null)
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  // State for managing receipt viewing and operations

  // Handle row click to select a prescription
  const handleRowClick = (prescription: Prescription): void => {
    if (selectedPrescription?.id === prescription.id) {
      // If clicking the same prescription, deselect it
      setSelectedPrescription(null)
      setSelectedReceiptType(null)
    } else {
      setSelectedPrescription(prescription)
      setSelectedReceiptType(null) // Reset receipt type when selecting a new prescription
    }
  }

  // Handle receipt type selection
  const handleSelectReceiptType = (type: string, operationData?: Operation): void => {
    setSelectedReceiptType(type)
    if (operationData) {
      setSelectedOperation(operationData)
    }
  }

  // Handle print button click
  const handlePrint = (): void => {
    window.print()
    // if (!selectedPrescription || !selectedReceiptType) return

    // const receiptElement = document.getElementById('receipt-content')
    // if (receiptElement) {
    //   const printWindow = window.open('', '_blank', 'width=800,height=600')
    //   if (printWindow) {
    //     // Create a complete HTML document with all necessary styles embedded
    //     const printContent = `
    //       <!DOCTYPE html>
    //       <html>
    //       <head>
    //         <title>Print Receipt</title>
    //         <meta charset="UTF-8">
    //         <meta name="viewport" content="width=device-width, initial-scale=1.0">
    //         <style>
    //           @page { size: auto; margin: 10mm; }
    //           body { margin: 0; font-family: Arial, sans-serif; }
    //           .receipt-container { padding: 10px; }
    //           table { width: 100%; border-collapse: collapse; }
    //           table, th, td { border: 1px solid #ddd; }
    //           th, td { padding: 8px; text-align: left; }
    //           .header { display: flex; justify-content: space-between; margin-bottom: 20px; }
    //           .text-center { text-align: center; }
    //           .text-right { text-align: right; }
    //           .font-bold { font-weight: bold; }
    //           .mt-2 { margin-top: 8px; }
    //           .mb-2 { margin-bottom: 8px; }
    //           .p-4 { padding: 16px; }
    //         </style>
    //       </head>
    //       <body>
    //         <div class="receipt-container">
    //           ${receiptElement.innerHTML}
    //         </div>
    //       </body>
    //       </html>
    //     `

    //     printWindow.document.open()
    //     printWindow.document.write(printContent)
    //     printWindow.document.close()

    //     // Wait for content to load before printing
    //     printWindow.onload = function() {
    //       printWindow.focus()
    //       setTimeout(() => {
    //         printWindow.print()
    //       }, 500)
    //     }
    //   }
    // }
  }

  // Handle WhatsApp share
  const handleWhatsAppShare = (): void => {
    if (!selectedPrescription) return

    const phoneNumber = selectedPrescription['PHONE NUMBER']?.toString() || ''
    if (!phoneNumber) {
      alert('No phone number available for this patient')
      return
    }

    // Format the message
    let message = `Dear ${selectedPrescription['PATIENT NAME']?.toString() || 'Patient'},\n\n`
    message += `Thank you for visiting Sri Harshini Eye Hospital.\n\n`

    if (selectedReceiptType === 'cash') {
      message += `Your payment of ₹${selectedPrescription['AMOUNT RECEIVED']?.toString() || '0'} has been received.\n`
      message += `Total Amount: ₹${selectedPrescription['TOTAL AMOUNT']?.toString() || '0'}\n`
      if (Number(selectedPrescription['AMOUNT DUE'] || 0) > 0) {
        message += `Balance Due: ₹${selectedPrescription['AMOUNT DUE']?.toString() || '0'}\n`
      }
    } else if (selectedReceiptType === 'prescription') {
      message += `Your prescription details are ready.\n`
      if (selectedPrescription['FOLLOW UP DATE']) {
        message += `Follow-up Date: ${selectedPrescription['FOLLOW UP DATE']?.toString() || ''}\n`
      }
    }

    message += `\nBest regards,\nSri Harshini Eye Hospital Team`

    // Encode the message for WhatsApp URL
    const encodedMessage = encodeURIComponent(message)
    const whatsappUrl = `https://wa.me/${phoneNumber}?text=${encodedMessage}`

    // Open WhatsApp in a new window
    window.open(whatsappUrl, '_blank')
  }

  if (prescriptions.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-md">
        <p className="text-gray-500">No prescriptions found</p>
      </div>
    )
  }

  return (
    <div id="main-content" className="space-y-4">
      {/* Receipt Options - Only show when a prescription is selected */}
      {selectedPrescription && (
        <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
          <h3 className="text-lg font-medium text-gray-900 mb-3">
            Receipt Options for {String(selectedPrescription['PATIENT NAME'])}
          </h3>

          <div className="flex flex-wrap gap-2 mb-4">
            <button
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
              onClick={() => handleSelectReceiptType('cash')}
            >
              Cash Receipt
            </button>
            <button
              className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
              onClick={() => handleSelectReceiptType('prescription')}
            >
              Prescription Receipt
            </button>
            <button
              className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
              onClick={() => handleSelectReceiptType('readings')}
            >
              Readings Receipt
            </button>
            <button
              className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
              onClick={() => handleSelectReceiptType('clinical')}
            >
              Clinical Findings
            </button>
          </div>

          {/* Receipt Viewer */}
          {selectedReceiptType && (
            <div
              id="receipt-container"
              className="mt-4 border border-gray-200 bg-gray-50 rounded-md overflow-hidden"
            >
              <div className="flex justify-between items-center p-2 bg-gray-100 border-b border-gray-200">
                <h4 className="font-medium text-gray-700">Receipt Preview</h4>
                <div className="flex space-x-2">
                  {onEditPrescription && (
                    <button
                      onClick={() => onEditPrescription(selectedPrescription)}
                      className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors flex items-center"
                      title="Edit Prescription"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"
                        />
                      </svg>
                      Edit
                    </button>
                  )}
                  {onDeletePrescription && (
                    <button
                      onClick={() => {
                        const patientName = selectedPrescription['PATIENT NAME'] || 'this patient'
                        const confirmMessage = `Are you sure you want to delete the prescription for ${patientName}?\n\nThis will permanently delete all prescription data, readings, and financial information.`

                        if (window.confirm(confirmMessage)) {
                          onDeletePrescription(selectedPrescription.id as string)
                          setSelectedPrescription(null)
                          setSelectedReceiptType(null)
                        }
                      }}
                      className="px-3 py-1 text-sm bg-red-100 text-red-700 rounded-md hover:bg-red-200 transition-colors flex items-center"
                      title="Delete Prescription"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 mr-1"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                      Delete
                    </button>
                  )}
                  <button
                    onClick={() => setSelectedReceiptType(null)}
                    className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors flex items-center"
                    title="Close Receipt"
                  >
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-4 w-4 mr-1"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                    Close
                  </button>
                </div>
              </div>
              <div id="receipt-content">
                <ReceiptViewer
                  report={selectedPrescription}
                  receiptType={selectedReceiptType}
                  selectedOperation={selectedOperation || undefined}
                />
              </div>

              {/* Print and WhatsApp buttons */}
              <div className="flex justify-end p-3 bg-gray-50 border-t border-gray-200">
                <button
                  className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors mr-3 flex items-center"
                  onClick={handlePrint}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"
                    />
                  </svg>
                  Print
                </button>
                <button
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 transition-colors flex items-center"
                  onClick={handleWhatsAppShare}
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z" />
                  </svg>
                  Share via WhatsApp
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Prescription Table */}
      <div
        className="overflow-x-auto"
        style={{
          overflowX: 'auto',
          scrollbarWidth: 'thin',
          scrollbarColor: '#cbd5e0 #f9fafb'
        }}
      >
        <style>
          {`
          /* Custom scrollbar for WebKit browsers (Chrome, Safari) */
          div::-webkit-scrollbar {
            width: 6px;
            height: 6px;
          }
          div::-webkit-scrollbar-track {
            background: #f9fafb;
          }
          div::-webkit-scrollbar-thumb {
            background-color: #cbd5e0;
            border-radius: 6px;
          }
          `}
        </style>
        <table className="min-w-full divide-y divide-gray-200 table-fixed">
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
                Patient Name
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
                DOB
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Age
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Gender
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
                Amount Received
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Amount Due
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {prescriptions.map((prescription) => (
              <tr
                key={prescription.id as string}
                className={`hover:bg-gray-50 cursor-pointer ${selectedPrescription?.id === prescription.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(prescription)}
              >
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
                  {(prescription['PATIENT NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['GUARDIAN NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.DOB as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.AGE as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription.GENDER as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['PHONE NUMBER'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(prescription['DOCTOR NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['TOTAL AMOUNT'] !== undefined &&
                  prescription['TOTAL AMOUNT'] !== null
                    ? `₹${prescription['TOTAL AMOUNT']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['AMOUNT RECEIVED'] !== undefined &&
                  prescription['AMOUNT RECEIVED'] !== null
                    ? `₹${prescription['AMOUNT RECEIVED']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {prescription['AMOUNT DUE'] !== undefined && prescription['AMOUNT DUE'] !== null
                    ? `₹${prescription['AMOUNT DUE']}`
                    : '-'}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PrescriptionTableWithReceipts
