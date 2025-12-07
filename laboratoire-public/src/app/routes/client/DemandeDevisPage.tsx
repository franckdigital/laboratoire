import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'
import api from '../../../services/api'

interface EchantillonForm {
  id: string
  designation: string
  quantite: string | number
  unite: string
  description: string
}

export function DemandeDevisPage() {
  const { user } = useAuth()
  const [step, setStep] = useState(1)
  const [formData, setFormData] = useState({
    type_analyse: '',
    categorie: '',
    priorite: 'NORMALE',
    date_souhaitee: '',
    description: '',
    documents: [] as File[],
  })

  const [echantillons, setEchantillons] = useState<EchantillonForm[]>([
    { id: '1', designation: '', quantite: 1, unite: 'unité', description: '' }
  ])

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [success, setSuccess] = useState(false)
  const [proformaId, setProformaId] = useState<string | null>(null)
  const [isLoadingProforma, setIsLoadingProforma] = useState(false)

  const typesAnalyse = [
    { value: 'MICROBIOLOGIE_PARASITOLOGIE', label: 'Microbiologie et parasitologie', icon: '🦠' },
    { value: 'CHIMIE_ALIMENTAIRE_INDUSTRIELLE', label: 'Chimie alimentaire et industrielle', icon: '🧪' },
    { value: 'EAUX_CONSOMMATION', label: 'Eaux de consommation / Eaux potables', icon: '💧' },
    { value: 'SOLS_ENGRAIS', label: 'Sols et engrais', icon: '🌱' },
    { value: 'METROLOGIE', label: 'Analyses de métrologie', icon: '📏' },
    { value: 'ETALONNAGE_INSTRUMENTS', label: 'Étalonnage et vérification d\'instruments', icon: '⚙️' },
    { value: 'ETALONNAGE_VERRERIE', label: 'Étalonnage de verrerie de laboratoire', icon: '🧫' },
  ]

  // Catégories organisées par type d'analyse
  const getCategoriesByType = (type: string) => {
    const categoriesMap: Record<string, string[]> = {
      'MICROBIOLOGIE_PARASITOLOGIE': [
        'Analyses microbiologiques des eaux',
        'Analyses microbiologiques des aliments',
        'Recherche de parasites',
        'Contrôle de stérilité',
        'Autres analyses microbiologiques'
      ],
      'CHIMIE_ALIMENTAIRE_INDUSTRIELLE': [
        'Analyses physico-chimiques des eaux',
        'Analyses chimiques des aliments',
        'Analyses de produits industriels',
        'Contrôle qualité produits',
        'Autres analyses chimiques'
      ],
      'EAUX_CONSOMMATION': [
        'Eau potable du robinet',
        'Eau de puits',
        'Eau de forage',
        'Eau minérale',
        'Eau de source'
      ],
      'SOLS_ENGRAIS': [
        'Analyse de sol agricole',
        'Analyse de compost',
        'Analyse d\'engrais',
        'Analyse de substrats',
        'Autres analyses de sols'
      ],
      'METROLOGIE': [
        'Étalonnage de masse',
        'Étalonnage de pression',
        'Étalonnage de température',
        'Étalonnage électrique',
        'Autres étalonnages'
      ],
      'ETALONNAGE_INSTRUMENTS': [
        'Instruments de mesure de pression',
        'Instruments de mesure de masse',
        'Clés dynamométriques',
        'Instruments de température',
        'Appareils électriques'
      ],
      'ETALONNAGE_VERRERIE': [
        'Pipettes',
        'Burettes',
        'Fioles jaugées',
        'Éprouvettes graduées',
        'Autres verreries'
      ]
    }
    return categoriesMap[type] || ['Sélectionnez d\'abord un type d\'analyse']
  }

  const [categories, setCategories] = useState<string[]>([])

  // Mettre à jour les catégories quand le type d'analyse change
  useEffect(() => {
    if (formData.type_analyse) {
      setCategories(getCategoriesByType(formData.type_analyse))
      // Réinitialiser la catégorie si elle n'est plus valide
      if (formData.categorie && !getCategoriesByType(formData.type_analyse).includes(formData.categorie)) {
        setFormData({ ...formData, categorie: '' })
      }
    }
  }, [formData.type_analyse])

  const addEchantillon = () => {
    setEchantillons([
      ...echantillons,
      { id: Date.now().toString(), designation: '', quantite: 1, unite: 'unité', description: '' }
    ])
  }

  const removeEchantillon = (id: string) => {
    setEchantillons(echantillons.filter(e => e.id !== id))
  }

  const updateEchantillon = (id: string, field: keyof EchantillonForm, value: string | number) => {
    setEchantillons(echantillons.map(e => 
      e.id === id ? { ...e, [field]: value } : e
    ))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setFormData({ ...formData, documents: Array.from(e.target.files) })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Validation
      if (echantillons.length === 0) {
        throw new Error('Veuillez ajouter au moins un échantillon')
      }

      // Préparer les données
      const requestData = {
        type_analyse: formData.type_analyse,
        categorie: formData.categorie,
        priorite: formData.priorite,
        date_souhaitee: formData.date_souhaitee || null,
        description: formData.description,
        echantillons: echantillons.map(e => ({
          designation: e.designation,
          quantite: Number(e.quantite) || 1,
          unite: e.unite,
          description: e.description
        }))
      }

      // Utiliser le service API centralisé
      const response = await api.devis.create(requestData, formData.documents)
      
      setSuccess(true)
      
      // Charger la proforma associée
      if (response.id) {
        setIsLoadingProforma(true)
        try {
          // Attendre 1 seconde pour que la proforma soit générée
          await new Promise(resolve => setTimeout(resolve, 1000))
          const proformas = await api.proforma.list({ demande_devis: response.id })
          if (proformas.results && proformas.results.length > 0) {
            setProformaId(proformas.results[0].id)
          }
        } catch (error) {
          console.error('Erreur chargement proforma:', error)
        } finally {
          setIsLoadingProforma(false)
        }
      }
      
      // Redirection après 10 secondes
      setTimeout(() => {
        window.location.href = '/client/demandes'
      }, 10000)
    } catch (error: any) {
      console.error('Erreur complète:', error)
      
      // Afficher une erreur plus détaillée
      let errorMessage = 'Erreur lors de l\'envoi de la demande'
      
      if (error.message) {
        errorMessage = error.message
      }
      
      // Si c'est une erreur de validation du backend
      if (error.details) {
        const details = Object.entries(error.details)
          .map(([key, value]) => `${key}: ${value}`)
          .join('\n')
        errorMessage += '\n\nDétails:\n' + details
      }
      
      alert(errorMessage)
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="lanema-card p-12 text-center">
          <div className="w-20 h-20 rounded-full bg-emerald-100 flex items-center justify-center mx-auto mb-6">
            <svg className="w-10 h-10 text-emerald-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-3">Demande de devis envoyée !</h2>
          <p className="text-slate-600 mb-4">
            Votre demande de devis a été transmise avec succès à notre équipe.
          </p>
          
          {/* Bouton téléchargement proforma */}
          {isLoadingProforma ? (
            <div className="inline-flex items-center gap-2 px-6 py-3 bg-slate-100 text-slate-600 rounded-lg mb-4">
              <svg className="animate-spin h-5 w-5" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Génération de la facture proforma...
            </div>
          ) : proformaId ? (
            <button
              onClick={() => api.proforma.telechargerPDF(proformaId)}
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white text-base font-semibold rounded-lg hover:bg-emerald-700 transition shadow-lg mb-4"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              Télécharger la facture proforma (PDF)
            </button>
          ) : null}
          
          <p className="text-sm text-slate-500 mt-4">
            Redirection automatique dans quelques secondes...
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Demande de devis</h1>
        <p className="text-sm text-slate-600 mt-1">Remplissez le formulaire pour obtenir un devis personnalisé</p>
      </div>

      {/* Stepper */}
      <div className="lanema-card p-6">
        <div className="flex items-center justify-between">
          {['Informations générales', 'Échantillons', 'Confirmation'].map((label, index) => (
            <div key={index} className="flex items-center flex-1">
              <div className="flex flex-col items-center">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold transition ${
                  step > index + 1 
                    ? 'bg-emerald-500 text-white' 
                    : step === index + 1 
                    ? 'bg-lanema-blue-600 text-white' 
                    : 'bg-slate-200 text-slate-500'
                }`}>
                  {step > index + 1 ? '✓' : index + 1}
                </div>
                <span className={`text-xs mt-2 font-medium ${step === index + 1 ? 'text-lanema-blue-600' : 'text-slate-500'}`}>
                  {label}
                </span>
              </div>
              {index < 2 && (
                <div className={`flex-1 h-1 mx-4 ${step > index + 1 ? 'bg-emerald-500' : 'bg-slate-200'}`} />
              )}
            </div>
          ))}
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Step 1: Informations générales */}
        {step === 1 && (
          <div className="lanema-card p-6 space-y-5">
            <h2 className="text-lg font-semibold text-slate-900 mb-4">Informations générales</h2>

            {/* Info client */}
            <div className="p-4 rounded-lg bg-lanema-blue-50 border border-lanema-blue-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-lanema-blue-600 flex items-center justify-center">
                  <span className="text-white font-semibold">{user?.raison_sociale?.[0]}</span>
                </div>
                <div>
                  <div className="font-medium text-slate-900">{user?.raison_sociale}</div>
                  <div className="text-sm text-slate-600">{user?.email}</div>
                </div>
              </div>
            </div>

            {/* Type d'analyse */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-3">
                Type d'analyse souhaité *
              </label>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {typesAnalyse.map((type) => (
                  <button
                    key={type.value}
                    type="button"
                    onClick={() => setFormData({ ...formData, type_analyse: type.value })}
                    className={`p-4 rounded-lg border-2 transition text-left ${
                      formData.type_analyse === type.value
                        ? 'border-lanema-blue-600 bg-lanema-blue-50'
                        : 'border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    <div className="text-2xl mb-2">{type.icon}</div>
                    <div className="text-sm font-medium text-slate-900">{type.label}</div>
                  </button>
                ))}
              </div>
            </div>

            {/* Catégorie */}
            <div>
              <label htmlFor="categorie" className="block text-sm font-medium text-slate-700 mb-2">
                Catégorie de matériau *
              </label>
              <select
                id="categorie"
                value={formData.categorie}
                onChange={(e) => setFormData({ ...formData, categorie: e.target.value })}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
              >
                <option value="">Sélectionnez une catégorie</option>
                {categories.map((cat) => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Priorité et date */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div>
                <label htmlFor="priorite" className="block text-sm font-medium text-slate-700 mb-2">
                  Priorité
                </label>
                <select
                  id="priorite"
                  value={formData.priorite}
                  onChange={(e) => setFormData({ ...formData, priorite: e.target.value })}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                >
                  <option value="NORMALE">Normale</option>
                  <option value="HAUTE">Haute</option>
                  <option value="URGENTE">Urgente</option>
                </select>
              </div>

              <div>
                <label htmlFor="date_souhaitee" className="block text-sm font-medium text-slate-700 mb-2">
                  Date souhaitée de début
                </label>
                <input
                  id="date_souhaitee"
                  type="date"
                  value={formData.date_souhaitee}
                  onChange={(e) => setFormData({ ...formData, date_souhaitee: e.target.value })}
                  min={new Date().toISOString().split('T')[0]}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-slate-700 mb-2">
                Description détaillée de la demande
              </label>
              <textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 resize-none"
                placeholder="Décrivez votre besoin, les objectifs de l'analyse, les normes à respecter..."
              />
            </div>

            {/* Documents */}
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Documents complémentaires
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-lanema-blue-500 transition">
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  className="hidden"
                  id="file-upload"
                  accept=".pdf,.doc,.docx,.jpg,.jpeg,.png"
                />
                <label htmlFor="file-upload" className="cursor-pointer">
                  <svg className="w-12 h-12 text-slate-400 mx-auto mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  <p className="text-sm text-slate-600 font-medium">Cliquez pour charger des fichiers</p>
                  <p className="text-xs text-slate-500 mt-1">PDF, Word, Images (max 10 MB par fichier)</p>
                </label>
                {formData.documents.length > 0 && (
                  <div className="mt-4 space-y-2">
                    {formData.documents.map((file, i) => (
                      <div key={i} className="text-sm text-slate-700 flex items-center justify-center gap-2">
                        <span>📎 {file.name}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="flex justify-end pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                disabled={!formData.type_analyse || !formData.categorie}
                className="px-6 py-3 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Step 2: Échantillons */}
        {step === 2 && (
          <div className="lanema-card p-6 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-slate-900">Échantillons à analyser</h2>
              <button
                type="button"
                onClick={addEchantillon}
                className="px-4 py-2 text-sm font-medium text-lanema-blue-600 bg-lanema-blue-50 hover:bg-lanema-blue-100 rounded-lg transition"
              >
                + Ajouter un échantillon
              </button>
            </div>

            <div className="space-y-4">
              {echantillons.map((echantillon, index) => (
                <div key={echantillon.id} className="p-5 rounded-lg bg-slate-50 border border-slate-200">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="font-medium text-slate-900">Échantillon {index + 1}</h3>
                    {echantillons.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeEchantillon(echantillon.id)}
                        className="text-rose-600 hover:text-rose-700 text-sm"
                      >
                        Supprimer
                      </button>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Désignation *
                      </label>
                      <input
                        type="text"
                        value={echantillon.designation}
                        onChange={(e) => updateEchantillon(echantillon.id, 'designation', e.target.value)}
                        required
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                        placeholder="Ex: Ciment Portland CEM II"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Quantité *
                      </label>
                      <input
                        type="number"
                        value={echantillon.quantite}
                        onChange={(e) => updateEchantillon(echantillon.id, 'quantite', parseInt(e.target.value))}
                        required
                        min="1"
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Unité
                      </label>
                      <select
                        value={echantillon.unite}
                        onChange={(e) => updateEchantillon(echantillon.id, 'unite', e.target.value)}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      >
                        <option value="unité">unité(s)</option>
                        <option value="kg">kilogramme(s)</option>
                        <option value="L">litre(s)</option>
                        <option value="m">mètre(s)</option>
                        <option value="m²">mètre(s) carré(s)</option>
                        <option value="m³">mètre(s) cube(s)</option>
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-slate-700 mb-2">
                        Description / Observations
                      </label>
                      <textarea
                        value={echantillon.description}
                        onChange={(e) => updateEchantillon(echantillon.id, 'description', e.target.value)}
                        rows={2}
                        className="w-full px-4 py-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 resize-none"
                        placeholder="Informations complémentaires sur l'échantillon..."
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(1)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                ← Retour
              </button>
              <button
                type="button"
                onClick={() => setStep(3)}
                disabled={echantillons.some(e => !e.designation)}
                className="px-6 py-3 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white font-semibold rounded-lg transition disabled:opacity-50"
              >
                Suivant →
              </button>
            </div>
          </div>
        )}

        {/* Step 3: Confirmation */}
        {step === 3 && (
          <div className="lanema-card p-6 space-y-6">
            <h2 className="text-lg font-semibold text-slate-900">Récapitulatif de votre demande</h2>

            {/* Informations générales */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Informations générales</h3>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 mb-1">Type d'analyse</div>
                  <div className="font-medium text-slate-900">
                    {typesAnalyse.find(t => t.value === formData.type_analyse)?.label}
                  </div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 mb-1">Catégorie</div>
                  <div className="font-medium text-slate-900">{formData.categorie}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 mb-1">Priorité</div>
                  <div className="font-medium text-slate-900">{formData.priorite}</div>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 mb-1">Date souhaitée</div>
                  <div className="font-medium text-slate-900">{formData.date_souhaitee || 'Non spécifiée'}</div>
                </div>
              </div>
              {formData.description && (
                <div className="mt-3 p-3 bg-slate-50 rounded-lg">
                  <div className="text-slate-500 mb-1 text-sm">Description</div>
                  <div className="text-sm text-slate-900">{formData.description}</div>
                </div>
              )}
            </div>

            {/* Échantillons */}
            <div>
              <h3 className="text-sm font-semibold text-slate-700 mb-3">Échantillons ({echantillons.length})</h3>
              <div className="space-y-2">
                {echantillons.map((ech, i) => (
                  <div key={ech.id} className="p-3 bg-slate-50 rounded-lg flex items-start justify-between">
                    <div>
                      <div className="text-sm font-medium text-slate-900">{ech.designation}</div>
                      <div className="text-xs text-slate-600 mt-1">
                        {ech.quantite} {ech.unite}
                        {ech.description && ` • ${ech.description}`}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Documents */}
            {formData.documents.length > 0 && (
              <div>
                <h3 className="text-sm font-semibold text-slate-700 mb-3">Documents ({formData.documents.length})</h3>
                <div className="space-y-2">
                  {formData.documents.map((doc, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm text-slate-700">
                      <span>📎</span>
                      <span>{doc.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Info */}
            <div className="p-4 bg-lanema-blue-50 border border-lanema-blue-100 rounded-lg">
              <p className="text-sm text-lanema-blue-900">
                <strong>Note:</strong> Après validation, votre demande sera traitée par notre équipe. 
                Vous recevrez un devis détaillé sous 24-48h ouvrées par email.
              </p>
            </div>

            <div className="flex justify-between pt-4">
              <button
                type="button"
                onClick={() => setStep(2)}
                className="px-6 py-3 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition"
              >
                ← Retour
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-6 py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-lg transition disabled:opacity-50 flex items-center gap-2"
              >
                {isSubmitting ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    Envoi en cours...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Envoyer la demande
                  </>
                )}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  )
}
