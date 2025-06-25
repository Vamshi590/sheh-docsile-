import React from 'react'

const Sidebar: React.FC = () => {
  const navigateTo = (path: string): void => {
    window.location.hash = path
  }

  return (
    <div className="w-64 bg-indigo-800 text-white p-4 flex flex-col h-full">
      <div className="mb-8">
        <h2 className="text-xl font-bold">Sri Harshini Eye Hospital</h2>
        <p className="text-sm text-indigo-200">Healthcare Management</p>
      </div>
      
      <nav className="flex-1">
        <ul className="space-y-2">
          <li>
            <button 
              onClick={() => navigateTo('/dashboard')}
              className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-3">🏠</span> Dashboard
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo('/patients')}
              className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-3">👤</span> Patients
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo('/operations')}
              className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center bg-indigo-700"
            >
              <span className="mr-3">🔧</span> Operations
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo('/prescriptions')}
              className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-3">📝</span> Prescriptions
            </button>
          </li>
          <li>
            <button 
              onClick={() => navigateTo('/reports')}
              className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
            >
              <span className="mr-3">📊</span> Reports
            </button>
          </li>
        </ul>
      </nav>
      
      <div className="mt-auto pt-4 border-t border-indigo-700">
        <button 
          onClick={() => navigateTo('/login')}
          className="w-full text-left py-2 px-4 rounded hover:bg-indigo-700 transition-colors flex items-center"
        >
          <span className="mr-3">🚪</span> Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
