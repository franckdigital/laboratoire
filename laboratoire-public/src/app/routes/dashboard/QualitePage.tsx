import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function QualitePage() {
  const [nonConformites, setNonConformites] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterStatut, setFilterStatut] = useState('TOUS')
  const [editingNC, setEditingNC] = useState<any>(null)
  const [formData, setFormData] = useState({
    type_nc: 'INTERNE',
    description: '',
    gravite: 'MINEURE'
  })

  useEffect(() => {
    loadNonConformites()
  }, [])

  const loadNonConformites = async () => {
    try {
      setIsLoading(true)
      const data = await api.qualite.nonConformites()
      setNonConformites(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement non-conformités:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingNC) {
        await api.qualite.update(editingNC.id, formData)
      } else {
        await api.qualite.create(formData)
      }
      setShowModal(false)
      setEditingNC(null)
      resetForm()
      loadNonConformites()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const resetForm = () => {
    setFormData({
      type_nc: 'INTERNE',
      description: '',
      gravite: 'MINEURE'
    })
  }

  const handleEdit = (nc: any) => {
    setEditingNC(nc)
    setFormData({
      type_nc: nc.type_nc || 'INTERNE',
      description: nc.description || '',
      gravite: nc.gravite || 'MINEURE'
    })
    setShowModal(true)
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette non-conformité ?')) return
    try {
      await api.qualite.delete(id)
      loadNonConformites()
    } catch (error) {
      console.error('Erreur suppression:', error)
    }
  }

  const statutBadgeColor = (statut: string) => {
    const colors: Record<string, string> = {
      'OUVERTE': 'bg-amber-50 text-amber-700',
      'EN_COURS': 'bg-lanema-blue-50 text-lanema-blue-700',
      'RESOLUE': 'bg-emerald-50 text-emerald-700',
      'CLOTUREE': 'bg-slate-100 text-slate-500'
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const graviteBadgeColor = (gravite: string) => {
    const colors: Record<string, string> = {
      'CRITIQUE': 'bg-rose-100 text-rose-900',
      'MAJEURE': 'bg-orange-100 text-orange-700',
      'MINEURE': 'bg-amber-50 text-amber-700'
    }
    return colors[gravite] || 'bg-slate-100 text-slate-600'
  }

  const filtered = nonConformites.filter(nc => {
    const matchesSearch = nc.numero?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         nc.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatut = filterStatut === 'TOUS' || nc.statut === filterStatut
    return matchesSearch && matchesStatut
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion Qualité</h1>
          <p className="text-sm text-slate-600 mt-1">Suivez les non-conformités et actions correctives</p>
        </div>
        <button 
          onClick={() => { setEditingNC(null); resetForm(); setShowModal(true) }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle NC
        </button>
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (<div key={i} className="lanema-card p-4 animate-pulse"><div className="h-4 w-20 bg-slate-200 rounded mb-2"></div><div className="h-8 w-12 bg-slate-200 rounded"></div></div>))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Total NC</div><div className="text-2xl font-semibold text-slate-900">{nonConformites.length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Ouvertes</div><div className="text-2xl font-semibold text-amber-600">{nonConformites.filter(n => n.statut === 'OUVERTE').length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">En cours</div><div className="text-2xl font-semibold text-lanema-blue-600">{nonConformites.filter(n => n.statut === 'EN_COURS').length}</div></div>
          <div className="lanema-card p-4"><div className="text-xs text-slate-500 mb-1">Résolues</div><div className="text-2xl font-semibold text-emerald-600">{nonConformites.filter(n => n.statut === 'RESOLUE').length}</div></div>
        </div>
      )}

      <div className="lanema-card p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" />
          <select value={filterStatut} onChange={(e) => setFilterStatut(e.target.value)} className="px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500">
            <option value="TOUS">Tous</option>
            <option value="OUVERTE">Ouverte</option>
            <option value="EN_COURS">En cours</option>
            <option value="RESOLUE">Résolue</option>
            <option value="CLOTUREE">Clôturée</option>
          </select>
        </div>
      </div>

      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse"><div className="space-y-3">{[...Array(5)].map((_, i) => (<div key={i} className="h-16 bg-slate-200 rounded"></div>))}</div></div>
      ) : filtered.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune non-conformité</h3>
          <p className="text-sm text-slate-600">Système conforme</p>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Numéro</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Description</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Gravité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Date</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((nc) => (
                  <tr key={nc.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{nc.numero}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{nc.type_nc === 'INTERNE' ? 'Interne' : 'Externe'}</td>
                    <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">{nc.description}</td>
                    <td className="px-4 py-3 text-sm"><span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${graviteBadgeColor(nc.gravite)}`}>{nc.gravite}</span></td>
                    <td className="px-4 py-3 text-sm text-slate-600">{nc.date_creation ? new Date(nc.date_creation).toLocaleDateString('fr-FR') : 'N/A'}</td>
                    <td className="px-4 py-3 text-sm"><span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${graviteBadgeColor(nc.gravite)}`}>{nc.gravite === 'CRITIQUE' ? 'Critique' : nc.gravite === 'MAJEURE' ? 'Majeure' : 'Mineure'}</span></td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button 
                          onClick={() => handleEdit(nc)}
                          className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium"
                        >
                          Éditer
                        </button>
                        <button 
                          onClick={() => handleDelete(nc.id)}
                          className="text-sm text-rose-600 hover:text-rose-700 font-medium"
                        >
                          Supprimer
                        </button>
                      </div>
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
                <h3 className="text-lg font-semibold text-slate-900">{editingNC ? 'Modifier la non-conformité' : 'Nouvelle non-conformité'}</h3>
                <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600"><svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Type *</label><select value={formData.type_nc} onChange={(e) => setFormData({...formData, type_nc: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"><option value="INTERNE">Interne</option><option value="EXTERNE">Externe</option></select></div>
                  <div><label className="block text-sm font-medium text-slate-700 mb-1">Gravité *</label><select value={formData.gravite} onChange={(e) => setFormData({...formData, gravite: e.target.value})} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"><option value="MINEURE">Mineure</option><option value="MAJEURE">Majeure</option><option value="CRITIQUE">Critique</option></select></div>
                  <div className="md:col-span-2"><label className="block text-sm font-medium text-slate-700 mb-1">Description *</label><textarea value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} rows={3} className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500" required /></div>
                </div>
                <div className="flex gap-3 pt-4">
                  <button type="submit" className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition">{editingNC ? 'Modifier' : 'Créer'}</button>
                  <button type="button" onClick={() => setShowModal(false)} className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">Annuler</button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
