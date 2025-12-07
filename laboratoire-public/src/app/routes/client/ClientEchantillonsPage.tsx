import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ClientEchantillonsPage() {
  const [searchTerm, setSearchTerm] = useState('')
  const [echantillons, setEchantillons] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    loadEchantillons()
  }, [])

  const loadEchantillons = async () => {
    try {
      setIsLoading(true)
      const data = await api.echantillons.list()
      setEchantillons(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement échantillons:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const mockEchantillons = [
    {
      id: '1',
      code: 'ECH-20241128-0458',
      designation: 'Ciment Portland CEM II',
      demande: 'DA-20241128-0023',
      
      statut: 'EN_ANALYSE',
      date_reception: '2024-11-28',
      localisation: 'Salle A - Zone 3',
      qr_code: true,
    },
    {
      id: '2',
      code: 'ECH-20241127-0442',
      designation: 'Béton frais - Chantier Abidjan',
      demande: 'DA-20241125-0019',
      statut: 'TERMINE',
      date_reception: '2024-11-27',
      localisation: 'Archivé - A12',
      qr_code: true,
    },
    {
      id: '3',
      code: 'ECH-20241129-0465',
      designation: 'Granulats 0/20',
      demande: 'DA-20241129-0025',
      statut: 'RECEPTIONNE',
      date_reception: '2024-11-29',
      localisation: 'Réception - R5',
      qr_code: true,
    },
    {
      id: '4',
      code: 'ECH-20241126-0435',
      designation: 'Acier béton armé Ø16',
      demande: 'DA-20241125-0019',
      statut: 'TERMINE',
      date_reception: '2024-11-26',
      localisation: 'Archivé - A09',
      qr_code: true,
    },
    {
      id: '5',
      code: 'ECH-20241125-0420',
      designation: 'Mortier de ciment',
      demande: 'DA-20241120-0015',
      statut: 'ARCHIVE',
      date_reception: '2024-11-25',
      localisation: 'Archives - Zone B',
      qr_code: true,
    },
  ]

  const statutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'RECEPTIONNE': 'bg-slate-100 text-slate-700',
      'EN_ANALYSE': 'bg-lanema-blue-50 text-lanema-blue-700',
      'TERMINE': 'bg-emerald-50 text-emerald-700',
      'ARCHIVE': 'bg-slate-50 text-slate-500',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const filteredEchantillons = echantillons.filter(e =>
    e.code_echantillon?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes échantillons</h1>
          <p className="text-sm text-slate-600 mt-1">Traçabilité complète de vos échantillons</p>
        </div>
        <button className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition">
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
          </svg>
          Scanner QR Code
        </button>
      </div>

      {/* Stats */}
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
          <div className="text-xs text-slate-500 mb-1">Total échantillons</div>
          <div className="text-2xl font-semibold text-slate-900">{echantillons.length}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En analyse</div>
          <div className="text-2xl font-semibold text-lanema-blue-600">
            {echantillons.filter(e => e.statut === 'EN_ANALYSE').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Terminés</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {echantillons.filter(e => e.statut === 'TERMINE').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Archivés</div>
          <div className="text-2xl font-semibold text-slate-600">
            {echantillons.filter(e => e.statut === 'ARCHIVE').length}
          </div>
        </div>
        </div>
      )}

      {/* Search */}
      <div className="lanema-card p-4">
        <input
          type="text"
          placeholder="Rechercher un échantillon par code ou désignation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
        />
      </div>

      {/* Liste des échantillons */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-5 animate-pulse">
              <div className="h-6 w-32 bg-slate-200 rounded mb-3"></div>
              <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredEchantillons.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun échantillon trouvé</h3>
          <p className="text-sm text-slate-600">Essayez de modifier vos critères de recherche</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredEchantillons.map((echantillon) => (
          <div key={echantillon.id} className="lanema-card p-5 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-start gap-3">
                <div className="w-12 h-12 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                  </svg>
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900 mb-1">{echantillon.code_echantillon}</div>
                  <div className="text-sm text-slate-700 mb-2">{echantillon.designation}</div>
                  <div className="text-xs text-slate-500">
                    Demande: {echantillon.demande_devis?.numero || 'N/A'}
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded-full ${statutColor(echantillon.statut)}`}>
                {echantillon.statut.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-2 mb-4">
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span>Reçu le {echantillon.date_reception ? new Date(echantillon.date_reception).toLocaleDateString('fr-FR') : 'N/A'}</span>
              </div>
              <div className="flex items-center gap-2 text-xs text-slate-600">
                <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{echantillon.localisation || 'Non définie'}</span>
              </div>
            </div>

            <div className="flex items-center justify-between pt-3 border-t border-slate-100">
              <button className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
                </svg>
                Voir QR Code
              </button>
              <div className="flex items-center gap-1">
                <button className="p-1.5 text-slate-600 hover:text-lanema-blue-600 hover:bg-lanema-blue-50 rounded transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </button>
                <button className="p-1.5 text-slate-600 hover:text-lanema-blue-600 hover:bg-lanema-blue-50 rounded transition">
                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
            </div>
          </div>
        ))}
        </div>
      )}
    </div>
  )
}
