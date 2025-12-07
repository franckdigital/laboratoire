import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

// IMPORTANT: Changez cette URL pour votre serveur backend
const API_BASE_URL = 'http://192.168.1.100:8000/api'; // Remplacez par l'IP de votre serveur

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Intercepteur pour ajouter le token aux requêtes
api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@lab_manager:token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Authentication
export const authAPI = {
  login: async (email: string, password: string) => {
    const response = await api.post('/clients/auth/login/', { email, password });
    return response.data;
  },
  logout: async () => {
    const response = await api.post('/clients/auth/logout/');
    return response.data;
  },
  getProfile: async () => {
    const response = await api.get('/clients/auth/profile/');
    return response.data;
  },
};

// Stock - Articles
export const stockAPI = {
  // Articles
  listArticles: async (params?: any) => {
    const response = await api.get('/stock/articles/', { params });
    return response.data;
  },
  getArticle: async (id: string) => {
    const response = await api.get(`/stock/articles/${id}/`);
    return response.data;
  },
  scanArticle: async (qrCode: string) => {
    const response = await api.post('/stock/articles/scan/', { qr_code: qrCode });
    return response.data;
  },

  // Lots
  listLots: async (params?: any) => {
    const response = await api.get('/stock/lots/', { params });
    return response.data;
  },
  getLot: async (id: string) => {
    const response = await api.get(`/stock/lots/${id}/`);
    return response.data;
  },
  scanLot: async (qrCode: string) => {
    const response = await api.post('/stock/lots/scan/', { qr_code: qrCode });
    return response.data;
  },
  marquerOuvert: async (lotId: string) => {
    const response = await api.post(`/stock/lots/${lotId}/marquer_ouvert/`);
    return response.data;
  },

  // Réceptions
  listReceptions: async (params?: any) => {
    const response = await api.get('/stock/receptions/', { params });
    return response.data;
  },
  createReception: async (data: any) => {
    const response = await api.post('/stock/receptions/', data);
    return response.data;
  },
  getReception: async (id: string) => {
    const response = await api.get(`/stock/receptions/${id}/`);
    return response.data;
  },

  // Mouvements
  listMouvements: async (params?: any) => {
    const response = await api.get('/stock/mouvements/', { params });
    return response.data;
  },
  createMouvement: async (data: any) => {
    const response = await api.post('/stock/mouvements/', data);
    return response.data;
  },

  // Inventaires
  listInventaires: async (params?: any) => {
    const response = await api.get('/stock/inventaires/', { params });
    return response.data;
  },
  createInventaire: async (data: any) => {
    const response = await api.post('/stock/inventaires/', data);
    return response.data;
  },
  addLigneInventaire: async (inventaireId: string, data: any) => {
    const response = await api.post(`/stock/inventaires/${inventaireId}/lignes/`, data);
    return response.data;
  },

  // Alertes
  listAlertes: async (params?: any) => {
    const response = await api.get('/stock/alertes/', { params });
    return response.data;
  },
  marquerTraitee: async (alerteId: string, commentaire?: string) => {
    const response = await api.post(`/stock/alertes/${alerteId}/marquer_traitee/`, { commentaire });
    return response.data;
  },

  // Quarantaine
  listQuarantaines: async (params?: any) => {
    const response = await api.get('/stock/quarantaines/', { params });
    return response.data;
  },
  createQuarantaine: async (data: any) => {
    const response = await api.post('/stock/quarantaines/', data);
    return response.data;
  },
  leverQuarantaine: async (quarantaineId: string, decision: string, commentaire: string) => {
    const response = await api.post(`/stock/quarantaines/${quarantaineId}/lever/`, { decision, commentaire });
    return response.data;
  },

  // Entrepôts et Emplacements
  listEntrepots: async () => {
    const response = await api.get('/stock/entrepots/');
    return response.data;
  },
  listEmplacements: async (entrepotId?: string) => {
    const params = entrepotId ? { entrepot: entrepotId } : {};
    const response = await api.get('/stock/emplacements/', { params });
    return response.data;
  },
  scanEmplacement: async (qrCode: string) => {
    const response = await api.post('/stock/emplacements/scan/', { qr_code: qrCode });
    return response.data;
  },

  // Transferts internes
  listTransferts: async (params?: any) => {
    const response = await api.get('/stock/transferts/', { params });
    return response.data;
  },
  createTransfert: async (data: any) => {
    const response = await api.post('/stock/transferts/', data);
    return response.data;
  },
  validerTransfert: async (transfertId: string) => {
    const response = await api.post(`/stock/transferts/${transfertId}/valider/`);
    return response.data;
  },
  executerTransfert: async (transfertId: string) => {
    const response = await api.post(`/stock/transferts/${transfertId}/executer/`);
    return response.data;
  },
};

// Dashboard & Statistics
export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/stock/dashboard/stats/');
    return response.data;
  },
  getAlertesCritiques: async () => {
    const response = await api.get('/stock/dashboard/alertes-critiques/');
    return response.data;
  },
};

export default api;
