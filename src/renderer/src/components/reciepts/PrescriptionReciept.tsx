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
              <div className="w-24 h-24 flex items-center justify-center bg-white">
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

        <h2 className="text-sm text-center font-bold  py-1 px-2 mb-2 ">PRESCRIPTION</h2>

        {/* Patient Information Section */}
        <div className="pb-3 mb-4 border-b border-black">
          <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
          {/* grid-based layout */}
          <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {/* Patient ID */}
            <div>
              <div className="font-bold">PATIENT ID</div>
              <div>{patientData.patientId}</div>
            </div>
            {/* Date */}
            <div>
              <div className="font-bold">DATE</div>
              <div>{patientData.date}</div>
            </div>
            {/* Patient Name */}
            <div>
              <div className="font-bold">PATIENT NAME</div>
              <div>{patientData.patientName}</div>
            </div>
            {/* Gender */}
            <div>
              <div className="font-bold">GENDER</div>
              <div>{patientData.gender}</div>
            </div>
            {/* Guardian Name */}
            <div>
              <div className="font-bold">GUARDIAN NAME</div>
              <div>{patientData.guardianName || ''}</div>
            </div>
            {/* Age */}
            <div>
              <div className="font-bold">AGE</div>
              <div>{patientData.age}</div>
            </div>
            {/* Address */}
            <div>
              <div className="font-bold">ADDRESS</div>
              <div>{patientData.address}</div>
            </div>
            {/* Mobile */}
            <div>
              <div className="font-bold">MOBILE</div>
              <div>{patientData.mobile}</div>
            </div>
            {/* Doctor Name */}
            <div>
              <div className="font-bold">DOCTOR NAME</div>
              <div>{patientData.doctorName}</div>
            </div>
            {/* Department */}
            <div>
              <div className="font-bold">DEPT.</div>
              <div>{patientData.department}</div>
            </div>
          </div>
        </div>

        <div className="pb-3 mb-4 border-b border-black">
          <h3 className="text-xs font-bold mb-3">VITALS AND HISTORY</h3>
          {/* grid-based layout */}
          <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
            {/* Patient ID */}
            <div>
              <div className="font-bold">TEMP.</div>
              <div>{vitalsData.temperature || ''}</div>
            </div>
            {/* Date */}
            <div>
              <div className="font-bold">P.R.</div>
              <div>{vitalsData.pulseRate || ''}</div>
            </div>
            {/* Patient Name */}
            <div>
              <div className="font-bold">SPO2</div>
              <div>{vitalsData.spo2 || ''}</div>
            </div>
            {/* Mobile */}
            <div>
              <div className="font-bold">Present Complaint</div>
              <div>{medicalHistoryData.presentComplaint || ''}</div>
            </div>
            {/* Doctor Name */}
            <div>
              <div className="font-bold">Previous History</div>
              <div>{medicalHistoryData.previousHistory || ''}</div>
            </div>
            {/* Department */}
            <div>
              <div className="font-bold">Others</div>
              <div>{medicalHistoryData.others || '-'}</div>
            </div>
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
        <div className="flex justify-between">
          {/* Advice & Review Section */}
          {((typeof advise === 'string' && advise) ||
            (Array.isArray(advise) && advise.length > 0)) && (
            <div className="pb-3 mb-16">
              <div className="text-[11px] grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Advice block */}
                <div>
                  <div className="font-bold">ADVISE</div>
                  {typeof advise === 'string' ? (
                    <div>{advise}</div>
                  ) : (
                    <ul className="list-disc ml-4">
                      {Array.isArray(advise) &&
                        advise.map((item, idx) => <li key={idx}>{item}</li>)}
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}
          <div className="text-[11px]">
            <div>
              <div className="font-bold">REVIEW DATE</div>
              <div>{reviewDate}</div>
            </div>
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
