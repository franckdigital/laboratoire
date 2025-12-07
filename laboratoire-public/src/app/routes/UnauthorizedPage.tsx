import { Link } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function UnauthorizedPage() {
  const { user, logout } = useAuth()

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 text-center">
        {/* Icon */}
        <div className="w-20 h-20 bg-rose-100 rounded-full flex items-center justify-center mx-auto mb-6">
          <svg 
            className="w-10 h-10 text-rose-600" 
            fill="none" 
            viewBox="0 0 24 24" 
            stroke="currentColor"
          >
            <path 
              strokeLinecap="round" 
              strokeLinejoin="round" 
              strokeWidth={2} 
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" 
            />
          </svg>
        </div>

        {/* Titre */}
        <h1 className="text-2xl font-bold text-slate-900 mb-2">
          Accès non autorisé
        </h1>

        {/* Message */}
        <p className="text-slate-600 mb-6">
          Désolé, vous n'avez pas les permissions nécessaires pour accéder à cette page.
        </p>

        {/* Info utilisateur */}
        {user && (
          <div className="bg-slate-50 rounded-lg p-4 mb-6 text-left">
            <div className="text-xs text-slate-500 mb-1">Connecté en tant que</div>
            <div className="text-sm font-semibold text-slate-900">{user.email}</div>
            <div className="text-xs text-slate-600 mt-1">
              Rôle: <span className="font-medium">{getRoleLabel(user.role)}</span>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3">
          <Link
            to="/dashboard"
            className="block w-full px-4 py-3 bg-lanema-blue-600 text-white font-semibold rounded-lg hover:bg-lanema-blue-700 transition shadow-md"
          >
            Retour au tableau de bord
          </Link>
          
          <button
            onClick={() => {
              logout()
              window.location.href = '/login'
            }}
            className="block w-full px-4 py-3 bg-slate-100 text-slate-700 font-semibold rounded-lg hover:bg-slate-200 transition"
          >
            Se déconnecter
          </button>
        </div>

        {/* Contact support */}
        <div className="mt-6 pt-6 border-t border-slate-200">
          <p className="text-xs text-slate-500">
            Si vous pensez qu'il s'agit d'une erreur, contactez l'administrateur système.
          </p>
        </div>
      </div>
    </div>
  )
}

function getRoleLabel(role: string): string {
  const roles: Record<string, string> = {
    'ADMIN': 'Administrateur système',
    'RESPONSABLE_LABO': 'Responsable laboratoire',
    'TECHNICIEN': 'Technicien analyste',
    'RESPONSABLE_METROLOGIE': 'Responsable métrologie',
    'CLIENT': 'Client externe',
    'COMPTABLE': 'Comptable/Facturation',
    'GESTIONNAIRE_STOCK': 'Gestionnaire stock',
    'SUPPORT': 'Support technique',
  }
  return roles[role] || role
}
