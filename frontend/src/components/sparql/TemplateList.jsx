import React from 'react';
import { SPARQL_TEMPLATES } from '../../utils/constants';
export default function TemplateList({ onSelect, selectedId }) {
  const selectQueries = SPARQL_TEMPLATES.filter(t => t.type === 'SELECT');
  const constructQueries = SPARQL_TEMPLATES.filter(t => t.type === 'CONSTRUCT');
  return (
    <div className="flex flex-col gap-3">
      <div>
        <h4 style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted)',
          marginBottom: '0.75rem',
        }}>
          SELECT ({selectQueries.length})
        </h4>
        <div className="flex flex-col gap-1">
          {selectQueries.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedId === template.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: selectedId === template.id ? 'var(--accent-light)' : 'var(--surface-strong)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                {template.id} — {template.name}
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </div>
      <div>
        <h4 style={{
          fontSize: '0.75rem',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          color: 'var(--muted)',
          marginBottom: '0.75rem',
        }}>
          CONSTRUCT ({constructQueries.length})
        </h4>
        <div className="flex flex-col gap-1">
          {constructQueries.map((template) => (
            <button
              key={template.id}
              onClick={() => onSelect(template)}
              style={{
                display: 'block',
                width: '100%',
                textAlign: 'left',
                padding: '0.65rem 0.85rem',
                borderRadius: 'var(--radius-sm)',
                border: selectedId === template.id ? '1.5px solid var(--accent)' : '1px solid var(--border)',
                background: selectedId === template.id ? 'var(--accent-light)' : 'var(--surface-strong)',
                cursor: 'pointer',
                transition: 'all 0.2s',
                fontFamily: 'var(--font-body)',
              }}
            >
              <span style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text)' }}>
                {template.id} — {template.name}
              </span>
              <span style={{ display: 'block', fontSize: '0.7rem', color: 'var(--muted)', marginTop: '2px' }}>
                {template.description}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
