import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { Toast } from '../../../components/Toast'

interface Transfert {
  id: string
  numero_transfert: string
  lot: string
  lot_numero: string
  article_nom: string
  emplacement_source: string
  emplacement_source_code: string
  emplacement_destination: string
  emplacement_destination_code: string
  quantite_transferee: number
  unite: string
  motif: string
  statut: string
  date_demande: string
  date_validation?: string
  date_execution?: string
  demande_par_nom: string
  valide_par_nom?: string
  execute_par_nom?: string
}

export function TransfertsPage() {
  const [transferts, setTransferts] = useState<Transfert[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedTransfert, setSelectedTransfert] = useState<Transfert | null>(null)
  const [action, setAction] = useState<'valider' | 'executer' | null>(null)
  const [statusFilter, setStatusFilter] = useState<string>('EN_ATTENTE')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadTransferts()
  }, [statusFilter])

  const loadTransferts = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter !== 'all' ? { statut: statusFilter } : {}
      const data = await api.stock.transferts.list(params)
      setTransferts(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleAction = async () => {
    if (!selectedTransfert || !action) return

    try {
      if (action === 'valider') {
        await api.stock.transferts.valider(selectedTransfert.id)
        setToast({ message: 'Transfert validé', type: 'success' })
      } else if (action === 'executer') {
        await api.stock.transferts.executer(selectedTransfert.id)
        setToast({ message: 'Transfert exécuté', type: 'success' })
      }
      setShowModal(false)
      setSelectedTransfert(null)
      setAction(null)
      loadTransferts()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE': 'bg-amber-100 text-amber-700',
      'VALIDE': 'bg-blue-100 text-blue-700',
      'EXECUTE': 'bg-emerald-100 text-emerald-700',
      'ANNULE': 'bg-gray-100 text-gray-600'
    }
    return colors[statut] || 'bg-gray-100 text-gray-600'
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Transferts Internes</h1>
        <p className="text-gray-600 mt-1">Gestion des transferts entre emplacements</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        >
          <option value="EN_ATTENTE">En attente</option>
          <option value="VALIDE">Validés</option>
          <option value="EXECUTE">Exécutés</option>
          <option value="all">Tous</option>
        </select>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <table className="min-w-full divide-y divide-gray-200">
          <thead className="bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">N° Transfert</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Lot</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Source → Destination</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Quantité</th>
              <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Statut</th>
              <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
            </tr>
          </thead>
          <tbody className="bg-white divide-y divide-gray-200">
            {isLoading ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chargement...</td>
              </tr>
            ) : transferts.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Aucun transfert trouvé</td>
              </tr>
            ) : (
              transferts.map((transfert) => (
                <tr key={transfert.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="font-medium text-gray-900">{transfert.numero_transfert}</span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm font-medium text-gray-900">{transfert.lot_numero}</div>
                    <div className="text-sm text-gray-500">{transfert.article_nom}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-gray-900">{transfert.emplacement_source_code}</span>
                      <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                      </svg>
                      <span className="text-sm font-medium text-gray-900">{transfert.emplacement_destination_code}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className="text-sm text-gray-900">{transfert.quantite_transferee} {transfert.unite}</span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 py-1 text-xs rounded-full ${getStatutColor(transfert.statut || 'EN_ATTENTE')}`}>
                      {(transfert.statut || 'EN_ATTENTE').replace('_', ' ')}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium space-x-2">
                    <button
                      onClick={() => {
                        setSelectedTransfert(transfert)
                        setShowDetailsModal(true)
                      }}
                      className="text-sky-600 hover:text-sky-900"
                    >
                      Détails
                    </button>
                    {transfert.statut === 'EN_ATTENTE' && (
                      <button
                        onClick={() => {
                          setSelectedTransfert(transfert)
                          setAction('valider')
                          setShowModal(true)
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Valider
                      </button>
                    )}
                    {transfert.statut === 'VALIDE' && (
                      <button
                        onClick={() => {
                          setSelectedTransfert(transfert)
                          setAction('executer')
                          setShowModal(true)
                        }}
                        className="text-emerald-600 hover:text-emerald-900"
                      >
                        Exécuter
                      </button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showDetailsModal && selectedTransfert && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedTransfert(null)
          }}
          title={`Détails du transfert ${selectedTransfert.numero_transfert}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">N° Transfert</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.numero_transfert}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${getStatutColor(selectedTransfert.statut || 'EN_ATTENTE')}`}>
                  {(selectedTransfert.statut || 'EN_ATTENTE').replace('_', ' ')}
                </span>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Lot</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.lot_numero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Article</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.article_nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emplacement source</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.emplacement_source_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Emplacement destination</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.emplacement_destination_code}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Quantité transférée</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.quantite_transferee} {selectedTransfert.unite}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Date de demande</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedTransfert.date_demande).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">Par {selectedTransfert.demande_par_nom}</p>
              </div>
              {selectedTransfert.date_validation && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date de validation</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedTransfert.date_validation).toLocaleDateString('fr-FR')}
                  </p>
                  {selectedTransfert.valide_par_nom && (
                    <p className="text-xs text-gray-500">Par {selectedTransfert.valide_par_nom}</p>
                  )}
                </div>
              )}
              {selectedTransfert.date_execution && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Date d'exécution</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedTransfert.date_execution).toLocaleDateString('fr-FR')}
                  </p>
                  {selectedTransfert.execute_par_nom && (
                    <p className="text-xs text-gray-500">Par {selectedTransfert.execute_par_nom}</p>
                  )}
                </div>
              )}
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Motif</label>
                <p className="mt-1 text-sm text-gray-900">{selectedTransfert.motif}</p>
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedTransfert(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && selectedTransfert && action && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedTransfert(null)
            setAction(null)
          }}
          title={`${action === 'valider' ? 'Valider' : 'Exécuter'} le transfert`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded space-y-2">
              <p className="text-sm"><strong>N° Transfert:</strong> {selectedTransfert.numero_transfert}</p>
              <p className="text-sm"><strong>Lot:</strong> {selectedTransfert.lot_numero}</p>
              <p className="text-sm"><strong>Article:</strong> {selectedTransfert.article_nom}</p>
              <p className="text-sm"><strong>Source:</strong> {selectedTransfert.emplacement_source_code}</p>
              <p className="text-sm"><strong>Destination:</strong> {selectedTransfert.emplacement_destination_code}</p>
              <p className="text-sm"><strong>Quantité:</strong> {selectedTransfert.quantite_transferee} {selectedTransfert.unite}</p>
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedTransfert(null)
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
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
