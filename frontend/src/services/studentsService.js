import api from './api';

/**
 * Service pour les profils étudiants (pseudonymisés).
 * Communique avec student-service via le gateway.
 */
const studentsService = {
  /**
   * Récupérer le profil d'un étudiant par ID pseudonymisé
   */
  getById: async (studentId) => {
    const response = await api.get(`/students/${studentId}`);
    return response.data;
  },

  /**
   * Lister les étudiants avec filtres
   */
  list: async ({ program, level, page = 1, size = 10 } = {}) => {
    const params = new URLSearchParams();
    if (program) params.append('program', program);
    if (level) params.append('level', level);
    params.append('page', page);
    params.append('size', size);

    const response = await api.get(`/students?${params.toString()}`);
    return response.data;
  },
};

export default studentsService;
