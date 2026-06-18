import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiClock, FiCheckCircle, FiXCircle, FiMapPin, FiStar } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import matchingService from '../../services/matchingService';

const DEMO_APPLICATIONS = [
  { offerId: 'offer-001', title: 'Pentesteur Junior', company: 'TechSecure SA', city: 'Casablanca', status: 'En attente', appliedAt: '2026-06-15', score: 5, maxScore: 6 },
  { offerId: 'offer-003', title: 'Ingénieur Sécurité Cloud', company: 'CloudFirst', city: 'Rabat', status: 'Acceptée', appliedAt: '2026-06-10', score: 4, maxScore: 5 },
  { offerId: 'offer-012', title: 'Analyste SOC', company: 'SecureTech', city: 'Casablanca', status: 'Refusée', appliedAt: '2026-06-08', score: 3, maxScore: 7 },
];

const DEMO_RECOMMENDED = [
  { id: 'offer-005', title: 'Développeur Full-Stack', company: 'WebAgency', city: 'Tanger', score: 6, maxScore: 7 },
  { id: 'offer-006', title: 'Ingénieur IA', company: 'AILab Maroc', city: 'Casablanca', score: 4, maxScore: 5 },
  { id: 'offer-010', title: 'Data Engineer', company: 'DataMaroc', city: 'Rabat', score: 3, maxScore: 4 },
];

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [appsData, recoData] = await Promise.all([
        fetch('/api/offers/my-applications').then(r => r.json()),
        matchingService.findOffersForStudent(user.identifier),
      ]);
      setApplications(appsData.items || appsData);
      setRecommended((recoData.items || recoData).slice(0, 5));
    } catch (err) {
      setApplications(DEMO_APPLICATIONS);
      setRecommended(DEMO_RECOMMENDED);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Chargement de votre espace..." />;

  const pending = applications.filter(a => a.status === 'En attente').length;
  const accepted = applications.filter(a => a.status === 'Acceptée').length;
  const rejected = applications.filter(a => a.status === 'Refusée').length;

  return (
    <div>
      <div className="page-header container">
        <h1>Bonjour, {user.name || user.identifier} 👋</h1>
        <p>Votre espace personnel — candidatures et offres recommandées.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiClock style={{ color: 'var(--status-warning)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{pending}</div>
            <span className="text-sm text-muted">En attente</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiCheckCircle style={{ color: 'var(--status-success)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{accepted}</div>
            <span className="text-sm text-muted">Acceptées</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiXCircle style={{ color: 'var(--status-error)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700, color: 'var(--text)' }}>{rejected}</div>
            <span className="text-sm text-muted">Refusées</span>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem', alignItems: 'start' }}>
          <div>
            <h3 style={{ marginBottom: '1rem' }}>Mes candidatures</h3>
            {applications.length === 0 ? (
              <Card variant="flat"><p className="text-sm text-muted">Aucune candidature envoyée.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {applications.map((app, idx) => (
                  <Link key={idx} to={`/offres/${app.offerId}`} style={{ textDecoration: 'none' }}>
                    <Card variant="flat" style={{ padding: '1rem' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{app.title}</span>
                        <StatusPill status={app.status === 'Acceptée' ? 'success' : app.status === 'Refusée' ? 'error' : 'warning'}>
                          {app.status}
                        </StatusPill>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="flex items-center gap-1"><FiBriefcase /> {app.company}</span>
                        <span className="flex items-center gap-1"><FiMapPin /> {app.city}</span>
                        <span>Envoyée le {app.appliedAt}</span>
                      </div>
                      {app.score && <ProgressBar value={app.score} max={app.maxScore} className="mt-1" style={{ marginTop: '0.5rem' }} />}
                    </Card>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <FiStar style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--accent)' }} />
              Offres pour vous
            </h3>
            {recommended.length === 0 ? (
              <Card variant="flat"><p className="text-sm text-muted">Aucune recommandation disponible.</p></Card>
            ) : (
              <div className="flex flex-col gap-2">
                {recommended.map((offer) => (
                  <Link key={offer.id} to={`/offres/${offer.id}`} style={{ textDecoration: 'none' }}>
                    <Card variant="flat" style={{ padding: '1rem' }}>
                      <div className="flex items-center justify-between" style={{ marginBottom: '0.5rem' }}>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{offer.title}</span>
                        <span style={{ fontSize: '0.8rem', fontWeight: 700, color: 'var(--accent)' }}>{offer.score}/{offer.maxScore}</span>
                      </div>
                      <div className="flex items-center gap-2 text-xs text-muted">
                        <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>
                        <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
                      </div>
                      <ProgressBar value={offer.score} max={offer.maxScore} style={{ marginTop: '0.5rem' }} />
                    </Card>
                  </Link>
                ))}
              </div>
            )}
            <Link to="/offres" style={{ display: 'block', marginTop: '1rem' }}>
              <Button variant="ghost" size="sm">Voir toutes les offres →</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
