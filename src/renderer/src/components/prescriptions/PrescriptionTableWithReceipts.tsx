import React, { useState, useRef, useEffect } from 'react'
import { jsPDF } from 'jspdf'
import html2canvas from 'html2canvas'
import ReceiptViewer from '../reports/ReceiptViewer'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'
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

  // Reset selection if current selection is no longer in filtered list
  useEffect(() => {
    if (selectedPrescription && !prescriptions.some(p => p.id === selectedPrescription.id)) {
      setSelectedPrescription(null)
      setSelectedReceiptType(null)
    }
  }, [prescriptions])

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

  // Create a ref for the receipt content
  const receiptRef = useRef<HTMLDivElement>(null)

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    if (!selectedPrescription) {
      alert('Please select a prescription first')
      return
    }
    try {
      if (!receiptRef.current) {
        alert('Receipt content not found')
        return
      }

      // Apply a temporary style to replace OKLCH colors with RGB
      const tempStyle = document.createElement('style')
      tempStyle.setAttribute('data-temp-style', 'true')
      tempStyle.innerHTML = `
        * {
          color: black !important;
          background-color: white !important;
          border-color: black !important;
        }
        .receipt-viewer {
          color: black !important;
          background-color: white !important;
        }
      `
      document.head.appendChild(tempStyle)

      // Add debug log to check receipt element dimensions
      console.log('Print receipt element dimensions:', {
        width: receiptRef.current.offsetWidth,
        height: receiptRef.current.offsetHeight
      })

      // Create a canvas from the receipt element
      const canvas = await html2canvas(receiptRef.current, {
        scale: 3, // Higher scale for better quality
        logging: true,
        useCORS: true,
        backgroundColor: '#ffffff',
        width: receiptRef.current.offsetWidth,
        height: receiptRef.current.offsetHeight,
        ignoreElements: (element) => {
          // Skip elements with complex CSS that might use OKLCH
          return element.classList.contains('ignore-in-pdf') || false
        }
      })

      // Log canvas dimensions for debugging
      console.log('Print canvas dimensions:', {
        width: canvas.width,
        height: canvas.height
      })
      // Create PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      })

      // Add image to PDF with proper margins and scaling
      const imgData = canvas.toDataURL('image/png')
      const pageWidth = 210 // A4 width in mm
      const pageHeight = 297 // A4 height in mm
      const margin = 5 // margin in mm

      // Calculate dimensions for both width-based and height-based scaling
      // to determine which one utilizes more of the page
      const availableWidth = pageWidth - margin
      const availableHeight = pageHeight - margin

      // Width-based scaling (fit to page width)
      const widthBasedImgWidth = availableWidth
      const widthBasedImgHeight = (canvas.height * widthBasedImgWidth) / canvas.width
      const widthBasedArea = widthBasedImgWidth * widthBasedImgHeight

      // Height-based scaling (fit to page height)
      const heightBasedImgHeight = availableHeight
      const heightBasedImgWidth = (canvas.width * heightBasedImgHeight) / canvas.height
      const heightBasedArea = heightBasedImgWidth * heightBasedImgHeight

      // Log calculated dimensions for both approaches
      console.log('Print PDF dimensions calculation:', {
        pageWidth,
        pageHeight,
        widthBased: {
          width: widthBasedImgWidth,
          height: widthBasedImgHeight,
          area: widthBasedArea
        },
        heightBased: {
          width: heightBasedImgWidth,
          height: heightBasedImgHeight,
          area: heightBasedArea
        },
        aspectRatio: canvas.width / canvas.height
      })

      // Always use the approach that maximizes the area used on the page
      const useHeightBased = heightBasedArea > widthBasedArea

      // Set minimal margins
      const yPosition = margin / 2

      if (useHeightBased) {
        // Use height-based scaling to maximize page usage
        const xPos = (pageWidth - heightBasedImgWidth) / 2
        pdf.addImage(imgData, 'PNG', xPos, yPosition, heightBasedImgWidth, heightBasedImgHeight)
      } else {
        // Use width-based scaling
        const xPosition = margin / 2
        pdf.addImage(imgData, 'PNG', xPosition, yPosition, widthBasedImgWidth, widthBasedImgHeight)
      }
      // Open PDF in a new window for printing
      const pdfBlob = pdf.output('blob')
      const pdfUrl = URL.createObjectURL(pdfBlob)
      const printWindow = window.open(pdfUrl)
      if (printWindow) {
        printWindow.onload = () => {
          setTimeout(() => {
            printWindow.print()
          }, 500)
        }
      } else {
        // If popup blocked, offer direct download
        const downloadLink = document.createElement('a')
        downloadLink.href = pdfUrl
        downloadLink.download = `receipt-${selectedPrescription.id}.pdf`
        document.body.appendChild(downloadLink)
        downloadLink.click()
        document.body.removeChild(downloadLink)
        alert('Print popup was blocked. PDF has been downloaded instead.')
      }
    } catch (error) {
      console.error('Error printing:', error)
      alert('Failed to print. Please try again.')
    } finally {
      // Remove the temporary style
      const tempStyle = document.querySelector('style[data-temp-style="true"]')
      if (tempStyle) {
        document.head.removeChild(tempStyle)
      }
    }
  }

  const stripOKLCH = (root: HTMLElement): void => {
    const walker = document.createTreeWalker(root, NodeFilter.SHOW_ELEMENT)
    while (walker.nextNode()) {
      const el = walker.currentNode as HTMLElement
      const inline = el.getAttribute('style')
      if (inline && inline.includes('oklch')) {
        el.setAttribute('style', inline.replace(/oklch\([^)]*\)/g, '#000'))
      }
      const styles = window.getComputedStyle(el)
      ;['color', 'backgroundColor', 'borderColor'].forEach((prop) => {
        const val = styles.getPropertyValue(prop)
        if (val && val.includes('oklch')) {
          el.style.setProperty(prop, '#000')
        }
      })
    }
  }

  const sendWhatsAppMessage = async (): Promise<void> => {
    try {
      const receiptEl =
        (receiptRef.current?.querySelector('[id^="receipt-"]') as HTMLElement | null) ||
        (receiptRef.current as HTMLElement | null)
      if (!receiptEl) {
        alert('Receipt element not found')
        return
      }
      // Clone and clean oklch colors
      const clone = receiptEl.cloneNode(true) as HTMLElement
      stripOKLCH(clone)
      clone.style.width = '794px'
      clone.style.height = '1123px'
      clone.style.backgroundColor = '#ffffff'
      document.body.appendChild(clone)

      const canvas = await html2canvas(clone, {
        scale: 2,
        backgroundColor: '#ffffff',
        useCORS: true
      })
      document.body.removeChild(clone)
      const imgData = canvas.toDataURL('image/png')

      // Create PDF with A4 dimensions (points)
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89
      const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])
      const pngImage = await pdfDoc.embedPng(imgData)

      // Scale the image so it always fits inside the page while preserving aspect ratio
      const imgWidth = pngImage.width
      const imgHeight = pngImage.height
      const scale = Math.min(PAGE_WIDTH / imgWidth, PAGE_HEIGHT / imgHeight)
      const drawWidth = imgWidth * scale
      const drawHeight = imgHeight * scale
      const x = (PAGE_WIDTH - drawWidth) / 2
      const y = (PAGE_HEIGHT - drawHeight) / 2

      page.drawImage(pngImage, {
        x,
        y,
        width: drawWidth,
        height: drawHeight
      })
      const pdfBytes = await pdfDoc.save()

      // Save locally so the user can attach it in WhatsApp Web
      // Build filename as patientNAME_date.pdf  (e.g., John_Doe_2025-07-16.pdf)
      const dateStr = new Date().toISOString().slice(0, 10)
      let patientName = 'Receipt'
      const nameNode = receiptEl.querySelector('[data-patient-name]') as HTMLElement | null
      if (nameNode?.textContent) {
        patientName = nameNode.textContent.trim().replace(/\s+/g, '_')
      }
      const fileName = `${patientName}_${dateStr}.pdf`

      // Attempt silent save if Node fs API is available (Electron renderer with contextIsolation disabled)
      let savedSilently = false
      try {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const _require = (window as any).require
        if (typeof _require === 'function') {
          const fs = _require('fs') as typeof import('fs')
          const path = _require('path') as typeof import('path')
          const os = _require('os') as typeof import('os')
          const dest = path.join(os.homedir(), 'Downloads', fileName)
          fs.writeFileSync(dest, Buffer.from(pdfBytes), { encoding: 'binary' })
          savedSilently = true
        }
      } catch {
        /* ignore */
      }

      if (!savedSilently) {
        const blob = new Blob([pdfBytes], { type: 'application/pdf' })
        saveAs(blob, fileName)
      }

      // Build patient phone
      let patientPhone = String(
        selectedPrescription?.['PHONE NUMBER'] || selectedPrescription?.phone || ''
      ).replace(/\D/g, '')
      if (patientPhone.startsWith('91')) {
        patientPhone = patientPhone.slice(2)
      }
      patientPhone = `91${patientPhone}`

      // Open WhatsApp Web with chat to patient number
      window.open(`https://web.whatsapp.com/send?phone=${patientPhone}`, '_blank')
    } catch (err) {
      console.error('Failed to create/send PDF:', err)
      alert('Failed to share via WhatsApp')
    }
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
                    onClick={() => {
                      setSelectedReceiptType(null)
                      setSelectedPrescription(null)
                    }}
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
                <div ref={receiptRef}>
                  <ReceiptViewer
                    report={selectedPrescription}
                    receiptType={selectedReceiptType}
                    selectedOperation={selectedOperation || undefined}
                  />
                </div>
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
                  onClick={sendWhatsAppMessage}
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
