import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { Toast } from '../../../components/Toast'

interface Alerte {
  id: string
  type_alerte: string
  niveau_criticite: string
  article?: string
  article_nom?: string
  article_reference?: string
  lot?: string
  lot_numero?: string
  titre: string
  message: string
  statut: string
  date_creation: string
  date_traitement?: string
  traite_par?: string
  traite_par_nom?: string
  commentaire_traitement?: string
}

export function AlertesStockPage() {
  const [alertes, setAlertes] = useState<Alerte[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [selectedAlerte, setSelectedAlerte] = useState<Alerte | null>(null)
  const [commentaire, setCommentaire] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('ACTIVE')
  const [criticaliteFilter, setCriticaliteFilter] = useState<string>('all')
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' } | null>(null)

  useEffect(() => {
    loadAlertes()
  }, [statusFilter, criticaliteFilter])

  const loadAlertes = async () => {
    try {
      setIsLoading(true)
      const params: Record<string, string> = {}
      if (statusFilter !== 'all') params.statut = statusFilter
      if (criticaliteFilter !== 'all') params.niveau_criticite = criticaliteFilter
      
      const data = await api.stock.alertes.list(params)
      setAlertes(data.results || data || [])
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur de chargement', type: 'error' })
    } finally {
      setIsLoading(false)
    }
  }

  const handleTraiterAlerte = async () => {
    if (!selectedAlerte || !commentaire.trim()) {
      setToast({ message: 'Veuillez saisir un commentaire', type: 'error' })
      return
    }

    try {
      await api.stock.alertes.marquerTraitee(selectedAlerte.id, commentaire)
      setToast({ message: 'Alerte traitée avec succès', type: 'success' })
      setShowModal(false)
      setSelectedAlerte(null)
      setCommentaire('')
      loadAlertes()
    } catch (error: any) {
      setToast({ message: error.message || 'Erreur', type: 'error' })
    }
  }

  const getCriticaliteColor = (niveau: string) => {
    const colors: Record<string, string> = {
      'CRITIQUE': 'bg-rose-100 text-rose-800 border-rose-200',
      'ELEVEE': 'bg-amber-100 text-amber-800 border-amber-200',
      'MOYENNE': 'bg-yellow-100 text-yellow-800 border-yellow-200',
      'FAIBLE': 'bg-blue-100 text-blue-800 border-blue-200'
    }
    return colors[niveau] || 'bg-gray-100 text-gray-800 border-gray-200'
  }

  const getCriticaliteIcon = (niveau: string) => {
    switch (niveau) {
      case 'CRITIQUE':
        return (
          <svg className="w-5 h-5 text-rose-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
          </svg>
        )
      case 'ELEVEE':
        return (
          <svg className="w-5 h-5 text-amber-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        )
      case 'MOYENNE':
        return (
          <svg className="w-5 h-5 text-yellow-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
      default:
        return (
          <svg className="w-5 h-5 text-blue-600" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        )
    }
  }

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      'PEREMPTION_PROCHE': 'Péremption proche',
      'STOCK_BAS': 'Stock bas',
      'QUARANTAINE': 'Quarantaine',
      'CONSOMMATION_ANORMALE': 'Consommation anormale',
      'AUTRE': 'Autre'
    }
    return labels[type] || type
  }

  const NIVEAU_LABELS: Record<string, string> = {
    'CRITIQUE': 'Critique',
    'ELEVEE': 'Élevée',
    'MOYENNE': 'Moyenne',
    'FAIBLE': 'Faible'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Alertes Stock</h1>
        <p className="text-gray-600 mt-1">Gestion et suivi des alertes du système de stock</p>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="ACTIVE">Alertes actives</option>
            <option value="TRAITEE">Alertes traitées</option>
            <option value="all">Toutes les alertes</option>
          </select>

          <select
            value={criticaliteFilter}
            onChange={(e) => setCriticaliteFilter(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
          >
            <option value="all">Toutes les criticités</option>
            {Object.entries(NIVEAU_LABELS).map(([value, label]) => (
              <option key={value} value={value}>{label}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Critiques</div>
          <div className="text-2xl font-bold text-rose-600">
            {alertes.filter(a => a.niveau_criticite === 'CRITIQUE' && a.statut === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Élevées</div>
          <div className="text-2xl font-bold text-amber-600">
            {alertes.filter(a => a.niveau_criticite === 'ELEVEE' && a.statut === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Moyennes</div>
          <div className="text-2xl font-bold text-yellow-600">
            {alertes.filter(a => a.niveau_criticite === 'MOYENNE' && a.statut === 'ACTIVE').length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow p-4">
          <div className="text-sm text-gray-600">Total actives</div>
          <div className="text-2xl font-bold text-sky-600">
            {alertes.filter(a => a.statut === 'ACTIVE').length}
          </div>
        </div>
      </div>

      {/* Alerts List */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Chargement...
          </div>
        ) : alertes.length === 0 ? (
          <div className="bg-white rounded-lg shadow p-12 text-center text-gray-500">
            Aucune alerte trouvée
          </div>
        ) : (
          alertes.map((alerte) => (
            <div
              key={alerte.id}
              className={`bg-white rounded-lg shadow p-6 border-l-4 ${
                alerte.statut === 'TRAITEE' ? 'opacity-60' : ''
              } ${getCriticaliteColor(alerte.niveau_criticite)}`}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="flex-shrink-0">
                    {getCriticaliteIcon(alerte.niveau_criticite)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {alerte.titre}
                      </h3>
                      <span className={`px-2 py-1 text-xs rounded-full ${
                        alerte.statut === 'ACTIVE'
                          ? 'bg-rose-100 text-rose-700'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {alerte.statut === 'ACTIVE' ? 'Active' : 'Traitée'}
                      </span>
                      <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                        {getTypeLabel(alerte.type_alerte)}
                      </span>
                    </div>

                    <p className="text-gray-700 mb-3">{alerte.message}</p>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      {alerte.article_nom && (
                        <div>
                          <span className="text-gray-500">Article:</span>
                          <p className="font-medium text-gray-900">{alerte.article_nom}</p>
                          <p className="text-xs text-gray-500">{alerte.article_reference}</p>
                        </div>
                      )}
                      {alerte.lot_numero && (
                        <div>
                          <span className="text-gray-500">Lot:</span>
                          <p className="font-medium text-gray-900">{alerte.lot_numero}</p>
                        </div>
                      )}
                      <div>
                        <span className="text-gray-500">Créée le:</span>
                        <p className="font-medium text-gray-900">
                          {new Date(alerte.date_creation).toLocaleDateString('fr-FR')}
                        </p>
                        <p className="text-xs text-gray-500">
                          {new Date(alerte.date_creation).toLocaleTimeString('fr-FR')}
                        </p>
                      </div>
                      {alerte.statut === 'TRAITEE' && alerte.date_traitement && (
                        <div>
                          <span className="text-gray-500">Traitée le:</span>
                          <p className="font-medium text-gray-900">
                            {new Date(alerte.date_traitement).toLocaleDateString('fr-FR')}
                          </p>
                          {alerte.traite_par_nom && (
                            <p className="text-xs text-gray-500">Par {alerte.traite_par_nom}</p>
                          )}
                        </div>
                      )}
                    </div>

                    {alerte.commentaire_traitement && (
                      <div className="mt-3 p-3 bg-gray-50 rounded">
                        <p className="text-sm text-gray-600">
                          <span className="font-medium">Commentaire:</span> {alerte.commentaire_traitement}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {alerte.statut === 'ACTIVE' && (
                  <button
                    onClick={() => {
                      setSelectedAlerte(alerte)
                      setShowModal(true)
                    }}
                    className="ml-4 px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700 flex-shrink-0"
                  >
                    Traiter
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {/* Modal Traitement */}
      {showModal && selectedAlerte && (
        <Modal
          isOpen={showModal}
          onClose={() => {
            setShowModal(false)
            setSelectedAlerte(null)
            setCommentaire('')
          }}
          title={`Traiter l'alerte: ${selectedAlerte.titre}`}
        >
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded">
              <p className="text-sm text-gray-700">{selectedAlerte.message}</p>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Commentaire de traitement <span className="text-rose-500">*</span>
              </label>
              <textarea
                value={commentaire}
                onChange={(e) => setCommentaire(e.target.value)}
                rows={4}
                placeholder="Décrivez les actions entreprises pour traiter cette alerte..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-sky-500"
                required
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <button
                onClick={() => {
                  setShowModal(false)
                  setSelectedAlerte(null)
                  setCommentaire('')
                }}
                className="px-4 py-2 text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Annuler
              </button>
              <button
                onClick={handleTraiterAlerte}
                className="px-4 py-2 bg-sky-600 text-white rounded-lg hover:bg-sky-700"
                disabled={!commentaire.trim()}
              >
                Marquer comme traitée
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
          isVisible={true}
          onClose={() => setToast(null)}
        />
      )}
    </div>
  )
}
