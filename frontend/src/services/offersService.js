import api from './api';

const offersService = {
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

  getById: async (offerId) => {
    const response = await api.get(`/offers/${offerId}`);
    return response.data;
  },

  getFilters: async () => {
    const response = await api.get('/offers/filters');
    return response.data;
  },

  getMyOffers: async () => {
    const response = await api.get('/offers/mine');
    return response.data;
  },

  createOffer: async (offerData) => {
    const response = await api.post('/offers', offerData);
    return response.data;
  },

  updateOffer: async (offerId, offerData) => {
    const response = await api.put(`/offers/${offerId}`, offerData);
    return response.data;
  },

  deleteOffer: async (offerId) => {
    const response = await api.delete(`/offers/${offerId}`);
    return response.data;
  },

  applyToOffer: async (offerId) => {
    const response = await api.post(`/offers/${offerId}/apply`);
    return response.data;
  },

  getApplications: async (offerId) => {
    const response = await api.get(`/offers/${offerId}/applications`);
    return response.data;
  },

  getMyApplications: async () => {
    const response = await api.get('/offers/my-applications');
    return response.data;
  },
};

export default offersService;
