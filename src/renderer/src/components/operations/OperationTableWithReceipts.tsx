import React, { useState, useRef } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import ReceiptViewer from '../reports/ReceiptViewer'

// Operation type – keep flexible with index signature so extra props don\'t break TS
export interface Operation {
  id: string
  patientId: string
  patientName: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  dateOfAdmit?: string
  timeOfAdmit?: string
  dateOfOperation?: string
  timeOfOperation?: string
  dateOfDischarge?: string
  timeOfDischarge?: string
  operationDetails?: string
  operationProcedure?: string
  provisionDiagnosis?: string
  operatedBy?: string
  totalAmount?: number
  reviewOn?: string
  [key: string]: unknown
}

interface OperationTableWithReceiptsProps {
  operations: Operation[]
  onEditOperation?: (operation: Operation) => void
  onDeleteOperation?: (id: string) => void
}

const OperationTableWithReceipts: React.FC<OperationTableWithReceiptsProps> = ({
  operations,
  onEditOperation,
  onDeleteOperation
}) => {
  const [selectedOperation, setSelectedOperation] = useState<Operation | null>(null)
  // single receipt type for operations
  const receiptRef = useRef<HTMLDivElement>(null)
  console.log(operations)
  console.log('selectedOperation', selectedOperation)

  // ===== Handlers =====
  const handleRowClick = (operation: Operation): void => {
    if (selectedOperation?.id === operation.id) {
      setSelectedOperation(null)
    } else {
      setSelectedOperation(operation)
    }
  }

  // --- Print helper (re-used from prescriptions) ---
  const generatePdf = async (): Promise<Blob | null> => {
    if (!receiptRef.current) return null

    // Temporary style to avoid oklch colours
    const tempStyle = document.createElement('style')
    tempStyle.setAttribute('data-temp-style', 'true')
    tempStyle.innerHTML = `*{color:black!important;background:white!important;border-color:black!important}`
    document.head.appendChild(tempStyle)

    try {
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3,
        useCORS: true,
        backgroundColor: '#ffffff'
      })
      const pdf = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })
      const imgData = canvas.toDataURL('image/png')
      const pageWidth = 210
      const pageHeight = 297
      const margin = 5
      // pick best scaling option
      const availW = pageWidth - margin
      const availH = pageHeight - margin
      const wFitH = (canvas.height * availW) / canvas.width
      const hFitW = (canvas.width * availH) / canvas.height
      const useHeight = availW * wFitH < hFitW * availH // choose larger area
      if (useHeight) {
        const imgW = hFitW
        const imgH = availH
        pdf.addImage(imgData, 'PNG', (pageWidth - imgW) / 2, margin / 2, imgW, imgH)
      } else {
        const imgW = availW
        const imgH = wFitH
        pdf.addImage(imgData, 'PNG', margin / 2, margin / 2, imgW, imgH)
      }
      return pdf.output('blob')
    } finally {
      const style = document.querySelector('style[data-temp-style="true"]')
      if (style) document.head.removeChild(style)
    }
  }

  const handlePrint = async (): Promise<void> => {
    if (!selectedOperation) {
      alert('Please select an operation first')
      return
    }
    const blob = await generatePdf()
    if (!blob) return
    const url = URL.createObjectURL(blob)
    const win = window.open(url)
    if (win) {
      win.onload = () => setTimeout(() => win.print(), 500)
    }
  }

  const handleWhatsAppShare = async (): Promise<void> => {
    if (!selectedOperation) return
    const phoneNumber = '' // No phone number on operation – adapt if available
    if (!phoneNumber) {
      alert('No phone number available for this patient')
      return
    }
    const blob = await generatePdf()
    if (!blob) return
    const file = new File([blob], `operation-receipt-${selectedOperation.id}.pdf`, {
      type: 'application/pdf'
    })
    const message = `Operation receipt for ${selectedOperation.patientName}`

    if (navigator.share && navigator.canShare({ files: [file] })) {
      try {
        await navigator.share({ files: [file], title: 'Operation Receipt', text: message })
        return
      } catch (err) {
        console.error('Error sharing via Web Share API:', err)
      }
    }
    const encoded = encodeURIComponent(message)
    window.open(`https://wa.me/${phoneNumber}?text=${encoded}`, '_blank')
  }

  return (
    <div>
      {/* Operations Table */}
      <div
        className="overflow-x-auto mb-6"
        style={{
          overflowX: 'auto',
          /* Custom scrollbar styling */
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
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Patient Name
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Admit
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Admit
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Operation
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Operation
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Date of Discharge
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Time of Discharge
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Procedure
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Operation Details
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Provision Diagnosis
              </th>
              <th
                scope="col"
                className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider whitespace-nowrap"
              >
                Review On
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Operated By
              </th>
              <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {operations.map((operation) => (
              <tr
                key={operation.id}
                className={`cursor-pointer hover:bg-gray-50 ${
                  selectedOperation?.id === operation.id ? 'bg-gray-100' : ''
                }`}
                onClick={() => handleRowClick(operation)}
              >
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.patientName || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfAdmit || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfAdmit || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfOperation || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfOperation || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.dateOfDischarge || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.timeOfDischarge || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operationProcedure && operation.operationProcedure.length > 30
                    ? `${operation.operationProcedure.substring(0, 30)}...`
                    : operation.operationProcedure || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operationDetails && operation.operationDetails.length > 30
                    ? `${operation.operationDetails.substring(0, 30)}...`
                    : operation.operationDetails || '-'}
                </td>

                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.provisionDiagnosis && operation.provisionDiagnosis.length > 30
                    ? `${operation.provisionDiagnosis.substring(0, 30)}...`
                    : operation.provisionDiagnosis || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.reviewOn || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900">
                  {operation.operatedBy || '-'}
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                  <button
                    className="text-blue-600 hover:text-blue-800 mr-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      onEditOperation && onEditOperation(operation)
                    }}
                  >
                    Edit
                  </button>
                  <button
                    className="text-green-600 hover:text-green-800 mr-3"
                    onClick={(e) => {
                      e.stopPropagation()
                      setSelectedOperation(operation)
                      // open receipt selection implicitly
                    }}
                  >
                    Receipt
                  </button>
                  <button
                    className="text-red-600 hover:text-red-800"
                    onClick={(e) => {
                      e.stopPropagation()
                      if (confirm('Are you sure you want to delete this operation?')) {
                        onDeleteOperation && onDeleteOperation(operation.id)
                      }
                    }}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Receipt Viewer + Actions */}
      {selectedOperation && (
        <div className="bg-white p-4 rounded-lg border border-gray-200" ref={receiptRef}>
          <ReceiptViewer
            report={selectedOperation}
            receiptType="operation"
            selectedOperation={selectedOperation}
          />
          <div className="flex justify-end gap-3 mt-3">
            <button
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-md"
              onClick={handlePrint}
            >
              Print
            </button>
            <button
              className="px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-md"
              onClick={handleWhatsAppShare}
            >
              WhatsApp
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

export default OperationTableWithReceipts
