import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { Toast } from '../../../components/Toast'

interface Lot {
  id: string
  numero_lot: string
  article: string
  article_nom: string
  article_reference: string
  date_fabrication?: string
  date_peremption?: string
  date_ouverture?: string
  quantite_initiale: number
  quantite_restante: number
  unite: string
  statut: string
  emplacement?: string
  emplacement_code?: string
  est_expire: boolean
  jours_avant_expiration?: number
  numero_certificat_analyse?: string
  fournisseur?: string
  fournisseur_nom?: string
}

interface Emplacement {
  id: string
  code: string
  entrepot_nom?: string
}

export function LotsPage() {
  const [lots, setLots] = useState<Lot[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedLot, setSelectedLot] = useState<Lot | null>(null)
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)
  const [showQuarantaineModal, setShowQuarantaineModal] = useState(false)
  const [showTransfertModal, setShowTransfertModal] = useState(false)
  const [quarantaineLot, setQuarantaineLot] = useState<Lot | null>(null)
  const [transfertLot, setTransfertLot] = useState<Lot | null>(null)
  const [quarantaineForm, setQuarantaineForm] = useState({ motif: 'PEREMPTION', description: '' })
  const [transfertForm, setTransfertForm] = useState({ emplacement_destination: '', quantite: '', unite: '', motif: '' })
  const [emplacements, setEmplacements] = useState<Emplacement[]>([])

  useEffect(() => {
    loadLots()
  }, [statusFilter])

  const loadLots = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter !== 'all' ? { statut: statusFilter } : {}
      const data = await api.stock.lots.list(params)
      setLots(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarquerOuvert = async (lot: Lot) => {
    if (!confirm(`Marquer le lot ${lot.numero_lot} comme ouvert ?`)) return
    
    try {
      await api.stock.lots.marquerOuvert(lot.id)
      setToast({ message: 'Lot marqué comme ouvert', type: 'success' })
      loadLots()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const openQuarantaineModal = (lot: Lot) => {
    setQuarantaineLot(lot)
    setQuarantaineForm({ motif: 'PEREMPTION', description: '' })
    setShowQuarantaineModal(true)
  }

  const handleCreateQuarantaine = async () => {
    if (!quarantaineLot || !quarantaineForm.description.trim()) {
      setToast({ message: 'Veuillez renseigner la description', type: 'error' })
      return
    }

    try {
      await api.stock.quarantaines.create({
        lot: quarantaineLot.id,
        motif: quarantaineForm.motif,
        description: quarantaineForm.description,
      })
      setToast({ message: 'Quarantaine créée', type: 'success' })
      setShowQuarantaineModal(false)
      setQuarantaineLot(null)
      setQuarantaineForm({ motif: 'PEREMPTION', description: '' })
      loadLots()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la création de la quarantaine', type: 'error' })
    }
  }

  const openTransfertModal = async (lot: Lot) => {
    setTransfertLot(lot)
    setTransfertForm({
      emplacement_destination: '',
      quantite: lot.quantite_restante.toString(),
      unite: lot.unite,
      motif: '',
    })
    setShowTransfertModal(true)

    try {
      if (emplacements.length === 0) {
        const data = await api.stock.emplacements.list()
        const items = (data.results || data || []) as Emplacement[]
        setEmplacements(items)
      }
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors du chargement des emplacements', type: 'error' })
    }
  }

  const handleCreateTransfert = async () => {
    if (!transfertLot) return
    if (!transfertForm.emplacement_destination || !transfertForm.quantite || !transfertForm.motif.trim()) {
      setToast({ message: 'Veuillez renseigner la destination, la quantité et le motif', type: 'error' })
      return
    }

    if (!transfertLot.emplacement) {
      setToast({ message: 'Ce lot n’a pas d’emplacement d’origine défini', type: 'error' })
      return
    }

    try {
      await api.stock.transferts.create({
        lot: transfertLot.id,
        emplacement_origine: transfertLot.emplacement,
        emplacement_destination: transfertForm.emplacement_destination,
        quantite: Number(transfertForm.quantite),
        unite: transfertForm.unite || transfertLot.unite,
        motif: transfertForm.motif,
      })
      setToast({ message: 'Transfert créé', type: 'success' })
      setShowTransfertModal(false)
      setTransfertLot(null)
      loadLots()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur lors de la création du transfert', type: 'error' })
    }
  }

  const handleViewDetails = (lot: Lot) => {
    setSelectedLot(lot)
    setShowModal(true)
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'ACTIF': 'bg-emerald-50 text-emerald-700',
      'OUVERT': 'bg-blue-50 text-blue-700',
      'EXPIRE': 'bg-rose-50 text-rose-700',
      'QUARANTAINE': 'bg-amber-50 text-amber-700',
      'EPUISE': 'bg-gray-100 text-gray-600',
      'DETRUIT': 'bg-gray-200 text-gray-700'
    }
    return colors[statut] || 'bg-gray-50 text-gray-700'
  }

  const getPeremptionColor = (jours?: number) => {
    if (!jours || jours < 0) return 'text-rose-600'
    if (jours < 30) return 'text-amber-600'
    if (jours < 60) return 'text-yellow-600'
    return 'text-gray-600'
  }

  const filteredLots = lots.filter(l =>
    l.numero_lot.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.article_nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    l.article_reference.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const STATUT_LABELS: Record<string, string> = {
    'ACTIF': 'Actif',
    'OUVERT': 'Ouvert',
    'EXPIRE': 'Expiré',
    'QUARANTAINE': 'Quarantaine',
    'EPUISE': 'Épuisé',
    'DETRUIT': 'Détruit'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Lots</h1>
        <p className="text-gray-600 mt-1">Suivi et traçabilité des lots de produits</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <input
            type="text"
            placeholder="Rechercher par numéro de lot, article..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500 focus:border-transparent"
          />
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Tous les statuts</option>
            {Object.entries(STATUT_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lots actifs</div>
          <div className="text-2xl font-bold text-emerald-600">
            {lots.filter(l => l.statut === 'ACTIF').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lots ouverts</div>
          <div className="text-2xl font-bold text-blue-600">
            {lots.filter(l => l.statut === 'OUVERT').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Péremption &lt; 30j</div>
          <div className="text-2xl font-bold text-amber-600">
            {lots.filter(l => l.jours_avant_expiration !== undefined && l.jours_avant_expiration < 30 && l.jours_avant_expiration >= 0).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Lots expirés</div>
          <div className="text-2xl font-bold text-rose-600">
            {lots.filter(l => l.est_expire).length}
          </div>
        </div>
      </div>

      {/* Table */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Lot</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Article</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Péremption</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Emplacement</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {isLoading && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Chargement...
                  </td>
                </tr>
              )}
              {!isLoading && filteredLots.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">
                    Aucun lot trouvé
                  </td>
                </tr>
              )}
              {!isLoading && filteredLots.length > 0 && (
                filteredLots.map((lot) => (
                  <tr key={lot.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="font-medium text-gray-900">{lot.numero_lot}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm font-medium text-gray-900">{lot.article_nom}</div>
                      <div className="text-sm text-gray-500">{lot.article_reference}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {lot.quantite_restante} / {lot.quantite_initiale} {lot.unite}
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                        <div
                          className={`h-2 rounded-full ${
                            (lot.quantite_restante / lot.quantite_initiale) > 0.5
                              ? 'bg-emerald-500'
                              : (lot.quantite_restante / lot.quantite_initiale) > 0.2
                              ? 'bg-amber-500'
                              : 'bg-rose-500'
                          }`}
                          style={{ width: `${(lot.quantite_restante / lot.quantite_initiale) * 100}%` }}
                        />
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lot.date_peremption ? (
                        <div>
                          <div className="text-sm text-gray-900">
                            {new Date(lot.date_peremption).toLocaleDateString('fr-FR')}
                          </div>
                          {lot.jours_avant_expiration !== undefined && (
                            <div className={`text-xs font-medium ${getPeremptionColor(lot.jours_avant_expiration)}`}>
                              {lot.jours_avant_expiration >= 0
                                ? `${lot.jours_avant_expiration}j restants`
                                : `Expiré depuis ${Math.abs(lot.jours_avant_expiration)}j`
                              }
                            </div>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-gray-400">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {lot.emplacement_code ? (
                        <span className="text-sm text-gray-900">{lot.emplacement_code}</span>
                      ) : (
                        <span className="text-sm text-gray-400">Non défini</span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatutColor(lot.statut)}`}>
                        {STATUT_LABELS[lot.statut] || lot.statut}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleViewDetails(lot)}
                          className="px-3 py-1.5 text-sm text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50 transition-colors"
                          title="Voir les détails"
                        >
                          Détails
                        </button>
                        {lot.statut === 'ACTIF' && (
                          <button
                            onClick={() => handleMarquerOuvert(lot)}
                            className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                            title="Marquer le lot comme ouvert"
                          >
                            Marquer ouvert
                          </button>
                        )}
                        <button
                          onClick={() => openQuarantaineModal(lot)}
                          className="px-3 py-1.5 text-sm bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition-colors"
                          title="Mettre en quarantaine"
                        >
                          Quarantaine
                        </button>
                        <button
                          onClick={() => openTransfertModal(lot)}
                          className="px-3 py-1.5 text-sm bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors"
                          title="Créer un transfert"
                        >
                          Transférer
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Détails */}
      {showModal && selectedLot && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedLot(null)
          }}
          title={`Détails du lot ${selectedLot.numero_lot}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Article</label>
                <p className="mt-1 text-sm text-gray-900">{selectedLot.article_nom}</p>
                <p className="text-xs text-gray-500">{selectedLot.article_reference}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${getStatutColor(selectedLot.statut)}`}>
                  {STATUT_LABELS[selectedLot.statut] || selectedLot.statut}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité restante</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.quantite_restante} / {selectedLot.quantite_initiale} {selectedLot.unite}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de fabrication</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.date_fabrication
                    ? new Date(selectedLot.date_fabrication).toLocaleDateString('fr-FR')
                    : '-'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de péremption</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.date_peremption
                    ? new Date(selectedLot.date_peremption).toLocaleDateString('fr-FR')
                    : '-'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date d'ouverture</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.date_ouverture
                    ? new Date(selectedLot.date_ouverture).toLocaleDateString('fr-FR')
                    : 'Non ouvert'
                  }
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emplacement</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.emplacement_code || 'Non défini'}
                </p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Fournisseur</label>
                <p className="mt-1 text-sm text-gray-900">
                  {selectedLot.fournisseur_nom || '-'}
                </p>
              </div>
              {selectedLot.numero_certificat_analyse && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">N° Certificat d'analyse</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedLot.numero_certificat_analyse}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedLot(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Quarantaine */}
      {showQuarantaineModal && quarantaineLot && (
        <Modal
          isOpen={showQuarantaineModal}
          onClose={() => {
            setShowQuarantaineModal(false)
            setQuarantaineLot(null)
            setQuarantaineForm({ motif: 'PEREMPTION', description: '' })
          }}
          title={`Mettre le lot ${quarantaineLot.numero_lot} en quarantaine`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700"><strong>Article:</strong> {quarantaineLot.article_nom}</p>
              <p className="text-sm text-gray-700"><strong>Référence:</strong> {quarantaineLot.article_reference}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif
              </label>
              <select
                value={quarantaineForm.motif}
                onChange={(e) => setQuarantaineForm({ ...quarantaineForm, motif: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="PEREMPTION">Péremption</option>
                <option value="NON_CONFORME">Non-conformité détectée</option>
                <option value="DEFAUT_QUALITE">Défaut de qualité</option>
                <option value="ANALYSE_REQUISE">Analyse complémentaire requise</option>
                <option value="AUTRE">Autre</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Description
              </label>
              <textarea
                value={quarantaineForm.description}
                onChange={(e) => setQuarantaineForm({ ...quarantaineForm, description: e.target.value })}
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                placeholder="Décrivez le problème observé..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowQuarantaineModal(false)
                  setQuarantaineLot(null)
                  setQuarantaineForm({ motif: 'PEREMPTION', description: '' })
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateQuarantaine}
                className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700"
              >
                Confirmer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal Transfert */}
      {showTransfertModal && transfertLot && (
        <Modal
          isOpen={showTransfertModal}
          onClose={() => {
            setShowTransfertModal(false)
            setTransfertLot(null)
          }}
          title={`Créer un transfert pour le lot ${transfertLot.numero_lot}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700"><strong>Article:</strong> {transfertLot.article_nom}</p>
              <p className="text-sm text-gray-700"><strong>Emplacement actuel:</strong> {transfertLot.emplacement_code || 'Non défini'}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Emplacement de destination
              </label>
              <select
                value={transfertForm.emplacement_destination}
                onChange={(e) => setTransfertForm({ ...transfertForm, emplacement_destination: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="">Sélectionner...</option>
                {emplacements.map((emp) => (
                  <option key={emp.id} value={emp.id}>
                    {emp.code}{emp.entrepot_nom ? ` - ${emp.entrepot_nom}` : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Quantité à transférer
                </label>
                <input
                  type="number"
                  value={transfertForm.quantite}
                  onChange={(e) => setTransfertForm({ ...transfertForm, quantite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  min={0}
                  max={transfertLot.quantite_restante}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unité
                </label>
                <input
                  type="text"
                  value={transfertForm.unite}
                  onChange={(e) => setTransfertForm({ ...transfertForm, unite: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                  placeholder={transfertLot.unite}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Motif du transfert
              </label>
              <textarea
                value={transfertForm.motif}
                onChange={(e) => setTransfertForm({ ...transfertForm, motif: e.target.value })}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                placeholder="Justifiez le transfert..."
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowTransfertModal(false)
                  setTransfertLot(null)
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleCreateTransfert}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
              >
                Créer le transfert
              </button>
            </div>
          </div>
        </Modal>
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
