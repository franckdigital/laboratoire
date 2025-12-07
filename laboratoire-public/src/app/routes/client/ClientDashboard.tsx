import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'

export function ClientDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({
    total_demandes: 0,
    en_attente: 0,
    en_cours: 0,
    acceptees: 0,
  })
  const [isLoading, setIsLoading] = useState(true)
  const [recentDemandes, setRecentDemandes] = useState<any[]>([])

  useEffect(() => {
    loadDashboardData()
  }, [])

  const loadDashboardData = async () => {
    try {
      setIsLoading(true)
      
      // Charger les stats
      const statsData = await api.devis.stats()
      setStats(statsData)
      
      // Charger les demandes récentes
      const demandesData = await api.devis.mesDemandes()
      setRecentDemandes(demandesData.results?.slice(0, 5) || demandesData.slice(0, 5) || [])
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const activities = recentDemandes.map((demande, index) => ({
    id: demande.id,
    type: 'demande',
    title: `Demande ${demande.numero}`,
    description: `${demande.type_analyse} - ${demande.categorie}`,
    date: new Date(demande.created_at).toLocaleDateString('fr-FR'),
    icon: '📋',
    color: 'lanema-blue',
  }))

  return (
    <div className="space-y-6">
      {/* Welcome banner */}
      <div className="lanema-gradient-header p-6 rounded-xl">
        <h1 className="text-2xl font-bold text-white mb-2">
          Bienvenue, {user?.raison_sociale || 'Client'}
        </h1>
        <p className="text-lanema-blue-100">Voici l'activité de vos demandes et échantillons</p>
      </div>

      {/* KPIs */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-8 w-16 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-24 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              </div>
            </div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">{stats.total_demandes}</div>
            <div className="text-xs text-slate-500">Demandes totales</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Toutes vos demandes
            </div>
          </div>

          <div className="lanema-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-amber-600">En attente</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">{stats.en_attente}</div>
            <div className="text-xs text-slate-500">En attente de traitement</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Attendent validation
            </div>
          </div>

          <div className="lanema-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-blue-600">En cours</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">{stats.en_cours}</div>
            <div className="text-xs text-slate-500">En cours de traitement</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Demandes actives
            </div>
          </div>

          <div className="lanema-card p-5">
            <div className="flex items-start justify-between mb-3">
              <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <span className="text-xs font-medium text-emerald-600">Acceptées</span>
            </div>
            <div className="text-2xl font-semibold text-slate-900 mb-1">{stats.acceptees}</div>
            <div className="text-xs text-slate-500">Demandes acceptées</div>
            <div className="mt-3 pt-3 border-t border-slate-100 text-xs text-slate-600">
              Devis validés
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <div className="lg:col-span-2 lanema-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900">Activité récente</h2>
            <button className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium">
              Voir tout
            </button>
          </div>

          <div className="space-y-4">
            {activities.map((activity) => (
              <div key={activity.id} className="flex items-start gap-4 p-4 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                <div className={`w-10 h-10 rounded-lg bg-${activity.color}-50 flex items-center justify-center flex-shrink-0`}>
                  <span className="text-xl">{activity.icon}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900">{activity.title}</div>
                  <div className="text-sm text-slate-600 mt-0.5">{activity.description}</div>
                  <div className="text-xs text-slate-500 mt-1">{activity.date}</div>
                </div>
                <svg className="w-5 h-5 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </div>
            ))}
          </div>
        </div>

        {/* Actions rapides & Alertes */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="lanema-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <a href="/client/demande-devis" className="w-full flex items-center gap-3 p-3 rounded-lg bg-lanema-blue-50 hover:bg-lanema-blue-100 text-lanema-blue-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="text-sm font-medium">Demander un devis</span>
              </a>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
                <span className="text-sm font-medium">Planifier un essai</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                <span className="text-sm font-medium">Générer un rapport</span>
              </button>

              <button className="w-full flex items-center gap-3 p-3 rounded-lg bg-slate-50 hover:bg-slate-100 text-slate-700 transition">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                </svg>
                <span className="text-sm font-medium">Ajouter un client</span>
              </button>
            </div>
          </div>

          {/* Alertes & Notifications */}
          <div className="lanema-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Alertes & Notifications</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div>
                    <div className="text-xs font-medium text-amber-900">Étalonnage requis</div>
                    <div className="text-xs text-amber-700 mt-1">1 éq. nécessite un étalonnage cette semaine</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div>
                    <div className="text-xs font-medium text-rose-900">Délai dépassé</div>
                    <div className="text-xs text-rose-700 mt-1">2 rapports en attente de livraison</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-lanema-blue-50 border border-lanema-blue-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-lanema-blue-600 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                  </svg>
                  <div>
                    <div className="text-xs font-medium text-lanema-blue-900">Stock faible</div>
                    <div className="text-xs text-lanema-blue-700 mt-1">3 consommables sous le seuil d'alerte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
