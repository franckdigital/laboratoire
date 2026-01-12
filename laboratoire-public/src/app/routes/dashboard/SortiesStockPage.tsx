import { useState, useEffect } from 'react'
import { 
  Package, 
  Plus, 
  Search, 
  Filter, 
  Check, 
  X, 
  ArrowDownRight,
  RefreshCw,
  ChevronDown,
  AlertCircle,
  PackageMinus,
  Beaker
} from 'lucide-react'
import { stockAPI } from '../../../services/api'
import { Modal, ModalBody, ModalFooter, ModalButton, ModalSelect, ModalInput, ModalTextarea } from '../../../components/ui/Modal'

interface Sortie {
  id: number
  numero_sortie: string
  lot: number
  lot_numero: string
  article_nom: string
  article_reference: string
  quantite: number
  unite: string
  type_sortie: string
  type_sortie_display: string
  motif: string
  utilisateur_nom: string
  date_sortie: string
  valide: boolean
  valide_par_nom: string | null
  date_validation: string | null
}

interface Lot {
  id: number
  numero_lot: string
  article: number
  article_nom: string
  quantite_restante: number
  unite: string
}

const TYPE_SORTIE_OPTIONS = [
  { value: 'CONSOMMATION', label: 'Consommation laboratoire' },
  { value: 'ANALYSE', label: 'Utilisation pour analyse' },
  { value: 'PERTE', label: 'Perte/Casse' },
  { value: 'PEREMPTION', label: 'Péremption' },
  { value: 'RETOUR_FOURNISSEUR', label: 'Retour fournisseur' },
  { value: 'DESTRUCTION', label: 'Destruction' },
  { value: 'AUTRE', label: 'Autre' },
]

export function SortiesStockPage() {
  const [sorties, setSorties] = useState<Sortie[]>([])
  const [lots, setLots] = useState<Lot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [filterValide, setFilterValide] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [formData, setFormData] = useState({
    lot: '',
    quantite: '',
    type_sortie: 'CONSOMMATION',
    motif: ''
  })
  const [formError, setFormError] = useState<string | null>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    loadData()
  }, [filterType, filterValide])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterType) params.type_sortie = filterType
      if (filterValide) params.valide = filterValide
      
      const [sortiesData, lotsData] = await Promise.all([
        stockAPI.sorties.list(params),
        stockAPI.lots.list({ quantite_min: '0.01' })
      ])
      
      setSorties(Array.isArray(sortiesData) ? sortiesData : sortiesData.results || [])
      setLots(Array.isArray(lotsData) ? lotsData : lotsData.results || [])
      setError(null)
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement')
    } finally {
      setLoading(false)
    }
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setFormError(null)
    setSubmitting(true)
    
    try {
      await stockAPI.sorties.create({
        lot: parseInt(formData.lot),
        quantite: parseFloat(formData.quantite),
        type_sortie: formData.type_sortie,
        motif: formData.motif
      })
      setShowModal(false)
      setFormData({ lot: '', quantite: '', type_sortie: 'CONSOMMATION', motif: '' })
      loadData()
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleValider = async (id: number) => {
    if (!confirm('Valider cette sortie de stock ?')) return
    try {
      await stockAPI.sorties.valider(id.toString())
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la validation')
    }
  }

  const handleAnnuler = async (id: number) => {
    const motif = prompt('Motif d\'annulation:')
    if (!motif) return
    try {
      await stockAPI.sorties.annuler(id.toString(), motif)
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors de l\'annulation')
    }
  }

  const filteredSorties = sorties.filter(s => 
    s.numero_sortie.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.article_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.lot_numero.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const selectedLot = lots.find(l => l.id === parseInt(formData.lot))

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Sorties de Stock</h1>
          <p className="text-gray-600">Gérer les sorties et consommations de stock</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouvelle sortie
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-xl shadow-sm border p-4">
        <div className="flex flex-wrap gap-4">
          <div className="flex-1 min-w-[200px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Rechercher..."
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
            {TYPE_SORTIE_OPTIONS.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
          <select
            value={filterValide}
            onChange={(e) => setFilterValide(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="true">Validées</option>
            <option value="false">En attente</option>
          </select>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        {loading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
        ) : error ? (
          <div className="flex items-center justify-center h-64 text-red-500">
            <AlertCircle className="w-5 h-5 mr-2" />
            {error}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">N° Sortie</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Article / Lot</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Quantité</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredSorties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucune sortie trouvée
                  </td>
                </tr>
              ) : (
                filteredSorties.map((sortie) => (
                  <tr key={sortie.id} className="hover:bg-gray-50">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <ArrowDownRight className="w-4 h-4 text-red-500" />
                        <span className="font-medium">{sortie.numero_sortie}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium text-gray-900">{sortie.article_nom}</p>
                        <p className="text-sm text-gray-500">Lot: {sortie.lot_numero}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-medium text-red-600">-{sortie.quantite}</span>
                      <span className="text-gray-500 ml-1">{sortie.unite}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-1 text-xs font-medium rounded-full bg-gray-100 text-gray-700">
                        {sortie.type_sortie_display}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-gray-600">
                      {new Date(sortie.date_sortie).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-4 py-3">
                      {sortie.valide ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-green-100 text-green-700">
                          <Check className="w-3 h-3" />
                          Validée
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full bg-yellow-100 text-yellow-700">
                          En attente
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex items-center justify-end gap-2">
                        {!sortie.valide && (
                          <>
                            <button
                              onClick={() => handleValider(sortie.id)}
                              className="p-1 text-green-600 hover:bg-green-50 rounded"
                              title="Valider"
                            >
                              <Check className="w-5 h-5" />
                            </button>
                            <button
                              onClick={() => handleAnnuler(sortie.id)}
                              className="p-1 text-red-600 hover:bg-red-50 rounded"
                              title="Annuler"
                            >
                              <X className="w-5 h-5" />
                            </button>
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Nouvelle Sortie */}
      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Nouvelle sortie de stock"
        subtitle="Enregistrer une sortie de matériel ou réactif"
        icon={<PackageMinus className="w-6 h-6 text-white" />}
        headerClassName="bg-gradient-to-r from-red-500 to-orange-500"
        size="lg"
      >
        <form onSubmit={handleCreate}>
          <ModalBody className="space-y-5">
            {formError && (
              <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded-r-xl">
                <div className="flex items-center gap-2">
                  <AlertCircle className="w-5 h-5 text-red-500" />
                  <p className="text-red-700 font-medium">{formError}</p>
                </div>
              </div>
            )}

            {/* Sélection du lot */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Lot à prélever <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.lot}
                onChange={(e) => setFormData({ ...formData, lot: e.target.value })}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 bg-white"
                required
              >
                <option value="">Sélectionner un lot...</option>
                {lots.map(lot => (
                  <option key={lot.id} value={lot.id}>
                    {lot.numero_lot} - {lot.article_nom || 'Article'} ({lot.quantite_restante} {lot.unite})
                  </option>
                ))}
              </select>
              {selectedLot && (
                <div className="mt-2 p-3 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-100">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <Package className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <p className="font-medium text-gray-900">{selectedLot.article_nom || 'Article sélectionné'}</p>
                      <p className="text-sm text-blue-600">
                        Stock disponible: <span className="font-bold">{selectedLot.quantite_restante} {selectedLot.unite}</span>
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantité et Type en ligne */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Quantité <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  max={selectedLot?.quantite_restante}
                  value={formData.quantite}
                  onChange={(e) => setFormData({ ...formData, quantite: e.target.value })}
                  placeholder="0.00"
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200"
                  required
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  Type de sortie <span className="text-red-500">*</span>
                </label>
                <select
                  value={formData.type_sortie}
                  onChange={(e) => setFormData({ ...formData, type_sortie: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 bg-white"
                  required
                >
                  {TYPE_SORTIE_OPTIONS.map(opt => (
                    <option key={opt.value} value={opt.value}>{opt.label}</option>
                  ))}
                </select>
              </div>
            </div>

            {/* Motif */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Motif / Commentaire
              </label>
              <textarea
                value={formData.motif}
                onChange={(e) => setFormData({ ...formData, motif: e.target.value })}
                placeholder="Précisez la raison de cette sortie..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-red-500 focus:outline-none focus:ring-2 focus:ring-red-500/20 transition-all duration-200 resize-none"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <ModalButton variant="secondary" onClick={() => setShowModal(false)}>
              Annuler
            </ModalButton>
            <ModalButton variant="danger" type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <PackageMinus className="w-4 h-4" />
                  Créer la sortie
                </span>
              )}
            </ModalButton>
          </ModalFooter>
        </form>
      </Modal>
    </div>
  )
}
