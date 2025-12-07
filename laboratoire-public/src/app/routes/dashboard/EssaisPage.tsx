import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function EssaisPage() {
  const [essais, setEssais] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('TOUS')
  const [editingEssai, setEditingEssai] = useState<any>(null)
  const [formData, setFormData] = useState({
    numero: '',
    type_essai: '',
    echantillon_id: '',
    statut: 'EN_ATTENTE',
    date_debut: '',
    date_fin_prevue: '',
    technicien: '',
    norme: '',
    observations: ''
  })

  useEffect(() => {
    loadEssais()
  }, [])

  const loadEssais = async () => {
    try {
      setIsLoading(true)
      const data = await api.essais.list()
      setEssais(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement essais:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingEssai) {
        await api.essais.update(editingEssai.id, formData)
      } else {
        await api.essais.create(formData)
      }
      setShowModal(false)
      setEditingEssai(null)
      resetForm()
      loadEssais()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const handleEdit = (essai: any) => {
    setEditingEssai(essai)
    setFormData({
      numero: essai.numero || '',
      type_essai: essai.type_essai || '',
      echantillon_id: essai.echantillon?.id || '',
      statut: essai.statut || 'EN_ATTENTE',
      date_debut: essai.date_debut || '',
      date_fin_prevue: essai.date_fin_prevue || '',
      technicien: essai.technicien || '',
      norme: essai.norme || '',
      observations: essai.observations || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      numero: '',
      type_essai: '',
      echantillon_id: '',
      statut: 'EN_ATTENTE',
      date_debut: '',
      date_fin_prevue: '',
      technicien: '',
      norme: '',
      observations: ''
    })
  }

  const statutBadgeColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE': 'bg-slate-100 text-slate-700',
      'ATTRIBUE': 'bg-amber-50 text-amber-700',
      'EN_COURS': 'bg-lanema-blue-50 text-lanema-blue-700',
      'TERMINE': 'bg-violet-50 text-violet-700',
      'VALIDE': 'bg-emerald-50 text-emerald-700',
      'CONFORME': 'bg-emerald-50 text-emerald-700',
      'NON_CONFORME': 'bg-rose-50 text-rose-700',
      'ANNULE': 'bg-slate-100 text-slate-500'
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const filteredEssais = essais.filter(e => {
    const matchesSearch = 
      e.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.type_essai?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.echantillon?.code_echantillon?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'TOUS' || e.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion des essais</h1>
          <p className="text-sm text-slate-600 mt-1">Planifiez et suivez tous les essais du laboratoire</p>
        </div>
        <button 
          onClick={() => {
            setEditingEssai(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel essai
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-12 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Total</div>
            <div className="text-2xl font-semibold text-slate-900">{essais.length}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">En attente</div>
            <div className="text-2xl font-semibold text-slate-600">
              {essais.filter(e => e.statut === 'EN_ATTENTE').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">En cours</div>
            <div className="text-2xl font-semibold text-lanema-blue-600">
              {essais.filter(e => e.statut === 'EN_COURS').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Terminés</div>
            <div className="text-2xl font-semibold text-violet-600">
              {essais.filter(e => e.statut === 'TERMINE').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Conformes</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {essais.filter(e => e.statut === 'CONFORME' || e.statut === 'VALIDE').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Non conformes</div>
            <div className="text-2xl font-semibold text-rose-600">
              {essais.filter(e => e.statut === 'NON_CONFORME').length}
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="lanema-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Rechercher par numéro, type ou échantillon..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
          />
          <select
            value={filterStatut}
            onChange={(e) => setFilterStatut(e.target.value)}
            className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
          >
            <option value="TOUS">Tous les statuts</option>
            <option value="EN_ATTENTE">En attente</option>
            <option value="ATTRIBUE">Attribué</option>
            <option value="EN_COURS">En cours</option>
            <option value="TERMINE">Terminé</option>
            <option value="VALIDE">Validé</option>
            <option value="CONFORME">Conforme</option>
            <option value="NON_CONFORME">Non conforme</option>
          </select>
        </div>
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-16 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredEssais.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun essai trouvé</h3>
          <p className="text-sm text-slate-600">Commencez par planifier un nouvel essai</p>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Numéro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Type d'essai</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Échantillon</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Technicien</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Date début</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredEssais.map((essai) => (
                  <tr key={essai.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">
                      {essai.numero}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-700">
                      {essai.type_essai}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {essai.echantillon?.code_echantillon || 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {essai.technicien || 'Non assigné'}
                    </td>
                    <td className="px-4 py-3 text-sm text-slate-600">
                      {essai.date_debut ? new Date(essai.date_debut).toLocaleDateString('fr-FR') : 'N/A'}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statutBadgeColor(essai.statut)}`}>
                        {essai.statut?.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(essai)}
                          className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium hover:underline"
                        >
                          Éditer
                        </button>
                        {essai.rapport_pdf && (
                          <a
                            href={essai.rapport_pdf}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-sm text-slate-600 hover:text-slate-700"
                            title="Télécharger rapport"
                          >
                            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingEssai ? 'Modifier l\'essai' : 'Nouvel essai'}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setEditingEssai(null)
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Numéro essai *
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="ESS-2024-XXXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type d'essai *
                    </label>
                    <input
                      type="text"
                      value={formData.type_essai}
                      onChange={(e) => setFormData({...formData, type_essai: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Résistance à la compression..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Technicien
                    </label>
                    <input
                      type="text"
                      value={formData.technicien}
                      onChange={(e) => setFormData({...formData, technicien: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Nom du technicien"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Statut *
                    </label>
                    <select
                      value={formData.statut}
                      onChange={(e) => setFormData({...formData, statut: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    >
                      <option value="EN_ATTENTE">En attente</option>
                      <option value="ATTRIBUE">Attribué</option>
                      <option value="EN_COURS">En cours</option>
                      <option value="TERMINE">Terminé</option>
                      <option value="VALIDE">Validé</option>
                      <option value="CONFORME">Conforme</option>
                      <option value="NON_CONFORME">Non conforme</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date début
                    </label>
                    <input
                      type="date"
                      value={formData.date_debut}
                      onChange={(e) => setFormData({...formData, date_debut: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date fin prévue
                    </label>
                    <input
                      type="date"
                      value={formData.date_fin_prevue}
                      onChange={(e) => setFormData({...formData, date_fin_prevue: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Norme appliquée
                    </label>
                    <input
                      type="text"
                      value={formData.norme}
                      onChange={(e) => setFormData({...formData, norme: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="NF EN 206, ISO 9001..."
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Observations
                    </label>
                    <textarea
                      value={formData.observations}
                      onChange={(e) => setFormData({...formData, observations: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Remarques sur l'essai..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingEssai ? 'Mettre à jour' : 'Créer l\'essai'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingEssai(null)
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
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
