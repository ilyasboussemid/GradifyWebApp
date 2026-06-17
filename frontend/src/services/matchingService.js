import api from './api';
const matchingService = {
  computeScore: async (studentId, offerId) => {
    const response = await api.post('/matching/score', { studentId, offerId });
    return response.data;
  },
  findStudentsForOffer: async (offerId, page = 1, size = 10) => {
    const response = await api.get(`/matching/offer/${offerId}/students?page=${page}&size=${size}`);
    return response.data;
  },
  findOffersForStudent: async (studentId, page = 1, size = 10) => {
    const response = await api.get(`/matching/student/${studentId}/offers?page=${page}&size=${size}`);
    return response.data;
  },
};
export default matchingService;
