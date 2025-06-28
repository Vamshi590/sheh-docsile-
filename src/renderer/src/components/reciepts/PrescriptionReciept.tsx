'use client'

import React from 'react'
import nabhimage from '../../assets/nabh_accredited.jpg'
import eyeimage from '../../assets/eye_image.jpg'
interface PrescriptionItem {
  medicine: string
  times: string
  days: string
}

interface PatientData {
  patientId: string
  date: string
  patientName: string
  gender: string
  guardianName?: string
  age: string
  address: string
  mobile: string
  doctorName: string
  department: string
}

interface VitalsData {
  temperature?: string
  pulseRate?: string
  spo2?: string
}

interface MedicalHistoryData {
  presentComplaint?: string
  previousHistory?: string
  others?: string
}

interface HospitalReceiptProps {
  patientData: PatientData
  vitalsData?: VitalsData
  medicalHistoryData?: MedicalHistoryData
  prescriptionData?: PrescriptionItem[]
  advise?: string | string[]
  specialInstructions?: string
  reviewDate?: string
}

export default function HospitalReceipt({
  patientData,
  vitalsData = {},
  medicalHistoryData = {},
  prescriptionData = [],
  advise = '',
  reviewDate = ''
}: HospitalReceiptProps): React.ReactElement {
  return (
    <div className="receipt-container bg-white mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-4 border-b-2 border-black">
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" />
            </div>
            <div className="text-center flex-1 mx-2">
              <h1 className="text-lg font-bold leading-tight">SRI HARSHA EYE HOSPITAL</h1>
              <p className="text-[10px] leading-tight mt-0.5">
                Near Mancherial Chowrasta, Ambedkarnagar, Choppadandi Road, KARIMNAGAR-505001
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" />
            </div>
          </div>

          {/* Doctor Information Row */}
          <div className="flex justify-between items-start text-[9px] leading-[1.2] mb-2">
            {/* Left Doctor */}
            <div className="w-[30%] pr-1">
              <p className="font-bold">డా. శ్రీలత</p>
              <p>M.B.B.S., M.S.(Ophth)</p>
              <p>FICLEP (LVPEI), FICO (UK),</p>
              <p>Obs. Paediatric Ophthalmology</p>
              <p>& Squint (AEH, Madurai)</p>
              <p>Ex. Asst. Professor in CAIMS, MIMS (Hyd)</p>
              <p>Ex. Civil Assistant Surgeon, Karimnagar</p>
              <p>Phaco Surgeon</p>
              <p className="mt-0.5">Regd. No. 46756</p>
            </div>

            {/* Center NABH */}
            <div className="w-[20%] flex justify-center">
              <div className="w-28 h-28 flex items-center justify-center bg-white">
                <img src={nabhimage} alt="nabh image" />
              </div>
            </div>

            {/* Right Doctor */}
            <div className="w-[30%] pl-1 text-right">
              <p className="font-bold">Dr. CH. SRILATHA</p>
              <p>M.B.B.S., M.S.(Ophth)</p>
              <p>FICLEP (LVPEI), FICO (UK),</p>
              <p>Obs. Paediatric Ophthalmology</p>
              <p>& Squint (AEH, Madurai)</p>
              <p>Ex. Asst. Professor in CAIMS, MIMS (Hyd)</p>
              <p>Ex. Civil Assistant Surgeon, Karimnagar</p>
              <p>Phaco Surgeon</p>
              <p className="mt-0.5">Regd. No. 46756</p>
            </div>
          </div>

          {/* Timing Only */}
          <div className="text-center text-[9px] mt-1">
            <p className="font-semibold">Daily Timings: 9:00 am to 2:30 pm & 5:30 pm to 7:30 pm</p>
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="pb-3 mb-4 border-b border-black">
          <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
          <div className="text-[11px]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold w-24 py-1">PATIENT ID</td>
                  <td className="w-32 py-1">{patientData.patientId}</td>
                  <td className="w-32"></td>
                  <td className="font-bold w-16 py-1">DATE</td>
                  <td className="py-1">{patientData.date}</td>
                </tr>
                <tr>
                  <td className="font-bold w-24 py-1">PATIENT NAME</td>
                  <td className="w-32 py-1">{patientData.patientName}</td>
                  <td className="w-32"></td>
                  <td className="font-bold w-16 py-1">GENDER</td>
                  <td className="py-1">{patientData.gender}</td>
                </tr>
                <tr>
                  <td className="font-bold w-24 py-1">GUARDIAN NAME</td>
                  <td className="w-32 py-1">{patientData.guardianName || ''}</td>
                  <td className="w-32"></td>
                  <td className="font-bold w-16 py-1">AGE</td>
                  <td className="py-1">{patientData.age}</td>
                </tr>
                <tr>
                  <td className="font-bold w-24 py-1">ADDRESS</td>
                  <td className="w-32 py-1">{patientData.address}</td>
                  <td className="w-32"></td>
                  <td className="font-bold w-16 py-1">MOBILE</td>
                  <td className="py-1">{patientData.mobile}</td>
                </tr>
                <tr>
                  <td className="font-bold w-24 py-1">DOCTOR NAME</td>
                  <td className="w-32 py-1">{patientData.doctorName}</td>
                  <td className="w-32"></td>
                  <td className="font-bold w-16 py-1">DEPT.</td>
                  <td className="py-1">{patientData.department}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Combined Vitals and History Section */}
        <div className="pb-3 mb-4 border-b border-black">
          <h3 className="text-xs font-bold mb-3">VITALS AND HISTORY</h3>
          <div className="text-[11px]">
            <table className="w-full">
              <tbody>
                {/* Vitals Row */}
                <tr>
                  <td className="font-bold w-16 py-1">TEMP.</td>
                  <td className="w-20 py-1">{vitalsData.temperature || ''}</td>
                  <td className="font-bold w-12 py-1">P.R.</td>
                  <td className="w-20 py-1">{vitalsData.pulseRate || ''}</td>
                  <td className="font-bold w-16 py-1">SPO2</td>
                  <td className="w-20 py-1">{vitalsData.spo2 || ''}</td>
                </tr>
                {/* Medical History Rows */}
                <tr>
                  <td className="font-bold w-36 py-1">PRESENT COMPLAINT</td>
                  <td className="py-1" colSpan={5}>
                    {medicalHistoryData.presentComplaint || ''}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold w-36 py-1">PREVIOUS HISTORY</td>
                  <td className="py-1" colSpan={5}>
                    {medicalHistoryData.previousHistory || ''}
                  </td>
                </tr>
                <tr>
                  <td className="font-bold w-36 py-1">OTHERS</td>
                  <td className="py-1" colSpan={5}>
                    {medicalHistoryData.others || ''}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        {/* Prescription Section */}
        {prescriptionData.length > 0 && (
          <div className="pb-3 mb-4">
            <h3 className="text-xs font-bold mb-3">PRESCRIPTION</h3>
            <table className="w-full border-collapse text-[11px]">
              <thead>
                <tr>
                  <th className="border border-black p-2 text-left font-bold bg-gray-50">
                    MEDICINE
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-20 bg-gray-50">
                    TIMES
                  </th>
                  <th className="border border-black p-2 text-center font-bold w-20 bg-gray-50">
                    DAYS
                  </th>
                </tr>
              </thead>
              <tbody>
                {prescriptionData.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-black p-2">{item.medicine}</td>
                    <td className="border border-black p-2 text-center">{item.times}</td>
                    <td className="border border-black p-2 text-center">{item.days}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* Advice Section */}
        {(typeof advise === 'string' && advise) || (Array.isArray(advise) && advise.length > 0) ? (
          <div className="pb-3 mb-4">
            <div className="text-[11px]">
              <table className="w-full">
                <tbody>
                  {typeof advise === 'string' ? (
                    <tr>
                      <td className="font-bold w-20 py-1">ADVISE :</td>
                      <td className="py-1">{advise}</td>
                    </tr>
                  ) : (
                    Array.isArray(advise) &&
                    advise.map((item, index) => (
                      <tr key={index}>
                        <td className="font-bold w-20 py-1">{index === 0 ? 'ADVISE : ' : ''}</td>
                        <td className="py-1">{item}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : null}

        {/* Review Date Section */}
        <div className="pb-3 mb-16">
          <div className="text-[11px]">
            <table className="w-full">
              <tbody>
                <tr>
                  <td className="font-bold w-28 py-1">REVIEW DATE :</td>
                  <td className="py-1">{reviewDate}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Clean Fixed Footer */}
      <div className="receipt-footer">
        <div className="pt-3">
          {/* Hospital Authorization */}
          <div className="flex justify-between items-center ">
            <div className="text-left text-[11px]"></div>

            <div className="text-right text-[11px] space-y-1">
              <p className="font-bold">AUTHORISED SIGNATORY</p>
              <p className="font-bold">For SRI HARSHA EYE HOSPITAL</p>
              <p className="text-[10px]">Ph: 08728-234567, Cell: 9849639237</p>
              <p className="text-[10px]">🌐 www.sriharshaeye.com</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="border-t border-gray-300 pt-2 text-center text-[9px] text-gray-500">
            <div className="flex justify-between items-center">
              <span>
                This is a computer generated receipt. Please preserve this for your records.
              </span>
              <span>Generated on: {new Date().toLocaleString()}</span>
            </div>
            <p className="mt-1 text-[8px]">
              © 2025 Sri Harsha Eye Hospital. All rights reserved. | NABH Accredited | ISO
              9001:2015 Certified
            </p>
          </div>
        </div>
      </div>

      <style>{`
        .receipt-container {
          width: 210mm;
          min-height: 297mm;
          padding: 12mm;
          font-family: 'Arial', sans-serif;
          line-height: 1.2;
          display: flex;
          flex-direction: column;
        }

        .receipt-content {
          flex: 1;
        }

        .receipt-footer {
          margin-top: auto;
          padding-top: 20px;
        }

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
      `}</style>
    </div>
  )
}
