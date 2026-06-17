# sparql_client.py
# Module qui envoie des requêtes SPARQL à Fuseki et retourne les résultats
# Utilisé par app.py pour toutes les pages du portail

import requests

# ── Configuration Fuseki ──────────────────────────────────────────────────────
FUSEKI_URL      = "http://localhost:3030"
DATASET         = "lod"
SPARQL_ENDPOINT = f"{FUSEKI_URL}/{DATASET}/sparql"

# Préfixes communs ajoutés automatiquement à toutes les requêtes
PREFIXES = """
PREFIX lod:     <https://data.lod-school.ma/ontology#>
PREFIX base:    <https://data.lod-school.ma/id/>
PREFIX schema:  <https://schema.org/>
PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
PREFIX dcterms: <http://purl.org/dc/terms/>
PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
"""

def query(sparql: str) -> list[dict]:
    """
    Envoie une requête SELECT à Fuseki.
    Retourne une liste de dictionnaires — un dict par ligne de résultat.

    Exemple de retour :
    [
        {"titre": "Développeur Python", "ville": "Casablanca"},
        {"titre": "Data Analyst",       "ville": "Rabat"},
    ]
    """
    full_query = PREFIXES + sparql
    try:
        response = requests.post(
            SPARQL_ENDPOINT,
            data    = {"query": full_query},
            headers = {"Accept": "application/sparql-results+json"},
            timeout = 10,
        )
        response.raise_for_status()
        data = response.json()

        # Transformer le format JSON SPARQL en liste de dicts simples
        variables = data["results"]["bindings"]
        results   = []
        for row in variables:
            # Pour chaque ligne, extraire juste la valeur (pas le type)
            results.append({
                key: val["value"]
                for key, val in row.items()
            })
        return results

    except requests.exceptions.ConnectionError:
        print("ERREUR : Fuseki n'est pas accessible sur", SPARQL_ENDPOINT)
        return []
    except Exception as e:
        print(f"ERREUR SPARQL : {e}")
        return []
