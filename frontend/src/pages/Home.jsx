import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiBox, FiCpu, FiSearch, FiCode, FiArrowRight, FiDatabase } from 'react-icons/fi';
import StatCard from '../components/ui/StatCard';
import Button from '../components/ui/Button';
import Badge from '../components/ui/Badge';
import Card from '../components/ui/Card';
import Loader from '../components/ui/Loader';
import useSparqlStats from '../hooks/useSparqlStats';
export default function Home() {
  const { stats, loading } = useSparqlStats();
  const navigate = useNavigate();
  return (
    <div>
      <section style={{ padding: '5rem 0 3rem' }}>
        <div className="container" style={{ textAlign: 'center', maxWidth: '800px' }}>
          <div style={{ marginBottom: '1.5rem' }}>
            <span className="badge" style={{ padding: '0.4rem 1rem', fontSize: '0.8rem' }}>
              <FiDatabase style={{ marginRight: '0.25rem' }} />
              Knowledge Graph · Web Sémantique
            </span>
          </div>
          <h1 style={{ fontSize: '3.25rem', lineHeight: 1.1, letterSpacing: '-0.06em', marginBottom: '1.25rem' }}>
            Connecter les <span style={{ color: 'var(--accent)' }}>talents</span>
            <br />
            aux <span style={{ color: 'var(--accent)' }}>opportunités</span>
          </h1>
          <p style={{ fontSize: '1.15rem', color: 'var(--muted)', lineHeight: 1.7, maxWidth: '620px', margin: '0 auto 2.5rem' }}>
            Gradify exploite les technologies du Web Sémantique (RDF, SPARQL, SKOS)
            pour créer un graphe de connaissances reliant étudiants, compétences
            et offres de stage — avec un matching intelligent et transparent.
          </p>
          <div className="flex items-center justify-center gap-2">
            <Button variant="primary" size="lg" onClick={() => navigate('/offres')} icon={<FiSearch />}>
              Rechercher une offre
            </Button>
            <Button variant="secondary" size="lg" onClick={() => navigate('/sparql')} icon={<FiCode />}>
              Explorer le graphe
            </Button>
          </div>
        </div>
      </section>
      <section className="section" style={{ paddingTop: '1rem' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Le graphe en chiffres</h2>
            <p className="text-muted">Statistiques interrogées en temps réel via SPARQL</p>
          </div>
          {loading ? (
            <Loader text="Chargement des statistiques..." />
          ) : (
            <div className="grid grid-4">
              <StatCard
                icon={<FiUsers />}
                value={stats.students}
                label="Étudiants"
              />
              <StatCard
                icon={<FiBriefcase />}
                value={stats.offers}
                label="Offres de stage"
              />
              <StatCard
                icon={<FiBox />}
                value={stats.companies}
                label="Entreprises"
              />
              <StatCard
                icon={<FiCpu />}
                value={stats.skills}
                label="Compétences SKOS"
              />
            </div>
          )}
        </div>
      </section>
      <section className="section">
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Comment ça fonctionne</h2>
            <p className="text-muted">Un pipeline de données liées, de bout en bout</p>
          </div>
          <div className="grid grid-3">
            <Card>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-flex',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}>
                  1
                </span>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Données brutes → RDF</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                Les données (CSV/JSON) sont transformées en triplets RDF (Turtle/JSON-LD)
                via un pipeline ETL, avec des URIs stables et des vocabulaires standard.
              </p>
              <div className="flex flex-wrap gap-1" style={{ marginTop: '1rem' }}>
                <Badge size="sm">CSV</Badge>
                <Badge size="sm">Turtle</Badge>
                <Badge size="sm">JSON-LD</Badge>
              </div>
            </Card>
            <Card>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-flex',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}>
                  2
                </span>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Triple Store + SHACL</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                Les triplets sont chargés dans un triple store (Fuseki) et validés
                par des shapes SHACL qui garantissent la qualité et la conformité des données.
              </p>
              <div className="flex flex-wrap gap-1" style={{ marginTop: '1rem' }}>
                <Badge size="sm">Fuseki</Badge>
                <Badge size="sm">SPARQL</Badge>
                <Badge size="sm">SHACL</Badge>
              </div>
            </Card>
            <Card>
              <div style={{ marginBottom: '1rem' }}>
                <span style={{
                  display: 'inline-flex',
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  background: 'var(--accent-soft)',
                  color: 'var(--accent)',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontFamily: 'var(--font-display)',
                  fontWeight: 700,
                  fontSize: '1rem',
                }}>
                  3
                </span>
              </div>
              <h4 style={{ marginBottom: '0.5rem' }}>Matching & Portail</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.6 }}>
                Le portail interroge le graphe via SPARQL, calcule les scores de matching
                par recouvrement de compétences et présente les résultats de façon transparente.
              </p>
              <div className="flex flex-wrap gap-1" style={{ marginTop: '1rem' }}>
                <Badge size="sm">Matching</Badge>
                <Badge size="sm">SKOS</Badge>
                <Badge size="sm">API REST</Badge>
              </div>
            </Card>
          </div>
        </div>
      </section>
      <section className="section" style={{ background: 'var(--surface-muted)' }}>
        <div className="container">
          <div style={{ textAlign: 'center', marginBottom: '2.5rem' }}>
            <h2 style={{ marginBottom: '0.5rem' }}>Modèle de données</h2>
            <p className="text-muted">Les 5 entités principales du Knowledge Graph</p>
          </div>
          <div className="grid grid-3" style={{ maxWidth: '900px', margin: '0 auto' }}>
            {[
              { name: 'Student', desc: 'Profil pseudonymisé, compétences, programme', vocab: 'schema:Person' },
              { name: 'InternshipOffer', desc: 'Offre de stage avec compétences requises', vocab: 'schema:JobPosting' },
              { name: 'Company', desc: 'Entreprise : secteur, localisation', vocab: 'schema:Organization' },
              { name: 'Skill', desc: 'Compétence modélisée en SKOS', vocab: 'skos:Concept' },
              { name: 'Program', desc: 'Filière de formation', vocab: 'lod:Program' },
            ].map((entity) => (
              <Card key={entity.name} variant="flat">
                <h4 style={{ color: 'var(--accent)', marginBottom: '0.35rem', fontSize: '1rem' }}>
                  {entity.name}
                </h4>
                <p className="text-sm text-muted" style={{ marginBottom: '0.5rem' }}>{entity.desc}</p>
                <Badge size="sm">{entity.vocab}</Badge>
              </Card>
            ))}
          </div>
        </div>
      </section>
      <section className="section">
        <div className="container" style={{ textAlign: 'center' }}>
          <Card style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Prêt à explorer ?</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Parcourez les offres, explorez les compétences SKOS ou exécutez vos
              propres requêtes SPARQL sur le graphe de connaissances.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="primary" onClick={() => navigate('/offres')} icon={<FiArrowRight />}>
                Voir les offres
              </Button>
              <Button variant="secondary" onClick={() => navigate('/login')}>
                Se connecter
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
