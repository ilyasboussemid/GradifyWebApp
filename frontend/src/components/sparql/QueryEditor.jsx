import React from 'react';
import Button from '../ui/Button';
import { FiPlay, FiDownload } from 'react-icons/fi';

/**
 * Éditeur de requêtes SPARQL avec bouton d'exécution.
 * Affiche les préfixes automatiques.
 */
export default function QueryEditor({
  query,
  onQueryChange,
  onExecute,
  onExport,
  loading = false,
  exportFormats = [],
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between">
        <h4 style={{ fontSize: '0.85rem', color: 'var(--muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
          Requête SPARQL
        </h4>
        <div className="flex gap-1">
          {exportFormats.map((format) => (
            <Button
              key={format}
              variant="ghost"
              size="sm"
              onClick={() => onExport(format)}
              icon={<FiDownload />}
            >
              {format.toUpperCase()}
            </Button>
          ))}
        </div>
      </div>

      <textarea
        className="textarea"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        rows={12}
        spellCheck={false}
      />

      <div className="flex justify-between items-center">
        <p className="text-xs text-muted">
          Les préfixes standard (lod:, schema:, skos:, dcterms:, rdfs:) sont ajoutés automatiquement.
        </p>
        <Button
          variant="primary"
          onClick={onExecute}
          disabled={loading || !query.trim()}
          icon={<FiPlay />}
        >
          {loading ? 'Exécution…' : 'Exécuter'}
        </Button>
      </div>
    </div>
  );
}
