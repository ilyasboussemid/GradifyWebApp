import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { FiUser, FiBriefcase, FiShield, FiArrowRight, FiBookOpen } from 'react-icons/fi';
export default function Login() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const roles = [
    {
      value: 'STUDENT',
      label: 'Étudiant',
      icon: <FiUser />,
      description: 'Accéder à votre profil et aux offres compatibles',
      placeholder: 'ID pseudonymisé (ex: student-0224012b)',
    },
    {
      value: 'ENTERPRISE',
      label: 'Entreprise',
      icon: <FiBriefcase />,
      description: 'Gérer vos offres et voir les candidats compatibles',
      placeholder: 'Identifiant entreprise',
    },
    {
      value: 'ADMIN',
      label: 'Admin',
      icon: <FiShield />,
      description: 'Tableau de bord, conformité SHACL et logs',
      placeholder: 'Identifiant administrateur',
    },
  ];
  const currentRole = roles.find(r => r.value === selectedRole);
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(identifier, password, selectedRole);
      if (result.success) {
        if (selectedRole === 'ADMIN') {
          navigate('/admin');
        } else if (selectedRole === 'ENTERPRISE') {
          navigate('/offres');
        } else {
          navigate('/');
        }
      } else {
        setError(result.error || 'Identifiants invalides');
      }
    } catch (err) {
      setError('Erreur de connexion. Veuillez réessayer.');
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="login-split">
      <div className="login-showcase">
        <div style={{ maxWidth: '420px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '3rem' }}>
            <div style={{
              width: 44,
              height: 44,
              borderRadius: '50%',
              background: 'rgba(255,255,255,0.2)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.2rem',
              color: 'white',
            }}>
              G
            </div>
            <span style={{
              fontFamily: 'var(--font-display)',
              fontWeight: 700,
              fontSize: '1.5rem',
              letterSpacing: '-0.04em',
            }}>
              Gradify
            </span>
          </div>
          <h1 style={{ fontSize: '2.25rem', lineHeight: 1.15, marginBottom: '1.25rem', letterSpacing: '-0.05em' }}>
            Plateforme de
            <br />
            <span style={{ opacity: 0.9 }}>Données Liées</span>
          </h1>
          <p style={{ fontSize: '1.05rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '2.5rem' }}>
            Explorez le Knowledge Graph qui connecte étudiants, compétences
            et offres de stage grâce aux technologies du Web Sémantique.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
            {[
              'Matching intelligent par compétences SKOS',
              'Données conformes SHACL (validées)',
              'Privacy-by-design — profils pseudonymisés',
              'Requêtes SPARQL transparentes',
            ].map((feature, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{
                  width: 24,
                  height: 24,
                  borderRadius: '50%',
                  background: 'rgba(255,255,255,0.2)',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: '0.7rem',
                }}>
                  ✓
                </div>
                <span style={{ fontSize: '0.9rem', opacity: 0.9 }}>{feature}</span>
              </div>
            ))}
          </div>
          <div style={{
            marginTop: '3rem',
            padding: '1rem 1.25rem',
            background: 'rgba(255,255,255,0.1)',
            borderRadius: 'var(--radius-md)',
            border: '1px solid rgba(255,255,255,0.15)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
              <FiBookOpen style={{ fontSize: '0.9rem' }} />
              <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                Projet Académique S4
              </span>
            </div>
            <span style={{ fontSize: '0.8rem', opacity: 0.8 }}>
              Web Sémantique · Linked Open Data · Knowledge Graphs
            </span>
          </div>
        </div>
      </div>
      <div className="login-form-side">
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Connexion</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>
            Sélectionnez votre rôle et connectez-vous à la plateforme.
          </p>
          <div className="role-selector">
            {roles.map((role) => (
              <div
                key={role.value}
                className={`role-option ${selectedRole === role.value ? 'selected' : ''}`}
                onClick={() => {
                  setSelectedRole(role.value);
                  setError('');
                }}
              >
                <span className="role-icon">{role.icon}</span>
                <span className="role-label">{role.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>
            {currentRole.description}
          </p>
          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="form-group">
              <label htmlFor="identifier">Identifiant</label>
              <input
                id="identifier"
                type="text"
                className="input"
                placeholder={currentRole.placeholder}
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                id="password"
                type="password"
                className="input"
                placeholder="Votre mot de passe"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && (
              <div style={{
                padding: '0.75rem 1rem',
                borderRadius: 'var(--radius-sm)',
                background: 'var(--status-error-bg)',
                color: 'var(--status-error)',
                fontSize: '0.85rem',
                fontWeight: 500,
              }}>
                {error}
              </div>
            )}
            <Button
              type="submit"
              variant="primary"
              size="lg"
              disabled={loading || !identifier || !password}
              style={{ width: '100%', marginTop: '0.5rem' }}
              icon={<FiArrowRight />}
            >
              {loading ? 'Connexion en cours…' : `Se connecter en tant que ${currentRole.label}`}
            </Button>
          </form>
          <div style={{
            marginTop: '2rem',
            padding: '1rem',
            background: 'var(--accent-light)',
            borderRadius: 'var(--radius-md)',
            fontSize: '0.8rem',
            color: 'var(--muted)',
            lineHeight: 1.6,
          }}>
            <strong style={{ color: 'var(--text)' }}>Mode démo :</strong> Si le backend n'est pas connecté,
            n'importe quel identifiant/mot de passe sera accepté pour explorer l'interface.
            <br /><br />
            <strong style={{ color: 'var(--text)' }}>Privacy :</strong> Les profils étudiants sont pseudonymisés.
            Aucune donnée personnelle identifiable n'est stockée ni affichée.
          </div>
          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className="text-sm text-muted">Pas encore de compte ? </span>
            <Link to="/signup" style={{ fontSize: '0.85rem' }}>S'inscrire</Link>
            <br />
            <Link to="/" style={{ fontSize: '0.85rem', marginTop: '0.5rem', display: 'inline-block' }}>
              ← Retour à l'accueil
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
