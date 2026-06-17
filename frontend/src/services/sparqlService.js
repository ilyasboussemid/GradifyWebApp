import api from './api';

/**
 * Service pour l'explorateur SPARQL.
 * Communique avec sparql-explorer-service via le gateway.
 */
const sparqlService = {
  /**
   * Récupérer les statistiques globales (home page)
   */
  getStats: async () => {
    const response = await api.get('/sparql/stats');
    return response.data;
  },

  /**
   * Exécuter une requête SPARQL arbitraire
   */
  execute: async (query, format = 'json') => {
    const response = await api.post('/sparql/execute', { query, format });
    return response.data;
  },

  /**
   * Récupérer la liste des templates prédéfinis
   */
  getTemplates: async () => {
    const response = await api.get('/sparql/templates');
    return response.data;
  },
};

export default sparqlService;
