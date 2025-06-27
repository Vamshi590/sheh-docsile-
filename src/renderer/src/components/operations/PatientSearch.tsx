import React, { useState } from 'react'

// Define the Patient type
type Patient = {
  id: string
  name: string
  guardianName?: string
  phone?: string
  age?: string | number
  gender?: string
  address?: string
  [key: string]: unknown
}

// Type for the API interface
type ApiInterface = {
  searchPatients: (searchTerm: string) => Promise<Patient[]>
}

interface PatientSearchProps {
  onPatientSelect: (patient: Patient) => void
}

const PatientSearch: React.FC<PatientSearchProps> = ({ onPatientSelect }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [searchResults, setSearchResults] = useState<Patient[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Handle search input change
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>): void => {
    setSearchTerm(e.target.value)
  }

  // Handle search submission
  const handleSearch = async (e: React.FormEvent): Promise<void> => {
    e.preventDefault()

    if (!searchTerm.trim()) {
      setError('Please enter a search term')
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      // Call the API to search for patients
      // Use type assertion for the API call
      const api = window.api as unknown as ApiInterface
      const patients = await api.searchPatients(searchTerm)
      setSearchResults(patients)

      if (patients.length === 0) {
        setError('No patients found')
      }
    } catch (error) {
      console.error('Error searching patients:', error)
      setError('Failed to search patients')
    } finally {
      setIsLoading(false)
    }
  }

  // Handle patient selection
  const handlePatientSelect = (patient: Patient): void => {
    onPatientSelect(patient)
    // Clear search results after selection
    setSearchResults([])
    setSearchTerm('')
  }

  return (
    <div className="bg-white p-6 rounded-lg shadow-sm">
      <h2 className="text-lg font-medium mb-4">Search Patient</h2>

      <form onSubmit={handleSearch} className="mb-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={searchTerm}
            onChange={handleSearchChange}
            placeholder="Search by name, phone, or ID"
            className="flex-1 px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={isLoading}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-blue-400"
          >
            {isLoading ? 'Searching...' : 'Search'}
          </button>
        </div>
      </form>

      {error && <p className="text-red-500 mb-4">{error}</p>}

      {searchResults.length > 0 && (
        <div>
          <h3 className="text-md font-medium mb-2">Search Results</h3>
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-md">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Name
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Phone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Age/Gender
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Action
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {searchResults.map((patient) => (
                  <tr key={patient.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{patient.name}</div>
                      {patient.guardianName && (
                        <div className="text-xs text-gray-500">
                          Guardian: {String(patient.guardianName)}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String(patient.phone || 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {String(patient.age || 'N/A')} / {String(patient.gender || 'N/A')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => handlePatientSelect(patient)}
                        className="text-blue-600 hover:text-blue-900 focus:outline-none"
                      >
                        Select
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}

export default PatientSearch
