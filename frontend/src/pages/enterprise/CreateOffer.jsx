import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

export default function CreateOffer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('2A');
  const [compensation, setCompensation] = useState('');
  const [targetPrograms, setTargetPrograms] = useState('');
  const [skillInput, setSkillInput] = useState('');
  const [skills, setSkills] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');


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
    if (skills.length === 0) { setError('Ajoutez au moins une compétence requise'); return; }
    setLoading(true);
    try {
      await offersService.createOffer({
        title, description, city, duration: parseInt(duration),
        level, compensation, targetPrograms, skills, startDate, endDate,
        companyId: user.identifier,
      });
      navigate('/entreprise/offres');
    } catch (err) {
      if (err.message === 'Failed to fetch' || err.name === 'TypeError') {
        navigate('/entreprise/offres');
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors de la création');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div>
      <div className="page-header container">
        <Link to="/entreprise/offres" className="flex items-center gap-1 text-sm" style={{ marginBottom: '1rem', color: 'var(--muted)' }}><FiArrowLeft /> Retour à mes offres</Link>
        <h1>Nouvelle offre de stage</h1>
        <p>Remplissez les informations de votre offre. Les compétences seront modélisées en SKOS.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem', maxWidth: '800px' }}>
        <form onSubmit={handleSubmit}>
          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Informations générales</h4>
            <div className="flex flex-col gap-3">
              <div className="form-group">
                <label>Titre du poste</label>
                <input className="input" placeholder="ex: Développeur Full-Stack" value={title} onChange={(e) => setTitle(e.target.value)} required />
              </div>
              <div className="form-group">
                <label>Description</label>
                <textarea className="textarea" style={{ minHeight: '120px' }} placeholder="Décrivez le stage, les missions, l'environnement..." value={description} onChange={(e) => setDescription(e.target.value)} required />
              </div>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Ville</label>
                  <input className="input" placeholder="ex: Casablanca" value={city} onChange={(e) => setCity(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Durée (mois)</label>
                  <input className="input" type="number" min="1" max="12" placeholder="ex: 3" value={duration} onChange={(e) => setDuration(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Niveau requis</label>
                  <select className="select" style={{ width: '100%' }} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="2A">2A</option>
                    <option value="3A">3A</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-3">
                <div className="form-group">
                  <label>Rémunération</label>
                  <input className="input" placeholder="ex: 3 000 MAD/mois" value={compensation} onChange={(e) => setCompensation(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Date début</label>
                  <input className="input" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Date fin</label>
                  <input className="input" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} required />
                </div>
              </div>
              <div className="form-group">
                <label>Filières ciblées</label>
                <input className="input" placeholder="ex: Genie Logiciel | Cybersecurite" value={targetPrograms} onChange={(e) => setTargetPrograms(e.target.value)} />
              </div>
            </div>
          </Card>

          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Compétences requises (SKOS)</h4>
            <div className="flex items-center gap-1" style={{ marginBottom: '1rem' }}>
              <input className="input" style={{ flex: 1 }} placeholder="Ajouter une compétence (ex: Python, Docker, React...)" value={skillInput} onChange={(e) => setSkillInput(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); addSkill(); } }} />
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
            {skills.length === 0 && <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Aucune compétence ajoutée</p>}
          </Card>

          {error && <div style={{ padding: '0.75rem 1rem', borderRadius: 'var(--radius-sm)', background: 'var(--status-error-bg)', color: 'var(--status-error)', fontSize: '0.85rem', marginBottom: '1rem' }}>{error}</div>}

          <div className="flex items-center justify-between">
            <Link to="/entreprise/offres"><Button type="button" variant="ghost">Annuler</Button></Link>
            <Button type="submit" variant="primary" size="lg" disabled={loading} icon={<FiSave />}>
              {loading ? 'Publication...' : 'Publier l\'offre'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
