package com.gradify.student.service;

import com.gradify.student.sparql.SparqlClient;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.stream.Collectors;

@Service
public class StudentService {

    private final SparqlClient sparqlClient;

    public StudentService(SparqlClient sparqlClient) {
        this.sparqlClient = sparqlClient;
    }

    public Map<String, Object> getById(String studentId) {
        String uri = "https://data.lod-school.ma/id/" + studentId;
        List<Map<String, String>> infos = sparqlClient.query(String.format("""
                SELECT ?id ?niveau ?filiere ?ville ?mention ?annee ?prenom ?nom WHERE {
                    <%s> dcterms:identifier ?id ;
                         lod:level ?niveau ;
                         lod:enrolledIn ?prog ;
                         schema:addressLocality ?ville ;
                         lod:mention ?mention ;
                         lod:academicYear ?annee .
                    ?prog rdfs:label ?filiere .
                    OPTIONAL { <%s> schema:givenName ?prenom . }
                    OPTIONAL { <%s> schema:familyName ?nom . }
                } LIMIT 1
                """, uri, uri, uri));

        if (infos.isEmpty()) return null;
        Map<String, String> row = infos.get(0);

        List<Map<String, String>> skills = sparqlClient.query(String.format("""
                SELECT ?competence ?categorie WHERE {
                    <%s> lod:hasSkill ?skill .
                    ?skill skos:prefLabel ?competence .
                    OPTIONAL { ?skill skos:broader ?cat . ?cat skos:prefLabel ?categorie . FILTER (lang(?categorie) = "fr") }
                    FILTER (lang(?competence) = "fr")
                } ORDER BY ?categorie
                """, uri));

        Map<String, Object> student = new HashMap<>();
        student.put("id", studentId);
        student.put("firstName", row.getOrDefault("prenom", ""));
        student.put("lastName", row.getOrDefault("nom", ""));
        student.put("level", row.get("niveau"));
        student.put("program", row.get("filiere"));
        student.put("city", row.get("ville"));
        student.put("mention", row.get("mention"));
        student.put("academicYear", row.get("annee"));
        student.put("skills", skills.stream()
                .map(s -> Map.of("name", s.getOrDefault("competence", ""), "category", s.getOrDefault("categorie", "Autre")))
                .collect(Collectors.toList()));
        return student;
    }

    public Map<String, Object> list(String program, String level, int page, int size) {
        StringBuilder filters = new StringBuilder();
        if (program != null && !program.isBlank()) {
            filters.append(String.format("FILTER (str(?filiere) = \"%s\")\n", program));
        }
        if (level != null && !level.isBlank()) {
            filters.append(String.format("FILTER (?niveau = \"%s\")\n", level));
        }

        List<Map<String, String>> results = sparqlClient.query(String.format("""
                SELECT ?etudiant ?id ?niveau ?filiere ?ville ?mention WHERE {
                    ?etudiant a lod:Student ;
                              dcterms:identifier ?id ;
                              lod:level ?niveau ;
                              lod:enrolledIn ?prog ;
                              schema:addressLocality ?ville ;
                              lod:mention ?mention .
                    ?prog rdfs:label ?filiere .
                    %s
                } ORDER BY ?filiere ?niveau
                LIMIT %d OFFSET %d
                """, filters, size, (page - 1) * size));

        List<Map<String, Object>> items = results.stream().map(r -> {
            Map<String, Object> s = new HashMap<>(r);
            s.put("id", r.get("id"));
            s.put("level", r.get("niveau"));
            s.put("program", r.get("filiere"));
            return s;
        }).collect(Collectors.toList());

        return Map.of("items", items, "page", page, "size", size);
    }

    @SuppressWarnings("unchecked")
    public void updateProfile(String studentId, Map<String, Object> data) {
        String uri = "https://data.lod-school.ma/id/" + studentId;
        String city = (String) data.getOrDefault("city", "");
        String level = (String) data.getOrDefault("level", "");
        String firstName = (String) data.getOrDefault("firstName", "");
        String lastName = (String) data.getOrDefault("lastName", "");
        List<String> skills = data.get("skills") instanceof List ? (List<String>) data.get("skills") : List.of();

        if (!firstName.isBlank()) {
            sparqlClient.update(String.format("DELETE WHERE { <%s> schema:givenName ?o . }", uri));
            sparqlClient.update(String.format("INSERT DATA { <%s> schema:givenName \"%s\" . }", uri, firstName));
        }

        if (!lastName.isBlank()) {
            sparqlClient.update(String.format("DELETE WHERE { <%s> schema:familyName ?o . }", uri));
            sparqlClient.update(String.format("INSERT DATA { <%s> schema:familyName \"%s\" . }", uri, lastName));
        }

        if (!city.isBlank()) {
            sparqlClient.update(String.format("DELETE WHERE { <%s> schema:addressLocality ?o . }", uri));
            sparqlClient.update(String.format("INSERT DATA { <%s> schema:addressLocality \"%s\" . }", uri, city));
        }

        if (!level.isBlank()) {
            sparqlClient.update(String.format("DELETE WHERE { <%s> lod:level ?o . }", uri));
            sparqlClient.update(String.format("INSERT DATA { <%s> lod:level \"%s\" . }", uri, level));
        }

        sparqlClient.update(String.format("DELETE WHERE { <%s> lod:hasSkill ?s . }", uri));
        for (String skill : skills) {
            String skillHash = java.util.UUID.nameUUIDFromBytes(skill.toLowerCase().getBytes()).toString().substring(0, 12);
            sparqlClient.update(String.format("""
                INSERT DATA {
                    base:skill-%s a skos:Concept ;
                        skos:prefLabel "%s"@fr ;
                        skos:inScheme base:skill-scheme .
                    <%s> lod:hasSkill base:skill-%s .
                }
                """, skillHash, skill, uri, skillHash));
        }
    }
}
