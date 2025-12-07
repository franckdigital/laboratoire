import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function MetrologiePage() {
  const [equipements, setEquipements] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingEquipement, setEditingEquipement] = useState<any>(null)
  const [formData, setFormData] = useState({
    code: '',
    designation: '',
    type: 'BALANCE',
    marque: '',
    modele: '',
    numero_serie: '',
    localisation: '',
    frequence_etalonnage: '12',
    date_dernier_etalonnage: '',
    date_prochain_etalonnage: '',
    statut: 'OPERATIONNEL'
  })

  useEffect(() => {
    loadEquipements()
  }, [])

  const loadEquipements = async () => {
    try {
      setIsLoading(true)
      const data = await api.metrologie.list()
      setEquipements(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement équipements:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEquipement) {
        await api.metrologie.update(editingEquipement.id, formData)
      } else {
        await api.metrologie.create(formData)
      }
      setShowModal(false)
      setEditingEquipement(null)
      resetForm()
      loadEquipements()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const handleEdit = (equipement: any) => {
    setEditingEquipement(equipement)
    setFormData({
      code: equipement.code || '',
      designation: equipement.designation || '',
      type: equipement.type || 'BALANCE',
      marque: equipement.marque || '',
      modele: equipement.modele || '',
      numero_serie: equipement.numero_serie || '',
      localisation: equipement.localisation || '',
      frequence_etalonnage: equipement.frequence_etalonnage?.toString() || '12',
      date_dernier_etalonnage: equipement.date_dernier_etalonnage || '',
      date_prochain_etalonnage: equipement.date_prochain_etalonnage || '',
      statut: equipement.statut || 'OPERATIONNEL'
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      code: '',
      designation: '',
      type: 'BALANCE',
      marque: '',
      modele: '',
      numero_serie: '',
      localisation: '',
      frequence_etalonnage: '12',
      date_dernier_etalonnage: '',
      date_prochain_etalonnage: '',
      statut: 'OPERATIONNEL'
    })
  }

  const statutBadgeColor = (statut: string) => {
    const colors: Record<string, string> = {
      'OPERATIONNEL': 'bg-emerald-50 text-emerald-700',
      'ETALONNAGE_REQUIS': 'bg-amber-50 text-amber-700',
      'MAINTENANCE': 'bg-rose-50 text-rose-700',
      'HORS_SERVICE': 'bg-slate-100 text-slate-500'
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const filteredEquipements = equipements.filter(e =>
    e.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Métrologie</h1>
          <p className="text-sm text-slate-600 mt-1">Gestion des équipements et étalonnages</p>
        </div>
        <button 
          onClick={() => {
            setEditingEquipement(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel équipement
        </button>
      </div>

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
            <div className="text-xs text-slate-500 mb-1">Total équipements</div>
            <div className="text-2xl font-semibold text-slate-900">{equipements.length}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Opérationnels</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {equipements.filter(e => e.statut === 'OPERATIONNEL').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Étalonnage requis</div>
            <div className="text-2xl font-semibold text-amber-600">
              {equipements.filter(e => e.statut === 'ETALONNAGE_REQUIS').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Maintenance</div>
            <div className="text-2xl font-semibold text-rose-600">
              {equipements.filter(e => e.statut === 'MAINTENANCE').length}
            </div>
          </div>
        </div>
      )}

      <div className="lanema-card p-4">
        <input
          type="text"
          placeholder="Rechercher par code ou désignation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
        />
      </div>

      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredEquipements.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 3v2m6-2v2M9 19v2m6-2v2M5 9H3m2 6H3m18-6h-2m2 6h-2M7 19h10a2 2 0 002-2V7a2 2 0 00-2-2H7a2 2 0 00-2 2v10a2 2 0 002 2zM9 9h6v6H9V9z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun équipement trouvé</h3>
          <p className="text-sm text-slate-600">Ajoutez un équipement à gérer</p>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Code</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Dernier étalonnage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Prochain étalonnage</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEquipements.map((equipement) => (
                  <tr key={equipement.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{equipement.code}</td>
                    <td className="px-4 py-3 text-sm text-slate-700">{equipement.designation}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{equipement.type}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {equipement.date_dernier_etalonnage ? new Date(equipement.date_dernier_etalonnage).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {equipement.date_prochain_etalonnage ? new Date(equipement.date_prochain_etalonnage).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statutBadgeColor(equipement.statut)}`}>
                        {equipement.statut?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleEdit(equipement)}
                        className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium hover:underline"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingEquipement ? 'Modifier l\'équipement' : 'Nouvel équipement'}
                </h3>
                <button onClick={() => { setShowModal(false); setEditingEquipement(null) }} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Code *</label>
                    <input type="text" value={formData.code} onChange={(e) => setFormData({...formData, code: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Type *</label>
                    <select value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500">
                      <option value="BALANCE">Balance</option>
                      <option value="ETUVE">Étuve</option>
                      <option value="PRESSE">Presse</option>
                      <option value="TAMIS">Tamis</option>
                      <option value="AUTRE">Autre</option>
                    </select>
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">Désignation *</label>
                    <input type="text" value={formData.designation} onChange={(e) => setFormData({...formData, designation: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" required />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Marque</label>
                    <input type="text" value={formData.marque} onChange={(e) => setFormData({...formData, marque: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Modèle</label>
                    <input type="text" value={formData.modele} onChange={(e) => setFormData({...formData, modele: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Date dernier étalonnage</label>
                    <input type="date" value={formData.date_dernier_etalonnage} onChange={(e) => setFormData({...formData, date_dernier_etalonnage: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Prochain étalonnage</label>
                    <input type="date" value={formData.date_prochain_etalonnage} onChange={(e) => setFormData({...formData, date_prochain_etalonnage: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Statut *</label>
                    <select value={formData.statut} onChange={(e) => setFormData({...formData, statut: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500">
                      <option value="OPERATIONNEL">Opérationnel</option>
                      <option value="ETALONNAGE_REQUIS">Étalonnage requis</option>
                      <option value="MAINTENANCE">Maintenance</option>
                      <option value="HORS_SERVICE">Hors service</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">Localisation</label>
                    <input type="text" value={formData.localisation} onChange={(e) => setFormData({...formData, localisation: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition">
                    {editingEquipement ? 'Mettre à jour' : 'Créer'}
                  </button>
                  <button type="button" onClick={() => { setShowModal(false); setEditingEquipement(null) }} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
