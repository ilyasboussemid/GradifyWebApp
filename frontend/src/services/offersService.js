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
};
export default offersService;
