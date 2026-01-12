import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'

export function ClientNotificationsPage() {
  const navigate = useNavigate()
  const [notifications, setNotifications] = useState<any[]>([])
  const [stats, setStats] = useState<any>({ total: 0, non_lues: 0, aujourd_hui: 0, alertes: 0 })
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('TOUS')

  useEffect(() => {
    loadNotifications()
    loadStats()
  }, [filterType])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (filterType !== 'TOUS') params.type = filterType
      const data = await api.notifications.list(params)
      setNotifications(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const loadStats = async () => {
    try {
      const data = await api.notifications.stats()
      setStats(data)
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    }
  }

  const handleMarkAsRead = async (id: number) => {
    try {
      await api.notifications.markAsRead(id)
      loadNotifications()
      loadStats()
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead()
      loadNotifications()
      loadStats()
    } catch (error) {
      console.error('Erreur marquage tous lus:', error)
    }
  }

  const handleDelete = async (id: number) => {
    try {
      await api.notifications.delete(id)
      loadNotifications()
      loadStats()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const normalizeLien = (lien?: string) => {
    if (!lien || typeof lien !== 'string') return ''
    return lien.replace(/\/+$/, '')
  }

  const handleNavigate = (lien: string) => {
    const normalized = normalizeLien(lien)
    if (normalized && normalized.startsWith('/client/')) {
      navigate(normalized)
      return
    }
    navigate('/client/notifications')
  }

  const getTypeColor = (type: string) => {
    const colors: Record<string, { bg: string; text: string }> = {
      INFO: { bg: 'bg-slate-100', text: 'text-slate-700' },
      ALERTE: { bg: 'bg-rose-50', text: 'text-rose-700' },
      STOCK: { bg: 'bg-amber-50', text: 'text-amber-700' },
      DEMANDE: { bg: 'bg-purple-50', text: 'text-purple-700' },
      QUALITE: { bg: 'bg-emerald-50', text: 'text-emerald-700' },
      FACTURATION: { bg: 'bg-cyan-50', text: 'text-cyan-700' },
      METROLOGIE: { bg: 'bg-indigo-50', text: 'text-indigo-700' },
      ECHANTILLON: { bg: 'bg-lanema-blue-50', text: 'text-lanema-blue-700' },
      ESSAI: { bg: 'bg-teal-50', text: 'text-teal-700' },
    }
    return colors[type] || colors.INFO
  }

  const getPrioriteColor = (priorite: string) => {
    const colors: Record<string, string> = {
      BASSE: 'bg-slate-100 text-slate-600',
      NORMALE: 'bg-lanema-blue-50 text-lanema-blue-700',
      HAUTE: 'bg-amber-50 text-amber-700',
      URGENTE: 'bg-rose-100 text-rose-700',
    }
    return colors[priorite] || colors.NORMALE
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    const now = new Date()
    const diffMs = now.getTime() - date.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    const diffHours = Math.floor(diffMs / 3600000)
    const diffDays = Math.floor(diffMs / 86400000)

    if (diffMins < 1) return "À l'instant"
    if (diffMins < 60) return `Il y a ${diffMins} min`
    if (diffHours < 24) return `Il y a ${diffHours}h`
    if (diffDays < 7) return `Il y a ${diffDays}j`
    return date.toLocaleDateString('fr-FR')
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600 mt-1">Suivez l'état de vos demandes, factures et alertes</p>
        </div>
        <button
          onClick={handleMarkAllAsRead}
          className="px-4 py-2 text-sm font-medium text-lanema-blue-600 hover:bg-lanema-blue-50 rounded-lg transition"
        >
          Tout marquer comme lu
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Total</div>
            <div className="text-2xl font-semibold text-slate-900">{stats.total}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Non lues</div>
            <div className="text-2xl font-semibold text-lanema-blue-600">{stats.non_lues}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Aujourd'hui</div>
            <div className="text-2xl font-semibold text-emerald-600">{stats.aujourd_hui}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Alertes</div>
            <div className="text-2xl font-semibold text-rose-600">{stats.alertes}</div>
          </div>
        </div>
      )}

      <div className="lanema-card p-4">
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="w-full md:w-auto px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
        >
          <option value="TOUS">Tous les types</option>
          <option value="INFO">Information</option>
          <option value="ALERTE">Alertes</option>
          <option value="STOCK">Stock</option>
          <option value="DEMANDE">Demandes</option>
          <option value="QUALITE">Qualité</option>
          <option value="FACTURATION">Facturation</option>
          <option value="METROLOGIE">Métrologie</option>
          <option value="ECHANTILLON">Échantillons</option>
          <option value="ESSAI">Essais</option>
        </select>
      </div>

      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-20 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : notifications.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"
              />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune notification</h3>
          <p className="text-sm text-slate-600">Vous êtes à jour!</p>
        </div>
      ) : (
        <div className="lanema-card divide-y divide-slate-100">
          {notifications.map((notif) => {
            const typeColor = getTypeColor(notif.type_notification)
            return (
              <div
                key={notif.id}
                className={`p-4 hover:bg-slate-50 transition cursor-pointer ${!notif.lu ? 'bg-lanema-blue-50/30 border-l-4 border-lanema-blue-500' : ''}`}
                onClick={() => notif.lien && handleNavigate(notif.lien)}
              >
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg ${typeColor.bg} flex items-center justify-center flex-shrink-0`}>
                    <span className={`text-xs font-semibold ${typeColor.text}`}>{notif.type_notification}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <h3 className={`text-sm font-medium ${!notif.lu ? 'text-slate-900' : 'text-slate-700'}`}>{notif.titre}</h3>
                        {notif.priorite !== 'NORMALE' && (
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${getPrioriteColor(notif.priorite)}`}>
                            {notif.priorite}
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        {!notif.lu && (
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleMarkAsRead(notif.id)
                            }}
                            className="text-xs text-lanema-blue-600 hover:text-lanema-blue-700 font-medium"
                          >
                            Marquer lu
                          </button>
                        )}
                        <button
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDelete(notif.id)
                          }}
                          className="text-xs text-slate-400 hover:text-rose-600"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                    <div className="flex items-center gap-3 text-xs text-slate-500">
                      <span>{formatDate(notif.date_creation)}</span>
                      {notif.lien && (
                        <span className="flex items-center gap-1 text-lanema-blue-600">
                          <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
                            />
                          </svg>
                          Voir détails
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
