import { useEffect, useState } from 'react'
import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import Patients from './pages/Patients'
import Prescriptions from './pages/Prescriptions'

function App(): React.JSX.Element {
  const [route, setRoute] = useState<string>('/login')

  // Simple hash-based routing
  useEffect(() => {
    const handleHashChange = (): void => {
      const hash = window.location.hash.replace('#', '') || '/login'
      setRoute(hash)
    }

    // Set initial route
    handleHashChange()

    // Listen for hash changes
    window.addEventListener('hashchange', handleHashChange)

    return () => {
      window.removeEventListener('hashchange', handleHashChange)
    }
  }, [])

  // Render the appropriate component based on the route
  const renderRoute = (): React.JSX.Element => {
    switch (route) {
      case '/login':
        return <Login />
      case '/dashboard':
        return <Dashboard />
      case '/patients':
        return <Patients />
      case '/prescriptions':
        return <Prescriptions />
      default:
        return <Login />
    }
  }

  return <div className="font-sans">{renderRoute()}</div>
}

export default App
