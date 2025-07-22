'use client'

import type React from 'react'
import nabhimage from '../../assets/nabh_accredited.jpg'
import eyeimage from '../../assets/eye_image.jpg'
interface ClinicalFindingsData {
  patientName?: string
  date?: string
  leftEye: {
    lids: string
    conjunctiva: string
    cornea: string
    ac: string
    iris: string
    pupil: string
    lens: string
    tension: string
    fundus: string
    opticDisk: string
    macula: string
    vessels: string
    peripheralRetina: string
    retinoscopy: string
    retino1: string
    retino2: string
    retino3: string
    retino4: string
  }
  rightEye: {
    lids: string
    conjunctiva: string
    cornea: string
    ac: string
    iris: string
    pupil: string
    lens: string
    tension: string
    fundus: string
    opticDisk: string
    macula: string
    vessels: string
    peripheralRetina: string
    retinoscopy: string
    retino1: string
    retino2: string
    retino3: string
    retino4: string
  }
  advised: string
  reviewDate: string
}

interface ClinicalFindingsFormProps {
  data?: ClinicalFindingsData
  authorizedSignatory?: string
}

const ClinicalFindingsForm: React.FC<ClinicalFindingsFormProps> = ({
  data,
  authorizedSignatory = ''
}) => {
  const defaultData: ClinicalFindingsData = {
    leftEye: {
      lids: 'Normal',
      conjunctiva: 'Normal',
      cornea: 'Normal',
      ac: 'Normal',
      iris: 'Normal',
      pupil: 'Normal',
      lens: 'Normal',
      tension: '-',
      fundus: '-',
      opticDisk: 'Normal',
      macula: '-',
      vessels: '-',
      peripheralRetina: '-',
      retinoscopy: '-',
      retino1: '-',
      retino2: '-',
      retino3: '-',
      retino4: '-'
    },
    rightEye: {
      lids: 'Normal',
      conjunctiva: 'Normal',
      cornea: 'Normal',
      ac: 'Normal',
      iris: 'Normal',
      pupil: 'Normal',
      lens: 'Normal',
      tension: '-',
      fundus: '-',
      opticDisk: 'Normal',
      macula: '-',
      vessels: '-',
      peripheralRetina: '-',
      retinoscopy: '-',
      retino1: '-',
      retino2: '-',
      retino3: '-',
      retino4: '-'
    },
    advised: '',
    reviewDate: ''
  }
  const formData = data || defaultData

  console.log('formData', formData)
  return (
    <div className="receipt-container bg-[#ffffff] mx-auto relative">
      {/* Main Content */}
      <div className="receipt-content">
        {/* Header Section */}
        <div className="pb-2 mb-2 border-b-2 border-[#000000]">
          {/* Hospital Name Row */}
          <div className="flex justify-between items-center mb-2">
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" className="w-full h-full object-contain" />
            </div>
            <div className="text-center flex-1 mx-2">
              <h1 className="text-lg font-bold leading-tight">SRI HARSHA EYE HOSPITAL</h1>
              <p className="text-[10px] leading-tight mt-0.5">
                Near Mancherial Chowrasta, Ambedkarnagar, Choppadandi Road, KARIMNAGAR-505001
              </p>
            </div>
            <div className="w-12 h-12 flex items-center justify-center">
              <img src={eyeimage} alt="eye image" className="w-full h-full object-contain" />
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
              <div className="w-24 h-24 flex items-center justify-center bg-[#ffffff]">
                <img
                  src={nabhimage}
                  alt="NABH Accredited"
                  className="w-full h-full object-contain"
                />
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

        {/* Clinical Findings Title */}
        <h2 className="text-sm text-center font-bold py-1 px-2 mb-4">CLINICAL FINDINGS</h2>

        {/* Eye Examination Section */}
        <div className="flex justify-between mb-6">
          {/* Left Eye */}
          <div className="w-[48%]">
            <div className="text-center mb-2">
              <p className="text-sm font-bold">Left Eye</p>
            </div>
            <div className="p-2 mb-4 pl-16">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="font-semibold">LIDS</div>
                <div className="text-[#000000] text-center">{formData.leftEye.lids}</div>
                <div className="font-semibold">CONJUNCTIVA</div>
                <div className="text-[#000000] text-center">{formData.leftEye.conjunctiva}</div>
                <div className="font-semibold">CORNEA</div>
                <div className="text-[#000000] text-center">{formData.leftEye.cornea}</div>
                <div className="font-semibold">A.C.</div>
                <div className="text-[#000000] text-center">{formData.leftEye.ac}</div>
                <div className="font-semibold">IRIS</div>
                <div className="text-[#000000] text-center">{formData.leftEye.iris}</div>
                <div className="font-semibold">PUPIL</div>
                <div className="text-[#000000] text-center">{formData.leftEye.pupil}</div>
                <div className="font-semibold">LENS</div>
                <div className="text-[#000000] text-center">{formData.leftEye.lens}</div>
                <div className="font-semibold">TENSION</div>
                <div className="text-[#000000] text-center">{formData.leftEye.tension}</div>
                <div className="font-semibold">FUNDUS</div>
                <div className="text-[#000000] text-center">{formData.leftEye.fundus}</div>
                <div className="font-semibold">OPTIC DISK</div>
                <div className="text-[#000000] text-center">{formData.leftEye.opticDisk}</div>
                <div className="font-semibold">MACULA</div>
                <div className="text-[#000000] text-center">{formData.leftEye.macula}</div>
                <div className="font-semibold">VESSELS</div>
                <div className="text-[#000000] text-center">{formData.leftEye.vessels}</div>
                <div className="font-semibold">PERIPHERIAL RETINA</div>
                <div className="text-[#000000] text-center">
                  {formData.leftEye.peripheralRetina}
                </div>
                <div className="font-semibold">RETINOSCOPY</div>
                <div className="text-[#000000] text-center">{formData.leftEye.retinoscopy}</div>
              </div>
            </div>

            <div className="flex justify-center space-x-4">
              <div className="relative w-32 h-32">
                {/* Outer circle */}
                <div className="absolute inset-0 rounded-full border-2 border-[#000000]"></div>
                {/* Smaller center circle */}
                <div className="absolute w-6 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#000000] z-10 bg-[#ffffff]"></div>
                {/* Diagonal lines within the circle only */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0">
                  <line x1="15" y1="15" x2="85" y2="85" stroke="#000000" strokeWidth="2" />
                  <line x1="85" y1="15" x2="15" y2="85" stroke="#000000" strokeWidth="2" />
                </svg>
                {/* Text Inputs */}
                <div className="absolute top-0 left-10 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.leftEye.retino1}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute top-10 right-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.leftEye.retino2}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-0 left-10 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.leftEye.retino3}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-10 left-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.leftEye.retino4}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="absolute w-px h-full bg-[#000000]"></div>
                  <div className="absolute h-px w-full bg-[#000000]"></div>
                </div>
                <div className="absolute top-2 left-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.leftEye.retino1}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute top-2 right-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.leftEye.retino2}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-2 left-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.leftEye.retino3}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.leftEye.retino4}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Eye */}
          <div className="w-[48%]">
            <div className="text-center mb-2">
              <p className="text-sm font-bold">Right Eye</p>
            </div>
            <div className="p-2 mb-4 pl-16">
              <div className="grid grid-cols-2 gap-1 text-xs">
                <div className="font-semibold">LIDS</div>
                <div className="text-[#000000] text-center">{formData.rightEye.lids}</div>
                <div className="font-semibold">CONJUNCTIVA</div>
                <div className="text-[#000000] text-center">{formData.rightEye.conjunctiva}</div>
                <div className="font-semibold">CORNEA</div>
                <div className="text-[#000000] text-center">{formData.rightEye.cornea}</div>
                <div className="font-semibold">A.C.</div>
                <div className="text-[#000000] text-center">{formData.rightEye.ac}</div>
                <div className="font-semibold">IRIS</div>
                <div className="text-[#000000] text-center">{formData.rightEye.iris}</div>
                <div className="font-semibold">PUPIL</div>
                <div className="text-[#000000] text-center">{formData.rightEye.pupil}</div>
                <div className="font-semibold">LENS</div>
                <div className="text-[#000000] text-center">{formData.rightEye.lens}</div>
                <div className="font-semibold">TENSION</div>
                <div className="text-[#000000] text-center">{formData.rightEye.tension}</div>
                <div className="font-semibold">FUNDUS</div>
                <div className="text-[#000000] text-center">{formData.rightEye.fundus}</div>
                <div className="font-semibold">OPTIC DISK</div>
                <div className="text-[#000000] text-center">{formData.rightEye.opticDisk}</div>
                <div className="font-semibold">MACULA</div>
                <div className="text-[#000000] text-center">{formData.rightEye.macula}</div>
                <div className="font-semibold">VESSELS</div>
                <div className="text-[#000000] text-center">{formData.rightEye.vessels}</div>
                <div className="font-semibold">PERIPHERIAL RETINA</div>
                <div className="text-[#000000] text-center">
                  {formData.rightEye.peripheralRetina}
                </div>
                <div className="font-semibold">RETINOSCOPY</div>
                <div className="text-[#000000] text-center">{formData.rightEye.retinoscopy}</div>
              </div>
            </div>
            <div className="flex space-x-4 justify-center">
              <div className="relative w-32 h-32">
                {/* Outer circle */}
                <div className="absolute inset-0 rounded-full border-2 border-[#000000]"></div>
                {/* Smaller center circle */}
                <div className="absolute w-6 h-6 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-[#000000] z-10 bg-[#ffffff]"></div>
                {/* Diagonal lines within the circle only */}
                <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full z-0">
                  <line x1="15" y1="15" x2="85" y2="85" stroke="#000000" strokeWidth="2" />
                  <line x1="85" y1="15" x2="15" y2="85" stroke="#000000" strokeWidth="2" />
                </svg>
                {/* Text Inputs */}
                <div className="absolute top-0 left-10 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.rightEye.retino1}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute top-10 right-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.rightEye.retino2}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-0 left-10 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.rightEye.retino3}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-10 left-0 w-[40%] h-[40%] flex items-center justify-center z-20">
                  <input
                    defaultValue={formData.rightEye.retino4}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
              </div>

              <div className="relative w-32 h-32">
                <div className="absolute inset-0 flex justify-center items-center">
                  <div className="absolute w-px h-full bg-[#000000]"></div>
                  <div className="absolute h-px w-full bg-[#000000]"></div>
                </div>
                <div className="absolute top-2 left-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.rightEye.retino1}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute top-2 right-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.rightEye.retino2}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-2 left-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.rightEye.retino3}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
                <div className="absolute bottom-2 right-2 w-1/2 h-1/2 flex items-center justify-center">
                  <input
                    defaultValue={formData.rightEye.retino4}
                    className="text-center w-full bg-[#ffffff] outline-none"
                    readOnly
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Clean Fixed Footer */}
      <div className="receipt-footer">
        <div className="pt-3">
          {/* Hospital Authorization */}
          <div className="flex justify-between items-center">
            <div className="text-left text-[11px]"></div>
            <div className="text-right text-[11px] space-y-1">
              <p className="font-bold">AUTHORISED SIGNATORY</p>
              <p className="font-bold">{authorizedSignatory || 'For SRI HARSHA EYE HOSPITAL'}</p>
              <p className="text-[10px]">Ph: 08728-234567, Cell: 9849639237</p>
              <p className="text-[10px]">🌐 www.sriharshaeye.com</p>
            </div>
          </div>
          {/* Bottom Disclaimer */}
          <div className="border-t border-[#000000] pt-2 text-center text-[9px] text-[#000000] mt-2">
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

export default ClinicalFindingsForm
