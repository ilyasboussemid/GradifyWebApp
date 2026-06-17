import api from './api';
const adminService = {
  getShaclReport: async () => {
    const response = await api.get('/admin/shacl/report');
    return response.data;
  },
  getLogs: async (page = 1, size = 50) => {
    const response = await api.get(`/admin/logs?page=${page}&size=${size}`);
    return response.data;
  },
};
export default adminService;
