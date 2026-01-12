import { useState, useEffect } from 'react'
import { 
  History, 
  Search, 
  Filter, 
  RefreshCw,
  ArrowUpRight,
  ArrowDownRight,
  ArrowLeftRight,
  AlertTriangle,
  Package,
  ChevronRight,
  Eye,
  Layers,
  Calendar,
  User
} from 'lucide-react'
import { stockAPI } from '../../../services/api'
import { Modal, ModalBody, ModalFooter, ModalButton } from '../../../components/ui/Modal'

interface Mouvement {
  id: number
  article: number
  article_details: {
    id: number
    designation: string
    reference_interne: string
  }
  lot: number | null
  lot_numero: string | null
  type_mouvement: string
  type_mouvement_display: string
  quantite: number
  quantite_avant: number
  quantite_apres: number
  reference_document: string
  description: string
  utilisateur_nom: string
  date_mouvement: string
}

interface Lot {
  id: number
  numero_lot: string
  article_nom: string
}

const TYPE_ICONS: Record<string, any> = {
  ENTREE: { icon: ArrowUpRight, color: 'text-green-600', bg: 'bg-green-100' },
  SORTIE: { icon: ArrowDownRight, color: 'text-red-600', bg: 'bg-red-100' },
  TRANSFERT: { icon: ArrowLeftRight, color: 'text-blue-600', bg: 'bg-blue-100' },
  AJUSTEMENT: { icon: Package, color: 'text-purple-600', bg: 'bg-purple-100' },
  QUARANTAINE_ENTREE: { icon: AlertTriangle, color: 'text-orange-600', bg: 'bg-orange-100' },
  QUARANTAINE_SORTIE: { icon: AlertTriangle, color: 'text-yellow-600', bg: 'bg-yellow-100' },
}

export function TracabilitePage() {
  const [mouvements, setMouvements] = useState<Mouvement[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [selectedLot, setSelectedLot] = useState('')
  const [showDetailModal, setShowDetailModal] = useState(false)
  const [tracabiliteComplete, setTracabiliteComplete] = useState<any>(null)
  const [loadingTracabilite, setLoadingTracabilite] = useState(false)

  useEffect(() => {
    loadData()
  }, [filterType])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterType) params.type_mouvement = filterType
      
      const [mouvementsData, lotsData] = await Promise.all([
        stockAPI.mouvementsStock.list(params),
        stockAPI.lots.list()
      ])
      
      setMouvements(Array.isArray(mouvementsData) ? mouvementsData : mouvementsData.results || [])
      setLots(Array.isArray(lotsData) ? lotsData : lotsData.results || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const loadTracabiliteComplete = async (lotId: string) => {
    try {
      setLoadingTracabilite(true)
      const data = await stockAPI.mouvementsStock.tracabiliteComplete(lotId)
      setTracabiliteComplete(data)
      setShowDetailModal(true)
    } catch (err: any) {
      alert(err.message || 'Erreur lors du chargement de la traçabilité')
    } finally {
      setLoadingTracabilite(false)
    }
  }

  const loadMouvementsParLot = async () => {
    if (!selectedLot) {
      loadData()
      return
    }
    try {
      setLoading(true)
      const data = await stockAPI.mouvementsStock.parLot(selectedLot)
      setMouvements(Array.isArray(data) ? data : data.results || [])
    } catch (err: any) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  const filteredMouvements = mouvements.filter(m => 
    m.article_details?.designation?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.lot_numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.reference_document?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const getTypeConfig = (type: string) => {
    return TYPE_ICONS[type] || { icon: Package, color: 'text-gray-600', bg: 'bg-gray-100' }
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Traçabilité Stock</h1>
          <p className="text-gray-600">Historique complet des mouvements de stock</p>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher article, lot, référence..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
          <select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les types</option>
            <option value="ENTREE">Entrées</option>
            <option value="SORTIE">Sorties</option>
            <option value="TRANSFERT">Transferts</option>
            <option value="AJUSTEMENT">Ajustements</option>
            <option value="QUARANTAINE_ENTREE">Mise en quarantaine</option>
            <option value="QUARANTAINE_SORTIE">Sortie quarantaine</option>
          </select>
          <select
            value={selectedLot}
            onChange={(e) => setSelectedLot(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 min-w-[200px]"
          >
            <option value="">Filtrer par lot</option>
            {lots.map(lot => (
              <option key={lot.id} value={lot.id}>
                {lot.numero_lot} - {lot.article_nom}
              </option>
            ))}
          </select>
          <button
            onClick={loadMouvementsParLot}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <Filter className="w-5 h-5" />
            Filtrer
          </button>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Traçabilité complète par lot */}
      {selectedLot && (
        <div className="bg-blue-50 rounded-xl p-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <History className="w-6 h-6 text-blue-600" />
            <span className="text-blue-800 font-medium">
              Voir la traçabilité complète du lot sélectionné
            </span>
          </div>
          <button
            onClick={() => loadTracabiliteComplete(selectedLot)}
            disabled={loadingTracabilite}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            <Eye className="w-5 h-5" />
            {loadingTracabilite ? 'Chargement...' : 'Traçabilité complète'}
          </button>
        </div>
      )}

      {/* Timeline */}
      <div className="bg-white rounded-xl shadow-sm border p-6">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            {error}
          </div>
        ) : filteredMouvements.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            Aucun mouvement trouvé
          </div>
        ) : (
          <div className="space-y-4">
            {filteredMouvements.map((mouvement, index) => {
              const config = getTypeConfig(mouvement.type_mouvement)
              const Icon = config.icon
              return (
                <div key={mouvement.id} className="flex gap-4">
                  {/* Timeline line */}
                  <div className="flex flex-col items-center">
                    <div className={`w-10 h-10 rounded-full ${config.bg} flex items-center justify-center`}>
                      <Icon className={`w-5 h-5 ${config.color}`} />
                    </div>
                    {index < filteredMouvements.length - 1 && (
                      <div className="w-0.5 h-full bg-gray-200 my-2"></div>
                    )}
                  </div>
                  
                  {/* Content */}
                  <div className="flex-1 pb-6">
                    <div className="bg-gray-50 rounded-lg p-4">
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold text-gray-900">
                            {mouvement.type_mouvement_display}
                          </h3>
                          <p className="text-sm text-gray-600 mt-1">
                            {mouvement.article_details?.designation}
                            {mouvement.lot_numero && (
                              <span className="ml-2 text-gray-500">• Lot: {mouvement.lot_numero}</span>
                            )}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className={`font-bold ${mouvement.type_mouvement === 'ENTREE' ? 'text-green-600' : mouvement.type_mouvement === 'SORTIE' ? 'text-red-600' : 'text-blue-600'}`}>
                            {mouvement.type_mouvement === 'ENTREE' ? '+' : mouvement.type_mouvement === 'SORTIE' ? '-' : ''}
                            {mouvement.quantite}
                          </p>
                          <p className="text-xs text-gray-500">
                            {mouvement.quantite_avant} → {mouvement.quantite_apres}
                          </p>
                        </div>
                      </div>
                      
                      <div className="mt-3 pt-3 border-t border-gray-200 flex items-center justify-between text-sm">
                        <div className="flex items-center gap-4 text-gray-500">
                          {mouvement.reference_document && (
                            <span>Réf: {mouvement.reference_document}</span>
                          )}
                          <span>{mouvement.utilisateur_nom}</span>
                        </div>
                        <span className="text-gray-400">
                          {new Date(mouvement.date_mouvement).toLocaleString('fr-FR')}
                        </span>
                      </div>
                      
                      {mouvement.description && (
                        <p className="mt-2 text-sm text-gray-600 italic">
                          {mouvement.description}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </div>

      {/* Modal Traçabilité Complète */}
      <Modal
        isOpen={showDetailModal && tracabiliteComplete !== null}
        onClose={() => setShowDetailModal(false)}
        title="Traçabilité Complète"
        subtitle={`Lot: ${tracabiliteComplete?.lot?.numero_lot || ''} - ${tracabiliteComplete?.lot?.article_nom || ''}`}
        icon={<History className="w-6 h-6 text-white" />}
        headerClassName="bg-gradient-to-r from-cyan-600 to-blue-600"
        size="2xl"
      >
        <ModalBody className="space-y-6">
          {/* Infos lot avec cards stylisées */}
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-gradient-to-br from-gray-50 to-slate-100 rounded-xl p-5 border shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                  <Package className="w-5 h-5 text-gray-600" />
                </div>
                <span className="text-sm font-medium text-gray-500">Quantité initiale</span>
              </div>
              <p className="text-3xl font-bold text-gray-900">{tracabiliteComplete?.lot?.quantite_initiale || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-emerald-100 rounded-xl p-5 border border-green-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-200 rounded-lg flex items-center justify-center">
                  <Layers className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm font-medium text-green-600">Quantité restante</span>
              </div>
              <p className="text-3xl font-bold text-green-600">{tracabiliteComplete?.lot?.quantite_restante || 0}</p>
            </div>
            <div className="bg-gradient-to-br from-blue-50 to-indigo-100 rounded-xl p-5 border border-blue-200 shadow-sm">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-200 rounded-lg flex items-center justify-center">
                  <History className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm font-medium text-blue-600">Nb mouvements</span>
              </div>
              <p className="text-3xl font-bold text-blue-600">{tracabiliteComplete?.mouvements?.length || 0}</p>
            </div>
          </div>

          {/* Timeline des mouvements */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <History className="w-5 h-5 text-blue-600" />
              Historique des mouvements
            </h3>
            <div className="space-y-3 max-h-[400px] overflow-y-auto pr-2">
              {tracabiliteComplete?.mouvements?.map((m: any, i: number) => {
                const config = getTypeConfig(m.type_mouvement)
                const Icon = config.icon
                return (
                  <div 
                    key={m.id} 
                    className="flex items-center gap-4 p-4 bg-white rounded-xl border shadow-sm hover:shadow-md transition-shadow"
                  >
                    <div className={`w-12 h-12 rounded-xl ${config.bg} flex items-center justify-center shadow-sm`}>
                      <Icon className={`w-6 h-6 ${config.color}`} />
                    </div>
                    <div className="flex-1">
                      <p className="font-semibold text-gray-900">{m.type_mouvement_display}</p>
                      <p className="text-sm text-gray-500">{m.description || m.reference_document || 'Aucune description'}</p>
                      <div className="flex items-center gap-4 mt-1 text-xs text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(m.date_mouvement).toLocaleDateString('fr-FR')}
                        </span>
                        {m.utilisateur_nom && (
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {m.utilisateur_nom}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right">
                      <p className={`text-xl font-bold ${
                        m.type_mouvement === 'ENTREE' ? 'text-green-600' : 
                        m.type_mouvement === 'SORTIE' ? 'text-red-600' : 'text-blue-600'
                      }`}>
                        {m.type_mouvement === 'ENTREE' ? '+' : m.type_mouvement === 'SORTIE' ? '-' : ''}
                        {m.quantite}
                      </p>
                      <p className="text-xs text-gray-400">
                        {m.quantite_avant} → {m.quantite_apres}
                      </p>
                    </div>
                  </div>
                )
              })}
              {(!tracabiliteComplete?.mouvements || tracabiliteComplete.mouvements.length === 0) && (
                <div className="text-center py-8 text-gray-500">
                  Aucun mouvement enregistré pour ce lot
                </div>
              )}
            </div>
          </div>
        </ModalBody>

        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setShowDetailModal(false)}>
            Fermer
          </ModalButton>
        </ModalFooter>
      </Modal>
    </div>
  )
}
