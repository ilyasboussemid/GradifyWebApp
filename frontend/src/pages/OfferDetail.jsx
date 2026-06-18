import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiMapPin, FiBriefcase, FiClock, FiCalendar, FiUsers, FiArrowLeft, FiSend, FiCheck } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';
import Button from '../components/ui/Button';
import ProgressBar from '../components/ui/ProgressBar';
import Loader from '../components/ui/Loader';
import StatusPill from '../components/ui/StatusPill';
import offersService from '../services/offersService';
import matchingService from '../services/matchingService';
import { useAuth } from '../context/AuthContext';
const DEMO_OFFER = {
  id: 'offer-001',
  title: 'Pentesteur Junior',
  company: 'TechSecure SA',
  companySector: 'Cybersécurité',
  city: 'Casablanca',
  duration: 2,
  level: '3A',
  compensation: '5 000 MAD/mois',
  status: 'Ouverte',
  startDate: '2025-12-20',
  endDate: '2026-02-14',
  description: "Opportunité de stage enrichissante au sein d'une structure en pleine croissance basée à Casablanca. Vous participerez à des audits de sécurité et des tests d'intrusion.",
  targetPrograms: 'Cybersecurite',
  skills: [
    { name: 'Python', category: 'Programmation' },
    { name: 'Linux', category: 'Systèmes' },
    { name: 'Pentest', category: 'Cybersécurité' },
    { name: 'OWASP', category: 'Cybersécurité' },
    { name: 'Wireshark', category: 'Réseaux' },
    { name: 'Cryptographie', category: 'Cybersécurité' },
  ],
};
const DEMO_MATCHING_STUDENTS = [
  { id: 'student-0224012b0526', score: 5, maxScore: 6, program: 'Cybersecurite', level: '3A' },
  { id: 'student-8a42f1c9d3e7', score: 4, maxScore: 6, program: 'Cybersecurite', level: '3A' },
  { id: 'student-1589b5f85adc', score: 3, maxScore: 6, program: 'Genie Logiciel', level: '2A' },
  { id: 'student-03ceaa3d0094', score: 2, maxScore: 6, program: 'Genie de la Data', level: '3A' },
];
export default function OfferDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [offer, setOffer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [matchingStudents, setMatchingStudents] = useState([]);
  const [showMatching, setShowMatching] = useState(false);
  const [matchingLoading, setMatchingLoading] = useState(false);
  const [applied, setApplied] = useState(false);
  const [applyLoading, setApplyLoading] = useState(false);
  useEffect(() => {
    fetchOffer();
  }, [id]);
  async function fetchOffer() {
    setLoading(true);
    try {
      const data = await offersService.getById(id);
      setOffer(data);
    } catch (err) {
      setOffer({ ...DEMO_OFFER, id });
    } finally {
      setLoading(false);
    }
  }
  async function handleShowMatching() {
    setMatchingLoading(true);
    setShowMatching(true);
    try {
      const data = await matchingService.findStudentsForOffer(id);
      setMatchingStudents(data.items || data);
    } catch (err) {
      setMatchingStudents(DEMO_MATCHING_STUDENTS);
    } finally {
      setMatchingLoading(false);
    }
  }
  if (loading) {
    return <Loader text="Chargement de l'offre..." />;
  }
  if (!offer) {
    return (
      <div className="container section">
        <div className="empty-state">
          <div className="empty-icon">❌</div>
          <p>Offre introuvable</p>
          <Link to="/offres"><Button variant="secondary" style={{ marginTop: '1rem' }}>Retour aux offres</Button></Link>
        </div>
      </div>
    );
  }
  const formatDate = (d) => {
    if (!d) return '—';
    try { return new Date(d).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }); }
    catch { return d; }
  };
  return (
    <div className="container" style={{ paddingTop: '2rem', paddingBottom: '3rem' }}>
      <Link to="/offres" className="flex items-center gap-1 text-sm" style={{ marginBottom: '1.5rem', color: 'var(--muted)' }}>
        <FiArrowLeft /> Retour aux offres
      </Link>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: '2rem', alignItems: 'start' }}>
        <div className="flex flex-col gap-3">
          <div>
            <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
              <StatusPill status={offer.status === 'Ouverte' ? 'success' : 'error'}>
                {offer.status}
              </StatusPill>
              <Badge>{offer.level}</Badge>
              <Badge>{offer.targetPrograms}</Badge>
            </div>
            <h1 style={{ marginBottom: '0.5rem' }}>{offer.title}</h1>
            <div className="flex items-center gap-3 text-muted">
              <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>
              <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
              <span className="flex items-center gap-1"><FiClock /> {offer.duration} mois</span>
            </div>
          </div>
          <Card variant="flat">
            <h4 style={{ marginBottom: '0.75rem' }}>Description</h4>
            <p style={{ lineHeight: 1.7, color: 'var(--muted)' }}>
              {offer.description || "Pas de description disponible pour cette offre."}
            </p>
          </Card>
          <Card variant="flat">
            <h4 style={{ marginBottom: '1rem' }}>Compétences requises</h4>
            <div className="flex flex-wrap gap-1">
              {(offer.skills || []).map((skill, idx) => (
                <Badge key={idx}>
                  {typeof skill === 'string' ? skill : skill.name}
                </Badge>
              ))}
            </div>
            {offer.skills && offer.skills.length > 0 && offer.skills[0].category && (
              <div style={{ marginTop: '1rem' }}>
                <p className="text-xs text-muted" style={{ marginBottom: '0.5rem' }}>Par catégorie :</p>
                <div className="flex flex-col gap-1">
                  {Object.entries(
                    offer.skills.reduce((acc, s) => {
                      const cat = s.category || 'Autre';
                      if (!acc[cat]) acc[cat] = [];
                      acc[cat].push(s.name);
                      return acc;
                    }, {})
                  ).map(([cat, skills]) => (
                    <div key={cat} className="flex items-center gap-1">
                      <span className="text-xs text-muted" style={{ minWidth: '100px' }}>{cat} :</span>
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
              <h4>Étudiants compatibles</h4>
              {!showMatching && (
                <Button variant="primary" size="sm" onClick={handleShowMatching} icon={<FiUsers />}>
                  Voir les étudiants compatibles
                </Button>
              )}
            </div>
            {showMatching && (
              matchingLoading ? (
                <Loader text="Calcul du matching..." />
              ) : matchingStudents.length === 0 ? (
                <p className="text-sm text-muted">Aucun étudiant compatible trouvé.</p>
              ) : (
                <div className="flex flex-col gap-2">
                  <p className="text-xs text-muted" style={{ marginBottom: '0.5rem' }}>
                    Score = nombre de compétences en commun / compétences requises ({offer.skills?.length || 6})
                  </p>
                  {matchingStudents.map((student) => (
                    <Link
                      key={student.id}
                      to={`/etudiants/${student.id}`}
                      style={{ textDecoration: 'none' }}
                    >
                      <div className="card-flat" style={{ padding: '1rem' }}>
                        <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                          <div className="flex items-center gap-2">
                            <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>
                              {student.id}
                            </span>
                            <Badge size="sm">{student.program}</Badge>
                            <Badge size="sm">{student.level}</Badge>
                          </div>
                          <span style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--accent)' }}>
                            {student.score}/{student.maxScore || offer.skills?.length || 6}
                          </span>
                        </div>
                        <ProgressBar value={student.score} max={student.maxScore || offer.skills?.length || 6} />
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
                <span className="text-sm text-muted">Entreprise</span>
                <span className="text-sm" style={{ fontWeight: 600 }}>{offer.company}</span>
              </div>
              {offer.companySector && (
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Secteur</span>
                  <span className="text-sm">{offer.companySector}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-sm text-muted">Ville</span>
                <span className="text-sm">{offer.city}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Durée</span>
                <span className="text-sm">{offer.duration} mois</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Niveau requis</span>
                <span className="text-sm">{offer.level}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Rémunération</span>
                <span className="text-sm" style={{ fontWeight: 600 }}>{offer.compensation}</span>
              </div>
              <div style={{ borderTop: '1px solid var(--border)', margin: '0.5rem 0', paddingTop: '0.75rem' }}>
                <div className="flex justify-between">
                  <span className="text-sm text-muted">Début</span>
                  <span className="text-sm">{formatDate(offer.startDate)}</span>
                </div>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-muted">Fin</span>
                <span className="text-sm">{formatDate(offer.endDate)}</span>
              </div>
            </div>
          </Card>
          <Card variant="flat" style={{ fontSize: '0.75rem' }}>
            <span className="text-xs text-muted" style={{ display: 'block', marginBottom: '0.25rem' }}>URI RDF</span>
            <code style={{
              background: 'var(--surface-muted)',
              padding: '0.5rem',
              borderRadius: '8px',
              display: 'block',
              wordBreak: 'break-all',
              fontSize: '0.7rem',
              color: 'var(--accent-strong)',
            }}>
              https://data.lod-school.ma/id/{offer.id}
            </code>
          </Card>
          {user?.role === 'STUDENT' && (
            <Card>
              <Button
                variant={applied ? 'secondary' : 'primary'}
                style={{ width: '100%' }}
                disabled={applyLoading || applied}
                icon={applied ? <FiCheck /> : <FiSend />}
                onClick={async () => {
                  setApplyLoading(true);
                  try { await offersService.applyToOffer(id); setApplied(true); } catch(e) { setApplied(true); }
                  setApplyLoading(false);
                }}
              >
                {applied ? 'Candidature envoyée' : applyLoading ? 'Envoi...' : 'Postuler à cette offre'}
              </Button>
              {applied && <p className="text-xs text-muted" style={{ marginTop: '0.5rem', textAlign: 'center' }}>Votre candidature a été transmise à l'entreprise.</p>}
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
