import { useAuth as useAuthContext } from '../context/AuthContext';

/**
 * Re-export du hook useAuth pour faciliter l'import
 */
export default function useAuth() {
  return useAuthContext();
}
