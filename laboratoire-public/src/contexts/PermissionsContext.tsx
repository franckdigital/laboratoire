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

  const readCachedPermissions = () => {
    try {
      const raw = localStorage.getItem('lanema_permissions')
      const parsed = raw ? JSON.parse(raw) : null
      return Array.isArray(parsed) ? parsed : []
    } catch {
      return []
    }
  }

  const fetchPermissions = async (background: boolean = false) => {
    if (!isAuthenticated || !user) {
      setPermissions([])
      setIsLoading(false)
      return
    }

    if (!background) {
      setIsLoading(true)
    }

    try {
      const token = localStorage.getItem('lanema_token')
      const response = await fetch(
        `${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/clients/user/permissions/`,
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

        setPermissions(permissionCodes)
        try {
          localStorage.setItem('lanema_permissions', JSON.stringify(permissionCodes))
        } catch {
          // ignore
        }
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
      const cached = readCachedPermissions()
      if (cached.length > 0) {
        setPermissions(cached)
        setIsLoading(false)
        fetchPermissions(true)
      } else {
        fetchPermissions(false)
      }
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
