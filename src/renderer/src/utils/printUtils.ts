/**
 * Utility functions for printing and sharing receipts
 */

/**
 * Prints the content of a specific element
 * @param elementId The ID of the element to print
 */
export const printElement = (elementId: string): void => {
  const printContent = document.getElementById(elementId)
  if (!printContent) {
    console.error(`Element with ID ${elementId} not found`)
    return
  }

  const originalDisplay = document.body.style.display
  const originalOverflow = document.body.style.overflow

  // Save the current body content
  const bodyContent = document.body.innerHTML

  // Replace body content with the element to print
  document.body.innerHTML = printContent.innerHTML

  // Add print styles
  const style = document.createElement('style')
  style.innerHTML = `
    @media print {
      body {
        margin: 0;
        padding: 0;
        background: white;
      }
      
      .receipt-container {
        width: 210mm;
        height: 297mm;
        margin: 0;
        padding: 8mm;
        box-shadow: none;
        page-break-after: avoid;
      }
      
      @page {
        size: A4 portrait;
        margin: 0;
      }
    }
  `
  document.head.appendChild(style)

  // Print
  window.print()

  // Restore the original body content
  document.body.innerHTML = bodyContent
  document.body.style.display = originalDisplay
  document.body.style.overflow = originalOverflow
}

/**
 * Converts an element to a data URL
 * @param elementId The ID of the element to convert
 * @returns Promise that resolves to a data URL
 */
export const elementToDataURL = async (elementId: string): Promise<string> => {
  try {
    // We'll use html2canvas for this functionality
    // This is a placeholder for now - we need to add the dependency
    console.log(`Converting element ${elementId} to data URL`)
    return Promise.resolve('data:image/png;base64,placeholder')
  } catch (error) {
    console.error('Error converting element to data URL:', error)
    return Promise.reject(error)
  }
}

/**
 * Shares content via WhatsApp
 * @param phoneNumber The phone number to share with (optional)
 * @param message The message to share
 * @param dataUrl Optional data URL of image to share
 */
export const shareViaWhatsApp = (
  phoneNumber: string = '',
  message: string,
  elementId?: string
): void => {
  // Get the receipt content if an elementId is provided
  let fullMessage = message

  if (elementId) {
    const element = document.getElementById(elementId)
    if (element) {
      // Extract text content from the receipt
      const patientName = element.querySelector('.patient-name')?.textContent || ''
      const receiptDate = element.querySelector('.receipt-date')?.textContent || ''
      const amount = element.querySelector('.amount')?.textContent || ''

      // Add receipt details to the message
      fullMessage += `\n\nReceipt Details:\n`
      if (patientName) fullMessage += `Patient: ${patientName}\n`
      if (receiptDate) fullMessage += `Date: ${receiptDate}\n`
      if (amount) fullMessage += `Amount: ${amount}\n`
      
      // Add a note about the receipt
      fullMessage += `\n(This is a text summary. For the complete receipt, please check your email or visit the clinic.)`
    }
  }

  // Format phone number - remove non-digits
  const formattedPhone = phoneNumber.replace(/\D/g, '')

  // Create WhatsApp URL
  let url = `https://wa.me/${formattedPhone}`
  
  // Add the message
  if (fullMessage) {
    url += `?text=${encodeURIComponent(fullMessage)}`
  }

  // Open WhatsApp in a new tab
  window.open(url, '_blank')
}

/**
 * Determines the receipt type based on report data
 * @param report The report data
 * @returns Array of available receipt types
 */
interface ReportData {
  PRESCRIPTION?: string
  MEDICINE?: string
  DIAGNOSIS?: string
  RIGHT_EYE?: string
  LEFT_EYE?: string
  READING_NOTES?: string
  OPERATION_DETAILS?: string
  OPERATION_TYPE?: string
  OPERATION_DATE?: string
  CLINICAL_FINDINGS?: string
  EXAMINATION_DETAILS?: string
  [key: string]: unknown
}

export const getAvailableReceiptTypes = (report: ReportData): string[] => {
  const types: string[] = []

  // Cash receipt - always available
  types.push('Cash Receipt')

  // Prescription receipt
  if (report.PRESCRIPTION || report.MEDICINE || report.DIAGNOSIS) {
    types.push('Prescription')
  }

  // Readings receipt
  if (report.RIGHT_EYE || report.LEFT_EYE || report.READING_NOTES) {
    types.push('Readings')
  }

  // Operation receipt
  if (report.OPERATION_DETAILS || report.OPERATION_TYPE || report.OPERATION_DATE) {
    types.push('Operation')
  }

  // Clinical findings
  if (report.CLINICAL_FINDINGS || report.EXAMINATION_DETAILS) {
    types.push('Clinical Findings')
  }

  return types
}
