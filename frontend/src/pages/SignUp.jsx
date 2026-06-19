import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import Button from '../components/ui/Button';
import { FiUser, FiBriefcase, FiArrowRight } from 'react-icons/fi';

export default function SignUp() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [selectedRole, setSelectedRole] = useState('STUDENT');
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [companyName, setCompanyName] = useState('');
  const [sector, setSector] = useState('');
  const [city, setCity] = useState('');
  const [program, setProgram] = useState('');
  const [level, setLevel] = useState('2A');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);


  const roles = [
    { value: 'STUDENT', label: 'Étudiant', icon: <FiUser />, description: 'Créer un profil étudiant pseudonymisé' },
    { value: 'ENTERPRISE', label: 'Entreprise', icon: <FiBriefcase />, description: 'Publier des offres de stage' },
  ];

  const currentRole = roles.find(r => r.value === selectedRole);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (password.length < 4) {
      setError('Le mot de passe doit contenir au moins 4 caractères');
      return;
    }
    setLoading(true);
    try {
      const body = { identifier, password, role: selectedRole };
      if (selectedRole === 'ENTERPRISE') {
        body.companyName = companyName;
        body.sector = sector;
        body.city = city;
      } else {
        body.program = program;
        body.level = level;
        body.city = city;
      }
      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(err.message || "Erreur lors de l'inscription");
      }
      const data = await response.json();
      await login(identifier, password, selectedRole);
      navigate(selectedRole === 'ENTERPRISE' ? '/entreprise/offres' : '/');
    } catch (error) {
      if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
        await login(identifier, password, selectedRole);
        navigate(selectedRole === 'ENTERPRISE' ? '/entreprise/offres' : '/');
      } else {
        setError(error.message);
      }
    } finally {
      setLoading(false);
    }
  };


  return (
    <div className="login-split">
      <div className="login-showcase">
        <div style={{ maxWidth: '420px', display: 'flex', flexDirection: 'column', justifyContent: 'flex-start', paddingTop: '2rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '2rem' }}>
            <div style={{ width: 44, height: 44, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'white' }}>G</div>
            <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.5rem', letterSpacing: '-0.04em' }}>Gradify</span>
          </div>
          <h1 style={{ fontSize: '3.5rem', lineHeight: 1.1, marginBottom: '1.5rem', letterSpacing: '-0.06em' }}>
            Rejoignez la<br /><span style={{ opacity: 0.9 }}>plateforme</span>
          </h1>
          <p style={{ fontSize: '1.25rem', lineHeight: 1.7, opacity: 0.85, marginBottom: '2.5rem' }}>
            Créez votre compte pour accéder au matching intelligent
            entre compétences et offres de stage.
          </p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {['Profil pseudonymisé (privacy-by-design)', 'Matching automatique par compétences', 'Publication d\'offres (entreprises)', 'Candidatures en un clic'].map((f, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ width: 28, height: 28, borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.8rem' }}>✓</div>
                <span style={{ fontSize: '1.05rem', opacity: 0.9 }}>{f}</span>
              </div>
            ))}
          </div>
        </div>
      </div>


      <div className="login-form-side">
        <div style={{ maxWidth: '420px', width: '100%', margin: '0 auto' }}>
          <h2 style={{ marginBottom: '0.5rem' }}>Inscription</h2>
          <p className="text-muted" style={{ marginBottom: '2rem' }}>Créez votre compte Gradify.</p>

          <div className="role-selector" style={{ gridTemplateColumns: 'repeat(2, 1fr)' }}>
            {roles.map((role) => (
              <div key={role.value} className={`role-option ${selectedRole === role.value ? 'selected' : ''}`} onClick={() => { setSelectedRole(role.value); setError(''); }}>
                <span className="role-icon">{role.icon}</span>
                <span className="role-label">{role.label}</span>
              </div>
            ))}
          </div>
          <p className="text-sm text-muted" style={{ marginBottom: '1.5rem', textAlign: 'center' }}>{currentRole.description}</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-3">
            <div className="form-group">
              <label>Identifiant</label>
              <input className="input" placeholder={selectedRole === 'ENTERPRISE' ? 'ex: mon-entreprise' : 'Choisissez un identifiant unique'} value={identifier} onChange={(e) => setIdentifier(e.target.value)} required />
            </div>

            {selectedRole === 'ENTERPRISE' && (
              <>
                <div className="form-group">
                  <label>Nom de l'entreprise</label>
                  <input className="input" placeholder="ex: TechSecure SA" value={companyName} onChange={(e) => setCompanyName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Secteur d'activité</label>
                  <input className="input" placeholder="ex: Cybersécurité" value={sector} onChange={(e) => setSector(e.target.value)} required />
                </div>
              </>
            )}

            {selectedRole === 'STUDENT' && (
              <>
                <div className="form-group">
                  <label>Programme / Filière</label>
                  <select className="select" style={{ width: '100%' }} value={program} onChange={(e) => setProgram(e.target.value)} required>
                    <option value="">Choisir une filière</option>
                    <option value="Genie Logiciel">Génie Logiciel</option>
                    <option value="Cybersecurite">Cybersécurité</option>
                    <option value="Genie de la Data">Génie de la Data</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Finance Digitale">Finance Digitale</option>
                    <option value="Business Intelligence">Business Intelligence</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <select className="select" style={{ width: '100%' }} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="1A">1A</option>
                    <option value="2A">2A</option>
                    <option value="3A">3A</option>
                  </select>
                </div>
              </>
            )}

            <div className="form-group">
              <label>Ville</label>
              <input className="input" placeholder="ex: Casablanca" value={city} onChange={(e) => setCity(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Mot de passe</label>
              <input className="input" type="password" placeholder="Min. 4 caractères" value={password} onChange={(e) => setPassword(e.target.value)} required />
            </div>
            <div className="form-group">
              <label>Confirmer le mot de passe</label>
              <input className="input" type="password" placeholder="Répétez le mot de passe" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} required />
            </div>

            {error && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-error-bg)', color: 'var(--status-error)', fontSize: '0.85rem' }}>{error}</div>}

            <Button type="submit" variant="primary" size="lg" disabled={loading} style={{ width: '100%', marginTop: '0.5rem' }} icon={<FiArrowRight />}>
              {loading ? 'Inscription...' : `S'inscrire en tant que ${currentRole.label}`}
            </Button>
          </form>

          <div style={{ marginTop: '1.5rem', textAlign: 'center' }}>
            <span className="text-sm text-muted">Déjà un compte ? </span>
            <Link to="/login" className="text-sm">Se connecter</Link>
          </div>
        </div>
      </div>
    </div>
  );
}
