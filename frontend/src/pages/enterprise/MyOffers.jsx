import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiMapPin, FiClock, FiUsers } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import StatusPill from '../../components/ui/StatusPill';
import Loader from '../../components/ui/Loader';
import { useAuth } from '../../context/AuthContext';
import offersService from '../../services/offersService';

const DEMO_MY_OFFERS = [
  { id: 'offer-001', title: 'Pentesteur Junior', city: 'Casablanca', duration: 2, level: '3A', status: 'Ouverte', compensation: '5 000 MAD/mois', skills: ['Python', 'Pentest', 'OWASP'], applications: 4 },
  { id: 'offer-002', title: 'Ingenieur DevOps', city: 'Casablanca', duration: 2, level: '2A', status: 'Ouverte', compensation: '2 000 MAD/mois', skills: ['Docker', 'Terraform', 'CI/CD'], applications: 7 },
  { id: 'offer-003', title: 'Data Analyst', city: 'Rabat', duration: 3, level: '3A', status: 'Fermee', compensation: '3 500 MAD/mois', skills: ['Python', 'SQL', 'Power BI'], applications: 12 },
];

export default function MyOffers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);


  useEffect(() => { fetchMyOffers(); }, []);

  async function fetchMyOffers() {
    setLoading(true);
    try {
      const data = await offersService.getMyOffers();
      setOffers(data.items || data);
    } catch (err) {
      setOffers(DEMO_MY_OFFERS);
    } finally {
      setLoading(false);
    }
  }

  async function handleDelete(offerId) {
    if (!window.confirm('Supprimer cette offre ?')) return;
    try {
      await offersService.deleteOffer(offerId);
      setOffers(offers.filter(o => o.id !== offerId));
    } catch (err) {
      setOffers(offers.filter(o => o.id !== offerId));
    }
  }

  async function handleToggleStatus(offerId, currentStatus) {
    const newStatus = String(currentStatus || '').includes('Ouverte') ? 'Fermee' : 'Ouverte';
    try {
      await offersService.updateOfferStatus(offerId, newStatus);
      setOffers(offers.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
    } catch (err) {
      setOffers(offers.map(o => o.id === offerId ? { ...o, status: newStatus } : o));
    }
  }

  if (loading) return <Loader text="Chargement de vos offres..." />;

  return (
    <div>
      <div className="page-header container">
        <div className="flex items-center justify-between">
          <div>
            <h1>Mes offres</h1>
            <p>Gérez vos offres de stage publiées.</p>
          </div>
          <Link to="/entreprise/offres/nouvelle">
            <Button variant="primary" icon={<FiPlus />}>Nouvelle offre</Button>
          </Link>
        </div>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {offers.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">📋</div>
            <p>Vous n'avez pas encore publié d'offre.</p>
            <Link to="/entreprise/offres/nouvelle"><Button variant="primary" style={{ marginTop: '1rem' }} icon={<FiPlus />}>Créer ma première offre</Button></Link>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {offers.map((offer) => (
              <Card key={offer.id} variant="flat" style={{ padding: '1.25rem' }}>
                <div className="flex items-center justify-between">
                  <div style={{ flex: 1 }}>
                    <div className="flex items-center gap-2" style={{ marginBottom: '0.5rem' }}>
                      <h4 style={{ fontSize: '1rem', margin: 0 }}>{offer.title}</h4>
                      <StatusPill status={offer.status === 'Ouverte' ? 'success' : 'error'}>{offer.status}</StatusPill>
                      <Badge size="sm">{offer.level}</Badge>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-muted">
                      <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
                      <span className="flex items-center gap-1"><FiClock /> {offer.duration} mois</span>
                      <span>{offer.compensation}</span>
                      <span className="flex items-center gap-1"><FiUsers /> {offer.applications || 0} candidature(s)</span>
                    </div>
                    <div className="flex flex-wrap gap-1" style={{ marginTop: '0.5rem' }}>
                      {(offer.skills || []).map(s => <Badge key={s} size="sm">{s}</Badge>)}
                    </div>
                  </div>
                  <div className="flex gap-1">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleToggleStatus(offer.id, offer.status)}
                      style={{ color: String(offer.status || '').includes('Ouverte') ? 'var(--status-error)' : 'var(--status-success)' }}
                    >
                      {String(offer.status || '').includes('Ouverte') ? 'Fermer' : 'Rouvrir'}
                    </Button>
                    <Link to={`/entreprise/offres/${offer.id}/candidatures`}>
                      <Button variant="ghost" size="sm" icon={<FiUsers />}>Candidatures</Button>
                    </Link>
                    <Link to={`/entreprise/offres/${offer.id}/modifier`}>
                      <Button variant="secondary" size="sm" icon={<FiEdit2 />}>Modifier</Button>
                    </Link>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(offer.id)} style={{ color: 'var(--status-error)' }} icon={<FiTrash2 />}>Supprimer</Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
