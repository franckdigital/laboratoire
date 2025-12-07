import type { ReactNode } from 'react'
import { usePermissions } from '../contexts/PermissionsContext'
import { useAuth } from '../contexts/AuthContext'

interface PermissionGuardProps {
  children: ReactNode
  permission: string
  fallback?: ReactNode
}

export function PermissionGuard({ children, permission, fallback }: PermissionGuardProps) {
  const { hasPermission, isLoading } = usePermissions()
  const { user } = useAuth()

  // Pendant le chargement des permissions
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-slate-600">Chargement...</div>
      </div>
    )
  }

  // Vérifier la permission
  if (!hasPermission(permission)) {
    if (fallback) {
      return <>{fallback}</>
    }
    
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <div className="text-center">
          <div className="text-6xl mb-4">🔒</div>
          <h2 className="text-2xl font-bold text-slate-800 mb-2">Accès refusé</h2>
          <p className="text-slate-600 mb-4">
            Vous n'avez pas les permissions nécessaires pour accéder à cette page.
          </p>
          <p className="text-sm text-slate-500">
            Permission requise: <code className="bg-slate-100 px-2 py-1 rounded">{permission}</code>
          </p>
          <p className="text-sm text-slate-500 mt-2">
            Rôle actuel: <span className="font-medium">{user?.role}</span>
          </p>
        </div>
      </div>
    )
  }

  return <>{children}</>
}
