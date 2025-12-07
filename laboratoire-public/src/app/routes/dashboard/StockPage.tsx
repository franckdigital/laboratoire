import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function StockPage() {
  const [articles, setArticles] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingArticle, setEditingArticle] = useState<any>(null)
  const [emplacements, setEmplacements] = useState<any[]>([])
  const [isLoadingEmplacements, setIsLoadingEmplacements] = useState(false)
  const [categories, setCategories] = useState<any[]>([])
  const [isLoadingCategories, setIsLoadingCategories] = useState(false)
  const [fournisseurs, setFournisseurs] = useState<any[]>([])
  const [isLoadingFournisseurs, setIsLoadingFournisseurs] = useState(false)
  const [showFournisseurModal, setShowFournisseurModal] = useState(false)
  const [showFournisseursListModal, setShowFournisseursListModal] = useState(false)
  const [editingFournisseur, setEditingFournisseur] = useState<any>(null)
  const [fournisseurForm, setFournisseurForm] = useState({
    code_fournisseur: '',  // Read-only, généré automatiquement
    raison_sociale: '',
    adresse: '',
    ville: '',
    pays: 'Cameroun',
    telephone: '',
    email: ''
  })
  const [showCategorieModal, setShowCategorieModal] = useState(false)
  const [showCategoriesListModal, setShowCategoriesListModal] = useState(false)
  const [editingCategorie, setEditingCategorie] = useState<any>(null)
  const [domaines, setDomaines] = useState<any[]>([])
  const [isLoadingDomaines, setIsLoadingDomaines] = useState(false)
  const [showDomaineModal, setShowDomaineModal] = useState(false)
  const [showDomainesListModal, setShowDomainesListModal] = useState(false)
  const [editingDomaine, setEditingDomaine] = useState<any>(null)
  const [domaineForm, setDomaineForm] = useState({
    code: '',
    nom: '',
    description: ''
  })
  const [categorieForm, setCategorieForm] = useState({
    code: '',
    nom: '',
    domaine: '',
    description: ''
  })
  const [formData, setFormData] = useState({
    reference: '',
    designation: '',
    categorie: '',
    quantite_stock: '',
    unite: '',
    seuil_alerte: '',
    seuil_critique: '',
    emplacement: '',
    fournisseur: ''
  })

  useEffect(() => {
    loadArticles()
    loadEmplacements()
    loadCategories()
    loadDomaines()
    loadFournisseurs()
  }, [])

  const loadFournisseurs = async () => {
    try {
      setIsLoadingFournisseurs(true)
      const data = await api.stock.fournisseurs.list()
      setFournisseurs(data.results || data || [])
    } catch (error: any) {
      console.error('Erreur chargement fournisseurs:', error)
    } finally {
      setIsLoadingFournisseurs(false)
    }
  }

  const loadDomaines = async () => {
    try {
      setIsLoadingDomaines(true)
      const data = await api.stock.domaines.list()
      setDomaines(data.results || data || [])
    } catch (error: any) {
      console.error('Erreur chargement domaines:', error)
    } finally {
      setIsLoadingDomaines(false)
    }
  }

  const loadEmplacements = async () => {
    try {
      setIsLoadingEmplacements(true)
      const data = await api.stock.emplacements.list()
      setEmplacements(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement emplacements:', error)
    } finally {
      setIsLoadingEmplacements(false)
    }
  }

  const loadCategories = async () => {
    try {
      setIsLoadingCategories(true)
      const data = await api.stock.categories.list()
      setCategories(data.results || data || [])
    } catch (error: any) {
      console.error('Erreur chargement catégories:', error)
    } finally {
      setIsLoadingCategories(false)
    }
  }

  const handleCreateCategorie = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingCategorie) {
        await api.stock.categories.update(editingCategorie.id, categorieForm)
      } else {
        await api.stock.categories.create(categorieForm)
      }
      setShowCategorieModal(false)
      setEditingCategorie(null)
      setCategorieForm({ code: '', nom: '', domaine: '', description: '' })
      loadCategories()
    } catch (error: any) {
      console.error('Erreur catégorie:', error)
      alert('Erreur lors de la ' + (editingCategorie ? 'modification' : 'création') + ' de la catégorie')
    }
  }

  const handleEditCategorie = (categorie: any) => {
    setEditingCategorie(categorie)
    setCategorieForm({
      code: categorie.code,
      nom: categorie.nom,
      domaine: categorie.domaine,
      description: categorie.description || ''
    })
    setShowCategoriesListModal(false)
    setShowCategorieModal(true)
  }

  const handleDeleteCategorie = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette catégorie ?')) return
    try {
      await api.stock.categories.delete(id)
      loadCategories()
    } catch (error: any) {
      console.error('Erreur suppression catégorie:', error)
      alert('Erreur lors de la suppression. La catégorie contient peut-être des articles.')
    }
  }

  const handleCreateDomaine = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingDomaine) {
        await api.stock.domaines.update(editingDomaine.id, domaineForm)
      } else {
        await api.stock.domaines.create(domaineForm)
      }
      setShowDomaineModal(false)
      setEditingDomaine(null)
      setDomaineForm({ code: '', nom: '', description: '' })
      loadDomaines()
    } catch (error: any) {
      console.error('Erreur domaine:', error)
      alert('Erreur lors de la ' + (editingDomaine ? 'modification' : 'création') + ' du domaine')
    }
  }

  const handleEditDomaine = (domaine: any) => {
    setEditingDomaine(domaine)
    setDomaineForm({
      code: domaine.code,
      nom: domaine.nom,
      description: domaine.description || ''
    })
    setShowDomainesListModal(false)
    setShowDomaineModal(true)
  }

  const handleDeleteDomaine = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce domaine ?')) return
    try {
      await api.stock.domaines.delete(id)
      loadDomaines()
    } catch (error: any) {
      console.error('Erreur suppression domaine:', error)
      alert('Erreur lors de la suppression. Le domaine contient peut-être des catégories.')
    }
  }

  const handleCreateFournisseur = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingFournisseur) {
        await api.stock.fournisseurs.update(editingFournisseur.id, fournisseurForm)
      } else {
        await api.stock.fournisseurs.create(fournisseurForm)
      }
      setShowFournisseurModal(false)
      setEditingFournisseur(null)
      setFournisseurForm({ code_fournisseur: '', raison_sociale: '', adresse: '', ville: '', pays: 'Cameroun', telephone: '', email: '' })
      loadFournisseurs()
    } catch (error: any) {
      console.error('Erreur fournisseur:', error)
      alert('Erreur lors de la ' + (editingFournisseur ? 'modification' : 'création') + ' du fournisseur')
    }
  }

  const handleEditFournisseur = (fournisseur: any) => {
    setEditingFournisseur(fournisseur)
    setFournisseurForm({
      code_fournisseur: fournisseur.code_fournisseur,
      raison_sociale: fournisseur.raison_sociale,
      adresse: fournisseur.adresse || '',
      ville: fournisseur.ville || '',
      pays: fournisseur.pays || 'Cameroun',
      telephone: fournisseur.telephone || '',
      email: fournisseur.email || ''
    })
    setShowFournisseursListModal(false)
    setShowFournisseurModal(true)
  }

  const handleDeleteFournisseur = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce fournisseur ?')) return
    try {
      await api.stock.fournisseurs.delete(id)
      loadFournisseurs()
    } catch (error: any) {
      console.error('Erreur suppression fournisseur:', error)
      alert('Erreur lors de la suppression. Le fournisseur est peut-être lié à des articles.')
    }
  }

  const loadArticles = async () => {
    try {
      setIsLoading(true)
      const data = await api.stock.list()
      setArticles(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement stock:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingArticle) {
        await api.stock.update(editingArticle.id, formData)
      } else {
        await api.stock.create(formData)
      }
      setShowModal(false)
      setEditingArticle(null)
      resetForm()
      loadArticles()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const handleEdit = (article: any) => {
    setEditingArticle(article)
    setFormData({
      reference: article.reference || '',
      designation: article.designation || '',
      categorie: article.categorie || '',
      quantite_stock: article.quantite_stock?.toString() || '',
      unite: article.unite || '',
      seuil_alerte: article.seuil_alerte?.toString() || '',
      seuil_critique: article.seuil_critique?.toString() || '',
      emplacement: article.emplacement_id || '',  // Utiliser emplacement_id au lieu de emplacement
      fournisseur: article.fournisseur || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      reference: '',
      designation: '',
      categorie: '',
      quantite_stock: '',
      unite: '',
      seuil_alerte: '',
      seuil_critique: '',
      emplacement: '',
      fournisseur: ''
    })
  }

  const getStockStatus = (article: any) => {
    if (article.quantite_stock <= article.seuil_alerte) return 'STOCK_BAS'
    if (article.date_peremption) {
      const daysUntilExpiry = Math.floor((new Date(article.date_peremption).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
      if (daysUntilExpiry < 30) return 'PEREMPTION_PROCHE'
    }
    return 'OK'
  }

  const statusBadgeColor = (status: string) => {
    const colors: Record<string, string> = {
      'OK': 'bg-emerald-50 text-emerald-700',
      'STOCK_BAS': 'bg-amber-50 text-amber-700',
      'PEREMPTION_PROCHE': 'bg-rose-50 text-rose-700',
      'RUPTURE': 'bg-rose-100 text-rose-900'
    }
    return colors[status] || 'bg-slate-100 text-slate-600'
  }

  const filteredArticles = articles.filter(a =>
    a.reference?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    a.designation?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion du stock</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez les stocks de réactifs et consommables</p>
        </div>
        <button 
          onClick={() => {
            setEditingArticle(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel article
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
            <div className="text-xs text-slate-500 mb-1">Total articles</div>
            <div className="text-2xl font-semibold text-slate-900">{articles.length}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Stock OK</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {articles.filter(a => getStockStatus(a) === 'OK').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Stock bas</div>
            <div className="text-2xl font-semibold text-amber-600">
              {articles.filter(a => getStockStatus(a) === 'STOCK_BAS').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Péremption proche</div>
            <div className="text-2xl font-semibold text-rose-600">
              {articles.filter(a => getStockStatus(a) === 'PEREMPTION_PROCHE').length}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="lanema-card p-4">
        <input
          type="text"
          placeholder="Rechercher par référence ou désignation..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
        />
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
      ) : filteredArticles.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun article trouvé</h3>
          <p className="text-sm text-slate-600">Commencez par ajouter un article au stock</p>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Référence</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Désignation</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Catégorie</th>
                  <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">Quantité</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Emplacement</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredArticles.map((article) => {
                  const status = getStockStatus(article)
                  return (
                    <tr key={article.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                      <td className="px-4 py-3 text-sm font-medium text-slate-900">
                        {article.reference}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-700 max-w-xs truncate">
                        {article.designation}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {article.categorie}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-900 text-right font-medium">
                        {article.quantite_stock} {article.unite}
                      </td>
                      <td className="px-4 py-3 text-sm text-slate-600">
                        {article.emplacement || 'N/A'}
                      </td>
                      <td className="px-4 py-3 text-sm">
                        <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statusBadgeColor(status)}`}>
                          {status === 'OK' ? 'OK' :
                           status === 'STOCK_BAS' ? 'Stock bas' :
                           status === 'PEREMPTION_PROCHE' ? 'Péremption proche' : status}
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <button 
                          onClick={() => handleEdit(article)}
                          className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium hover:underline"
                        >
                          Éditer
                        </button>
                      </td>
                    </tr>
                  )
                })}
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
                  {editingArticle ? 'Modifier l\'article' : 'Nouvel article'}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setEditingArticle(null)
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
                      Référence *
                    </label>
                    <input
                      type="text"
                      value={formData.reference}
                      onChange={(e) => setFormData({...formData, reference: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="REF-XXX-XXX"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Catégorie *
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.categorie}
                        onChange={(e) => setFormData({...formData, categorie: e.target.value})}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                        required
                      >
                        <option value="">Sélectionner...</option>
                        {isLoadingCategories && (
                          <option value="" disabled>Chargement...</option>
                        )}
                        {!isLoadingCategories && categories.map((cat: any) => (
                          <option key={cat.id} value={cat.id}>
                            {cat.nom}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowCategorieModal(true)}
                        className="px-3 py-2 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                        title="Créer une catégorie"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => setShowCategoriesListModal(true)}
                        className="px-3 py-2 text-sm bg-slate-600 text-white rounded-lg hover:bg-slate-700"
                        title="Gérer les catégories"
                      >
                        ⚙
                      </button>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Désignation *
                    </label>
                    <input
                      type="text"
                      value={formData.designation}
                      onChange={(e) => setFormData({...formData, designation: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Description de l'article"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Quantité en stock *
                    </label>
                    <input
                      type="number"
                      value={formData.quantite_stock}
                      onChange={(e) => setFormData({...formData, quantite_stock: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Unité *
                    </label>
                    <input
                      type="text"
                      value={formData.unite}
                      onChange={(e) => setFormData({...formData, unite: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="L, KG, PIECE..."
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Seuil d'alerte
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.seuil_alerte}
                      onChange={(e) => setFormData({...formData, seuil_alerte: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Seuil critique *
                    </label>
                    <input
                      type="number"
                      step="0.01"
                      value={formData.seuil_critique}
                      onChange={(e) => setFormData({...formData, seuil_critique: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Emplacement
                    </label>
                    <select
                      value={formData.emplacement}
                      onChange={(e) => setFormData({...formData, emplacement: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    >
                      <option value="">Sélectionner un emplacement...</option>
                      {isLoadingEmplacements && (
                        <option value="" disabled>Chargement...</option>
                      )}
                      {!isLoadingEmplacements && emplacements.map((emp: any) => (
                        <option key={emp.id} value={emp.id}>
                          {emp.code} - {emp.nom} ({emp.entrepot_nom || 'Entrepôt'})
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Fournisseur
                    </label>
                    <div className="flex gap-2">
                      <select
                        value={formData.fournisseur}
                        onChange={(e) => setFormData({...formData, fournisseur: e.target.value})}
                        className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      >
                        <option value="">Sélectionner un fournisseur...</option>
                        {isLoadingFournisseurs && (
                          <option value="" disabled>Chargement...</option>
                        )}
                        {!isLoadingFournisseurs && fournisseurs.map((f: any) => (
                          <option key={f.id} value={f.id}>
                            {f.raison_sociale}
                          </option>
                        ))}
                      </select>
                      <button
                        type="button"
                        onClick={() => setShowFournisseursListModal(true)}
                        className="px-3 py-2 text-sm bg-purple-600 text-white rounded-lg hover:bg-purple-700"
                        title="Gérer les fournisseurs"
                      >
                        ⚙
                      </button>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingArticle ? 'Mettre à jour' : 'Créer l\'article'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingArticle(null)
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

      {/* Modal Création Catégorie */}
      {showCategorieModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingCategorie ? 'Modifier la catégorie' : 'Nouvelle catégorie'}
                </h3>
                <button 
                  onClick={() => {
                    setShowCategorieModal(false)
                    setEditingCategorie(null)
                    setCategorieForm({ code: '', nom: '', domaine: 'CHIMIE', description: '' })
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateCategorie} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={categorieForm.code}
                    onChange={(e) => setCategorieForm({...categorieForm, code: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: REACTIF"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={categorieForm.nom}
                    onChange={(e) => setCategorieForm({...categorieForm, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: Réactifs"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Domaine *
                  </label>
                  <div className="flex gap-2">
                    <select
                      value={categorieForm.domaine}
                      onChange={(e) => setCategorieForm({...categorieForm, domaine: e.target.value})}
                      className="flex-1 px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      required
                    >
                      <option value="">Sélectionner...</option>
                      {isLoadingDomaines && (
                        <option value="" disabled>Chargement...</option>
                      )}
                      {!isLoadingDomaines && domaines.map((dom: any) => (
                        <option key={dom.id} value={dom.code}>
                          {dom.nom}
                        </option>
                      ))}
                    </select>
                    <button
                      type="button"
                      onClick={() => setShowDomainesListModal(true)}
                      className="px-3 py-2 text-sm bg-indigo-600 text-white rounded-lg hover:bg-indigo-700"
                      title="Gérer les domaines"
                    >
                      ⚙
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={categorieForm.description}
                    onChange={(e) => setCategorieForm({...categorieForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Description de la catégorie..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingCategorie ? 'Modifier' : 'Créer la catégorie'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowCategorieModal(false)
                      setEditingCategorie(null)
                      setCategorieForm({ code: '', nom: '', domaine: 'CHIMIE', description: '' })
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

      {/* Modal Liste des Catégories */}
      {showCategoriesListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Gestion des catégories
                </h3>
                <button 
                  onClick={() => setShowCategoriesListModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {isLoadingCategories ? (
                  <div className="text-center py-8 text-slate-500">Chargement...</div>
                ) : categories.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucune catégorie. Cliquez sur "+" pour en créer une.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {categories.map((cat: any) => (
                      <div key={cat.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-lg border border-slate-200 hover:bg-slate-100 transition">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">
                            {cat.code} - {cat.nom}
                          </div>
                          <div className="text-sm text-slate-600 mt-1">
                            <span className="font-medium">Domaine:</span> {cat.domaine}
                          </div>
                          {cat.description && (
                            <div className="text-sm text-slate-500 mt-1">
                              {cat.description}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-1">
                            {cat.nombre_articles || 0} article(s)
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditCategorie(cat)}
                            className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteCategorie(cat.id)}
                            className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setShowCategoriesListModal(false)
                    setShowCategorieModal(true)
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                >
                  + Nouvelle catégorie
                </button>
                <button 
                  onClick={() => setShowCategoriesListModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Édition Fournisseur */}
      {showFournisseurModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingFournisseur ? 'Modifier le fournisseur' : 'Nouveau fournisseur'}
                </h3>
                <button 
                  onClick={() => {
                    setShowFournisseurModal(false)
                    setEditingFournisseur(null)
                    setFournisseurForm({ code_fournisseur: '', raison_sociale: '', adresse: '', ville: '', pays: 'Cameroun', telephone: '', email: '' })
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateFournisseur} className="space-y-4">
                {editingFournisseur && (
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Code fournisseur
                    </label>
                    <input
                      type="text"
                      value={fournisseurForm.code_fournisseur}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-100"
                      disabled
                    />
                  </div>
                )}

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Raison sociale *
                  </label>
                  <input
                    type="text"
                    value={fournisseurForm.raison_sociale}
                    onChange={(e) => setFournisseurForm({...fournisseurForm, raison_sociale: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: Sigma-Aldrich"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Adresse *
                  </label>
                  <input
                    type="text"
                    value={fournisseurForm.adresse}
                    onChange={(e) => setFournisseurForm({...fournisseurForm, adresse: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: 123 rue du Commerce"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Ville *
                    </label>
                    <input
                      type="text"
                      value={fournisseurForm.ville}
                      onChange={(e) => setFournisseurForm({...fournisseurForm, ville: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Ex: Douala"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Pays *
                    </label>
                    <input
                      type="text"
                      value={fournisseurForm.pays}
                      onChange={(e) => setFournisseurForm({...fournisseurForm, pays: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Ex: Cameroun"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone *
                    </label>
                    <input
                      type="tel"
                      value={fournisseurForm.telephone}
                      onChange={(e) => setFournisseurForm({...fournisseurForm, telephone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Ex: +237 123 456 789"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={fournisseurForm.email}
                      onChange={(e) => setFournisseurForm({...fournisseurForm, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Ex: contact@fournisseur.com"
                      required
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingFournisseur ? 'Modifier' : 'Créer le fournisseur'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowFournisseurModal(false)
                      setEditingFournisseur(null)
                      setFournisseurForm({ code_fournisseur: '', raison_sociale: '', adresse: '', ville: '', pays: 'Cameroun', telephone: '', email: '' })
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

      {/* Modal Liste des Fournisseurs */}
      {showFournisseursListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-4xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Gestion des fournisseurs
                </h3>
                <button 
                  onClick={() => setShowFournisseursListModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {isLoadingFournisseurs ? (
                  <div className="text-center py-8 text-slate-500">Chargement...</div>
                ) : fournisseurs.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucun fournisseur. Cliquez sur "+ Nouveau fournisseur" pour en créer un.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {fournisseurs.map((f: any) => (
                      <div key={f.id} className="flex items-center justify-between p-4 bg-purple-50 rounded-lg border border-purple-200 hover:bg-purple-100 transition">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">
                            {f.code_fournisseur} - {f.raison_sociale}
                          </div>
                          <div className="text-sm text-slate-500 mt-1">
                            {f.ville}, {f.pays}
                          </div>
                          <div className="text-xs text-slate-400 mt-1">
                            {f.telephone} • {f.email}
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditFournisseur(f)}
                            className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteFournisseur(f.id)}
                            className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setShowFournisseursListModal(false)
                    setShowFournisseurModal(true)
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-lg transition"
                >
                  + Nouveau fournisseur
                </button>
                <button 
                  onClick={() => setShowFournisseursListModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal Création/Édition Domaine */}
      {showDomaineModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-md">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingDomaine ? 'Modifier le domaine' : 'Nouveau domaine'}
                </h3>
                <button 
                  onClick={() => {
                    setShowDomaineModal(false)
                    setEditingDomaine(null)
                    setDomaineForm({ code: '', nom: '', description: '' })
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleCreateDomaine} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Code *
                  </label>
                  <input
                    type="text"
                    value={domaineForm.code}
                    onChange={(e) => setDomaineForm({...domaineForm, code: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: CHIMIE"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom *
                  </label>
                  <input
                    type="text"
                    value={domaineForm.nom}
                    onChange={(e) => setDomaineForm({...domaineForm, nom: e.target.value})}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Ex: Chimie"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Description
                  </label>
                  <textarea
                    value={domaineForm.description}
                    onChange={(e) => setDomaineForm({...domaineForm, description: e.target.value})}
                    rows={3}
                    className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    placeholder="Description du domaine..."
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingDomaine ? 'Modifier' : 'Créer le domaine'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowDomaineModal(false)
                      setEditingDomaine(null)
                      setDomaineForm({ code: '', nom: '', description: '' })
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

      {/* Modal Liste des Domaines */}
      {showDomainesListModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[80vh] overflow-hidden">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  Gestion des domaines
                </h3>
                <button 
                  onClick={() => setShowDomainesListModal(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <div className="overflow-y-auto max-h-[60vh]">
                {isLoadingDomaines ? (
                  <div className="text-center py-8 text-slate-500">Chargement...</div>
                ) : domaines.length === 0 ? (
                  <div className="text-center py-8 text-slate-500">
                    Aucun domaine. Cliquez sur "+ Nouveau domaine" pour en créer un.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {domaines.map((dom: any) => (
                      <div key={dom.id} className="flex items-center justify-between p-4 bg-indigo-50 rounded-lg border border-indigo-200 hover:bg-indigo-100 transition">
                        <div className="flex-1">
                          <div className="font-semibold text-slate-900">
                            {dom.code} - {dom.nom}
                          </div>
                          {dom.description && (
                            <div className="text-sm text-slate-500 mt-1">
                              {dom.description}
                            </div>
                          )}
                          <div className="text-xs text-slate-400 mt-1">
                            {dom.nombre_categories || 0} catégorie(s)
                          </div>
                        </div>
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleEditDomaine(dom)}
                            className="px-3 py-1.5 text-sm bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                          >
                            Éditer
                          </button>
                          <button
                            onClick={() => handleDeleteDomaine(dom.id)}
                            className="px-3 py-1.5 text-sm bg-rose-600 text-white rounded-lg hover:bg-rose-700"
                          >
                            Supprimer
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex justify-between items-center gap-3 pt-6 border-t mt-6">
                <button
                  onClick={() => {
                    setShowDomainesListModal(false)
                    setShowDomaineModal(true)
                  }}
                  className="px-4 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-lg transition"
                >
                  + Nouveau domaine
                </button>
                <button 
                  onClick={() => setShowDomainesListModal(false)}
                  className="px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Fermer
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
