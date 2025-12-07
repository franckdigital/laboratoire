/**
 * Configuration API pour LANEMA
 */

export const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

// Endpoints d'authentification
export const AUTH_ENDPOINTS = {
  register: `${API_BASE_URL}/clients/auth/register/`,
  login: `${API_BASE_URL}/clients/auth/login/`,
  profile: `${API_BASE_URL}/clients/auth/profile/`,
  profileUpdate: `${API_BASE_URL}/clients/auth/profile/update/`,
  logout: `${API_BASE_URL}/clients/auth/logout/`,
}

// Endpoints demandes de devis
export const DEVIS_ENDPOINTS = {
  list: `${API_BASE_URL}/demandes/devis/`,
  create: `${API_BASE_URL}/demandes/devis/`,
  detail: (id: string) => `${API_BASE_URL}/demandes/devis/${id}/`,
  accepter: (id: string) => `${API_BASE_URL}/demandes/devis/${id}/accepter/`,
  refuser: (id: string) => `${API_BASE_URL}/demandes/devis/${id}/refuser/`,
  mesDemandes: `${API_BASE_URL}/demandes/devis/mes_demandes/`,
  stats: `${API_BASE_URL}/demandes/dashboard/stats/`,
}

// Helper pour ajouter le token JWT aux requêtes
export const getAuthHeaders = () => {
  const token = localStorage.getItem('lanema_token')
  return {
    'Content-Type': 'application/json',
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}

// Helper pour les requêtes avec fichiers
export const getAuthHeadersMultipart = () => {
  const token = localStorage.getItem('lanema_token')
  return {
    ...(token && { 'Authorization': `Bearer ${token}` })
  }
}
