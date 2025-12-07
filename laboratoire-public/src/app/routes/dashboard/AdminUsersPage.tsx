import { useState, useEffect } from 'react'
import api from '../../../services/api'
import { Modal } from '../../../components/Modal'
import { AlertModal } from '../../../components/AlertModal'
import { Toast } from '../../../components/Toast'

const ROLES = [
  { value: 'ADMIN', label: 'Administrateur système' },
  { value: 'RESPONSABLE_LABO', label: 'Responsable laboratoire' },
  { value: 'TECHNICIEN', label: 'Technicien analyste' },
  { value: 'RESPONSABLE_METROLOGIE', label: 'Responsable métrologie' },
  { value: 'CLIENT', label: 'Client externe' },
  { value: 'COMPTABLE', label: 'Comptable/Facturation' },
  { value: 'GESTIONNAIRE_STOCK', label: 'Gestionnaire stock' },
  { value: 'SUPPORT', label: 'Support technique' },
]

export function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editingUser, setEditingUser] = useState<any>(null)
  const [formData, setFormData] = useState({
    email: '',
    first_name: '',
    last_name: '',
    phone: '',
    role: 'TECHNICIEN',
    password: '',
    confirmPassword: ''
  })
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showDeleteAlert, setShowDeleteAlert] = useState(false)
  const [userToDelete, setUserToDelete] = useState<any>(null)
  const [toast, setToast] = useState<{message: string, type: 'success' | 'error', visible: boolean}>({message: '', type: 'success', visible: false})

  useEffect(() => {
    loadUsers()
  }, [])

  const loadUsers = async () => {
    try {
      setIsLoading(true)
      const data = await api.adminUsers.list()
      setUsers(data || [])
    } catch (error: any) {
      console.error('Erreur chargement utilisateurs:', error)
      setError(error.message || 'Erreur lors du chargement')
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    // Validation
    const isEditing = !!editingUser
    if (!formData.email || !formData.first_name || !formData.last_name) {
      setError('Veuillez remplir tous les champs obligatoires')
      return
    }

    if (!isEditing && !formData.password) {
      setError('Le mot de passe est obligatoire')
      return
    }

    if (formData.password && formData.password !== formData.confirmPassword) {
      setError('Les mots de passe ne correspondent pas')
      return
    }

    if (formData.password && formData.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères')
      return
    }

    try {
      setIsSubmitting(true)
      const { confirmPassword, password, ...baseData } = formData
      const dataToSend = password ? { ...baseData, password } : baseData
      
      if (isEditing) {
        await api.adminUsers.update(editingUser.id, dataToSend)
        showToast('Utilisateur modifié avec succès!', 'success')
      } else {
        await api.adminUsers.create({ ...dataToSend, password })
        showToast('Utilisateur créé avec succès!', 'success')
      }
      
      setShowModal(false)
      setEditingUser(null)
      resetForm()
      loadUsers()
    } catch (error: any) {
      console.error('Erreur:', error)
      setError(error.message || 'Erreur lors de l\'opération')
    } finally {
      setIsSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      email: '',
      first_name: '',
      last_name: '',
      phone: '',
      role: 'TECHNICIEN',
      password: '',
      confirmPassword: ''
    })
    setError('')
  }

  const handleEdit = (user: any) => {
    setEditingUser(user)
    setFormData({
      email: user.email,
      first_name: user.first_name,
      last_name: user.last_name,
      phone: user.phone || '',
      role: user.role,
      password: '',
      confirmPassword: ''
    })
    setShowModal(true)
  }

  const handleDeleteClick = (user: any) => {
    setUserToDelete(user)
    setShowDeleteAlert(true)
  }

  const handleDeleteConfirm = async () => {
    if (!userToDelete) return

    try {
      setIsSubmitting(true)
      await api.adminUsers.delete(userToDelete.id)
      showToast('Utilisateur supprimé avec succès!', 'success')
      setShowDeleteAlert(false)
      setUserToDelete(null)
      loadUsers()
    } catch (error: any) {
      console.error('Erreur suppression:', error)
      showToast(error.message || 'Erreur lors de la suppression', 'error')
    } finally {
      setIsSubmitting(false)
    }
  }

  const showToast = (message: string, type: 'success' | 'error') => {
    setToast({ message, type, visible: true })
  }

  const handleNewUser = () => {
    setEditingUser(null)
    resetForm()
    setShowModal(true)
  }

  const getRoleBadgeColor = (role: string) => {
    const colors: Record<string, string> = {
      'ADMIN': 'bg-purple-100 text-purple-800 border-purple-200',
      'RESPONSABLE_LABO': 'bg-blue-100 text-blue-800 border-blue-200',
      'TECHNICIEN': 'bg-emerald-100 text-emerald-800 border-emerald-200',
      'RESPONSABLE_METROLOGIE': 'bg-cyan-100 text-cyan-800 border-cyan-200',
      'CLIENT': 'bg-slate-100 text-slate-800 border-slate-200',
      'COMPTABLE': 'bg-amber-100 text-amber-800 border-amber-200',
      'GESTIONNAIRE_STOCK': 'bg-orange-100 text-orange-800 border-orange-200',
      'SUPPORT': 'bg-pink-100 text-pink-800 border-pink-200',
    }
    return colors[role] || 'bg-slate-100 text-slate-800 border-slate-200'
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion des Utilisateurs</h1>
          <p className="text-sm text-slate-600 mt-1">Créer et gérer les comptes utilisateurs</p>
        </div>
        <button
          onClick={handleNewUser}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-lanema-blue-600 text-white text-sm font-semibold rounded-lg hover:bg-lanema-blue-700 transition shadow-md"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouvel utilisateur
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Total utilisateurs</div>
          <div className="text-2xl font-semibold text-lanema-blue-600">{Array.isArray(users) ? users.length : 0}</div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Administrateurs</div>
          <div className="text-2xl font-semibold text-purple-600">
            {Array.isArray(users) ? users.filter(u => u.role === 'ADMIN').length : 0}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Techniciens</div>
          <div className="text-2xl font-semibold text-emerald-600">
            {Array.isArray(users) ? users.filter(u => u.role === 'TECHNICIEN' || u.role === 'RESPONSABLE_LABO').length : 0}
          </div>
        </div>
        <div className="lanema-card p-4">
          <div className="text-xs text-slate-500 mb-1">Clients</div>
          <div className="text-2xl font-semibold text-slate-600">
            {Array.isArray(users) ? users.filter(u => u.role === 'CLIENT').length : 0}
          </div>
        </div>
      </div>

      {/* Liste des utilisateurs */}
      {isLoading ? (
        <div className="lanema-card p-6">
          <div className="animate-pulse space-y-4">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className="h-12 w-12 bg-slate-200 rounded-full"></div>
                <div className="flex-1 space-y-2">
                  <div className="h-4 bg-slate-200 rounded w-1/3"></div>
                  <div className="h-3 bg-slate-200 rounded w-1/4"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50 border-b border-slate-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Utilisateur
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Email
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Téléphone
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Rôle
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Statut
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Date création
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-slate-200">
                {Array.isArray(users) && users.length > 0 ? users.map((user) => (
                  <tr key={user.id} className="hover:bg-slate-50 transition">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-full bg-lanema-blue-100 flex items-center justify-center">
                          <span className="text-sm font-semibold text-lanema-blue-700">
                            {user.first_name?.[0]}{user.last_name?.[0]}
                          </span>
                        </div>
                        <div className="ml-4">
                          <div className="text-sm font-medium text-slate-900">
                            {user.first_name} {user.last_name}
                          </div>
                          <div className="text-sm text-slate-500">
                            {user.username}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.email}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-slate-900">{user.phone || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${getRoleBadgeColor(user.role)}`}>
                        {ROLES.find(r => r.value === user.role)?.label || user.role}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {user.is_active ? (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                          Actif
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
                          Inactif
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                      {new Date(user.created_at).toLocaleDateString('fr-FR')}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => handleEdit(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-lanema-blue-700 bg-lanema-blue-50 rounded-lg hover:bg-lanema-blue-100 transition"
                          title="Modifier"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                          </svg>
                          Éditer
                        </button>
                        <button
                          onClick={() => handleDeleteClick(user)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 rounded-lg hover:bg-rose-100 transition"
                          title="Supprimer"
                        >
                          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                          </svg>
                          Supprimer
                        </button>
                      </div>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan={7} className="px-6 py-12 text-center text-slate-500">
                      Aucun utilisateur trouvé
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal de création/édition */}
      <Modal
        isOpen={showModal}
        onClose={() => { setShowModal(false); setEditingUser(null); resetForm(); }}
        title={editingUser ? 'Modifier l\'utilisateur' : 'Créer un nouvel utilisateur'}
        maxWidth="2xl"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-4 bg-rose-50 border border-rose-200 rounded-lg">
                  <p className="text-sm text-rose-800">{error}</p>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Prénom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.first_name}
                    onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nom <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.last_name}
                    onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Email <span className="text-rose-500">*</span>
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Téléphone
                </label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                  placeholder="+225 XX XX XX XX XX"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">
                  Rôle <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.role}
                  onChange={(e) => setFormData({ ...formData, role: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                  required
                >
                  {ROLES.map(role => (
                    <option key={role.value} value={role.value}>
                      {role.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                    required={!editingUser}
                    minLength={8}
                  />
                  <p className="text-xs text-slate-500 mt-1">
                    {editingUser ? 'Laisser vide pour ne pas changer' : 'Minimum 8 caractères'}
                  </p>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Confirmer mot de passe <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-lanema-blue-500 focus:border-lanema-blue-500"
                    required={!editingUser && !!formData.password}
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-200">
                <button
                  type="button"
                  onClick={() => { setShowModal(false); setEditingUser(null); resetForm(); }}
                  className="px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 transition"
                  disabled={isSubmitting}
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold text-white bg-lanema-blue-600 rounded-lg hover:bg-lanema-blue-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (editingUser ? 'Modification...' : 'Création...') : (editingUser ? 'Modifier' : 'Créer l\'utilisateur')}
                </button>
              </div>
            </form>
      </Modal>

      {/* Alert de suppression */}
      <AlertModal
        isOpen={showDeleteAlert}
        onClose={() => { setShowDeleteAlert(false); setUserToDelete(null); }}
        onConfirm={handleDeleteConfirm}
        title="Supprimer l'utilisateur"
        message={`Êtes-vous sûr de vouloir supprimer l'utilisateur ${userToDelete?.first_name} ${userToDelete?.last_name} ? Cette action est irréversible.`}
        type="danger"
        confirmText="Supprimer"
        cancelText="Annuler"
        isLoading={isSubmitting}
      />

      {/* Toast notifications */}
      <Toast
        message={toast.message}
        type={toast.type}
        isVisible={toast.visible}
        onClose={() => setToast({ ...toast, visible: false })}
      />
    </div>
  )
}
