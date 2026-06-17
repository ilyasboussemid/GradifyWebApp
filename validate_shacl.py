# validate_shacl.py
# Valide les données RDF avec les shapes SHACL
# Usage : pip install pyshacl
#         python validate_shacl.py

from pyshacl import validate
from rdflib import Graph

print("=" * 55)
print(" Validation SHACL — LOD Étudiants/Stages/Compétences")
print("=" * 55)

# Charger les données
print("\n[1/3] Chargement du graphe de données...")
data_graph = Graph()
data_graph.parse("data/ttl/full_graph.ttl", format="turtle")
print(f"      OK — {len(data_graph)} triplets chargés")

# Charger les shapes
print("[2/3] Chargement des shapes SHACL...")
shapes_graph = Graph()
shapes_graph.parse("shapes.ttl", format="turtle")
print(f"      OK — shapes chargées")

# Lancer la validation
print("[3/3] Validation en cours...\n")
conforms, results_graph, results_text = validate(
    data_graph,
    shacl_graph=shapes_graph,
    inference="rdfs",
    abort_on_first=False,
    allow_infos=True,
    meta_shacl=False,
)

# Afficher le résultat
print("=" * 55)
if conforms:
    print(" RÉSULTAT : ✅ CONFORME — aucune violation détectée")
else:
    print(" RÉSULTAT : ⚠️  VIOLATIONS DÉTECTÉES")
print("=" * 55)
print(results_text)

# Sauvegarder le rapport
with open("shacl_rapport.txt", "w", encoding="utf-8") as f:
    f.write("Rapport de conformité SHACL\n")
    f.write("=" * 55 + "\n")
    f.write(f"Conforme : {conforms}\n\n")
    f.write(results_text)

print("\nRapport sauvegardé dans : shacl_rapport.txt")
