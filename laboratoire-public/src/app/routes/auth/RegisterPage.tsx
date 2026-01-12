import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import api from '../../../services/api'

export function RegisterPage() {
  const [formData, setFormData] = useState({
    raison_sociale: '',
    email: '',
    telephone: '',
    adresse: '',
    type_client: 'ENTREPRISE',
    password: '',
    confirmPassword: '',
  })
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  
  const navigate = useNavigate()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    setIsLoading(true)

    try {
      await api.auth.register({
        email: formData.email,
        password: formData.password,
        raison_sociale: formData.raison_sociale,
        type_subscription: formData.type_client,
        adresse: formData.adresse,
        telephone: formData.telephone,
      })

      navigate('/login', { replace: true })
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue lors de la création du compte')
    } finally {
      setIsLoading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lanema-blue-50 via-white to-lanema-blue-50 flex items-center justify-center p-4 py-12">
      <div className="w-full max-w-2xl">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-lanema-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">L</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Créer un compte LAB MANAGER</h1>
          <p className="text-sm text-slate-600">Remplissez le formulaire pour accéder à nos services</p>
        </div>

        {/* Carte d'inscription */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Informations entreprise */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="md:col-span-2">
                <label htmlFor="raison_sociale" className="block text-sm font-medium text-slate-700 mb-2">
                  Raison sociale *
                </label>
                <input
                  id="raison_sociale"
                  name="raison_sociale"
                  type="text"
                  value={formData.raison_sociale}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                  placeholder="Nom de votre entreprise"
                />
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                  Email professionnel *
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                  placeholder="contact@entreprise.ci"
                />
              </div>

              <div>
                <label htmlFor="telephone" className="block text-sm font-medium text-slate-700 mb-2">
                  Téléphone *
                </label>
                <input
                  id="telephone"
                  name="telephone"
                  type="tel"
                  value={formData.telephone}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="adresse" className="block text-sm font-medium text-slate-700 mb-2">
                  Adresse *
                </label>
                <textarea
                  id="adresse"
                  name="adresse"
                  value={formData.adresse}
                  onChange={handleChange}
                  required
                  rows={2}
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition resize-none"
                  placeholder="Adresse complète de l'entreprise"
                />
              </div>

              <div className="md:col-span-2">
                <label htmlFor="type_client" className="block text-sm font-medium text-slate-700 mb-2">
                  Type de client *
                </label>
                <select
                  id="type_client"
                  name="type_client"
                  value={formData.type_client}
                  onChange={handleChange}
                  required
                  className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                >
                  <option value="ENTREPRISE">Entreprise</option>
                  <option value="PARTICULIER">Particulier</option>
                  <option value="INSTITUTION">Institution publique</option>
                  <option value="ONG">ONG</option>
                </select>
                <p className="text-xs text-slate-500 mt-1">Sélectionnez le type de compte adapté à vos besoins</p>
              </div>
            </div>

            {/* Mot de passe */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-4 border-t border-slate-200">
              <div>
                <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                  Mot de passe *
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? 'text' : 'password'}
                    value={formData.password}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                    aria-label={showPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.62 11.62 0 012.37-3.57m3.2-2.35A10.05 10.05 0 0112 5c5 0 9.27 3.11 11 7.5a11.62 11.62 0 01-4.14 5.04M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
                <p className="text-xs text-slate-500 mt-1">Minimum 8 caractères</p>
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-700 mb-2">
                  Confirmer le mot de passe *
                </label>
                <div className="relative">
                  <input
                    id="confirmPassword"
                    name="confirmPassword"
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    required
                    className="w-full pr-12 px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword((s) => !s)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                    aria-label={showConfirmPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-5 0-9.27-3.11-11-7.5a11.62 11.62 0 012.37-3.57m3.2-2.35A10.05 10.05 0 0112 5c5 0 9.27 3.11 11 7.5a11.62 11.62 0 01-4.14 5.04M9.88 9.88A3 3 0 0012 15a3 3 0 002.12-.88M3 3l18 18" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.477 0 8.268 2.943 9.542 7-1.274 4.057-5.065 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Conditions */}
            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-0.5 text-lanema-blue-600 border-slate-300 rounded focus:ring-lanema-blue-500"
              />
              <label className="text-xs text-slate-600">
                J'accepte les <Link to="/terms" className="text-lanema-blue-600 hover:underline">conditions d'utilisation</Link> et la <Link to="/privacy" className="text-lanema-blue-600 hover:underline">politique de confidentialité</Link> de LAB MANAGER
              </label>
            </div>

            {/* Bouton d'inscription */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Création du compte...' : 'Créer mon compte'}
            </button>
          </form>

          {/* Lien connexion */}
          <div className="mt-6 text-center">
            <p className="text-sm text-slate-600">
              Vous avez déjà un compte ?{' '}
              <Link to="/login" className="text-lanema-blue-600 hover:text-lanema-blue-700 font-medium">
                Se connecter
              </Link>
            </p>
          </div>
        </div>

        {/* Retour accueil */}
        <div className="text-center mt-6">
          <Link to="/" className="text-sm text-slate-600 hover:text-lanema-blue-600">
            ← Retour à l'accueil
          </Link>
        </div>
      </div>
    </div>
  )
}
