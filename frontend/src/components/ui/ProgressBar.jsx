import React from 'react';
export default function ProgressBar({ value = 0, max = 100, showLabel = true, className = '', style = {} }) {
  const percentage = Math.min(100, Math.max(0, Math.round((value / max) * 100)));
  return (
    <div className={`flex items-center gap-2 ${className}`} style={style}>
      <div className="progress-bar" style={{ flex: 1 }}>
        <div className="progress-fill" style={{ width: `${percentage}%` }} />
      </div>
      {showLabel && (
        <span style={{
          fontSize: '0.8rem',
          fontWeight: 600,
          color: 'var(--accent)',
          minWidth: '3rem',
          textAlign: 'right',
        }}>
          {percentage}%
        </span>
      )}
    </div>
  );
}
