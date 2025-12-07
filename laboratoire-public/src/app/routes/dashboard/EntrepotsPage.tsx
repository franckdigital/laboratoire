import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { AlertModal } from '../../../components/AlertModal'
import { Toast } from '../../../components/Toast'

interface Entrepot {
  id: string
  code: string
  nom: string
  type_entrepot: string
  temperature_min?: number
  temperature_max?: number
  humidite_controllee: boolean
  adresse?: string
  surface_m2?: number
  responsable?: string
  responsable_nom?: string
  nombre_emplacements: number
  est_actif: boolean
  date_creation: string
}

export function EntrepotsPage() {
  const [entrepots, setEntrepots] = useState<Entrepot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEntrepot, setEditingEntrepot] = useState<Entrepot | null>(null)
  const [deletingEntrepot, setDeletingEntrepot] = useState<Entrepot | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  
  const [formData, setFormData] = useState({
    code: '',
    nom: '',
    type_entrepot: 'MAGASIN_PRINCIPAL',
    temperature_min: '',
    temperature_max: '',
    humidite_controllee: false,
    adresse: '',
    surface_m2: '',
    est_actif: true
  })

  useEffect(() => {
    loadEntrepots()
  }, [])

  const loadEntrepots = async () => {
    try {
      setIsLoading(true)
      const data = await api.stock.entrepots.list()
      setEntrepots(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const payload = {
        ...formData,
        temperature_min: formData.temperature_min ? Number(formData.temperature_min) : null,
        temperature_max: formData.temperature_max ? Number(formData.temperature_max) : null,
        surface_m2: formData.surface_m2 ? Number(formData.surface_m2) : null
      }

      if (editingEntrepot) {
        await api.stock.entrepots.update(editingEntrepot.id, payload)
        setToast({ message: 'Entrepôt modifié avec succès', type: 'success' })
      } else {
        await api.stock.entrepots.create(payload)
        setToast({ message: 'Entrepôt créé avec succès', type: 'success' })
      }
      
      setShowModal(false)
      setEditingEntrepot(null)
      resetForm()
      loadEntrepots()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la sauvegarde', type: 'error' })
    }
  }

  const handleEdit = (entrepot: Entrepot) => {
    setEditingEntrepot(entrepot)
    setFormData({
      code: entrepot.code || '',
      nom: entrepot.nom || '',
      type_entrepot: entrepot.type_entrepot || 'MAGASIN_PRINCIPAL',
      temperature_min: entrepot.temperature_min?.toString() || '',
      temperature_max: entrepot.temperature_max?.toString() || '',
      humidite_controllee: entrepot.humidite_controllee || false,
      adresse: entrepot.adresse || '',
      surface_m2: entrepot.surface_m2?.toString() || '',
      est_actif: entrepot.est_actif
    })
    setShowModal(true)
  }

  const handleDeleteClick = (entrepot: Entrepot) => {
    setDeletingEntrepot(entrepot)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingEntrepot) return
    
    try {
      await api.stock.entrepots.delete(deletingEntrepot.id)
      setToast({ message: 'Entrepôt supprimé avec succès', type: 'success' })
      setShowDeleteModal(false)
      setDeletingEntrepot(null)
      loadEntrepots()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la suppression', type: 'error' })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      nom: '',
      type_entrepot: 'MAGASIN_PRINCIPAL',
      temperature_min: '',
      temperature_max: '',
      humidite_controllee: false,
      adresse: '',
      surface_m2: '',
      est_actif: true
    })
  }

  const filteredEntrepots = entrepots.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.code.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const TYPE_ENTREPOT_CHOICES = {
    'MAGASIN_PRINCIPAL': 'Magasin principal',
    'CHAMBRE_FROIDE': 'Chambre froide',
    'SALLE_REACTIFS': 'Salle réactifs',
    'ZONE_QUARANTAINE': 'Zone quarantaine',
    'ARCHIVES': 'Archives',
    'AUTRE': 'Autre'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Entrepôts</h1>
          <p className="text-gray-600 mt-1">Gérez les entrepôts et leurs conditions de stockage</p>
        </div>
        <button
          onClick={() => {
            setEditingEntrepot(null)
            resetForm()
            setShowModal(true)
          }}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Entrepôt
        </button>
      </div>

      {/* Search */}
      <div className="bg-white rounded-lg shadow p-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou code..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
        />
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nom</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Température</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Surface</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Emplacements</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Chargement...
                </td>
              </tr>
            ) : filteredEntrepots.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                  Aucun entrepôt trouvé
                </td>
              </tr>
            ) : (
              filteredEntrepots.map((entrepot) => (
                <tr key={entrepot.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{entrepot.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{entrepot.nom}</div>
                    {entrepot.adresse && (
                      <div className="text-sm text-gray-500">{entrepot.adresse}</div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {TYPE_ENTREPOT_CHOICES[entrepot.type_entrepot as keyof typeof TYPE_ENTREPOT_CHOICES]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entrepot.temperature_min && entrepot.temperature_max ? (
                      <span className="text-sm text-gray-900">
                        {entrepot.temperature_min}°C à {entrepot.temperature_max}°C
                      </span>
                    ) : (
                      <span className="text-sm text-gray-400">Non définie</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {entrepot.surface_m2 ? (
                      <span className="text-sm text-gray-900">{entrepot.surface_m2} m²</span>
                    ) : (
                      <span className="text-sm text-gray-400">-</span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-sky-600">{entrepot.nombre_emplacements}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      entrepot.est_actif
                        ? 'bg-emerald-50 text-emerald-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {entrepot.est_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(entrepot)}
                      className="text-sky-600 hover:text-sky-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(entrepot)}
                      className="text-rose-600 hover:text-rose-900"
                    >
                      Supprimer
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Modal Formulaire */}
      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingEntrepot(null)
            resetForm()
          }}
          title={editingEntrepot ? 'Modifier l\'entrepôt' : 'Nouvel entrepôt'}
        >
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Code <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.code}
                  onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.nom}
                  onChange={(e) => setFormData({ ...formData, nom: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Type d'entrepôt <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.type_entrepot}
                  onChange={(e) => setFormData({ ...formData, type_entrepot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  {Object.entries(TYPE_ENTREPOT_CHOICES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Surface (m²)</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.surface_m2}
                  onChange={(e) => setFormData({ ...formData, surface_m2: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Température min (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_min}
                  onChange={(e) => setFormData({ ...formData, temperature_min: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Température max (°C)</label>
                <input
                  type="number"
                  step="0.1"
                  value={formData.temperature_max}
                  onChange={(e) => setFormData({ ...formData, temperature_max: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Adresse</label>
              <textarea
                value={formData.adresse}
                onChange={(e) => setFormData({ ...formData, adresse: e.target.value })}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              />
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.humidite_controllee}
                onChange={(e) => setFormData({ ...formData, humidite_controllee: e.target.checked })}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label className="ml-2 text-sm text-gray-700">Humidité contrôlée</label>
            </div>

            <div className="flex items-center">
              <input
                type="checkbox"
                checked={formData.est_actif}
                onChange={(e) => setFormData({ ...formData, est_actif: e.target.checked })}
                className="w-4 h-4 text-sky-600 border-gray-300 rounded focus:ring-sky-500"
              />
              <label className="ml-2 text-sm text-gray-700">Actif</label>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                type="button"
                onClick={() => {
                  setShowModal(false)
                  setEditingEntrepot(null)
                  resetForm()
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                {editingEntrepot ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Modal de suppression */}
      {showDeleteModal && deletingEntrepot && (
        <AlertModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingEntrepot(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer l'entrepôt "${deletingEntrepot.nom}" ?`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}

      {/* Toast */}
      {toast && (
        <Toast
          message={toast.message}
          type={toast.type}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
