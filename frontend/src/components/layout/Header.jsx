import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { FiLogOut, FiUser, FiShield, FiBriefcase, FiBell } from 'react-icons/fi';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState([]);
  const [showNotifs, setShowNotifs] = useState(false);

  useEffect(() => {
    if (user) fetchNotifications();
  }, [user, location.pathname]);

  async function fetchNotifications() {
    try {
      if (user.role === 'STUDENT') {
        const res = await fetch('/api/offers/my-applications', { headers: { Authorization: `Bearer ${localStorage.getItem('gradify_token')}` } });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || data;
          const notifs = items.filter(a => a.status === 'Acceptée' || a.status === 'Refusée').map(a => ({
            id: a.offerId,
            message: a.status === 'Acceptée' ? `Votre candidature pour "${a.title}" a été acceptée !` : `Votre candidature pour "${a.title}" a été déclinée.`,
            type: a.status === 'Acceptée' ? 'success' : 'error',
          }));
          setNotifications(notifs);
        }
      } else if (user.role === 'ENTERPRISE') {
        const res = await fetch('/api/offers/mine', { headers: { Authorization: `Bearer ${localStorage.getItem('gradify_token')}` } });
        if (res.ok) {
          const data = await res.json();
          const items = data.items || data;
          const totalApps = items.reduce((sum, o) => sum + (o.applications || 0), 0);
          if (totalApps > 0) {
            setNotifications([{ id: 'apps', message: `${totalApps} nouvelle(s) candidature(s) reçue(s)`, type: 'info' }]);
          }
        }
      }
    } catch (err) {}
  }

  let navLinks = [];

  if (!user) {
    navLinks = [
      { path: '/', label: 'Accueil' },
      { path: '/offres', label: 'Offres' },
    ];
  } else if (user.role === 'STUDENT') {
    navLinks = [
      { path: '/mon-espace', label: 'Mon espace' },
      { path: '/offres', label: 'Offres' },
      { path: `/etudiants/${user.identifier}`, label: 'Mon profil' },
      { path: '/favoris', label: 'Favoris' },
    ];
  } else if (user.role === 'ENTERPRISE') {
    navLinks = [
      { path: '/entreprise', label: 'Dashboard' },
      { path: '/offres', label: 'Offres' },
      { path: '/entreprise/offres', label: 'Mes offres' },
    ];
  } else if (user.role === 'ADMIN') {
    navLinks = [
      { path: '/', label: 'Accueil' },
      { path: '/offres', label: 'Offres' },
      { path: '/sparql', label: 'SPARQL' },
      { path: '/vocabulaires', label: 'Vocabulaires' },
      { path: '/admin', label: 'Admin' },
    ];
  }

  const handleLogout = () => { logout(); navigate('/'); };

  return (
    <header className="header">
      <div className="container flex items-center justify-between">
        <Link to="/" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', textDecoration: 'none' }}>
          <div style={{ width: 36, height: 36, borderRadius: '50%', background: 'linear-gradient(135deg, var(--accent), #3b82f6)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1rem' }}>G</div>
          <span style={{ fontFamily: 'var(--font-display)', fontWeight: 700, fontSize: '1.2rem', color: 'var(--text)', letterSpacing: '-0.04em' }}>Gradify</span>
        </Link>

        <nav className="flex items-center gap-1">
          {navLinks.map((link) => (
            <Link key={link.path} to={link.path} className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}>{link.label}</Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          {user ? (
            <>
              {notifications.length > 0 && (
                <div style={{ position: 'relative' }}>
                  <button onClick={() => setShowNotifs(!showNotifs)} style={{ background: 'none', border: 'none', cursor: 'pointer', position: 'relative', padding: '0.4rem' }}>
                    <FiBell style={{ fontSize: '1.2rem', color: 'var(--accent)' }} />
                    <span style={{ position: 'absolute', top: 0, right: 0, width: 16, height: 16, borderRadius: '50%', background: 'var(--status-error)', color: 'white', fontSize: '0.6rem', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{notifications.length}</span>
                  </button>
                  {showNotifs && (
                    <div style={{ position: 'absolute', top: '100%', right: 0, marginTop: '0.5rem', width: '320px', background: 'var(--surface-strong)', border: '1px solid var(--border)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow)', zIndex: 200, padding: '0.5rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, color: 'var(--muted)', display: 'block', padding: '0.5rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Notifications</span>
                      {notifications.map((n, i) => (
                        <div key={i} style={{ padding: '0.6rem 0.75rem', borderRadius: '8px', marginBottom: '0.25rem', background: n.type === 'success' ? 'var(--status-success-bg)' : n.type === 'error' ? 'var(--status-error-bg)' : 'var(--accent-light)', fontSize: '0.8rem', color: n.type === 'success' ? 'var(--status-success)' : n.type === 'error' ? 'var(--status-error)' : 'var(--accent-strong)' }}>
                          {n.message}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
              <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {user.role === 'ADMIN' && <FiShield style={{ color: 'var(--accent)' }} />}
                {user.role === 'ENTERPRISE' && <FiBriefcase style={{ color: 'var(--accent)' }} />}
                {user.role === 'STUDENT' && <FiUser style={{ color: 'var(--accent)' }} />}
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.firstName && user.lastName ? `${user.firstName} ${user.lastName}` : user.name || user.identifier}</span>
              </span>
              <Button variant="ghost" size="sm" onClick={handleLogout} icon={<FiLogOut />}>Déconnexion</Button>
            </>
          ) : (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate('/login')}>Connexion</Button>
              <Button variant="secondary" size="sm" onClick={() => navigate('/signup')}>Inscription</Button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
