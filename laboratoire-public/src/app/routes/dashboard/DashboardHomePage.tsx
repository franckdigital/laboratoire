import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function DashboardHomePage() {
  const [stats, setStats] = useState<any>(null)
  const [activities, setActivities] = useState<any[]>([])
  const [kpis, setKpis] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadDashboard()
  }, [])

  const loadDashboard = async () => {
    try {
      setIsLoading(true)
      const [statsData, activitiesData, kpisData] = await Promise.all([
        api.dashboard.stats(),
        api.dashboard.activities({ limit: 10 }),
        api.dashboard.kpis()
      ])
      
      setStats(statsData)
      setActivities(activitiesData.results || activitiesData || [])
      setKpis(kpisData)
    } catch (error) {
      console.error('Erreur chargement dashboard:', error)
    } finally {
      setIsLoading(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-5 animate-pulse">
              <div className="h-10 w-10 bg-slate-200 rounded-lg mb-3"></div>
              <div className="h-8 w-20 bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 lanema-card p-6 animate-pulse">
            <div className="h-6 w-32 bg-slate-200 rounded mb-4"></div>
            <div className="space-y-3">
              {[...Array(5)].map((_, i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques principales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="lanema-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              +12%
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats?.echantillons_en_cours || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">Échantillons en cours</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">{stats?.echantillons_recus_aujourdhui || 0}</span> reçus aujourd'hui
            </div>
          </div>
        </div>

        <div className="lanema-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-amber-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
            </div>
            <span className="text-xs font-medium text-amber-600 bg-amber-50 px-2 py-1 rounded-full">
              En cours
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats?.essais_planifies || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">Essais planifiés</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">{stats?.essais_semaine || 0}</span> à démarrer cette semaine
            </div>
          </div>
        </div>

        <div className="lanema-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-rose-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-rose-600 bg-rose-50 px-2 py-1 rounded-full">
              Urgent
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats?.non_conformites_ouvertes || 0}
          </div>
          <div className="text-xs text-slate-500 font-medium">Non-conformités ouvertes</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              <span className="font-medium text-slate-900">{stats?.non_conformites_en_attente || 0}</span> en attente d'action
            </div>
          </div>
        </div>

        <div className="lanema-card p-5">
          <div className="flex items-start justify-between mb-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-50 flex items-center justify-center">
              <svg className="w-5 h-5 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <span className="text-xs font-medium text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
              Excellent
            </span>
          </div>
          <div className="text-2xl font-semibold text-slate-900 mb-1">
            {stats?.taux_conformite ? `${stats.taux_conformite}%` : 'N/A'}
          </div>
          <div className="text-xs text-slate-500 font-medium">Taux de conformité</div>
          <div className="mt-3 pt-3 border-t border-slate-100">
            <div className="text-xs text-slate-600">
              Objectif: <span className="font-medium text-slate-900">95%</span>
            </div>
          </div>
        </div>
      </div>

      {/* Sections principales */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Activité récente */}
        <div className="lg:col-span-2 lanema-card p-6">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-base font-semibold text-slate-900">Activité récente</h2>
            <button className="text-xs text-lanema-blue-600 hover:text-lanema-blue-700 font-medium">
              Voir tout
            </button>
          </div>
          
          <div className="space-y-4">
            {activities.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                Aucune activité récente
              </div>
            ) : (
              activities.map((activity, i) => (
                <div key={i} className="flex items-start gap-3 p-3 rounded-lg hover:bg-slate-50 transition cursor-pointer">
                  <div className={`w-8 h-8 rounded-lg bg-lanema-blue-50 flex items-center justify-center flex-shrink-0 mt-0.5`}>
                    <div className={`w-2 h-2 rounded-full bg-lanema-blue-500`} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 mb-0.5">{activity.titre || activity.title}</div>
                    <div className="text-xs text-slate-600 mb-1">{activity.description}</div>
                    <div className="flex items-center gap-2 text-xs text-slate-500">
                      <span>{activity.client || activity.type}</span>
                      <span>•</span>
                      <span>{new Date(activity.created_at).toLocaleString('fr-FR')}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        {/* Actions rapides et alertes */}
        <div className="space-y-6">
          {/* Actions rapides */}
          <div className="lanema-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Actions rapides</h2>
            <div className="space-y-2">
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-lanema-blue-50 text-sm font-medium text-slate-700 hover:text-lanema-blue-700 transition">
                <div className="w-8 h-8 rounded-lg bg-lanema-blue-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                  </svg>
                </div>
                <span>Enregistrer un échantillon</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-lanema-blue-50 text-sm font-medium text-slate-700 hover:text-lanema-blue-700 transition">
                <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
                  </svg>
                </div>
                <span>Planifier un essai</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-lanema-blue-50 text-sm font-medium text-slate-700 hover:text-lanema-blue-700 transition">
                <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <span>Générer un rapport</span>
              </button>
              <button className="w-full flex items-center gap-3 p-3 text-left rounded-lg hover:bg-lanema-blue-50 text-sm font-medium text-slate-700 hover:text-lanema-blue-700 transition">
                <div className="w-8 h-8 rounded-lg bg-violet-100 flex items-center justify-center">
                  <svg className="w-4 h-4 text-violet-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                </div>
                <span>Ajouter un client</span>
              </button>
            </div>
          </div>

          {/* Alertes */}
          <div className="lanema-card p-6">
            <h2 className="text-base font-semibold text-slate-900 mb-4">Alertes & Notifications</h2>
            <div className="space-y-3">
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-amber-900 mb-1">Étalonnage requis</div>
                    <div className="text-xs text-amber-700">3 équipements à étalonner cette semaine</div>
                  </div>
                </div>
              </div>
              
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-rose-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-rose-900 mb-1">Délai dépassé</div>
                    <div className="text-xs text-rose-700">2 rapports en retard de livraison</div>
                  </div>
                </div>
              </div>

              <div className="p-3 rounded-lg bg-lanema-blue-50 border border-lanema-blue-100">
                <div className="flex items-start gap-2">
                  <svg className="w-4 h-4 text-lanema-blue-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <div className="flex-1">
                    <div className="text-xs font-medium text-lanema-blue-900 mb-1">Stock faible</div>
                    <div className="text-xs text-lanema-blue-700">5 consommables sous le seuil d'alerte</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Statistiques hebdomadaires */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lanema-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Performance hebdomadaire</h2>
          <div className="space-y-4">
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600">Échantillons traités</span>
                <span className="font-semibold text-slate-900">87 / 100</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-lanema-blue-500 rounded-full" style={{ width: '87%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600">Essais réalisés</span>
                <span className="font-semibold text-slate-900">142 / 150</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500 rounded-full" style={{ width: '94.6%' }} />
              </div>
            </div>
            
            <div>
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600">Rapports livrés</span>
                <span className="font-semibold text-slate-900">64 / 70</span>
              </div>
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500 rounded-full" style={{ width: '91.4%' }} />
              </div>
            </div>
          </div>
        </div>

        <div className="lanema-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Top clients actifs</h2>
          <div className="space-y-3">
            {[
              { name: 'SOCOCE', count: 23, color: 'lanema-blue' },
              { name: 'Groupe CIMAO', count: 18, color: 'emerald' },
              { name: 'BTP Construction', count: 15, color: 'amber' },
              { name: 'Société MATERIAUXCI', count: 12, color: 'violet' },
              { name: 'INFRASTRUCTURES SA', count: 9, color: 'rose' },
            ].map((client, i) => (
              <div key={i} className="flex items-center justify-between p-2 rounded-lg hover:bg-slate-50 transition">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg bg-${client.color}-50 flex items-center justify-center`}>
                    <span className={`text-xs font-semibold text-${client.color}-600`}>
                      {client.name.charAt(0)}
                    </span>
                  </div>
                  <span className="text-sm font-medium text-slate-700">{client.name}</span>
                </div>
                <span className="text-xs font-semibold text-slate-500">{client.count} essais</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
