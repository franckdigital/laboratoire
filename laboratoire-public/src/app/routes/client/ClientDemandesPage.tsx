import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import api from '../../../services/api'
import { AlertModal } from '../../../components/AlertModal'
import { Modal } from '../../../components/Modal'

export function ClientDemandesPage() {
  const navigate = useNavigate()
  const [filter, setFilter] = useState<'toutes' | 'en_cours' | 'terminees'>('toutes')
  const [demandes, setDemandes] = useState<any[]>([])
  const [proformas, setProformas] = useState<any[]>([])
  const [demandesAnalyses, setDemandesAnalyses] = useState<any[]>([])
  const [filterAnalyses, setFilterAnalyses] = useState('tous')
  const [isLoading, setIsLoading] = useState(true)
  const [expandedDemandeId, setExpandedDemandeId] = useState<string | null>(null)

  // Modals pour actions sur proforma
  const [confirmModalOpen, setConfirmModalOpen] = useState(false)
  const [confirmModalType, setConfirmModalType] = useState<'accept' | 'refuse'>('accept')
  const [confirmTargetId, setConfirmTargetId] = useState<string | null>(null)
  const [isConfirmLoading, setIsConfirmLoading] = useState(false)

  // Modal d'erreur pour téléchargement PDF
  const [pdfErrorModalOpen, setPdfErrorModalOpen] = useState(false)
  const [pdfErrorMessage, setPdfErrorMessage] = useState('')

  // Modal d'information pour les résultats / paiement
  const [infoModalOpen, setInfoModalOpen] = useState(false)
  const [infoModalTitle, setInfoModalTitle] = useState('')
  const [infoModalMessage, setInfoModalMessage] = useState('')

  useEffect(() => {
    loadDemandes()
    loadProformas()
    loadDemandesAnalyses()
  }, [])

  const loadDemandes = async () => {
    try {
      setIsLoading(true)
      const data = await api.devis.mesDemandes()
      setDemandes(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement demandes:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleDownloadDevis = async (demande: any) => {
    if (!demande.devis_pdf) {
      return
    }
    try {
      const token = localStorage.getItem('lanema_token')
      const headers: HeadersInit = {}
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }

      const response = await fetch(demande.devis_pdf, {
        method: 'GET',
        headers,
      })

      if (!response.ok) {
        const errText = await response.text().catch(() => '')
        throw new Error(errText || 'Erreur lors du téléchargement du devis')
      }

      const blob = await response.blob()
      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = demande.numero ? `Devis_${demande.numero}.pdf` : 'Devis.pdf'
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error: any) {
      console.error('Erreur téléchargement devis:', error)
      const message = error?.message || 'Erreur lors du téléchargement du devis'
      setPdfErrorMessage(message)
      setPdfErrorModalOpen(true)
    }
  }

  const handleDownloadResults = async (demandeAnalyse: any) => {
    try {
      await api.demandeAnalyse.telechargerRapport(demandeAnalyse.id)
    } catch (error: any) {
      console.error('Erreur téléchargement rapport résultats:', error)
      setInfoModalTitle('Erreur lors du téléchargement des résultats')
      setInfoModalMessage(
        (error && error.message) ||
        "Une erreur est survenue lors du téléchargement du rapport de résultats. Veuillez réessayer ou contacter le laboratoire."
      )
      setInfoModalOpen(true)
    }
  }

  const handleGoToPayment = (demandeAnalyse: any) => {
    // Rediriger vers la page factures de l'espace client
    navigate('/client/factures')
  }

  const loadProformas = async () => {
    try {
      const data = await api.proforma.list()
      setProformas(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement proformas:', error)
    }
  }

  const loadDemandesAnalyses = async () => {
    try {
      const data = await api.demandeAnalyse.list()
      setDemandesAnalyses(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement demandes analyses:', error)
    }
  }

  const normalizeId = (value: any) => {
    if (value == null) return ''
    if (typeof value === 'object') return value.id != null ? String(value.id) : ''
    return String(value)
  }

  const getProformaForDemande = (demandeId: string) => {
    const id = normalizeId(demandeId)
    return proformas.find((p) => normalizeId(p.demande_devis) === id)
  }

  const getDemandeAnalyseForDemande = (demandeId: string) => {
    const id = normalizeId(demandeId)
    return demandesAnalyses.find((da) => normalizeId(da.demande_devis) === id)
  }

  const getWorkflow = (demande: any) => {
    const proforma = getProformaForDemande(demande.id)
    const demandeAnalyse = getDemandeAnalyseForDemande(demande.id)

    // 1) DemandeAnalyse = source de vérité si elle existe
    if (demandeAnalyse) {
      const statut = demandeAnalyse.statut
      const isDone = statut === 'TERMINEE' || statut === 'RESULTATS_ENVOYES'
      const isRunning = statut === 'EN_COURS' || statut === 'ECHANTILLONS_RECUS'
      const isWaiting = statut === 'EN_ATTENTE_ECHANTILLONS'

      return {
        proforma,
        demandeAnalyse,
        bucket: isDone ? 'terminees' : 'en_cours',
        badge: isDone ? 'Terminée' : isRunning ? 'En cours' : 'En attente',
        badgeKey: isDone ? 'ACCEPTEE' : isRunning ? 'EN_COURS' : 'EN_ATTENTE',
        progress: isDone ? 100 : isRunning ? 60 : isWaiting ? 40 : 40,
      }
    }

    // 2) Sinon, la proforma pilote l'état
    if (proforma) {
      if (proforma.statut === 'REFUSEE') {
        return {
          proforma,
          demandeAnalyse: null,
          bucket: 'toutes',
          badge: 'Refusée',
          badgeKey: 'REFUSEE',
          progress: 0,
        }
      }

      if (proforma.statut === 'ACCEPTEE') {
        return {
          proforma,
          demandeAnalyse: null,
          bucket: 'en_cours',
          badge: 'Acceptée',
          badgeKey: 'ACCEPTEE',
          progress: 50,
        }
      }

      if (proforma.statut === 'VALIDEE') {
        return {
          proforma,
          demandeAnalyse: null,
          bucket: 'en_cours',
          badge: 'À valider',
          badgeKey: 'EN_COURS',
          progress: 25,
        }
      }

      // BROUILLON / ENVOYEE / autres
      return {
        proforma,
        demandeAnalyse: null,
        bucket: 'toutes',
        badge: 'En attente',
        badgeKey: 'EN_ATTENTE',
        progress: 10,
      }
    }

    // 3) Fallback sur DemandeDevis
    const statut = demande?.statut
    if (statut === 'ACCEPTEE') {
      return { proforma: null, demandeAnalyse: null, bucket: 'terminees', badge: 'Acceptée', badgeKey: 'ACCEPTEE', progress: 100 }
    }
    if (statut === 'EN_COURS') {
      return { proforma: null, demandeAnalyse: null, bucket: 'en_cours', badge: 'En cours', badgeKey: 'EN_COURS', progress: 50 }
    }
    if (statut === 'REFUSEE') {
      return { proforma: null, demandeAnalyse: null, bucket: 'toutes', badge: 'Refusée', badgeKey: 'REFUSEE', progress: 0 }
    }
    return { proforma: null, demandeAnalyse: null, bucket: 'toutes', badge: 'En attente', badgeKey: 'EN_ATTENTE', progress: 0 }
  }

  const telechargerProforma = async (proformaId: string) => {
    try {
      await api.proforma.telechargerPDF(proformaId)
    } catch (error: any) {
      console.error('Erreur téléchargement PDF:', error)
      const message = error.message || 'Erreur lors du téléchargement du PDF'
      setPdfErrorMessage(message)
      setPdfErrorModalOpen(true)
    }
  }

  const accepterProforma = async (proformaId: string) => {
    setConfirmTargetId(proformaId)
    setConfirmModalType('accept')
    setConfirmModalOpen(true)
  }

  const refuserProforma = async (proformaId: string) => {
    setConfirmTargetId(proformaId)
    setConfirmModalType('refuse')
    setConfirmModalOpen(true)
  }

  const statutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE': 'bg-slate-100 text-slate-700',
      'EN_COURS': 'bg-lanema-blue-50 text-lanema-blue-700',
      'ACCEPTEE': 'bg-emerald-50 text-emerald-700',
      'REFUSEE': 'bg-rose-50 text-rose-700',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const prioriteColor = (priorite: string) => {
    const colors: Record<string, string> = {
      'URGENTE': 'bg-rose-100 text-rose-800 border-rose-200',
      'HAUTE': 'bg-amber-100 text-amber-800 border-amber-200',
      'NORMALE': 'bg-slate-100 text-slate-700 border-slate-200',
      'BASSE': 'bg-slate-50 text-slate-500 border-slate-100',
    }
    return colors[priorite] || 'bg-slate-100 text-slate-600 border-slate-200'
  }

  const filteredDemandes = demandes.filter(d => {
    const wf = getWorkflow(d)
    if (filter === 'en_cours') return wf.bucket === 'en_cours'
    if (filter === 'terminees') return wf.bucket === 'terminees'
    return true
  })

  // Calculer l'avancement en fonction du statut
  const getAvancement = (statut: string) => {
    const map: Record<string, number> = {
      'EN_ATTENTE': 0,
      'EN_COURS': 50,
      'ACCEPTEE': 100,
      'REFUSEE': 0,
    }
    return map[statut] || 0
  }

  const getAvancementFromWorkflow = (demande: any) => {
    const wf = getWorkflow(demande)
    return wf.progress
  }

  const countWorkflow = (bucket: 'en_cours' | 'terminees') => {
    return demandes.filter((d) => getWorkflow(d).bucket === bucket).length
  }

  const handleConfirmAction = async () => {
    if (!confirmTargetId) return
    setIsConfirmLoading(true)

    try {
      if (confirmModalType === 'accept') {
        await api.proforma.accepter(confirmTargetId)
        await Promise.all([loadDemandes(), loadProformas(), loadDemandesAnalyses()])
      } else {
        await api.proforma.refuser(confirmTargetId)
        await Promise.all([loadDemandes(), loadProformas()])
      }
      setConfirmModalOpen(false)
      setConfirmTargetId(null)
    } catch (error) {
      console.error('Erreur action proforma:', error)
    } finally {
      setIsConfirmLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {/* Modals globaux */}
      <AlertModal
        isOpen={confirmModalOpen}
        onClose={() => {
          if (!isConfirmLoading) {
            setConfirmModalOpen(false)
            setConfirmTargetId(null)
          }
        }}
        onConfirm={handleConfirmAction}
        title={confirmModalType === 'accept' ? 'Accepter ce devis ?' : 'Refuser ce devis ?'}
        message={
          confirmModalType === 'accept'
            ? "Une demande d'analyse sera créée pour lancer la PHASE 2 (analyses)."
            : 'Cette action est irréversible. Le devis sera marqué comme refusé.'
        }
        type={confirmModalType === 'accept' ? 'success' : 'danger'}
        confirmText={confirmModalType === 'accept' ? 'Oui, accepter' : 'Oui, refuser'}
        cancelText="Annuler"
        isLoading={isConfirmLoading}
      />

      <Modal
        isOpen={pdfErrorModalOpen}
        onClose={() => setPdfErrorModalOpen(false)}
        title="Erreur lors du téléchargement du PDF"
        maxWidth="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700">
            Le fichier PDF n'a pas pu être téléchargé. Merci de réessayer dans quelques instants. Si le
            problème persiste, contactez le support LANEMA.
          </p>
          {pdfErrorMessage && (
            <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-800 whitespace-pre-line">
              {pdfErrorMessage}
            </div>
          )}
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setPdfErrorModalOpen(false)}
              className="px-4 py-2 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>

      <Modal
        isOpen={infoModalOpen}
        onClose={() => setInfoModalOpen(false)}
        title={infoModalTitle || 'Information'}
        maxWidth="md"
      >
        <div className="space-y-3">
          <p className="text-sm text-slate-700 whitespace-pre-line">
            {infoModalMessage}
          </p>
          <div className="pt-2 flex justify-end">
            <button
              type="button"
              onClick={() => setInfoModalOpen(false)}
              className="px-4 py-2 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white text-sm font-semibold rounded-lg transition"
            >
              Fermer
            </button>
          </div>
        </div>
      </Modal>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes demandes d'analyse</h1>
          <p className="text-sm text-slate-600 mt-1">Suivez l'état de vos demandes en temps réel</p>
        </div>
        <button 
          onClick={() => navigate('/client/demande-devis')}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvelle demande
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Total demandes</div>
          <div className="text-2xl font-semibold text-slate-900">{demandes.length}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En cours</div>
          <div className="text-2xl font-semibold text-lanema-blue-600">
            {countWorkflow('en_cours')}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Terminées</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {countWorkflow('terminees')}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Échantillons</div>
          <div className="text-2xl font-semibold text-slate-900">
            {demandes.reduce((sum, d) => sum + (d.echantillons?.length || 0), 0)}
          </div>
        </div>
      </div>

      {/* Filters */}
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
            Toutes ({demandes.length})
          </button>
          <button
            onClick={() => setFilter('en_cours')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_cours'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En cours ({countWorkflow('en_cours')})
          </button>
          <button
            onClick={() => setFilter('terminees')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'terminees'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Terminées ({countWorkflow('terminees')})
          </button>
        </div>
      </div>

      {/* Liste des demandes */}
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
      ) : filteredDemandes.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="text-slate-400 mb-2">
            <svg className="w-16 h-16 mx-auto" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <p className="text-slate-600 font-medium">Aucune demande trouvée</p>
          <p className="text-sm text-slate-500 mt-1">Commencez par créer une nouvelle demande de devis</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredDemandes.map((demande) => {
            const wf = getWorkflow(demande)
            const proforma = wf.proforma
            const demandeAnalyse = wf.demandeAnalyse
            const progress = getAvancementFromWorkflow(demande)
            const isExpanded = expandedDemandeId === demande.id

            return (
          <div key={demande.id} className="lanema-card p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                </div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-lg font-semibold text-slate-900">{demande.numero}</span>
                    <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full border ${prioriteColor(demande.priorite)}`}>
                      {demande.priorite}
                    </span>
                  </div>
                  <div className="text-sm text-slate-700 mb-2">{demande.type_analyse} - {demande.categorie}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <span>📅 Demandé le {new Date(demande.created_at).toLocaleDateString('fr-FR')}</span>
                    {demande.date_souhaitee && <span>• 🎯 Échéance: {new Date(demande.date_souhaitee).toLocaleDateString('fr-FR')}</span>}
                    <span>• 🧪 {demande.echantillons?.length || 0} échantillon{(demande.echantillons?.length || 0) > 1 ? 's' : ''}</span>
                  </div>
                </div>
              </div>
              <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statutColor(wf.badgeKey)}`}>
                {wf.badge}
              </span>
            </div>

            {/* Barre de progression */}
            <div className="mb-4">
              <div className="flex items-center justify-between text-xs mb-2">
                <span className="text-slate-600 font-medium">Avancement</span>
                <span className="text-slate-900 font-semibold">{progress}%</span>
              </div>
              <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className={`h-full ${progress === 100 ? 'bg-emerald-500' : 'bg-lanema-blue-500'} rounded-full transition-all`}
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Proforma & Demande d'Analyse */}
            {(() => {
              if (!proforma) return null

              // BROUILLON - PHASE 1: Devis estimatif disponible
              if (proforma.statut === 'BROUILLON' || proforma.statut === 'EN_REVISION') {
                return (
                  <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                    <div className="mb-2">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full mb-2">
                        PHASE 1 - PRÉ-ENGAGEMENT
                      </div>
                      <p className="text-xs font-medium text-blue-900 mb-1">
                        📄 Devis estimatif généré automatiquement
                      </p>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-blue-900 mb-1">
                          {Number(proforma.montant_ttc).toLocaleString('fr-FR')} FCFA
                        </p>
                        <div className="p-2 bg-amber-50 border border-amber-200 rounded-lg mt-2">
                          <p className="text-xs text-amber-900 font-medium">
                            ⚠️ Ceci est un devis estimatif. Le prix final peut être ajusté après révision par notre équipe.
                          </p>
                        </div>
                        <p className="text-xs text-blue-700 mt-2">
                          ⏳ En attente de validation par notre équipe...
                        </p>
                      </div>
                      <button 
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-lanema-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-lanema-blue-700 transition shadow-md ml-4"
                        onClick={() => telechargerProforma(proforma.id)}
                      >
                        📥 Télécharger l'estimatif
                      </button>
                    </div>
                  </div>
                )
              }

              // VALIDEE - PHASE 1: Devis validé, en attente décision client
              if (proforma.statut === 'VALIDEE') {
                return (
                  <div className="mt-4 p-4 bg-emerald-50 rounded-lg border border-emerald-200">
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-emerald-100 text-emerald-700 text-xs font-semibold rounded-full mb-2">
                        PHASE 1 - DÉCISION CLIENT
                      </div>
                      <p className="text-xs font-medium text-emerald-900 mb-1">
                        ✅ Devis validé par notre équipe - N° {proforma.numero}
                      </p>
                    </div>
                    <div className="flex items-center gap-4 mb-3">
                      <div className="flex-1">
                        <p className="text-2xl font-bold text-emerald-600">
                          {Number(proforma.montant_ttc).toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="text-xs text-emerald-700 mt-1">
                          HT: {Number(proforma.montant_ht).toLocaleString('fr-FR')} | TVA: {Number(proforma.montant_tva).toLocaleString('fr-FR')} FCFA
                        </p>
                        <p className="text-xs text-emerald-600 mt-1 font-medium">
                          ⏰ Valide jusqu'au {new Date(proforma.date_validite).toLocaleDateString('fr-FR')}
                        </p>
                      </div>
                    </div>
                    <div className="p-3 bg-white rounded-lg border border-emerald-300 mb-3">
                      <p className="text-xs text-slate-700 font-medium mb-1">💡 Prochaine étape:</p>
                      <p className="text-xs text-slate-600">
                        Acceptez ce devis pour passer à la <strong>PHASE 2</strong> (dépôt d'échantillons et analyses).
                      </p>
                    </div>
                    <div className="flex items-center gap-2">
                      <button 
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 text-white text-sm font-semibold rounded-lg hover:bg-emerald-700 transition shadow-md"
                        onClick={() => accepterProforma(proforma.id)}
                      >
                        ✅ Accepter ce devis
                      </button>
                      <button 
                        className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-white text-slate-700 text-sm font-medium rounded-lg hover:bg-slate-50 border border-slate-300 transition"
                        onClick={() => telechargerProforma(proforma.id)}
                      >
                        📥 Télécharger PDF
                      </button>
                      <button 
                        className="px-4 py-2.5 bg-white text-rose-600 text-sm font-medium rounded-lg hover:bg-rose-50 border border-rose-200 transition"
                        onClick={() => refuserProforma(proforma.id)}
                      >
                        ❌ Refuser
                      </button>
                    </div>
                  </div>
                )
              }

              // ACCEPTEE + Demande d'Analyse - PHASE 2: ENGAGEMENT
              if (proforma.statut === 'ACCEPTEE' && demandeAnalyse) {
                const statutColors: Record<string, string> = {
                  'EN_ATTENTE_ECHANTILLONS': 'bg-amber-50 border-amber-200',
                  'ECHANTILLONS_RECUS': 'bg-blue-50 border-blue-200',
                  'EN_COURS': 'bg-purple-50 border-purple-200',
                  'TERMINEE': 'bg-emerald-50 border-emerald-200',
                  'RESULTATS_ENVOYES': 'bg-emerald-50 border-emerald-200',
                }
                
                const statutLabels: Record<string, string> = {
                  'EN_ATTENTE_ECHANTILLONS': '📦 En attente dépôt échantillons',
                  'ECHANTILLONS_RECUS': '✅ Échantillons reçus',
                  'EN_COURS': '🔬 Analyses en cours',
                  'TERMINEE': '✓ Analyses terminées',
                  'RESULTATS_ENVOYES': '✓ Résultats disponibles',
                }
                
                return (
                  <div className={`mt-4 p-4 rounded-lg border ${statutColors[demandeAnalyse.statut] || 'bg-slate-50 border-slate-200'}`}>
                    <div className="mb-3">
                      <div className="inline-flex items-center gap-2 px-2.5 py-1 bg-purple-100 text-purple-700 text-xs font-semibold rounded-full mb-2">
                        PHASE 2 - ENGAGEMENT
                      </div>
                      <p className="text-xs font-medium text-slate-700 mb-1">
                        📋 Demande d'Analyse - {demandeAnalyse.numero}
                      </p>
                      <p className="text-sm font-semibold text-slate-900 mb-1">
                        {statutLabels[demandeAnalyse.statut] || demandeAnalyse.statut}
                      </p>
                      <p className="text-lg font-bold text-slate-900">
                        {Number(demandeAnalyse.montant_ttc).toLocaleString('fr-FR')} FCFA
                      </p>
                    </div>
                    
                    {demandeAnalyse.statut === 'EN_ATTENTE_ECHANTILLONS' && (
                      <div className="p-4 bg-amber-100 rounded-lg mt-3 border border-amber-300">
                        <p className="text-sm font-semibold text-amber-900 mb-2">📍 ÉTAPE 6 - Dépôt d'échantillons</p>
                        <p className="text-xs text-amber-800 mb-3">
                          Votre devis a été accepté ! Veuillez maintenant déposer vos échantillons physiques au laboratoire:
                        </p>
                        <div className="bg-white rounded-lg p-3 border border-amber-200">
                          <p className="text-sm font-bold text-amber-900">🏢 LANEMA</p>
                          <p className="text-xs text-amber-800">📍 Route Abobo-Adjamé, Abidjan</p>
                          <p className="text-xs text-amber-800">📞 Tél: +225 27 21 27 86 90</p>
                          <div className="mt-2 p-2 bg-amber-50 rounded border border-amber-300">
                            <p className="text-xs text-amber-700">
                              <span className="font-semibold">🔖 Référence à mentionner:</span>
                            </p>
                            <p className="text-sm font-bold text-amber-900">{demandeAnalyse.numero}</p>
                          </div>
                        </div>
                      </div>
                    )}
                    
                    {demandeAnalyse.statut === 'ECHANTILLONS_RECUS' && (
                      <div className="p-4 bg-blue-100 rounded-lg mt-3 border border-blue-300">
                        <p className="text-sm font-semibold text-blue-900 mb-2">✅ ÉTAPE 7 - Échantillons reçus</p>
                        <p className="text-xs text-blue-800">
                          Vos échantillons ont été réceptionnés avec succès. Nos techniciens vont démarrer les analyses sous peu.
                        </p>
                      </div>
                    )}
                    
                    {demandeAnalyse.statut === 'EN_COURS' && (
                      <div className="p-4 bg-purple-100 rounded-lg mt-3 border border-purple-300">
                        <p className="text-sm font-semibold text-purple-900 mb-2">🔬 ÉTAPE 7 - Analyses en cours</p>
                        <p className="text-xs text-purple-800">
                          Nos techniciens effectuent actuellement les analyses de vos échantillons. Vous serez notifié dès que les résultats seront disponibles.
                        </p>
                      </div>
                    )}
                    
                    {(demandeAnalyse.statut === 'TERMINEE' || demandeAnalyse.statut === 'RESULTATS_ENVOYES') && (
                      <div className="mt-3">
                        <div className="p-4 bg-emerald-100 rounded-lg border border-emerald-300 mb-3">
                          <p className="text-sm font-semibold text-emerald-900 mb-2">✅ ÉTAPE 8 - Résultats disponibles</p>
                          <p className="text-xs text-emerald-800 mb-2">
                            Les analyses sont terminées ! Vous pouvez maintenant consulter l'état de vos résultats.
                          </p>
                          <p className="text-xs text-emerald-700">
                            💳 Le téléchargement des résultats sera disponible une fois le paiement de la facture associé effectué (ÉTAPE 9).
                          </p>
                        </div>
                        {(() => {
                          const paiementEffectue = demandeAnalyse.paiement_effectue
                          return (
                        <div className="flex items-center gap-2">
                          <button 
                            className={`flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-semibold rounded-lg transition shadow-md ${
                              paiementEffectue
                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                                : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                            }`}
                            disabled={!paiementEffectue}
                            onClick={() => {
                              if (!paiementEffectue) return
                              handleDownloadResults(demandeAnalyse)
                            }}
                          >
                            📄 Télécharger les résultats
                          </button>
                          <button 
                            className="px-4 py-2.5 bg-white text-emerald-700 text-sm font-medium rounded-lg hover:bg-emerald-50 border border-emerald-300 transition"
                            onClick={() => handleGoToPayment(demandeAnalyse)}
                          >
                            💳 Paiement
                          </button>
                        </div>
                          )
                        })()}
                      </div>
                    )}
                  </div>
                )
              }

              // REFUSEE
              if (proforma.statut === 'REFUSEE') {
                return (
                  <div className="mt-4 p-4 bg-rose-50 rounded-lg border border-rose-200">
                    <p className="text-sm text-rose-800">❌ Devis refusé</p>
                  </div>
                )
              }

              return null
            })()}

            {/* Actions */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex items-center gap-2">
                {wf.badgeKey === 'ACCEPTEE' && (
                  <span className="text-xs font-medium text-emerald-600">✓ Devis disponible</span>
                )}
                {wf.badgeKey === 'EN_COURS' && (
                  <span className="text-xs font-medium text-lanema-blue-600">🔄 Traitement en cours</span>
                )}
                {wf.badgeKey === 'EN_ATTENTE' && (
                  <span className="text-xs font-medium text-slate-600">⏳ En attente de traitement</span>
                )}
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setExpandedDemandeId((prev) => (prev === demande.id ? null : demande.id))}
                  className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                >
                  Détails
                </button>
                {proforma?.statut === 'VALIDEE' && (
                  <>
                    <button 
                      type="button"
                      onClick={() => accepterProforma(proforma.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition"
                    >
                      Accepter
                    </button>
                    <button 
                      type="button"
                      onClick={() => refuserProforma(proforma.id)}
                      className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-100 hover:bg-rose-200 rounded-lg transition"
                    >
                      Refuser
                    </button>
                  </>
                )}
                {demande.devis_pdf && (
                  <button
                    type="button"
                    onClick={() => handleDownloadDevis(demande)}
                    className="px-3 py-1.5 text-xs font-medium text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    Télécharger devis
                  </button>
                )}
              </div>
            </div>

            {isExpanded && (
              <div className="mt-4 p-4 rounded-lg bg-slate-50 border border-slate-200 text-xs text-slate-700">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">Proforma</div>
                    <div>Numéro: {proforma?.numero || '-'}</div>
                    <div>Statut: {proforma?.statut || '-'}</div>
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 mb-1">Demande d'analyse</div>
                    <div>Numéro: {demandeAnalyse?.numero || '-'}</div>
                    <div>Statut: {demandeAnalyse?.statut || '-'}</div>
                  </div>
                </div>
              </div>
            )}
          </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
