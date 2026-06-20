import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiMapPin, FiClock, FiCheckCircle, FiXCircle } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

export default function MyApplications() {
  const { user } = useAuth();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, []);

  async function fetchApplications() {
    setLoading(true);
    try {
      const data = await offersService.getMyApplications();
      setApplications(data.items || data || []);
    } catch (err) {
      setApplications([]);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Chargement de vos candidatures..." />;

  const pending = applications.filter(a => !a.status || a.status.includes('attente'));
  const accepted = applications.filter(a => a.status && (a.status.includes('Accept') || a.status.includes('accept')));
  const rejected = applications.filter(a => a.status && (a.status.includes('Refus') || a.status.includes('refus')));

  return (
    <div>
      <div className="page-header container">
        <h1>Mes candidatures</h1>
        <p>{applications.length} candidature(s) au total</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1rem' }}>
            <FiClock style={{ color: 'var(--status-warning)', fontSize: '1.25rem', marginBottom: '0.35rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>{pending.length}</div>
            <span className="text-xs text-muted">En attente</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1rem' }}>
            <FiCheckCircle style={{ color: 'var(--status-success)', fontSize: '1.25rem', marginBottom: '0.35rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>{accepted.length}</div>
            <span className="text-xs text-muted">Acceptées</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1rem' }}>
            <FiXCircle style={{ color: 'var(--status-error)', fontSize: '1.25rem', marginBottom: '0.35rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '1.75rem', fontWeight: 700 }}>{rejected.length}</div>
            <span className="text-xs text-muted">Refusées</span>
          </Card>
        </div>

        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Vous n'avez pas encore postulé à des offres.</p>
            <Link to="/offres"><Button variant="primary" style={{ marginTop: '1rem' }}>Parcourir les offres</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {accepted.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--status-success)', display: 'block', marginBottom: '0.75rem' }}>Acceptées ({accepted.length})</span>
                <div className="flex flex-col gap-1">
                  {accepted.map((app, idx) => (
                    <Link key={idx} to={`/offres/${app.offerId}`} style={{ textDecoration: 'none' }}>
                      <Card variant="flat" style={{ padding: '1rem', borderLeft: '3px solid var(--status-success)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{app.title || app.offerId}</span>
                            <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                              {app.company && <span className="flex items-center gap-1"><FiBriefcase /> {app.company}</span>}
                              {app.city && <span className="flex items-center gap-1"><FiMapPin /> {app.city}</span>}
                              {app.appliedAt && <span>Postulé le {app.appliedAt}</span>}
                            </div>
                          </div>
                          <StatusPill status="success">Acceptée</StatusPill>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {pending.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--status-warning)', display: 'block', marginBottom: '0.75rem' }}>En attente ({pending.length})</span>
                <div className="flex flex-col gap-1">
                  {pending.map((app, idx) => (
                    <Link key={idx} to={`/offres/${app.offerId}`} style={{ textDecoration: 'none' }}>
                      <Card variant="flat" style={{ padding: '1rem' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{app.title || app.offerId}</span>
                            <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                              {app.company && <span className="flex items-center gap-1"><FiBriefcase /> {app.company}</span>}
                              {app.city && <span className="flex items-center gap-1"><FiMapPin /> {app.city}</span>}
                              {app.appliedAt && <span>Postulé le {app.appliedAt}</span>}
                            </div>
                          </div>
                          <StatusPill status="warning">En attente</StatusPill>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {rejected.length > 0 && (
              <div>
                <span style={{ fontSize: '0.75rem', textTransform: 'uppercase', letterSpacing: '0.06em', fontWeight: 600, color: 'var(--status-error)', display: 'block', marginBottom: '0.75rem' }}>Refusées ({rejected.length})</span>
                <div className="flex flex-col gap-1">
                  {rejected.map((app, idx) => (
                    <Link key={idx} to={`/offres/${app.offerId}`} style={{ textDecoration: 'none' }}>
                      <Card variant="flat" style={{ padding: '1rem', borderLeft: '3px solid var(--status-error)' }}>
                        <div className="flex items-center justify-between">
                          <div>
                            <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text)' }}>{app.title || app.offerId}</span>
                            <div className="flex items-center gap-2 text-xs text-muted" style={{ marginTop: '0.25rem' }}>
                              {app.company && <span className="flex items-center gap-1"><FiBriefcase /> {app.company}</span>}
                              {app.city && <span className="flex items-center gap-1"><FiMapPin /> {app.city}</span>}
                              {app.appliedAt && <span>Postulé le {app.appliedAt}</span>}
                            </div>
                          </div>
                          <StatusPill status="error">Refusée</StatusPill>
                        </div>
                      </Card>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
