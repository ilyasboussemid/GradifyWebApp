import api from './api';

/**
 * Service pour les offres de stage.
 * Communique avec offer-service via le gateway.
 */
const offersService = {
  /**
   * Rechercher des offres avec filtres
   */
  search: async ({ skill, company, program, city, page = 1, size = 10 } = {}) => {
    const params = new URLSearchParams();
    if (skill) params.append('skill', skill);
    if (company) params.append('company', company);
    if (program) params.append('program', program);
    if (city) params.append('city', city);
    params.append('page', page);
    params.append('size', size);

    const response = await api.get(`/offers/search?${params.toString()}`);
    return response.data;
  },

  /**
   * Récupérer le détail d'une offre par ID
   */
  getById: async (offerId) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  /**
   * Récupérer les filtres disponibles (compétences, villes, entreprises)
   */
  getFilters: async () => {
    const response = await api.get('/offers/filters');
    return response.data;
  },
};

export default offersService;
