# app.py
# Serveur Flask — Portail LOD Étudiants/Stages/Compétences
#
# Installation : pip install flask requests
# Lancement    : python app.py
# Accès        : http://localhost:5000

from flask import Flask, render_template, request
from sparql_client import query

app = Flask(__name__)

# ══════════════════════════════════════════════════════════════════════════════
# PAGE 1 — Accueil : statistiques générales
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/")
def index():
    """Page d'accueil avec les statistiques du dataset."""

    # Compter les étudiants
    nb_etudiants = query("""
        SELECT (COUNT(?s) AS ?total)
        WHERE { ?s a lod:Student . }
    """)

    # Compter les offres ouvertes
    nb_offres = query("""
        SELECT (COUNT(?s) AS ?total)
        WHERE {
            ?s a lod:InternshipOffer ;
               lod:status "Ouverte"@fr .
        }
    """)

    # Compter les entreprises
    nb_entreprises = query("""
        SELECT (COUNT(?s) AS ?total)
        WHERE { ?s a lod:Company . }
    """)

    # Compter les compétences
    nb_competences = query("""
        SELECT (COUNT(?s) AS ?total)
        WHERE { ?s a skos:Concept . }
    """)

    # Top 5 compétences les plus demandées
    top_competences = query("""
        SELECT ?competence (COUNT(?offre) AS ?nb)
        WHERE {
            ?offre a lod:InternshipOffer ;
                   lod:requiresSkill ?skill .
            ?skill skos:prefLabel ?competence .
            FILTER (lang(?competence) = "fr")
        }
        GROUP BY ?competence
        ORDER BY DESC(?nb)
        LIMIT 5
    """)

    # Étudiants par filière
    par_filiere = query("""
        SELECT ?filiere (COUNT(?e) AS ?nb)
        WHERE {
            ?e a lod:Student ;
               lod:enrolledIn ?prog .
            ?prog rdfs:label ?filiere .
        }
        GROUP BY ?filiere
        ORDER BY DESC(?nb)
    """)

    stats = {
        "etudiants":   nb_etudiants[0]["total"]   if nb_etudiants   else "0",
        "offres":      nb_offres[0]["total"]       if nb_offres      else "0",
        "entreprises": nb_entreprises[0]["total"]  if nb_entreprises else "0",
        "competences": nb_competences[0]["total"]  if nb_competences else "0",
    }

    return render_template("index.html",
                           stats=stats,
                           top_competences=top_competences,
                           par_filiere=par_filiere)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 2 — Liste des offres + recherche par compétence/ville/niveau
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/offres")
def offres():
    """Liste des offres avec filtres par compétence, ville et niveau."""

    # Récupérer les filtres depuis l'URL (?competence=Python&ville=Casablanca)
    filtre_competence = request.args.get("competence", "").strip()
    filtre_ville      = request.args.get("ville",      "").strip()
    filtre_niveau     = request.args.get("niveau",     "").strip()

    # Construire les filtres SPARQL dynamiquement
    filtres = 'lod:status "Ouverte"@fr .'

    if filtre_competence:
        filtres += f"""
            ?offre lod:requiresSkill ?skillF .
            ?skillF skos:prefLabel "{filtre_competence}"@fr .
        """
    if filtre_ville:
        filtres += f'FILTER (?ville = "{filtre_ville}")'

    if filtre_niveau:
        filtres += f'FILTER (?niveau = "{filtre_niveau}")'

    resultats = query(f"""
        SELECT DISTINCT ?offre ?titre ?entreprise ?ville ?duree ?niveau ?compensation
        WHERE {{
            ?offre a lod:InternshipOffer ;
                   schema:title ?titre ;
                   lod:postedBy ?comp ;
                   schema:jobLocation ?ville ;
                   lod:durationMonths ?duree ;
                   lod:levelRequired ?niveau ;
                   lod:compensation ?compensation ;
                   {filtres}
            ?comp schema:name ?entreprise .
        }}
        ORDER BY ?ville ?titre
    """)

    # Extraire l'ID court de l'URI pour les liens
    for r in resultats:
        r["id"] = r["offre"].split("/")[-1]

    # Listes pour les menus déroulants
    toutes_competences = query("""
        SELECT DISTINCT ?competence
        WHERE {
            ?s skos:prefLabel ?competence .
            FILTER (lang(?competence) = "fr")
        }
        ORDER BY ?competence
    """)

    toutes_villes = query("""
        SELECT DISTINCT ?ville
        WHERE {
            ?s a lod:InternshipOffer ;
               schema:jobLocation ?ville .
        }
        ORDER BY ?ville
    """)

    return render_template("offres.html",
                           offres=resultats,
                           competences=toutes_competences,
                           villes=toutes_villes,
                           filtre_competence=filtre_competence,
                           filtre_ville=filtre_ville,
                           filtre_niveau=filtre_niveau)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 3 — Détail d'une offre
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/offres/<offre_id>")
def offre_detail(offre_id):
    """Page détail d'une offre avec toutes ses informations et compétences."""

    uri = f"https://data.lod-school.ma/id/{offre_id}"

    # Infos principales de l'offre
    infos = query(f"""
        SELECT ?titre ?entreprise ?secteur ?ville
               ?debut ?fin ?duree ?niveau ?compensation ?statut ?description
        WHERE {{
            <{uri}> a lod:InternshipOffer ;
                    schema:title ?titre ;
                    lod:postedBy ?comp ;
                    schema:jobLocation ?ville ;
                    schema:jobStartDate ?debut ;
                    schema:jobEndDate ?fin ;
                    lod:durationMonths ?duree ;
                    lod:levelRequired ?niveau ;
                    lod:compensation ?compensation ;
                    lod:status ?statut .
            OPTIONAL {{ <{uri}> schema:description ?description . }}
            ?comp schema:name ?entreprise ;
                  lod:sector ?secteur .
        }}
        LIMIT 1
    """)

    # Compétences requises
    competences = query(f"""
        SELECT ?competence ?categorie
        WHERE {{
            <{uri}> lod:requiresSkill ?skill .
            ?skill skos:prefLabel ?competence ;
                   skos:broader ?cat .
            ?cat skos:prefLabel ?categorie .
            FILTER (lang(?competence) = "fr")
            FILTER (lang(?categorie) = "fr")
        }}
        ORDER BY ?categorie
    """)

    if not infos:
        return "Offre introuvable", 404

    return render_template("offre_detail.html",
                           offre=infos[0],
                           offre_id=offre_id,
                           competences=competences)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 4 — Liste des étudiants (pseudonymisés)
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/etudiants")
def etudiants():
    """Liste des étudiants avec filière et niveau."""

    filtre_filiere = request.args.get("filiere", "").strip()
    filtre_niveau  = request.args.get("niveau",  "").strip()

    filtre_sparql = ""
    if filtre_filiere:
        filtre_sparql += f'FILTER (str(?filiere) = "{filtre_filiere}")'
    if filtre_niveau:
        filtre_sparql += f'FILTER (?niveau = "{filtre_niveau}")'

    resultats = query(f"""
        SELECT ?etudiant ?id ?niveau ?filiere ?ville ?mention
        WHERE {{
            ?etudiant a lod:Student ;
                      dcterms:identifier ?id ;
                      lod:level ?niveau ;
                      lod:enrolledIn ?prog ;
                      schema:addressLocality ?ville ;
                      lod:mention ?mention .
            ?prog rdfs:label ?filiere .
            {filtre_sparql}
        }}
        ORDER BY ?filiere ?niveau
    """)

    for r in resultats:
        r["url_id"] = r["etudiant"].split("/")[-1]

    filieres = query("""
        SELECT DISTINCT ?filiere
        WHERE {
            ?prog a lod:Program ;
                  rdfs:label ?filiere .
        }
        ORDER BY ?filiere
    """)

    return render_template("etudiants.html",
                           etudiants=resultats,
                           filieres=filieres,
                           filtre_filiere=filtre_filiere,
                           filtre_niveau=filtre_niveau)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 5 — Profil étudiant
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/etudiants/<etudiant_id>")
def etudiant_profil(etudiant_id):
    """Page profil d'un étudiant avec ses compétences et offres correspondantes."""

    uri = f"https://data.lod-school.ma/id/{etudiant_id}"

    # Infos de l'étudiant
    infos = query(f"""
        SELECT ?id ?niveau ?filiere ?ville ?mention ?annee
        WHERE {{
            <{uri}> dcterms:identifier ?id ;
                    lod:level ?niveau ;
                    lod:enrolledIn ?prog ;
                    schema:addressLocality ?ville ;
                    lod:mention ?mention ;
                    lod:academicYear ?annee .
            ?prog rdfs:label ?filiere .
        }}
        LIMIT 1
    """)

    # Compétences de l'étudiant
    competences = query(f"""
        SELECT ?competence ?categorie
        WHERE {{
            <{uri}> lod:hasSkill ?skill .
            ?skill skos:prefLabel ?competence ;
                   skos:broader ?cat .
            ?cat skos:prefLabel ?categorie .
            FILTER (lang(?competence) = "fr")
            FILTER (lang(?categorie) = "fr")
        }}
        ORDER BY ?categorie
    """)

    # Offres qui matchent (compétences communes)
    offres_match = query(f"""
        SELECT ?offre ?titre ?entreprise ?ville
               (COUNT(?skillCommun) AS ?score)
        WHERE {{
            <{uri}> lod:hasSkill ?skillCommun .
            ?offre a lod:InternshipOffer ;
                   schema:title ?titre ;
                   lod:requiresSkill ?skillCommun ;
                   lod:postedBy ?comp ;
                   schema:jobLocation ?ville ;
                   lod:status "Ouverte"@fr .
            ?comp schema:name ?entreprise .
        }}
        GROUP BY ?offre ?titre ?entreprise ?ville
        ORDER BY DESC(?score)
        LIMIT 5
    """)

    for r in offres_match:
        r["id"] = r["offre"].split("/")[-1]

    if not infos:
        return "Étudiant introuvable", 404

    return render_template("etudiant_profil.html",
                           etudiant=infos[0],
                           etudiant_id=etudiant_id,
                           competences=competences,
                           offres_match=offres_match)


# ══════════════════════════════════════════════════════════════════════════════
# PAGE 6 — Matching global étudiant ↔ offres
# ══════════════════════════════════════════════════════════════════════════════
@app.route("/matching")
def matching():
    """Matching global : top correspondances étudiants ↔ offres."""

    resultats = query("""
        SELECT ?etudiant ?etudiant_id ?offre ?titre ?entreprise
               (COUNT(?skillCommun) AS ?score)
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
        GROUP BY ?etudiant ?etudiant_id ?offre ?titre ?entreprise
        ORDER BY DESC(?score)
        LIMIT 30
    """)

    for r in resultats:
        r["offre_id"]    = r["offre"].split("/")[-1]
        r["etudiant_url"] = r["etudiant"].split("/")[-1]

    return render_template("matching.html", resultats=resultats)


# ══════════════════════════════════════════════════════════════════════════════
if __name__ == "__main__":
    print("=" * 50)
    print(" Portail LOD — Étudiants/Stages/Compétences")
    print(" URL : http://localhost:5000")
    print(" Fuseki doit tourner sur http://localhost:3030")
    print("=" * 50)
    app.run(debug=True, port=5000)
