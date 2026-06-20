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
import offersService from '../../services/offersService';
import matchingService from '../../services/matchingService';

export default function StudentDashboard() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [recommended, setRecommended] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const [appsRes, recoRes] = await Promise.allSettled([
        offersService.getMyApplications(),
        matchingService.findOffersForStudent(user.identifier),
      ]);
      if (appsRes.status === 'fulfilled') {
        const data = appsRes.value;
        setApplications(data.items || data || []);
      }
      if (recoRes.status === 'fulfilled') {
        const data = recoRes.value;
        setRecommended((data.items || data || []).slice(0, 5));
      }
    } catch (err) {
      setApplications([]);
      setRecommended([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Chargement de votre espace..." />;

  const pending = applications.filter(a => !a.status || a.status.includes('attente')).length;
  const accepted = applications.filter(a => a.status && (a.status.includes('Accept') || a.status.includes('accept'))).length;
  const rejected = applications.filter(a => a.status && (a.status.includes('Refus') || a.status.includes('refus'))).length;

  return (
    <div>
      <div className="page-header container">
        <h1>Mon espace</h1>
        <p>Vos candidatures et offres recommandées.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {accepted > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--status-success-bg)', border: '1px solid rgba(22, 163, 74, 0.2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>🎉</span>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--status-success)', display: 'block' }}>{accepted} candidature(s) acceptée(s) !</span>
              <span className="text-sm text-muted">Félicitations, une entreprise a accepté votre candidature.</span>
            </div>
          </div>
        )}
        {rejected > 0 && (
          <div style={{ padding: '1rem 1.25rem', borderRadius: 'var(--radius-md)', background: 'var(--status-error-bg)', border: '1px solid rgba(220, 38, 38, 0.2)', marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <span style={{ fontSize: '1.25rem' }}>📋</span>
            <div>
              <span style={{ fontWeight: 600, color: 'var(--status-error)', display: 'block' }}>{rejected} candidature(s) déclinée(s)</span>
              <span className="text-sm text-muted">Continuez à postuler, d'autres offres correspondent à votre profil.</span>
            </div>
          </div>
        )}

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
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h3>Mes candidatures</h3>
              {applications.length > 0 && <Link to="/mes-candidatures"><Button variant="ghost" size="sm">Voir tout →</Button></Link>}
            </div>
            {applications.length === 0 ? (
              <Card variant="flat">
                <p className="text-sm text-muted">Aucune candidature envoyée.</p>
                <Link to="/offres"><Button variant="primary" size="sm" style={{ marginTop: '0.75rem' }}>Parcourir les offres</Button></Link>
              </Card>
            ) : (
              <div className="flex flex-col gap-1">
                {applications.slice(0, 3).map((app, idx) => (
                  <Link key={idx} to={`/offres/${app.offerId}`} style={{ textDecoration: 'none' }}>
                    <Card variant="flat" style={{ padding: '0.85rem', borderLeft: app.status && app.status.includes('Accept') ? '3px solid var(--status-success)' : app.status && app.status.includes('Refus') ? '3px solid var(--status-error)' : 'none' }}>
                      <div className="flex items-center justify-between">
                        <div>
                          <span style={{ fontWeight: 600, fontSize: '0.85rem', color: 'var(--text)' }}>{app.title || app.offerId}</span>
                          <span className="text-xs text-muted" style={{ display: 'block' }}>{app.company} · {app.city}</span>
                        </div>
                        <StatusPill status={app.status && app.status.includes('Accept') ? 'success' : app.status && app.status.includes('Refus') ? 'error' : 'warning'}>
                          {app.status || 'En attente'}
                        </StatusPill>
                      </div>
                    </Card>
                  </Link>
                ))}
                {applications.length > 3 && (
                  <Link to="/mes-candidatures" className="text-sm" style={{ marginTop: '0.5rem', display: 'block', textAlign: 'center' }}>
                    Voir les {applications.length} candidatures →
                  </Link>
                )}
              </div>
            )}
          </div>

          <div>
            <h3 style={{ marginBottom: '1rem' }}>
              <FiStar style={{ display: 'inline', marginRight: '0.35rem', color: 'var(--accent)' }} />
              Offres pour vous
            </h3>
            {recommended.length === 0 ? (
              <Card variant="flat">
                <p className="text-sm text-muted">Ajoutez des compétences à votre profil pour voir les offres recommandées.</p>
                <Link to={`/etudiants/${user.identifier}`}><Button variant="ghost" size="sm" style={{ marginTop: '0.75rem' }}>Mon profil</Button></Link>
              </Card>
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
                        {offer.company && <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>}
                        {offer.city && <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>}
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
