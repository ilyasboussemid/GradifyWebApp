package com.gradify.offer.service;

import com.gradify.offer.sparql.SparqlClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class OfferService {

    private final SparqlClient sparqlClient;

    public OfferService(SparqlClient sparqlClient) {
        this.sparqlClient = sparqlClient;
    }

    public Map<String, Object> search(String skill, String company, String program, String city, int page, int size) {
        StringBuilder filters = new StringBuilder();
        filters.append("?offre lod:status \"Ouverte\"@fr .\n");

        if (skill != null && !skill.isBlank()) {
            filters.append(String.format("""
                    ?offre lod:requiresSkill ?skillF .
                    ?skillF skos:prefLabel "%s"@fr .
                    """, skill));
        }
        if (city != null && !city.isBlank()) {
            filters.append(String.format("FILTER (?ville = \"%s\")\n", city));
        }
        if (company != null && !company.isBlank()) {
            filters.append(String.format("FILTER (CONTAINS(LCASE(?entreprise), LCASE(\"%s\")))\n", company));
        }

        String query = String.format("""
                SELECT DISTINCT ?offre ?titre ?entreprise ?ville ?duree ?niveau ?compensation
                WHERE {
                    ?offre a lod:InternshipOffer ;
                           schema:title ?titre ;
                           lod:postedBy ?comp ;
                           schema:jobLocation ?ville ;
                           lod:durationMonths ?duree ;
                           lod:levelRequired ?niveau ;
                           lod:compensation ?compensation ;
                           %s
                    ?comp schema:name ?entreprise .
                }
                ORDER BY ?ville ?titre
                LIMIT %d OFFSET %d
                """, filters, size, (page - 1) * size);

        List<Map<String, String>> results = sparqlClient.query(query);

        List<Map<String, Object>> items = results.stream().map(row -> {
            Map<String, Object> offer = new HashMap<>(row);
            String offerId = row.get("offre").split("/")[row.get("offre").split("/").length - 1];
            offer.put("id", offerId);
            offer.put("title", row.get("titre"));
            offer.put("company", row.get("entreprise"));
            offer.put("duration", row.get("duree"));
            offer.put("level", row.get("niveau"));
            offer.put("status", "Ouverte");
            offer.put("skills", getOfferSkills(offerId));
            return offer;
        }).collect(Collectors.toList());

        return Map.of("items", items, "page", page, "size", size);
    }

    public Map<String, Object> getById(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        String query = String.format("""
                SELECT ?titre ?entreprise ?secteur ?ville
                       ?debut ?fin ?duree ?niveau ?compensation ?statut ?description ?programmes
                WHERE {
                    <%s> a lod:InternshipOffer ;
                         schema:title ?titre ;
                         lod:postedBy ?comp ;
                         schema:jobLocation ?ville ;
                         schema:jobStartDate ?debut ;
                         schema:jobEndDate ?fin ;
                         lod:durationMonths ?duree ;
                         lod:levelRequired ?niveau ;
                         lod:compensation ?compensation ;
                         lod:status ?statut .
                    OPTIONAL { <%s> schema:description ?description . }
                    OPTIONAL { <%s> lod:targetPrograms ?programmes . }
                    ?comp schema:name ?entreprise .
                    OPTIONAL { ?comp lod:sector ?secteur . }
                }
                LIMIT 1
                """, uri, uri, uri);

        List<Map<String, String>> results = sparqlClient.query(query);
        if (results.isEmpty()) return null;

        Map<String, String> row = results.get(0);
        Map<String, Object> offer = new HashMap<>();
        offer.put("id", offerId);
        offer.put("title", row.get("titre"));
        offer.put("company", row.get("entreprise"));
        offer.put("companySector", row.get("secteur"));
        offer.put("city", row.get("ville"));
        offer.put("startDate", row.get("debut"));
        offer.put("endDate", row.get("fin"));
        offer.put("duration", row.get("duree"));
        offer.put("level", row.get("niveau"));
        offer.put("compensation", row.get("compensation"));
        offer.put("status", row.get("statut"));
        offer.put("description", row.get("description"));
        offer.put("targetPrograms", row.get("programmes"));
        offer.put("skills", getOfferSkillsDetailed(offerId));

        return offer;
    }

    public Map<String, Object> getFilters() {
        List<Map<String, String>> skills = sparqlClient.query("""
                SELECT DISTINCT ?competence WHERE {
                    ?offre lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence .
                    FILTER (lang(?competence) = "fr")
                } ORDER BY ?competence
                """);

        List<Map<String, String>> cities = sparqlClient.query("""
                SELECT DISTINCT ?ville WHERE {
                    ?s a lod:InternshipOffer ; schema:jobLocation ?ville .
                } ORDER BY ?ville
                """);

        List<Map<String, String>> companies = sparqlClient.query("""
                SELECT DISTINCT ?entreprise WHERE {
                    ?offre lod:postedBy ?comp . ?comp schema:name ?entreprise .
                } ORDER BY ?entreprise
                """);

        List<Map<String, String>> programs = sparqlClient.query("""
                SELECT DISTINCT ?filiere WHERE {
                    ?prog a lod:Program ; rdfs:label ?filiere .
                } ORDER BY ?filiere
                """);

        return Map.of(
                "skills", skills.stream().map(r -> r.get("competence")).collect(Collectors.toList()),
                "cities", cities.stream().map(r -> r.get("ville")).collect(Collectors.toList()),
                "companies", companies.stream().map(r -> r.get("entreprise")).collect(Collectors.toList()),
                "programs", programs.stream().map(r -> r.get("filiere")).collect(Collectors.toList())
        );
    }

    private List<String> getOfferSkills(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?competence WHERE {
                    <%s> lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence .
                    FILTER (lang(?competence) = "fr")
                }
                """, uri));
        return results.stream().map(r -> r.get("competence")).collect(Collectors.toList());
    }

    private List<Map<String, String>> getOfferSkillsDetailed(String offerId) {
        String uri = "https://data.lod-school.ma/id/" + offerId;
        return sparqlClient.query(String.format("""
                SELECT ?competence ?categorie WHERE {
                    <%s> lod:requiresSkill ?skill .
                    ?skill skos:prefLabel ?competence ;
                           skos:broader ?cat .
                    ?cat skos:prefLabel ?categorie .
                    FILTER (lang(?competence) = "fr")
                    FILTER (lang(?categorie) = "fr")
                } ORDER BY ?categorie
                """, uri));
    }
}
