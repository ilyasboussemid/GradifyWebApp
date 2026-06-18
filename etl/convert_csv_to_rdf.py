import csv
import hashlib
import os
from datetime import date

BASE = "https://data.lod-school.ma/id/"
OUTPUT_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'ttl')
CSV_DIR = os.path.join(os.path.dirname(__file__), '..', 'data', 'csv')

PREFIXES = """@prefix base: <https://data.lod-school.ma/id/> .
@prefix dcterms: <http://purl.org/dc/terms/> .
@prefix lod: <https://data.lod-school.ma/ontology#> .
@prefix schema: <https://schema.org/> .
@prefix skos: <http://www.w3.org/2004/02/skos/core#> .
@prefix xsd: <http://www.w3.org/2001/XMLSchema#> .
@prefix rdfs: <http://www.w3.org/2000/01/rdf-schema#> .

"""

def hash_id(value):
    return hashlib.md5(value.encode()).hexdigest()[:12]

def convert_students():
    print("Converting students...")
    with open(os.path.join(CSV_DIR, 'students.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        triples = PREFIXES
        for row in reader:
            sid = f"student-{hash_id(row.get('id', row.get('name', '')))}"
            program_hash = hash_id(row.get('program', row.get('filiere', 'unknown')))
            triples += f"""base:{sid} a lod:Student,
        schema:Person ;
    dcterms:identifier "{sid}" ;
    lod:academicYear "{row.get('year', '2025')}"^^xsd:gYear ;
    lod:enrolledIn base:program-{program_hash} ;
    lod:level "{row.get('level', row.get('niveau', '2A'))}" ;
    lod:mention "{row.get('mention', 'Non evalue')}"@fr ;
    schema:addressLocality "{row.get('city', row.get('ville', 'Casablanca'))}" .

"""
    with open(os.path.join(OUTPUT_DIR, 'students.ttl'), 'w', encoding='utf-8') as out:
        out.write(triples)
    print(f"  -> students.ttl generated")

def convert_companies():
    print("Converting companies...")
    with open(os.path.join(CSV_DIR, 'companies.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        triples = PREFIXES
        for row in reader:
            cid = f"company-{hash_id(row.get('id', row.get('name', '')))}"
            triples += f"""base:{cid} a lod:Company,
        schema:Organization ;
    schema:name "{row.get('name', row.get('nom', ''))}"^^xsd:string ;
    lod:sector "{row.get('sector', row.get('secteur', ''))}"@fr ;
    schema:addressLocality "{row.get('city', row.get('ville', ''))}"^^xsd:string ;
    schema:addressCountry "{row.get('country', row.get('pays', 'Maroc'))}"^^xsd:string .

"""
    with open(os.path.join(OUTPUT_DIR, 'companies.ttl'), 'w', encoding='utf-8') as out:
        out.write(triples)
    print(f"  -> companies.ttl generated")

def convert_skills():
    print("Converting skills...")
    with open(os.path.join(CSV_DIR, 'skills.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        triples = PREFIXES
        categories = set()
        for row in reader:
            skill_hash = hash_id(row.get('name', row.get('skill', '')).lower())
            cat_slug = row.get('category', row.get('categorie', 'general')).lower().replace(' ', '_')
            if cat_slug not in categories:
                categories.add(cat_slug)
                cat_label = row.get('category', row.get('categorie', 'General'))
                triples += f"""base:skill-cat-{cat_slug} a skos:Concept ;
    skos:prefLabel "{cat_label}"@fr ;
    skos:inScheme base:skill-scheme .

"""
            triples += f"""base:skill-{skill_hash} a skos:Concept ;
    skos:broader base:skill-cat-{cat_slug} ;
    skos:inScheme base:skill-scheme ;
    skos:prefLabel "{row.get('name', row.get('skill', ''))}"@fr .

"""
    with open(os.path.join(OUTPUT_DIR, 'skills.ttl'), 'w', encoding='utf-8') as out:
        out.write(triples)
    print(f"  -> skills.ttl generated")

def convert_offers():
    print("Converting offers...")
    with open(os.path.join(CSV_DIR, 'offers.csv'), 'r', encoding='utf-8') as f:
        reader = csv.DictReader(f)
        triples = PREFIXES
        for row in reader:
            oid = row.get('id', f"offer-{hash_id(row.get('title', ''))}")
            company_hash = hash_id(row.get('company_id', row.get('company', '')))
            triples += f"""base:{oid} a lod:InternshipOffer,
        schema:JobPosting ;
    dcterms:created "{date.today().isoformat()}"^^xsd:date ;
    dcterms:identifier "{oid}" ;
    schema:title "{row.get('title', row.get('titre', ''))}"@fr ;
    schema:jobLocation "{row.get('city', row.get('ville', ''))}" ;
    lod:durationMonths {row.get('duration', row.get('duree', '3'))} ;
    lod:levelRequired "{row.get('level', row.get('niveau', '2A'))}" ;
    lod:compensation "{row.get('compensation', 'Non remunere')}"@fr ;
    lod:status "{row.get('status', row.get('statut', 'Ouverte'))}"@fr ;
    lod:postedBy base:company-{company_hash} .

"""
    with open(os.path.join(OUTPUT_DIR, 'offers.ttl'), 'w', encoding='utf-8') as out:
        out.write(triples)
    print(f"  -> offers.ttl generated")

if __name__ == '__main__':
    print("=" * 50)
    print(" Gradify ETL Pipeline")
    print(" CSV -> RDF Turtle")
    print("=" * 50)
    os.makedirs(OUTPUT_DIR, exist_ok=True)
    convert_students()
    convert_companies()
    convert_skills()
    convert_offers()
    print("=" * 50)
    print(" ETL complete!")
    print(f" Output: {OUTPUT_DIR}")
    print("=" * 50)
