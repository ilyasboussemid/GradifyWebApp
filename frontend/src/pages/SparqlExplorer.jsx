import React, { useState } from 'react';
import { FiDownload, FiPlay, FiCode, FiList } from 'react-icons/fi';
import QueryEditor from '../components/sparql/QueryEditor';
import TemplateList from '../components/sparql/TemplateList';
import Table from '../components/ui/Table';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Loader from '../components/ui/Loader';
import Pagination from '../components/ui/Pagination';
import sparqlService from '../services/sparqlService';
import { SPARQL_PREFIXES, SPARQL_TEMPLATES } from '../utils/constants';
import { sparqlResultsToCsv, downloadFile } from '../utils/formatters';

/**
 * Explorateur de requêtes SPARQL.
 * - Éditeur de requêtes avec préfixes automatiques
 * - Templates prédéfinis (15 SELECT + 3 CONSTRUCT)
 * - Résultats en table paginée
 * - Export CSV / JSON-LD / Turtle (pour CONSTRUCT)
 */

// Données de démo simulant un résultat SPARQL
const DEMO_RESULT = {
  columns: ['etudiant_id', 'niveau', 'filiere', 'ville'],
  rows: [
    { etudiant_id: 'student-0224012b0526', niveau: '3A', filiere: 'Cybersecurite', ville: 'Beni Mellal' },
    { etudiant_id: 'student-03ceaa3d0094', niveau: '3A', filiere: 'Genie de la Data', ville: 'Kenitra' },
    { etudiant_id: 'student-0c1cd280ac88', niveau: '2A', filiere: 'Genie de la Data', ville: 'Oujda' },
    { etudiant_id: 'student-1589b5f85adc', niveau: '2A', filiere: 'Genie Logiciel', ville: 'Rabat' },
    { etudiant_id: 'student-1861d794d8b7', niveau: '3A', filiere: 'Finance Digitale', ville: 'Casablanca' },
    { etudiant_id: 'student-2a4f9b7c1d3e', niveau: '2A', filiere: 'Supply Chain', ville: 'Tanger' },
    { etudiant_id: 'student-3c8e12a5f6b9', niveau: '3A', filiere: 'Cybersecurite', ville: 'Fès' },
    { etudiant_id: 'student-5d7a4e9c0b2f', niveau: '1A', filiere: 'Genie Logiciel', ville: 'Casablanca' },
    { etudiant_id: 'student-6f1b3c8d5a7e', niveau: '2A', filiere: 'Business Intelligence', ville: 'Rabat' },
    { etudiant_id: 'student-7e2d4f6a8c0b', niveau: '3A', filiere: 'Genie de la Data', ville: 'Marrakech' },
  ],
};

export default function SparqlExplorer() {
  const [query, setQuery] = useState(SPARQL_TEMPLATES[0].query);
  const [selectedTemplate, setSelectedTemplate] = useState(SPARQL_TEMPLATES[0]);
  const [results, setResults] = useState(null);
  const [columns, setColumns] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [executedQuery, setExecutedQuery] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [executionTime, setExecutionTime] = useState(null);
  const pageSize = 15;

  function handleSelectTemplate(template) {
    setSelectedTemplate(template);
    setQuery(template.query);
    setError('');
  }

  async function handleExecute() {
    setLoading(true);
    setError('');
    setResults(null);
    setCurrentPage(1);
    const startTime = Date.now();
    const fullQuery = SPARQL_PREFIXES + '\n' + query;
    setExecutedQuery(fullQuery);

    try {
      const data = await sparqlService.execute(query);

      if (data.columns && data.rows) {
        setColumns(data.columns);
        setResults(data.rows);
      } else if (Array.isArray(data)) {
        if (data.length > 0) {
          setColumns(Object.keys(data[0]));
          setResults(data);
        } else {
          setColumns([]);
          setResults([]);
        }
      } else {
        // CONSTRUCT result (string)
        setColumns(['result']);
        setResults([{ result: typeof data === 'string' ? data : JSON.stringify(data, null, 2) }]);
      }
      setExecutionTime(Date.now() - startTime);
    } catch (err) {
      // Mode démo
      if (err.message === 'Network Error' || err.code === 'ERR_NETWORK') {
        setColumns(DEMO_RESULT.columns);
        setResults(DEMO_RESULT.rows);
        setExecutionTime(42);
      } else {
        setError(err.response?.data?.message || err.message || 'Erreur lors de l\'exécution de la requête');
      }
    } finally {
      setLoading(false);
    }
  }

  function handleExportCsv() {
    if (!results || results.length === 0) return;
    const csv = sparqlResultsToCsv(results);
    downloadFile(csv, 'sparql-results.csv', 'text/csv');
  }

  function handleExportJson() {
    if (!results || results.length === 0) return;
    const json = JSON.stringify(results, null, 2);
    downloadFile(json, 'sparql-results.json', 'application/json');
  }

  function handleExportTurtle() {
    if (!results || results.length === 0) return;
    // For CONSTRUCT queries, export raw result
    const content = results[0]?.result || JSON.stringify(results, null, 2);
    downloadFile(content, 'sparql-results.ttl', 'text/turtle');
  }

  // Pagination
  const totalPages = results ? Math.ceil(results.length / pageSize) : 0;
  const paginatedResults = results ? results.slice((currentPage - 1) * pageSize, currentPage * pageSize) : [];

  // Table columns config
  const tableColumns = columns.map((col) => ({
    key: col,
    label: col.replace(/_/g, ' '),
    render: (value) => {
      if (!value) return '—';
      // Si c'est une URI, afficher seulement la partie locale
      if (typeof value === 'string' && value.startsWith('http')) {
        const local = value.split('/').pop();
        return (
          <span title={value} style={{ cursor: 'help' }}>
            <code style={{ fontSize: '0.75rem', background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>
              {local}
            </code>
          </span>
        );
      }
      return value;
    },
  }));

  return (
    <div>
      {/* Page header */}
      <div className="page-header container">
        <h1>Explorateur SPARQL</h1>
        <p>
          Exécutez des requêtes SPARQL sur le graphe de connaissances. Les préfixes standard
          (lod:, schema:, skos:, dcterms:) sont ajoutés automatiquement.
        </p>
      </div>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '2rem', alignItems: 'start' }}>
          {/* ═══ Sidebar : Templates ═══ */}
          <div style={{ position: 'sticky', top: '5rem', maxHeight: 'calc(100vh - 6rem)', overflowY: 'auto' }}>
            <div className="flex items-center gap-1" style={{ marginBottom: '1rem' }}>
              <FiList style={{ color: 'var(--accent)' }} />
              <h4 style={{ fontSize: '0.9rem' }}>Templates</h4>
            </div>
            <TemplateList onSelect={handleSelectTemplate} selectedId={selectedTemplate?.id} />
          </div>

          {/* ═══ Main : Editor + Results ═══ */}
          <div className="flex flex-col gap-3">
            {/* Query info */}
            {selectedTemplate && (
              <div className="flex items-center gap-2">
                <Badge>{selectedTemplate.type}</Badge>
                <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{selectedTemplate.name}</span>
                <span className="text-sm text-muted">— {selectedTemplate.description}</span>
              </div>
            )}

            {/* Editor */}
            <QueryEditor
              query={query}
              onQueryChange={setQuery}
              onExecute={handleExecute}
              onExport={(format) => {
                if (format === 'csv') handleExportCsv();
                else if (format === 'json') handleExportJson();
                else if (format === 'turtle') handleExportTurtle();
              }}
              loading={loading}
              exportFormats={
                results && results.length > 0
                  ? (selectedTemplate?.type === 'CONSTRUCT' ? ['turtle', 'json'] : ['csv', 'json'])
                  : []
              }
            />

            {/* Executed query (transparency) */}
            {executedQuery && (
              <details style={{ fontSize: '0.75rem' }}>
                <summary className="text-xs text-muted" style={{ cursor: 'pointer', marginBottom: '0.5rem' }}>
                  <FiCode style={{ display: 'inline', marginRight: '0.25rem' }} />
                  Requête complète exécutée (avec préfixes)
                </summary>
                <pre style={{
                  background: 'var(--surface-muted)',
                  border: '1px solid var(--border)',
                  borderRadius: 'var(--radius-md)',
                  padding: '1rem',
                  fontSize: '0.7rem',
                  overflowX: 'auto',
                  lineHeight: 1.5,
                  fontFamily: "'JetBrains Mono', 'Fira Code', monospace",
                }}>
                  {executedQuery}
                </pre>
              </details>
            )}

            {/* Error */}
            {error && (
              <div style={{
                padding: '1rem',
                borderRadius: 'var(--radius-md)',
                background: 'var(--status-error-bg)',
                color: 'var(--status-error)',
                fontSize: '0.85rem',
              }}>
                <strong>Erreur :</strong> {error}
              </div>
            )}

            {/* Loading */}
            {loading && <Loader text="Exécution de la requête..." />}

            {/* Results */}
            {results && !loading && (
              <div>
                {/* Results header */}
                <div className="flex items-center justify-between" style={{ marginBottom: '1rem' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm" style={{ fontWeight: 600 }}>
                      {results.length} résultat{results.length > 1 ? 's' : ''}
                    </span>
                    {executionTime !== null && (
                      <span className="text-xs text-muted">({executionTime} ms)</span>
                    )}
                  </div>
                  <div className="flex gap-1">
                    <Button variant="ghost" size="sm" onClick={handleExportCsv} icon={<FiDownload />}>
                      CSV
                    </Button>
                    <Button variant="ghost" size="sm" onClick={handleExportJson} icon={<FiDownload />}>
                      JSON
                    </Button>
                    {selectedTemplate?.type === 'CONSTRUCT' && (
                      <Button variant="ghost" size="sm" onClick={handleExportTurtle} icon={<FiDownload />}>
                        Turtle
                      </Button>
                    )}
                  </div>
                </div>

                {/* Table */}
                <Table
                  columns={tableColumns}
                  data={paginatedResults}
                  emptyMessage="La requête n'a retourné aucun résultat."
                />

                {/* Pagination */}
                {totalPages > 1 && (
                  <Pagination
                    currentPage={currentPage}
                    totalPages={totalPages}
                    onPageChange={setCurrentPage}
                  />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
