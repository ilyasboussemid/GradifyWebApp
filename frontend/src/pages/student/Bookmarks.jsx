import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiBookmark, FiMapPin, FiBriefcase, FiClock, FiTrash2 } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import Badge from '../../components/ui/Badge';
import Button from '../../components/ui/Button';
import { useAuth } from '../../context/AuthContext';

export default function Bookmarks() {
  const { user } = useAuth();
  const [bookmarks, setBookmarks] = useState([]);

  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem(`bookmarks_${user.identifier}`) || '[]');
    setBookmarks(stored);
  }, []);

  function removeBookmark(offerId) {
    const updated = bookmarks.filter(b => b.id !== offerId);
    setBookmarks(updated);
    localStorage.setItem(`bookmarks_${user.identifier}`, JSON.stringify(updated));
  }

  return (
    <div>
      <div className="page-header container">
        <h1><FiBookmark style={{ display: 'inline', marginRight: '0.5rem', color: 'var(--accent)' }} />Mes favoris</h1>
        <p>Offres sauvegardées pour plus tard.</p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        {bookmarks.length === 0 ? (
          <div className="empty-state">
            <div className="empty-icon">⭐</div>
            <p>Aucune offre sauvegardée.</p>
            <Link to="/offres"><Button variant="primary" style={{ marginTop: '1rem' }}>Parcourir les offres</Button></Link>
          </div>
        ) : (
          <div className="grid grid-2">
            {bookmarks.map((offer) => (
              <Card key={offer.id} style={{ position: 'relative' }}>
                <Button variant="ghost" size="sm" onClick={() => removeBookmark(offer.id)} style={{ position: 'absolute', top: '0.75rem', right: '0.75rem', color: 'var(--status-error)' }} icon={<FiTrash2 />} />
                <Link to={`/offres/${offer.id}`} style={{ textDecoration: 'none' }}>
                  <Badge size="sm" style={{ marginBottom: '0.5rem' }}>{offer.level}</Badge>
                  <h4 style={{ marginBottom: '0.35rem', color: 'var(--text)' }}>{offer.title}</h4>
                  <div className="flex items-center gap-2 text-sm text-muted">
                    <span className="flex items-center gap-1"><FiBriefcase /> {offer.company}</span>
                    <span className="flex items-center gap-1"><FiMapPin /> {offer.city}</span>
                    <span className="flex items-center gap-1"><FiClock /> {offer.duration} mois</span>
                  </div>
                </Link>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
