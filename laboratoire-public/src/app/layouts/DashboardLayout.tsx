import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../contexts/PermissionsContext'
import { useState } from 'react'

const modules = [
  { path: '/app', label: 'Tableau de bord', permission: 'dashboard.view' },
  { path: '/app/clients', label: 'Clients', permission: 'clients.view' },
  { path: '/app/echantillons', label: 'Échantillons', permission: 'echantillons.view' },
  { path: '/app/essais', label: 'Essais', permission: 'essais.view' },
  { path: '/app/metrologie', label: 'Métrologie', permission: 'metrologie.view' },
  { path: '/app/facturation', label: 'Facturation', permission: 'facturation.view' },
  { path: '/app/qualite', label: 'Qualité', permission: 'qualite.view' },
  { path: '/app/reporting', label: 'Reporting', permission: 'reporting.view' },
  { path: '/app/notifications', label: 'Notifications', permission: 'notifications.view' },
]

const stockSubModules = [
  { path: '/app/stock', label: 'Articles', permission: 'stock.view' },
  { path: '/app/stock/entrepots', label: 'Entrepôts', permission: 'stock.view' },
  { path: '/app/stock/emplacements', label: 'Emplacements', permission: 'stock.view' },
  { path: '/app/stock/lots', label: 'Lots', permission: 'stock.view' },
  { path: '/app/stock/alertes', label: 'Alertes', permission: 'stock.view' },
  { path: '/app/stock/quarantaines', label: 'Quarantaines', permission: 'stock.view' },
  { path: '/app/stock/transferts', label: 'Transferts', permission: 'stock.view' },
  { path: '/app/stock/receptions', label: 'Réceptions', permission: 'stock.view' },
]

const adminModules = [
  { path: '/app/admin/users', label: '👥 Utilisateurs', icon: '👥', permission: 'admin.users' },
  { path: '/app/admin/proformas', label: '📄 Proformas', icon: '📄', permission: 'admin.proformas' },
  { path: '/app/admin/analyses', label: '🔬 Analyses', icon: '🔬', permission: 'admin.analyses' },
  { path: '/app/admin/permissions', label: '🔒 Permissions', icon: '🔒', permission: 'admin.permissions' },
]

export function DashboardLayout() {
  const { user, logout } = useAuth()
  const { hasPermission } = usePermissions()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'ADMIN'
  const [isStockMenuOpen, setIsStockMenuOpen] = useState(true)

  const handleLogout = async () => {
    await logout()
    navigate('/login')
  }

  // Filtrer les modules selon les permissions
  const visibleModules = modules.filter(m => hasPermission(m.permission))
  const visibleStockSubModules = stockSubModules.filter(m => hasPermission(m.permission))
  const visibleAdminModules = isAdmin ? adminModules.filter(m => hasPermission(m.permission)) : []

  return (
    <div className="min-h-screen bg-slate-100 flex">
      {/* Sidebar */}
      <aside className="w-68 bg-white border-r border-slate-200 flex flex-col">
        <div className="lanema-gradient-header text-white px-5 py-4 shadow-sm">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full border border-white/60 flex items-center justify-center bg-white/10">
              <span className="text-lg font-semibold">L</span>
            </div>
            <div>
              <div className="font-semibold tracking-[0.2em] text-xs uppercase">LANEMA</div>
              <div className="text-[11px] opacity-85 leading-tight">Portail laboratoire</div>
            </div>
          </div>
        </div>
        <nav className="flex-1 px-3 py-4 space-y-1 bg-white/95 overflow-y-auto">
          {visibleModules.map((m) => (
            <NavLink
              key={m.path}
              to={m.path}
              end={m.path === '/app'}
              className={({ isActive }) =>
                `lanema-nav-link ${isActive ? 'lanema-nav-link-active' : ''}`
              }
            >
              <span className="w-1.5 h-1.5 rounded-full bg-lanema-blue-500" />
              <span>{m.label}</span>
            </NavLink>
          ))}

          {/* Menu Stock ISO 17025 */}
          {hasPermission('stock.view') && (
            <div className="py-1">
              <button
                onClick={() => setIsStockMenuOpen(!isStockMenuOpen)}
                className="w-full lanema-nav-link flex items-center justify-between"
              >
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>📦 Stock</span>
                </div>
                <svg
                  className={`w-4 h-4 transition-transform ${isStockMenuOpen ? 'rotate-180' : ''}`}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              {isStockMenuOpen && (
                <div className="ml-6 mt-1 space-y-1">
                  {visibleStockSubModules.map((sm) => (
                    <NavLink
                      key={sm.path}
                      to={sm.path}
                      end={sm.path === '/app/stock'}
                      className={({ isActive }) =>
                        `block px-3 py-2 text-sm rounded-md transition-colors ${
                          isActive
                            ? 'bg-sky-50 text-sky-700 font-medium'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                        }`
                      }
                    >
                      {sm.label}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          )}
          
          {/* Section Admin (visible uniquement pour ADMIN) */}
          {isAdmin && (
            <>
              <div className="pt-4 mt-4 border-t border-slate-200">
                <div className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  Administration
                </div>
              </div>
              {visibleAdminModules.map((m) => (
                <NavLink
                  key={m.path}
                  to={m.path}
                  className={({ isActive }) =>
                    `lanema-nav-link ${isActive ? 'lanema-nav-link-active' : ''}`
                  }
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-purple-500" />
                  <span>{m.label}</span>
                </NavLink>
              ))}
            </>
          )}
        </nav>
        <div className="px-4 py-3 border-t border-slate-200">
          <div className="text-xs text-slate-500 mb-2">
            <div className="font-semibold text-slate-700">Connecté</div>
            <div className="truncate">{user?.email || 'Utilisateur LANEMA'}</div>
            <div className="text-xs text-slate-400">{user?.role}</div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-3 py-2 text-sm font-medium text-red-600 bg-red-50 rounded-lg hover:bg-red-100 transition-colors flex items-center justify-center gap-2"
          >
            <span>🚪</span>
            <span>Déconnexion</span>
          </button>
        </div>
      </aside>

      {/* Contenu principal */}
      <div className="flex-1 flex flex-col">
        <header className="h-14 bg-white/70 backdrop-blur border-b border-slate-200 flex items-center justify-between px-6">
          <div>
            <div className="text-sm font-semibold text-slate-800">Tableau de bord LANEMA</div>
            <div className="text-xs text-slate-500">Vue d&apos;ensemble des activités du laboratoire</div>
          </div>
          <div className="flex items-center gap-3">
            <span className="lanema-badge">Environnement de test</span>
          </div>
        </header>

        <main className="flex-1 px-6 py-6">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
