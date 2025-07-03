import React from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js'
import { Line, Bar, Pie } from 'react-chartjs-2'

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
)

// Define interfaces for the data structure
interface PatientStats {
  total: number
  new: number
  followUp: number
  average: number
  change: number
  averageChange: number
}

interface ReceiptStats {
  total: number
  change: number
  prescriptions: number
}

interface RevenueStats {
  total: number
  change: number
}

interface MedicineStats {
  dispensed: number
  topItems: {
    name: string
    quantity: number
    revenue: number
    percentage: number
  }[]
}

interface OpticalStats {
  sold: number
  topItems: {
    name: string
    quantity: number
    revenue: number
    percentage: number
    type: string
  }[]
}

interface EyeConditionStats {
  conditions: {
    name: string
    count: number
  }[]
}

interface PatientTreatmentStats {
  labels: string[]
  inflow: number[]
  treatments: number[]
  operations: number
}

interface AnalyticsData {
  patientStats: PatientStats
  receiptStats: ReceiptStats
  revenueStats: RevenueStats
  medicineStats: MedicineStats
  opticalStats: OpticalStats
  eyeConditionStats: EyeConditionStats
  patientTreatmentStats: PatientTreatmentStats
  timeSeriesData?: {
    labels: string[]
    patients: number[]
    revenue: number[]
    medicines: number[]
    opticals: number[]
  }
}

interface OverviewDashboardProps {
  data: AnalyticsData | null
  timeFilter: 'today' | 'week' | 'month' | 'custom'
}

interface StatCardProps {
  title: string
  value: string | number
  change: number
  icon: React.ReactNode
  color: string
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, color }) => {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
      <div className="flex justify-between items-start">
        <div>
          <p className="text-sm font-medium text-gray-500">{title}</p>
          <h3 className="text-2xl font-semibold mt-1 text-gray-800">{value}</h3>
          <div
            className={`flex items-center mt-2 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
          >
            {change >= 0 ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z"
                  clipRule="evenodd"
                />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M12 13a1 1 0 100 2h5a1 1 0 001-1v-5a1 1 0 10-2 0v2.586l-4.293-4.293a1 1 0 00-1.414 0L8 9.586l-4.293-4.293a1 1 0 00-1.414 1.414l5 5a1 1 0 001.414 0L11 9.414 14.586 13H12z"
                  clipRule="evenodd"
                />
              </svg>
            )}
            <span className="text-xs font-medium ml-1">
              {Math.abs(change)}% from previous period
            </span>
          </div>
        </div>
        <div className={`p-3 rounded-full ${color}`}>{icon}</div>
      </div>
    </div>
  )
}

const OverviewDashboard: React.FC<OverviewDashboardProps> = ({ data, timeFilter }) => {
  // If data is not available yet, show placeholder
  if (!data) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {[...Array(4)].map((_, i) => (
          <div
            key={i}
            className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse"
          >
            <div className="flex justify-between items-start">
              <div className="w-3/4">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-3"></div>
                <div className="h-8 bg-gray-200 rounded w-1/2 mb-3"></div>
                <div className="h-4 bg-gray-200 rounded w-1/4"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
        <div className="col-span-1 md:col-span-2 lg:col-span-4 bg-white rounded-xl shadow-sm border border-gray-100 p-6 animate-pulse h-80">
          <div className="h-6 bg-gray-200 rounded w-1/4 mb-6"></div>
          <div className="h-64 bg-gray-200 rounded w-full"></div>
        </div>
      </div>
    )
  }

  // Extract data for the overview dashboard
  const {
    patientStats,
    receiptStats,
    revenueStats,
    medicineStats,
    opticalStats,
    eyeConditionStats,
    patientTreatmentStats
  } = data as AnalyticsData

  // Format currency
  const formatCurrency = (amount: number): string => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Patient inflow vs treatment data for line chart
  const patientInflowData = {
    labels: patientTreatmentStats.labels,
    datasets: [
      {
        label: 'Patient Inflow',
        data: patientTreatmentStats.inflow,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.1)',
        fill: true,
        tension: 0.4
      },
      {
        label: 'Treatments Given',
        data: patientTreatmentStats.treatments,
        borderColor: 'rgb(16, 185, 129)',
        backgroundColor: 'rgba(16, 185, 129, 0.1)',
        fill: true,
        tension: 0.4
      }
    ]
  }

  // Top medicines data for bar chart
  const topMedicinesData = {
    labels: medicineStats?.topItems?.map((item) => item.name),
    datasets: [
      {
        label: 'Units Dispensed',
        data: medicineStats?.topItems?.map((item) => item.quantity),
        backgroundColor: 'rgba(99, 102, 241, 0.7)',
        borderRadius: 4
      }
    ]
  }

  // Top optical items data for bar chart
  const topOpticalsData = {
    labels: opticalStats?.topItems?.map((item) => item.name),
    datasets: [
      {
        label: 'Units Sold',
        data: opticalStats?.topItems?.map((item) => item.quantity),
        backgroundColor: 'rgba(244, 63, 94, 0.7)',
        borderRadius: 4
      }
    ]
  }

  // Common eye conditions data for pie chart
  const eyeConditionsData = {
    labels: eyeConditionStats?.conditions?.map((item) => item.name),
    datasets: [
      {
        data: eyeConditionStats?.conditions?.map((item) => item.count),
        backgroundColor: [
          'rgba(59, 130, 246, 0.7)',
          'rgba(16, 185, 129, 0.7)',
          'rgba(244, 63, 94, 0.7)',
          'rgba(249, 115, 22, 0.7)',
          'rgba(139, 92, 246, 0.7)',
          'rgba(236, 72, 153, 0.7)'
        ],
        borderWidth: 1
      }
    ]
  }

  // Chart options
  const lineChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      },
      title: {
        display: true,
        text: 'Patient Inflow vs Treatment Given'
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const barChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top' as const
      }
    },
    scales: {
      y: {
        beginAtZero: true
      }
    }
  }

  const pieChartOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'right' as const
      },
      title: {
        display: true,
        text: 'Common Eye Conditions'
      }
    }
  }

  return (
    <div>
      {/* Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          title="Total Patients"
          value={patientStats?.total}
          change={patientStats?.change}
          color="bg-blue-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-blue-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Receipts"
          value={receiptStats?.total}
          change={receiptStats?.change}
          color="bg-green-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-green-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
              />
            </svg>
          }
        />
        <StatCard
          title="Total Revenue"
          value={formatCurrency(revenueStats?.total)}
          change={revenueStats?.change}
          color="bg-purple-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-purple-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
          }
        />
        <StatCard
          title="Avg. Daily Patients"
          value={patientStats?.average}
          change={patientStats?.averageChange}
          color="bg-pink-100"
          icon={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-6 w-6 text-pink-600"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
          }
        />
      </div>

      {/* Patient Inflow vs Treatment Chart */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Patient Inflow vs Treatment Given
        </h3>
        <div className="h-80">
          <Line options={lineChartOptions} data={patientInflowData} />
        </div>
      </div>

      {/* Top Items and Eye Conditions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Top Medicines */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Medicines</h3>
          <div className="h-64">
            <Bar options={barChartOptions} data={topMedicinesData} />
          </div>
        </div>

        {/* Top Optical Items */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Top Optical Items</h3>
          <div className="h-64">
            <Bar options={barChartOptions} data={topOpticalsData} />
          </div>
        </div>

        {/* Common Eye Conditions */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
          <h3 className="text-lg font-medium text-gray-800 mb-4">Common Eye Conditions</h3>
          <div className="h-64">
            <Pie options={pieChartOptions} data={eyeConditionsData} />
          </div>
        </div>
      </div>

      {/* Time Period Summary */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
        <h3 className="text-lg font-medium text-gray-800 mb-4">
          Summary for{' '}
          {timeFilter === 'today'
            ? 'Today'
            : timeFilter === 'week'
              ? 'This Week'
              : timeFilter === 'month'
                ? 'This Month'
                : 'Custom Period'}
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <div className="border-l-4 border-blue-500 pl-4 py-2">
            <p className="text-sm text-gray-500">New Patients</p>
            <p className="text-xl font-semibold">{patientStats?.new}</p>
          </div>
          <div className="border-l-4 border-green-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Follow-up Visits</p>
            <p className="text-xl font-semibold">{patientStats?.followUp}</p>
          </div>
          <div className="border-l-4 border-purple-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Prescriptions Issued</p>
            <p className="text-xl font-semibold">{receiptStats?.prescriptions}</p>
          </div>
          <div className="border-l-4 border-pink-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Medicines Dispensed</p>
            <p className="text-xl font-semibold">{medicineStats?.dispensed}</p>
          </div>
          <div className="border-l-4 border-yellow-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Optical Items Sold</p>
            <p className="text-xl font-semibold">{opticalStats?.sold}</p>
          </div>
          <div className="border-l-4 border-indigo-500 pl-4 py-2">
            <p className="text-sm text-gray-500">Operations Performed</p>
            <p className="text-xl font-semibold">{patientTreatmentStats?.operations}</p>
          </div>
        </div>
      </div>
    </div>
  )
}

export default OverviewDashboard
