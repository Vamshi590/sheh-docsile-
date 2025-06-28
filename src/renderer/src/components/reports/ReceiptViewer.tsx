import React from 'react'
import CashReceipt from '../reciepts/Reciept'
import PrescriptionReceipt from '../reciepts/PrescriptionReciept'
import ReadingsReceipt from '../reciepts/ReadingsReciept'
import OperationReceipt from '../reciepts/OperationReciept'
import ClinicalFindingsReceipt from '../reciepts/ClinicalFindingsReciept'

// Define the Prescription type
type Prescription = {
  id: string
  patientId?: string
  patientName?: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  date?: string
  receiptId?: string
  amount?: string | number
  paymentMethod?: string
  diagnosis?: string
  prescription?: string
  medicine?: string
  rightEye?: string
  leftEye?: string
  eyeNotes?: string
  advice?: string
  [key: string]: unknown
}

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

interface ReceiptViewerProps {
  report: Prescription
  receiptType: string
  selectedOperation?: Operation
}

const ReceiptViewer: React.FC<ReceiptViewerProps> = ({
  report,
  receiptType,
  selectedOperation
}) => {
  // Format the patient data for the receipts
  const patientData = {
    billNumber: String(report.receiptId || report.id || '').substring(0, 8),
    patientId: String(report.patientId || report['PATIENT ID'] || ''),
    date: String(report.date || report.DATE || new Date().toISOString().split('T')[0]),
    patientName: String(report.patientName || report['PATIENT NAME'] || ''),
    gender: String(report.gender || report.GENDER || ''),
    guardianName: String(report.guardianName || report['GUARDIAN NAME'] || ''),
    age: String(report.age || report.AGE || ''),
    address: String(report.address || report.ADDRESS || ''),
    mobile: String(report.phone || report['PHONE NUMBER'] || ''),
    doctorName: String(report.doctorName || report['DOCTOR NAME'] || 'Dr. CH. SRILATHA'),
    department: String(report.department || report.DEPARTMENT || 'OPHTHALMOLOGY')
  }

  const paymentData = {
    paidFor: String(report.paidFor || report['PAID FOR'] || ''),
    mode: String(report.PAYMENT_METHOD || report['MODE'] || ''),
    totalAmount: Number(report.AMOUNT || report['TOTAL AMOUNT'] || 0),
    advancePaid: Number(report.advancePaid || report['ADVANCE PAID'] || 0),
    discountPercent: Number(report.discountPercent || report['DISCOUNT PERCENT'] || 0),
    discountAmount: Number(report.discountAmount || report['DISCOUNT AMOUNT'] || 0),
    amountReceived: Number(
      report.amountReceived || report['AMOUNT RECEIVED'] || report.AMOUNT || report.amount || 0
    ),
    amountDue: Number(report.amountDue || report['AMOUNT DUE'] || 0)
  }

  // Format prescription data
  type MedicineData = { medicine: string; times: string; days: string }
  const prescriptionData: MedicineData[] = []

  // Check for prescriptions from 1 to 10 and add them if they exist
  for (let i = 1; i <= 10; i++) {
    const prescriptionKey = `PRESCRIPTION ${i}`
    const timesKey = `TIMING ${i}`
    const daysKey = `DAYS ${i}`

    // If any of the prescription data exists for this index, add it
    if (report[prescriptionKey] || report[timesKey] || report[daysKey]) {
      prescriptionData.push({
        medicine: String(report[prescriptionKey] || ''),
        times: String(report[timesKey] || '1-0-1'),
        days: String(report[daysKey] || '7')
      })
    }
  }

  // If no prescriptions were found in the numbered format, check for legacy format
  if (prescriptionData.length === 0 && (report.medicine || report.PRESCRIPTION)) {
    prescriptionData.push({
      medicine: String(report.medicine || report.PRESCRIPTION || ''),
      times: String(report.times || '1-0-1'),
      days: String(report.days || '7')
    })
  }

  // Format vitals data
  const vitalsData = {
    temperature: String(report.temperature || report['TEMPARATURE'] || ''),
    pulseRate: String(report.pulseRate || report['P.R.'] || ''),
    spo2: String(report.spo2 || report['SPO2'] || '')
  }

  // Format medical history data
  const medicalHistoryData = {
    presentComplaint: String(report.presentComplaint || report['PRESENT COMPLAIN'] || ''),
    previousHistory: String(report.previousHistory || report['PREVIOUS HISTORY'] || ''),
    others: String(report.others || report.OTHERS || '')
  }

  // Format eye readings data
  const eyeReadingsData = {
    rightEye: {
      sph: String(report.rightEyeSph || report.RIGHT_EYE_SPH || ''),
      cyl: String(report.rightEyeCyl || report.RIGHT_EYE_CYL || ''),
      axis: String(report.rightEyeAxis || report.RIGHT_EYE_AXIS || ''),
      va: String(report.rightEyeVa || report.RIGHT_EYE_VA || ''),
      vacPh: String(report.rightEyeVacPh || report.RIGHT_EYE_VAC_PH || '')
    },
    leftEye: {
      sph: String(report.leftEyeSph || report.LEFT_EYE_SPH || ''),
      cyl: String(report.leftEyeCyl || report.LEFT_EYE_CYL || ''),
      axis: String(report.leftEyeAxis || report.LEFT_EYE_AXIS || ''),
      va: String(report.leftEyeVa || report.LEFT_EYE_VA || ''),
      vacPh: String(report.leftEyeVacPh || report.LEFT_EYE_VAC_PH || '')
    },
    notes: String(report.eyeReadingsNotes || report.EYE_READINGS_NOTES || '')
  }

  // Collect all advice entries
  const adviceData: string[] = []

  // Check for advices from 1 to 10 and add them if they exist
  for (let i = 1; i <= 10; i++) {
    const adviceKey = `ADVICE ${i}`
    if (report[adviceKey]) {
      adviceData.push(String(report[adviceKey] || ''))
    }
  }

  // If no numbered advices were found, check for legacy format
  if (adviceData.length === 0 && (report.advice || report.ADVICE)) {
    adviceData.push(String(report.advice || report.ADVICE || ''))
  }

  // Format operation data - prioritize selectedOperation if available
  const operationData = {
    operationType: String(
      selectedOperation?.operationDetails || report.operationType || report['OPERATION_TYPE'] || ''
    ),
    operationDate: String(
      selectedOperation?.dateOfOperation || report.operationDate || report['OPERATION_DATE'] || ''
    ),
    anesthesia: String(report.anesthesia || report.ANESTHESIA || ''),
    surgeon: String(selectedOperation?.operatedBy || report.surgeon || report.SURGEON || ''),
    assistant: String(report.assistant || report.ASSISTANT || ''),
    findings: String(
      selectedOperation?.provisionDiagnosis || report.findings || report.FINDINGS || ''
    ),
    procedure: String(
      selectedOperation?.operationProcedure || report.procedure || report.PROCEDURE || ''
    ),
    complications: String(report.complications || report.COMPLICATIONS || ''),
    dateOfAdmit: String(
      selectedOperation?.dateOfAdmit || report.dateOfAdmit || report['DATE_OF_ADMIT'] || ''
    ),
    dateOfDischarge: String(
      selectedOperation?.dateOfDischarge ||
        report.dateOfDischarge ||
        report['DATE_OF_DISCHARGE'] ||
        ''
    ),
    dateOfOperation: String(
      selectedOperation?.dateOfOperation ||
        report.dateOfOperation ||
        report['DATE_OF_OPERATION'] ||
        ''
    )
  }

  // Format billing items for operation receipt
  const billingItems: { particulars: string; amount: number; days?: number }[] = []

  // Log the report object to see what fields are available
  console.log('Report data for billing items:', selectedOperation || report)

  // If we have a selected operation, use its part/amount fields
  if (selectedOperation) {
    for (let i = 1; i <= 10; i++) {
      const partKey = `part${i}`
      const amountKey = `amount${i}`
      const daysKey = `days${i}`

      if (selectedOperation[partKey] && selectedOperation[amountKey]) {
        // Check if days field exists and has a value
        const days = selectedOperation[daysKey] ? Number(selectedOperation[daysKey]) : undefined

        billingItems.push({
          particulars: String(selectedOperation[partKey] || ''),
          amount: Number(selectedOperation[amountKey] || 0),
          days: days && days > 0 ? days : undefined
        })
      }
    }
  } else {
    // Fall back to report data if no selected operation
    for (let i = 1; i <= 10; i++) {
      const particularKey = `BILLING_ITEM_${i}`
      const amountKey = `BILLING_AMOUNT_${i}`
      const daysKey = `BILLING_DAYS_${i}`

      if (report[particularKey] && report[amountKey]) {
        // Check for days field in various formats
        const days = report[daysKey] || report[`DAYS_${i}`] || report[`days${i}`]

        billingItems.push({
          particulars: String(report[particularKey] || ''),
          amount: Number(report[amountKey] || 0),
          days: days ? Number(days) : undefined
        })
      }
    }
  }

  // Log the calculated billing items
  console.log('Calculated billing items:', billingItems)

  // Format billing data for operation receipt
  // Log the report object to see what fields are available
  console.log('Report data for billing:', report)

  const operationBillingData = {
    totalAmount: Number(
      selectedOperation?.totalAmount ||
        selectedOperation?.['totalAmount'] ||
        report.totalAmount ||
        report['totalAmount'] ||
        report['TOTAL AMOUNT'] ||
        0
    ),
    advancePaid: Number(
      selectedOperation?.advancePaid ||
        selectedOperation?.['ADVANCE PAID'] ||
        report.advancePaid ||
        report['ADVANCE PAID'] ||
        0
    ),
    discountPercent: Number(
      selectedOperation?.discountPercent ||
        selectedOperation?.['DISCOUNT_PERCENT'] ||
        report.discountPercent ||
        report['DISCOUNT_PERCENT'] ||
        0
    ),
    discountAmount: Number(
      selectedOperation?.discountAmount ||
        selectedOperation?.['DISCOUNT_AMOUNT'] ||
        report.discountAmount ||
        report['DISCOUNT_AMOUNT'] ||
        0
    ),
    amountReceived: Number(
      selectedOperation?.amountReceived ||
        selectedOperation?.['AMOUNT_RECEIVED'] ||
        report.amountReceived ||
        report['AMOUNT_RECEIVED'] ||
        0
    ),
    balance: Number(
      selectedOperation?.balance ||
        selectedOperation?.['BALANCE'] ||
        report.balance ||
        report['BALANCE'] ||
        0
    )
  }

  // Log the calculated billing data
  console.log('Calculated billing data:', operationBillingData)

  // Format clinical findings data
  const clinicalFindingsData = {
    examination: String(
      report.examination || report.EXAMINATION || report['CLINICAL_FINDINGS'] || ''
    ),
    diagnosis: String(report.diagnosis || report.DIAGNOSIS || ''),
    plan: String(report.plan || report.PLAN || '')
  }

  const arReadingData = {
    rightEye: {
      sph: String(report['AR-RE-SPH'] || ''),
      cyl: String(report['AR-RE-CYL'] || ''),
      axis: String(report['AR-RE-AXIS'] || ''),
      va: String(report['AR-RE-VA'] || ''),
      vacPh: String(report['AR-RE-VAC.P.H'] || '')
    },
    leftEye: {
      sph: String(report['AR-LE-SPH'] || ''),
      cyl: String(report['AR-LE-CYL'] || ''),
      axis: String(report['AR-LE-AXIS'] || ''),
      va: String(report['AR-LE-VA'] || ''),
      vacPh: String(report['AR-LE-VAC.P.H'] || '')
    }
  }

  const previousGlassPrescription = {
    dist: {
      rightEye: {
        sph: String(report['PGP-RE-D-SPH'] || ''),
        cyl: String(report['PGP-RE-D-CYL'] || ''),
        axis: String(report['PGP-RE-D-AXIS'] || ''),
        va: String(report['PGP-RE-D-VA'] || ''),
        vacPh: String(report['PGP-RE-D-VAC.P.H'] || '')
      },
      leftEye: {
        sph: String(report['PGP-LE-D-SPH'] || ''),
        cyl: String(report['PGP-LE-D-CYL'] || ''),
        axis: String(report['PGP-LE-D-AXIS'] || ''),
        va: String(report['PGP-LE-D-BCVA'] || ''),
        vacPh: String(report['PGP-LE-D-VAC.P.H'] || '')
      }
    },
    near: {
      rightEye: {
        sph: String(report['PGP-RE-N-SPH'] || ''),
        cyl: String(report['PGP-RE-N-CYL'] || ''),
        axis: String(report['PGP-RE-N-AXIS'] || ''),
        va: String(report['PGP-RE-N-VA'] || '')
      },
      leftEye: {
        sph: String(report['PGP-LE-N-SPH'] || ''),
        cyl: String(report['PGP-LE-N-CYL'] || ''),
        axis: String(report['PGP-LE-N-AXIS'] || ''),
        va: String(report['PGP-LE-N-BCVA'] || '')
      }
    }
  }

  const subjectiveRefraction = {
    dist: {
      rightEye: {
        sph: String(report['SR-RE-D-SPH'] || ''),
        cyl: String(report['SR-RE-D-CYL'] || ''),
        axis: String(report['SR-RE-D-AXIS'] || ''),
        va: String(report['SR-RE-D-VA'] || ''),
        vacPh: String(report['SR-RE-D-VAC.P.H'] || '')
      },
      leftEye: {
        sph: String(report['SR-LE-D-SPH'] || ''),
        cyl: String(report['SR-LE-D-CYL'] || ''),
        axis: String(report['SR-LE-D-AXIS'] || ''),
        va: String(report['SR-LE-D-BCVA'] || ''),
        vacPh: String(report['SR-LE-D-VAC.P.H'] || '')
      }
    },
    near: {
      rightEye: {
        sph: String(report['SR-RE-N-SPH'] || ''),
        cyl: String(report['SR-RE-N-CYL'] || ''),
        axis: String(report['SR-RE-N-AXIS'] || ''),
        va: String(report['SR-RE-N-VA'] || '')
      },
      leftEye: {
        sph: String(report['SR-LE-N-SPH'] || ''),
        cyl: String(report['SR-LE-N-CYL'] || ''),
        axis: String(report['SR-LE-N-AXIS'] || ''),
        va: String(report['SR-LE-N-BCVA'] || '')
      }
    }
  }

  // Render the appropriate receipt based on the type
  const renderReceipt = (): React.ReactElement => {
    switch (receiptType) {
      case 'cash':
        return (
          <div id={`receipt-${report.id}`}>
            <CashReceipt
              patientData={patientData}
              paymentData={paymentData}
              authorizedSignatory={String(report.authorizedSignatory || report.doctorName || '')}
            />
          </div>
        )
      case 'prescription':
        return (
          <div id={`receipt-${report.id}`}>
            <PrescriptionReceipt
              patientData={patientData}
              vitalsData={vitalsData}
              medicalHistoryData={medicalHistoryData}
              prescriptionData={prescriptionData}
              advise={adviceData.length > 0 ? adviceData : ''}
              specialInstructions={String(
                report.specialInstructions || report['SPECIAL_INSTRUCTIONS'] || ''
              )}
              reviewDate={String(report.reviewDate || report['FOLLOW UP DATE'] || '')}
            />
          </div>
        )
      case 'readings':
        return (
          <div id={`receipt-${report.id}`}>
            <ReadingsReceipt
              patientData={patientData}
              vitalsData={vitalsData}
              medicalHistoryData={medicalHistoryData}
              arReadingData={arReadingData}
              previousGlassPrescription={previousGlassPrescription}
              subjectiveRefraction={subjectiveRefraction}
              lensType={String(report.lensType || report.LENS_TYPE || '')}
              advise={eyeReadingsData.notes}
            />
          </div>
        )
      case 'operation':
        return (
          <div id={`receipt-${report.id}`}>
            <OperationReceipt
              patientData={{
                ...patientData,
                dateOfAdmit: operationData.dateOfAdmit,
                dateOfDischarge: operationData.dateOfDischarge,
                dateOfOperation: operationData.dateOfOperation
              }}
              operationDetails={`${operationData.operationType} - ${operationData.operationDate}`}
              operationProcedure={operationData.procedure}
              diagnosis={operationData.findings}
              billingItems={billingItems}
              billingData={operationBillingData}
              authorizedSignatory={operationData.surgeon}
            />
          </div>
        )
      case 'clinical':
        return (
          <div id={`receipt-${report.id}`}>
            <ClinicalFindingsReceipt
              patientData={patientData}
              clinicalData={{
                leftEye: {
                  lids: '',
                  conjunctiva: '',
                  cornea: '',
                  ac: '',
                  iris: '',
                  pupil: '',
                  lens: '',
                  iop: '',
                  vitreous: '',
                  fundus: '',
                  opticDisk: '',
                  macula: '',
                  vessels: '',
                  periphery: '',
                  phlephipharalRetina: '',
                  retinoscopy: ''
                },
                rightEye: {
                  lids: '',
                  conjunctiva: '',
                  cornea: '',
                  ac: '',
                  iris: '',
                  pupil: '',
                  lens: '',
                  iop: '',
                  vitreous: '',
                  fundus: '',
                  opticDisk: '',
                  macula: '',
                  vessels: '',
                  periphery: '',
                  phlephipharalRetina: '',
                  retinoscopy: ''
                },
                advised: clinicalFindingsData.plan || '',
                glasses: '',
                dilateEye: '',
                prescription: [],
                reviewDate: ''
              }}
            />
          </div>
        )
      default:
        return (
          <div className="p-4 bg-gray-100 rounded-md">
            <p>Please select a receipt type to view</p>
          </div>
        )
    }
  }

  return <div className="receipt-viewer">{renderReceipt()}</div>
}

export default ReceiptViewer
