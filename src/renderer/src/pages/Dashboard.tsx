import React from 'react'

const Dashboard = (): React.JSX.Element => {
  const navigateTo = (path: string): void => {
    window.location.hash = path
  }

  const handleLogout = (): void => {
    // Handle logout logic here
    window.location.hash = '/'
  }

  return (
    <div className="flex flex-col min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-md sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center">
            <div>
              <h1 className="text-2xl font-bold text-indigo-700">Sri Harshini Eye Hospital</h1>
              <p className="text-sm text-gray-500">Healthcare Management System</p>
            </div>
            <button
              onClick={handleLogout}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-md transition-colors flex items-center space-x-1 shadow-sm"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-5 w-5"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M3 3a1 1 0 00-1 1v12a1 1 0 001 1h12a1 1 0 001-1V4a1 1 0 00-1-1H3zm7 4a1 1 0 10-2 0v4a1 1 0 102 0V7zm1 4a1 1 0 102 0v-3a1 1 0 10-2 0v3z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Logout</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-grow max-w-7xl w-full mx-auto px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-10 bg-white p-6 rounded-xl shadow-sm border border-gray-100">
          <h2 className="text-2xl font-semibold text-gray-800 mb-2">Welcome to Dashboard</h2>
          <p className="text-gray-600">Manage your hospital operations efficiently</p>
        </div>

        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {/* Patients Card */}
          <div
            onClick={() => navigateTo('/patients')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Manage Patients</h3>
            </div>
            <p className="text-gray-600 ml-16">Add, edit, and manage patient records</p>
          </div>

          {/* Prescriptions Card */}
          <div
            onClick={() => navigateTo('/prescriptions')}
            className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 hover:shadow-md cursor-pointer transition-all transform hover:-translate-y-1 hover:border-indigo-100"
          >
            <div className="flex items-center mb-4">
              <div className="bg-indigo-100 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-indigo-600"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M5 4a3 3 0 00-3 3v6a3 3 0 003 3h10a3 3 0 003-3V7a3 3 0 00-3-3H5zm0 2a1 1 0 00-1 1v6a1 1 0 001 1h10a1 1 0 001-1V7a1 1 0 00-1-1H5z"
                    clipRule="evenodd"
                  />
                  <path d="M7 9a1 1 0 011-1h4a1 1 0 110 2H8a1 1 0 01-1-1z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Prescriptions</h3>
            </div>
            <p className="text-gray-600 ml-16">Manage prescriptions and receipts</p>
          </div>

          {/* Appointments Card - Disabled */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 opacity-70 cursor-not-allowed">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Appointments</h3>
            </div>
            <p className="text-gray-600 ml-16">Schedule and manage appointments (Coming soon)</p>
          </div>

          {/* Reports Card - Disabled */}
          <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 opacity-70 cursor-not-allowed">
            <div className="flex items-center mb-4">
              <div className="bg-gray-100 p-3 rounded-full mr-4">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-gray-400"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <path
                    fillRule="evenodd"
                    d="M6 2a2 2 0 00-2 2v12a2 2 0 002 2h8a2 2 0 002-2V7.414A2 2 0 0015.414 6L12 2.586A2 2 0 0010.586 2H6zm2 10a1 1 0 10-2 0v3a1 1 0 102 0v-3zm4-1a1 1 0 011 1v3a1 1 0 11-2 0v-3a1 1 0 011-1zm-2-2a1 1 0 10-2 0v5a1 1 0 102 0V9z"
                    clipRule="evenodd"
                  />
                </svg>
              </div>
              <h3 className="text-xl font-semibold text-gray-900">Reports</h3>
            </div>
            <p className="text-gray-600 ml-16">Generate and view reports (Coming soon)</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-auto py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <p className="text-sm text-gray-500 text-center">
            &copy; {new Date().getFullYear()} Copyrights of Docsile. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

export default Dashboard
