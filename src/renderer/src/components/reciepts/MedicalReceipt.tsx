import React from 'react'
import { ReceiptData } from '../../types/Receipt'

interface MedicalReceiptProps {
  data: ReceiptData
}

const MedicalReceipt: React.FC<MedicalReceiptProps> = ({ data }) => {
  const { businessInfo, patientInfo, items, totals } = data

  // Create empty rows to fill the table (A4 needs about 12-15 rows total)
  const totalRows = 15
  const emptyRowsCount = Math.max(0, totalRows - items.length - 5) // 5 for total section

  return (
    <div className="w-[210mm] h-[297mm] mx-auto bg-[#ffffff] border-2 border-[#000000] print:border-0 print:shadow-none shadow-lg flex flex-col">
      {/* Header */}
      <div className="border-b border-[#000000] flex justify-between items-center pb-2 px-3">
        <div className="flex flex-col space-y-1 items-start text-xs">
          <span>D.L. No: {businessInfo.dlNo}</span>
          <span>GSTIN: {businessInfo.gstin}</span>
        </div>
        <div>
          <span className="font-bold text-center flex-1">MEDICAL RECEIPT</span>
        </div>
        <div className="flex flex-col space-y-1 items-end text-xs mt-1">
          <span>Cell: {businessInfo.phone1}</span>
          <span>{businessInfo.phone2}</span>
        </div>
      </div>

      {/* Business Name */}
      <div className="text-center py-2 border-b border-[#000000]">
        <h1 className="text-xl font-bold">{businessInfo.name}</h1>
        <p className="text-sm">{businessInfo.address}</p>
      </div>

      {/* Patient Information Section */}
      <div className="pb-3 mb-4 px-3 border-b border-[#000000]">
        <h3 className="text-xs font-bold mb-3">PATIENT INFORMATION</h3>
        {/* grid-based layout */}
        <div className="text-[11px] grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-2">
          {/* Patient ID */}
          <div>
            <div className="font-bold">BILL NO.</div>
            <div>{patientInfo.billNumber}</div>
          </div>
          <div>
            <div className="font-bold">PATIENT ID</div>
            <div>{patientInfo.patientId}</div>
          </div>
          {/* Date */}
          <div>
            <div className="font-bold">DATE</div>
            <div>{patientInfo.date}</div>
          </div>
          {/* Patient Name */}
          <div>
            <div className="font-bold">PATIENT NAME</div>
            <div>{patientInfo.patientName}</div>
          </div>
          {/* Gender */}
          <div>
            <div className="font-bold">GENDER</div>
            <div>{patientInfo.gender}</div>
          </div>
          {/* Guardian Name */}
          <div>
            <div className="font-bold">GUARDIAN NAME</div>
            <div>{patientInfo.guardianName || ''}</div>
          </div>
          {/* Age */}
          <div>
            <div className="font-bold">AGE</div>
            <div>{patientInfo.age}</div>
          </div>
          {/* Address */}
          <div>
            <div className="font-bold">ADDRESS</div>
            <div>{patientInfo.address}</div>
          </div>
          {/* Mobile */}
          <div>
            <div className="font-bold">MOBILE</div>
            <div>{patientInfo.mobile}</div>
          </div>
          {/* Doctor Name */}
          <div>
            <div className="font-bold">DOCTOR NAME</div>
            <div>{patientInfo.doctorName}</div>
          </div>
          {/* Department */}
          <div>
            <div className="font-bold">DEPT.</div>
            <div>{patientInfo.dept}</div>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div>
        <table className="w-full text-xs border-collapse">
          <thead>
            <tr className="border-1 border-[#000000] font-semibold">
              <th className="w-[50%] border-r border-[#000000] p-1 py-2 text-center">
                Particulars
              </th>
              <th className="w-[16.67%] border-r border-[#000000] p-1 py-2 text-center">Qty</th>
              <th className="w-[16.67%] border-r border-[#000000] p-1 py-2 text-center">Rate</th>
              <th className="w-[16.67%] p-1 py-2 text-center">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            {/* Table Rows with Items */}
            {items.map((item, index) => (
              <tr key={index} className="border-b border-[#000000]">
                <td className="border-r border-[#000000] p-1 py-2 text-center">
                  {item.particulars}
                </td>
                <td className="border-r border-[#000000] p-1 py-2 text-center">{item.qty}</td>
                <td className="border-r border-[#000000] p-1 py-2 text-center">
                  {item.rate.toFixed(2)}
                </td>
                <td className="p-1 py-2 text-center">{item.amount.toFixed(2)}</td>
              </tr>
            ))}

            {/* Empty rows */}
            {[...Array(emptyRowsCount)].map((_, index) => (
              <tr key={index} className="border-b border-[#000000]">
                <td className="border-r border-[#000000] p-1 py-2 h-4"></td>
                <td className="border-r border-[#000000] p-1 py-2"></td>
                <td className="border-r border-[#000000] p-1 py-2"></td>
                <td className="p-1 py-2"></td>
              </tr>
            ))}

            {/* Total Section */}
            <tr className="border-b border-[#000000]">
              <td colSpan={2} className="border-r border-[#000000] p-1 py-2"></td>
              <td className="border-r border-[#000000] p-1 py-2 font-semibold text-center">
                TOTAL AMOUNT
              </td>
              <td className="p-1 py-2 text-center">{totals.totalAmount.toFixed(2)}</td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td colSpan={2} className="border-r border-[#000000] p-1 py-2"></td>
              <td className="border-r border-[#000000] p-1 py-2 font-semibold text-center">
                ADVANCE PAID
              </td>
              <td className="p-1 py-2 text-center">
                {totals.advancePaid > 0 ? totals.advancePaid.toFixed(2) : '-'}
              </td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td colSpan={2} className="border-r border-[#000000] p-1 py-2"></td>
              <td className="border-r border-[#000000] p-1 py-2 font-semibold text-center">
                AMT. RECEIVED
              </td>
              <td className="p-1 py-2 text-center">
                {totals.amtReceived > 0 ? totals.amtReceived.toFixed(2) : '-'}
              </td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td colSpan={2} className="border-r border-[#000000] p-1 py-2"></td>
              <td className="border-r border-[#000000] p-1 py-2 font-semibold text-center">
                DISCOUNT
              </td>
              <td className="p-1 py-2 text-center">
                {totals.discount > 0 ? totals.discount.toFixed(2) : '-'}
              </td>
            </tr>
            <tr className="border-b border-[#000000]">
              <td colSpan={2} className="border-r border-[#000000] p-1 py-2"></td>
              <td className="border-r border-[#000000] p-1 py-2 font-semibold text-center">
                BALANCE
              </td>
              <td className="p-1 py-2 text-center">{totals.balance.toFixed(2)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Safety Information Section - Full Width */}
      <div className="border-t border-[#000000]">
        <div className="p-2 text-xs">
          <div className="space-y-2">
            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">Consultation Required:</h3>
              <p className="text-xs leading-tight">
                All medicines should be taken only under the advice and supervision of a qualified
                medical practitioner.
              </p>
            </div>

            <div className="flex flex-row space-x-2">
              <h3 className="font-bold text-xs mb-1 shrink-0">Side Effects:</h3>
              <p className="text-xs leading-tight">
                Medicines may cause side effects such as drowsiness, nausea, headache, or allergic
                reactions. Contact your doctor immediately if any adverse symptoms occur.
              </p>
            </div>

            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">Storage Instructions:</h3>
              <p className="text-xs leading-tight">
                Store medicines in a cool, dry place away from direct sunlight and out of reach of
                children.
              </p>
            </div>

            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">Dosage Caution:</h3>
              <p className="text-xs leading-tight">
                Do not exceed the prescribed dosage. Improper usage can be harmful or
                life-threatening.
              </p>
            </div>

            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">No Self-Medication:</h3>
              <p className="text-xs leading-tight">
                Avoid self-medication or using this receipt as a prescription for future use.
              </p>
            </div>

            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">Legal Responsibility:</h3>
              <p className="text-xs leading-tight">
                The pharmacy/hospital is not liable for misuse or incorrect consumption of medicines
                once dispensed.
              </p>
            </div>

            <div className="flex space-x-2">
              <h3 className="font-bold text-xs mb-1">Emergency Help:</h3>
              <p className="text-xs leading-tight">
                In case of overdose or severe reaction, seek emergency medical attention
                immediately.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Spacer to push footer to bottom */}
      <div className="flex-1"></div>

      {/* Footer at bottom of page */}
      <div className="mt-auto">
        {/* Authorized Signatory */}
        <div className="p-2 text-xs">
          <div className="text-right">
            <span className="font-semibold">AUTHORISED SIGNATORY</span>
          </div>
        </div>

        {/* Computer Generated Footer */}
        <div className="border-t border-[#000000] p-2 text-xs text-center space-y-1">
          <div className="flex justify-between text-[#000000] mb-6">
            <p className="text-[#000000]">
              This file is computer generated. and{' '}
              <span>generated on: {new Date().toLocaleDateString('en-GB')}</span>{' '}
              <span>generated by: SRI MEHER MEDICALS System</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default MedicalReceipt
