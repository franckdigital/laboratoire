import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../../contexts/AuthContext'

export function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const from = (location.state as any)?.from?.pathname || '/dashboard'

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await login(email, password)

      // Récupérer le rôle depuis le localStorage (mis à jour par AuthContext)
      const rawUser = localStorage.getItem('lanema_user')
      let target = from

      if (rawUser) {
        try {
          const parsed = JSON.parse(rawUser)
          const role = parsed.role as 'CLIENT' | 'ADMIN' | 'TECHNICIEN' | 'RESPONSABLE' | undefined

          // Les clients vont sur le layout client (/client),
          // les rôles staff passent par /dashboard (RoleRedirect)
          if (role === 'CLIENT') {
            target = '/client'
          } else if (role === 'ADMIN' || role === 'TECHNICIEN' || role === 'RESPONSABLE') {
            target = '/dashboard'
          }
        } catch {
          // en cas de problème de parsing, fallback sur la route par défaut
        }
      }

      navigate(target, { replace: true })
    } catch (err) {
      setError('Email ou mot de passe incorrect')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-lanema-blue-50 via-white to-lanema-blue-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo et titre */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 rounded-xl bg-lanema-blue-600 flex items-center justify-center mx-auto mb-4 shadow-lg">
            <span className="text-2xl font-bold text-white">LM</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-900 mb-2">Bienvenue sur LAB MANAGER</h1>
          <p className="text-sm text-slate-600">Connectez-vous pour accéder à votre espace</p>
        </div>

        {/* Carte de connexion */}
        <div className="bg-white rounded-xl shadow-xl p-8 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-slate-700 mb-2">
                Adresse email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="w-full px-4 py-3 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500 focus:border-transparent transition"
                placeholder="exemple@entreprise.ci"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-slate-700 mb-2">
                Mot de passe
              </label>
              <div className="relative">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
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
            </div>

            {/* Erreur */}
            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            {/* Options */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="checkbox" className="w-4 h-4 text-lanema-blue-600 border-slate-300 rounded focus:ring-lanema-blue-500" />
                <span className="text-slate-600">Se souvenir de moi</span>
              </label>
              <Link to="/forgot-password" className="text-lanema-blue-600 hover:text-lanema-blue-700 font-medium">
                Mot de passe oublié ?
              </Link>
            </div>

            {/* Bouton de connexion */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 px-4 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white font-semibold rounded-lg shadow-md transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </button>
          </form>

          {/* Séparateur */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-2 bg-white text-slate-500">Nouveau sur LAB MANAGER ?</span>
            </div>
          </div>

          {/* Lien inscription */}
          <Link
            to="/register"
            className="block w-full py-3 px-4 bg-slate-50 hover:bg-slate-100 text-slate-700 font-medium text-center rounded-lg border border-slate-200 transition"
          >
            Créer un compte
          </Link>
        </div>

        {/* Comptes de démo */}
        <div className="mt-6 p-4 bg-amber-50 border border-amber-200 rounded-lg">
          <p className="text-xs font-semibold text-amber-900 mb-2">🔑 Comptes de démonstration:</p>
          <div className="space-y-1 text-xs text-amber-800">
            <p>• <strong>Client:</strong> client@demo.com / manager123</p>
            <p>• <strong>Admin:</strong> admin@demo.com / admin123</p>
            <p>• <strong>Technicien:</strong> technicien@demo.com / manager123</p>
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
