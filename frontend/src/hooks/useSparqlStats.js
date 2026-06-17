import { useState, useEffect } from 'react';
import sparqlService from '../services/sparqlService';

/**
 * Hook pour charger les statistiques live depuis SPARQL (page d'accueil).
 * Retourne les compteurs + état de chargement.
 */
export default function useSparqlStats() {
  const [stats, setStats] = useState({
    students: 0,
    offers: 0,
    companies: 0,
    skills: 0,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    async function fetchStats() {
      try {
        setLoading(true);
        const data = await sparqlService.getStats();
        setStats(data);
      } catch (err) {
        setError(err.message);
        // Données de démo si le backend n'est pas accessible
        setStats({
          students: 150,
          offers: 45,
          companies: 12,
          skills: 87,
        });
      } finally {
        setLoading(false);
      }
    }
    fetchStats();
  }, []);

  return { stats, loading, error };
}
