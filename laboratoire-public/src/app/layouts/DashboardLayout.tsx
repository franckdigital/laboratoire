import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { usePermissions } from '../../contexts/PermissionsContext'
import { useState, useEffect } from 'react'
import api from '../../services/api'

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
  { path: '/app/stock/sorties', label: 'Sorties', permission: 'stock.view' },
  { path: '/app/stock/tracabilite', label: 'Traçabilité', permission: 'stock.view' },
  { path: '/app/stock/inventaires', label: 'Inventaires', permission: 'stock.view' },
  { path: '/app/stock/statistiques', label: 'Statistiques', permission: 'stock.view' },
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
  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  useEffect(() => {
    loadUnreadCount()
    const interval = setInterval(loadUnreadCount, 30000)
    return () => clearInterval(interval)
  }, [])

  useEffect(() => {
    if (showNotifDropdown) {
      loadRecentNotifications()
    }
  }, [showNotifDropdown])

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      const target = e.target as HTMLElement
      if (!target.closest('.notif-dropdown-container')) {
        setShowNotifDropdown(false)
      }
    }
    if (showNotifDropdown) {
      document.addEventListener('click', handleClickOutside)
    }
    return () => document.removeEventListener('click', handleClickOutside)
  }, [showNotifDropdown])

  const loadUnreadCount = async () => {
    try {
      const data = await api.notifications.unreadCount()
      setUnreadCount(data.non_lues || 0)
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    }
  }

  const loadRecentNotifications = async () => {
    try {
      setLoadingNotifs(true)
      const data = await api.notifications.list()
      setRecentNotifications((data.results || data || []).slice(0, 5))
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setLoadingNotifs(false)
    }
  }

  const normalizeLien = (lien?: string) => {
    if (!lien || typeof lien !== 'string') return ''
    return lien.replace(/\/+$/, '')
  }

  const handleNotifClick = async (notif: any) => {
    if (!notif.lu) {
      try {
        await api.notifications.markAsRead(notif.id)
        loadUnreadCount()
      } catch (error) {
        console.error('Erreur marquage lu:', error)
      }
    }
    setShowNotifDropdown(false)
    navigate('/app/notifications')
  }

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
              <span className="flex-1">{m.label}</span>
              {m.path === '/app/notifications' && unreadCount > 0 && (
                <span className="ml-auto px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                  {unreadCount > 99 ? '99+' : unreadCount}
                </span>
              )}
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
            <div className="relative notif-dropdown-container">
              <button 
                onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                className="relative p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                </svg>
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full min-w-[18px] text-center">
                    {unreadCount > 99 ? '99+' : unreadCount}
                  </span>
                )}
              </button>

              {showNotifDropdown && (
                <div className="absolute right-0 top-full mt-2 w-96 bg-white rounded-xl shadow-xl border border-slate-200 z-50 overflow-hidden">
                  <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
                    <h3 className="font-semibold text-slate-900">Notifications</h3>
                    {unreadCount > 0 && (
                      <span className="text-xs text-lanema-blue-600 font-medium">{unreadCount} non lue{unreadCount > 1 ? 's' : ''}</span>
                    )}
                  </div>
                  
                  <div className="max-h-80 overflow-y-auto">
                    {loadingNotifs ? (
                      <div className="p-4 text-center">
                        <div className="animate-spin w-6 h-6 border-2 border-lanema-blue-500 border-t-transparent rounded-full mx-auto"></div>
                      </div>
                    ) : recentNotifications.length === 0 ? (
                      <div className="p-6 text-center">
                        <svg className="w-10 h-10 text-slate-300 mx-auto mb-2" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
                        </svg>
                        <p className="text-sm text-slate-500">Aucune notification</p>
                      </div>
                    ) : (
                      recentNotifications.map((notif) => (
                        <div
                          key={notif.id}
                          onClick={() => handleNotifClick(notif)}
                          className={`px-4 py-3 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-0 ${!notif.lu ? 'bg-lanema-blue-50/40' : ''}`}
                        >
                          <div className="flex items-start gap-3">
                            <div className={`w-2 h-2 rounded-full mt-2 flex-shrink-0 ${!notif.lu ? 'bg-lanema-blue-500' : 'bg-slate-300'}`}></div>
                            <div className="flex-1 min-w-0">
                              <p className={`text-sm ${!notif.lu ? 'font-medium text-slate-900' : 'text-slate-700'} truncate`}>{notif.titre}</p>
                              <p className="text-xs text-slate-500 truncate mt-0.5">{notif.message}</p>
                              <p className="text-xs text-slate-400 mt-1">
                                {new Date(notif.date_creation).toLocaleString('fr-FR', { 
                                  day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' 
                                })}
                              </p>
                            </div>
                            {notif.priorite === 'URGENTE' && (
                              <span className="px-1.5 py-0.5 text-xs bg-rose-100 text-rose-700 rounded font-medium">Urgent</span>
                            )}
                          </div>
                        </div>
                      ))
                    )}
                  </div>

                  <div className="px-4 py-3 border-t border-slate-100 bg-slate-50">
                    <button
                      onClick={() => { setShowNotifDropdown(false); navigate('/app/notifications') }}
                      className="w-full text-center text-sm font-medium text-lanema-blue-600 hover:text-lanema-blue-700"
                    >
                      Voir toutes les notifications
                    </button>
                  </div>
                </div>
              )}
            </div>
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
