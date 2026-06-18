package com.gradify.matching.service;

import com.gradify.matching.sparql.SparqlClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class MatchingService {

    private final SparqlClient sparqlClient;

    public MatchingService(SparqlClient sparqlClient) {
        this.sparqlClient = sparqlClient;
    }

    public Map<String, Object> computeScore(String studentId, String offerId) {
        String studentUri = "https://data.lod-school.ma/id/" + studentId;
        String offerUri = "https://data.lod-school.ma/id/" + offerId;

        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT (COUNT(?skill) AS ?score) WHERE {
                    <%s> lod:hasSkill ?skill .
                    <%s> lod:requiresSkill ?skill .
                }
                """, studentUri, offerUri));

        List<Map<String, String>> totalSkills = sparqlClient.query(String.format("""
                SELECT (COUNT(?skill) AS ?total) WHERE {
                    <%s> lod:requiresSkill ?skill .
                }
                """, offerUri));

        int score = results.isEmpty() ? 0 : Integer.parseInt(results.get(0).get("score"));
        int maxScore = totalSkills.isEmpty() ? 1 : Integer.parseInt(totalSkills.get(0).get("total"));

        return Map.of("studentId", studentId, "offerId", offerId,
                "score", score, "maxScore", maxScore,
                "percentage", maxScore > 0 ? Math.round((score * 100.0) / maxScore) : 0);
    }

    public Map<String, Object> findStudentsForOffer(String offerId, int page, int size) {
        String offerUri = "https://data.lod-school.ma/id/" + offerId;
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?etudiant_id ?filiere ?niveau (COUNT(?skill) AS ?score) WHERE {
                    <%s> lod:requiresSkill ?skill .
                    ?etudiant a lod:Student ;
                              dcterms:identifier ?etudiant_id ;
                              lod:hasSkill ?skill ;
                              lod:enrolledIn ?prog ;
                              lod:level ?niveau .
                    ?prog rdfs:label ?filiere .
                }
                GROUP BY ?etudiant_id ?filiere ?niveau
                ORDER BY DESC(?score)
                LIMIT %d OFFSET %d
                """, offerUri, size, (page - 1) * size));

        List<Map<String, String>> totalSkills = sparqlClient.query(String.format("""
                SELECT (COUNT(?skill) AS ?total) WHERE {
                    <%s> lod:requiresSkill ?skill .
                }
                """, offerUri));
        int maxScore = totalSkills.isEmpty() ? 1 : Integer.parseInt(totalSkills.get(0).get("total"));

        List<Map<String, Object>> items = results.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.get("etudiant_id"));
            m.put("program", r.get("filiere"));
            m.put("level", r.get("niveau"));
            m.put("score", Integer.parseInt(r.get("score")));
            m.put("maxScore", maxScore);
            return m;
        }).collect(Collectors.toList());

        return Map.of("items", items, "page", page, "size", size);
    }

    public Map<String, Object> findOffersForStudent(String studentId, int page, int size) {
        String studentUri = "https://data.lod-school.ma/id/" + studentId;
        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?offre ?titre ?entreprise ?ville (COUNT(?skill) AS ?score) WHERE {
                    <%s> lod:hasSkill ?skill .
                    ?offre a lod:InternshipOffer ;
                           schema:title ?titre ;
                           lod:requiresSkill ?skill ;
                           lod:postedBy ?comp ;
                           schema:jobLocation ?ville ;
                           lod:status "Ouverte"@fr .
                    ?comp schema:name ?entreprise .
                }
                GROUP BY ?offre ?titre ?entreprise ?ville
                ORDER BY DESC(?score)
                LIMIT %d OFFSET %d
                """, studentUri, size, (page - 1) * size));

        List<Map<String, Object>> items = results.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            String offerUri = r.get("offre");
            m.put("id", offerUri.substring(offerUri.lastIndexOf('/') + 1));
            m.put("title", r.get("titre"));
            m.put("company", r.get("entreprise"));
            m.put("city", r.get("ville"));
            m.put("score", Integer.parseInt(r.get("score")));
            m.put("maxScore", getOfferSkillCount(offerUri));
            return m;
        }).collect(Collectors.toList());

        return Map.of("items", items, "page", page, "size", size);
    }

    private int getOfferSkillCount(String offerUri) {
        List<Map<String, String>> r = sparqlClient.query(String.format("""
                SELECT (COUNT(?s) AS ?total) WHERE { <%s> lod:requiresSkill ?s . }
                """, offerUri));
        return r.isEmpty() ? 1 : Integer.parseInt(r.get(0).get("total"));
    }
}
