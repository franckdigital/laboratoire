import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Toast } from '../../../components/Toast'
import { Modal } from '../../../components/Modal'

export function ClientFacturesPage() {
  const [filter, setFilter] = useState<'toutes' | 'payees' | 'en_attente'>('toutes')
  const [factures, setFactures] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)

  const [paiementMode, setPaiementMode] = useState<Record<string, 'CHEQUE' | 'COMPTANT'>>({})
  const [paiementFile, setPaiementFile] = useState<Record<string, File | null>>({})
  const [paiementReference, setPaiementReference] = useState<Record<string, string>>({})
  const [isPaying, setIsPaying] = useState<Record<string, boolean>>({})
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'error' | 'info' } | null>(null)

  // Modal global d'enregistrement de paiement
  const [paymentModalOpen, setPaymentModalOpen] = useState(false)
  const [selectedFactureIds, setSelectedFactureIds] = useState<string[]>([])
  const [globalPaymentMode, setGlobalPaymentMode] = useState<'CHEQUE' | 'COMPTANT'>('CHEQUE')
  const [globalPaymentFile, setGlobalPaymentFile] = useState<File | null>(null)
  const [globalPaymentReference, setGlobalPaymentReference] = useState('')
  const [isSubmittingGlobalPayment, setIsSubmittingGlobalPayment] = useState(false)

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

  const telechargerFacture = async (factureId: string) => {
    try {
      await api.factures.telechargerPDF(factureId)
      setToast({
        message: 'Téléchargement du PDF en cours...',
        type: 'success',
      })
    } catch (error) {
      console.error('Erreur téléchargement facture:', error)
      setToast({
        message: 'Erreur lors du téléchargement de la facture',
        type: 'error',
      })
    }
  }

  const formatMontant = (montant: number) => {
    return new Intl.NumberFormat('fr-FR').format(montant) + ' XAF'
  }

  const statutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'EN_ATTENTE': 'bg-amber-100 text-amber-800',
      'PAYEE': 'bg-emerald-100 text-emerald-800',
      'RETARD': 'bg-rose-100 text-rose-800',
      'EN_ATTENTE_VALIDATION': 'bg-blue-100 text-blue-800',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  const getStatutLabel = (statut: string) => {
    const labels: Record<string, string> = {
      'EN_ATTENTE': 'En attente de paiement',
      'PAYEE': 'Payée',
      'RETARD': 'En retard',
      'EN_ATTENTE_VALIDATION': 'En attente de validation',
    }
    return labels[statut] || statut.replace(/_/g, ' ')
  }

  const filteredFactures = factures.filter(f => {
    if (filter === 'payees') return f.statut === 'PAYEE'
    if (filter === 'en_attente') return f.statut === 'EN_ATTENTE' || f.statut === 'RETARD' || f.statut === 'EN_ATTENTE_VALIDATION'
    return true
  })

  const totalDu = factures
    .filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD')
    .reduce((sum, f) => sum + f.montant_ttc, 0)

  return (
    <div className="space-y-6">
      <Modal
        isOpen={paymentModalOpen}
        onClose={() => {
          if (isSubmittingGlobalPayment) return
          setPaymentModalOpen(false)
        }}
        title="Enregistrer un paiement"
        maxWidth="lg"
      >
        <div className="space-y-4">
          <p className="text-sm text-slate-700">
            Sélectionnez les factures à régler, puis téléversez votre justificatif de paiement. Votre demande sera
            transmise au service comptabilité pour validation.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Mode de paiement</label>
              <select
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                value={globalPaymentMode}
                onChange={(e) => setGlobalPaymentMode(e.target.value as 'CHEQUE' | 'COMPTANT')}
              >
                <option value="CHEQUE">Chèque</option>
                <option value="COMPTANT">Comptant</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">
                Justificatif ({globalPaymentMode === 'CHEQUE' ? 'photo du chèque' : 'reçu de paiement'})
              </label>
              <input
                type="file"
                accept="image/*,application/pdf"
                onChange={(e) => {
                  const file = e.target.files?.[0] || null
                  setGlobalPaymentFile(file)
                }}
                className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-lanema-blue-50 file:text-lanema-blue-700 hover:file:bg-lanema-blue-100 cursor-pointer"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-600 mb-1">Référence de paiement (optionnelle)</label>
            <input
              type="text"
              value={globalPaymentReference}
              onChange={(e) => setGlobalPaymentReference(e.target.value)}
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
              placeholder="Ex: Réf virement, numéro de chèque..."
            />
          </div>

          <div>
            <div className="text-xs font-medium text-slate-600 mb-2">Factures à associer</div>
            <div className="max-h-60 overflow-y-auto border border-slate-200 rounded-lg divide-y divide-slate-100">
              {factures
                .filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD')
                .map(f => (
                  <label key={f.id} className="flex items-center justify-between px-3 py-2 text-sm">
                    <div className="flex items-center gap-2">
                      <input
                        type="checkbox"
                        className="rounded border-slate-300 text-lanema-blue-600 focus:ring-lanema-blue-500"
                        checked={selectedFactureIds.includes(f.id)}
                        onChange={(e) => {
                          const checked = e.target.checked
                          setSelectedFactureIds(prev =>
                            checked ? [...prev, f.id] : prev.filter(id => id !== f.id)
                          )
                        }}
                      />
                      <span className="font-medium text-slate-800">{f.numero}</span>
                    </div>
                    <span className="text-xs text-slate-600">{formatMontant(f.montant_ttc)}</span>
                  </label>
                ))}
              {factures.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD').length === 0 && (
                <div className="px-3 py-4 text-xs text-slate-500 text-center">
                  Vous n'avez actuellement aucune facture en attente de paiement.
                </div>
              )}
            </div>
          </div>

          <div className="pt-2 flex justify-end gap-2">
            <button
              type="button"
              className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
              disabled={isSubmittingGlobalPayment}
              onClick={() => setPaymentModalOpen(false)}
            >
              Annuler
            </button>
            <button
              type="button"
              className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={
                isSubmittingGlobalPayment ||
                !globalPaymentFile ||
                selectedFactureIds.length === 0
              }
              onClick={async () => {
                if (!globalPaymentFile || selectedFactureIds.length === 0) return
                try {
                  setIsSubmittingGlobalPayment(true)
                  for (const id of selectedFactureIds) {
                    await api.factures.pay(id, {
                      mode_paiement: globalPaymentMode,
                      justificatif: globalPaymentFile,
                      reference: globalPaymentReference,
                    })
                  }
                  await loadFactures()
                  setToast({
                    message: 'Votre justificatif de paiement a bien été envoyé et sera vérifié par la comptabilité.',
                    type: 'success',
                  })
                  setPaymentModalOpen(false)
                  setSelectedFactureIds([])
                  setGlobalPaymentFile(null)
                  setGlobalPaymentReference('')
                } catch (error) {
                  console.error('Erreur lors de l\'enregistrement du paiement global:', error)
                  setToast({
                    message: "Erreur lors de l'enregistrement du paiement. Veuillez réessayer.",
                    type: 'error',
                  })
                } finally {
                  setIsSubmittingGlobalPayment(false)
                }
              }}
            >
              {isSubmittingGlobalPayment ? 'Envoi en cours...' : 'Envoyer le paiement'}
            </button>
          </div>
        </div>
      </Modal>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Mes factures</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez vos factures et paiements</p>
        </div>
        <button
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition"
          onClick={() => setPaymentModalOpen(true)}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          Enregistrer un paiement
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-20 bg-slate-200 rounded"></div>
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
          <div className="text-xs text-slate-500 mb-1">Montant dû</div>
          <div className="text-xl font-semibold text-amber-600">{formatMontant(totalDu)}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Payées</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {factures.filter(f => f.statut === 'PAYEE').length}
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
            Toutes ({factures.length})
          </button>
          <button
            onClick={() => setFilter('en_attente')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_attente'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En attente ({factures.filter(f => f.statut === 'EN_ATTENTE' || f.statut === 'RETARD' || f.statut === 'EN_ATTENTE_VALIDATION').length})
          </button>
          <button
            onClick={() => setFilter('payees')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'payees'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Payées ({factures.filter(f => f.statut === 'PAYEE').length})
          </button>
        </div>
      </div>

      {/* Liste des factures */}
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
      ) : filteredFactures.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucune facture</h3>
          <p className="text-sm text-slate-600">Vous n'avez aucune facture dans cette catégorie</p>
        </div>
      ) : (
        <div className="space-y-4">
        {filteredFactures.map((facture) => (
          <div key={facture.id} id={`facture-${facture.id}`} className="lanema-card p-6 hover:shadow-md transition">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-lg bg-lanema-blue-50 flex items-center justify-center">
                  <svg className="w-6 h-6 text-lanema-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <div>
                  <div className="text-lg font-semibold text-slate-900 mb-1">{facture.numero}</div>
                  <div className="flex items-center gap-4 text-xs text-slate-500 mb-2">
                    <span>Émise le {facture.date_emission ? new Date(facture.date_emission).toLocaleDateString('fr-FR') : 'N/A'}</span>
                    <span>• Échéance: {facture.date_echeance ? new Date(facture.date_echeance).toLocaleDateString('fr-FR') : 'N/A'}</span>
                  </div>
                  {Array.isArray(facture.demandes) && facture.demandes.length > 0 && (
                    <div className="flex items-center gap-1.5 text-xs text-slate-600">
                      <span>Demandes:</span>
                      {facture.demandes.map((d: any, i: number) => (
                        <span key={i} className="px-2 py-0.5 rounded bg-slate-100 font-medium">
                          {typeof d === 'string' ? d : d.numero || d.id || 'Demande'}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
              <div className="text-right">
                <div className="text-xl font-semibold text-slate-900 mb-1">
                  {formatMontant(facture.montant_ttc)}
                </div>
                <div className="text-xs text-slate-500 mb-2">
                  HT: {formatMontant(facture.montant_ht)}
                </div>
                <span className={`inline-flex items-center px-3 py-1 text-xs font-medium rounded-full ${statutColor(facture.statut)}`}>
                  {getStatutLabel(facture.statut)}
                </span>
              </div>
            </div>

            {facture.date_paiement && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-100 mb-4">
                <div className="flex items-center gap-2 text-sm text-emerald-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Payée le {facture.date_paiement ? new Date(facture.date_paiement).toLocaleDateString('fr-FR') : 'N/A'}</span>
                </div>
              </div>
            )}

            {facture.statut === 'RETARD' && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-100 mb-4">
                <div className="flex items-center gap-2 text-sm text-rose-800">
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span className="font-medium">Paiement en retard - Échéance dépassée</span>
                </div>
              </div>
            )}

            <div className="flex items-center justify-between pt-4 border-t border-slate-100">
              <div className="flex-1 mr-4">
                {(facture.statut === 'EN_ATTENTE' || facture.statut === 'RETARD') ? (
                  <div className="space-y-3">
                    <div className="space-y-3 bg-amber-50 p-4 rounded-lg border border-amber-100">
                      <div className="flex items-start gap-2">
                        <svg className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                        </svg>
                        <div>
                          <div className="text-sm font-medium text-amber-800">Paiement en attente</div>
                          <p className="text-xs text-amber-700 mt-1">
                            Veuillez procéder au règlement de cette facture avant la date d'échéance.
                          </p>
                        </div>
                      </div>
                      <div className="text-sm font-medium text-slate-800">Règler cette facture</div>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 items-center">
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">Mode de paiement</label>
                          <select
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                            value={paiementMode[facture.id] || 'CHEQUE'}
                            onChange={(e) => setPaiementMode(prev => ({ ...prev, [facture.id]: e.target.value as 'CHEQUE' | 'COMPTANT' }))}
                          >
                            <option value="CHEQUE">Chèque</option>
                            <option value="COMPTANT">Comptant</option>
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-medium text-slate-600 mb-1">
                            Justificatif ({(paiementMode[facture.id] || 'CHEQUE') === 'CHEQUE' ? 'photo du chèque' : 'reçu de paiement'})
                          </label>
                          <input
                            type="file"
                            accept="image/*,application/pdf"
                            onChange={(e) => {
                              const file = e.target.files?.[0] || null
                              setPaiementFile(prev => ({ ...prev, [facture.id]: file }))
                            }}
                            className="block w-full text-xs text-slate-600 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-medium file:bg-lanema-blue-50 file:text-lanema-blue-700 hover:file:bg-lanema-blue-100 cursor-pointer"
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-xs font-medium text-slate-600 mb-1">Référence de paiement (optionnelle)</label>
                        <input
                          type="text"
                          value={paiementReference[facture.id] || ''}
                          onChange={(e) => setPaiementReference(prev => ({ ...prev, [facture.id]: e.target.value }))}
                          className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                          placeholder="Ex: Réf virement, numéro de chèque..."
                        />
                      </div>
                      <button
                        className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                        disabled={!paiementFile[facture.id] || isPaying[facture.id]}
                        onClick={async () => {
                          const file = paiementFile[facture.id]
                          const mode = paiementMode[facture.id] || 'CHEQUE'
                          if (!file) return
                          try {
                            setIsPaying(prev => ({ ...prev, [facture.id]: true }))
                            await api.factures.pay(facture.id, {
                              mode_paiement: mode,
                              justificatif: file,
                              reference: paiementReference[facture.id]
                            })
                            await loadFactures()
                            setToast({
                              message: 'Votre justificatif de paiement a bien été envoyé et sera vérifié par la comptabilité.',
                              type: 'success',
                            })
                          } catch (error) {
                            console.error('Erreur lors de l\'enregistrement du paiement:', error)
                            setToast({
                              message: "Erreur lors de l'enregistrement du paiement. Veuillez réessayer.",
                              type: 'error',
                            })
                          } finally {
                            setIsPaying(prev => ({ ...prev, [facture.id]: false }))
                          }
                        }}
                      >
                        {isPaying[facture.id] ? 'Envoi en cours...' : 'Envoyer le paiement'}
                      </button>
                    </div>
                  </div>
                ) : facture.statut === 'EN_ATTENTE_VALIDATION' ? (
                  <div className="p-3 rounded-lg bg-sky-50 border border-sky-100 text-xs text-sky-800">
                    Votre justificatif de paiement a été transmis. Il est en cours de validation par le service comptabilité.
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <button className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition">
                      Détails
                    </button>
                    <button 
                      onClick={() => telechargerFacture(facture.id)}
                      className="px-3 py-1.5 text-xs font-medium text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition flex items-center gap-1.5"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                      Télécharger PDF
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
        </div>
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
