import React from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import Button from '../ui/Button';
import { FiLogOut, FiUser, FiShield, FiBriefcase, FiBookmark } from 'react-icons/fi';

export default function Header() {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

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
              <span className="flex items-center gap-1" style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>
                {user.role === 'ADMIN' && <FiShield style={{ color: 'var(--accent)' }} />}
                {user.role === 'ENTERPRISE' && <FiBriefcase style={{ color: 'var(--accent)' }} />}
                {user.role === 'STUDENT' && <FiUser style={{ color: 'var(--accent)' }} />}
                <span style={{ fontWeight: 600, color: 'var(--text)' }}>{user.name || user.identifier}</span>
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
