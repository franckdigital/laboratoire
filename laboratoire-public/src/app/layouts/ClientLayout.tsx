import { Link, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'

export function ClientLayout() {
  const location = useLocation()
  const { user, logout } = useAuth()

  const isActive = (path: string) => location.pathname === path

  const menuItems = [
    { path: '/client', label: 'Tableau de bord', icon: '📊' },
    { path: '/client/demandes', label: 'Mes demandes', icon: '📋' },
    { path: '/client/echantillons', label: 'Mes échantillons', icon: '🧪' },
    { path: '/client/resultats', label: 'Mes résultats', icon: '📄' },
    { path: '/client/factures', label: 'Mes factures', icon: '💰' },
  ]

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link to="/client" className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-lg bg-lanema-blue-600 flex items-center justify-center">
                <span className="text-xl font-bold text-white">L</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">LANEMA</div>
                <div className="text-xs text-slate-500">Espace client</div>
              </div>
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <button className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
              </button>

              <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
                <div className="text-right">
                  <div className="text-sm font-medium text-slate-900">{user?.raison_sociale}</div>
                  <div className="text-xs text-slate-500">Client {user?.type}</div>
                </div>
                <div className="w-9 h-9 rounded-full bg-lanema-blue-100 flex items-center justify-center">
                  <span className="text-sm font-semibold text-lanema-blue-600">{user?.raison_sociale?.[0]}</span>
                </div>
              </div>

              <button 
                onClick={logout}
                className="p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                title="Se déconnecter"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                </svg>
              </button>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Navigation tabs */}
        <nav className="mb-8">
          <div className="border-b border-slate-200">
            <div className="flex gap-6">
              {menuItems.map((item) => (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2 px-4 py-3 border-b-2 text-sm font-medium transition ${
                    isActive(item.path)
                      ? 'border-lanema-blue-600 text-lanema-blue-600'
                      : 'border-transparent text-slate-600 hover:text-slate-900 hover:border-slate-300'
                  }`}
                >
                  <span>{item.icon}</span>
                  {item.label}
                </Link>
              ))}
            </div>
          </div>
        </nav>

        {/* Content */}
        <Outlet />
      </div>
    </div>
  )
}
