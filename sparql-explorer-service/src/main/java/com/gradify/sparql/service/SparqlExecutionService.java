package com.gradify.sparql.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class SparqlExecutionService {

    @Value("${sparql.endpoint}")
    private String endpoint;

    private final RestTemplate restTemplate = new RestTemplate();

    private static final String PREFIXES = """
            PREFIX lod:     <https://data.lod-school.ma/ontology#>
            PREFIX base:    <https://data.lod-school.ma/id/>
            PREFIX schema:  <https://schema.org/>
            PREFIX skos:    <http://www.w3.org/2004/02/skos/core#>
            PREFIX dcterms: <http://purl.org/dc/terms/>
            PREFIX rdfs:    <http://www.w3.org/2000/01/rdf-schema#>
            PREFIX xsd:     <http://www.w3.org/2001/XMLSchema#>
            """;

    @SuppressWarnings("unchecked")
    public Object execute(String query, String format) {
        String fullQuery = PREFIXES + query;
        boolean isConstruct = query.trim().toUpperCase().startsWith("CONSTRUCT");

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);

        if (isConstruct) {
            headers.setAccept(List.of(MediaType.valueOf("text/turtle")));
        } else {
            headers.setAccept(List.of(MediaType.valueOf("application/sparql-results+json")));
        }

        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("query", fullQuery);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);

        if (isConstruct) {
            ResponseEntity<String> response = restTemplate.exchange(endpoint, HttpMethod.POST, request, String.class);
            return Map.of("columns", List.of("result"), "rows", List.of(Map.of("result", response.getBody())));
        }

        ResponseEntity<Map> response = restTemplate.exchange(endpoint, HttpMethod.POST, request, Map.class);
        Map<String, Object> data = response.getBody();
        if (data == null) return Map.of("columns", List.of(), "rows", List.of());

        Map<String, Object> results = (Map<String, Object>) data.get("results");
        List<Map<String, Object>> bindings = (List<Map<String, Object>>) results.get("bindings");
        Map<String, Object> head = (Map<String, Object>) data.get("head");
        List<String> vars = (List<String>) head.get("vars");

        List<Map<String, String>> rows = new ArrayList<>();
        for (Map<String, Object> row : bindings) {
            Map<String, String> parsed = new LinkedHashMap<>();
            for (String var : vars) {
                if (row.containsKey(var)) {
                    Map<String, String> val = (Map<String, String>) row.get(var);
                    parsed.put(var, val.get("value"));
                } else {
                    parsed.put(var, null);
                }
            }
            rows.add(parsed);
        }

        return Map.of("columns", vars, "rows", rows);
    }

    public Map<String, Object> getStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("students", count("?s a lod:Student"));
        stats.put("offers", count("?s a lod:InternshipOffer"));
        stats.put("companies", count("?s a lod:Company"));
        stats.put("skills", count("?s a skos:Concept"));
        return stats;
    }

    @SuppressWarnings("unchecked")
    private int count(String pattern) {
        String query = String.format("SELECT (COUNT(?s) AS ?total) WHERE { %s . }", pattern);
        try {
            Object result = execute(query, "json");
            Map<String, Object> r = (Map<String, Object>) result;
            List<Map<String, String>> rows = (List<Map<String, String>>) r.get("rows");
            if (rows != null && !rows.isEmpty()) {
                return Integer.parseInt(rows.get(0).get("total"));
            }
        } catch (Exception ignored) {}
        return 0;
    }

    public List<Map<String, String>> getTemplates() {
        return List.of(
                Map.of("id", "Q1", "name", "Liste des étudiants", "type", "SELECT"),
                Map.of("id", "Q2", "name", "Toutes les offres de stage", "type", "SELECT"),
                Map.of("id", "Q3", "name", "Offres par compétence", "type", "SELECT"),
                Map.of("id", "Q4", "name", "Entreprises avec nb offres", "type", "SELECT"),
                Map.of("id", "Q5", "name", "Matching étudiants ↔ offres", "type", "SELECT"),
                Map.of("id", "Q6", "name", "Étudiants par programme", "type", "SELECT"),
                Map.of("id", "Q7", "name", "Compétences requises par offre", "type", "SELECT"),
                Map.of("id", "Q8", "name", "Étudiants compatibles", "type", "SELECT"),
                Map.of("id", "Q9", "name", "Détail entreprise", "type", "SELECT"),
                Map.of("id", "Q10", "name", "Stats compétences", "type", "SELECT"),
                Map.of("id", "Q11", "name", "Offres par entreprise", "type", "SELECT"),
                Map.of("id", "Q12", "name", "Étudiants multi-compétences", "type", "SELECT"),
                Map.of("id", "Q13", "name", "Offres récentes", "type", "SELECT"),
                Map.of("id", "Q14", "name", "Programmes/filières", "type", "SELECT"),
                Map.of("id", "Q15", "name", "Hiérarchie SKOS", "type", "SELECT"),
                Map.of("id", "C1", "name", "CONSTRUCT profil étudiant", "type", "CONSTRUCT"),
                Map.of("id", "C2", "name", "CONSTRUCT offre stage", "type", "CONSTRUCT"),
                Map.of("id", "C3", "name", "CONSTRUCT matching", "type", "CONSTRUCT")
        );
    }
}
