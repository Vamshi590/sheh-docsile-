'use client'

import React from 'react'

interface PatientData {
  patientName: string
  patientId: string
  guardianName?: string
  gender: string
  resident: string
  age: string
}

interface TreatmentData {
  date: string
  underwentOn: string
  dischargedOn: string
  chargedAmount: number
  department: string
}

interface NonClaimEhsCertificateProps {
  patientData: PatientData
  treatmentData: TreatmentData
  authorizedSignatory?: string
}

export default function NonClaimEhsCertificate({
  patientData,
  treatmentData,
  authorizedSignatory = ''
}: NonClaimEhsCertificateProps): React.ReactElement {
  return (
    <div className="receipt-container bg-white mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-4 border-b-2 border-black">
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full"></div>
            </div>
            <div className="text-center flex-1 mx-2">
              <h1 className="text-lg font-bold leading-tight">SRI HARSHA EYE HOSPITAL</h1>
              <p className="text-[10px] leading-tight mt-0.5">
                Near Mancherial Chowrasta, Ambedkarnagar, Choppadandi Road, KARIMNAGAR-505001
              </p>
            </div>
            <div className="w-12 h-12 border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-8 h-8 bg-red-600 rounded-full"></div>
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
              <div className="w-14 h-14 rounded-full border-2 border-red-600 flex items-center justify-center bg-white">
                <div className="text-center">
                  <div className="w-6 h-6 bg-blue-600 rounded-full mx-auto mb-0.5"></div>
                  <p className="text-[7px] font-bold text-red-600">NABH</p>
                </div>
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

        {/* Certificate Title */}
        <h2 className="text-sm text-center font-bold py-2 px-2 mb-4">NON-CLAIM EHS CERTIFICATE</h2>

        {/* Date Section */}
        <div className="flex justify-end mb-6">
          <div className="text-[11px]">
            <span className="font-bold">Date: </span>
            <span>{treatmentData.date}</span>
          </div>
        </div>

        {/* Certificate Content */}
        <div className="mb-6">
          <div className="text-[11px] leading-relaxed">
            <p className="mb-4">
              This is to certify that <span className="font-bold">{patientData.patientName}</span>{' '}
              Patient ID <span className="font-bold">{patientData.patientId}</span> Guardian Name{' '}
              <span className="font-bold">{patientData.guardianName || ''}</span> Gender{' '}
              <span className="font-bold">{patientData.gender}</span> Resident of{' '}
              <span className="font-bold">{patientData.resident}</span> Age{' '}
              <span className="font-bold">{patientData.age}</span> has underwent on{' '}
              <span className="font-bold">{treatmentData.underwentOn}</span> and discharged on{' '}
              <span className="font-bold">{treatmentData.dischargedOn}</span>
            </p>

            <p className="mb-4">
              We have charged Rs.{' '}
              <span className="font-bold">{treatmentData.chargedAmount.toFixed(2)}</span> for the
              above mentioned surgery. The patient is under treatment in Department of{' '}
              <span className="font-bold">{treatmentData.department}</span>.
            </p>

            <p className="mb-6">The Patient has not claimed Employee Health Scheme.</p>
          </div>
        </div>

        {/* Empty space for additional content */}
        <div className="pb-3 mb-16">
          <div className="h-64"></div>
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
              <p className="font-bold">{authorizedSignatory || 'For SRI HARSHA EYE HOSPITAL'}</p>
              <p className="text-[10px]">Ph: 08728-234567, Cell: 9849639237</p>
              <p className="text-[10px]">🌐 www.sriharshaeye.com</p>
            </div>
          </div>

          {/* Bottom Disclaimer */}
          <div className="border-t border-gray-300 pt-2 text-center text-[9px] text-gray-500">
            <div className="flex justify-between items-center">
              <span>
                This is a computer generated certificate. Please preserve this for your records.
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
