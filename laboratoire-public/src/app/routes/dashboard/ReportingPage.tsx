import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ReportingPage() {
  const [stats, setStats] = useState<any>(null)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadStats()
  }, [])

  const loadStats = async () => {
    try {
      setIsLoading(true)
      const data = await api.reporting.stats()
      setStats(data || {})
    } catch (error) {
      console.error('Erreur chargement stats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Reporting & Statistiques</h1>
        <p className="text-sm text-slate-600 mt-1">Consultez les rapports et statistiques du laboratoire</p>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (<div key={i} className="lanema-card p-4 animate-pulse"><div className="h-4 w-20 bg-slate-200 rounded mb-2"></div><div className="h-8 w-12 bg-slate-200 rounded"></div></div>))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Essais ce mois</div><div className="text-2xl font-semibold text-slate-900">{stats?.essais_ce_mois || 0}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">CA du mois</div><div className="text-2xl font-semibold text-emerald-600">{(stats?.ca_du_mois || 0).toLocaleString('fr-FR')} FCFA</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Taux conformité</div><div className="text-2xl font-semibold text-lanema-blue-600">{stats?.taux_conformite || 0}%</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Satisfaction</div><div className="text-2xl font-semibold text-amber-600">{stats?.satisfaction || 0}%</div></div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="lanema-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Rapports disponibles</h2>
          <div className="space-y-3">
            {['Rapport mensuel d\'activité', 'Rapport de conformité', 'Rapport financier', 'Rapport d\'étalonnage'].map((rapport, i) => (
              <button key={i} className="w-full flex items-center justify-between p-3 rounded-lg border border-slate-200 hover:bg-slate-50 transition">
                <span className="text-sm font-medium text-slate-700">{rapport}</span>
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
              </button>
            ))}
          </div>
        </div>

        <div className="lanema-card p-6">
          <h2 className="text-base font-semibold text-slate-900 mb-4">Performance hebdomadaire</h2>
          <div className="space-y-4">
            {[
              { label: 'Échantillons traités', value: 87, max: 100, color: 'lanema-blue' },
              { label: 'Essais réalisés', value: 142, max: 150, color: 'emerald' },
              { label: 'Rapports livrés', value: 64, max: 70, color: 'amber' }
            ].map((item, i) => (
              <div key={i}>
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-slate-600">{item.label}</span>
                  <span className="font-semibold text-slate-900">{item.value} / {item.max}</span>
                </div>
                <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div className={`h-full bg-${item.color}-500 rounded-full`} style={{ width: `${(item.value / item.max) * 100}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
