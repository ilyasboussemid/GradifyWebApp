import React from 'react';

/**
 * Spinner de chargement centré.
 */
export default function Loader({ text = 'Chargement...' }) {
  return (
    <div className="loader">
      <div style={{ textAlign: 'center' }}>
        <div className="loader-spinner" />
        <p className="text-muted text-sm" style={{ marginTop: '1rem' }}>{text}</p>
      </div>
    </div>
  );
}
