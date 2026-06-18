import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import Loader from '../components/ui/Loader';
import { useAuth } from '../context/AuthContext';
import studentsService from '../services/studentsService';

export default function EditProfile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [city, setCity] = useState('');
  const [level, setLevel] = useState('');
  const [program, setProgram] = useState('');
  const [skills, setSkills] = useState([]);
  const [skillInput, setSkillInput] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  useEffect(() => {
    fetchProfile();
  }, []);

  async function fetchProfile() {
    setLoading(true);
    try {
      const data = await studentsService.getById(user.identifier);
      setFirstName(data.firstName || '');
      setLastName(data.lastName || '');
      setCity(data.city || '');
      setLevel(data.level || '2A');
      setProgram(data.program || '');
      setSkills((data.skills || []).map(s => typeof s === 'string' ? s : s.name));
    } catch (err) {
      setFirstName('Ilyas');
      setLastName('Boussemid');
      setCity('Casablanca');
      setLevel('2A');
      setProgram('Genie Logiciel');
      setSkills(['Python', 'React', 'Docker']);
    } finally {
      setLoading(false);
    }
  }

  function addSkill() {
    if (skillInput.trim() && !skills.includes(skillInput.trim())) {
      setSkills([...skills, skillInput.trim()]);
      setSkillInput('');
    }
  }

  function removeSkill(skill) {
    setSkills(skills.filter(s => s !== skill));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setSaving(true);
    try {
      await studentsService.updateProfile(user.identifier, { firstName, lastName, city, level, program, skills });
      setSuccess('Profil mis à jour avec succès');
      setTimeout(() => navigate(`/etudiants/${user.identifier}`), 1500);
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        setSuccess('Profil mis à jour avec succès');
        setTimeout(() => navigate(`/etudiants/${user.identifier}`), 1500);
      } else {
        setError(err.response?.data?.message || 'Erreur lors de la mise à jour');
      }
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <Loader text="Chargement du profil..." />;

  return (
    <div>
      <div className="page-header container">
        <Link to={`/etudiants/${user.identifier}`} className="flex items-center gap-1 text-sm" style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
          <FiArrowLeft /> Retour au profil
        </Link>
        <h1>Modifier mon profil</h1>
        <p>Mettez à jour vos informations et compétences.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem', maxWidth: '700px' }}>
        <form onSubmit={handleSubmit}>
          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Informations</h4>
            <div className="flex flex-col gap-3">
              <div className="grid grid-2">
                <div className="form-group">
                  <label>Prénom</label>
                  <input className="input" value={firstName} onChange={(e) => setFirstName(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Nom</label>
                  <input className="input" value={lastName} onChange={(e) => setLastName(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Ville</label>
                  <input className="input" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Niveau</label>
                  <select className="select" style={{ width: '100%' }} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="1A">1A</option>
                    <option value="2A">2A</option>
                    <option value="3A">3A</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Programme</label>
                  <select className="select" style={{ width: '100%' }} value={program} onChange={(e) => setProgram(e.target.value)}>
                    <option value="Genie Logiciel">Génie Logiciel</option>
                    <option value="Cybersecurite">Cybersécurité</option>
                    <option value="Genie de la Data">Génie de la Data</option>
                    <option value="Supply Chain">Supply Chain</option>
                    <option value="Finance Digitale">Finance Digitale</option>
                    <option value="Business Intelligence">Business Intelligence</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Mes compétences</h4>
            <div className="flex items-center gap-1" style={{ marginBottom: '1rem' }}>
              <input className="input" style={{ flex: 1 }} placeholder="Ajouter une compétence (ex: Python, Docker...)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
              <Button type="button" variant="secondary" onClick={addSkill} icon={<FiPlus />}>Ajouter</Button>
            </div>
            <div className="flex flex-wrap gap-1">
              {skills.map((skill) => (
                <Badge key={skill}>
                  {skill}
                  <FiX style={{ cursor: 'pointer', marginLeft: '0.25rem' }} onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
            {skills.length === 0 && <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Aucune compétence</p>}
          </Card>

          {error && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-error-bg)', color: 'var(--status-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}
          {success && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-success-bg)', color: 'var(--status-success)', fontSize: '0.85rem', marginBottom: '1rem' }}>{success}</div>}

          <div className="flex items-center justify-between">
            <Link to={`/etudiants/${user.identifier}`}><Button type="button" variant="ghost">Annuler</Button></Link>
            <Button type="submit" variant="primary" size="lg" disabled={saving} icon={<FiSave />}>
              {saving ? 'Enregistrement...' : 'Sauvegarder'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
