import AsyncStorage from '@react-native-async-storage/async-storage';
import axios from 'axios';

const API_BASE_URL = 'http://192.168.1.100:8000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await AsyncStorage.getItem('@lab_manager:token');
    if (token) {
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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

export const stockAPI = {
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

  listMouvements: async (params?: any) => {
    const response = await api.get('/stock/mouvements/', { params });
    return response.data;
  },
  createMouvement: async (data: any) => {
    const response = await api.post('/stock/mouvements/', data);
    return response.data;
  },

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

  listAlertes: async (params?: any) => {
    const response = await api.get('/stock/alertes/', { params });
    return response.data;
  },
  marquerTraitee: async (alerteId: string, commentaire?: string) => {
    const response = await api.post(`/stock/alertes/${alerteId}/marquer_traitee/`, { commentaire });
    return response.data;
  },

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

  // Sorties de stock
  listSorties: async (params?: any) => {
    const response = await api.get('/stock/sorties/', { params });
    return response.data;
  },
  getSortie: async (id: string) => {
    const response = await api.get(`/stock/sorties/${id}/`);
    return response.data;
  },
  createSortie: async (data: { lot: number; quantite: number; type_sortie: string; motif?: string; demande_devis?: number }) => {
    const response = await api.post('/stock/sorties/', data);
    return response.data;
  },
  validerSortie: async (sortieId: string) => {
    const response = await api.post(`/stock/sorties/${sortieId}/valider/`);
    return response.data;
  },
  annulerSortie: async (sortieId: string) => {
    const response = await api.post(`/stock/sorties/${sortieId}/annuler/`);
    return response.data;
  },

  // Mouvements de stock (traçabilité)
  listMouvements: async (params?: any) => {
    const response = await api.get('/stock/mouvements/', { params });
    return response.data;
  },
  getMouvementsParArticle: async (articleId: string) => {
    const response = await api.get('/stock/mouvements/par_article/', { params: { article_id: articleId } });
    return response.data;
  },
  getMouvementsParLot: async (lotId: string) => {
    const response = await api.get('/stock/mouvements/par_lot/', { params: { lot_id: lotId } });
    return response.data;
  },
  getTracabiliteComplete: async (lotId: string) => {
    const response = await api.get('/stock/mouvements/tracabilite_complete/', { params: { lot_id: lotId } });
    return response.data;
  },
};

export const dashboardAPI = {
  getStats: async () => {
    const response = await api.get('/stock/dashboard/stats/');
    return response.data;
  },
  getAlertesCritiques: async () => {
    const response = await api.get('/stock/alertes/', { params: { traitee: false, niveau_priorite: 'CRITIQUE' } });
    return response.data;
  },
  getTableauBordComplet: async () => {
    const response = await api.get('/stock/dashboard/complet/');
    return response.data;
  },
};

export const statistiquesAPI = {
  getStockStats: async () => {
    const response = await api.get('/stock/statistiques/stock/');
    return response.data;
  },
  getMouvementsStats: async (periode?: string) => {
    const response = await api.get('/stock/statistiques/mouvements/', { params: { periode } });
    return response.data;
  },
  getSortiesStats: async (periode?: string) => {
    const response = await api.get('/stock/statistiques/sorties/', { params: { periode } });
    return response.data;
  },
};

export const devisAPI = {
  mesDemandes: async (params?: any) => {
    const response = await api.get('/demandes/devis/mes_demandes/', { params });
    return response.data;
  },
  stats: async () => {
    const response = await api.get('/demandes/dashboard/stats/', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
};

export const proformaAPI = {
  list: async (params?: any) => {
    const response = await api.get('/facturation/proformas/', { params });
    return response.data;
  },
  accepter: async (id: string) => {
    const response = await api.post(`/facturation/proformas/${id}/accepter/`);
    return response.data;
  },
  refuser: async (id: string) => {
    const response = await api.post(`/facturation/proformas/${id}/refuser/`);
    return response.data;
  },
  telechargerPDF: async (id: string) => {
    const response = await api.get(`/facturation/proformas/${id}/telecharger_pdf/`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};

export const demandeAnalyseAPI = {
  list: async (params?: any) => {
    const response = await api.get('/facturation/demandes-analyses/', { params });
    return response.data;
  },
  telechargerRapport: async (id: string) => {
    const response = await api.get(`/facturation/demandes-analyses/${id}/telecharger_rapport/`, {
      responseType: 'arraybuffer',
    });
    return response.data;
  },
};

export const notificationsAPI = {
  list: async (params?: any) => {
    const response = await api.get('/notifications/notifications/', {
      params,
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
  stats: async () => {
    const response = await api.get('/notifications/notifications/stats/', {
      headers: { 'Cache-Control': 'no-cache' },
    });
    return response.data;
  },
  marquerCommeLue: async (id: string) => {
    const response = await api.post(`/notifications/notifications/${id}/marquer_comme_lu/`);
    return response.data;
  },
};

export const facturesAPI = {
  list: async (params?: any) => {
    const response = await api.get('/facturation/factures/', { params });
    return response.data;
  },
};

export default api;
