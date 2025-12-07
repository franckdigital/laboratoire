import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ClientFacturesPage() {
  const [filter, setFilter] = useState<'toutes' | 'payees' | 'en_attente'>('toutes')
  const [factures, setFactures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadFactures()
  }, [])

  const loadFactures = async () => {
    try {
      setIsLoading(true)
      const data = await api.factures.list()
      setFactures(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement factures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const mockFactures = [
    {
      id: '1',
      numero: 'FACT-2024-0156',
      date_emission: '2024-11-25',
      date_echeance: '2024-12-25',
      montant_ht: 450000,
      montant_ttc: 531000,
      statut: 'PAYEE',
      date_paiement: '2024-11-28',
      demandes: ['DA-20241120-0015'],
    },
    {
      id: '2',
      numero: 'FACT-2024-0157',
      date_emission: '2024-11-26',
      date_echeance: '2024-12-26',
      montant_ht: 680000,
      montant_ttc: 802400,
      statut: 'EN_ATTENTE',
      date_paiement: null,
      demandes: ['DA-20241125-0019'],
    },
    {
      id: '3',
      numero: 'FACT-2024-0154',
      date_emission: '2024-11-15',
      date_echeance: '2024-12-15',
      montant_ht: 550000,
      montant_ttc: 649000,
      statut: 'RETARD',
      date_paiement: null,
      demandes: ['DA-20241110-0012', 'DA-20241112-0014'],
    },
    {
      id: '4',
      numero: 'FACT-2024-0155',
      date_emission: '2024-11-20',
      date_echeance: '2024-12-20',
      montant_ht: 890000,
      montant_ttc: 1050200,
      statut: 'PAYEE',
      date_paiement: '2024-11-22',
      demandes: ['DA-20241115-0013'],
    },
  ]

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' XAF'
  }

  const statutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'PAYEE': 'bg-emerald-50 text-emerald-700',
      'EN_ATTENTE': 'bg-amber-50 text-amber-700',
      'RETARD': 'bg-rose-50 text-rose-700',
      'ANNULEE': 'bg-slate-100 text-slate-500',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const filteredFactures = factures.filter(f => {
    if (filter === 'payees') return f.statut === 'PAYEE'
    if (filter === 'en_attente') return f.statut === 'EN_ATTENTE' || f.statut === 'RETARD'
    return true
  })

  const totalDu = factures
    .filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD')
    .reduce((sum, f) => sum + f.montant_ttc, 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes factures</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez vos factures et paiements</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enregistrer un paiement
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Total factures</div>
          <div className="text-2xl font-semibold text-slate-900">{factures.length}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Montant dû</div>
          <div className="text-xl font-semibold text-amber-600">{formatMontant(totalDu)}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Payées</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {factures.filter(f => f.statut === 'PAYEE').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En retard</div>
          <div className="text-2xl font-semibold text-rose-600">
            {factures.filter(f => f.statut === 'RETARD').length}
          </div>
        </div>
        </div>
      )}

      {/* Filters */}
      <div className="lanema-card p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('toutes')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'toutes'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Toutes ({factures.length})
          </button>
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_attente'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En attente ({factures.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD').length})
          </button>
          <button
            onClick={() => setFilter('payees')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'payees'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Payées ({factures.filter(f => f.statut === 'PAYEE').length})
          </button>
        </div>
      </div>

      {/* Liste des factures */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="lanema-card p-6 animate-pulse">
              <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredFactures.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune facture</h3>
          <p className="text-sm text-slate-600">Vous n'avez aucune facture dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredFactures.map((facture) => (
          <div key={facture.id} className="lanema-card p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 mb-1">{facture.numero}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <span>Émise le {facture.date_emission ? new Date(facture.date_emission).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    <span>• Échéance: {facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-slate-600">
                    <span>Demandes:</span>
                    {facture.demandes.map((d, i) => (
                      <span key={i} className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                        {d}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-slate-900 mb-1">
                  {formatMontant(facture.montant_ttc)}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  HT: {formatMontant(facture.montant_ht)}
                </div>
                <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statutColor(facture.statut)}`}>
                  {facture.statut.replace('_', ' ')}
                </span>
              </div>
            </div>

            {facture.date_paiement && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
                <div className="flex items-center gap-2 text-sm text-emerald-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Payée le {facture.date_paiement ? new Date(facture.date_paiement).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
              </div>
            )}

            {facture.statut === 'RETARD' && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 mb-4">
                <div className="flex items-center gap-2 text-sm text-rose-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Paiement en retard - Échéance dépassée</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {facture.statut === 'EN_ATTENTE' && (
                  <button className="px-4 py-2 text-sm font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition">
                    Payer maintenant
                  </button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                  Détails
                </button>
                <button className="px-3 py-1.5 text-xs font-medium text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition flex items-center gap-1.5">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                  Télécharger PDF
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}

      {!isLoading && filteredFactures.length === 0 && (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune facture</h3>
          <p className="text-sm text-slate-600">Vous n'avez aucune facture dans cette catégorie</p>
        </div>
      )}
    </div>
  )
}
