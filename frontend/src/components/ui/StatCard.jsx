import React from 'react';

/**
 * Card de statistique pour la page d'accueil.
 * Affiche une icône, une valeur numérique et un label.
 */
export default function StatCard({ icon, value, label, className = '' }) {
  return (
    <div className={`stat-card ${className}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-value">{value}</div>
      <div className="stat-label">{label}</div>
    </div>
  );
}
