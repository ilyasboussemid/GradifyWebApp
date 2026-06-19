import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBriefcase, FiUsers, FiCheckCircle, FiTrendingUp, FiPlus } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Button from '../../components/ui/Button';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

export default function EnterpriseDashboard() {
  const { user } = useAuth();
  const [stats, setStats] = useState({ totalOffers: 0, openOffers: 0, totalApplications: 0 });
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const data = await offersService.getMyOffers();
      const items = data.items || data || [];
      setOffers(items);
      const totalApps = items.reduce((sum, o) => sum + (o.applications || 0), 0);
      setStats({
        totalOffers: items.length,
        openOffers: items.filter(o => String(o.status || '').includes('Ouverte')).length,
        totalApplications: totalApps,
      });
    } catch (err) {
      setOffers([]);
      setStats({ totalOffers: 0, openOffers: 0, totalApplications: 0 });
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
        <div className="grid grid-3" style={{ marginBottom: '2rem' }}>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiBriefcase style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats.totalOffers}</div>
            <span className="text-sm text-muted">Offres publiées</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiCheckCircle style={{ color: 'var(--status-success)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats.openOffers}</div>
            <span className="text-sm text-muted">Offres ouvertes</span>
          </Card>
          <Card variant="flat" style={{ textAlign: 'center', padding: '1.25rem' }}>
            <FiUsers style={{ color: 'var(--accent)', fontSize: '1.5rem', marginBottom: '0.5rem' }} />
            <div style={{ fontFamily: 'var(--font-display)', fontSize: '2rem', fontWeight: 700 }}>{stats.totalApplications}</div>
            <span className="text-sm text-muted">Candidatures reçues</span>
          </Card>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '2rem' }}>
          <Card variant="flat">
            <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
              <h4>Mes offres</h4>
              <Link to="/entreprise/offres"><Button variant="ghost" size="sm">Voir tout →</Button></Link>
            </div>
            {offers.length === 0 ? (
              <p className="text-sm text-muted">Aucune offre publiée.</p>
            ) : (
              offers.slice(0, 5).map((offer, idx) => (
                <div key={idx} className="flex items-center justify-between" style={{ padding: '0.65rem 0', borderBottom: idx < Math.min(offers.length, 5) - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>{offer.title}</span>
                    <span className="text-xs text-muted" style={{ display: 'block' }}>{offer.city} · {offer.applications || 0} candidature(s)</span>
                  </div>
                  <StatusPill status={String(offer.status || '').includes('Ouverte') ? 'success' : 'error'}>
                    {String(offer.status || '').includes('Ouverte') ? 'Ouverte' : 'Fermée'}
                  </StatusPill>
                </div>
              ))
            )}
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
