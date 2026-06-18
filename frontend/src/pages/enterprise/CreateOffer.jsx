import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { FiArrowLeft, FiSave, FiPlus, FiX } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

const AVAILABLE_SKILLS = [
  'Python', 'Java', 'C#', 'JavaScript', 'TypeScript',
  'React', 'Vue.js', 'Angular', 'Node.js', 'Spring Boot', 'PHP/Laravel',
  'Docker', 'Kubernetes', 'Terraform', 'Ansible', 'CI/CD', 'AWS', 'Azure',
  'SQL', 'MongoDB', 'PostgreSQL', 'Power BI', 'Tableau',
  'PyTorch', 'TensorFlow', 'NLP', 'Hugging Face', 'Machine Learning',
  'Pentest', 'OWASP', 'Cryptographie', 'Kali Linux', 'ISO 27001',
  'Linux', 'Wireshark', 'Active Directory', 'Sécurité réseau',
  'Agile/Scrum', 'Git', 'UML', 'Gestion de projet',
  'ERP', 'SAP', 'Supply Chain', 'Modélisation financière',
  'Data Warehouse', 'Snowflake', 'Apache Spark', 'ETL',
];

const AVAILABLE_PROGRAMS = [
  'Genie Logiciel',
  'Cybersecurite',
  'Genie de la Data',
  'Supply Chain',
  'Finance Digitale',
  'Business Intelligence',
];

export default function CreateOffer() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [city, setCity] = useState('');
  const [duration, setDuration] = useState('');
  const [level, setLevel] = useState('2A');
  const [compensation, setCompensation] = useState('');
  const [selectedPrograms, setSelectedPrograms] = useState([]);
  const [skills, setSkills] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [skillSearch, setSkillSearch] = useState('');

  const filteredSkills = AVAILABLE_SKILLS.filter(s =>
    s.toLowerCase().includes(skillSearch.toLowerCase()) && !skills.includes(s)
  );

  function addSkill(skill) {
    if (!skills.includes(skill)) {
      setSkills([...skills, skill]);
      setSkillSearch('');
    }
  }

  function removeSkill(skill) {
    setSkills(skills.filter(s => s !== skill));
  }

  function toggleProgram(prog) {
    if (selectedPrograms.includes(prog)) {
      setSelectedPrograms(selectedPrograms.filter(p => p !== prog));
    } else {
      setSelectedPrograms([...selectedPrograms, prog]);
    }
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    if (skills.length === 0) { setError('Sélectionnez au moins une compétence requise'); return; }
    setLoading(true);
    try {
      await offersService.createOffer({
        title, description, city, duration: parseInt(duration),
        level, compensation,
        targetPrograms: selectedPrograms.join(' | '),
        skills, startDate, endDate,
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
        <p>Remplissez les informations de votre offre.</p>
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
                  <select className="select" style={{ width: '100%' }} value={city} onChange={(e) => setCity(e.target.value)} required>
                    <option value="">Choisir une ville</option>
                    <option value="Casablanca">Casablanca</option>
                    <option value="Rabat">Rabat</option>
                    <option value="Tanger">Tanger</option>
                    <option value="Marrakech">Marrakech</option>
                    <option value="Fès">Fès</option>
                    <option value="Oujda">Oujda</option>
                    <option value="Kenitra">Kenitra</option>
                    <option value="Agadir">Agadir</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Durée (mois)</label>
                  <select className="select" style={{ width: '100%' }} value={duration} onChange={(e) => setDuration(e.target.value)} required>
                    <option value="">Choisir</option>
                    <option value="1">1 mois</option>
                    <option value="2">2 mois</option>
                    <option value="3">3 mois</option>
                    <option value="4">4 mois</option>
                    <option value="5">5 mois</option>
                    <option value="6">6 mois</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>Niveau requis</label>
                  <select className="select" style={{ width: '100%' }} value={level} onChange={(e) => setLevel(e.target.value)}>
                    <option value="1A">1A</option>
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
            </div>
          </Card>

          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Filières ciblées</h4>
            <div className="flex flex-wrap gap-1">
              {AVAILABLE_PROGRAMS.map((prog) => (
                <Badge
                  key={prog}
                  style={{
                    cursor: 'pointer',
                    background: selectedPrograms.includes(prog) ? 'var(--accent)' : 'var(--accent-soft)',
                    color: selectedPrograms.includes(prog) ? 'white' : 'var(--accent-strong)',
                  }}
                  onClick={() => toggleProgram(prog)}
                >
                  {selectedPrograms.includes(prog) ? '✓ ' : ''}{prog}
                </Badge>
              ))}
            </div>
            {selectedPrograms.length === 0 && <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Cliquez pour sélectionner les filières ciblées</p>}
          </Card>

          <Card variant="flat" style={{ marginBottom: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Compétences requises</h4>
            <div className="form-group" style={{ marginBottom: '1rem' }}>
              <input
                className="input"
                placeholder="Rechercher une compétence..."
                value={skillSearch}
                onChange={(e) => setSkillSearch(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); if (skillSearch.trim() && !skills.includes(skillSearch.trim())) { setSkills([...skills, skillSearch.trim()]); setSkillSearch(''); } } }}
              />
            </div>
            {skillSearch && filteredSkills.length > 0 && (
              <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', maxHeight: '180px', overflowY: 'auto', marginBottom: '1rem' }}>
                {filteredSkills.slice(0, 10).map((skill) => (
                  <div
                    key={skill}
                    onClick={() => addSkill(skill)}
                    style={{ padding: '0.6rem 1rem', cursor: 'pointer', fontSize: '0.85rem', borderBottom: '1px solid var(--border)', transition: 'background 0.15s' }}
                    onMouseOver={(e) => e.target.style.background = 'var(--accent-light)'}
                    onMouseOut={(e) => e.target.style.background = 'transparent'}
                  >
                    {skill}
                  </div>
                ))}
              </div>
            )}
            <div className="flex flex-wrap gap-1">
              {skills.map((skill) => (
                <Badge key={skill}>
                  {skill}
                  <FiX style={{ cursor: 'pointer', marginLeft: '0.25rem' }} onClick={() => removeSkill(skill)} />
                </Badge>
              ))}
            </div>
            {skills.length === 0 && <p className="text-sm text-muted" style={{ marginTop: '0.5rem' }}>Recherchez et sélectionnez les compétences requises</p>}
            <p className="text-xs text-muted" style={{ marginTop: '0.75rem' }}>Vous pouvez aussi taper une compétence non listée et appuyer Entrée pour l'ajouter.</p>
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
