import { useState, useEffect } from 'react'
import { 
  ClipboardList, 
  Plus, 
  Search, 
  Play,
  CheckCircle,
  XCircle,
  RefreshCw,
  Eye,
  Edit3,
  AlertCircle,
  Clock,
  Check,
  Calendar,
  Warehouse,
  FileText,
  Package,
  TrendingUp,
  TrendingDown,
  Minus
} from 'lucide-react'
import { stockAPI } from '../../../services/api'
import { Modal, ModalBody, ModalFooter, ModalButton } from '../../../components/ui/Modal'

interface Inventaire {
  id: number
  numero_inventaire: string
  type_inventaire: string
  type_inventaire_display: string
  statut: string
  statut_display: string
  entrepot: number | null
  entrepot_nom: string | null
  date_debut: string
  date_fin: string | null
  responsable_nom: string | null
  observations: string
  nb_lignes: number
  nb_lignes_comptees: number
  total_ecarts: number
}

interface LigneInventaire {
  id: number
  article_nom: string
  article_reference: string
  lot_numero: string | null
  emplacement_code: string | null
  quantite_theorique: number
  quantite_comptee: number | null
  ecart: number
  unite: string
  commentaire: string
  compte_par_nom: string | null
  date_comptage: string | null
}

interface Entrepot {
  id: number
  nom: string
}

const TYPE_OPTIONS = [
  { value: 'COMPLET', label: 'Inventaire complet' },
  { value: 'PARTIEL', label: 'Inventaire partiel' },
  { value: 'TOURNANT', label: 'Inventaire tournant' },
  { value: 'ANNUEL', label: 'Inventaire annuel' },
]

const STATUT_COLORS: Record<string, { bg: string; text: string }> = {
  PLANIFIE: { bg: 'bg-blue-100', text: 'text-blue-700' },
  EN_COURS: { bg: 'bg-yellow-100', text: 'text-yellow-700' },
  TERMINE: { bg: 'bg-orange-100', text: 'text-orange-700' },
  VALIDE: { bg: 'bg-green-100', text: 'text-green-700' },
  ANNULE: { bg: 'bg-red-100', text: 'text-red-700' },
}

export function InventairePage() {
  const [inventaires, setInventaires] = useState<Inventaire[]>([])
  const [entrepots, setEntrepots] = useState<Entrepot[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('')
  
  // Modal création
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [formData, setFormData] = useState({
    type_inventaire: 'COMPLET',
    entrepot: '',
    date_debut: new Date().toISOString().slice(0, 16),
    observations: ''
  })
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)
  
  // Modal comptage
  const [showCountModal, setShowCountModal] = useState(false)
  const [selectedInventaire, setSelectedInventaire] = useState<Inventaire | null>(null)
  const [lignes, setLignes] = useState<LigneInventaire[]>([])
  const [loadingLignes, setLoadingLignes] = useState(false)
  const [resume, setResume] = useState<any>(null)

  useEffect(() => {
    loadData()
  }, [filterStatut])

  const loadData = async () => {
    try {
      setLoading(true)
      const params: Record<string, string> = {}
      if (filterStatut) params.statut = filterStatut
      
      const [invData, entData] = await Promise.all([
        stockAPI.inventaires.list(params),
        stockAPI.entrepots.list()
      ])
      
      setInventaires(Array.isArray(invData) ? invData : invData.results || [])
      setEntrepots(Array.isArray(entData) ? entData : entData.results || [])
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
      await stockAPI.inventaires.create({
        type_inventaire: formData.type_inventaire,
        entrepot: formData.entrepot ? parseInt(formData.entrepot) : null,
        date_debut: formData.date_debut,
        observations: formData.observations
      })
      setShowCreateModal(false)
      setFormData({
        type_inventaire: 'COMPLET',
        entrepot: '',
        date_debut: new Date().toISOString().slice(0, 16),
        observations: ''
      })
      loadData()
    } catch (err: any) {
      setFormError(err.message || 'Erreur lors de la création')
    } finally {
      setSubmitting(false)
    }
  }

  const handleDemarrer = async (id: number) => {
    if (!confirm('Démarrer cet inventaire ?')) return
    try {
      await stockAPI.inventaires.demarrer(id.toString())
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur')
    }
  }

  const handleTerminer = async (id: number) => {
    if (!confirm('Terminer cet inventaire ?')) return
    try {
      await stockAPI.inventaires.terminer(id.toString())
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur')
    }
  }

  const handleValider = async (id: number) => {
    if (!confirm('Valider cet inventaire et appliquer les ajustements de stock ?')) return
    try {
      await stockAPI.inventaires.valider(id.toString())
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur')
    }
  }

  const handleAnnuler = async (id: number) => {
    if (!confirm('Annuler cet inventaire ?')) return
    try {
      await stockAPI.inventaires.annuler(id.toString())
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur')
    }
  }

  const openCountModal = async (inventaire: Inventaire) => {
    setSelectedInventaire(inventaire)
    setShowCountModal(true)
    setLoadingLignes(true)
    
    try {
      const [lignesData, resumeData] = await Promise.all([
        stockAPI.inventaires.lignes(inventaire.id.toString()),
        stockAPI.inventaires.resume(inventaire.id.toString())
      ])
      setLignes(Array.isArray(lignesData) ? lignesData : lignesData.results || [])
      setResume(resumeData)
    } catch (err: any) {
      alert(err.message || 'Erreur lors du chargement')
    } finally {
      setLoadingLignes(false)
    }
  }

  const handleCompterLigne = async (ligneId: number, quantite: string, commentaire: string) => {
    if (!selectedInventaire) return
    
    try {
      await stockAPI.inventaires.compterLigne(
        selectedInventaire.id.toString(),
        ligneId.toString(),
        parseFloat(quantite),
        commentaire
      )
      
      // Recharger les lignes et le résumé
      const [lignesData, resumeData] = await Promise.all([
        stockAPI.inventaires.lignes(selectedInventaire.id.toString()),
        stockAPI.inventaires.resume(selectedInventaire.id.toString())
      ])
      setLignes(Array.isArray(lignesData) ? lignesData : lignesData.results || [])
      setResume(resumeData)
      loadData()
    } catch (err: any) {
      alert(err.message || 'Erreur lors du comptage')
    }
  }

  const filteredInventaires = inventaires.filter(i =>
    i.numero_inventaire.toLowerCase().includes(searchTerm.toLowerCase()) ||
    i.entrepot_nom?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Inventaires</h1>
          <p className="text-gray-600">Gestion des inventaires physiques</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
        >
          <Plus className="w-5 h-5" />
          Nouvel inventaire
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
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Tous les statuts</option>
            <option value="PLANIFIE">Planifiés</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminés</option>
            <option value="VALIDE">Validés</option>
            <option value="ANNULE">Annulés</option>
          </select>
          <button
            onClick={loadData}
            className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Liste */}
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
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">N° Inventaire</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Type</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Entrepôt</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Progression</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Date</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-gray-600">Statut</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-gray-600">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {filteredInventaires.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-8 text-center text-gray-500">
                    Aucun inventaire trouvé
                  </td>
                </tr>
              ) : (
                filteredInventaires.map((inv) => {
                  const colors = STATUT_COLORS[inv.statut] || { bg: 'bg-gray-100', text: 'text-gray-700' }
                  const progression = inv.nb_lignes > 0 ? Math.round((inv.nb_lignes_comptees / inv.nb_lignes) * 100) : 0
                  return (
                    <tr key={inv.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <ClipboardList className="w-4 h-4 text-purple-500" />
                          <span className="font-medium">{inv.numero_inventaire}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {inv.type_inventaire_display}
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {inv.entrepot_nom || 'Tous'}
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden max-w-[100px]">
                            <div 
                              className="h-full bg-blue-500 rounded-full"
                              style={{ width: `${progression}%` }}
                            />
                          </div>
                          <span className="text-sm text-gray-600">{progression}%</span>
                        </div>
                        <p className="text-xs text-gray-400">{inv.nb_lignes_comptees}/{inv.nb_lignes} lignes</p>
                      </td>
                      <td className="px-4 py-3 text-sm text-gray-600">
                        {new Date(inv.date_debut).toLocaleDateString('fr-FR')}
                      </td>
                      <td className="px-4 py-3">
                        <span className={`inline-flex items-center gap-1 px-2 py-1 text-xs font-medium rounded-full ${colors.bg} ${colors.text}`}>
                          {inv.statut_display}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {inv.statut === 'PLANIFIE' && (
                            <button
                              onClick={() => handleDemarrer(inv.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Démarrer"
                            >
                              <Play className="w-4 h-4" />
                            </button>
                          )}
                          {inv.statut === 'EN_COURS' && (
                            <>
                              <button
                                onClick={() => openCountModal(inv)}
                                className="p-1.5 text-blue-600 hover:bg-blue-50 rounded"
                                title="Compter"
                              >
                                <Edit3 className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => handleTerminer(inv.id)}
                                className="p-1.5 text-orange-600 hover:bg-orange-50 rounded"
                                title="Terminer"
                              >
                                <Clock className="w-4 h-4" />
                              </button>
                            </>
                          )}
                          {inv.statut === 'TERMINE' && (
                            <button
                              onClick={() => handleValider(inv.id)}
                              className="p-1.5 text-green-600 hover:bg-green-50 rounded"
                              title="Valider"
                            >
                              <CheckCircle className="w-4 h-4" />
                            </button>
                          )}
                          {['PLANIFIE', 'EN_COURS', 'TERMINE'].includes(inv.statut) && (
                            <button
                              onClick={() => handleAnnuler(inv.id)}
                              className="p-1.5 text-red-600 hover:bg-red-50 rounded"
                              title="Annuler"
                            >
                              <XCircle className="w-4 h-4" />
                            </button>
                          )}
                          <button
                            onClick={() => openCountModal(inv)}
                            className="p-1.5 text-gray-600 hover:bg-gray-50 rounded"
                            title="Voir détails"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        )}
      </div>

      {/* Modal Création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvel inventaire"
        subtitle="Planifier un inventaire physique du stock"
        icon={<ClipboardList className="w-6 h-6 text-white" />}
        headerClassName="bg-gradient-to-r from-purple-600 to-indigo-600"
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

            {/* Type d'inventaire avec icônes */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type d'inventaire <span className="text-red-500">*</span>
              </label>
              <div className="grid grid-cols-2 gap-3">
                {TYPE_OPTIONS.map(opt => (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type_inventaire: opt.value })}
                    className={`
                      p-4 rounded-xl border-2 text-left transition-all duration-200
                      ${formData.type_inventaire === opt.value 
                        ? 'border-purple-500 bg-purple-50 shadow-md' 
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                      }
                    `}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                        formData.type_inventaire === opt.value ? 'bg-purple-100' : 'bg-gray-100'
                      }`}>
                        <ClipboardList className={`w-5 h-5 ${
                          formData.type_inventaire === opt.value ? 'text-purple-600' : 'text-gray-500'
                        }`} />
                      </div>
                      <span className={`font-medium ${
                        formData.type_inventaire === opt.value ? 'text-purple-700' : 'text-gray-700'
                      }`}>
                        {opt.label}
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Entrepôt et Date */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Warehouse className="w-4 h-4 inline mr-1" />
                  Entrepôt
                </label>
                <select
                  value={formData.entrepot}
                  onChange={(e) => setFormData({ ...formData, entrepot: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 bg-white"
                >
                  <option value="">Tous les entrepôts</option>
                  {entrepots.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-semibold text-gray-700">
                  <Calendar className="w-4 h-4 inline mr-1" />
                  Date de début <span className="text-red-500">*</span>
                </label>
                <input
                  type="datetime-local"
                  value={formData.date_debut}
                  onChange={(e) => setFormData({ ...formData, date_debut: e.target.value })}
                  className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                  required
                />
              </div>
            </div>

            {/* Observations */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-gray-700">
                <FileText className="w-4 h-4 inline mr-1" />
                Observations
              </label>
              <textarea
                value={formData.observations}
                onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
                placeholder="Notes ou instructions pour cet inventaire..."
                rows={3}
                className="w-full px-4 py-3 rounded-xl border-2 border-gray-200 hover:border-gray-300 focus:border-purple-500 focus:outline-none focus:ring-2 focus:ring-purple-500/20 transition-all duration-200 resize-none"
              />
            </div>
          </ModalBody>

          <ModalFooter>
            <ModalButton variant="secondary" onClick={() => setShowCreateModal(false)}>
              Annuler
            </ModalButton>
            <ModalButton variant="primary" type="submit" disabled={submitting}>
              {submitting ? (
                <span className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Création...
                </span>
              ) : (
                <span className="flex items-center gap-2">
                  <Plus className="w-4 h-4" />
                  Créer l'inventaire
                </span>
              )}
            </ModalButton>
          </ModalFooter>
        </form>
      </Modal>

      {/* Modal Comptage */}
      <Modal
        isOpen={showCountModal && selectedInventaire !== null}
        onClose={() => setShowCountModal(false)}
        title={selectedInventaire?.numero_inventaire || 'Inventaire'}
        subtitle={`${selectedInventaire?.type_inventaire_display || ''} - ${selectedInventaire?.statut_display || ''}`}
        icon={<ClipboardList className="w-6 h-6 text-white" />}
        headerClassName="bg-gradient-to-r from-indigo-600 to-purple-600"
        size="full"
      >
        <div className="flex flex-col max-h-[calc(100vh-280px)]">
          {/* Résumé avec cards stylisées */}
          {resume && (
            <div className="px-6 py-5 bg-gradient-to-r from-gray-50 to-slate-50 border-b">
              <div className="grid grid-cols-5 gap-4">
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-gray-100 rounded-lg flex items-center justify-center">
                    <Package className="w-5 h-5 text-gray-600" />
                  </div>
                  <p className="text-2xl font-bold text-gray-900">{resume.total_lignes}</p>
                  <p className="text-xs text-gray-500 font-medium">Total lignes</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-green-100 rounded-lg flex items-center justify-center">
                    <Check className="w-5 h-5 text-green-600" />
                  </div>
                  <p className="text-2xl font-bold text-green-600">{resume.lignes_comptees}</p>
                  <p className="text-xs text-gray-500 font-medium">Comptées</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-yellow-100 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-yellow-600" />
                  </div>
                  <p className="text-2xl font-bold text-yellow-600">{resume.lignes_restantes}</p>
                  <p className="text-xs text-gray-500 font-medium">Restantes</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className="w-10 h-10 mx-auto mb-2 bg-blue-100 rounded-lg flex items-center justify-center">
                    <RefreshCw className="w-5 h-5 text-blue-600" />
                  </div>
                  <p className="text-2xl font-bold text-blue-600">{resume.progression}%</p>
                  <p className="text-xs text-gray-500 font-medium">Progression</p>
                </div>
                <div className="bg-white rounded-xl p-4 shadow-sm border text-center">
                  <div className={`w-10 h-10 mx-auto mb-2 rounded-lg flex items-center justify-center ${
                    resume.ecart_total > 0 ? 'bg-green-100' : resume.ecart_total < 0 ? 'bg-red-100' : 'bg-gray-100'
                  }`}>
                    {resume.ecart_total > 0 ? (
                      <TrendingUp className="w-5 h-5 text-green-600" />
                    ) : resume.ecart_total < 0 ? (
                      <TrendingDown className="w-5 h-5 text-red-600" />
                    ) : (
                      <Minus className="w-5 h-5 text-gray-600" />
                    )}
                  </div>
                  <p className={`text-2xl font-bold ${
                    resume.ecart_total > 0 ? 'text-green-600' : resume.ecart_total < 0 ? 'text-red-600' : 'text-gray-600'
                  }`}>
                    {resume.ecart_total > 0 ? '+' : ''}{resume.ecart_total}
                  </p>
                  <p className="text-xs text-gray-500 font-medium">Écart total</p>
                </div>
              </div>
              
              {/* Barre de progression */}
              <div className="mt-4">
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-500"
                    style={{ width: `${resume.progression}%` }}
                  />
                </div>
              </div>
            </div>
          )}
          
          {/* Lignes */}
          <div className="flex-1 overflow-y-auto p-6">
            {loadingLignes ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-purple-200 border-t-purple-600"></div>
              </div>
            ) : (
              <div className="bg-white rounded-xl border shadow-sm overflow-hidden">
                <table className="w-full">
                  <thead className="bg-gradient-to-r from-gray-50 to-slate-50 sticky top-0">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Article</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Lot</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté théorique</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Qté comptée</th>
                      <th className="px-4 py-3 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Écart</th>
                      <th className="px-4 py-3 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Commentaire</th>
                      {selectedInventaire?.statut === 'EN_COURS' && (
                        <th className="px-4 py-3 text-center text-xs font-semibold text-gray-600 uppercase tracking-wider">Action</th>
                      )}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {lignes.map((ligne) => (
                      <LigneRow 
                        key={ligne.id} 
                        ligne={ligne} 
                        canEdit={selectedInventaire?.statut === 'EN_COURS'}
                        onCompter={handleCompterLigne}
                      />
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
        
        <ModalFooter>
          <ModalButton variant="secondary" onClick={() => setShowCountModal(false)}>
            Fermer
          </ModalButton>
        </ModalFooter>
      </Modal>
    </div>
  )
}

// Composant ligne séparé pour gérer l'édition
function LigneRow({ 
  ligne, 
  canEdit, 
  onCompter 
}: { 
  ligne: LigneInventaire
  canEdit: boolean
  onCompter: (id: number, quantite: string, commentaire: string) => void 
}) {
  const [editing, setEditing] = useState(false)
  const [quantite, setQuantite] = useState(ligne.quantite_comptee?.toString() || '')
  const [commentaire, setCommentaire] = useState(ligne.commentaire || '')

  const handleSave = () => {
    if (!quantite) return
    onCompter(ligne.id, quantite, commentaire)
    setEditing(false)
  }

  return (
    <tr className={ligne.quantite_comptee === null ? 'bg-yellow-50' : ''}>
      <td className="px-3 py-2">
        <p className="font-medium text-sm">{ligne.article_nom}</p>
        <p className="text-xs text-gray-500">{ligne.article_reference}</p>
      </td>
      <td className="px-3 py-2 text-sm text-gray-600">
        {ligne.lot_numero || '-'}
      </td>
      <td className="px-3 py-2 text-right text-sm font-medium">
        {ligne.quantite_theorique} {ligne.unite}
      </td>
      <td className="px-3 py-2 text-right">
        {editing ? (
          <input
            type="number"
            step="0.01"
            value={quantite}
            onChange={(e) => setQuantite(e.target.value)}
            className="w-20 px-2 py-1 border rounded text-right text-sm"
            autoFocus
          />
        ) : (
          <span className={`text-sm font-medium ${ligne.quantite_comptee === null ? 'text-gray-400' : ''}`}>
            {ligne.quantite_comptee !== null ? `${ligne.quantite_comptee} ${ligne.unite}` : 'Non compté'}
          </span>
        )}
      </td>
      <td className="px-3 py-2 text-right">
        {ligne.quantite_comptee !== null && (
          <span className={`text-sm font-bold ${ligne.ecart > 0 ? 'text-green-600' : ligne.ecart < 0 ? 'text-red-600' : 'text-gray-600'}`}>
            {ligne.ecart > 0 ? '+' : ''}{ligne.ecart}
          </span>
        )}
      </td>
      <td className="px-3 py-2">
        {editing ? (
          <input
            type="text"
            value={commentaire}
            onChange={(e) => setCommentaire(e.target.value)}
            className="w-full px-2 py-1 border rounded text-sm"
            placeholder="Commentaire..."
          />
        ) : (
          <span className="text-xs text-gray-500">{ligne.commentaire}</span>
        )}
      </td>
      {canEdit && (
        <td className="px-3 py-2 text-center">
          {editing ? (
            <div className="flex items-center justify-center gap-1">
              <button
                onClick={handleSave}
                className="p-1 text-green-600 hover:bg-green-50 rounded"
              >
                <Check className="w-4 h-4" />
              </button>
              <button
                onClick={() => setEditing(false)}
                className="p-1 text-gray-400 hover:bg-gray-50 rounded"
              >
                ✕
              </button>
            </div>
          ) : (
            <button
              onClick={() => setEditing(true)}
              className="p-1 text-blue-600 hover:bg-blue-50 rounded"
            >
              <Edit3 className="w-4 h-4" />
            </button>
          )}
        </td>
      )}
    </tr>
  )
}
