import { useState, useEffect } from 'react'
import { useAuth } from '../../../contexts/AuthContext'

interface Permission {
  id: number
  name: string
  code: string
  category: string
  description?: string
  is_active: boolean
}

interface RolePermission {
  [permissionCode: string]: boolean
}

interface RolePermissions {
  [role: string]: RolePermission
}

const ROLES = [
  { code: 'ADMIN', label: 'Administrateur système' },
  { code: 'RESPONSABLE_LABO', label: 'Responsable laboratoire' },
  { code: 'TECHNICIEN', label: 'Technicien analyste' },
  { code: 'RESPONSABLE_METROLOGIE', label: 'Responsable métrologie' },
  { code: 'CLIENT', label: 'Client externe' },
  { code: 'COMPTABLE', label: 'Comptable/Facturation' },
  { code: 'GESTIONNAIRE_STOCK', label: 'Gestionnaire stock' },
  { code: 'SUPPORT', label: 'Support technique' },
]

const MODULE_PERMISSIONS = [
  { code: 'dashboard.view', name: 'Accès au Tableau de Bord', category: 'Dashboard' },
  { code: 'clients.view', name: 'Voir les Clients', category: 'Gestion Clients' },
  { code: 'clients.create', name: 'Créer un Client', category: 'Gestion Clients' },
  { code: 'clients.edit', name: 'Modifier un Client', category: 'Gestion Clients' },
  { code: 'clients.delete', name: 'Supprimer un Client', category: 'Gestion Clients' },
  { code: 'echantillons.view', name: 'Voir les Échantillons', category: 'Gestion Échantillons' },
  { code: 'echantillons.create', name: 'Créer un Échantillon', category: 'Gestion Échantillons' },
  { code: 'echantillons.edit', name: 'Modifier un Échantillon', category: 'Gestion Échantillons' },
  { code: 'echantillons.delete', name: 'Supprimer un Échantillon', category: 'Gestion Échantillons' },
  { code: 'essais.view', name: 'Voir les Essais', category: 'Gestion Essais' },
  { code: 'essais.create', name: 'Créer un Essai', category: 'Gestion Essais' },
  { code: 'essais.edit', name: 'Modifier un Essai', category: 'Gestion Essais' },
  { code: 'essais.delete', name: 'Supprimer un Essai', category: 'Gestion Essais' },
  { code: 'metrologie.view', name: 'Voir la Métrologie', category: 'Métrologie' },
  { code: 'metrologie.manage', name: 'Gérer la Métrologie', category: 'Métrologie' },
  { code: 'stock.view', name: 'Voir le Stock', category: 'Gestion Stock' },
  { code: 'stock.manage', name: 'Gérer le Stock', category: 'Gestion Stock' },
  { code: 'facturation.view', name: 'Voir la Facturation', category: 'Facturation' },
  { code: 'facturation.manage', name: 'Gérer la Facturation', category: 'Facturation' },
  { code: 'qualite.view', name: 'Voir la Qualité', category: 'Qualité' },
  { code: 'qualite.manage', name: 'Gérer la Qualité', category: 'Qualité' },
  { code: 'reporting.view', name: 'Voir les Rapports', category: 'Reporting' },
  { code: 'notifications.view', name: 'Voir les Notifications', category: 'Notifications' },
  { code: 'admin.users', name: 'Gérer les Utilisateurs', category: 'Administration' },
  { code: 'admin.proformas', name: 'Gérer les Proformas', category: 'Administration' },
  { code: 'admin.analyses', name: 'Gérer les Analyses', category: 'Administration' },
  { code: 'admin.permissions', name: 'Gérer les Permissions', category: 'Administration' },
]

export function RolePermissionsPage() {
  const { user } = useAuth()
  const [permissions, setPermissions] = useState<Permission[]>([])
  const [rolePermissions, setRolePermissions] = useState<RolePermissions>({})
  const [selectedRole, setSelectedRole] = useState<string>('ADMIN')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadPermissions()
  }, [])

  const loadPermissions = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('lanema_token')
      
      // Charger les permissions disponibles
      const permResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/permissions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (permResponse.ok) {
        const permData = await permResponse.json()
        setPermissions(permData)
      } else {
        // Utiliser les permissions par défaut si l'API ne répond pas
        setPermissions(MODULE_PERMISSIONS as any)
      }

      // Charger les permissions par rôle
      const rolePermResponse = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/role-permissions/`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        }
      })

      if (rolePermResponse.ok) {
        const rolePermData = await rolePermResponse.json()
        setRolePermissions(rolePermData.role_permissions || {})
      } else {
        // Initialiser avec des permissions par défaut
        initializeDefaultPermissions()
      }
    } catch (error) {
      console.error('Erreur lors du chargement des permissions:', error)
      // Utiliser les permissions par défaut
      setPermissions(MODULE_PERMISSIONS as any)
      initializeDefaultPermissions()
    } finally {
      setLoading(false)
    }
  }

  const initializeDefaultPermissions = () => {
    const defaultPerms: RolePermissions = {}
    
    ROLES.forEach(role => {
      defaultPerms[role.code] = {}
      MODULE_PERMISSIONS.forEach(perm => {
        // Par défaut, l'ADMIN a toutes les permissions
        if (role.code === 'ADMIN') {
          defaultPerms[role.code][perm.code] = true
        } else if (role.code === 'CLIENT') {
          // Le client a accès limité
          defaultPerms[role.code][perm.code] = perm.code === 'dashboard.view'
        } else {
          // Les autres rôles ont accès au dashboard et à leur domaine
          defaultPerms[role.code][perm.code] = perm.code === 'dashboard.view'
        }
      })
    })
    
    setRolePermissions(defaultPerms)
  }

  const togglePermission = async (role: string, permissionCode: string) => {
    const currentValue = rolePermissions[role]?.[permissionCode] || false
    const newValue = !currentValue

    // Mise à jour optimiste de l'UI
    setRolePermissions(prev => ({
      ...prev,
      [role]: {
        ...prev[role],
        [permissionCode]: newValue
      }
    }))

    try {
      setSaving(true)
      const token = localStorage.getItem('lanema_token')
      
      const response = await fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:8000/api'}/admin/toggle-role-permission/`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role,
          permission_code: permissionCode,
        })
      })

      if (!response.ok) {
        throw new Error('Erreur lors de la mise à jour')
      }

      setMessage({
        type: 'success',
        text: `Permission ${newValue ? 'activée' : 'désactivée'} avec succès`
      })
      
      setTimeout(() => setMessage(null), 3000)
    } catch (error) {
      console.error('Erreur:', error)
      // Revenir à l'état précédent en cas d'erreur
      setRolePermissions(prev => ({
        ...prev,
        [role]: {
          ...prev[role],
          [permissionCode]: currentValue
        }
      }))
      
      setMessage({
        type: 'error',
        text: 'Erreur lors de la mise à jour de la permission'
      })
      
      setTimeout(() => setMessage(null), 3000)
    } finally {
      setSaving(false)
    }
  }

  // Grouper les permissions par catégorie
  const groupedPermissions = permissions.reduce((acc, perm) => {
    if (!acc[perm.category]) {
      acc[perm.category] = []
    }
    acc[perm.category].push(perm)
    return acc
  }, {} as { [category: string]: Permission[] })

  if (user?.role !== 'ADMIN') {
    return (
      <div className="text-center py-12">
        <div className="text-red-600 text-xl font-semibold">
          ⛔ Accès refusé
        </div>
        <p className="text-slate-600 mt-2">
          Vous devez être administrateur pour accéder à cette page.
        </p>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="text-center py-12">
        <div className="text-slate-600">Chargement des permissions...</div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* En-tête */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h1 className="text-2xl font-bold text-slate-800 mb-2">
          🔒 Gestion des Rôles et Permissions
        </h1>
        <p className="text-slate-600">
          Configurez les permissions pour chaque rôle. Activez ou désactivez l'accès aux différentes pages et fonctionnalités.
        </p>
      </div>

      {/* Message de notification */}
      {message && (
        <div className={`rounded-lg p-4 ${
          message.type === 'success' 
            ? 'bg-green-50 border border-green-200 text-green-800' 
            : 'bg-red-50 border border-red-200 text-red-800'
        }`}>
          {message.text}
        </div>
      )}

      {/* Sélection du rôle */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <label className="block text-sm font-medium text-slate-700 mb-3">
          Sélectionner un rôle
        </label>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {ROLES.map(role => (
            <button
              key={role.code}
              onClick={() => setSelectedRole(role.code)}
              className={`px-4 py-3 rounded-lg text-left transition-all ${
                selectedRole === role.code
                  ? 'bg-blue-600 text-white shadow-md'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              <div className="font-semibold text-sm">{role.code}</div>
              <div className="text-xs opacity-80">{role.label}</div>
            </button>
          ))}
        </div>
      </div>

      {/* Liste des permissions */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Permissions pour: {ROLES.find(r => r.code === selectedRole)?.label}
        </h2>

        <div className="space-y-6">
          {Object.entries(groupedPermissions).map(([category, perms]) => (
            <div key={category}>
              <h3 className="text-sm font-semibold text-slate-600 mb-3 pb-2 border-b border-slate-200">
                {category}
              </h3>
              <div className="space-y-2">
                {perms.map((perm) => {
                  const isGranted = rolePermissions[selectedRole]?.[perm.code] || false
                  return (
                    <div
                      key={perm.code}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-slate-50 transition-colors"
                    >
                      <div className="flex-1">
                        <div className="font-medium text-slate-700">{perm.name}</div>
                        <div className="text-xs text-slate-500">{perm.code}</div>
                        {perm.description && (
                          <div className="text-xs text-slate-400 mt-1">{perm.description}</div>
                        )}
                      </div>
                      <button
                        onClick={() => togglePermission(selectedRole, perm.code)}
                        disabled={saving}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                          isGranted ? 'bg-green-600' : 'bg-slate-300'
                        } ${saving ? 'opacity-50 cursor-not-allowed' : ''}`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            isGranted ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  )
                })}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Statistiques */}
      <div className="bg-white rounded-lg shadow-sm border border-slate-200 p-6">
        <h3 className="text-sm font-semibold text-slate-700 mb-3">Statistiques</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <div className="text-2xl font-bold text-blue-600">
              {Object.keys(groupedPermissions).length}
            </div>
            <div className="text-xs text-slate-600">Catégories</div>
          </div>
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <div className="text-2xl font-bold text-green-600">
              {permissions.length}
            </div>
            <div className="text-xs text-slate-600">Permissions totales</div>
          </div>
          <div className="text-center p-4 bg-purple-50 rounded-lg">
            <div className="text-2xl font-bold text-purple-600">
              {Object.keys(rolePermissions[selectedRole] || {}).filter(
                key => rolePermissions[selectedRole][key]
              ).length}
            </div>
            <div className="text-xs text-slate-600">Activées pour ce rôle</div>
          </div>
        </div>
      </div>
    </div>
  )
}
