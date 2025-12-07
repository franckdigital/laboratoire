import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ClientResultatsPage() {
  const [filter, setFilter] = useState<'tous' | 'conformes' | 'non_conformes'>('tous')
  const [resultats, setResultats] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadResultats()
  }, [])

  const loadResultats = async () => {
    try {
      setIsLoading(true)
      const data = await api.essais.list()
      setResultats(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement résultats:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const mockResultats = [
    {
      id: '1',
      numero: 'RAP-2024-0301',
      echantillon: 'ECH-20241127-0442',
      type_essai: 'Résistance à la compression',
      valeur: '32.5 MPa',
      norme: 'NF EN 206',
      statut: 'CONFORME',
      date_validation: '2024-11-28',
      valideur: 'Dr. KOUASSI',
      pdf_disponible: true,
    },
    {
      id: '2',
      numero: 'RAP-2024-0298',
      echantillon: 'ECH-20241126-0435',
      type_essai: 'Traction acier',
      valeur: '485 MPa',
      norme: 'NF A35-015',
      statut: 'CONFORME',
      date_validation: '2024-11-27',
      valideur: 'Dr. KOUASSI',
      pdf_disponible: true,
    },
    {
      id: '3',
      numero: 'RAP-2024-0289',
      echantillon: 'ECH-20241125-0420',
      type_essai: 'Analyse granulométrique',
      valeur: 'Fuseau hors tolérances',
      norme: 'NF EN 933-1',
      statut: 'NON_CONFORME',
      date_validation: '2024-11-26',
      valideur: 'Ing. MBIDA',
      pdf_disponible: true,
    },
    {
      id: '4',
      numero: 'RAP-2024-0285',
      echantillon: 'ECH-20241124-0410',
      type_essai: 'Teneur en eau',
      valeur: '3.8%',
      norme: 'NF P94-050',
      statut: 'CONFORME',
      date_validation: '2024-11-25',
      valideur: 'Ing. NGOUO',
      pdf_disponible: true,
    },
  ]

  const statutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'CONFORME': 'bg-emerald-50 text-emerald-700 border-emerald-200',
      'NON_CONFORME': 'bg-rose-50 text-rose-700 border-rose-200',
      'EN_ATTENTE': 'bg-amber-50 text-amber-700 border-amber-200',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const filteredResultats = resultats.filter(r => {
    if (filter === 'conformes') return r.statut === 'CONFORME'
    if (filter === 'non_conformes') return r.statut === 'NON_CONFORME'
    return true
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes résultats</h1>
          <p className="text-sm text-slate-600 mt-1">Consultez et téléchargez vos rapports d'essais</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
          </svg>
          Télécharger tout (ZIP)
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Total rapports</div>
          <div className="text-2xl font-semibold text-slate-900">{resultats.length}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Conformes</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {resultats.filter(r => r.statut === 'CONFORME').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Non-conformes</div>
          <div className="text-2xl font-semibold text-rose-600">
            {resultats.filter(r => r.statut === 'NON_CONFORME').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Taux conformité</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {((resultats.filter(r => r.statut === 'CONFORME').length / resultats.length) * 100).toFixed(1)}%
          </div>
        </div>
        </div>
      )}

      {/* Filters */}
      <div className="lanema-card p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'tous'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Tous ({resultats.length})
          </button>
          <button
            onClick={() => setFilter('conformes')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'conformes'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Conformes ({resultats.filter(r => r.statut === 'CONFORME').length})
          </button>
          <button
            onClick={() => setFilter('non_conformes')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'non_conformes'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Non-conformes ({resultats.filter(r => r.statut === 'NON_CONFORME').length})
          </button>
        </div>
      </div>

      {/* Liste des résultats */}
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
      ) : filteredResultats.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun résultat</h3>
          <p className="text-sm text-slate-600">Vous n'avez aucun résultat dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredResultats.map((resultat) => (
          <div key={resultat.id} className="lanema-card p-6 hover:shadow-md transition">
            <div className="flex items-start gap-4 mb-4">
              <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${
                resultat.statut === 'CONFORME' ? 'bg-emerald-50' : 'bg-rose-50'
              }`}>
                {resultat.statut === 'CONFORME' ? (
                  <svg className="w-6 h-6 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                ) : (
                  <svg className="w-6 h-6 text-rose-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                )}
              </div>
              
              <div className="flex-1">
                <div className="flex items-start justify-between mb-2">
                  <div>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-semibold text-slate-900">{resultat.numero}</span>
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${statutColor(resultat.statut)}`}>
                        {resultat.statut.replace('_', ' ')}
                      </span>
                    </div>
                    <div className="text-sm text-slate-700">{resultat.type_essai}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="p-3 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Échantillon</div>
                    <div className="text-sm font-medium text-slate-900">{resultat.echantillon?.code_echantillon || resultat.echantillon}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Résultat</div>
                    <div className="text-sm font-medium text-slate-900">{resultat.resultat || resultat.valeur}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Norme appliquée</div>
                    <div className="text-sm font-medium text-slate-900">{resultat.norme}</div>
                  </div>
                  <div className="p-3 rounded-lg bg-slate-50">
                    <div className="text-xs text-slate-500 mb-1">Validé par</div>
                    <div className="text-sm font-medium text-slate-900">{resultat.valideur}</div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-slate-100">
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span className="flex items-center gap-1.5">
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Validé le {resultat.date_validation ? new Date(resultat.date_validation).toLocaleDateString('fr-FR') : 'N/A'}
                    </span>
                    {resultat.pdf_disponible && (
                      <span className="flex items-center gap-1.5 text-emerald-600 font-medium">
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                        PDF disponible
                      </span>
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
            </div>
          </div>
        ))}
        </div>
      )}

      {!isLoading && filteredResultats.length === 0 && (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun résultat</h3>
          <p className="text-sm text-slate-600">Vous n'avez aucun résultat dans cette catégorie</p>
        </div>
      )}
    </div>
  )
}
