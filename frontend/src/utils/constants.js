/**
 * Templates SPARQL prédéfinis pour l'explorateur de requêtes.
 * 15 SELECT + 3 CONSTRUCT conformes au cahier des charges.
 */
export const SPARQL_TEMPLATES = [
  // ═══════ SELECT QUERIES ═══════
  {
    id: 'Q1',
    name: 'Liste des étudiants',
    description: 'Tous les étudiants avec filière, niveau et ville',
    type: 'SELECT',
    query: `SELECT ?etudiant ?id ?niveau ?filiere ?ville ?mention
WHERE {
    ?etudiant a lod:Student ;
              dcterms:identifier ?id ;
              lod:level ?niveau ;
              lod:enrolledIn ?prog ;
              schema:addressLocality ?ville ;
              lod:mention ?mention .
    ?prog rdfs:label ?filiere .
}
ORDER BY ?filiere ?niveau`,
  },
  {
    id: 'Q2',
    name: 'Toutes les offres de stage',
    description: 'Offres avec titre, entreprise, ville et statut',
    type: 'SELECT',
    query: `SELECT ?offre ?titre ?entreprise ?ville ?statut ?compensation
WHERE {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:postedBy ?comp ;
           schema:jobLocation ?ville ;
           lod:status ?statut ;
           lod:compensation ?compensation .
    ?comp schema:name ?entreprise .
}
ORDER BY ?ville ?titre`,
  },
  {
    id: 'Q3',
    name: 'Offres par compétence',
    description: 'Offres nécessitant une compétence spécifique',
    type: 'SELECT',
    query: `SELECT ?offre ?titre ?entreprise ?competence
WHERE {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:requiresSkill ?skill ;
           lod:postedBy ?comp ;
           lod:status "Ouverte"@fr .
    ?comp schema:name ?entreprise .
    ?skill skos:prefLabel ?competence .
    FILTER (lang(?competence) = "fr")
}
ORDER BY ?competence ?titre`,
  },
  {
    id: 'Q4',
    name: 'Entreprises avec nombre d\'offres',
    description: 'Classement des entreprises par nombre d\'offres',
    type: 'SELECT',
    query: `SELECT ?entreprise ?secteur ?ville (COUNT(?offre) AS ?nb_offres)
WHERE {
    ?offre a lod:InternshipOffer ;
           lod:postedBy ?comp .
    ?comp schema:name ?entreprise ;
          lod:sector ?secteur ;
          schema:addressLocality ?ville .
}
GROUP BY ?entreprise ?secteur ?ville
ORDER BY DESC(?nb_offres)`,
  },
  {
    id: 'Q5',
    name: 'Matching étudiants ↔ offres',
    description: 'Top correspondances par compétences communes',
    type: 'SELECT',
    query: `SELECT ?etudiant_id ?offre ?titre ?entreprise
       (COUNT(?skillCommun) AS ?nb_competences_communes)
WHERE {
    ?etudiant a lod:Student ;
              dcterms:identifier ?etudiant_id ;
              lod:hasSkill ?skillCommun .
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:requiresSkill ?skillCommun ;
           lod:postedBy ?comp ;
           lod:status "Ouverte"@fr .
    ?comp schema:name ?entreprise .
}
GROUP BY ?etudiant_id ?offre ?titre ?entreprise
ORDER BY DESC(?nb_competences_communes)
LIMIT 20`,
  },
  {
    id: 'Q6',
    name: 'Étudiants par programme/filière',
    description: 'Nombre d\'étudiants par filière',
    type: 'SELECT',
    query: `SELECT ?filiere (COUNT(?e) AS ?nb_etudiants)
WHERE {
    ?e a lod:Student ;
       lod:enrolledIn ?prog .
    ?prog rdfs:label ?filiere .
}
GROUP BY ?filiere
ORDER BY DESC(?nb_etudiants)`,
  },
  {
    id: 'Q7',
    name: 'Compétences requises par offre',
    description: 'Liste des compétences pour chaque offre ouverte',
    type: 'SELECT',
    query: `SELECT ?titre ?competence ?categorie
WHERE {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:requiresSkill ?skill ;
           lod:status "Ouverte"@fr .
    ?skill skos:prefLabel ?competence ;
           skos:broader ?cat .
    ?cat skos:prefLabel ?categorie .
    FILTER (lang(?competence) = "fr")
    FILTER (lang(?categorie) = "fr")
}
ORDER BY ?titre ?categorie`,
  },
  {
    id: 'Q8',
    name: 'Étudiants compatibles avec une offre',
    description: 'Étudiants ayant le plus de compétences en commun avec une offre',
    type: 'SELECT',
    query: `SELECT ?etudiant_id ?filiere (COUNT(?skill) AS ?score)
WHERE {
    ?offre a lod:InternshipOffer ;
           lod:requiresSkill ?skill ;
           lod:status "Ouverte"@fr .
    ?etudiant a lod:Student ;
              dcterms:identifier ?etudiant_id ;
              lod:hasSkill ?skill ;
              lod:enrolledIn ?prog .
    ?prog rdfs:label ?filiere .
}
GROUP BY ?etudiant_id ?filiere
ORDER BY DESC(?score)
LIMIT 15`,
  },
  {
    id: 'Q9',
    name: 'Détail d\'une entreprise',
    description: 'Informations complètes sur les entreprises',
    type: 'SELECT',
    query: `SELECT ?entreprise ?secteur ?ville ?pays ?site_web
WHERE {
    ?comp a lod:Company ;
          schema:name ?entreprise ;
          lod:sector ?secteur ;
          schema:addressLocality ?ville ;
          schema:addressCountry ?pays .
    OPTIONAL { ?comp schema:url ?site_web . }
}
ORDER BY ?entreprise`,
  },
  {
    id: 'Q10',
    name: 'Statistiques d\'usage des compétences',
    description: 'Compétences les plus demandées et détenues',
    type: 'SELECT',
    query: `SELECT ?competence
       (COUNT(DISTINCT ?offre) AS ?demandee_par)
       (COUNT(DISTINCT ?etudiant) AS ?detenue_par)
WHERE {
    ?skill a skos:Concept ;
           skos:prefLabel ?competence .
    OPTIONAL {
        ?offre lod:requiresSkill ?skill .
    }
    OPTIONAL {
        ?etudiant lod:hasSkill ?skill .
    }
    FILTER (lang(?competence) = "fr")
}
GROUP BY ?competence
ORDER BY DESC(?demandee_par)`,
  },
  {
    id: 'Q11',
    name: 'Offres par entreprise (comptage)',
    description: 'Nombre d\'offres ouvertes/fermées par entreprise',
    type: 'SELECT',
    query: `SELECT ?entreprise ?statut (COUNT(?offre) AS ?nb)
WHERE {
    ?offre a lod:InternshipOffer ;
           lod:postedBy ?comp ;
           lod:status ?statut .
    ?comp schema:name ?entreprise .
}
GROUP BY ?entreprise ?statut
ORDER BY ?entreprise`,
  },
  {
    id: 'Q12',
    name: 'Étudiants multi-compétences',
    description: 'Étudiants avec le plus de compétences',
    type: 'SELECT',
    query: `SELECT ?etudiant_id ?filiere (COUNT(?skill) AS ?nb_competences)
WHERE {
    ?e a lod:Student ;
       dcterms:identifier ?etudiant_id ;
       lod:hasSkill ?skill ;
       lod:enrolledIn ?prog .
    ?prog rdfs:label ?filiere .
}
GROUP BY ?etudiant_id ?filiere
ORDER BY DESC(?nb_competences)
LIMIT 20`,
  },
  {
    id: 'Q13',
    name: 'Offres les plus récentes',
    description: 'Dernières offres publiées',
    type: 'SELECT',
    query: `SELECT ?titre ?entreprise ?ville ?date_creation ?statut
WHERE {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:postedBy ?comp ;
           schema:jobLocation ?ville ;
           dcterms:created ?date_creation ;
           lod:status ?statut .
    ?comp schema:name ?entreprise .
}
ORDER BY DESC(?date_creation)
LIMIT 10`,
  },
  {
    id: 'Q14',
    name: 'Liste des programmes/filières',
    description: 'Toutes les filières avec niveaux',
    type: 'SELECT',
    query: `SELECT ?programme ?label ?niveau
WHERE {
    ?programme a lod:Program ;
               rdfs:label ?label ;
               schema:educationalLevel ?niveau .
}
ORDER BY ?label`,
  },
  {
    id: 'Q15',
    name: 'Hiérarchie SKOS des compétences',
    description: 'Catégories et sous-compétences (SKOS broader)',
    type: 'SELECT',
    query: `SELECT ?categorie ?competence
WHERE {
    ?skill a skos:Concept ;
           skos:prefLabel ?competence ;
           skos:broader ?cat .
    ?cat skos:prefLabel ?categorie .
    FILTER (lang(?competence) = "fr")
    FILTER (lang(?categorie) = "fr")
}
ORDER BY ?categorie ?competence`,
  },

  // ═══════ CONSTRUCT QUERIES ═══════
  {
    id: 'C1',
    name: 'CONSTRUCT — Graphe profil étudiant',
    description: 'Exporte le sous-graphe complet d\'un étudiant (RDF)',
    type: 'CONSTRUCT',
    query: `CONSTRUCT {
    ?etudiant a lod:Student ;
              dcterms:identifier ?id ;
              lod:level ?niveau ;
              lod:enrolledIn ?prog ;
              lod:hasSkill ?skill ;
              schema:addressLocality ?ville .
    ?prog rdfs:label ?filiere .
    ?skill skos:prefLabel ?competence .
}
WHERE {
    ?etudiant a lod:Student ;
              dcterms:identifier ?id ;
              lod:level ?niveau ;
              lod:enrolledIn ?prog ;
              lod:hasSkill ?skill ;
              schema:addressLocality ?ville .
    ?prog rdfs:label ?filiere .
    ?skill skos:prefLabel ?competence .
    FILTER (lang(?competence) = "fr")
}
LIMIT 100`,
  },
  {
    id: 'C2',
    name: 'CONSTRUCT — Graphe offre de stage',
    description: 'Exporte le sous-graphe d\'une offre avec ses compétences',
    type: 'CONSTRUCT',
    query: `CONSTRUCT {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:postedBy ?comp ;
           lod:requiresSkill ?skill ;
           schema:jobLocation ?ville ;
           lod:status ?statut .
    ?comp schema:name ?entreprise .
    ?skill skos:prefLabel ?competence .
}
WHERE {
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:postedBy ?comp ;
           lod:requiresSkill ?skill ;
           schema:jobLocation ?ville ;
           lod:status ?statut .
    ?comp schema:name ?entreprise .
    ?skill skos:prefLabel ?competence .
    FILTER (lang(?competence) = "fr")
}
LIMIT 100`,
  },
  {
    id: 'C3',
    name: 'CONSTRUCT — Graphe matching',
    description: 'Exporte les relations de matching étudiant ↔ offre',
    type: 'CONSTRUCT',
    query: `CONSTRUCT {
    ?etudiant lod:matchesOffer ?offre .
    ?etudiant dcterms:identifier ?id .
    ?offre schema:title ?titre .
    ?offre lod:postedBy ?comp .
    ?comp schema:name ?entreprise .
}
WHERE {
    ?etudiant a lod:Student ;
              dcterms:identifier ?id ;
              lod:hasSkill ?skill .
    ?offre a lod:InternshipOffer ;
           schema:title ?titre ;
           lod:requiresSkill ?skill ;
           lod:postedBy ?comp ;
           lod:status "Ouverte"@fr .
    ?comp schema:name ?entreprise .
}
LIMIT 200`,
  },
];

/**
 * Préfixes SPARQL standards utilisés dans le projet
 */
export const SPARQL_PREFIXES = `PREFIX lod:     <https://data.lod-school.ma/ontology#>
PREFIX base:    <https://data.lod-school.ma/id/>
PREFIX schema:  <https://schema.org/>
PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
`;

/**
 * Rôles utilisateur
 */
export const ROLES = {
  STUDENT: 'STUDENT',
  ENTERPRISE: 'ENTERPRISE',
  ADMIN: 'ADMIN',
};

/**
 * Configuration export formats
 */
export const EXPORT_FORMATS = {
  CSV: 'csv',
  JSON_LD: 'json-ld',
  TURTLE: 'turtle',
};
