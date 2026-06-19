import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { FiArrowLeft, FiUser, FiMapPin, FiBook } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import ProgressBar from '../../components/ui/ProgressBar';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';

const DEMO_APPLICATIONS = [
  { id: 'app-001', studentId: 'student-0224012b0526', program: 'Cybersecurite', level: '3A', city: 'Beni Mellal', score: 5, maxScore: 6, status: 'En attente', appliedAt: '2026-06-15' },
  { id: 'app-002', studentId: 'student-8a42f1c9d3e7', program: 'Cybersecurite', level: '3A', city: 'Casablanca', score: 4, maxScore: 6, status: 'En attente', appliedAt: '2026-06-14' },
  { id: 'app-003', studentId: 'student-1589b5f85adc', program: 'Genie Logiciel', level: '2A', city: 'Rabat', score: 3, maxScore: 6, status: 'Acceptée', appliedAt: '2026-06-12' },
  { id: 'app-004', studentId: 'student-03ceaa3d0094', program: 'Genie de la Data', level: '3A', city: 'Kenitra', score: 2, maxScore: 6, status: 'Refusée', appliedAt: '2026-06-10' },
];

export default function Applications() {
  const { offerId } = useParams();
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchApplications(); }, [offerId]);

  async function fetchApplications() {
    setLoading(true);
    try {
      const response = await import('../../services/offersService').then(m => m.default.getApplications(offerId));
      setApplications(response.items || response || []);
    } catch (err) {
      setApplications(DEMO_APPLICATIONS);
    } finally {
      setLoading(false);
    }
  }

  async function handleUpdateStatus(appId, studentId, newStatus) {
    setApplications(applications.map(a => a.id === appId ? { ...a, status: newStatus } : a));
    try {
      const api = (await import('../../services/api')).default;
      await api.put(`/offers/applications/${studentId}/${offerId}/status`, { status: newStatus });
    } catch (err) {}
  }

  if (loading) return <Loader text="Chargement des candidatures..." />;

  return (
    <div>
      <div className="page-header container">
        <Link to="/entreprise/offres" className="flex items-center gap-1 text-sm" style={{ marginBottom: '1rem', color: 'var(--muted)' }}><FiArrowLeft /> Retour à mes offres</Link>
        <h1>Candidatures</h1>
        <p>Offre : <strong>{offerId}</strong> — {applications.length} candidature(s) reçue(s)</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {applications.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📭</div>
            <p>Aucune candidature reçue pour cette offre.</p>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {applications.map((app) => (
              <Card key={app.id} variant="flat" style={{ padding: '1.25rem' }}>
                <div className="flex items-center justify-between" style={{ marginBottom: '0.75rem' }}>
                  <div className="flex items-center gap-2">
                    <FiUser style={{ color: 'var(--accent)' }} />
                    <Link to={`/etudiants/${app.studentId}`} style={{ fontWeight: 600, fontSize: '0.9rem' }}>{app.studentId}</Link>
                    <Badge size="sm">{app.program}</Badge>
                    <Badge size="sm">{app.level}</Badge>
                    <span className="text-xs text-muted flex items-center gap-1"><FiMapPin /> {app.city}</span>
                  </div>
                  <StatusPill status={app.status === 'Acceptée' ? 'success' : app.status === 'Refusée' ? 'error' : 'warning'}>
                    {app.status}
                  </StatusPill>
                </div>
                <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                  <span className="text-xs text-muted">Score matching :</span>
                  <ProgressBar value={app.score} max={app.maxScore} />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted">Candidature reçue le {app.appliedAt}</span>
                  {app.status === 'En attente' && (
                    <div className="flex gap-1">
                      <Button variant="primary" size="sm" onClick={() => handleUpdateStatus(app.id, app.studentId, 'Acceptée')}>Accepter</Button>
                      <Button variant="ghost" size="sm" onClick={() => handleUpdateStatus(app.id, app.studentId, 'Refusée')} style={{ color: 'var(--status-error)' }}>Refuser</Button>
                    </div>
                  )}
                  {app.status === 'Acceptée' && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-success)' }}>✓ Candidat accepté</span>
                  )}
                  {app.status === 'Refusée' && (
                    <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--status-error)' }}>✗ Candidat refusé</span>
                  )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
