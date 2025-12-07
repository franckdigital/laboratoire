import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

interface ProtectedRouteProps {
  children: React.ReactNode
  requiredRole?: 'CLIENT' | 'ADMIN' | 'STAFF' | 'TECHNICIEN' | 'RESPONSABLE'
}

// Rôles considérés comme "staff" ayant accès au dashboard admin
const STAFF_ROLES = [
  'ADMIN',
  'RESPONSABLE_LABO',
  'TECHNICIEN',
  'RESPONSABLE_METROLOGIE',
  'COMPTABLE',
  'GESTIONNAIRE_STOCK',
  'SUPPORT'
]

export function ProtectedRoute({ children, requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-lanema-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-slate-600">Chargement...</p>
        </div>
      </div>
    )
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Vérification des permissions
  if (requiredRole) {
    const userRole = user?.role
    
    // Si requiredRole est 'STAFF', vérifier que l'utilisateur est dans STAFF_ROLES
    if (requiredRole === 'STAFF') {
      if (!STAFF_ROLES.includes(userRole || '')) {
        return <Navigate to="/unauthorized" replace />
      }
    }
    // Sinon, vérifier le rôle exact (sauf ADMIN qui a accès à tout)
    else if (userRole !== requiredRole && userRole !== 'ADMIN') {
      return <Navigate to="/unauthorized" replace />
    }
  }

  return <>{children}</>
}
