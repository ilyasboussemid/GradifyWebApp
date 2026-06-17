import React from 'react';

/**
 * Card avec élévation au survol.
 * Variantes : elevated (défaut), flat (sans hover effect)
 */
export default function Card({ children, variant = 'elevated', className = '', onClick, ...props }) {
  const baseClass = variant === 'flat' ? 'card-flat' : 'card';

  return (
    <div
      className={`${baseClass} ${className}`}
      onClick={onClick}
      style={onClick ? { cursor: 'pointer' } : undefined}
      {...props}
    >
      {children}
    </div>
  );
}
