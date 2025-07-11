import React, { useState, useEffect } from 'react'
import StaffList from '../components/staff/StaffList'
import AddStaffForm from '../components/staff/AddStaffForm'
import { StaffUser } from '../types/staff'

const Staff = (): React.JSX.Element => {
  const [staffList, setStaffList] = useState<StaffUser[]>([])
  const [isLoading, setIsLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [showAddForm, setShowAddForm] = useState<boolean>(false)
  const [editingStaff, setEditingStaff] = useState<StaffUser | null>(null)
  const [currentUser, setCurrentUser] = useState<Omit<StaffUser, 'passwordHash'> | null>(null)

  useEffect(() => {
    // Check if user has admin permissions
    const user = localStorage.getItem('currentUser')
    if (user) {
      try {
        const parsedUser = JSON.parse(user)
        setCurrentUser(parsedUser)

        // Redirect if not admin
        if (!parsedUser.permissions.staff) {
          window.location.hash = '/dashboard'
          return
        }
      } catch (err) {
        console.error('Error parsing user data:', err)
      }
    } else {
      // No user found, redirect to login
      window.location.hash = '/login'
      return
    }

    loadStaffList()
  }, [])

  const loadStaffList = async (): Promise<void> => {
    setIsLoading(true)
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const staff = (await api.getStaffList()) as StaffUser[]
      setStaffList(staff)
      setError(null)
    } catch (err) {
      setError('Failed to load staff list')
      console.error(err)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddStaff = async (staffData: StaffUser | Partial<StaffUser>): Promise<void> => {
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.addStaff(staffData)
      loadStaffList() // Reload the list
      setShowAddForm(false)
    } catch (err) {
      setError('Failed to add staff member')
      console.error(err)
    }
  }

  const handleUpdateStaff = async (id: string, staffData: Partial<StaffUser>): Promise<void> => {
    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.updateStaff(id, staffData)
      loadStaffList() // Reload the list
      setEditingStaff(null)
    } catch (err) {
      setError('Failed to update staff member')
      console.error(err)
    }
  }

  const handleDeleteStaff = async (id: string): Promise<void> => {
    if (!confirm('Are you sure you want to delete this staff member?')) {
      return
    }

    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      await api.deleteStaff(id)
      loadStaffList() // Reload the list
    } catch (err) {
      setError('Failed to delete staff member')
      console.error(err)
    }
  }

  const handleResetPassword = async (id: string): Promise<void> => {
    if (!confirm("Are you sure you want to reset this user's password?")) {
      return
    }

    try {
      // Use type assertion to fix TypeScript error
      const api = window.api as Record<string, (...args: unknown[]) => Promise<unknown>>
      const newPassword = (await api.resetStaffPassword(id)) as string
      alert(
        `Password has been reset to: ${newPassword}\n\nPlease share this with the user and ask them to change it on first login.`
      )
    } catch (err) {
      setError('Failed to reset password')
      console.error(err)
    }
  }

  const startEditing = (staff: StaffUser): void => {
    setEditingStaff(staff)
    setShowAddForm(true)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Staff Management</h1>
        {!showAddForm && (
          <button
            onClick={() => setShowAddForm(true)}
            className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 mr-2"
              viewBox="0 0 20 20"
              fill="currentColor"
            >
              <path
                fillRule="evenodd"
                d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                clipRule="evenodd"
              />
            </svg>
            Add New Staff
          </button>
        )}
      </div>

      {error && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md">
          {error}
        </div>
      )}

      {showAddForm ? (
        <AddStaffForm
          onSubmit={
            editingStaff ? (data) => handleUpdateStaff(editingStaff.id, data) : handleAddStaff
          }
          onCancel={() => {
            setShowAddForm(false)
            setEditingStaff(null)
          }}
          initialData={editingStaff}
          isEditing={!!editingStaff}
        />
      ) : (
        <StaffList
          staffList={staffList}
          isLoading={isLoading}
          onEdit={startEditing}
          onDelete={handleDeleteStaff}
          onResetPassword={handleResetPassword}
          currentUser={currentUser}
        />
      )}
    </div>
  )
}

export default Staff
