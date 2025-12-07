import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function FacturationPage() {
  const [factures, setFactures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [activeTab, setActiveTab] = useState<'factures' | 'devis'>('factures')
  const [filterStatut, setFilterStatut] = useState('TOUS')
  const [editingFacture, setEditingFacture] = useState<any>(null)
  const [formData, setFormData] = useState({
    numero: '',
    client_id: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    montant_ht: '',
    montant_tva: '',
    montant_ttc: '',
    statut: 'EN_ATTENTE',
    demande_devis_ids: [] as string[],
    notes: ''
  })

  useEffect(() => {
    loadFactures()
  }, [])

  const loadFactures = async () => {
    try {
      setIsLoading(true)
      const data = await api.factures.list()
      setFactures(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement factures:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingFacture) {
        await api.factures.update(editingFacture.id, formData)
      } else {
        await api.factures.create(formData)
      }
      setShowModal(false)
      setEditingFacture(null)
      resetForm()
      loadFactures()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const handleMarkAsPaid = async (factureId: string) => {
    try {
      await api.factures.pay(factureId, {
        date_paiement: new Date().toISOString().split('T')[0],
        mode_paiement: 'VIREMENT'
      })
      loadFactures()
    } catch (error) {
      console.error('Erreur marquage paiement:', error)
    }
  }

  const handleEdit = (facture: any) => {
    setEditingFacture(facture)
    setFormData({
      numero: facture.numero || '',
      client_id: facture.client?.id || '',
      date_emission: facture.date_emission || new Date().toISOString().split('T')[0],
      date_echeance: facture.date_echeance || '',
      montant_ht: facture.montant_ht?.toString() || '',
      montant_tva: facture.montant_tva?.toString() || '',
      montant_ttc: facture.montant_ttc?.toString() || '',
      statut: facture.statut || 'EN_ATTENTE',
      demande_devis_ids: facture.demandes?.map((d: any) => d.id) || [],
      notes: facture.notes || ''
    })
    setShowModal(true)
  }

  const resetForm = () => {
    setFormData({
      numero: '',
      client_id: '',
      date_emission: new Date().toISOString().split('T')[0],
      date_echeance: '',
      montant_ht: '',
      montant_tva: '',
      montant_ttc: '',
      statut: 'EN_ATTENTE',
      demande_devis_ids: [],
      notes: ''
    })
  }

  const calculateTTC = () => {
    const ht = parseFloat(formData.montant_ht) || 0
    const tva = parseFloat(formData.montant_tva) || 0
    return (ht + tva).toFixed(2)
  }

  const statutBadgeColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE': 'bg-amber-50 text-amber-700',
      'PAYEE': 'bg-emerald-50 text-emerald-700',
      'RETARD': 'bg-rose-50 text-rose-700',
      'ANNULEE': 'bg-slate-100 text-slate-500'
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const filteredFactures = factures.filter(f => {
    if (filterStatut === 'TOUS') return true
    return f.statut === filterStatut
  })

  const totalHT = filteredFactures.reduce((sum, f) => sum + (f.montant_ht || 0), 0)
  const totalTTC = filteredFactures.reduce((sum, f) => sum + (f.montant_ttc || 0), 0)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion de la facturation</h1>
          <p className="text-sm text-slate-600 mt-1">Créez et gérez les factures et devis</p>
        </div>
        <button 
          onClick={() => {
            setEditingFacture(null)
            resetForm()
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle facture
        </button>
      </div>

      {/* Tabs */}
      <div className="lanema-card">
        <div className="flex border-b border-slate-200">
          <button
            onClick={() => setActiveTab('factures')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'factures'
                ? 'text-lanema-blue-600 border-b-2 border-lanema-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Factures
          </button>
          <button
            onClick={() => setActiveTab('devis')}
            className={`px-6 py-3 text-sm font-medium transition ${
              activeTab === 'devis'
                ? 'text-lanema-blue-600 border-b-2 border-lanema-blue-600'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Devis
          </button>
        </div>
      </div>

      {activeTab === 'factures' && (
        <>
          {/* Stats */}
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              {[...Array(4)].map((_, i) => (
                <div key={i} className="lanema-card p-4 animate-pulse">
                  <div className="h-4 w-20 bg-slate-200 rounded mb-2"></div>
                  <div className="h-8 w-24 bg-slate-200 rounded"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div className="lanema-card p-4">
                <div className="text-xs text-slate-500 mb-1">Total factures</div>
                <div className="text-2xl font-semibold text-slate-900">{factures.length}</div>
              </div>
              <div className="lanema-card p-4">
                <div className="text-xs text-slate-500 mb-1">Montant HT</div>
                <div className="text-2xl font-semibold text-slate-900">
                  {totalHT.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <div className="lanema-card p-4">
                <div className="text-xs text-slate-500 mb-1">Montant TTC</div>
                <div className="text-2xl font-semibold text-lanema-blue-600">
                  {totalTTC.toLocaleString('fr-FR')} FCFA
                </div>
              </div>
              <div className="lanema-card p-4">
                <div className="text-xs text-slate-500 mb-1">En retard</div>
                <div className="text-2xl font-semibold text-rose-600">
                  {factures.filter(f => f.statut === 'RETARD').length}
                </div>
              </div>
            </div>
          )}

          {/* Filter */}
          <div className="lanema-card p-4">
            <select
              value={filterStatut}
              onChange={(e) => setFilterStatut(e.target.value)}
              className="w-full md:w-auto px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
            >
              <option value="TOUS">Tous les statuts</option>
              <option value="EN_ATTENTE">En attente</option>
              <option value="PAYEE">Payée</option>
              <option value="RETARD">En retard</option>
              <option value="ANNULEE">Annulée</option>
            </select>
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
          ) : filteredFactures.length === 0 ? (
            <div className="lanema-card p-12 text-center">
              <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune facture trouvée</h3>
              <p className="text-sm text-slate-600">Commencez par créer une nouvelle facture</p>
            </div>
          ) : (
            <div className="lanema-card overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Numéro</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Client</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Date émission</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Date échéance</th>
                      <th className="px-4 py-3 text-right text-xs font-medium text-slate-600">Montant TTC</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                      <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredFactures.map((facture) => (
                      <tr key={facture.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                        <td className="px-4 py-3 text-sm font-medium text-slate-900">
                          {facture.numero}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-700">
                          {facture.client?.raison_sociale || 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {facture.date_emission ? new Date(facture.date_emission).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm text-slate-600">
                          {facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') : 'N/A'}
                        </td>
                        <td className="px-4 py-3 text-sm font-semibold text-slate-900 text-right">
                          {(facture.montant_ttc || 0).toLocaleString('fr-FR')} FCFA
                        </td>
                        <td className="px-4 py-3 text-sm">
                          <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${statutBadgeColor(facture.statut)}`}>
                            {facture.statut === 'EN_ATTENTE' ? 'En attente' :
                             facture.statut === 'PAYEE' ? 'Payée' :
                             facture.statut === 'RETARD' ? 'En retard' : facture.statut}
                          </span>
                        </td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <button 
                              onClick={() => handleEdit(facture)}
                              className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium hover:underline"
                            >
                              Éditer
                            </button>
                            {facture.statut === 'EN_ATTENTE' && (
                              <button
                                onClick={() => handleMarkAsPaid(facture.id)}
                                className="text-sm text-emerald-600 hover:text-emerald-700 font-medium hover:underline"
                              >
                                Marquer payée
                              </button>
                            )}
                            {facture.pdf_url && (
                              <a
                                href={facture.pdf_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-sm text-slate-600 hover:text-slate-700"
                                title="Télécharger PDF"
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
        </>
      )}

      {activeTab === 'devis' && (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Devis</h3>
          <p className="text-sm text-slate-600">Gestion des devis à venir</p>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingFacture ? 'Modifier la facture' : 'Nouvelle facture'}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setEditingFacture(null)
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
                      Numéro facture *
                    </label>
                    <input
                      type="text"
                      value={formData.numero}
                      onChange={(e) => setFormData({...formData, numero: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="FACT-2024-XXXX"
                      required
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
                      <option value="PAYEE">Payée</option>
                      <option value="RETARD">En retard</option>
                      <option value="ANNULEE">Annulée</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date émission *
                    </label>
                    <input
                      type="date"
                      value={formData.date_emission}
                      onChange={(e) => setFormData({...formData, date_emission: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Date échéance *
                    </label>
                    <input
                      type="date"
                      value={formData.date_echeance}
                      onChange={(e) => setFormData({...formData, date_echeance: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Montant HT (FCFA) *
                    </label>
                    <input
                      type="number"
                      value={formData.montant_ht}
                      onChange={(e) => setFormData({...formData, montant_ht: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="0"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Montant TVA (FCFA)
                    </label>
                    <input
                      type="number"
                      value={formData.montant_tva}
                      onChange={(e) => setFormData({...formData, montant_tva: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="0"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Montant TTC (FCFA)
                    </label>
                    <input
                      type="text"
                      value={calculateTTC()}
                      readOnly
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg bg-slate-50 text-slate-600"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Notes
                    </label>
                    <textarea
                      value={formData.notes}
                      onChange={(e) => setFormData({...formData, notes: e.target.value})}
                      rows={3}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      placeholder="Notes additionnelles..."
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingFacture ? 'Mettre à jour' : 'Créer la facture'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingFacture(null)
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
