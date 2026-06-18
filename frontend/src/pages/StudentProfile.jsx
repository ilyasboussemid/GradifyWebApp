import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiBook, FiAward, FiCalendar, FiArrowLeft, FiBriefcase, FiEdit2 } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loader from '../components/ui/Loader';
import studentsService from '../services/studentsService';
import matchingService from '../services/matchingService';
import { useAuth } from '../context/AuthContext';
const DEMO_STUDENT = {
  id: 'student-0224012b0526',
  firstName: 'Ilyas',
  lastName: 'Boussemid',
  level: '3A',
  program: 'Cybersecurite',
  city: 'Beni Mellal',
  mention: 'Passable',
  academicYear: '2023',
  skills: [
    { name: 'Cryptographie', category: 'Cybersécurité' },
    { name: 'Terraform', category: 'DevOps & Cloud' },
    { name: 'Sécurité réseau', category: 'Cybersécurité' },
    { name: 'Pentest', category: 'Cybersécurité' },
    { name: 'Linux', category: 'Systèmes' },
    { name: 'Docker', category: 'DevOps & Cloud' },
    { name: 'Python', category: 'Programmation' },
    { name: 'OWASP', category: 'Cybersécurité' },
    { name: 'Wireshark', category: 'Réseaux' },
  ],
};
const DEMO_MATCHING_OFFERS = [
  { id: 'offer-001', title: 'Pentesteur Junior', company: 'TechSecure SA', city: 'Casablanca', score: 5, maxScore: 6 },
  { id: 'offer-003', title: 'Pentesteur Junior', company: 'CyberCorp', city: 'Casablanca', score: 4, maxScore: 8 },
  { id: 'offer-010', title: 'Ingénieur Sécurité Cloud', company: 'CloudFirst', city: 'Rabat', score: 3, maxScore: 5 },
  { id: 'offer-012', title: 'Analyste SOC', company: 'SecureTech', city: 'Casablanca', score: 3, maxScore: 7 },
  { id: 'offer-002', title: 'Ingenieur DevOps', company: 'CloudFirst', city: 'Casablanca', score: 2, maxScore: 7 },
];
export default function StudentProfile() {
  const { id } = useParams();
  const { user } = useAuth();
  const isOwnProfile = user?.identifier === id;
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingOffers, setMatchingOffers] = useState([]);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [showMatching, setShowMatching] = useState(false);
  useEffect(() => {
    fetchStudent();
  }, [id]);
  async function fetchStudent() {
    setLoading(true);
    try {
      const data = await studentsService.getById(id);
      setStudent(data);
    } catch (err) {
      setStudent({ ...DEMO_STUDENT, id });
    } finally {
      setLoading(false);
    }
  }
  async function handleShowMatching() {
    setShowMatching(true);
    setMatchingLoading(true);
    try {
      const data = await matchingService.findOffersForStudent(id);
      setMatchingOffers(data.items || data);
    } catch (err) {
      setMatchingOffers(DEMO_MATCHING_OFFERS);
    } finally {
      setMatchingLoading(false);
    }
  }
  if (loading) {
    return <Loader text="Chargement du profil..." />;
  }
  if (!student) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <p>Profil introuvable</p>
          <Link to="/"><Button variant="secondary" style={{ marginTop: '1rem' }}>Retour à l'accueil</Button></Link>
        </div>
      </div>
    );
  }
  const skillsByCategory = (student.skills || []).reduce((acc, skill) => {
    const cat = skill.category || 'Autre';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(skill.name || skill);
    return acc;
  }, {});
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Link to="/" className="flex items-center gap-1 text-sm" style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
        <FiArrowLeft /> Retour
      </Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: '2rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <Badge>{student.level}</Badge>
              <Badge>{student.program}</Badge>
            </div>
            <h1 style={{ marginBottom: '0.5rem', fontSize: '2rem' }}>
              {student.firstName} {student.lastName}
            </h1>
            {isOwnProfile && (
              <Link to="/profil/modifier" style={{ marginTop: '0.5rem', display: 'inline-block' }}>
                <Button variant="secondary" size="sm" icon={<FiEdit2 />}>Modifier mon profil</Button>
              </Link>
            )}
          </div>
          <Card variant="flat">
            <h4 style={{ marginBottom: '1.25rem' }}>
              Compétences ({(student.skills || []).length})
            </h4>
            <div className="flex flex-wrap gap-1" style={{ marginBottom: '1.5rem' }}>
              {(student.skills || []).map((skill, idx) => (
                <Badge key={idx}>{typeof skill === 'string' ? skill : skill.name}</Badge>
              ))}
            </div>
            {Object.keys(skillsByCategory).length > 0 && (
              <div>
                <p className="text-xs text-muted" style={{ marginBottom: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
                  Par catégorie
                </p>
                <div className="flex flex-col gap-2">
                  {Object.entries(skillsByCategory).map(([cat, skills]) => (
                    <div key={cat}>
                      <span className="text-sm" style={{ fontWeight: 600, color: 'var(--text)', display: 'block', marginBottom: '0.35rem' }}>
                        {cat}
                      </span>
                      <div className="flex flex-wrap gap-1">
                        {skills.map(s => <Badge key={s} size="sm">{s}</Badge>)}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </Card>
          <Card variant="flat">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h4>Offres compatibles</h4>
              {!showMatching && (
                <Button variant="primary" size="sm" onClick={handleShowMatching} icon={<FiBriefcase />}>
                  Calculer le matching
                </Button>
              )}
            </div>
            {showMatching && (
              matchingLoading ? (
                <Loader text="Calcul du matching en cours..." />
              ) : matchingOffers.length === 0 ? (
                <p className="text-sm text-muted">Aucune offre compatible trouvée.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted" style={{ marginBottom: '0.5rem' }}>
                    Score = compétences en commun / compétences requises par l'offre
                  </p>
                  {matchingOffers.map((offer) => (
                    <Link
                      key={offer.id}
                      to={`/offres/${offer.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="card-flat" style={{ padding: '1rem' }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)', display: 'block' }}>
                              {offer.title}
                            </span>
                            <span className="text-xs text-muted flex items-center gap-2" style={{ marginTop: '0.2rem' }}>
                              <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>
                              <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
                            </span>
                          </div>
                          <span style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {offer.score}/{offer.maxScore}
                          </span>
                        </div>
                        <ProgressBar value={offer.score} max={offer.maxScore} />
                      </div>
                    </Link>
                  ))}
                </div>
              )
            )}
          </Card>
        </div>
        <div className="flex flex-col gap-2" style={{ position: 'sticky', top: '5rem' }}>
          <Card>
            <h4 style={{ marginBottom: '1rem' }}>Informations</h4>
            <div className="flex flex-col gap-2">
              <div className="flex justify-between">
                <span className="text-sm text-muted flex items-center gap-1"><FiBook /> Programme</span>
                <span className="text-sm" style={{ fontWeight: 600 }}>{student.program}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted flex items-center gap-1"><FiAward /> Niveau</span>
                <span className="text-sm" style={{ fontWeight: 600 }}>{student.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted flex items-center gap-1"><FiMapPin /> Ville</span>
                <span className="text-sm">{student.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted flex items-center gap-1"><FiCalendar /> Année acad.</span>
                <span className="text-sm">{student.academicYear}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Mention</span>
                <Badge size="sm">{student.mention}</Badge>
              </div>
            </div>
          </Card>
          <Card>
            <div className="flex flex-col gap-2" style={{ textAlign: 'center' }}>
              <div>
                <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                  {(student.skills || []).length}
                </span>
                <span className="text-sm text-muted" style={{ display: 'block' }}>compétences</span>
              </div>
              {showMatching && (
                <div style={{ borderTop: '1px solid var(--border)', paddingTop: '0.75rem' }}>
                  <span style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--accent)' }}>
                    {matchingOffers.length}
                  </span>
                  <span className="text-sm text-muted" style={{ display: 'block' }}>offres compatibles</span>
                </div>
              )}
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
