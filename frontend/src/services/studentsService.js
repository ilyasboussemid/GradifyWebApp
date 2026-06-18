import api from './api';
const studentsService = {
  getById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },
  list: async ({ program, level, page = 1, size = 10 } = {}) => {
    const params = new URLSearchParams();
    if (program) params.append('program', program);
    if (level) params.append('level', level);
    params.append('page', page);
    params.append('size', size);
    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
  },

  updateProfile: async (studentId, data) => {
    const response = await api.put(`/students/${studentId}`, data);
    return response.data;
  },
};
export default studentsService;
