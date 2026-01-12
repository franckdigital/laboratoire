import { useEffect, useState } from 'react'
import api from '../../../services/api'

export function ProfilPage() {
  const [isLoading, setIsLoading] = useState(true)
  const [isSaving, setIsSaving] = useState(false)
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const [form, setForm] = useState({
    email: '',
    raison_sociale: '',
    adresse: '',
    telephone: '',
    siret: '',
    contact_nom: '',
    first_name: '',
    last_name: '',
  })

  const [passwordForm, setPasswordForm] = useState({
    current_password: '',
    new_password: '',
    confirm_new_password: '',
  })
  const [showCurrentPassword, setShowCurrentPassword] = useState(false)
  const [showNewPassword, setShowNewPassword] = useState(false)
  const [showConfirmNewPassword, setShowConfirmNewPassword] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setIsLoading(true)
        const data = await api.auth.getProfile()
        setForm({
          email: data.email || '',
          raison_sociale: data.raison_sociale || '',
          adresse: data.adresse || '',
          telephone: data.telephone || '',
          siret: data.siret || '',
          contact_nom: data.contact_nom || '',
          first_name: data.first_name || '',
          last_name: data.last_name || '',
        })
      } catch (e: any) {
        setError(e?.message || 'Erreur lors du chargement du profil')
      } finally {
        setIsLoading(false)
      }
    }

    load()
  }, [])

  const updatePasswordField = (key: string, value: string) => {
    setPasswordForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)

    if (!passwordForm.current_password || !passwordForm.new_password) {
      setError('Veuillez remplir tous les champs du mot de passe')
      return
    }

    if (passwordForm.new_password !== passwordForm.confirm_new_password) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    setIsChangingPassword(true)
    try {
      await api.auth.changePassword({
        current_password: passwordForm.current_password,
        new_password: passwordForm.new_password,
      })

      setPasswordForm({ current_password: '', new_password: '', confirm_new_password: '' })
      setSuccess('Mot de passe mis à jour')
    } catch (e: any) {
      setError(e?.message || 'Erreur lors du changement de mot de passe')
    } finally {
      setIsChangingPassword(false)
    }
  }

  const updateField = (key: string, value: string) => {
    setForm((prev) => ({ ...prev, [key]: value }))
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(null)
    setIsSaving(true)

    try {
      const payload = {
        raison_sociale: form.raison_sociale,
        adresse: form.adresse,
        telephone: form.telephone,
        siret: form.siret,
        contact_nom: form.contact_nom,
        first_name: form.first_name,
        last_name: form.last_name,
      }
      const updated = await api.auth.updateProfile(payload)
      setForm((prev) => ({
        ...prev,
        raison_sociale: updated.raison_sociale || prev.raison_sociale,
        adresse: updated.adresse || prev.adresse,
        telephone: updated.telephone || prev.telephone,
        siret: updated.siret || prev.siret,
        contact_nom: updated.contact_nom || prev.contact_nom,
        first_name: updated.first_name || prev.first_name,
        last_name: updated.last_name || prev.last_name,
      }))
      setSuccess('Profil mis à jour')
    } catch (e: any) {
      setError(e?.message || 'Erreur lors de la mise à jour du profil')
    } finally {
      setIsSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold text-slate-900">Mon profil</h1>
        <p className="text-sm text-slate-600 mt-1">Mettez à jour vos informations de compte</p>
      </div>

      <div className="lanema-card p-6">
        {isLoading ? (
          <div className="animate-pulse space-y-4">
            <div className="h-5 w-48 bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-200 rounded" />
            <div className="h-10 w-full bg-slate-200 rounded" />
          </div>
        ) : (
          <div className="space-y-6">
            <form onSubmit={handleSave} className="space-y-5">
            {success && (
              <div className="p-3 rounded-lg bg-emerald-50 border border-emerald-200">
                <p className="text-sm text-emerald-700">{success}</p>
              </div>
            )}

            {error && (
              <div className="p-3 rounded-lg bg-rose-50 border border-rose-200">
                <p className="text-sm text-rose-700">{error}</p>
              </div>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Email</label>
                <input
                  type="email"
                  value={form.email}
                  disabled
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm bg-slate-50 text-slate-600"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Raison sociale</label>
                <input
                  type="text"
                  value={form.raison_sociale}
                  onChange={(e) => updateField('raison_sociale', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Nom</label>
                <input
                  type="text"
                  value={form.last_name}
                  onChange={(e) => updateField('last_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Prénom</label>
                <input
                  type="text"
                  value={form.first_name}
                  onChange={(e) => updateField('first_name', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Adresse</label>
                <input
                  type="text"
                  value={form.adresse}
                  onChange={(e) => updateField('adresse', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Téléphone</label>
                <input
                  type="text"
                  value={form.telephone}
                  onChange={(e) => updateField('telephone', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">SIRET</label>
                <input
                  type="text"
                  value={form.siret}
                  onChange={(e) => updateField('siret', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-medium text-slate-600 mb-1">Contact</label>
                <input
                  type="text"
                  value={form.contact_nom}
                  onChange={(e) => updateField('contact_nom', e.target.value)}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                />
              </div>
            </div>

              <div className="pt-2 flex justify-end">
                <button
                  type="submit"
                  disabled={isSaving}
                  className="px-4 py-2 bg-lanema-blue-600 hover:bg-lanema-blue-700 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSaving ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>

            <div className="border-t border-slate-200 pt-6">
              <h2 className="text-lg font-semibold text-slate-900">Changer le mot de passe</h2>
              <form onSubmit={handleChangePassword} className="mt-4 space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-600 mb-1">Mot de passe actuel</label>
                  <div className="relative">
                    <input
                      type={showCurrentPassword ? 'text' : 'password'}
                      value={passwordForm.current_password}
                      onChange={(e) => updatePasswordField('current_password', e.target.value)}
                      className="w-full pr-12 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => setShowCurrentPassword((s) => !s)}
                      className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                      aria-label={showCurrentPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                    >
                      {showCurrentPassword ? (
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

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Nouveau mot de passe</label>
                    <div className="relative">
                      <input
                        type={showNewPassword ? 'text' : 'password'}
                        value={passwordForm.new_password}
                        onChange={(e) => updatePasswordField('new_password', e.target.value)}
                        className="w-full pr-12 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowNewPassword((s) => !s)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                        aria-label={showNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showNewPassword ? (
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

                  <div>
                    <label className="block text-xs font-medium text-slate-600 mb-1">Confirmer</label>
                    <div className="relative">
                      <input
                        type={showConfirmNewPassword ? 'text' : 'password'}
                        value={passwordForm.confirm_new_password}
                        onChange={(e) => updatePasswordField('confirm_new_password', e.target.value)}
                        className="w-full pr-12 px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowConfirmNewPassword((s) => !s)}
                        className="absolute inset-y-0 right-0 px-3 flex items-center text-slate-500 hover:text-slate-700"
                        aria-label={showConfirmNewPassword ? 'Masquer le mot de passe' : 'Afficher le mot de passe'}
                      >
                        {showConfirmNewPassword ? (
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

                <div className="flex justify-end">
                  <button
                    type="submit"
                    disabled={isChangingPassword}
                    className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-sm font-semibold rounded-lg transition disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isChangingPassword ? 'Modification...' : 'Modifier le mot de passe'}
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
