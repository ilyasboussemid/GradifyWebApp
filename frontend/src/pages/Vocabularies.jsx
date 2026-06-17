import React from 'react';
import { FiExternalLink, FiBook, FiLayers, FiDatabase, FiPlus } from 'react-icons/fi';
import Card from '../components/ui/Card';
import Badge from '../components/ui/Badge';

/**
 * Page Vocabulaires & Documentation.
 * Explique les vocabulaires utilisés (schema.org, SKOS, FOAF, dcterms),
 * les conventions d'URI, et un guide d'ajout de nouvelles données.
 */
export default function Vocabularies() {
  return (
    <div>
      {/* Page header */}
      <div className="page-header container">
        <h1>Vocabulaires & Documentation</h1>
        <p>
          Vocabulaires RDF utilisés dans le Knowledge Graph Gradify, conventions d'URI
          et guide d'intégration de nouvelles données.
        </p>
      </div>

      <div className="container" style={{ paddingBottom: '3rem' }}>
        {/* ═══════════════════ VOCABULAIRES ═══════════════════ */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <FiBook style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Vocabulaires utilisés</h2>
          </div>

          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {/* Schema.org */}
            <Card>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Badge>schema:</Badge>
                <h4 style={{ fontSize: '1rem' }}>Schema.org</h4>
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                Vocabulaire de référence pour décrire les personnes, organisations et offres d'emploi.
                Utilisé pour les propriétés communes et l'interopérabilité avec les moteurs de recherche.
              </p>
              <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>schema:Person</code>
                  <span className="text-muted">→ Étudiants</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>schema:Organization</code>
                  <span className="text-muted">→ Entreprises (via lod:Company)</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>schema:JobPosting</code>
                  <span className="text-muted">→ Offres de stage</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>schema:jobLocation</code>
                  <span className="text-muted">→ Ville de l'offre/étudiant</span>
                </div>
              </div>
              <a href="https://schema.org/" target="_blank" rel="noopener" className="flex items-center gap-1 text-sm" style={{ marginTop: '1rem' }}>
                <FiExternalLink /> schema.org
              </a>
            </Card>

            {/* SKOS */}
            <Card>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Badge>skos:</Badge>
                <h4 style={{ fontSize: '1rem' }}>SKOS (Simple Knowledge Organization System)</h4>
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                Standard W3C pour la représentation de thésaurus et taxonomies.
                Utilisé pour modéliser les compétences avec une hiérarchie (catégories → compétences spécifiques).
              </p>
              <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>skos:Concept</code>
                  <span className="text-muted">→ Chaque compétence</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>skos:prefLabel</code>
                  <span className="text-muted">→ Nom de la compétence</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>skos:broader</code>
                  <span className="text-muted">→ Catégorie parente</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>skos:inScheme</code>
                  <span className="text-muted">→ Appartenance au schéma global</span>
                </div>
              </div>
              <a href="https://www.w3.org/2004/02/skos/" target="_blank" rel="noopener" className="flex items-center gap-1 text-sm" style={{ marginTop: '1rem' }}>
                <FiExternalLink /> W3C SKOS
              </a>
            </Card>

            {/* Dublin Core */}
            <Card>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Badge>dcterms:</Badge>
                <h4 style={{ fontSize: '1rem' }}>Dublin Core Terms</h4>
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                Métadonnées descriptives standard. Utilisé principalement pour les identifiants
                et les dates de création des ressources.
              </p>
              <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>dcterms:identifier</code>
                  <span className="text-muted">→ ID pseudonymisé des étudiants</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>dcterms:created</code>
                  <span className="text-muted">→ Date de publication d'une offre</span>
                </div>
              </div>
              <a href="https://www.dublincore.org/specifications/dublin-core/dcmi-terms/" target="_blank" rel="noopener" className="flex items-center gap-1 text-sm" style={{ marginTop: '1rem' }}>
                <FiExternalLink /> Dublin Core
              </a>
            </Card>

            {/* FOAF */}
            <Card>
              <div className="flex items-center gap-2" style={{ marginBottom: '0.75rem' }}>
                <Badge>foaf:</Badge>
                <h4 style={{ fontSize: '1rem' }}>FOAF (Friend of a Friend)</h4>
              </div>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
                Vocabulaire historique pour décrire les personnes et leurs relations.
                Utilisé de façon complémentaire à schema:Person pour certaines propriétés sociales.
              </p>
              <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>foaf:Person</code>
                  <span className="text-muted">→ Classe alternative pour les étudiants</span>
                </div>
                <div className="flex items-center gap-2">
                  <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>foaf:Organization</code>
                  <span className="text-muted">→ Classe alternative pour les entreprises</span>
                </div>
              </div>
              <a href="http://xmlns.com/foaf/0.1/" target="_blank" rel="noopener" className="flex items-center gap-1 text-sm" style={{ marginTop: '1rem' }}>
                <FiExternalLink /> FOAF Spec
              </a>
            </Card>
          </div>
        </section>

        {/* ═══════════════════ ONTOLOGIE LOCALE ═══════════════════ */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <FiLayers style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Ontologie locale (lod:)</h2>
          </div>

          <Card variant="flat">
            <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>
              L'ontologie locale <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px' }}>lod:</code> étend
              les vocabulaires standards pour modéliser les concepts spécifiques au domaine.
              Namespace : <strong>https://data.lod-school.ma/ontology#</strong>
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Classe / Propriété</th>
                    <th>Type</th>
                    <th>Description</th>
                  </tr>
                </thead>
                <tbody>
                  <tr><td><code>lod:Student</code></td><td>Classe</td><td>Étudiant inscrit (pseudonymisé)</td></tr>
                  <tr><td><code>lod:InternshipOffer</code></td><td>Classe</td><td>Offre de stage</td></tr>
                  <tr><td><code>lod:Company</code></td><td>Classe</td><td>Entreprise proposant des stages</td></tr>
                  <tr><td><code>lod:Program</code></td><td>Classe</td><td>Filière / programme de formation</td></tr>
                  <tr><td><code>lod:hasSkill</code></td><td>ObjectProperty</td><td>Étudiant → Compétence SKOS</td></tr>
                  <tr><td><code>lod:requiresSkill</code></td><td>ObjectProperty</td><td>Offre → Compétence SKOS requise</td></tr>
                  <tr><td><code>lod:enrolledIn</code></td><td>ObjectProperty</td><td>Étudiant → Programme</td></tr>
                  <tr><td><code>lod:postedBy</code></td><td>ObjectProperty</td><td>Offre → Entreprise</td></tr>
                  <tr><td><code>lod:level</code></td><td>DataProperty</td><td>Niveau de l'étudiant (1A, 2A, 3A)</td></tr>
                  <tr><td><code>lod:levelRequired</code></td><td>DataProperty</td><td>Niveau requis par l'offre</td></tr>
                  <tr><td><code>lod:status</code></td><td>DataProperty</td><td>Statut de l'offre (Ouverte / Fermee)</td></tr>
                  <tr><td><code>lod:sector</code></td><td>DataProperty</td><td>Secteur d'activité de l'entreprise</td></tr>
                  <tr><td><code>lod:durationMonths</code></td><td>DataProperty</td><td>Durée du stage en mois</td></tr>
                  <tr><td><code>lod:compensation</code></td><td>DataProperty</td><td>Rémunération du stage</td></tr>
                  <tr><td><code>lod:academicYear</code></td><td>DataProperty</td><td>Année académique de l'étudiant</td></tr>
                  <tr><td><code>lod:mention</code></td><td>DataProperty</td><td>Mention obtenue (sans notes détaillées)</td></tr>
                </tbody>
              </table>
            </div>
          </Card>
        </section>

        {/* ═══════════════════ CONVENTIONS D'URI ═══════════════════ */}
        <section style={{ marginBottom: '3rem' }}>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <FiDatabase style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Conventions d'URI</h2>
          </div>

          <Card variant="flat">
            <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1.5rem' }}>
              Toutes les URIs suivent un pattern stable et prédictible basé sur le namespace
              <code style={{ background: 'var(--accent-light)', padding: '0.15rem 0.4rem', borderRadius: '4px', margin: '0 0.25rem' }}>
                https://data.lod-school.ma/id/
              </code>
            </p>

            <div className="table-container">
              <table className="table">
                <thead>
                  <tr>
                    <th>Entité</th>
                    <th>Pattern d'URI</th>
                    <th>Exemple</th>
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>Étudiant</td>
                    <td><code>base:student-{'{hash}'}</code></td>
                    <td><code>base:student-0224012b0526</code></td>
                  </tr>
                  <tr>
                    <td>Offre</td>
                    <td><code>base:offer-{'{nnn}'}</code></td>
                    <td><code>base:offer-001</code></td>
                  </tr>
                  <tr>
                    <td>Entreprise</td>
                    <td><code>base:company-{'{nnn}'}</code></td>
                    <td><code>base:company-004</code></td>
                  </tr>
                  <tr>
                    <td>Compétence</td>
                    <td><code>base:skill-{'{hash}'}</code></td>
                    <td><code>base:skill-18885f27b5af</code></td>
                  </tr>
                  <tr>
                    <td>Programme</td>
                    <td><code>base:program-{'{hash}'}</code></td>
                    <td><code>base:program-c2d6c1425e9c</code></td>
                  </tr>
                  <tr>
                    <td>Catégorie SKOS</td>
                    <td><code>base:skill-cat-{'{slug}'}</code></td>
                    <td><code>base:skill-cat-cybersecurite</code></td>
                  </tr>
                  <tr>
                    <td>Schéma compétences</td>
                    <td><code>base:skill-scheme</code></td>
                    <td><code>base:skill-scheme</code> (unique)</td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div style={{
              marginTop: '1.5rem',
              padding: '1rem',
              background: 'var(--accent-light)',
              borderRadius: 'var(--radius-md)',
              fontSize: '0.8rem',
              lineHeight: 1.6,
            }}>
              <strong>Note :</strong> Les IDs des étudiants sont des hash pseudonymisés générés à partir
              des données d'origine. Ils ne permettent pas de remonter à l'identité réelle de l'étudiant
              (privacy-by-design).
            </div>
          </Card>
        </section>

        {/* ═══════════════════ GUIDE D'AJOUT DE DONNÉES ═══════════════════ */}
        <section>
          <div className="flex items-center gap-2" style={{ marginBottom: '1.5rem' }}>
            <FiPlus style={{ color: 'var(--accent)', fontSize: '1.25rem' }} />
            <h2 style={{ fontSize: '1.5rem' }}>Guide d'ajout de nouvelles données</h2>
          </div>

          <div className="grid grid-2" style={{ gap: '1.5rem' }}>
            {/* Étape 1 */}
            <Card variant="flat">
              <Badge style={{ marginBottom: '0.75rem' }}>Étape 1</Badge>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Préparer les données brutes</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
                Ajoutez vos données dans des fichiers CSV avec les colonnes correspondant
                aux propriétés du modèle. Respectez les formats existants dans <code>data/csv/</code>.
              </p>
              <pre style={{
                marginTop: '0.75rem',
                background: 'var(--surface-muted)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                overflow: 'auto',
              }}>
{`# Exemple : offers.csv
id,title,company_id,city,duration,...
offer-050,Data Engineer,company-003,Rabat,4,...`}
              </pre>
            </Card>

            {/* Étape 2 */}
            <Card variant="flat">
              <Badge style={{ marginBottom: '0.75rem' }}>Étape 2</Badge>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Convertir en RDF (Turtle)</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
                Utilisez le script de conversion ETL pour transformer les CSV en triplets RDF.
                Le fichier généré doit utiliser les préfixes et patterns d'URI documentés ci-dessus.
              </p>
              <pre style={{
                marginTop: '0.75rem',
                background: 'var(--surface-muted)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                overflow: 'auto',
              }}>
{`base:offer-050 a lod:InternshipOffer,
        schema:JobPosting ;
    schema:title "Data Engineer"@fr ;
    lod:postedBy base:company-003 ;
    schema:jobLocation "Rabat" ;
    lod:durationMonths 4 .`}
              </pre>
            </Card>

            {/* Étape 3 */}
            <Card variant="flat">
              <Badge style={{ marginBottom: '0.75rem' }}>Étape 3</Badge>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Valider avec SHACL</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
                Exécutez la validation SHACL pour vérifier la conformité des nouvelles données
                avec les shapes définies dans <code>shapes.ttl</code>.
              </p>
              <pre style={{
                marginTop: '0.75rem',
                background: 'var(--surface-muted)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                overflow: 'auto',
              }}>
{`python validate_shacl.py
# → Conforms: True / False
# → Liste des violations si applicable`}
              </pre>
            </Card>

            {/* Étape 4 */}
            <Card variant="flat">
              <Badge style={{ marginBottom: '0.75rem' }}>Étape 4</Badge>
              <h4 style={{ marginBottom: '0.5rem', fontSize: '1rem' }}>Charger dans le Triple Store</h4>
              <p className="text-sm text-muted" style={{ lineHeight: 1.7 }}>
                Une fois validées, chargez les données dans Fuseki via l'API HTTP
                ou l'interface web d'administration.
              </p>
              <pre style={{
                marginTop: '0.75rem',
                background: 'var(--surface-muted)',
                padding: '0.75rem',
                borderRadius: '8px',
                fontSize: '0.7rem',
                overflow: 'auto',
              }}>
{`# Via curl
curl -X POST \\
  http://localhost:3030/lod/data \\
  -H "Content-Type: text/turtle" \\
  --data-binary @data/ttl/new_offers.ttl`}
              </pre>
            </Card>
          </div>

          {/* Liens externes */}
          <Card style={{ marginTop: '1.5rem' }}>
            <h4 style={{ marginBottom: '1rem' }}>Liens externes optionnels (owl:sameAs)</h4>
            <p className="text-sm text-muted" style={{ lineHeight: 1.7, marginBottom: '1rem' }}>
              Les compétences peuvent être liées à des vocabulaires externes pour l'interopérabilité :
            </p>
            <div className="flex flex-col gap-1" style={{ fontSize: '0.8rem' }}>
              <div className="flex items-center gap-2">
                <Badge size="sm">ESCO</Badge>
                <span className="text-muted">European Skills, Competences and Occupations</span>
                <a href="https://esco.ec.europa.eu/" target="_blank" rel="noopener"><FiExternalLink /></a>
              </div>
              <div className="flex items-center gap-2">
                <Badge size="sm">Wikidata</Badge>
                <span className="text-muted">Base de connaissances libre et collaborative</span>
                <a href="https://www.wikidata.org/" target="_blank" rel="noopener"><FiExternalLink /></a>
              </div>
            </div>
            <pre style={{
              marginTop: '1rem',
              background: 'var(--surface-muted)',
              padding: '0.75rem',
              borderRadius: '8px',
              fontSize: '0.7rem',
              overflow: 'auto',
            }}>
{`# Exemple de lien owl:sameAs
base:skill-18885f27b5af
    owl:sameAs <http://data.europa.eu/esco/skill/python> ;
    owl:sameAs <http://www.wikidata.org/entity/Q28865> .`}
            </pre>
          </Card>
        </section>
      </div>
    </div>
  );
}
