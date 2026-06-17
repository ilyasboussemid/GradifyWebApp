import React from 'react';

/**
 * Badge / Pill pour les compétences SKOS.
 * Affiche en bleu clair avec texte bleu foncé.
 */
export default function Badge({ children, size = 'md', className = '', ...props }) {
  const sizeClass = size === 'sm' ? 'badge-sm' : '';

  return (
    <span className={`badge ${sizeClass} ${className}`} {...props}>
      {children}
    </span>
  );
}
