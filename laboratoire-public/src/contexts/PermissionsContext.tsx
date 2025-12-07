import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { useAuth } from './AuthContext'

interface PermissionsContextType {
  permissions: string[]
  hasPermission: (permissionCode: string) => boolean
  isLoading: boolean
  refreshPermissions: () => Promise<void>
}

const PermissionsContext = createContext<PermissionsContextType | undefined>(undefined)

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const { user, isAuthenticated } = useAuth()
  const [permissions, setPermissions] = useState<string[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const fetchPermissions = async () => {
    if (!isAuthenticated || !user) {
      setPermissions([])
      setIsLoading(false)
      return
    }

    try {
      const token = localStorage.getItem('lanema_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/user/permissions/`,
        {
          headers: {
            'Authorization': `Bearer ${token}`,
          }
        }
      )

      if (response.ok) {
        const data = await response.json()
        // Gérer la réponse paginée de DRF (results) ou tableau direct
        const permissionsList = Array.isArray(data) ? data : (data.results || [])
        
        // Extraire les codes de permissions accordées
        const permissionCodes = permissionsList
          .filter((rp: any) => rp.is_granted)
          .map((rp: any) => rp.permission_code)
        
        console.log('[PermissionsContext] Permissions chargées:', permissionCodes)
        setPermissions(permissionCodes)
      } else {
        console.error('Failed to fetch permissions')
        setPermissions([])
      }
    } catch (error) {
      console.error('Error fetching permissions:', error)
      setPermissions([])
    } finally {
      setIsLoading(false)
    }
  }

  useEffect(() => {
    if (isAuthenticated && user) {
      fetchPermissions()
    } else {
      setPermissions([])
      setIsLoading(false)
    }
  }, [isAuthenticated, user])

  const hasPermission = (permissionCode: string): boolean => {
    // Les admins ont toutes les permissions
    if (user?.role === 'ADMIN') {
      return true
    }
    return permissions.includes(permissionCode)
  }

  const refreshPermissions = async () => {
    setIsLoading(true)
    await fetchPermissions()
  }

  return (
    <PermissionsContext.Provider 
      value={{ 
        permissions, 
        hasPermission, 
        isLoading,
        refreshPermissions 
      }}
    >
      {children}
    </PermissionsContext.Provider>
  )
}

export function usePermissions() {
  const context = useContext(PermissionsContext)
  if (context === undefined) {
    throw new Error('usePermissions must be used within a PermissionsProvider')
  }
  return context
}
