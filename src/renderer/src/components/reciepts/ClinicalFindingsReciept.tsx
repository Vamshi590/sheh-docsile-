'use client'

import React from 'react'

interface PatientData {
  patientName: string
  patientId: string
  age: string
  gender: string
}

interface EyeFindings {
  lids: string
  conjunctiva: string
  cornea: string
  ac: string
  iris: string
  pupil: string
  lens: string
  iop: string
  vitreous: string
  fundus: string
  opticDisk: string
  macula: string
  vessels: string
  periphery: string
  phlephipharalRetina: string
  retinoscopy: string
}

interface PrescriptionItem {
  medicine?: string
  times: string
  days: string
}

interface ClinicalData {
  leftEye: EyeFindings
  rightEye: EyeFindings
  advised: string
  glasses: string
  dilateEye: string
  prescription: PrescriptionItem[]
  reviewDate: string
}

interface ClinicalFindingsReceiptProps {
  patientData: PatientData
  clinicalData: ClinicalData
}

export default function ClinicalFindingsReceipt({
  patientData,
  clinicalData
}: ClinicalFindingsReceiptProps): React.ReactElement {
  const renderEyeFindings = (eyeData: EyeFindings): React.ReactNode => (
    <div className="w-1/2 px-2">
      <div className="space-y-1 text-[10px]">
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">LIDS</span>
          <span>{eyeData.lids}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">CONJUNCTIVA</span>
          <span>{eyeData.conjunctiva}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">CORNEA</span>
          <span>{eyeData.cornea}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">A.C.</span>
          <span>{eyeData.ac}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">IRIS</span>
          <span>{eyeData.iris}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">PUPIL</span>
          <span>{eyeData.pupil}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">LENS</span>
          <span>{eyeData.lens}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">I.O.P.</span>
          <span>{eyeData.iop}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">VITREOUS</span>
          <span>{eyeData.vitreous}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">FUNDUS</span>
          <span>{eyeData.fundus}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">OPTIC DISK</span>
          <span>{eyeData.opticDisk}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">MACULA</span>
          <span>{eyeData.macula}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">VESSELS</span>
          <span>{eyeData.vessels}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">PERIPHERY</span>
          <span>{eyeData.periphery}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">PHLEPHIPHARAL RETINA</span>
          <span>{eyeData.phlephipharalRetina}</span>
        </div>
        <div className="flex justify-between border-b border-gray-300 pb-0.5">
          <span className="font-semibold">RETINOSCOPY</span>
          <span>{eyeData.retinoscopy}</span>
        </div>
      </div>

      {/* Eye Diagram */}
      <div className="flex justify-center mt-4 mb-4">
        <div className="w-24 h-24 border-2 border-black rounded-full relative bg-white">
          {/* Outer circle divisions */}
          <div className="absolute inset-1 border border-gray-400 rounded-full">
            {/* Inner circle */}
            <div className="absolute inset-4 border border-gray-400 rounded-full">
              {/* Center pupil */}
              <div className="absolute inset-2 bg-black rounded-full"></div>
            </div>
          </div>
          {/* Vertical line */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black transform -translate-x-px"></div>
          {/* Horizontal line */}
          <div className="absolute left-0 right-0 top-1/2 h-px bg-black transform -translate-y-px"></div>
          {/* Diagonal lines */}
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black transform rotate-45 origin-center"></div>
          <div className="absolute top-0 bottom-0 left-1/2 w-px bg-black transform -rotate-45 origin-center"></div>
        </div>
      </div>
    </div>
  )

  return (
    <div className="receipt-container bg-white mx-auto">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Simple Header */}
        <div className="pb-2 mb-4 border-b-2 border-black">
          <div className="flex justify-between items-center">
            {/* Left Eye Symbol */}
            <div className="w-12 h-8 border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-6 h-4 bg-black rounded-full relative">
                <div className="absolute inset-1 bg-white rounded-full"></div>
                <div className="absolute inset-2 bg-black rounded-full"></div>
              </div>
            </div>

            {/* Title */}
            <div className="text-center flex-1">
              <h1 className="text-lg font-bold">CLINICAL FINDINGS</h1>
            </div>

            {/* Right Eye Symbol */}
            <div className="w-12 h-8 border-2 border-black rounded-full flex items-center justify-center">
              <div className="w-6 h-4 bg-black rounded-full relative">
                <div className="absolute inset-1 bg-white rounded-full"></div>
                <div className="absolute inset-2 bg-black rounded-full"></div>
              </div>
            </div>
          </div>
        </div>

        {/* Patient Information Section */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="text-[11px] font-bold mb-1">PATIENT INFORMATION</div>
          <div className="flex justify-between text-[10px]">
            <div>
              <span className="font-semibold">Name: </span>
              <span>{patientData.patientName}</span>
            </div>
            <div>
              <span className="font-semibold">ID: </span>
              <span>{patientData.patientId}</span>
            </div>
            <div>
              <span className="font-semibold">Age: </span>
              <span>{patientData.age}</span>
            </div>
            <div>
              <span className="font-semibold">Gender: </span>
              <span>{patientData.gender}</span>
            </div>
          </div>
        </div>

        {/* Clinical Findings Section */}
        <div className="mb-6">
          <div className="flex border-b-2 border-black">
            {renderEyeFindings(clinicalData.leftEye)}
            <div className="w-px bg-black"></div>
            {renderEyeFindings(clinicalData.rightEye)}
          </div>
        </div>

        {/* Advised Section */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="text-[11px] font-bold mb-1">ADVISED</div>
          <div className="min-h-[20px] text-[10px]">{clinicalData.advised}</div>
        </div>

        {/* Glasses Section */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="text-[11px] font-bold mb-1">GLASSES</div>
          <div className="min-h-[20px] text-[10px]">{clinicalData.glasses}</div>
        </div>

        {/* Dilate Eye Section */}
        <div className="mb-4 border-b border-gray-300 pb-2">
          <div className="text-[11px] font-bold mb-1">DILATE EYE {clinicalData.dilateEye}</div>
          <div className="min-h-[20px]"></div>
        </div>

        {/* Prescription Section */}
        <div className="mb-6 border-b border-gray-300 pb-4">
          <div className="text-[11px] font-bold mb-2">PRESCRIPTION</div>
          <table className="w-full border-collapse border border-black text-[10px]">
            <thead>
              <tr className="border-b border-black">
                <th className="border-r border-black p-2 text-left font-bold">MEDICINE</th>
                <th className="border-r border-black p-2 text-center font-bold">NO OF TIMES</th>
                <th className="p-2 text-center font-bold">NO OF DAYS</th>
              </tr>
            </thead>
            <tbody>
              {clinicalData.prescription.map((item, index) => (
                <tr key={index} className="border-b border-gray-300">
                  <td className="border-r border-black p-2">{item.medicine || ''}</td>
                  <td className="border-r border-black p-2 text-center">{item.times}</td>
                  <td className="p-2 text-center">{item.days}</td>
                </tr>
              ))}
              {/* Add empty rows to match the image */}
              {Array.from({ length: Math.max(0, 6 - clinicalData.prescription.length) }).map(
                (_, index) => (
                  <tr key={`empty-${index}`} className="border-b border-gray-300">
                    <td className="border-r border-black p-2 h-6"></td>
                    <td className="border-r border-black p-2 h-6"></td>
                    <td className="p-2 h-6"></td>
                  </tr>
                )
              )}
            </tbody>
          </table>
        </div>

        {/* Review Date Section */}
        <div className="mb-8">
          <div className="flex justify-between items-center text-[11px]">
            <div>
              <span className="font-bold">REVIEW DATE: </span>
              <span>{clinicalData.reviewDate}</span>
            </div>
            <div className="text-right"></div>
          </div>
        </div>

        {/* Empty space */}
        <div className="h-32"></div>
      </div>

      {/* Same Footer as Previous Receipt */}
      <div className="receipt-footer">
        <div className="pt-3">
          {/* Hospital Authorization */}
          <div className="flex justify-between items-center">
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
