import { useState, useEffect } from 'react'
import api from '../../../services/api'

export function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [editingClient, setEditingClient] = useState<any>(null)
  const [formData, setFormData] = useState({
    raison_sociale: '',
    email: '',
    type_subscription: 'BASIC',
    adresse: '',
    telephone: '',
    siret: '',
    contact_nom: ''
  })

  useEffect(() => {
    loadClients()
  }, [])

  const loadClients = async () => {
    try {
      setIsLoading(true)
      const data = await api.clientsAdmin.list()
      setClients(data.results || data || [])
    } catch (error) {
      console.error('Erreur chargement clients:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      if (editingClient) {
        await api.clientsAdmin.update(editingClient.id, formData)
      } else {
        await api.clientsAdmin.create(formData)
      }
      setShowModal(false)
      setEditingClient(null)
      setFormData({
        raison_sociale: '',
        email: '',
        type_subscription: 'BASIC',
        adresse: '',
        telephone: '',
        siret: '',
        contact_nom: ''
      })
      loadClients()
    } catch (error) {
      console.error('Erreur sauvegarde:', error)
    }
  }

  const handleEdit = (client: any) => {
    setEditingClient(client)
    setFormData({
      raison_sociale: client.raison_sociale || '',
      email: client.email || '',
      type_subscription: client.type_subscription || 'BASIC',
      adresse: client.adresse || '',
      telephone: client.telephone || '',
      siret: client.siret || '',
      contact_nom: client.contact_nom || ''
    })
    setShowModal(true)
  }

  const filteredClients = clients.filter(c =>
    c.raison_sociale?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-slate-900">Gestion des clients</h1>
          <p className="text-sm text-slate-600 mt-1">Gérez les clients et leurs demandes d'analyse</p>
        </div>
        <button 
          onClick={() => {
            setEditingClient(null)
            setFormData({
              raison_sociale: '',
              email: '',
              type_subscription: 'BASIC',
              adresse: '',
              telephone: '',
              siret: '',
              contact_nom: ''
            })
            setShowModal(true)
          }}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg shadow-md transition"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          Nouveau client
        </button>
      </div>

      {/* Stats */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="lanema-card p-4 animate-pulse">
              <div className="h-4 w-24 bg-slate-200 rounded mb-2"></div>
              <div className="h-8 w-16 bg-slate-200 rounded"></div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Total clients</div>
            <div className="text-2xl font-semibold text-slate-900">{clients.length}</div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Actifs</div>
            <div className="text-2xl font-semibold text-emerald-600">
              {clients.filter(c => c.is_active).length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Premium</div>
            <div className="text-2xl font-semibold text-amber-600">
              {clients.filter(c => c.type_subscription === 'PREMIUM').length}
            </div>
          </div>
          <div className="lanema-card p-4">
            <div className="text-xs text-slate-500 mb-1">Enterprise</div>
            <div className="text-2xl font-semibold text-lanema-blue-600">
              {clients.filter(c => c.type_subscription === 'ENTERPRISE').length}
            </div>
          </div>
        </div>
      )}

      {/* Search */}
      <div className="lanema-card p-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou email..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-2 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
        />
      </div>

      {/* Table */}
      {isLoading ? (
        <div className="lanema-card p-6 animate-pulse">
          <div className="space-y-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="h-12 bg-slate-200 rounded"></div>
            ))}
          </div>
        </div>
      ) : filteredClients.length === 0 ? (
        <div className="lanema-card p-12 text-center">
          <div className="w-16 h-16 rounded-full bg-slate-100 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <h3 className="text-lg font-semibold text-slate-900 mb-1">Aucun client trouvé</h3>
          <p className="text-sm text-slate-600">Commencez par ajouter un nouveau client</p>
        </div>
      ) : (
        <div className="lanema-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Raison sociale</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Email</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Téléphone</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Type</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Statut</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-slate-600">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredClients.map((client) => (
                  <tr key={client.id} className="border-t border-slate-100 hover:bg-slate-50 transition">
                    <td className="px-4 py-3 text-sm font-medium text-slate-900">{client.raison_sociale}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{client.email}</td>
                    <td className="px-4 py-3 text-sm text-slate-600">{client.telephone || 'N/A'}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        client.type_subscription === 'ENTERPRISE' ? 'bg-purple-100 text-purple-700' :
                        client.type_subscription === 'PREMIUM' ? 'bg-amber-100 text-amber-700' :
                        'bg-slate-100 text-slate-700'
                      }`}>
                        {client.type_subscription}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`inline-flex items-center px-2 py-0.5 text-xs font-medium rounded-full ${
                        client.is_active ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-600'
                      }`}>
                        {client.is_active ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button 
                        onClick={() => handleEdit(client)}
                        className="text-sm text-lanema-blue-600 hover:text-lanema-blue-700 font-medium hover:underline"
                      >
                        Éditer
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-lg font-semibold text-slate-900">
                  {editingClient ? 'Modifier le client' : 'Nouveau client'}
                </h3>
                <button 
                  onClick={() => {
                    setShowModal(false)
                    setEditingClient(null)
                  }}
                  className="text-slate-400 hover:text-slate-600"
                >
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Raison sociale *
                    </label>
                    <input
                      type="text"
                      value={formData.raison_sociale}
                      onChange={(e) => setFormData({...formData, raison_sociale: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Email *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({...formData, email: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Téléphone
                    </label>
                    <input
                      type="tel"
                      value={formData.telephone}
                      onChange={(e) => setFormData({...formData, telephone: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Type d'abonnement *
                    </label>
                    <select
                      value={formData.type_subscription}
                      onChange={(e) => setFormData({...formData, type_subscription: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    >
                      <option value="BASIC">Basic</option>
                      <option value="PREMIUM">Premium</option>
                      <option value="ENTERPRISE">Enterprise</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      SIRET
                    </label>
                    <input
                      type="text"
                      value={formData.siret}
                      onChange={(e) => setFormData({...formData, siret: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Adresse
                    </label>
                    <input
                      type="text"
                      value={formData.adresse}
                      onChange={(e) => setFormData({...formData, adresse: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Nom du contact
                    </label>
                    <input
                      type="text"
                      value={formData.contact_nom}
                      onChange={(e) => setFormData({...formData, contact_nom: e.target.value})}
                      className="w-full px-4 py-2 border border-slate-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-lanema-blue-500"
                    />
                  </div>
                </div>

                <div className="flex gap-3 pt-4">
                  <button 
                    type="submit" 
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-white bg-lanema-blue-600 hover:bg-lanema-blue-700 rounded-lg transition"
                  >
                    {editingClient ? 'Mettre à jour' : 'Créer le client'}
                  </button>
                  <button 
                    type="button"
                    onClick={() => {
                      setShowModal(false)
                      setEditingClient(null)
                    }}
                    className="flex-1 px-4 py-2.5 text-sm font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition"
                  >
                    Annuler
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
