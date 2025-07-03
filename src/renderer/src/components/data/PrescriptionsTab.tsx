import React, { useState, useEffect, useRef, useCallback } from 'react'

interface Prescription {
  id: string
  date: string
  patientId: string
  patientName: string
  guardianName?: string
  phoneNumber?: string
  age?: string | number
  gender?: string
  address?: string

  // Doctor information
  doctorName: string
  department?: string
  referredBy?: string

  // Financial data (receipt)
  totalAmount: number
  amountReceived: number
  amountDue: number
  modeOfPayment?: string
  receiptNumber?: string
  paidFor?: string
  discountPercentage?: string | number
  discountAmount?: string | number
  advancePaid?: string | number

  // Medical information
  presentComplain?: string
  previousHistory?: string
  notes?: string
  followUpDate?: string

  // Prescription medications
  prescription1?: string
  days1?: string | number
  timing1?: string
  prescription2?: string
  days2?: string | number
  timing2?: string
  prescription3?: string
  days3?: string | number
  timing3?: string
  prescription4?: string
  days4?: string | number
  timing4?: string
  prescription5?: string
  days5?: string | number
  timing5?: string

  // Advice fields
  advice1?: string
  advice2?: string
  advice3?: string
  advice4?: string
  advice5?: string

  // Basic Readings data
  temperature?: string
  bloodPressure?: string
  spo2?: string
  pulseRate?: string
  weight?: number | string
  height?: number | string
  bmi?: number | string
  bloodSugar?: string

  // Eye examination data
  advisedFor?: string

  // Glasses Reading (GR)
  grReDSph?: string
  grReDCyl?: string
  grReDAxis?: string
  grReDVision?: string
  grReNSph?: string
  grReNCyl?: string
  grReNAxis?: string
  grReNVision?: string
  grLeDSph?: string
  grLeDCyl?: string
  grLeDAxis?: string
  grLeDVision?: string
  grLeNSph?: string
  grLeNCyl?: string
  grLeNAxis?: string
  grLeNVision?: string

  // Auto Refractometer (AR)
  arReSph?: string
  arReCyl?: string
  arReAxis?: string
  arReVa?: string
  arReVaCph?: string
  arLeSph?: string
  arLeCyl?: string
  arLeAxis?: string
  arLeVa?: string
  arLeVaCph?: string

  // Power Glass Prescription (PGP)
  pgpReDSph?: string
  pgpReDCyl?: string
  pgpReDAxis?: string
  pgpReDVa?: string
  pgpReNSph?: string
  pgpReNCyl?: string
  pgpReNAxis?: string
  pgpReNVa?: string
  pgpLeDSph?: string
  pgpLeDCyl?: string
  pgpLeDAxis?: string
  pgpLeDVa?: string
  pgpLeNSph?: string
  pgpLeNCyl?: string
  pgpLeNAxis?: string
  pgpLeNVa?: string

  // Clinical Findings (CF)
  cfReLids?: string
  cfReSac?: string
  cfReConjuctiva?: string
  cfReCornea?: string
  cfReAc?: string
  cfReIris?: string
  cfRePupil?: string
  cfReLens?: string
  cfReTension?: string
  cfReFundus?: string
  cfLeLids?: string
  cfLeSac?: string
  cfLeConjuctiva?: string
  cfLeCornea?: string
  cfLeAc?: string
  cfLeIris?: string
  cfLePupil?: string
  cfLeLens?: string
  cfLeTension?: string
  cfLeFundus?: string

  [key: string]: unknown // For dynamic fields
}

const PrescriptionsTab: React.FC = () => {
  // State for prescriptions data
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([])
  const [filteredPrescriptions, setFilteredPrescriptions] = useState<Prescription[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [searchTerm, setSearchTerm] = useState('')
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)
  const [sortField, setSortField] = useState<string>('date')
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('desc')

  // Constants
  const ITEMS_PER_PAGE = 20

  // Refs
  const observer = useRef<IntersectionObserver | null>(null)
  const lastPrescriptionElementRef = useCallback(
    (node: HTMLTableRowElement | null) => {
      if (loading) return
      if (observer.current) observer.current.disconnect()
      observer.current = new IntersectionObserver((entries) => {
        if (entries[0].isIntersecting && hasMore) {
          setPage((prevPage) => prevPage + 1)
        }
      })
      if (node) observer.current.observe(node)
    },
    [loading, hasMore]
  )

  // Load prescriptions on component mount
  useEffect(() => {
    const fetchPrescriptions = async (): Promise<void> => {
      try {
        setLoading(true)
        // Use type assertion for API calls with more specific types
        const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
        const data = await api.getPrescriptions()
        setPrescriptions(data as Prescription[])
        setError('')
      } catch (err) {
        console.error('Error loading prescriptions:', err)
        setError('Failed to load prescriptions')
      } finally {
        setLoading(false)
      }
    }

    fetchPrescriptions()
  }, [])

  // Filter and sort prescriptions when search term or sort criteria changes
  useEffect(() => {
    const filtered = prescriptions.filter((prescription) => {
      const searchLower = searchTerm.toLowerCase()
      return (
        prescription.patientName?.toLowerCase().includes(searchLower) ||
        prescription.patientId?.toLowerCase().includes(searchLower) ||
        prescription.doctorName?.toLowerCase().includes(searchLower)
      )
    })

    // Sort the filtered results
    const sorted = [...filtered].sort((a, b) => {
      const fieldA = a[sortField]?.toString().toLowerCase() || ''
      const fieldB = b[sortField]?.toString().toLowerCase() || ''
      // Special handling for numeric fields
      if (['totalAmount', 'amountReceived', 'amountDue'].includes(sortField)) {
        const numA = parseFloat(fieldA) || 0
        const numB = parseFloat(fieldB) || 0
        return sortDirection === 'asc' ? numA - numB : numB - numA
      }
      // Special handling for date fields
      if (sortField === 'date') {
        const dateA = new Date(fieldA).getTime() || 0
        const dateB = new Date(fieldB).getTime() || 0
        return sortDirection === 'asc' ? dateA - dateB : dateB - dateA
      }
      // Default string comparison
      return sortDirection === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA)
    })

    setFilteredPrescriptions(sorted)
    setHasMore(sorted.length > page * ITEMS_PER_PAGE)
  }, [prescriptions, searchTerm, sortField, sortDirection, page])

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
    setPage(1) // Reset to first page on new search
  }

  // Handle sort column click
  const handleSort = (field: string): void => {
    if (field === sortField) {
      setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')
    } else {
      setSortField(field)
      setSortDirection('desc')
    }
  }

  // Get the current page of prescriptions
  const currentPagePrescriptions = filteredPrescriptions.slice(0, page * ITEMS_PER_PAGE)

  // Render sort indicator
  const renderSortIndicator = (field: string): string | null => {
    if (sortField !== field) return null
    return sortDirection === 'asc' ? ' ↑' : ' ↓'
  }

  // Format currency values for display
  const formatCurrency = (amount: number | string | undefined): string => {
    if (amount === undefined) return '₹0'
    const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount
    if (isNaN(numAmount)) return '-'
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(numAmount)
  }

  return (
    <div className="space-y-4 overflow-x-auto" style={{ maxWidth: '100%', overflowY: 'hidden' }}>
      {/* Search bar and total count */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <div className="relative flex-grow max-w-md">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <svg
              className="h-5 w-5 text-gray-400"
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              aria-hidden="true"
            >
              <path
                fillRule="evenodd"
                d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <input
            type="text"
            placeholder="Search by patient name, ID, or doctor..."
            className="block w-full pl-10 pr-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-1 focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
            value={searchTerm}
            onChange={handleSearchChange}
          />
        </div>
        <div className="text-sm text-gray-600 font-medium">
          Total Prescriptions: {filteredPrescriptions.length}
        </div>
      </div>

      {/* Error message */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <svg
                className="h-5 w-5 text-red-400"
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}

      {/* Prescriptions table */}
      <div className="shadow-md rounded-lg">
        <table className="min-w-full divide-y divide-gray-200" style={{ tableLayout: 'fixed' }}>
          <thead className="bg-gray-50">
            <tr>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('date')}
              >
                Date {renderSortIndicator('date')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('patientId')}
              >
                Patient ID {renderSortIndicator('patientId')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('patientName')}
              >
                Patient Name {renderSortIndicator('patientName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('doctorName')}
              >
                Doctor {renderSortIndicator('doctorName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('totalAmount')}
              >
                Total Amount {renderSortIndicator('totalAmount')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amountReceived')}
              >
                Received {renderSortIndicator('amountReceived')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('amountDue')}
              >
                Due {renderSortIndicator('amountDue')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('modeOfPayment')}
              >
                Payment Mode {renderSortIndicator('modeOfPayment')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('paidFor')}
              >
                Paid For {renderSortIndicator('paidFor')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('discountAmount')}
              >
                Discount {renderSortIndicator('discountAmount')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prescription1')}
              >
                Medicines {renderSortIndicator('prescription1')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('presentComplain')}
              >
                Complain {renderSortIndicator('presentComplain')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('followUpDate')}
              >
                Follow-up {renderSortIndicator('followUpDate')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('temperature')}
              >
                Temp {renderSortIndicator('temperature')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bloodPressure')}
              >
                BP {renderSortIndicator('bloodPressure')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('spo2')}
              >
                SPO2 {renderSortIndicator('spo2')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advisedFor')}
              >
                Advised For {renderSortIndicator('advisedFor')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('grReDSph')}
              >
                GR-RE-D-SPH {renderSortIndicator('grReDSph')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('grLeDSph')}
              >
                GR-LE-D-SPH {renderSortIndicator('grLeDSph')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cfReTension')}
              >
                RE-Tension {renderSortIndicator('cfReTension')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('cfLeTension')}
              >
                LE-Tension {renderSortIndicator('cfLeTension')}
              </th>
              {/* Patient Information */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('guardianName')}
              >
                Guardian {renderSortIndicator('guardianName')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('phoneNumber')}
              >
                Phone {renderSortIndicator('phoneNumber')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('age')}
              >
                Age {renderSortIndicator('age')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('gender')}
              >
                Gender {renderSortIndicator('gender')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('address')}
              >
                Address {renderSortIndicator('address')}
              </th>
              {/* Doctor Information */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('department')}
              >
                Department {renderSortIndicator('department')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('referredBy')}
              >
                Referred By {renderSortIndicator('referredBy')}
              </th>
              {/* Additional Financial Data */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('receiptNumber')}
              >
                Receipt# {renderSortIndicator('receiptNumber')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('discountPercentage')}
              >
                Discount% {renderSortIndicator('discountPercentage')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advancePaid')}
              >
                Advance {renderSortIndicator('advancePaid')}
              </th>
              {/* Additional Medical Information */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('previousHistory')}
              >
                History {renderSortIndicator('previousHistory')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('notes')}
              >
                Notes {renderSortIndicator('notes')}
              </th>
              {/* Additional Prescription Medication Fields */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('days1')}
              >
                Days1 {renderSortIndicator('days1')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timing1')}
              >
                Timing1 {renderSortIndicator('timing1')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prescription2')}
              >
                Med2 {renderSortIndicator('prescription2')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('days2')}
              >
                Days2 {renderSortIndicator('days2')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timing2')}
              >
                Timing2 {renderSortIndicator('timing2')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prescription3')}
              >
                Med3 {renderSortIndicator('prescription3')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('days3')}
              >
                Days3 {renderSortIndicator('days3')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timing3')}
              >
                Timing3 {renderSortIndicator('timing3')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prescription4')}
              >
                Med4 {renderSortIndicator('prescription4')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('days4')}
              >
                Days4 {renderSortIndicator('days4')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timing4')}
              >
                Timing4 {renderSortIndicator('timing4')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('prescription5')}
              >
                Med5 {renderSortIndicator('prescription5')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('days5')}
              >
                Days5 {renderSortIndicator('days5')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('timing5')}
              >
                Timing5 {renderSortIndicator('timing5')}
              </th>
              {/* Advice Fields */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advice1')}
              >
                Advice1 {renderSortIndicator('advice1')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advice2')}
              >
                Advice2 {renderSortIndicator('advice2')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advice3')}
              >
                Advice3 {renderSortIndicator('advice3')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advice4')}
              >
                Advice4 {renderSortIndicator('advice4')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('advice5')}
              >
                Advice5 {renderSortIndicator('advice5')}
              </th>
              {/* Additional Basic Readings */}
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('pulseRate')}
              >
                Pulse {renderSortIndicator('pulseRate')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('weight')}
              >
                Weight {renderSortIndicator('weight')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('height')}
              >
                Height {renderSortIndicator('height')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bmi')}
              >
                BMI {renderSortIndicator('bmi')}
              </th>
              <th
                scope="col"
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                onClick={() => handleSort('bloodSugar')}
              >
                Blood Sugar {renderSortIndicator('bloodSugar')}
              </th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {currentPagePrescriptions.length > 0 ? (
              currentPagePrescriptions.map((prescription, index) => (
                <tr
                  key={prescription.id}
                  ref={
                    index === currentPagePrescriptions.length - 1
                      ? lastPrescriptionElementRef
                      : null
                  }
                  className="hover:bg-gray-50"
                >
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {new Date(prescription.date).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                    {prescription.patientId}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                    {prescription.patientName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.doctorName}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {formatCurrency(prescription.totalAmount)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-green-600 font-medium">
                    {formatCurrency(prescription.amountReceived)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-red-600 font-medium">
                    {formatCurrency(prescription.amountDue)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.modeOfPayment || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.paidFor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.discountAmount
                      ? formatCurrency(prescription.discountAmount)
                      : '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {[
                      prescription.prescription1,
                      prescription.prescription2,
                      prescription.prescription3
                    ]
                      .filter(Boolean)
                      .join(', ') || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.presentComplain || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.followUpDate
                      ? new Date(prescription.followUpDate).toLocaleDateString()
                      : '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.temperature || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.bloodPressure || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.spo2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.advisedFor || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.grReDSph || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.grLeDSph || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.cfReTension || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.cfLeTension || '-'}
                  </td>
                  {/* Patient Information */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.guardianName || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.phoneNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.age || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.gender || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.address || '-'}
                  </td>
                  {/* Doctor Information */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.department || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.referredBy || '-'}
                  </td>
                  {/* Additional Financial Data */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.receiptNumber || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.discountPercentage || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.advancePaid ? formatCurrency(prescription.advancePaid) : '-'}
                  </td>
                  {/* Additional Medical Information */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.previousHistory || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.notes || '-'}
                  </td>
                  {/* Additional Prescription Medication Fields */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.days1 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.timing1 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.prescription2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.days2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.timing2 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.prescription3 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.days3 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.timing3 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.prescription4 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.days4 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.timing4 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.prescription5 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.days5 || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.timing5 || '-'}
                  </td>
                  {/* Advice Fields */}
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.advice1 || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.advice2 || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.advice3 || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.advice4 || '-'}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500 max-w-xs truncate">
                    {prescription.advice5 || '-'}
                  </td>
                  {/* Additional Basic Readings */}
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.pulseRate || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.weight || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.height || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.bmi || '-'}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                    {prescription.bloodSugar || '-'}
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan={20} className="px-6 py-4 text-center text-sm text-gray-500">
                  {loading ? (
                    <div className="flex justify-center items-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-indigo-500"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      <span>Loading prescriptions...</span>
                    </div>
                  ) : (
                    'No prescriptions found. Try a different search term.'
                  )}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Loading indicator at bottom */}
      {loading && hasMore && (
        <div className="flex justify-center py-4">
          <svg
            className="animate-spin h-5 w-5 text-indigo-500"
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            ></circle>
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
            ></path>
          </svg>
        </div>
      )}
    </div>
  )
}

export default PrescriptionsTab
