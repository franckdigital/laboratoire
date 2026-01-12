import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { AlertModal } from '../../../components/AlertModal'

export function AdminAnalysesPage() {
  const [analyses, setAnalyses] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'toutes' | 'en_attente' | 'en_cours' | 'terminees'>('en_attente')
  const [showObservationsModal, setShowObservationsModal] = useState(false)
  const [selectedAnalyse, setSelectedAnalyse] = useState<any>(null)
  const [observations, setObservations] = useState('')

  // Modal de confirmation pour la réception des échantillons
  const [confirmDepotOpen, setConfirmDepotOpen] = useState(false)
  const [confirmDepotTarget, setConfirmDepotTarget] = useState<any>(null)
  const [isConfirmDepotLoading, setIsConfirmDepotLoading] = useState(false)
  // Modal de confirmation pour démarrer l'analyse
  const [confirmStartOpen, setConfirmStartOpen] = useState(false)
  const [confirmStartTarget, setConfirmStartTarget] = useState<any>(null)
  const [isConfirmStartLoading, setIsConfirmStartLoading] = useState(false)
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackTitle, setFeedbackTitle] = useState('')
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackType, setFeedbackType] = useState<'success' | 'warning' | 'danger' | 'info'>('info')

  useEffect(() => {
    loadAnalyses()
  }, [])

  const loadAnalyses = async () => {
    try {
      setIsLoading(true)
      const data = await api.demandeAnalyse.list()
      setAnalyses(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement analyses:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleVoirResultats = (analyse: any) => {
    setFeedbackTitle('Résultats non disponibles dans la démo')
    setFeedbackMessage(
      "La visualisation détaillée des rapports de résultats n'est pas encore implémentée dans cette version. " +
      "Les rapports pourront être générés et consultés ici dans une prochaine mise à jour."
    )
    setFeedbackType('info')
    setFeedbackOpen(true)
  }

  const openConfirmDepotModal = (analyse: any) => {
    setConfirmDepotTarget(analyse)
    setConfirmDepotOpen(true)
  }

  const handleConfirmDepot = async () => {
    if (!confirmDepotTarget) return
    setIsConfirmDepotLoading(true)

    try {
      await api.demandeAnalyse.confirmerDepotEchantillons(confirmDepotTarget.id)
      setConfirmDepotOpen(false)
      setConfirmDepotTarget(null)
      await loadAnalyses()

      setFeedbackTitle('Réception confirmée')
      setFeedbackMessage(`La réception des échantillons pour ${confirmDepotTarget.numero} a bien été enregistrée.`)
      setFeedbackType('success')
      setFeedbackOpen(true)
    } catch (error: any) {
      console.error('Erreur confirmation:', error)
      setFeedbackTitle('Erreur lors de la confirmation')
      setFeedbackMessage(error.message || "Une erreur est survenue lors de la confirmation de la réception des échantillons.")
      setFeedbackType('danger')
      setFeedbackOpen(true)
    } finally {
      setIsConfirmDepotLoading(false)
    }
  }

  const openConfirmStartModal = (analyse: any) => {
    setConfirmStartTarget(analyse)
    setConfirmStartOpen(true)
  }

  const handleConfirmStart = async () => {
    if (!confirmStartTarget) return
    setIsConfirmStartLoading(true)

    try {
      await api.demandeAnalyse.demarrerAnalyse(confirmStartTarget.id)
      setConfirmStartOpen(false)
      setConfirmStartTarget(null)
      await loadAnalyses()

      setFeedbackTitle('Analyse démarrée')
      setFeedbackMessage(`L'analyse ${confirmStartTarget.numero} a bien été démarrée.`)
      setFeedbackType('success')
      setFeedbackOpen(true)
    } catch (error: any) {
      console.error('Erreur démarrage:', error)
      setFeedbackTitle("Erreur lors du démarrage de l'analyse")
      setFeedbackMessage(error.message || "Une erreur est survenue lors du démarrage de l'analyse.")
      setFeedbackType('danger')
      setFeedbackOpen(true)
    } finally {
      setIsConfirmStartLoading(false)
    }
  }

  const openTerminerModal = (analyse: any) => {
    setSelectedAnalyse(analyse)
    setObservations('')
    setShowObservationsModal(true)
  }

  const terminerAnalyse = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedAnalyse) return

    try {
      await api.demandeAnalyse.terminerAnalyse(selectedAnalyse.id, observations)
      setShowObservationsModal(false)
      await loadAnalyses()

      setFeedbackTitle('Analyse terminée')
      setFeedbackMessage(`L'analyse ${selectedAnalyse.numero} a été marquée comme terminée.`)
      setFeedbackType('success')
      setFeedbackOpen(true)
    } catch (error: any) {
      console.error('Erreur fin analyse:', error)
      setFeedbackTitle("Erreur lors de la fin d'analyse")
      setFeedbackMessage(error.message || "Une erreur est survenue lors de la clôture de l'analyse.")
      setFeedbackType('danger')
      setFeedbackOpen(true)
    }
  }

  const filteredAnalyses = analyses.filter(a => {
    if (filter === 'en_attente') return a.statut === 'EN_ATTENTE_ECHANTILLONS'
    if (filter === 'en_cours') return a.statut === 'ECHANTILLONS_RECUS' || a.statut === 'EN_COURS'
    if (filter === 'terminees') return a.statut === 'TERMINEE' || a.statut === 'RESULTATS_ENVOYES'
    return true
  })

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE_ECHANTILLONS': 'bg-amber-100 text-amber-800',
      'ECHANTILLONS_RECUS': 'bg-blue-100 text-blue-800',
      'EN_COURS': 'bg-purple-100 text-purple-800',
      'TERMINEE': 'bg-emerald-100 text-emerald-800',
      'RESULTATS_ENVOYES': 'bg-emerald-100 text-emerald-800',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Modals globaux */}
      <AlertModal
        isOpen={confirmDepotOpen}
        onClose={() => {
          if (!isConfirmDepotLoading) {
            setConfirmDepotOpen(false)
            setConfirmDepotTarget(null)
          }
        }}
        onConfirm={handleConfirmDepot}
        title="Confirmer la réception des échantillons ?"
        message={confirmDepotTarget ? `Confirmez-vous la réception des échantillons pour ${confirmDepotTarget.numero} ?` : ''}
        type="warning"
        confirmText="Oui, confirmer"
        cancelText="Annuler"
        isLoading={isConfirmDepotLoading}
      />

      <AlertModal
        isOpen={confirmStartOpen}
        onClose={() => {
          if (!isConfirmStartLoading) {
            setConfirmStartOpen(false)
            setConfirmStartTarget(null)
          }
        }}
        onConfirm={handleConfirmStart}
        title={confirmStartTarget ? `Démarrer l'analyse ${confirmStartTarget.numero} ?` : "Démarrer l'analyse ?"}
        message={confirmStartTarget ? `Cette action marquera l'analyse ${confirmStartTarget.numero} comme EN COURS.` : ''}
        type="warning"
        confirmText="Oui, démarrer"
        cancelText="Annuler"
        isLoading={isConfirmStartLoading}
      />

      <AlertModal
        isOpen={feedbackOpen}
        onClose={() => setFeedbackOpen(false)}
        onConfirm={() => setFeedbackOpen(false)}
        title={feedbackTitle || 'Information'}
        message={feedbackMessage || ''}
        type={feedbackType}
        confirmText="OK"
        cancelText="Fermer"
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Gestion des Analyses</h1>
        <p className="text-sm text-slate-600 mt-1">Gérer le workflow des demandes d'analyse</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En attente échantillons</div>
          <div className="text-2xl font-semibold text-amber-600">
            {analyses.filter(a => a.statut === 'EN_ATTENTE_ECHANTILLONS').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Échantillons reçus</div>
          <div className="text-2xl font-semibold text-blue-600">
            {analyses.filter(a => a.statut === 'ECHANTILLONS_RECUS').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En cours d'analyse</div>
          <div className="text-2xl font-semibold text-purple-600">
            {analyses.filter(a => a.statut === 'EN_COURS').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Terminées</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {analyses.filter(a => a.statut === 'TERMINEE' || a.statut === 'RESULTATS_ENVOYES').length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="lanema-card p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('toutes')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'toutes'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Toutes ({analyses.length})
          </button>
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_attente'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En attente ({analyses.filter(a => a.statut === 'EN_ATTENTE_ECHANTILLONS').length})
          </button>
          <button
            onClick={() => setFilter('en_cours')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_cours'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En cours ({analyses.filter(a => a.statut === 'ECHANTILLONS_RECUS' || a.statut === 'EN_COURS').length})
          </button>
          <button
            onClick={() => setFilter('terminees')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'terminees'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Terminées ({analyses.filter(a => a.statut === 'TERMINEE' || a.statut === 'RESULTATS_ENVOYES').length})
          </button>
        </div>
      </div>

      {/* Liste */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="lanema-card p-6 animate-pulse">
              <div className="h-6 w-48 bg-slate-200 rounded mb-4"></div>
              <div className="h-4 w-full bg-slate-200 rounded mb-2"></div>
              <div className="h-4 w-3/4 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : filteredAnalyses.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <p className="text-slate-600">Aucune analyse trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAnalyses.map((analyse) => (
            <div key={analyse.id} className="lanema-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{analyse.numero}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(analyse.statut)}`}>
                      {analyse.statut.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Demande devis: {analyse.demande_devis_numero || 'N/A'}</p>
                    <p>Date création: {new Date(analyse.date_creation).toLocaleDateString('fr-FR')}</p>
                    {analyse.date_depot_echantillons && (
                      <p>Date dépôt: {new Date(analyse.date_depot_echantillons).toLocaleDateString('fr-FR')}</p>
                    )}
                    {analyse.date_debut_analyse && (
                      <p>Début analyse: {new Date(analyse.date_debut_analyse).toLocaleDateString('fr-FR')}</p>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-slate-900">
                    Proforma: {analyse.proforma_acceptee_numero || 'N/A'}
                  </div>
                </div>
              </div>

              {/* Timeline */}
              <div className="my-4 p-4 bg-slate-50 rounded-lg">
                <div className="flex items-center gap-2 text-xs">
                  <div className={`flex items-center gap-1 ${analyse.statut === 'EN_ATTENTE_ECHANTILLONS' ? 'text-amber-600 font-semibold' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${analyse.statut === 'EN_ATTENTE_ECHANTILLONS' ? 'bg-amber-600' : 'bg-slate-400'}`}></div>
                    En attente
                  </div>
                  <div className={`flex-1 h-px ${['ECHANTILLONS_RECUS', 'EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-blue-600' : 'bg-slate-300'}`}></div>
                  <div className={`flex items-center gap-1 ${['ECHANTILLONS_RECUS', 'EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'text-blue-600 font-semibold' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${['ECHANTILLONS_RECUS', 'EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-blue-600' : 'bg-slate-400'}`}></div>
                    Reçus
                  </div>
                  <div className={`flex-1 h-px ${['EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-purple-600' : 'bg-slate-300'}`}></div>
                  <div className={`flex items-center gap-1 ${['EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'text-purple-600 font-semibold' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${['EN_COURS', 'TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-purple-600' : 'bg-slate-400'}`}></div>
                    En cours
                  </div>
                  <div className={`flex-1 h-px ${['TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-emerald-600' : 'bg-slate-300'}`}></div>
                  <div className={`flex items-center gap-1 ${['TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'text-emerald-600 font-semibold' : 'text-slate-400'}`}>
                    <div className={`w-2 h-2 rounded-full ${['TERMINEE', 'RESULTATS_ENVOYES'].includes(analyse.statut) ? 'bg-emerald-600' : 'bg-slate-400'}`}></div>
                    Terminée
                  </div>
                </div>
              </div>

              {/* Actions selon statut */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                {analyse.statut === 'EN_ATTENTE_ECHANTILLONS' && (
                  <button
                    onClick={() => openConfirmDepotModal(analyse)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition"
                  >
                    ✅ Confirmer réception échantillons
                  </button>
                )}
                {analyse.statut === 'ECHANTILLONS_RECUS' && (
                  <button
                    onClick={() => openConfirmStartModal(analyse)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-purple-600 rounded-lg hover:bg-purple-700 transition"
                  >
                    🔬 Démarrer l'analyse
                  </button>
                )}
                {analyse.statut === 'EN_COURS' && (
                  <button
                    onClick={() => openTerminerModal(analyse)}
                    className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                  >
                    ✓ Terminer l'analyse
                  </button>
                )}
                {(analyse.statut === 'TERMINEE' || analyse.statut === 'RESULTATS_ENVOYES') && (
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-emerald-600 font-medium">✓ Analyse terminée</span>
                    <button
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                      onClick={() => handleVoirResultats(analyse)}
                    >
                      📄 Voir résultats
                    </button>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal observations */}
      {showObservationsModal && selectedAnalyse && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Terminer l'analyse</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedAnalyse.numero}</p>
            </div>

            <form onSubmit={terminerAnalyse} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Observations finales
                </label>
                <textarea
                  value={observations}
                  onChange={(e) => setObservations(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500"
                  rows={5}
                  placeholder="Observations sur l'analyse effectuée..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowObservationsModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                >
                  Terminer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
