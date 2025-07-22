import React, { useState, useRef, useEffect } from 'react'
import html2canvas from 'html2canvas'
import ReceiptViewer from '../reports/ReceiptViewer'
import { saveAs } from 'file-saver'
import { PDFDocument } from 'pdf-lib'

// Define the Lab type to match with other components
type Lab = {
  id: string
  [key: string]: unknown
}

interface LabTableWithReceiptsProps {
  labs: Lab[]
  onEditLab?: (lab: Lab) => void
  onDeleteLab?: (id: string) => void
}

const LabTableWithReceipts: React.FC<LabTableWithReceiptsProps> = ({
  labs,
  onEditLab,
  onDeleteLab
}) => {
  const [selectedLab, setSelectedLab] = useState<Lab | null>(null)
  const [selectedReceiptType, setSelectedReceiptType] = useState<string | null>(null)
  const [isReportMode, setIsReportMode] = useState<boolean>(false)
  const [reportReceiptTypes, setReportReceiptTypes] = useState<string[]>([])

  // Reset selection if current selection is no longer in filtered list
  useEffect(() => {
    if (selectedLab && !labs.some((p) => p.id === selectedLab.id)) {
      setSelectedLab(null)
      setSelectedReceiptType(null)
      setIsReportMode(false)
      setReportReceiptTypes([])
    }
  }, [labs, selectedLab])

  // Handle row click to select a lab
  const handleRowClick = (lab: Lab): void => {
    if (selectedLab?.id === lab.id) {
      // If clicking the same lab, deselect it
      handleCloseReceipt()
    } else {
      setSelectedLab(lab)
      setSelectedReceiptType(null) // Reset receipt type when selecting a new lab
      setIsReportMode(false)
      setReportReceiptTypes([])
    }
  }

  // Handle closing the receipt viewer
  const handleCloseReceipt = (): void => {
    setSelectedLab(null)
    setSelectedReceiptType(null)
    setIsReportMode(false)
    setReportReceiptTypes([])
  }

  // Handle receipt type selection
  const handleSelectReceiptType = (type: string): void => {
    // Exit report mode if we're selecting a specific receipt type
    if (isReportMode) {
      setIsReportMode(false)
    }

    setSelectedReceiptType(type)
  }

  // Handle generating a report with all receipt types
  const handleGenerateReport = (): void => {
    if (!selectedLab) {
      alert('Please select a lab record first')
      return
    }

    // Define the receipt types to check
    const receiptTypesToCheck = ['cash', 'lab']

    // Set report mode and store all receipt types
    setIsReportMode(true)
    setReportReceiptTypes(receiptTypesToCheck)
  }

  // Create a ref for the receipt content
  const receiptRef = useRef<HTMLDivElement>(null)

  // Handle print button click with proper preview
  const handlePrint = async (): Promise<void> => {
    if (!selectedLab) {
      alert('Please select a lab record first')
      return
    }

    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      if (isReportMode) {
        // Generate a combined report with all receipt types
        for (const receiptType of reportReceiptTypes) {
          // Set the current receipt type
          setSelectedReceiptType(receiptType)

          // Wait for the receipt to render
          await new Promise((resolve) => setTimeout(resolve, 500))

          if (receiptRef.current) {
            // Remove any OKLCH colors which can cause issues with html2canvas
            stripOKLCH(receiptRef.current)

            const canvas = await html2canvas(receiptRef.current, {
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true
            })

            // Convert canvas to PNG data URL
            const imgData = canvas.toDataURL('image/png')

            // Convert data URL to Uint8Array
            const base64Data = imgData.replace(/^data:image\/png;base64,/, '')
            const binaryData = atob(base64Data)
            const data = new Uint8Array(binaryData.length)
            for (let i = 0; i < binaryData.length; i++) {
              data[i] = binaryData.charCodeAt(i)
            }

            // Add a new page to the PDF
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

            // Embed the image in the PDF
            const image = await pdfDoc.embedPng(data)
            const { width, height } = image.scale(0.5)

            // Calculate position to center the image
            const x = (PAGE_WIDTH - width) / 2
            const y = PAGE_HEIGHT - height - 50 // 50 is top margin

            // Draw the image on the page
            page.drawImage(image, {
              x,
              y,
              width,
              height
            })
          }
        }

        // Reset to the first receipt type
        setSelectedReceiptType(reportReceiptTypes[0])

        // Save the PDF
        const pdfBytes = await pdfDoc.save()

        // Open the PDF in a new window
        await window.api.openPdfInWindow(pdfBytes)
      } else {
        // Just print the current receipt
        if (receiptRef.current) {
          // Remove any OKLCH colors which can cause issues with html2canvas
          stripOKLCH(receiptRef.current)

          const canvas = await html2canvas(receiptRef.current, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
          })

          // Convert canvas to PNG data URL
          const imgData = canvas.toDataURL('image/png')

          // Convert data URL to Uint8Array
          const base64Data = imgData.replace(/^data:image\/png;base64,/, '')
          const binaryData = atob(base64Data)
          const data = new Uint8Array(binaryData.length)
          for (let i = 0; i < binaryData.length; i++) {
            data[i] = binaryData.charCodeAt(i)
          }

          // Create a new PDF document
          const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

          // Embed the image in the PDF
          const image = await pdfDoc.embedPng(data)
          const { width, height } = image.scale(0.5)

          // Calculate position to center the image
          const x = (PAGE_WIDTH - width) / 2
          const y = PAGE_HEIGHT - height - 50 // 50 is top margin

          // Draw the image on the page
          page.drawImage(image, {
            x,
            y,
            width,
            height
          })

          // Save the PDF
          const pdfBytes = await pdfDoc.save()

          // Open the PDF in a new window
          await window.api.openPdfInWindow(pdfBytes)
        }
      }
    } catch (error) {
      console.error('Error generating PDF:', error)
      alert('Error generating PDF. Please try again.')
    }
  }

  // Helper function to strip OKLCH colors which can cause issues with html2canvas
  const stripOKLCH = (root: HTMLElement): void => {
    const allElements = root.querySelectorAll('*')
    allElements.forEach((el) => {
      const style = window.getComputedStyle(el)
      const color = style.getPropertyValue('color')
      const backgroundColor = style.getPropertyValue('background-color')

      if (color.includes('oklch')) {
        ;(el as HTMLElement).style.color = 'rgb(0, 0, 0)'
      }
      if (backgroundColor.includes('oklch')) {
        ;(el as HTMLElement).style.backgroundColor = 'rgb(255, 255, 255)'
      }
    })
  }

  // Handle WhatsApp share
  const sendWhatsAppMessage = async (): Promise<void> => {
    if (!selectedLab) {
      alert('Please select a lab record first')
      return
    }

    try {
      const pdfDoc = await PDFDocument.create()
      const PAGE_WIDTH = 595.28
      const PAGE_HEIGHT = 841.89

      if (isReportMode) {
        // Generate a combined report with all receipt types
        for (const receiptType of reportReceiptTypes) {
          // Set the current receipt type
          setSelectedReceiptType(receiptType)

          // Wait for the receipt to render
          await new Promise((resolve) => setTimeout(resolve, 500))

          if (receiptRef.current) {
            // Remove any OKLCH colors which can cause issues with html2canvas
            stripOKLCH(receiptRef.current)

            const canvas = await html2canvas(receiptRef.current, {
              scale: 2,
              logging: false,
              useCORS: true,
              allowTaint: true
            })

            // Convert canvas to PNG data URL
            const imgData = canvas.toDataURL('image/png')

            // Convert data URL to Uint8Array
            const base64Data = imgData.replace(/^data:image\/png;base64,/, '')
            const binaryData = atob(base64Data)
            const data = new Uint8Array(binaryData.length)
            for (let i = 0; i < binaryData.length; i++) {
              data[i] = binaryData.charCodeAt(i)
            }

            // Add a new page to the PDF
            const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

            // Embed the image in the PDF
            const image = await pdfDoc.embedPng(data)
            const { width, height } = image.scale(0.5)

            // Calculate position to center the image
            const x = (PAGE_WIDTH - width) / 2
            const y = PAGE_HEIGHT - height - 50 // 50 is top margin

            // Draw the image on the page
            page.drawImage(image, {
              x,
              y,
              width,
              height
            })
          }
        }
      } else {
        // Just include the current receipt
        if (receiptRef.current) {
          // Remove any OKLCH colors which can cause issues with html2canvas
          stripOKLCH(receiptRef.current)

          const canvas = await html2canvas(receiptRef.current, {
            scale: 2,
            logging: false,
            useCORS: true,
            allowTaint: true
          })

          // Convert canvas to PNG data URL
          const imgData = canvas.toDataURL('image/png')

          // Convert data URL to Uint8Array
          const base64Data = imgData.replace(/^data:image\/png;base64,/, '')
          const binaryData = atob(base64Data)
          const data = new Uint8Array(binaryData.length)
          for (let i = 0; i < binaryData.length; i++) {
            data[i] = binaryData.charCodeAt(i)
          }

          // Create a new PDF document
          const page = pdfDoc.addPage([PAGE_WIDTH, PAGE_HEIGHT])

          // Embed the image in the PDF
          const image = await pdfDoc.embedPng(data)
          const { width, height } = image.scale(0.5)

          // Calculate position to center the image
          const x = (PAGE_WIDTH - width) / 2
          const y = PAGE_HEIGHT - height - 50 // 50 is top margin

          // Draw the image on the page
          page.drawImage(image, {
            x,
            y,
            width,
            height
          })
        }
      }

      // Save the PDF
      const pdfBytes = await pdfDoc.save()

      // Create a blob from the PDF bytes
      const blob = new Blob([pdfBytes], { type: 'application/pdf' })

      // Save the file
      const fileName = `Lab_Report_${selectedLab['PATIENT ID'] || 'Unknown'}_${new Date().toISOString().split('T')[0]}.pdf`
      saveAs(blob, fileName)

      // Get the patient's phone number
      const phoneNumber = selectedLab['PHONE NUMBER'] as string

      // Format phone number for WhatsApp (remove any non-digit characters)
      const formattedPhone = phoneNumber ? phoneNumber.replace(/\D/g, '') : ''

      if (formattedPhone) {
        // Create a WhatsApp message
        const message = encodeURIComponent(
          `Lab Report for ${selectedLab['PATIENT NAME'] || 'Patient'} dated ${
            selectedLab.DATE || new Date().toISOString().split('T')[0]
          }`
        )

        // Open WhatsApp Web with the phone number and message
        window.open(`https://wa.me/${formattedPhone}?text=${message}`, '_blank')
      } else {
        alert('No phone number available for this patient.')
      }
    } catch (error) {
      console.error('Error sending WhatsApp message:', error)
      alert('Error sending WhatsApp message. Please try again.')
    }
  }

  return (
    <div className="overflow-hidden">
      {/* Receipt Viewer */}
      {selectedLab && selectedReceiptType && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-auto">
            <div className="p-4 border-b flex justify-between items-center">
              <h2 className="text-lg font-semibold">Lab Receipt</h2>
              <div className="flex space-x-2">
                <button
                  onClick={handlePrint}
                  className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
                >
                  Print
                </button>
                <button
                  onClick={sendWhatsAppMessage}
                  className="px-3 py-1 bg-green-500 text-white rounded hover:bg-green-600"
                >
                  WhatsApp
                </button>
                <button
                  onClick={handleCloseReceipt}
                  className="px-3 py-1 bg-gray-200 text-gray-800 rounded hover:bg-gray-300"
                >
                  Close
                </button>
              </div>
            </div>
            <div className="p-6" ref={receiptRef}>
              <ReceiptViewer report={selectedLab} receiptType={selectedReceiptType} />
            </div>
          </div>
        </div>
      )}

      {/* Lab Table */}
      <div className="shadow overflow-x-auto border-b border-gray-200 sm:rounded-lg">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                S.No
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
                Phone
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
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
              >
                Actions
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {labs.map((lab) => (
              <tr
                key={lab.id as string}
                className={`hover:bg-gray-50 cursor-pointer ${selectedLab?.id === lab.id ? 'bg-blue-50' : ''}`}
                onClick={() => handleRowClick(lab)}
              >
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab.Sno as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab.DATE as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab['PATIENT ID'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab['PATIENT NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab['GUARDIAN NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab.DOB as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab.AGE as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab.GENDER as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab['PHONE NUMBER'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {(lab['DOCTOR NAME'] as React.ReactNode) || '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lab['TOTAL AMOUNT'] !== undefined && lab['TOTAL AMOUNT'] !== null
                    ? `₹${lab['TOTAL AMOUNT']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lab['AMOUNT RECEIVED'] !== undefined && lab['AMOUNT RECEIVED'] !== null
                    ? `₹${lab['AMOUNT RECEIVED']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                  {lab['AMOUNT DUE'] !== undefined && lab['AMOUNT DUE'] !== null
                    ? `₹${lab['AMOUNT DUE']}`
                    : '-'}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex space-x-2">
                    {selectedLab?.id === lab.id && (
                      <>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectReceiptType('lab')
                          }}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleSelectReceiptType('cash')
                          }}
                          className="text-green-600 hover:text-green-900"
                        >
                          Cash
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleGenerateReport()
                          }}
                          className="text-purple-600 hover:text-purple-900"
                        >
                          All
                        </button>
                      </>
                    )}
                    {onEditLab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          onEditLab(lab)
                        }}
                        className="text-indigo-600 hover:text-indigo-900"
                      >
                        Edit
                      </button>
                    )}
                    {onDeleteLab && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation()
                          if (window.confirm('Are you sure you want to delete this lab record?')) {
                            onDeleteLab(lab.id as string)
                          }
                        }}
                        className="text-red-600 hover:text-red-900"
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default LabTableWithReceipts
