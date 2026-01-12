import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { Toast } from '../../../components/Toast'

interface Quarantaine {
  id: string
  lot: string
  lot_numero: string
  article_nom: string
  motif: string
  description: string
  date_mise_en_quarantaine: string
  date_levee?: string
  statut: string
  decision?: string
  commentaire_levee?: string
  mis_en_quarantaine_par_nom: string
  leve_par_nom?: string
}

export function QuarantainesPage() {
  const [quarantaines, setQuarantaines] = useState<Quarantaine[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [showDetailsModal, setShowDetailsModal] = useState(false)
  const [selectedQuarantaine, setSelectedQuarantaine] = useState<Quarantaine | null>(null)
  const [decision, setDecision] = useState<string>('ACCEPTE')
  const [commentaire, setCommentaire] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('EN_COURS')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadQuarantaines()
  }, [statusFilter])

  const loadQuarantaines = async () => {
    try {
      setIsLoading(true)
      const params = statusFilter !== 'all' ? { statut: statusFilter } : {}
      const data = await api.stock.quarantaines.list(params)
      setQuarantaines(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleLeverQuarantaine = async () => {
    if (!selectedQuarantaine || !commentaire.trim()) {
      setToast({ message: 'Veuillez saisir un commentaire', type: 'error' })
      return
    }

    try {
      await api.stock.quarantaines.lever(selectedQuarantaine.id, decision, commentaire)
      setToast({ message: 'Quarantaine levée avec succès', type: 'success' })
      setShowModal(false)
      setSelectedQuarantaine(null)
      setDecision('ACCEPTE')
      setCommentaire('')
      loadQuarantaines()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Gestion des Quarantaines</h1>
        <p className="text-gray-600 mt-1">Suivi des lots en quarantaine</p>
      </div>

      <div className="bg-white rounded-lg shadow p-4">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
        >
          <option value="EN_COURS">En cours</option>
          <option value="LEVEE">Levées</option>
          <option value="all">Toutes</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">En cours</div>
          <div className="text-2xl font-bold text-amber-600">
            {quarantaines.filter(q => q.statut === 'EN_COURS').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Acceptées</div>
          <div className="text-2xl font-bold text-emerald-600">
            {quarantaines.filter(q => q.decision === 'ACCEPTE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Refusées</div>
          <div className="text-2xl font-bold text-rose-600">
            {quarantaines.filter(q => q.decision === 'REFUSE').length}
          </div>
        </div>
      </div>

      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Chargement...
          </div>
        ) : quarantaines.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Aucune quarantaine trouvée
          </div>
        ) : (
          quarantaines.map((quarantaine) => (
            <div key={quarantaine.id} className="bg-white rounded-lg shadow p-6 border-l-4 border-amber-400">
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-gray-900">
                      Lot {quarantaine.lot_numero}
                    </h3>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      quarantaine.statut === 'EN_COURS'
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-gray-100 text-gray-600'
                    }`}>
                      {quarantaine.statut === 'EN_COURS' ? 'En cours' : 'Levée'}
                    </span>
                    {quarantaine.decision && (
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        quarantaine.decision === 'ACCEPTE'
                          ? 'bg-emerald-100 text-emerald-700'
                          : 'bg-rose-100 text-rose-700'
                      }`}>
                        {quarantaine.decision === 'ACCEPTE' ? 'Accepté' : 'Refusé'}
                      </span>
                    )}
                  </div>

                  <p className="text-sm text-gray-600 mb-1">Article: {quarantaine.article_nom}</p>
                  <p className="text-sm font-medium text-amber-700 mb-2">Motif: {quarantaine.motif}</p>
                  <p className="text-gray-700 mb-3">{quarantaine.description}</p>

                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-500">Mise en quarantaine le:</span>
                      <p className="font-medium text-gray-900">
                        {new Date(quarantaine.date_mise_en_quarantaine).toLocaleDateString('fr-FR')}
                      </p>
                      <p className="text-xs text-gray-500">Par {quarantaine.mis_en_quarantaine_par_nom}</p>
                    </div>
                    {quarantaine.date_levee && (
                      <div>
                        <span className="text-gray-500">Levée le:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(quarantaine.date_levee).toLocaleDateString('fr-FR')}
                        </p>
                        {quarantaine.leve_par_nom && (
                          <p className="text-xs text-gray-500">Par {quarantaine.leve_par_nom}</p>
                        )}
                      </div>
                    )}
                  </div>

                  {quarantaine.commentaire_levee && (
                    <div className="mt-3 p-3 bg-gray-50 rounded">
                      <p className="text-sm text-gray-600">
                        <span className="font-medium">Commentaire:</span> {quarantaine.commentaire_levee}
                      </p>
                    </div>
                  )}
                </div>

                <div className="flex gap-2 ml-4">
                  <button
                    onClick={() => {
                      setSelectedQuarantaine(quarantaine)
                      setShowDetailsModal(true)
                    }}
                    className="px-4 py-2 text-sky-600 border border-sky-600 rounded-lg hover:bg-sky-50"
                  >
                    Détails
                  </button>
                  {quarantaine.statut === 'EN_COURS' && (
                    <button
                      onClick={() => {
                        setSelectedQuarantaine(quarantaine)
                        setShowModal(true)
                      }}
                      className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                    >
                      Lever
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {showDetailsModal && selectedQuarantaine && (
        <Modal
          isOpen={showDetailsModal}
          onClose={() => {
            setShowDetailsModal(false)
            setSelectedQuarantaine(null)
          }}
          title={`Détails de la quarantaine - Lot ${selectedQuarantaine.lot_numero}`}
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700">Lot</label>
                <p className="mt-1 text-sm text-gray-900">{selectedQuarantaine.lot_numero}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Article</label>
                <p className="mt-1 text-sm text-gray-900">{selectedQuarantaine.article_nom}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Motif</label>
                <p className="mt-1 text-sm font-medium text-amber-700">{selectedQuarantaine.motif}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Statut</label>
                <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                  selectedQuarantaine.statut === 'EN_COURS'
                    ? 'bg-amber-100 text-amber-700'
                    : 'bg-gray-100 text-gray-600'
                }`}>
                  {selectedQuarantaine.statut === 'EN_COURS' ? 'En cours' : 'Levée'}
                </span>
              </div>
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700">Description</label>
                <p className="mt-1 text-sm text-gray-900">{selectedQuarantaine.description}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Mise en quarantaine le</label>
                <p className="mt-1 text-sm text-gray-900">
                  {new Date(selectedQuarantaine.date_mise_en_quarantaine).toLocaleDateString('fr-FR')}
                </p>
                <p className="text-xs text-gray-500">Par {selectedQuarantaine.mis_en_quarantaine_par_nom}</p>
              </div>
              {selectedQuarantaine.date_levee && (
                <div>
                  <label className="block text-sm font-medium text-gray-700">Levée le</label>
                  <p className="mt-1 text-sm text-gray-900">
                    {new Date(selectedQuarantaine.date_levee).toLocaleDateString('fr-FR')}
                  </p>
                  {selectedQuarantaine.leve_par_nom && (
                    <p className="text-xs text-gray-500">Par {selectedQuarantaine.leve_par_nom}</p>
                  )}
                </div>
              )}
              {selectedQuarantaine.decision && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Décision</label>
                  <span className={`mt-1 inline-block px-2 py-1 text-xs rounded-full ${
                    selectedQuarantaine.decision === 'ACCEPTE'
                      ? 'bg-emerald-100 text-emerald-700'
                      : 'bg-rose-100 text-rose-700'
                  }`}>
                    {selectedQuarantaine.decision === 'ACCEPTE' ? 'Accepté' : selectedQuarantaine.decision === 'REFUSE' ? 'Refusé' : 'Destruction'}
                  </span>
                </div>
              )}
              {selectedQuarantaine.commentaire_levee && (
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700">Commentaire de levée</label>
                  <p className="mt-1 text-sm text-gray-900">{selectedQuarantaine.commentaire_levee}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-4">
              <button
                onClick={() => {
                  setShowDetailsModal(false)
                  setSelectedQuarantaine(null)
                }}
                className="px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700"
              >
                Fermer
              </button>
            </div>
          </div>
        </Modal>
      )}

      {showModal && selectedQuarantaine && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedQuarantaine(null)
            setDecision('ACCEPTE')
            setCommentaire('')
          }}
          title={`Lever la quarantaine - Lot ${selectedQuarantaine.lot_numero}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700"><strong>Motif:</strong> {selectedQuarantaine.motif}</p>
              <p className="text-sm text-gray-700 mt-1">{selectedQuarantaine.description}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Décision <span className="text-rose-500">*</span>
              </label>
              <select
                value={decision}
                onChange={(e) => setDecision(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
              >
                <option value="ACCEPTE">Accepter le lot</option>
                <option value="REFUSE">Refuser le lot</option>
                <option value="DESTRUCTION">Destruction requise</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                placeholder="Justifiez votre décision..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedQuarantaine(null)
                  setDecision('ACCEPTE')
                  setCommentaire('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleLeverQuarantaine}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                disabled={!commentaire.trim()}
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
