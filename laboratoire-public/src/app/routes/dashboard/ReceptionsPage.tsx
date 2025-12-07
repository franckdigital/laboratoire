import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { Toast } from '../../../components/Toast'

interface Reception {
  id: string
  numero_reception: string
  bon_commande?: string
  numero_bon_commande?: string
  fournisseur: string
  fournisseur_nom: string
  date_reception: string
  date_verification?: string
  date_validation?: string
  statut: string
  receptionne_par_nom: string
  verifie_par_nom?: string
  valide_par_nom?: string
  nombre_lignes: number
  observations?: string
}

interface FournisseurOption {
  id: string
  raison_sociale?: string
  nom?: string
}

interface LigneReception {
  id: string
  article: string
  article_nom: string
  article_reference: string
  quantite_attendue: number
  quantite_recue: number
  unite: string
  numero_lot: string
  date_fabrication?: string
  date_peremption?: string
  conforme: boolean
  observations?: string
  lot_cree?: {
    id: string
    numero_lot: string
    statut: string
  }
}

interface LigneReceptionForm {
  article: string
  quantite_attendue: string
  quantite_recue: string
  unite: string
  numero_lot: string
  date_fabrication: string
  date_peremption: string
  conforme: boolean
  observations: string
}

interface Article {
  id: string
  reference_interne: string
  designation: string
  unite_base: string
}

export function ReceptionsPage() {
  const [receptions, setReceptions] = useState<Reception[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedReception, setSelectedReception] = useState<Reception | null>(null)
  const [action, setAction] = useState<'verifier' | 'valider' | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('EN_COURS')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [createForm, setCreateForm] = useState({
    fournisseur: '',
    numero_commande: '',
    numero_bl: '',
    date_livraison_prevue: '',
    observations: '',
  })
  const [fournisseurs, setFournisseurs] = useState<FournisseurOption[]>([])
  const [isLoadingFournisseurs, setIsLoadingFournisseurs] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedReceptionDetails, setSelectedReceptionDetails] = useState<Reception | null>(null)
  const [lignesReception, setLignesReception] = useState<LigneReception[]>([])
  const [isLoadingLignes, setIsLoadingLignes] = useState(false)
  const [articles, setArticles] = useState<Article[]>([])
  const [isLoadingArticles, setIsLoadingArticles] = useState(false)
  const [lignesForm, setLignesForm] = useState<LigneReceptionForm[]>([])
  const [showAddLigneForm, setShowAddLigneForm] = useState(false)
  const [newLigne, setNewLigne] = useState<LigneReceptionForm>({
    article: '',
    quantite_attendue: '',
    quantite_recue: '',
    unite: '',
    numero_lot: '',
    date_fabrication: '',
    date_peremption: '',
    conforme: true,
    observations: ''
  })

  useEffect(() => {
    loadReceptions()
  }, [statusFilter])

  useEffect(() => {
    loadFournisseurs()
    loadArticles()
  }, [])

  const loadFournisseurs = async () => {
    try {
      setIsLoadingFournisseurs(true)
      const data = await api.stock.fournisseurs.list()
      const items = (data.results || data || []) as FournisseurOption[]
      setFournisseurs(items)
    } catch (error: any) {
      console.error('Erreur lors du chargement des fournisseurs:', error)
    } finally {
      setIsLoadingFournisseurs(false)
    }
  }

  const loadArticles = async () => {
    try {
      setIsLoadingArticles(true)
      const data = await api.stock.articles.list({ est_actif: 'true' })
      const items = (data.results || data || []) as Article[]
      setArticles(items)
    } catch (error: any) {
      console.error('Erreur lors du chargement des articles:', error)
    } finally {
      setIsLoadingArticles(false)
    }
  }

  const loadLignesReception = async (receptionId: string) => {
    try {
      setIsLoadingLignes(true)
      const data = await api.stock.receptions.getLignes(receptionId)
      setLignesReception(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors du chargement des lignes', type: 'error' })
    } finally {
      setIsLoadingLignes(false)
    }
  }

  const handleViewDetails = async (reception: Reception) => {
    setSelectedReceptionDetails(reception)
    setShowDetailsModal(true)
    await loadLignesReception(reception.id)
  }

  const loadReceptions = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter !== 'all' ? { statut: statusFilter } : {}
      const data = await api.stock.receptions.list(params)
      setReceptions(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedReception || !action) return

    try {
      if (action === 'verifier') {
        await api.stock.receptions.verifier(selectedReception.id)
        setToast({ message: 'Réception vérifiée', type: 'success' })
      } else if (action === 'valider') {
        await api.stock.receptions.valider(selectedReception.id)
        setToast({ message: 'Réception validée', type: 'success' })
      }
      setShowModal(false)
      setSelectedReception(null)
      setAction(null)
      loadReceptions()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_COURS': 'bg-amber-100 text-amber-700',
      'VERIFIEE': 'bg-blue-100 text-blue-700',
      'VALIDEE': 'bg-emerald-100 text-emerald-700',
      'REJETEE': 'bg-rose-100 text-rose-700'
    }
    return colors[statut] || 'bg-gray-100 text-gray-600'
  }

  const handleAddLigne = () => {
    if (!newLigne.article || !newLigne.numero_lot) {
      setToast({ message: 'Veuillez renseigner au minimum l\'article et le numéro de lot', type: 'error' })
      return
    }
    setLignesForm([...lignesForm, { ...newLigne }])
    setNewLigne({
      article: '',
      quantite_attendue: '',
      quantite_recue: '',
      unite: '',
      numero_lot: '',
      date_fabrication: '',
      date_peremption: '',
      conforme: true,
      observations: ''
    })
    setShowAddLigneForm(false)
  }

  const handleRemoveLigne = (index: number) => {
    setLignesForm(lignesForm.filter((_, i) => i !== index))
  }

  const handleCreateReception = async () => {
    if (!createForm.fournisseur) {
      setToast({ message: 'Veuillez sélectionner un fournisseur', type: 'error' })
      return
    }

    if (lignesForm.length === 0) {
      setToast({ message: 'Veuillez ajouter au moins une ligne de réception', type: 'error' })
      return
    }

    try {
      const lignesData = lignesForm.map(ligne => ({
        article: ligne.article,
        quantite_attendue: parseFloat(ligne.quantite_attendue) || 0,
        quantite_recue: parseFloat(ligne.quantite_recue) || 0,
        unite: ligne.unite,
        numero_lot: ligne.numero_lot,
        date_fabrication: ligne.date_fabrication || null,
        date_peremption: ligne.date_peremption || null,
        conforme: ligne.conforme,
        observations: ligne.observations || ''
      }))

      await api.stock.receptions.create({
        fournisseur: createForm.fournisseur,
        numero_commande: createForm.numero_commande || null,
        numero_bl: createForm.numero_bl || null,
        date_livraison_prevue: createForm.date_livraison_prevue || null,
        observations: createForm.observations || '',
        lignes: lignesData
      })
      setToast({ message: 'Réception créée avec succès', type: 'success' })
      setShowCreateModal(false)
      setCreateForm({
        fournisseur: '',
        numero_commande: '',
        numero_bl: '',
        date_livraison_prevue: '',
        observations: '',
      })
      setLignesForm([])
      loadReceptions()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la création de la réception', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Réceptions</h1>
          <p className="text-gray-600 mt-1">Gestion des réceptions de marchandises</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
        >
          Nouvelle réception
        </button>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        >
          <option value="EN_COURS">En attente</option>
          <option value="VERIFIEE">Vérifiées</option>
          <option value="VALIDEE">Validées</option>
          <option value="all">Toutes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">En attente</div>
          <div className="text-2xl font-bold text-amber-600">
            {receptions.filter(r => r.statut === 'EN_COURS').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Vérifiées</div>
          <div className="text-2xl font-bold text-blue-600">
            {receptions.filter(r => r.statut === 'VERIFIEE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Validées</div>
          <div className="text-2xl font-bold text-emerald-600">
            {receptions.filter(r => r.statut === 'VALIDEE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total</div>
          <div className="text-2xl font-bold text-sky-600">{receptions.length}</div>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Réception</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Fournisseur</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Date</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lignes</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : receptions.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucune réception trouvée</td>
              </tr>
            ) : (
              receptions.map((reception) => (
                <tr key={reception.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm font-medium text-gray-900">{reception.numero_reception}</div>
                    {reception.numero_bon_commande && (
                      <div className="text-xs text-gray-500">BC: {reception.numero_bon_commande}</div>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{reception.fournisseur_nom}</div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <div className="text-sm text-gray-900">
                      {new Date(reception.date_reception).toLocaleDateString('fr-FR')}
                    </div>
                    <div className="text-xs text-gray-500">
                      Par {reception.receptionne_par_nom}
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm font-medium text-sky-600">{reception.nombre_lignes}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(reception.statut)}`}>
                      {reception.statut.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => handleViewDetails(reception)}
                        className="px-3 py-1.5 text-sm text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                      >
                        Détails
                      </button>
                      {reception.statut === 'EN_COURS' && (
                        <button
                          onClick={() => {
                            setSelectedReception(reception)
                            setAction('verifier')
                            setShowModal(true)
                          }}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                        >
                          Vérifier
                        </button>
                      )}
                      {reception.statut === 'VERIFIEE' && (
                        <button
                          onClick={() => {
                            setSelectedReception(reception)
                            setAction('valider')
                            setShowModal(true)
                          }}
                          className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors"
                        >
                          Valider
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedReceptionDetails && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedReceptionDetails(null)
            setLignesReception([])
          }}
          title={`Détails de la réception ${selectedReceptionDetails.numero_reception}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-lg">
              <div>
                <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReceptionDetails.fournisseur_nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${getStatutColor(selectedReceptionDetails.statut)}`}>
                  {selectedReceptionDetails.statut.replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de réception</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedReceptionDetails.date_reception).toLocaleDateString('fr-FR')}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Réceptionné par</label>
                <p className="mt-1 text-sm text-gray-900">{selectedReceptionDetails.receptionne_par_nom}</p>
              </div>
              {selectedReceptionDetails.numero_bon_commande && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">N° Bon de commande</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReceptionDetails.numero_bon_commande}</p>
                </div>
              )}
              {selectedReceptionDetails.observations && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Observations</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedReceptionDetails.observations}</p>
                </div>
              )}
            </div>

            <div>
              <h3 className="text-lg font-semibold text-gray-900 mb-3">Lignes de réception</h3>
              {isLoadingLignes ? (
                <div className="text-center py-8 text-gray-500">Chargement...</div>
              ) : lignesReception.length === 0 ? (
                <div className="text-center py-8 text-gray-500">Aucune ligne de réception</div>
              ) : (
                <div className="space-y-3">
                  {lignesReception.map((ligne) => (
                    <div key={ligne.id} className="border rounded-lg p-4 hover:bg-gray-50">
                      <div className="flex justify-between items-start">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <h4 className="font-semibold text-gray-900">{ligne.article_nom}</h4>
                            <span className={`px-2 py-1 text-xs rounded-full ${
                              ligne.conforme
                                ? 'bg-emerald-100 text-emerald-700'
                                : 'bg-rose-100 text-rose-700'
                            }`}>
                              {ligne.conforme ? 'Conforme' : 'Non conforme'}
                            </span>
                            {ligne.lot_cree && (
                              <span className="px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-700">
                                Lot créé
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 mb-2">Réf: {ligne.article_reference}</p>
                          <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                            <div>
                              <span className="text-gray-500">Quantité attendue:</span>
                              <span className="ml-2 font-medium text-gray-900">{ligne.quantite_attendue} {ligne.unite}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">Quantité reçue:</span>
                              <span className="ml-2 font-medium text-gray-900">{ligne.quantite_recue} {ligne.unite}</span>
                            </div>
                            <div>
                              <span className="text-gray-500">N° Lot:</span>
                              <span className="ml-2 font-medium text-gray-900">{ligne.numero_lot}</span>
                            </div>
                            {ligne.date_peremption && (
                              <div>
                                <span className="text-gray-500">Péremption:</span>
                                <span className="ml-2 font-medium text-gray-900">
                                  {new Date(ligne.date_peremption).toLocaleDateString('fr-FR')}
                                </span>
                              </div>
                            )}
                            {ligne.lot_cree && (
                              <div className="col-span-2">
                                <span className="text-gray-500">Lot créé:</span>
                                <span className="ml-2 font-medium text-blue-600">
                                  {ligne.lot_cree.numero_lot} ({ligne.lot_cree.statut})
                                </span>
                              </div>
                            )}
                          </div>
                          {ligne.observations && (
                            <p className="mt-2 text-sm text-gray-600 italic">{ligne.observations}</p>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedReceptionDetails(null)
                  setLignesReception([])
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showCreateModal && (
        <Modal
          isOpen={showCreateModal}
          onClose={() => {
            setShowCreateModal(false)
            setCreateForm({
              fournisseur: '',
              numero_commande: '',
              numero_bl: '',
              date_livraison_prevue: '',
              observations: '',
            })
            setLignesForm([])
            setShowAddLigneForm(false)
          }}
          title="Nouvelle réception"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fournisseur
                </label>
                <select
                  value={createForm.fournisseur}
                  onChange={(e) => setCreateForm({ ...createForm, fournisseur: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                >
                  <option value="">Sélectionner...</option>
                  {isLoadingFournisseurs && (
                    <option value="" disabled>Chargement...</option>
                  )}
                  {!isLoadingFournisseurs && fournisseurs.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.raison_sociale || f.nom || f.id}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° commande
                </label>
                <input
                  type="text"
                  value={createForm.numero_commande}
                  onChange={(e) => setCreateForm({ ...createForm, numero_commande: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Numéro de commande (facultatif)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° BL
                </label>
                <input
                  type="text"
                  value={createForm.numero_bl}
                  onChange={(e) => setCreateForm({ ...createForm, numero_bl: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder="Numéro de bon de livraison (facultatif)"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Date de livraison prévue
                </label>
                <input
                  type="date"
                  value={createForm.date_livraison_prevue}
                  onChange={(e) => setCreateForm({ ...createForm, date_livraison_prevue: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Observations
              </label>
              <textarea
                value={createForm.observations}
                onChange={(e) => setCreateForm({ ...createForm, observations: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                placeholder="Notes ou remarques éventuelles"
              />
            </div>

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-lg font-semibold text-gray-900">Lignes de réception</h3>
                <button
                  onClick={() => setShowAddLigneForm(!showAddLigneForm)}
                  className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                >
                  + Ajouter une ligne
                </button>
              </div>

              {showAddLigneForm && (
                <div className="mb-4 p-4 bg-gray-50 rounded-lg border border-gray-200">
                  <div className="grid grid-cols-2 gap-3">
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Article <span className="text-rose-500">*</span>
                      </label>
                      <select
                        value={newLigne.article}
                        onChange={(e) => {
                          const article = articles.find(a => a.id === e.target.value)
                          setNewLigne({ 
                            ...newLigne, 
                            article: e.target.value,
                            unite: article?.unite_base || newLigne.unite
                          })
                        }}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      >
                        <option value="">Sélectionner un article...</option>
                        {articles.map((art) => (
                          <option key={art.id} value={art.id}>
                            {art.reference_interne} - {art.designation}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité attendue
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLigne.quantite_attendue}
                        onChange={(e) => setNewLigne({ ...newLigne, quantite_attendue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quantité reçue
                      </label>
                      <input
                        type="number"
                        step="0.01"
                        value={newLigne.quantite_recue}
                        onChange={(e) => setNewLigne({ ...newLigne, quantite_recue: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Unité
                      </label>
                      <input
                        type="text"
                        value={newLigne.unite}
                        onChange={(e) => setNewLigne({ ...newLigne, unite: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        placeholder="Ex: L, kg, unité"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        N° Lot <span className="text-rose-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={newLigne.numero_lot}
                        onChange={(e) => setNewLigne({ ...newLigne, numero_lot: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        placeholder="Ex: LOT-2024-010"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de fabrication
                      </label>
                      <input
                        type="date"
                        value={newLigne.date_fabrication}
                        onChange={(e) => setNewLigne({ ...newLigne, date_fabrication: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date de péremption
                      </label>
                      <input
                        type="date"
                        value={newLigne.date_peremption}
                        onChange={(e) => setNewLigne({ ...newLigne, date_peremption: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                      />
                    </div>
                    <div className="col-span-2">
                      <label className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={newLigne.conforme}
                          onChange={(e) => setNewLigne({ ...newLigne, conforme: e.target.checked })}
                          className="rounded border-gray-300 text-sky-600 focus:ring-sky-500"
                        />
                        <span className="text-sm text-gray-700">Article conforme</span>
                      </label>
                    </div>
                    <div className="col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Observations
                      </label>
                      <textarea
                        value={newLigne.observations}
                        onChange={(e) => setNewLigne({ ...newLigne, observations: e.target.value })}
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                        placeholder="Remarques éventuelles"
                      />
                    </div>
                  </div>
                  <div className="flex justify-end gap-2 mt-3">
                    <button
                      onClick={() => {
                        setShowAddLigneForm(false)
                        setNewLigne({
                          article: '',
                          quantite_attendue: '',
                          quantite_recue: '',
                          unite: '',
                          numero_lot: '',
                          date_fabrication: '',
                          date_peremption: '',
                          conforme: true,
                          observations: ''
                        })
                      }}
                      className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      Annuler
                    </button>
                    <button
                      onClick={handleAddLigne}
                      className="px-3 py-1.5 text-sm bg-emerald-600 text-white rounded-lg hover:bg-emerald-700"
                    >
                      Ajouter
                    </button>
                  </div>
                </div>
              )}

              {lignesForm.length === 0 ? (
                <div className="text-center py-6 text-gray-500 text-sm">
                  Aucune ligne ajoutée. Cliquez sur "Ajouter une ligne" pour commencer.
                </div>
              ) : (
                <div className="space-y-2">
                  {lignesForm.map((ligne, index) => {
                    const article = articles.find(a => a.id === ligne.article)
                    return (
                      <div key={index} className="p-3 bg-white border border-gray-200 rounded-lg">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="font-medium text-gray-900">
                              {article?.reference_interne} - {article?.designation}
                            </div>
                            <div className="text-sm text-gray-600 mt-1">
                              <span className="font-medium">Lot:</span> {ligne.numero_lot} | 
                              <span className="ml-2"><span className="font-medium">Qté:</span> {ligne.quantite_recue || ligne.quantite_attendue} {ligne.unite}</span>
                              {ligne.date_peremption && (
                                <span className="ml-2"><span className="font-medium">Pér:</span> {new Date(ligne.date_peremption).toLocaleDateString('fr-FR')}</span>
                              )}
                            </div>
                          </div>
                          <button
                            onClick={() => handleRemoveLigne(index)}
                            className="ml-3 text-rose-600 hover:text-rose-800"
                            title="Supprimer"
                          >
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowCreateModal(false)
                  setCreateForm({
                    fournisseur: '',
                    numero_commande: '',
                    numero_bl: '',
                    date_livraison_prevue: '',
                    observations: '',
                  })
                  setLignesForm([])
                  setShowAddLigneForm(false)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateReception}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Créer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && selectedReception && action && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedReception(null)
            setAction(null)
          }}
          title={`${action === 'verifier' ? 'Vérifier' : 'Valider'} la réception`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded space-y-2">
              <p className="text-sm"><strong>N° Réception:</strong> {selectedReception.numero_reception}</p>
              <p className="text-sm"><strong>Fournisseur:</strong> {selectedReception.fournisseur_nom}</p>
              <p className="text-sm"><strong>Date:</strong> {new Date(selectedReception.date_reception).toLocaleDateString('fr-FR')}</p>
              <p className="text-sm"><strong>Nombre de lignes:</strong> {selectedReception.nombre_lignes}</p>
              {selectedReception.observations && (
                <p className="text-sm"><strong>Observations:</strong> {selectedReception.observations}</p>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedReception(null)
                  setAction(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleAction}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </Modal>
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
