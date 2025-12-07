import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function NotificationsPage() {
  const [notifications, setNotifications] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filterType, setFilterType] = useState('TOUS')

  useEffect(() => {
    loadNotifications()
  }, [])

  const loadNotifications = async () => {
    try {
      setIsLoading(true)
      const data = await api.notifications.list()
      setNotifications(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement notifications:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await api.notifications.markAsRead(id)
      loadNotifications()
    } catch (error) {
      console.error('Erreur marquage lu:', error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await api.notifications.markAllAsRead()
      loadNotifications()
    } catch (error) {
      console.error('Erreur marquage tous lus:', error)
    }
  }

  const getNotificationIcon = (type: string) => {
    const icons: Record<string, string> = {
      'ECHANTILLON': 'M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10',
      'ESSAI': 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2',
      'FACTURE': 'M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z',
      'ALERTE': 'M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z'
    }
    return icons[type] || icons['ALERTE']
  }

  const getNotificationColor = (type: string) => {
    const colors: Record<string, string> = {
      'ECHANTILLON': 'lanema-blue',
      'ESSAI': 'emerald',
      'FACTURE': 'amber',
      'ALERTE': 'rose'
    }
    return colors[type] || 'slate'
  }

  const filtered = notifications.filter(n => filterType === 'TOUS' || n.type === filterType)

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Notifications</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez vos notifications et alertes</p>
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
          {[...Array(4)].map((_, i) => (<div key={i} className="lanema-card p-4 animate-pulse"><div className="h-4 w-20 bg-slate-200 rounded mb-2"></div><div className="h-8 w-12 bg-slate-200 rounded"></div></div>))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Total</div><div className="text-2xl font-semibold text-slate-900">{notifications.length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Non lues</div><div className="text-2xl font-semibold text-lanema-blue-600">{notifications.filter(n => !n.lue).length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Aujourd'hui</div><div className="text-2xl font-semibold text-emerald-600">{notifications.filter(n => new Date(n.created_at).toDateString() === new Date().toDateString()).length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Alertes</div><div className="text-2xl font-semibold text-rose-600">{notifications.filter(n => n.type === 'ALERTE').length}</div></div>
        </div>
      )}

      <div className="lanema-card p-4">
        <select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="w-full md:w-auto px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500">
          <option value="TOUS">Tous les types</option>
          <option value="ECHANTILLON">Échantillons</option>
          <option value="ESSAI">Essais</option>
          <option value="FACTURE">Factures</option>
          <option value="ALERTE">Alertes</option>
        </select>
      </div>

      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse"><div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="h-20 bg-slate-200 rounded"></div>))}</div></div>
      ) : filtered.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune notification</h3>
          <p className="text-sm text-slate-600">Vous êtes à jour!</p>
        </div>
      ) : (
        <div className="lanema-card divide-y divide-slate-100">
          {filtered.map((notif) => {
            const color = getNotificationColor(notif.type)
            return (
              <div key={notif.id} className={`p-4 hover:bg-slate-50 transition ${!notif.lue ? 'bg-lanema-blue-50/30' : ''}`}>
                <div className="flex items-start gap-3">
                  <div className={`w-10 h-10 rounded-lg bg-${color}-50 flex items-center justify-center flex-shrink-0`}>
                    <svg className={`w-5 h-5 text-${color}-600`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={getNotificationIcon(notif.type)} />
                    </svg>
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between mb-1">
                      <h3 className="text-sm font-medium text-slate-900">{notif.titre || notif.message?.substring(0, 50)}</h3>
                      {!notif.lue && (<button onClick={() => handleMarkAsRead(notif.id)} className="text-xs text-lanema-blue-600 hover:text-lanema-blue-700 font-medium">Marquer lu</button>)}
                    </div>
                    <p className="text-sm text-slate-600 mb-2">{notif.message}</p>
                    <div className="text-xs text-slate-500">{new Date(notif.created_at).toLocaleString('fr-FR')}</div>
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
