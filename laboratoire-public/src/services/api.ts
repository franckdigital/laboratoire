/**
 * Service API centralisé pour LANEMA
 */

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Helper pour obtenir les headers avec authentification
const getAuthHeaders = (): HeadersInit => {
  const token = localStorage.getItem('lanema_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Helper pour gérer les erreurs
const handleResponse = async (response: Response) => {
  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}))
    
    // Construire un message d'erreur détaillé
    let errorMessage = errorData.error || errorData.detail || `Erreur ${response.status}`
    
    // Si c'est une erreur de validation avec des détails par champ
    if (errorData && typeof errorData === 'object' && !errorData.error && !errorData.detail) {
      const fieldErrors = Object.entries(errorData)
        .filter(([key]) => key !== 'non_field_errors')
        .map(([key, value]) => `${key}: ${Array.isArray(value) ? value.join(', ') : value}`)
      
      if (fieldErrors.length > 0) {
        errorMessage = 'Erreur de validation:\n' + fieldErrors.join('\n')
      }
      
      if (errorData.non_field_errors) {
        errorMessage = Array.isArray(errorData.non_field_errors) 
          ? errorData.non_field_errors.join(', ')
          : errorData.non_field_errors
      }
    }
    
    const error: any = new Error(errorMessage)
    error.details = errorData
    error.status = response.status
    throw error
  }
  return response.json()
}

// ============================================
// AUTHENTICATION
// ============================================

export const authAPI = {
  async login(email: string, password: string) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/login/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    })
    return handleResponse(response)
  },

  async forgotPassword(email: string) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/password-reset/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email })
    })
    return handleResponse(response)
  },

  async resetPassword(params: { uid: string; token: string; new_password: string }) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/password-reset/confirm/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(params)
    })
    return handleResponse(response)
  },

  async telechargerPDF(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/telecharger_pdf/`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement de la facture')
      }

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `Facture_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement facture PDF:', error)
      throw error
    }
  },

  async register(data: {
    email: string
    password: string
    raison_sociale: string
    type_subscription: string
    adresse?: string
    telephone?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/register/`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async getProfile() {
    const response = await fetch(`${API_BASE_URL}/clients/auth/profile/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async updateProfile(data: any) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/profile/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async changePassword(params: { current_password: string; new_password: string }) {
    const response = await fetch(`${API_BASE_URL}/clients/auth/password-change/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    })
    return handleResponse(response)
  },

  async logout() {
    const response = await fetch(`${API_BASE_URL}/clients/auth/logout/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// DEMANDES DE DEVIS
// ============================================

export const devisAPI = {
  async list() {
    const response = await fetch(`${API_BASE_URL}/demandes/devis/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async mesDemandes() {
    const response = await fetch(`${API_BASE_URL}/demandes/devis/mes_demandes/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any, documents?: File[]) {
    // Pour l'instant, toujours envoyer en JSON
    // Les documents seront gérés dans une future version ou un endpoint séparé
    const response = await fetch(`${API_BASE_URL}/demandes/devis/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    
    // TODO: Si documents, uploader séparément après création
    if (documents && documents.length > 0) {
      console.warn('Upload de documents non implémenté - les documents seront ignorés pour le moment')
    }
    
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/demandes/devis/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async accepter(id: string) {
    const response = await fetch(`${API_BASE_URL}/demandes/devis/${id}/accepter/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async refuser(id: string) {
    const response = await fetch(`${API_BASE_URL}/demandes/devis/${id}/refuser/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/demandes/dashboard/stats/`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })
    return handleResponse(response)
  }
}

// ============================================
// DEMANDES D'ANALYSE (clients module)
// ============================================

export const demandesAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/clients/demandes/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/clients/demandes/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// ÉCHANTILLONS
// ============================================

export const echantillonsAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/qualite/echantillons/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/qualite/echantillons/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/echantillons/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/echantillons/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },
}

// ============================================
// ESSAIS/RÉSULTATS
// ============================================

export const essaisAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/qualite/essais/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/qualite/essais/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/essais/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/essais/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  }
}

// ============================================
// FACTURES
// ============================================

export const facturesAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/facturation/factures/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async pay(id: string, params: { mode_paiement: 'CHEQUE' | 'COMPTANT', justificatif: File, reference?: string }) {
    const token = localStorage.getItem('lanema_token')
    const formData = new FormData()
    formData.append('mode_paiement', params.mode_paiement)
    formData.append('justificatif_paiement', params.justificatif)
    if (params.reference) {
      formData.append('reference_paiement', params.reference)
    }

    const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/payer/`, {
      method: 'POST',
      headers: {
        ...(token && { 'Authorization': `Bearer ${token}` })
      },
      body: formData
    })
    return handleResponse(response)
  },

  async validerPaiement(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/valider_paiement/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/facturation/factures/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/facturation/factures/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async telechargerPDF(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/facturation/factures/${id}/telecharger_pdf/`, {
        headers: getAuthHeaders()
      })

      if (!response.ok) {
        throw new Error('Erreur lors du téléchargement du PDF')
      }

      // Récupérer le JSON avec le PDF en base64
      const data = await response.json()
      
      // Décoder le base64 et créer un blob
      const byteCharacters = atob(data.pdf_base64)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })
      
      // Créer un lien de téléchargement
      const url = window.URL.createObjectURL(blob)
      const link = document.createElement('a')
      link.href = url
      link.download = data.filename || `facture_${id}.pdf`
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
      window.URL.revokeObjectURL(url)
    } catch (error) {
      console.error('Erreur téléchargement PDF:', error)
      throw error
    }
  }
}

// ============================================
// STOCK
// ============================================

export const stockAPI = {
  // Articles
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/stock/articles/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/stock/articles/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/stock/articles/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/stock/articles/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/stock/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // Mouvements de stock
  async mouvements(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/stock/mouvements/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  // ============ NOUVEAUX ENDPOINTS ISO 17025 ============

  // Entrepôts
  entrepots: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/entrepots/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/entrepots/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/entrepots/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/entrepots/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/entrepots/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return response.ok ? {} : handleResponse(response)
    }
  },

  // Emplacements
  emplacements: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      return response.ok ? {} : handleResponse(response)
    },

    async scan(qrCode: string) {
      const response = await fetch(`${API_BASE_URL}/stock/emplacements/scan/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qr_code: qrCode })
      })
      return handleResponse(response)
    }
  },

  // Fournisseurs
  fournisseurs: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/fournisseurs/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },
    
    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/fournisseurs/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/fournisseurs/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/fournisseurs/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/fournisseurs/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.status === 204) return
      return handleResponse(response)
    }
  },

  // Articles
  articles: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/articles/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },
    
    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/articles/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Domaines
  domaines: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/domaines/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },
    
    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/domaines/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/domaines/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/domaines/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/domaines/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.status === 204) return
      return handleResponse(response)
    }
  },

  // Catégories d'articles
  categories: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/categories/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },
    
    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/categories/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/categories/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/categories/${id}/`, {
        method: 'PUT',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async delete(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/categories/${id}/`, {
        method: 'DELETE',
        headers: getAuthHeaders()
      })
      if (response.status === 204) return
      return handleResponse(response)
    }
  },

  // Lots
  lots: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/lots/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/lots/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/lots/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async update(id: string, data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/lots/${id}/`, {
        method: 'PATCH',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async scan(qrCode: string) {
      const response = await fetch(`${API_BASE_URL}/stock/lots/scan/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ qr_code: qrCode })
      })
      return handleResponse(response)
    },

    async marquerOuvert(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/lots/${id}/marquer_ouvert/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Alertes
  alertes: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/alertes/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/alertes/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async marquerTraitee(id: string, commentaire: string) {
      const response = await fetch(`${API_BASE_URL}/stock/alertes/${id}/marquer_traitee/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ commentaire })
      })
      return handleResponse(response)
    },

    async critiques() {
      const response = await fetch(`${API_BASE_URL}/stock/alertes/critiques/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Quarantaines
  quarantaines: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/quarantaines/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/quarantaines/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/quarantaines/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async lever(id: string, decision: string, commentaire: string) {
      const response = await fetch(`${API_BASE_URL}/stock/quarantaines/${id}/lever/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ decision, commentaire })
      })
      return handleResponse(response)
    }
  },

  // Transferts internes
  transferts: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/transferts/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/transferts/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/transferts/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async valider(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/transferts/${id}/valider/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async executer(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/transferts/${id}/executer/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Réceptions
  receptions: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/receptions/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/receptions/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/receptions/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async verifier(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/receptions/${id}/verifier/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async valider(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/receptions/${id}/valider/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async getLignes(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/receptions/${id}/lignes/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Sorties de stock
  sorties: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/sorties/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/sorties/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/sorties/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async valider(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/sorties/${id}/valider/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async annuler(id: string, motif: string) {
      const response = await fetch(`${API_BASE_URL}/stock/sorties/${id}/annuler/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ motif })
      })
      return handleResponse(response)
    }
  },

  // Mouvements de stock (Traçabilité)
  mouvementsStock: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/mouvements/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/mouvements/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async parArticle(articleId: string) {
      const response = await fetch(`${API_BASE_URL}/stock/mouvements/par_article/?article=${articleId}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async parLot(lotId: string) {
      const response = await fetch(`${API_BASE_URL}/stock/mouvements/par_lot/?lot=${lotId}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async tracabiliteComplete(lotId: string) {
      const response = await fetch(`${API_BASE_URL}/stock/mouvements/tracabilite_complete/?lot=${lotId}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Inventaires
  inventaires: {
    async list(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async get(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async create(data: any) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(data)
      })
      return handleResponse(response)
    },

    async demarrer(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/demarrer/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async terminer(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/terminer/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async valider(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/valider/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async annuler(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/annuler/`, {
        method: 'POST',
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async lignes(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/lignes/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async compterLigne(id: string, ligneId: string, quantiteComptee: number, commentaire?: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/compter_ligne/`, {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({ ligne_id: ligneId, quantite_comptee: quantiteComptee, commentaire })
      })
      return handleResponse(response)
    },

    async resume(id: string) {
      const response = await fetch(`${API_BASE_URL}/stock/inventaires/${id}/resume/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  },

  // Statistiques
  statistiques: {
    async stock() {
      const response = await fetch(`${API_BASE_URL}/stock/statistiques/stock/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async mouvements(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/statistiques/mouvements/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async sorties(params?: Record<string, string>) {
      const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
      const response = await fetch(`${API_BASE_URL}/stock/statistiques/sorties/${queryString}`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    },

    async tableauBordComplet() {
      const response = await fetch(`${API_BASE_URL}/stock/dashboard/complet/`, {
        headers: getAuthHeaders()
      })
      return handleResponse(response)
    }
  }
}

// ============================================
// MÉTROLOGIE
// ============================================

export const metrologieAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/metrologie/equipements/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/metrologie/equipements/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/metrologie/equipements/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async etalonnages(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/metrologie/etalonnages/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/metrologie/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// QUALITÉ
// ============================================

export const qualiteAPI = {
  async nonConformites(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/qualite/non-conformites/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/non-conformites/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: number, data: any) {
    const response = await fetch(`${API_BASE_URL}/qualite/non-conformites/${id}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/qualite/non-conformites/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erreur lors de la suppression')
    return true
  },

  async audits(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/qualite/audits/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/qualite/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// REPORTING
// ============================================

export const reportingAPI = {
  async stats() {
    const response = await fetch(`${API_BASE_URL}/reporting/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async generate(type: string, params: any) {
    const response = await fetch(`${API_BASE_URL}/reporting/generate/${type}/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(params)
    })
    return handleResponse(response)
  },

  async rapports(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/reporting/rapports/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// NOTIFICATIONS
// ============================================

export const notificationsAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/${queryString}`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })
    return handleResponse(response)
  },

  async markAsRead(id: number) {
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/${id}/lire/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async markAllAsRead() {
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/tout_lire/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async unreadCount() {
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/non_lues/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/stats/`, {
      headers: getAuthHeaders(),
      cache: 'no-store'
    })
    return handleResponse(response)
  },

  async delete(id: number) {
    const response = await fetch(`${API_BASE_URL}/notifications/notifications/${id}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    if (!response.ok) throw new Error('Erreur lors de la suppression')
    return true
  }
}

// ============================================
// CLIENTS (Admin)
// ============================================

export const clientsAdminAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/clients/clients/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async create(data: any) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(id: string, data: any) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/${id}/`, {
      method: 'PUT',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/clients/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

// ============================================
// DASHBOARD GLOBAL
// ============================================

export const proformaAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async details(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/details_complets/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async stats() {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async telechargerPDF(id: string) {
    try {
      const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/telecharger_pdf/`, {
        method: 'GET',
        headers: getAuthHeaders(),
      })

      const data: { filename: string; content: string } = await handleResponse(response)

      // Décoder le contenu base64 renvoyé par l'API
      const byteCharacters = atob(data.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = data.filename || `Proforma_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur complète téléchargement PDF:', error)
      throw error
    }
  },

  async valider(id: string, notes?: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/valider/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ notes_revision: notes || '' })
    })
    return handleResponse(response)
  },

  async ajusterMontants(id: string, data: {
    montant_ht?: number
    montant_tva?: number
    montant_ttc?: number
    notes_revision?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/ajuster_montants/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async accepter(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/accepter/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async refuser(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/proformas/${id}/refuser/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

export const demandeAnalyseAPI = {
  async list(params?: Record<string, string>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : ''
    const response = await fetch(`${API_BASE_URL}/facturation/demandes-analyses/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async get(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/demandes-analyses/${id}/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async confirmerDepotEchantillons(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/demandes-analyses/${id}/confirmer_depot_echantillons/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async demarrerAnalyse(id: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/demandes-analyses/${id}/demarrer_analyse/`, {
      method: 'POST',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async terminerAnalyse(id: string, observations?: string) {
    const response = await fetch(`${API_BASE_URL}/facturation/demandes-analyses/${id}/terminer_analyse/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify({ observations: observations || '' })
    })
    return handleResponse(response)
  },

  async telechargerRapport(id: string) {
    try {
      const url = `${API_BASE_URL}/facturation/demandes-analyses/${id}/telecharger_rapport/`

      // On utilise handleResponse pour récupérer un JSON { filename, content }
      const response = await fetch(url, {
        method: 'GET',
        headers: getAuthHeaders(),
      })
      const data: { filename: string; content: string } = await handleResponse(response)

      // Décoder le contenu base64 renvoyé par l'API
      const byteCharacters = atob(data.content)
      const byteNumbers = new Array(byteCharacters.length)
      for (let i = 0; i < byteCharacters.length; i++) {
        byteNumbers[i] = byteCharacters.charCodeAt(i)
      }
      const byteArray = new Uint8Array(byteNumbers)
      const blob = new Blob([byteArray], { type: 'application/pdf' })

      const downloadUrl = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = downloadUrl
      a.download = data.filename || `Rapport_${id}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(downloadUrl)
      document.body.removeChild(a)
    } catch (error) {
      console.error('Erreur téléchargement rapport analyse:', error)
      throw error
    }
  }
}

export const adminUsersAPI = {
  async list() {
    const response = await fetch(`${API_BASE_URL}/clients/clients/`, {
      headers: getAuthHeaders()
    })
    const data = await handleResponse(response)
    // Si la réponse est paginée, retourner results, sinon retourner data directement
    return Array.isArray(data) ? data : (data.results || [])
  },

  async create(data: {
    email: string
    first_name: string
    last_name: string
    phone?: string
    role: string
    password: string
  }) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/`, {
      method: 'POST',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async update(userId: string, data: {
    email?: string
    first_name?: string
    last_name?: string
    phone?: string
    role?: string
    password?: string
  }) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/${userId}/`, {
      method: 'PATCH',
      headers: getAuthHeaders(),
      body: JSON.stringify(data)
    })
    return handleResponse(response)
  },

  async delete(userId: string) {
    const response = await fetch(`${API_BASE_URL}/clients/clients/${userId}/`, {
      method: 'DELETE',
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

export const dashboardAPI = {
  async stats() {
    const response = await fetch(`${API_BASE_URL}/core/dashboard/stats/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async kpis() {
    const response = await fetch(`${API_BASE_URL}/core/dashboard/kpis/`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  },

  async activities(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        acc[key] = String(value)
        return acc
      }, {} as Record<string, string>)
    ).toString() : ''
    const response = await fetch(`${API_BASE_URL}/core/dashboard/activities/${queryString}`, {
      headers: getAuthHeaders()
    })
    return handleResponse(response)
  }
}

export default {
  auth: authAPI,
  devis: devisAPI,
  demandes: demandesAPI,
  echantillons: echantillonsAPI,
  essais: essaisAPI,
  factures: facturesAPI,
  proforma: proformaAPI,
  demandeAnalyse: demandeAnalyseAPI,
  stock: stockAPI,
  metrologie: metrologieAPI,
  qualite: qualiteAPI,
  reporting: reportingAPI,
  notifications: notificationsAPI,
  clients: clientsAdminAPI,
  clientsAdmin: clientsAdminAPI,
  adminUsers: adminUsersAPI,
  dashboard: dashboardAPI,
}
