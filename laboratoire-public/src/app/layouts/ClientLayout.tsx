import { Link, Outlet, useLocation, useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import { useAuth } from '../../contexts/AuthContext'
import api from '../../services/api'

export function ClientLayout() {
  const location = useLocation()
  const navigate = useNavigate()
  const { user, logout } = useAuth()

  const [unreadCount, setUnreadCount] = useState(0)
  const [showNotifDropdown, setShowNotifDropdown] = useState(false)
  const [recentNotifications, setRecentNotifications] = useState<any[]>([])
  const [loadingNotifs, setLoadingNotifs] = useState(false)

  const isActive = (path: string) => location.pathname === path

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
      if (!target.closest('.client-notif-dropdown-container')) {
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
    const lien = normalizeLien(notif.lien)
    if (lien && lien.startsWith('/client/')) {
      navigate(lien)
    } else {
      navigate('/client/notifications')
    }
  }

  const menuItems = [
    { path: '/client', label: 'Tableau de bord', icon: '📊' },
    { path: '/client/demandes', label: 'Mes demandes', icon: '📋' },
    { path: '/client/notifications', label: 'Notifications', icon: '🔔' },
    { path: '/client/echantillons', label: 'Mes échantillons', icon: '🧪' },
    { path: '/client/resultats', label: 'Mes résultats', icon: '📄' },
    { path: '/client/factures', label: 'Mes factures', icon: '💰' },
    { path: '/client/profil', label: 'Mon profil', icon: '👤' },
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
                <span className="text-xl font-bold text-white">LM</span>
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-900">LAB MANAGER</div>
                <div className="text-xs text-slate-500">Espace client</div>
              </div>
            </Link>

            {/* User menu */}
            <div className="flex items-center gap-4">
              <div className="relative client-notif-dropdown-container">
                <button
                  onClick={() => setShowNotifDropdown(!showNotifDropdown)}
                  className="relative p-2 text-slate-600 hover:bg-slate-100 rounded-lg transition"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                    />
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
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
                            />
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
                                    day: '2-digit',
                                    month: 'short',
                                    hour: '2-digit',
                                    minute: '2-digit',
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
                        onClick={() => {
                          setShowNotifDropdown(false)
                          navigate('/client/notifications')
                        }}
                        className="w-full text-center text-sm font-medium text-lanema-blue-600 hover:text-lanema-blue-700"
                      >
                        Voir toutes les notifications
                      </button>
                    </div>
                  </div>
                )}
              </div>

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
                  {item.path === '/client/notifications' && unreadCount > 0 && (
                    <span className="ml-2 px-2 py-0.5 text-xs font-semibold bg-rose-500 text-white rounded-full">
                      {unreadCount > 99 ? '99+' : unreadCount}
                    </span>
                  )}
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
