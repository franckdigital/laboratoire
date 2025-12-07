import { Navigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'

/**
 * Composant qui redirige vers le bon dashboard selon le rôle
 */
export function RoleRedirect() {
  const { isAuthenticated, user, isLoading } = useAuth()

  // Afficher un loader pendant le chargement
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

  // Si pas authentifié, rediriger vers login
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />
  }

  // Rediriger selon le rôle
  const role = user?.role

  switch (role) {
    case 'CLIENT':
      return <Navigate to="/client" replace />
    
    case 'ADMIN':
    case 'RESPONSABLE_LABO':
    case 'TECHNICIEN':
    case 'RESPONSABLE_METROLOGIE':
    case 'COMPTABLE':
    case 'GESTIONNAIRE_STOCK':
    case 'SUPPORT':
      return <Navigate to="/app" replace />
    
    default:
      // Si rôle inconnu, rediriger vers login
      return <Navigate to="/login" replace />
  }
}
