import api from './api';

/**
 * Service pour le matching compétences étudiant ↔ offre.
 * Communique avec matching-service via le gateway.
 */
const matchingService = {
  /**
   * Calculer le score de matching entre un étudiant et une offre
   */
  computeScore: async (studentId, offerId) => {
    const response = await api.post('/matching/score', { studentId, offerId });
    return response.data;
  },

  /**
   * Trouver les étudiants compatibles avec une offre
   */
  findStudentsForOffer: async (offerId, page = 1, size = 10) => {
    const response = await api.get(`/matching/offer/${offerId}/students?page=${page}&size=${size}`);
    return response.data;
  },

  /**
   * Trouver les offres compatibles avec un étudiant
   */
  findOffersForStudent: async (studentId, page = 1, size = 10) => {
    const response = await api.get(`/matching/student/${studentId}/offers?page=${page}&size=${size}`);
    return response.data;
  },
};

export default matchingService;
