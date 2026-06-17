import React from 'react';
import { Link } from 'react-router-dom';

/**
 * Footer de la plateforme Gradify.
 */
export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '2rem' }}>
          {/* Branding */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '1rem' }}>Gradify</h4>
            <p className="text-muted text-sm" style={{ lineHeight: 1.6 }}>
              Plateforme de données liées pour le matching étudiants-stages.
              Propulsée par les technologies du Web Sémantique.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
              Navigation
            </h4>
            <div className="flex flex-col gap-1">
              <Link to="/offres" className="text-sm">Offres de stage</Link>
              <Link to="/sparql" className="text-sm">Explorateur SPARQL</Link>
              <Link to="/vocabulaires" className="text-sm">Vocabulaires</Link>
            </div>
          </div>

          {/* Technologies */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
              Technologies
            </h4>
            <div className="flex flex-col gap-1 text-sm text-muted">
              <span>RDF / Turtle / JSON-LD</span>
              <span>SPARQL 1.1</span>
              <span>SKOS / Schema.org / FOAF</span>
              <span>SHACL (validation)</span>
            </div>
          </div>

          {/* Contexte */}
          <div>
            <h4 style={{ marginBottom: '0.75rem', fontSize: '0.85rem', textTransform: 'uppercase', letterSpacing: '0.08em', color: 'var(--muted)' }}>
              Projet
            </h4>
            <p className="text-sm text-muted">
              Projet académique S4 — Web Sémantique &amp; Linked Open Data.
              Knowledge Graphs appliqués à l'orientation étudiante.
            </p>
          </div>
        </div>

        <div style={{ borderTop: '1px solid var(--border)', marginTop: '2rem', paddingTop: '1.5rem', textAlign: 'center' }}>
          <p className="text-xs text-muted">
            © 2025 Gradify — Privacy by design. Les données étudiants sont pseudonymisées.
          </p>
        </div>
      </div>
    </footer>
  );
}
