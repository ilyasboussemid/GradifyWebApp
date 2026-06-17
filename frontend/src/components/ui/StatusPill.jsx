import React from 'react';
export default function StatusPill({ status, children, className = '' }) {
  const statusClass = `pill-${status}`;
  const dot = (
    <span style={{
      width: 6,
      height: 6,
      borderRadius: '50%',
      background: 'currentColor',
      display: 'inline-block',
    }} />
  );
  return (
    <span className={`pill ${statusClass} ${className}`}>
      {dot}
      {children}
    </span>
  );
}
