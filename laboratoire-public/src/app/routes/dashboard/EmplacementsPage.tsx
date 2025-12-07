import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { AlertModal } from '../../../components/AlertModal'
import { Toast } from '../../../components/Toast'

interface Emplacement {
  id: string
  code: string
  entrepot: string
  entrepot_nom: string
  type_emplacement: string
  niveau?: string
  allee?: string
  position?: string
  capacite_max?: number
  unite_capacite?: string
  occupation_actuelle: number
  taux_occupation: number
  temperature_min?: number
  temperature_max?: number
  conditions_speciales?: string
  qr_code?: string
  est_actif: boolean
}

export function EmplacementsPage() {
  const [emplacements, setEmplacements] = useState<Emplacement[]>([])
  const [entrepots, setEntrepots] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [editingEmplacement, setEditingEmplacement] = useState<Emplacement | null>(null)
  const [deletingEmplacement, setDeletingEmplacement] = useState<Emplacement | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [entrepotFilter, setEntrepotFilter] = useState<string>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  const [formData, setFormData] = useState({
    code: '',
    entrepot: '',
    type_emplacement: 'ETAGERE',
    niveau: '',
    allee: '',
    position: '',
    capacite_max: '',
    unite_capacite: '',
    temperature_min: '',
    temperature_max: '',
    conditions_speciales: '',
    est_actif: true
  })

  useEffect(() => {
    loadData()
  }, [entrepotFilter])

  const loadData = async () => {
    try {
      setIsLoading(true)
      const [emplacementsData, entrepotsData] = await Promise.all([
        api.stock.emplacements.list(entrepotFilter !== 'all' ? { entrepot: entrepotFilter } : {}),
        api.stock.entrepots.list()
      ])
      setEmplacements(emplacementsData.results || emplacementsData || [])
      setEntrepots(entrepotsData.results || entrepotsData || [])
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
        capacite_max: formData.capacite_max ? Number(formData.capacite_max) : null,
        temperature_min: formData.temperature_min ? Number(formData.temperature_min) : null,
        temperature_max: formData.temperature_max ? Number(formData.temperature_max) : null
      }

      if (editingEmplacement) {
        await api.stock.emplacements.update(editingEmplacement.id, payload)
        setToast({ message: 'Emplacement modifié', type: 'success' })
      } else {
        await api.stock.emplacements.create(payload)
        setToast({ message: 'Emplacement créé', type: 'success' })
      }

      setShowModal(false)
      setEditingEmplacement(null)
      resetForm()
      loadData()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const handleEdit = (emplacement: Emplacement) => {
    setEditingEmplacement(emplacement)
    setFormData({
      code: emplacement.code || '',
      entrepot: emplacement.entrepot || '',
      type_emplacement: emplacement.type_emplacement || 'ETAGERE',
      niveau: emplacement.niveau || '',
      allee: emplacement.allee || '',
      position: emplacement.position || '',
      capacite_max: emplacement.capacite_max?.toString() || '',
      unite_capacite: emplacement.unite_capacite || '',
      temperature_min: emplacement.temperature_min?.toString() || '',
      temperature_max: emplacement.temperature_max?.toString() || '',
      conditions_speciales: emplacement.conditions_speciales || '',
      est_actif: emplacement.est_actif
    })
    setShowModal(true)
  }

  const handleDeleteClick = (emplacement: Emplacement) => {
    setDeletingEmplacement(emplacement)
    setShowDeleteModal(true)
  }

  const confirmDelete = async () => {
    if (!deletingEmplacement) return

    try {
      await api.stock.emplacements.delete(deletingEmplacement.id)
      setToast({ message: 'Emplacement supprimé', type: 'success' })
      setShowDeleteModal(false)
      setDeletingEmplacement(null)
      loadData()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const resetForm = () => {
    setFormData({
      code: '',
      entrepot: '',
      type_emplacement: 'ETAGERE',
      niveau: '',
      allee: '',
      position: '',
      capacite_max: '',
      unite_capacite: '',
      temperature_min: '',
      temperature_max: '',
      conditions_speciales: '',
      est_actif: true
    })
  }

  const filteredEmplacements = emplacements.filter(e =>
    e.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.entrepot_nom.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const TYPE_EMPLACEMENT_CHOICES = {
    'ETAGERE': 'Étagère',
    'ARMOIRE': 'Armoire',
    'REFRIGERATEUR': 'Réfrigérateur',
    'CONGELATEUR': 'Congélateur',
    'ZONE_SOL': 'Zone au sol',
    'AUTRE': 'Autre'
  }

  const getTauxOccupationColor = (taux: number) => {
    if (taux >= 90) return 'bg-rose-500'
    if (taux >= 75) return 'bg-amber-500'
    if (taux >= 50) return 'bg-yellow-500'
    return 'bg-emerald-500'
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gestion des Emplacements</h1>
          <p className="text-gray-600 mt-1">Organisation et suivi des emplacements de stockage</p>
        </div>
        <button
          onClick={() => {
            setEditingEmplacement(null)
            resetForm()
            setShowModal(true)
          }}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex items-center gap-2"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel Emplacement
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Rechercher par code ou entrepôt..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          />
          <select
            value={entrepotFilter}
            onChange={(e) => setEntrepotFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tous les entrepôts</option>
            {entrepots.map(e => (
              <option key={e.id} value={e.id}>{e.nom}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Code</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Entrepôt</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Type</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Position</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Occupation</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : filteredEmplacements.length === 0 ? (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Aucun emplacement trouvé</td>
              </tr>
            ) : (
              filteredEmplacements.map((emplacement) => (
                <tr key={emplacement.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{emplacement.code}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm text-gray-900">{emplacement.entrepot_nom}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">
                      {TYPE_EMPLACEMENT_CHOICES[emplacement.type_emplacement as keyof typeof TYPE_EMPLACEMENT_CHOICES]}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {[emplacement.allee, emplacement.niveau, emplacement.position]
                        .filter(Boolean)
                        .join(' - ') || '-'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900 mb-1">
                      {emplacement.taux_occupation.toFixed(0)}%
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full ${getTauxOccupationColor(emplacement.taux_occupation)}`}
                        style={{ width: `${emplacement.taux_occupation}%` }}
                      />
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      emplacement.est_actif ? 'bg-emerald-50 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {emplacement.est_actif ? 'Actif' : 'Inactif'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => handleEdit(emplacement)}
                      className="text-sky-600 hover:text-sky-900"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDeleteClick(emplacement)}
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

      {showModal && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setEditingEmplacement(null)
            resetForm()
          }}
          title={editingEmplacement ? 'Modifier l\'emplacement' : 'Nouvel emplacement'}
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
                  Entrepôt <span className="text-rose-500">*</span>
                </label>
                <select
                  required
                  value={formData.entrepot}
                  onChange={(e) => setFormData({ ...formData, entrepot: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Sélectionner...</option>
                  {entrepots.map(e => (
                    <option key={e.id} value={e.id}>{e.nom}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={formData.type_emplacement}
                  onChange={(e) => setFormData({ ...formData, type_emplacement: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  {Object.entries(TYPE_EMPLACEMENT_CHOICES).map(([value, label]) => (
                    <option key={value} value={value}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Allée</label>
                <input
                  type="text"
                  value={formData.allee}
                  onChange={(e) => setFormData({ ...formData, allee: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Niveau</label>
                <input
                  type="text"
                  value={formData.niveau}
                  onChange={(e) => setFormData({ ...formData, niveau: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <input
                  type="text"
                  value={formData.position}
                  onChange={(e) => setFormData({ ...formData, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
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
                  setEditingEmplacement(null)
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
                {editingEmplacement ? 'Modifier' : 'Créer'}
              </button>
            </div>
          </form>
        </Modal>
      )}

      {showDeleteModal && deletingEmplacement && (
        <AlertModal
          isOpen={showDeleteModal}
          onClose={() => {
            setShowDeleteModal(false)
            setDeletingEmplacement(null)
          }}
          onConfirm={confirmDelete}
          title="Confirmer la suppression"
          message={`Êtes-vous sûr de vouloir supprimer l'emplacement "${deletingEmplacement.code}" ?`}
          type="danger"
          confirmText="Supprimer"
          cancelText="Annuler"
        />
      )}

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
