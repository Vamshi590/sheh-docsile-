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
  'Both Cash and UPI',
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
  'SOHA- E/D -B/E',
  'FLOGEL ULTRA -E/D -B/E',
  'FLOGEL -E/D -B/E',
  'PREDFORTE -E/D -B/E',
  'PREDACE -E/D -B/E',
  'OSMO -E/D -B/E',
  'FLOGEL HYDRA  E/D -B/E',
  'MOXOFT E/D-B/E',
  'ACULAR-LS E/D -B/E',
  'MOXIGRAM -E/D -B/E',
  'LUBRIMED E/D -B/E',
  'ECOTEARS E/D -B/E',
  'TEARLUB E/D -B/E',
  'VIFRESH E/D -B/E',
  'TEARMIST E/D -B/E',
  'MOCARE E/D -B/E',
  'SYMTLYLO E/D -B/E',
  'EYEMIST E/D -B/E',
  'DILATE E/D -B/E',
  'CYCLOPENTOLATE E/D -B/E',
  'IF2 E/D -B/E',
  'CARELUB E/D -B/E',
  'FLURISONE E/D -B/E',
  'DOLOZAPGEL E/O',
  'HOMIDE -E/D -B/E',
  'NATAMET -E/D -B/E',
  'MOXIGRAM-DM -E/D -B/E',
  'DIMPLE -E/D -B/E',
  'MOXCIP -E/D  -B/E',
  'MOXOFT -E/D -B/E',
  'MEGABROM -E/D -B/E',
  'GENFOUR -E/D -B/E',
  'NEFARIL -E/D -B/E',
  'OBRIN -E/D -B/E',
  'BEPORIUS -E/D -B/E',
  'FML E/D -B/E',
  'NAPALACT-Z  E/D -B/E',
  'LOTEFAST E/D -B/E',
  'NEPACINAC  E/D -B/E',
  'FLOUROMED -E/D -B/E',
  'NEYPAC -E/D -B/E -B/E',
  'LOPRED-T -E/D -B/E',
  'CYCLISIS PF E/D -B/E',
  'TOBA F -E/D -B/E',
  'TOBA - E/D -B/E',
  'ITROP PLUS -E/D -B/E',
  'BRINZOTIM -E/D -B/E',
  'TAXIM-O -E/D -B/E',
  'MOXIGRAM E/O',
  'TAGAMOX E/O',
  'GANPYAR E/O',
  'AVIUM E/O',
  'GRENIL-tab',
  'LECOPE-M -tab',
  'LIMCEE -tab',
  'FEPANIL -tab',
  'VALVIT -tab',
  'MEGAVIZ -tab',
  'CIPLOX-500mg -tab',
  'DIAMOX I.P-250mg -tab',
  'AZEE-500 -tab',
  'DOXT-SL -tab',
  'RUBEE 20 -tab',
  'DOLOZAP  -tab',
  'FERY-XT -tab',
  'INRAB-D tab',
  'RANTAC-150  -tab',
  'GRENIL.F10 -tab',
  'SHELCAL -tab',
  'MAHACEF -tab',
  'ACETAMIDE-250mg -tab',
  'NUROKIND-OD -tab',
  'LECOPE-M -tab',
  'LICOPE-M KID -tab',
  'LYSER-D -tab',
  'DIZIRON -tab',
  'MEFKIND-forte -tab',
  'TRAMAZAC-P -tab',
  'FLUNARIN 10',
  'VALUVIT -tab',
  'RETINERB -tab',
  'ISITE -tab',
  'SITE PLUS -tab',
  'CLAVAM -625 -tab',
  'GLUKOGSIC -tab',
  'OPTIWIRE -tab',
  'RETIGARD  -tab',
  'ASTADOR -tab',
  'CANDITRAL-100mg -tab',
  'CANDITRAL-200mg -tab',
  'METROGYL 200mg -tab',
  'ACIVIR-800 DT -tab',
  'WYSOLOENE 20mg -tab',
  'CHESTON COLD -tab',
  'LEA 650MD TAB',
  'VALUVIT TAB',
  'HHOMEGA TAB',
  'MOXICIP E/D'
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
