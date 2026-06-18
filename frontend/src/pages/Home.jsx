import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { FiUsers, FiBriefcase, FiBox, FiCpu, FiSearch, FiArrowRight } from 'react-icons/fi';
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
              Gradify · Find Your Future
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
            <Button variant="secondary" size="lg" onClick={() => navigate('/offres')}>
              Découvrir les offres
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
        <div className="container" style={{ textAlign: 'center' }}>
          <Card style={{ maxWidth: '650px', margin: '0 auto', padding: '3rem' }}>
            <h3 style={{ marginBottom: '0.75rem' }}>Prêt à explorer ?</h3>
            <p className="text-muted" style={{ marginBottom: '1.5rem', lineHeight: 1.6 }}>
              Parcourez les offres, découvrez les compétences recherchées
              et trouvez le stage qui correspond à votre profil.
            </p>
            <div className="flex items-center justify-center gap-2">
              <Button variant="primary" onClick={() => navigate('/offres')} icon={<FiArrowRight />}>
                Voir les offres
              </Button>
              <Button variant="secondary" onClick={() => navigate('/signup')}>
                S'inscrire
              </Button>
            </div>
          </Card>
        </div>
      </section>
    </div>
  );
}
