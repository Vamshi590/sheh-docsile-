// Dropdown options for various form fields
// These can be expanded as needed

export const departmentOptions = [
  'Opthalmology',
  'Cardiology',
  'Neurology',
  'Orthopedics',
  'Pediatrics',
  'General Medicine',
  'Dermatology',
  'ENT'
]

// Options for paid for field with associated prices
export interface PaidForOption {
  name: string
  amount: number
}

export const paidForOptions = [
  { name: 'Consultation', amount: 500 },
  { name: 'Eye Test', amount: 300 },
  { name: 'Glasses', amount: 2000 },
  { name: 'Contact Lenses', amount: 1500 },
  { name: 'Surgery', amount: 15000 },
  { name: 'Medicine', amount: 800 },
  { name: 'Follow-up Visit', amount: 300 },
  { name: 'Procedure', amount: 1200 },
  { name: 'Lab Test', amount: 500 },
  { name: 'Scan', amount: 2500 }
]

// For backward compatibility and simpler access
export const paidForOptionNames = paidForOptions.map((option) => option.name)

export const genderOptions = ['Male', 'Female', 'Other']

export const specialistOptions = [
  'General Ophthalmologist',
  'Cataract Specialist',
  'Retina Specialist',
  'Cornea Specialist',
  'Glaucoma Specialist',
  'Pediatric Ophthalmologist'
]

export const referredByOptions = [
  'Self',
  'Dr. Smith',
  'Dr. Johnson',
  'Dr. Williams',
  'Dr. Brown',
  'Dr. Jones',
  'Dr. Miller',
  'Dr. Davis',
  'Dr. Wilson',
  'Family Member',
  'Friend',
  'Insurance',
  'Hospital',
  'Clinic'
]

export const doctorOptions = [
  'Dr. Srilatha ch',
  'Dr. Sheh',
  'Dr. Ravi Kumar',
  'Dr. Priya Sharma',
  'Dr. Anand Reddy',
  'Dr. Meena Patel'
]

export const statusOptions = ['Regular', 'Follow Up', 'Emergency']

export const paymentModeOptions = [
  'Cash',
  'Credit Card',
  'Debit Card',
  'UPI',
  'Net Banking',
  'Check',
  'Insurance'
]
// Define part options and rates
export const partOptions = [
  'Bed',
  'General Ward',
  'Delux Room',
  'ICU',
  'Operation Theatre',
  'Consultation',
  'Medicine',
  'Lab Tests',
  'Imaging',
  'Procedure'
]

export const medicineOptions = [
  'Paracetamol 500mg',
  'Ibuprofen 400mg',
  'Amoxicillin 250mg',
  'Azithromycin 500mg',
  'Ciprofloxacin 500mg',
  'Omeprazole 20mg',
  'Pantoprazole 40mg',
  'Cetirizine 10mg',
  'Montelukast 10mg',
  'Amlodipine 5mg',
  'Atenolol 50mg',
  'Metformin 500mg',
  'Glimepiride 1mg',
  'Atorvastatin 10mg',
  'Rosuvastatin 5mg',
  'Levothyroxine 50mcg',
  'Prednisolone 5mg',
  'Dexamethasone 0.5mg',
  'Diazepam 5mg',
  'Alprazolam 0.25mg'
]

export const timingOptions = [
  'Once daily (1-0-0)',
  'Once daily (0-1-0)',
  'Once daily (0-0-1)',
  'Twice daily (1-0-1)',
  'Twice daily (0-1-1)',
  'Twice daily (1-1-0)',
  'Three times daily (1-1-1)',
  'Four times daily',
  'Every morning',
  'Every night',
  'Before meals',
  'After meals',
  'Before breakfast',
  'After breakfast',
  'Before lunch',
  'After lunch',
  'Before dinner',
  'After dinner',
  'Every 6 hours',
  'Every 8 hours',
  'Every 12 hours',
  'As needed'
]

export const adviceOptions = [
  'Take plenty of fluids',
  'Rest adequately',
  'Avoid spicy foods',
  'Avoid oily foods',
  'Avoid alcohol',
  'Avoid smoking',
  'Exercise regularly',
  'Follow a balanced diet',
  'Reduce salt intake',
  'Reduce sugar intake',
  'Take medication with food',
  'Take medication on empty stomach',
  'Continue previous medications',
  'Report if any side effects',
  'Follow up after 1 week',
  'Follow up after 2 weeks',
  'Follow up after 1 month',
  'Get lab tests done'
]

// Operation related options
export const operationDetailsOptions = [
  'Cataract surgery',
  'Glaucoma surgery',
  'Retinal detachment repair',
  'Corneal transplant',
  'Pterygium excision',
  'Strabismus correction',
  'Vitrectomy',
  'Laser eye surgery',
  'Refractive surgery',
  'Eyelid surgery'
]

export const operationProcedureOptions = [
  'Phacoemulsification with IOL implantation',
  'Trabeculectomy',
  'Pars plana vitrectomy',
  'Penetrating keratoplasty',
  'Pterygium excision with conjunctival autograft',
  'Strabismus muscle recession/resection',
  'Intravitreal injection',
  'LASIK',
  'PRK',
  'Blepharoplasty'
]

export const provisionDiagnosisOptions = [
  'Senile cataract',
  'Primary open-angle glaucoma',
  'Rhegmatogenous retinal detachment',
  'Corneal opacity',
  'Pterygium',
  'Esotropia/Exotropia',
  'Vitreous hemorrhage',
  'Myopia',
  'Hyperopia',
  'Dermatochalasis'
]
