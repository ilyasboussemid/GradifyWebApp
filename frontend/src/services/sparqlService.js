import api from './api';
const sparqlService = {
  getStats: async () => {
    const response = await api.get('/sparql/stats');
    return response.data;
  },
  execute: async (query, format = 'json') => {
    const response = await api.post('/sparql/execute', { query, format });
    return response.data;
  },
  getTemplates: async () => {
    const response = await api.get('/sparql/templates');
    return response.data;
  },
};
export default sparqlService;
