# Gradify — Plateforme de Données Liées (Knowledge Graph)

> Plateforme web sémantique reliant étudiants, compétences (SKOS), offres de stage et entreprises via un Knowledge Graph RDF interrogé par SPARQL.

**Projet académique S4 — Web Sémantique / Linked Open Data / Knowledge Graphs**

---

## Architecture Microservices

```
┌─────────────────────────────────────────────────────────────┐
│                  Frontend (React + Vite)                      │
│                     Port 80 (nginx)                           │
└──────────────────────────┬──────────────────────────────────┘
                           │
┌──────────────────────────▼──────────────────────────────────┐
│              API Gateway (Spring Cloud Gateway)               │
│                        Port 8080                              │
└───┬────────┬────────┬────────┬────────┬─────────────────────┘
    │        │        │        │        │
    ▼        ▼        ▼        ▼        ▼
┌──────┐┌──────┐┌──────┐┌──────┐┌──────────┐
│Offer ││Stud. ││Match.││SPARQL││Auth/Admin│
│:8081 ││:8082 ││:8083 ││:8084 ││  :8085   │
└──┬───┘└──┬───┘└──┬───┘└──┬───┘└────┬─────┘
   └───────┴───────┴───────┴─────────┘
                   │
           ┌───────▼───────┐
           │ Apache Fuseki  │
           │  (SPARQL)      │
           │   Port 3030    │
           └───────────────┘
```

## Services

| Service | Port | Description |
|---------|------|-------------|
| **frontend** | 80 | React SPA (Vite + nginx) |
| **gateway** | 8080 | API Gateway, routing, CORS, JWT validation |
| **offer-service** | 8081 | Recherche et détail des offres de stage |
| **student-service** | 8082 | Profils étudiants pseudonymisés |
| **matching-service** | 8083 | Calcul de matching par overlap compétences |
| **sparql-explorer-service** | 8084 | Exécution de requêtes SPARQL, stats, templates |
| **auth-admin-service** | 8085 | Authentification JWT (3 rôles), admin SHACL |
| **fuseki** | 3030 | Triple store Apache Jena Fuseki |

---

## Lancement rapide

### Prérequis

- Docker & Docker Compose (v2+)
- 8 Go RAM minimum recommandé

### 1. Cloner le repository

```bash
git clone https://github.com/ilyasboussemid/Gradify-.git
cd Gradify-
```

### 2. Lancer tous les services

```bash
docker-compose up -d
```

Cela va :
1. Démarrer Fuseki (triple store) sur le port 3030
2. Builder et lancer les 5 microservices Java
3. Builder et lancer le frontend React via nginx

### 3. Charger les données RDF dans Fuseki

Une fois Fuseki démarré (attendre ~10 secondes) :

```bash
# Charger toutes les données Turtle
for file in data/ttl/*.ttl; do
  curl -X POST "http://localhost:3030/lod/data" \
    -H "Content-Type: text/turtle" \
    --data-binary "@$file"
done
```

### 4. Accéder à l'application

| URL | Description |
|-----|-------------|
| http://localhost | Frontend Gradify |
| http://localhost:3030 | Interface Fuseki (admin/admin123) |
| http://localhost:8080 | API Gateway |

---

## Authentification

### Comptes de démo

| Rôle | Identifiant | Mot de passe |
|------|-------------|--------------|
| **Admin** | `admin` | `admin123` |
| **Entreprise** | `techsecure` | `pass123` |
| **Entreprise** | `cloudfirst` | `pass123` |
| **Étudiant** | `student-0224012b0526` | `etudiant` |
| **Étudiant** | `student-03ceaa3d0094` | `etudiant` |

> N'importe quel ID au format `student-xxxx` fonctionne avec le mot de passe `etudiant` ou `pass123`.

---

## Configuration

### Changer l'URL de l'endpoint SPARQL

Éditer le fichier `.env` à la racine :

```env
SPARQL_ENDPOINT_URL=http://votre-fuseki:3030/votre-dataset/sparql
```

Ou passer la variable au lancement :

```bash
SPARQL_ENDPOINT_URL=http://mon-serveur:3030/lod/sparql docker-compose up -d
```

### Changer les credentials admin

```env
ADMIN_USERNAME=mon-admin
ADMIN_PASSWORD=mon-mot-de-passe
JWT_SECRET=ma-cle-secrete-longue
```

---

## Développement local (sans Docker)

### Frontend seul

```bash
cd frontend
npm install
npm run dev
# → http://localhost:5173
# Le proxy Vite redirige /api → localhost:8080
```

### Un microservice seul

```bash
cd offer-service
mvn spring-boot:run -Dspring-boot.run.arguments="--sparql.endpoint=http://localhost:3030/lod/sparql"
```

---

## Endpoints API

### Public

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| POST | `/api/auth/login` | Connexion (identifier, password, role) |
| GET | `/api/offers/search` | Recherche offres (?skill=&city=&program=) |
| GET | `/api/offers/{id}` | Détail d'une offre |
| GET | `/api/offers/filters` | Filtres disponibles |
| GET | `/api/students/{id}` | Profil étudiant pseudonymisé |
| GET | `/api/students` | Liste étudiants (?program=&level=) |
| POST | `/api/matching/score` | Score matching {studentId, offerId} |
| GET | `/api/matching/offer/{id}/students` | Étudiants compatibles |
| GET | `/api/matching/student/{id}/offers` | Offres compatibles |
| POST | `/api/sparql/execute` | Exécuter une requête SPARQL |
| GET | `/api/sparql/stats` | Statistiques globales |
| GET | `/api/sparql/templates` | Templates prédéfinis |

### Admin (JWT requis, rôle ADMIN)

| Méthode | Endpoint | Description |
|---------|----------|-------------|
| GET | `/api/admin/shacl/report` | Rapport conformité SHACL |
| GET | `/api/admin/logs` | Logs d'accès |

---

## Stack technique

| Couche | Technologies |
|--------|--------------|
| **Frontend** | React 18, Vite 5, React Router 6, Axios |
| **Backend** | Spring Boot 3.2, Spring Cloud Gateway, Java 17 |
| **Auth** | JWT (jjwt 0.12), RBAC (Student/Enterprise/Admin) |
| **Données** | RDF (Turtle), SPARQL 1.1, Apache Jena Fuseki |
| **Vocabulaires** | Schema.org, SKOS, Dublin Core (dcterms), FOAF |
| **Validation** | SHACL (12 shapes) |
| **Déploiement** | Docker, Docker Compose, nginx |

---

## Modèle de données

| Entité | Classe RDF | Description |
|--------|-----------|-------------|
| Student | `lod:Student`, `schema:Person` | Profil pseudonymisé |
| InternshipOffer | `lod:InternshipOffer`, `schema:JobPosting` | Offre de stage |
| Company | `lod:Company`, `schema:Organization` | Entreprise |
| Skill | `skos:Concept` | Compétence (hiérarchie SKOS) |
| Program | `lod:Program` | Filière de formation |

### Namespace

- Base URI : `https://data.lod-school.ma/id/`
- Ontologie : `https://data.lod-school.ma/ontology#`

---

## Privacy-by-design

- Les étudiants sont identifiés par un hash pseudonymisé (`student-0224012b0526`)
- Aucune donnée personnelle (nom, email, notes détaillées) n'est stockée ni affichée
- Le frontend affiche un avertissement privacy sur chaque profil étudiant
- Les endpoints admin sont séparés et protégés par JWT + rôle ADMIN

---

## Requêtes SPARQL

Le portail inclut **18 requêtes prédéfinies** (15 SELECT + 3 CONSTRUCT) accessibles dans l'explorateur SPARQL :

- Q1 à Q15 : Listes, filtres, matching, statistiques
- C1 à C3 : Export de sous-graphes (profil, offre, matching)

Les préfixes standard sont ajoutés automatiquement :
```sparql
PREFIX lod:     <https://data.lod-school.ma/ontology#>
PREFIX base:    <https://data.lod-school.ma/id/>
PREFIX schema:  <https://schema.org/>
PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
```

---

## Validation SHACL

12 shapes validant toutes les entités du graphe :

1. Étudiant — champs obligatoires
2. Étudiant — niveau valide (1A/2A/3A)
3. Étudiant — au moins une compétence
4. Étudiant — pattern URI
5. Offre — champs obligatoires
6. Offre — niveau requis valide
7. Offre — compétences requises
8. Offre — statut valide
9. Entreprise — champs obligatoires
10. Compétence SKOS — champs obligatoires
11. Filière — champs obligatoires
12. Entreprise — pattern URI

Exécuter la validation localement :
```bash
pip install pyshacl
python validate_shacl.py
```

---

## Auteurs

Projet académique PFA 2A — Web Sémantique & Knowledge Graphs
