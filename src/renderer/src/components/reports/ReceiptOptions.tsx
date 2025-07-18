import React, { useState, useEffect, useCallback } from 'react'
import html2canvas from 'html2canvas'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'

// Define interfaces
interface Operation {
  id: string
  patientId: string
  patientName: string
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
  [key: string]: unknown
}

interface API {
  getOperations?: () => Promise<Operation[]>
  getPatientOperations?: (patientId: string) => Promise<Operation[]>
}

// Define props interface
interface ReceiptOptionsProps {
  reportId: string
  reportType: string
  patientName: string
  patientPhone: string
  onSelectReceiptType: (type: string, operationData?: Operation) => void
  patientId?: string
}

const ReceiptOptions: React.FC<ReceiptOptionsProps> = ({
  reportType,
  patientName,
  patientPhone,
  onSelectReceiptType,
  patientId
}) => {
  const [showWhatsAppModal, setShowWhatsAppModal] = useState(false)
  const [showOperationsModal, setShowOperationsModal] = useState(false)
  const [phoneNumber, setPhoneNumber] = useState(patientPhone || '')
  const [message, setMessage] = useState(`Receipt for ${patientName}`)
  const [operations, setOperations] = useState<Operation[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  // Fetch operations from API
  const fetchOperations = useCallback(async (): Promise<void> => {
    try {
      setLoading(true)
      setError('')
      const api = window.api as API
      console.log('Fetching operations with patientId:', patientId)

      // Always fetch all operations first as a fallback
      let allOperations: Operation[] = []

      if (api.getOperations) {
        allOperations = await api.getOperations()
        console.log('All operations fetched:', allOperations.length)

        // Log the first operation to see its structure
        if (allOperations.length > 0) {
          console.log('Sample operation:', allOperations[0])
          console.log('Operation keys:', Object.keys(allOperations[0]))

          // Check if PATIENT ID field exists
          if (allOperations[0]['PATIENT ID']) {
            console.log('Found PATIENT ID field with value:', allOperations[0]['PATIENT ID'])
          }
        }
      }

      if (patientId && api.getPatientOperations) {
        // If patientId is available, fetch only that patient's operations
        try {
          const patientOperations = await api.getPatientOperations(patientId)
          console.log('Patient operations fetched:', patientOperations.length)

          if (patientOperations && patientOperations.length > 0) {
            setOperations(patientOperations)
          } else {
            // If no patient-specific operations found, filter all operations by patientId
            console.log('No patient operations found, filtering all operations')
            console.log('Looking for patientId:', patientId)

            // Try a more flexible approach to match patient IDs
            const filteredOperations = allOperations.filter((op) => {
              // First check specifically for the Excel format
              if (
                op['PATIENT ID'] &&
                String(op['PATIENT ID']).trim() === String(patientId).trim()
              ) {
                console.log('Exact match found on PATIENT ID field')
                return true
              }

              // Check all possible patient ID field names
              const opId = String(
                op.patientId ||
                  op['PATIENT ID'] ||
                  op['PATIENT_ID'] ||
                  op['patientID'] ||
                  op['patient_id'] ||
                  ''
              ).trim()
              const targetId = String(patientId || '').trim()

              // Check if either ID contains the other (for partial matches)
              const isMatch =
                opId === targetId || opId.includes(targetId) || targetId.includes(opId)

              console.log(
                `Comparing: op.patientId=${opId} with patientId=${targetId}, match: ${isMatch}`
              )
              return isMatch
            })
            console.log('Filtered operations by patientId:', filteredOperations.length)
            setOperations(filteredOperations)
          }
        } catch (patientErr) {
          console.error('Error fetching patient operations:', patientErr)
          // Fall back to filtering all operations
          const filteredOperations = allOperations.filter((op) => {
            // First check specifically for the Excel format
            if (op['PATIENT ID'] && String(op['PATIENT ID']).trim() === String(patientId).trim()) {
              console.log('Exact match found on PATIENT ID field in fallback')
              return true
            }

            // Check all possible patient ID field names
            const opId = String(
              op.patientId ||
                op['PATIENT ID'] ||
                op['PATIENT_ID'] ||
                op['patientID'] ||
                op['patient_id'] ||
                ''
            ).trim()
            const targetId = String(patientId || '').trim()

            // Check if either ID contains the other (for partial matches)
            return opId === targetId || opId.includes(targetId) || targetId.includes(opId)
          })
          console.log('Fallback filtered operations:', filteredOperations.length)
          setOperations(filteredOperations)
        }
      } else if (allOperations.length > 0) {
        setOperations(allOperations)
      } else {
        console.error('Operation API methods are not available')
        setError('Failed to load operations: API methods not available')
      }
    } catch (err) {
      console.error('Error loading operations:', err)
      setError('Failed to load operations')
    } finally {
      setLoading(false)
    }
  }, [patientId])

  // Load operations when operations modal is opened
  useEffect(() => {
    if (showOperationsModal) {
      fetchOperations()
    }
  }, [showOperationsModal, fetchOperations])

  // Handle operation selection
  const handleOperationSelect = (operation: Operation): void => {
    onSelectReceiptType('operation', operation)
    setShowOperationsModal(false)
  }

  // Handle print action – render receipt in off-screen iframe to avoid about/blob prompts and preserve preview
  const handlePrint = (): void => {
    const receiptEl = document.querySelector('[id^="receipt-"]') as HTMLElement | null
    if (!receiptEl) {
      console.error('Receipt element not found for printing')
      return
    }

    // Collect current page <style> and <link> tags so styles are preserved in preview
    const styleTags = Array.from(document.querySelectorAll('style, link[rel="stylesheet"]'))
      .map((node) => node.outerHTML)
      .join('\n')

    const html = `<!DOCTYPE html><html><head><meta charset="utf-8">${styleTags}<style>@media print{body{margin:0}}</style></head><body>${receiptEl.outerHTML}</body></html>`

    const iframe = document.createElement('iframe')
    iframe.style.position = 'fixed'
    iframe.style.right = '0'
    iframe.style.bottom = '0'
    iframe.style.width = '0'
    iframe.style.height = '0'
    iframe.style.border = '0'
    document.body.appendChild(iframe)

    const iframeDoc = iframe.contentDocument || iframe.contentWindow?.document
    if (!iframeDoc) {
      console.error('Unable to access iframe document for printing')
      return
    }
    iframeDoc.open()
    iframeDoc.write(html)
    iframeDoc.close()

    iframe.onload = (): void => {
      iframe.contentWindow?.focus()
      iframe.contentWindow?.print()
      setTimeout(() => {
        document.body.removeChild(iframe)
      }, 1000)
    }
  }

  // Handle WhatsApp share
  const handleWhatsAppShare = (): void => {
    setShowWhatsAppModal(true)
  }

  // Send WhatsApp message – generate PDF and open WhatsApp Web

  // Helper to strip unsupported oklch() colors -> fallback #000
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
      const receiptEl = document.querySelector('[id^="receipt-"]') as HTMLElement | null
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

      // Open WhatsApp Web (user can then attach the just-saved file)
      window.open('https://web.whatsapp.com/', '_blank')

      setShowWhatsAppModal(false)
    } catch (err) {
      console.error('Failed to create/send PDF:', err)
      alert('Failed to share via WhatsApp')
    }
  }

  return (
    <div className="mt-4">
      <div className="flex flex-wrap gap-2 mb-4">
        <button
          className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-md hover:bg-blue-200 transition-colors"
          onClick={() => onSelectReceiptType('cash')}
        >
          Cash Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          onClick={() => onSelectReceiptType('prescription')}
        >
          Prescription Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-purple-100 text-purple-700 rounded-md hover:bg-purple-200 transition-colors"
          onClick={() => onSelectReceiptType('readings')}
        >
          Readings Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors"
          onClick={() => setShowOperationsModal(true)}
        >
          Operation Receipt
        </button>
        <button
          className="px-3 py-1 text-sm bg-teal-100 text-teal-700 rounded-md hover:bg-teal-200 transition-colors"
          onClick={() => onSelectReceiptType('clinical')}
        >
          Clinical Findings
        </button>
      </div>

      {reportType && (
        <div className="flex gap-2 mt-2">
          <button
            onClick={handlePrint}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm0 0V9a2 2 0 012-2h6a2 2 0 012 2v9m-6 0a2 2 0 002 2h0a2 2 0 002-2"
              />
            </svg>
            Print
          </button>
          <button
            onClick={handleWhatsAppShare}
            className="flex items-center gap-1 px-3 py-1 text-sm bg-green-100 text-green-700 rounded-md hover:bg-green-200 transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4"
              fill="currentColor"
              viewBox="0 0 24 24"
            >
              <path d="M12.031 6.172c-3.181 0-5.767 2.586-5.768 5.766-.001 1.298.38 2.27 1.019 3.287l-.582 2.128 2.182-.573c.978.58 1.911.928 3.145.929 3.178 0 5.767-2.587 5.768-5.766.001-3.187-2.575-5.77-5.764-5.771zm3.392 8.244c-.144.405-.837.774-1.17.824-.299.045-.677.063-1.092-.069-.252-.08-.575-.187-.988-.365-1.739-.751-2.874-2.502-2.961-2.617-.087-.116-.708-.94-.708-1.793s.448-1.273.607-1.446c.159-.173.346-.217.462-.217l.332.006c.106.005.249-.04.39.298.144.347.491 1.2.534 1.287.043.087.072.188.014.304-.058.116-.087.188-.173.289l-.26.304c-.087.086-.177.18-.076.354.101.174.449.741.964 1.201.662.591 1.221.774 1.394.86s.274.072.376-.043c.101-.116.433-.506.549-.68.116-.173.231-.145.39-.087s1.011.477 1.184.564.289.13.332.202c.045.72.045.419-.1.824zm-3.423-14.416c-6.627 0-12 5.373-12 12s5.373 12 12 12 12-5.373 12-12-5.373-12-12-12zm.029 18.88c-1.161 0-2.305-.292-3.318-.844l-3.677.964.984-3.595c-.607-1.052-.927-2.246-.926-3.468.001-3.825 3.113-6.937 6.937-6.937 1.856.001 3.598.723 4.907 2.034 1.31 1.311 2.031 3.054 2.03 4.908-.001 3.825-3.113 6.938-6.937 6.938z" />
            </svg>
            WhatsApp
          </button>
        </div>
      )}

      {/* WhatsApp Modal */}
      {showWhatsAppModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-96">
            <h3 className="text-lg font-medium mb-4">Send via WhatsApp</h3>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
              <input
                type="text"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                placeholder="e.g., +919876543210"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Message</label>
              <textarea
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                rows={3}
              />
            </div>

            <div className="flex justify-end gap-2">
              <button
                onClick={() => setShowWhatsAppModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
              <button
                onClick={sendWhatsAppMessage}
                className="px-4 py-2 text-sm text-white bg-green-600 rounded-md hover:bg-green-700"
              >
                Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Operations Modal */}
      {showOperationsModal && (
        <div className="fixed inset-0 bg-black bg-opacity-10 backdrop-blur-[1px] flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg w-4/5 max-w-4xl max-h-[80vh] overflow-hidden flex flex-col">
            <h3 className="text-lg font-medium mb-4">Select Operation for Receipt</h3>

            {loading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-700"></div>
              </div>
            ) : error ? (
              <div className="text-red-500 py-4">{error}</div>
            ) : operations.length === 0 ? (
              <div className="text-gray-500 py-4">No operations found</div>
            ) : (
              <div className="overflow-auto flex-grow">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
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
                        Patient
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Operation Type
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Surgeon
                      </th>
                      <th
                        scope="col"
                        className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider"
                      >
                        Action
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {operations.map((operation) => (
                      <tr key={operation.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.dateOfOperation || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-medium text-gray-900">
                            {operation.patientName}
                          </div>
                          <div className="text-sm text-gray-500">ID: {operation.patientId}</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.operationDetails || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {operation.operatedBy || 'N/A'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <button
                            onClick={() => handleOperationSelect(operation)}
                            className="text-green-600 hover:text-green-900 bg-green-50 px-3 py-1 rounded-md focus:outline-none"
                          >
                            Select
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            <div className="flex justify-end gap-2 mt-4 pt-3 border-t border-gray-200">
              <button
                onClick={() => setShowOperationsModal(false)}
                className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
      {/* Print Preview Modal placeholder not needed due to new window approach */}
    </div>
  )
}

export default ReceiptOptions
