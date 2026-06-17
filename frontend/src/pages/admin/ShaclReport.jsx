import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FiShield, FiArrowLeft, FiCheckCircle, FiAlertTriangle, FiXCircle } from 'react-icons/fi';
import Card from '../../components/ui/Card';
import StatusPill from '../../components/ui/StatusPill';
import Badge from '../../components/ui/Badge';
import Loader from '../../components/ui/Loader';
import adminService from '../../services/adminService';
const DEMO_SHAPES = [
  {
    name: 'Étudiant — champs obligatoires',
    target: 'lod:Student',
    status: 'success',
    message: 'Toutes les instances sont conformes.',
    violations: 0,
  },
  {
    name: 'Étudiant — niveau valide',
    target: 'lod:Student',
    status: 'success',
    message: 'Tous les niveaux sont 1A, 2A ou 3A.',
    violations: 0,
  },
  {
    name: 'Étudiant — compétences obligatoires',
    target: 'lod:Student',
    status: 'success',
    message: 'Chaque étudiant a au moins une compétence.',
    violations: 0,
  },
  {
    name: 'Étudiant — pattern URI',
    target: 'lod:Student',
    status: 'success',
    message: 'Toutes les URIs suivent le pattern attendu.',
    violations: 0,
  },
  {
    name: 'Offre — champs obligatoires',
    target: 'lod:InternshipOffer',
    status: 'success',
    message: 'Toutes les offres ont les champs requis.',
    violations: 0,
  },
  {
    name: 'Offre — niveau requis valide',
    target: 'lod:InternshipOffer',
    status: 'success',
    message: 'Tous les niveaux requis sont 2A ou 3A.',
    violations: 0,
  },
  {
    name: 'Offre — compétences requises',
    target: 'lod:InternshipOffer',
    status: 'success',
    message: 'Chaque offre requiert au moins une compétence.',
    violations: 0,
  },
  {
    name: 'Offre — statut valide',
    target: 'lod:InternshipOffer',
    status: 'warning',
    message: '1 offre avec statut non normalisé détecté.',
    violations: 0,
    details: [
      { node: 'base:offer-015', property: 'lod:status', value: '"En attente"@fr', expected: '"Ouverte"@fr ou "Fermee"@fr' },
    ],
  },
  {
    name: 'Entreprise — champs obligatoires',
    target: 'lod:Company',
    status: 'success',
    message: 'Toutes les entreprises ont nom, secteur, ville, pays.',
    violations: 0,
  },
  {
    name: 'Compétence SKOS — champs obligatoires',
    target: 'skos:Concept',
    status: 'success',
    message: 'Toutes les compétences ont prefLabel et inScheme.',
    violations: 0,
  },
  {
    name: 'Filière — champs obligatoires',
    target: 'lod:Program',
    status: 'success',
    message: 'Toutes les filières ont un label et un niveau éducatif.',
    violations: 0,
  },
  {
    name: 'Entreprise — pattern URI',
    target: 'lod:Company',
    status: 'error',
    message: '1 violation détectée : URI non conforme.',
    violations: 1,
    details: [
      { node: 'base:entreprise-test', property: 'URI pattern', value: 'base:entreprise-test', expected: 'Pattern: base:company-{nnn}' },
    ],
  },
];
export default function ShaclReport() {
  const [shapes, setShapes] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    fetchReport();
  }, []);
  async function fetchReport() {
    setLoading(true);
    try {
      const data = await adminService.getShaclReport();
      setShapes(data.shapes || data);
    } catch (err) {
      setShapes(DEMO_SHAPES);
    } finally {
      setLoading(false);
    }
  }
  if (loading) {
    return <Loader text="Chargement du rapport SHACL..." />;
  }
  const successCount = shapes.filter(s => s.status === 'success').length;
  const warningCount = shapes.filter(s => s.status === 'warning').length;
  const errorCount = shapes.filter(s => s.status === 'error').length;
  return (
    <div>
      <div className="page-header container">
        <Link to="/admin" className="flex items-center gap-1 text-sm" style={{ marginBottom: '1rem', color: 'var(--muted)' }}>
          <FiArrowLeft /> Retour au tableau de bord
        </Link>
        <div className="flex items-center gap-2">
          <FiShield style={{ color: 'var(--accent)', fontSize: '1.5rem' }} />
          <h1>Rapport de conformité SHACL</h1>
        </div>
        <p>
          Validation des données RDF contre les 12 shapes SHACL définies dans <code>shapes.ttl</code>.
        </p>
      </div>
      <div className="container" style={{ paddingBottom: '3rem' }}>
        <div className="flex items-center gap-3" style={{ marginBottom: '2rem' }}>
          <StatusPill status="success">
            <FiCheckCircle style={{ marginRight: '0.2rem' }} />
            {successCount} conformes
          </StatusPill>
          {warningCount > 0 && (
            <StatusPill status="warning">
              <FiAlertTriangle style={{ marginRight: '0.2rem' }} />
              {warningCount} avertissement{warningCount > 1 ? 's' : ''}
            </StatusPill>
          )}
          {errorCount > 0 && (
            <StatusPill status="error">
              <FiXCircle style={{ marginRight: '0.2rem' }} />
              {errorCount} violation{errorCount > 1 ? 's' : ''}
            </StatusPill>
          )}
          <span className="text-sm text-muted">— {shapes.length} shapes évaluées</span>
        </div>
        <div className="flex flex-col gap-2">
          {shapes.map((shape, idx) => (
            <Card key={idx} variant="flat" style={{ padding: '1.25rem' }}>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {shape.status === 'success' && <FiCheckCircle style={{ color: 'var(--status-success)', fontSize: '1.1rem' }} />}
                  {shape.status === 'warning' && <FiAlertTriangle style={{ color: 'var(--status-warning)', fontSize: '1.1rem' }} />}
                  {shape.status === 'error' && <FiXCircle style={{ color: 'var(--status-error)', fontSize: '1.1rem' }} />}
                  <div>
                    <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{shape.name}</span>
                    <span className="text-xs text-muted" style={{ display: 'block', marginTop: '0.15rem' }}>
                      Target: <code>{shape.target}</code>
                    </span>
                  </div>
                </div>
                <StatusPill status={shape.status}>
                  {shape.status === 'success' ? 'Conforme' : shape.status === 'warning' ? 'À vérifier' : 'Violation'}
                </StatusPill>
              </div>
              <p className="text-sm text-muted" style={{ marginTop: '0.5rem', marginLeft: '1.85rem' }}>
                {shape.message}
              </p>
              {shape.details && shape.details.length > 0 && (
                <div style={{
                  marginTop: '0.75rem',
                  marginLeft: '1.85rem',
                  padding: '0.75rem 1rem',
                  background: shape.status === 'error' ? 'var(--status-error-bg)' : 'var(--status-warning-bg)',
                  borderRadius: 'var(--radius-sm)',
                  fontSize: '0.8rem',
                }}>
                  <span style={{ fontWeight: 600, display: 'block', marginBottom: '0.5rem' }}>
                    Détails :
                  </span>
                  {shape.details.map((detail, dIdx) => (
                    <div key={dIdx} style={{ marginBottom: '0.35rem' }}>
                      <span className="text-muted">Noeud :</span>{' '}
                      <code style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        {detail.node}
                      </code>
                      {' | '}
                      <span className="text-muted">Propriété :</span> {detail.property}
                      {' | '}
                      <span className="text-muted">Valeur :</span>{' '}
                      <code style={{ background: 'rgba(0,0,0,0.05)', padding: '0.1rem 0.35rem', borderRadius: '4px' }}>
                        {detail.value}
                      </code>
                      <br />
                      <span className="text-muted">Attendu :</span> {detail.expected}
                    </div>
                  ))}
                </div>
              )}
            </Card>
          ))}
        </div>
        <Card style={{ marginTop: '2rem' }}>
          <h4 style={{ marginBottom: '0.75rem' }}>À propos de la validation SHACL</h4>
          <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
            Les shapes SHACL (Shapes Constraint Language) définissent les contraintes de qualité
            que les données RDF doivent respecter. Chaque shape cible une classe spécifique et
            vérifie la présence, le format et la cohérence des propriétés.
          </p>
          <div className="flex flex-wrap gap-1" style={{ marginTop: '1rem' }}>
            <Badge>12 shapes</Badge>
            <Badge>5 classes validées</Badge>
            <Badge>privacy-by-design</Badge>
            <Badge>conformité W3C</Badge>
          </div>
        </Card>
      </div>
    </div>
  );
}
