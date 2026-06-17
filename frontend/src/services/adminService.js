import api from './api';

/**
 * Service pour les fonctionnalités admin.
 * Communique avec auth-admin-service via le gateway.
 * Endpoints protégés par JWT + rôle ADMIN.
 */
const adminService = {
  /**
   * Récupérer le rapport de conformité SHACL
   */
  getShaclReport: async () => {
    const response = await api.get('/admin/shacl/report');
    return response.data;
  },

  /**
   * Récupérer les logs d'accès aux endpoints
   */
  getLogs: async (page = 1, size = 50) => {
    const response = await api.get(`/admin/logs?page=${page}&size=${size}`);
    return response.data;
  },
};

export default adminService;
