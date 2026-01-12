import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { AlertModal } from '../../../components/AlertModal'

export function AdminProformasPage() {
  const [proformas, setProformas] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [filter, setFilter] = useState<'tous' | 'brouillon' | 'en_revision' | 'validee'>('brouillon')
  const [showAdjustModal, setShowAdjustModal] = useState(false)
  const [selectedProforma, setSelectedProforma] = useState<any>(null)
  const [showConfirmModal, setShowConfirmModal] = useState(false)
  const [proformaToValidate, setProformaToValidate] = useState<any>(null)
  const [isValidating, setIsValidating] = useState(false)
  const [ajustData, setAjustData] = useState({
    montant_ht: '',
    montant_tva: '',
    montant_ttc: '',
    notes_revision: ''
  })

  // Modal global de feedback (succès / erreur)
  const [alertOpen, setAlertOpen] = useState(false)
  const [alertTitle, setAlertTitle] = useState('')
  const [alertMessage, setAlertMessage] = useState('')
  const [alertType, setAlertType] = useState<'success' | 'warning' | 'danger' | 'info'>('info')

  useEffect(() => {
    loadProformas()
  }, [])

  const loadProformas = async () => {
    try {
      setIsLoading(true)
      const data = await api.proforma.list()
      setProformas(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement proformas:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const openConfirmModal = (proforma: any) => {
    setProformaToValidate(proforma)
    setShowConfirmModal(true)
  }

  const handleConfirmValidation = async () => {
    if (!proformaToValidate) return
    setIsValidating(true)

    try {
      await api.proforma.valider(proformaToValidate.id, "Proforma validée par l'administrateur")
      setShowConfirmModal(false)
      setProformaToValidate(null)
      loadProformas()
      setAlertTitle('Proforma validée')
      setAlertMessage('La proforma a été validée et sera visible dans l\'espace client.')
      setAlertType('success')
      setAlertOpen(true)
    } catch (error: any) {
      console.error('Erreur validation:', error)
      setAlertTitle('Erreur de validation')
      setAlertMessage(error.message || 'Erreur lors de la validation (vérifiez que l\'endpoint /valider/ existe côté backend).')
      setAlertType('danger')
      setAlertOpen(true)
    } finally {
      setIsValidating(false)
    }
  }

  const openAdjustModal = (proforma: any) => {
    setSelectedProforma(proforma)
    setAjustData({
      montant_ht: proforma.montant_ht,
      montant_tva: proforma.montant_tva,
      montant_ttc: proforma.montant_ttc,
      notes_revision: ''
    })
    setShowAdjustModal(true)
  }

  const parseAmount = (value: string) => {
    const n = parseFloat(String(value).replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }

  const formatAmount = (value: number) => {
    if (!Number.isFinite(value)) return ''
    return value.toFixed(2)
  }

  const handleChangeHT = (value: string) => {
    const ht = parseAmount(value)
    const tva = parseAmount(ajustData.montant_tva)
    const ttc = ht + tva
    setAjustData(prev => ({
      ...prev,
      montant_ht: value,
      montant_ttc: formatAmount(ttc),
    }))
  }

  const handleChangeTVA = (value: string) => {
    const ht = parseAmount(ajustData.montant_ht)
    const tva = parseAmount(value)
    const ttc = ht + tva
    setAjustData(prev => ({
      ...prev,
      montant_tva: value,
      montant_ttc: formatAmount(ttc),
    }))
  }

  const handleChangeTTC = (value: string) => {
    const ht = parseAmount(ajustData.montant_ht)
    const ttc = parseAmount(value)
    const tva = ttc - ht
    setAjustData(prev => ({
      ...prev,
      montant_ttc: value,
      montant_tva: formatAmount(tva),
    }))
  }

  const handleAdjustSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!selectedProforma) return

    try {
      await api.proforma.ajusterMontants(selectedProforma.id, {
        montant_ht: parseFloat(ajustData.montant_ht),
        montant_tva: parseFloat(ajustData.montant_tva),
        montant_ttc: parseFloat(ajustData.montant_ttc),
        notes_revision: ajustData.notes_revision
      })
      setShowAdjustModal(false)
      loadProformas()
      setAlertTitle('Montants ajustés')
      setAlertMessage('Les montants de la proforma ont été mis à jour avec succès.')
      setAlertType('success')
      setAlertOpen(true)
    } catch (error: any) {
      console.error('Erreur ajustement:', error)
      setAlertTitle('Erreur lors de l\'ajustement')
      setAlertMessage(error.message || 'Une erreur est survenue lors de l\'ajustement des montants.')
      setAlertType('danger')
      setAlertOpen(true)
    }
  }

  const filteredProformas = proformas.filter(p => {
    if (filter === 'brouillon') return p.statut === 'BROUILLON'
    if (filter === 'en_revision') return p.statut === 'EN_REVISION'
    if (filter === 'validee') return p.statut === 'VALIDEE'
    return true
  })

  const getStatutColor = (statut: string) => {
    const colors: Record<string, string> = {
      'BROUILLON': 'bg-slate-100 text-slate-800',
      'EN_REVISION': 'bg-amber-100 text-amber-800',
      'VALIDEE': 'bg-emerald-100 text-emerald-800',
      'ACCEPTEE': 'bg-blue-100 text-blue-800',
      'REFUSEE': 'bg-rose-100 text-rose-800',
      'EXPIREE': 'bg-slate-100 text-slate-500',
    }
    return colors[statut] || 'bg-slate-100 text-slate-600'
  }

  return (
    <div className="space-y-6">
      {/* Modal global de feedback */}
      <AlertModal
        isOpen={alertOpen}
        onClose={() => setAlertOpen(false)}
        onConfirm={() => setAlertOpen(false)}
        title={alertTitle || 'Information'}
        message={alertMessage || ''}
        type={alertType}
        confirmText="OK"
        cancelText="Fermer"
      />
      {/* Header */}
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Gestion des Proformas</h1>
        <p className="text-sm text-slate-600 mt-1">Valider et ajuster les proformas</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En attente</div>
          <div className="text-2xl font-semibold text-slate-900">
            {proformas.filter(p => p.statut === 'BROUILLON').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">En révision</div>
          <div className="text-2xl font-semibold text-amber-600">
            {proformas.filter(p => p.statut === 'EN_REVISION').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Validées</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {proformas.filter(p => p.statut === 'VALIDEE').length}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Acceptées</div>
          <div className="text-2xl font-semibold text-blue-600">
            {proformas.filter(p => p.statut === 'ACCEPTEE').length}
          </div>
        </div>
      </div>

      {/* Filtres */}
      <div className="lanema-card p-4">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setFilter('tous')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'tous'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Toutes ({proformas.length})
          </button>
          <button
            onClick={() => setFilter('brouillon')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'brouillon'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Brouillon ({proformas.filter(p => p.statut === 'BROUILLON').length})
          </button>
          <button
            onClick={() => setFilter('en_revision')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'en_revision'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            En révision ({proformas.filter(p => p.statut === 'EN_REVISION').length})
          </button>
          <button
            onClick={() => setFilter('validee')}
            className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
              filter === 'validee'
                ? 'bg-lanema-blue-50 text-lanema-blue-700'
                : 'text-slate-600 hover:bg-slate-50'
            }`}
          >
            Validées ({proformas.filter(p => p.statut === 'VALIDEE').length})
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
      ) : filteredProformas.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <p className="text-slate-600">Aucune proforma trouvée</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredProformas.map((proforma) => (
            <div key={proforma.id} className="lanema-card p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-lg font-semibold text-slate-900">{proforma.numero}</h3>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatutColor(proforma.statut)}`}>
                      {proforma.statut.replace('_', ' ')}
                    </span>
                  </div>
                  <div className="text-sm text-slate-600 space-y-1">
                    <p>Client: {proforma.client_raison_sociale || proforma.client}</p>
                    <p>Date émission: {proforma.date_emission ? new Date(proforma.date_emission).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                    <p>Date validité: {proforma.date_validite ? new Date(proforma.date_validite).toLocaleDateString('fr-FR') : 'Non définie'}</p>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-slate-900">
                    {Number(proforma.montant_ttc || 0).toLocaleString('fr-FR')} FCFA
                  </div>
                  <div className="text-xs text-slate-500 mt-1">
                    {(() => {
                      const ht = Number(proforma.montant_ht || 0)
                      const ttc = Number(proforma.montant_ttc || 0)
                      const tva = proforma.montant_tva != null ? Number(proforma.montant_tva) : ttc - ht
                      return `HT: ${ht.toLocaleString('fr-FR')} | TVA: ${tva.toLocaleString('fr-FR')}`
                    })()}
                  </div>
                </div>
              </div>

              {/* Actions selon statut */}
              <div className="flex items-center gap-2 pt-4 border-t border-slate-200">
                {(proforma.statut === 'BROUILLON' || proforma.statut === 'EN_REVISION') && (
                  <>
                    <button
                      onClick={() => openAdjustModal(proforma)}
                      className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                    >
                      ✏️ Ajuster montants
                    </button>
                    <button
                      onClick={() => openConfirmModal(proforma)}
                      className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 rounded-lg hover:bg-emerald-700 transition"
                    >
                      ✅ Valider
                    </button>
                  </>
                )}
                {proforma.statut === 'VALIDEE' && (
                  <span className="text-sm text-emerald-600 font-medium">
                    ✓ En attente d'acceptation client
                  </span>
                )}
                {proforma.statut === 'ACCEPTEE' && (
                  <span className="text-sm text-blue-600 font-medium">
                    ✓ Acceptée - Demande d'analyse créée
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modal de confirmation de validation */}
      {showConfirmModal && proformaToValidate && (
        <Modal
          isOpen={showConfirmModal}
          onClose={() => {
            if (!isValidating) {
              setShowConfirmModal(false)
              setProformaToValidate(null)
            }
          }}
          title="Valider la proforma"
          maxWidth="md"
        >
          <div className="space-y-4">
            <p className="text-sm text-slate-700">
              Vous êtes sur le point de <span className="font-semibold">valider</span> la proforma
              <span className="font-semibold"> {proformaToValidate.numero}</span> pour le client
              <span className="font-semibold"> {proformaToValidate.client_raison_sociale || proformaToValidate.client}</span>.
            </p>
            <p className="text-sm text-slate-600">
              Une fois validée, elle sera disponible pour le client dans son espace pour acceptation.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => {
                  if (!isValidating) {
                    setShowConfirmModal(false)
                    setProformaToValidate(null)
                  }
                }}
                className="px-4 py-2 text-sm font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                disabled={isValidating}
              >
                Annuler
              </button>
              <button
                type="button"
                onClick={handleConfirmValidation}
                className="px-4 py-2 text-sm font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition disabled:opacity-60"
                disabled={isValidating}
              >
                {isValidating ? 'Validation en cours...' : 'Confirmer la validation'}
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Modal d'ajustement */}
      {showAdjustModal && selectedProforma && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-md w-full">
            <div className="p-6 border-b border-slate-200">
              <h2 className="text-xl font-semibold text-slate-900">Ajuster les montants</h2>
              <p className="text-sm text-slate-600 mt-1">{selectedProforma.numero}</p>
            </div>

            <form onSubmit={handleAdjustSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Montant HT (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ajustData.montant_ht}
                  onChange={(e) => handleChangeHT(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Montant TVA (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ajustData.montant_tva}
                  onChange={(e) => handleChangeTVA(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Montant TTC (FCFA)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={ajustData.montant_ttc}
                  onChange={(e) => handleChangeTTC(e.target.value)}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Notes de révision
                </label>
                <textarea
                  value={ajustData.notes_revision}
                  onChange={(e) => setAjustData({ ...ajustData, notes_revision: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500"
                  rows={3}
                  placeholder="Raison de l'ajustement..."
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => setShowAdjustModal(false)}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-lanema-blue-600 rounded-lg hover:bg-lanema-blue-700 transition"
                >
                  Enregistrer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  )
}
