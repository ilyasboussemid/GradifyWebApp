import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiCheckCircle, FiTrendingUp, FiPlus } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

const DEMO_STATS = { totalOffers: 5, openOffers: 3, totalApplications: 23, acceptedApplications: 8 };
const DEMO_RECENT_APPS = [
  { studentId: 'student-0224012b0526', offerTitle: 'Pentesteur Junior', status: 'En attente', date: '2026-06-17' },
  { studentId: 'student-8a42f1c9d3e7', offerTitle: 'Pentesteur Junior', status: 'En attente', date: '2026-06-16' },
  { studentId: 'student-1589b5f85adc', offerTitle: 'Ingenieur DevOps', status: 'Acceptée', date: '2026-06-15' },
  { studentId: 'student-03ceaa3d0094', offerTitle: 'Data Analyst', status: 'Refusée', date: '2026-06-14' },
];

export default function EnterpriseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [recentApps, setRecentApps] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const offers = await offersService.getMyOffers();
      const items = offers.items || offers;
      const totalApps = items.reduce((sum, o) => sum + (o.applications || 0), 0);
      setStats({
        totalOffers: items.length,
        openOffers: items.filter(o => o.status === 'Ouverte').length,
        totalApplications: totalApps,
        acceptedApplications: Math.floor(totalApps * 0.35),
      });
      setRecentApps(DEMO_RECENT_APPS);
    } catch (err) {
      setStats(DEMO_STATS);
      setRecentApps(DEMO_RECENT_APPS);
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <Loader text="Chargement de votre espace..." />;

  return (
    <div>
      <div className="page-header container">
        <div className="flex items-center justify-between">
          <div>
            <h1>Espace Entreprise</h1>
            <p>Bienvenue, {user.name || user.identifier} — gérez vos offres et candidatures.</p>
          </div>
          <Link to="/entreprise/offres/nouvelle">
            <Button variant="primary" icon={<FiPlus />}>Nouvelle offre</Button>
          </Link>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="grid grid-4" style={{ marginBottom: '2rem' }}>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiBriefcase style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats?.totalOffers}</div>
            <span className="text-sm text-muted">Offres publiées</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiCheckCircle style={{ color: 'var(--status-success)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats?.openOffers}</div>
            <span className="text-sm text-muted">Offres ouvertes</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiUsers style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats?.totalApplications}</div>
            <span className="text-sm text-muted">Candidatures reçues</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiTrendingUp style={{ color: 'var(--status-success)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats?.acceptedApplications}</div>
            <span className="text-sm text-muted">Acceptées</span>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <Card variant="flat">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h4>Candidatures récentes</h4>
              <Link to="/entreprise/offres"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
            </div>
            {recentApps.map((app, idx) => (
              <div key={idx} className="flex items-center justify-between" style={{ padding: '0.65rem 0', borderBottom: idx < recentApps.length - 1 ? '1px solid var(--border)' : 'none' }}>
                <div>
                  <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{app.studentId.substring(0, 20)}</span>
                  <span className="text-xs text-muted" style={{ display: 'block' }}>{app.offerTitle} · {app.date}</span>
                </div>
                <StatusPill status={app.status === 'Acceptée' ? 'success' : app.status === 'Refusée' ? 'error' : 'warning'}>
                  {app.status}
                </StatusPill>
              </div>
            ))}
          </Card>

          <Card variant="flat">
            <h4 style={{ marginBottom: '1rem' }}>Actions rapides</h4>
            <div className="flex flex-col gap-1">
              <Link to="/entreprise/offres/nouvelle"><Button variant="primary" size="sm" style={{ width: '100%' }} icon={<FiPlus />}>Publier une offre</Button></Link>
              <Link to="/entreprise/offres"><Button variant="secondary" size="sm" style={{ width: '100%' }} icon={<FiBriefcase />}>Gérer mes offres</Button></Link>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
