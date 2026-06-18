package com.gradify.auth.sparql;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Component;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Component
public class SparqlClient {

    @Value("${sparql.endpoint:http://localhost:3030/lod/sparql}")
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
    public List<Map<String, String>> query(String sparql) {
        String fullQuery = PREFIXES + sparql;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_FORM_URLENCODED);
        headers.setAccept(List.of(MediaType.valueOf("application/sparql-results+json")));
        MultiValueMap<String, String> body = new LinkedMultiValueMap<>();
        body.add("query", fullQuery);
        HttpEntity<MultiValueMap<String, String>> request = new HttpEntity<>(body, headers);
        try {
            ResponseEntity<Map> response = restTemplate.exchange(endpoint, HttpMethod.POST, request, Map.class);
            Map<String, Object> data = response.getBody();
            if (data == null) return Collections.emptyList();
            Map<String, Object> results = (Map<String, Object>) data.get("results");
            List<Map<String, Object>> bindings = (List<Map<String, Object>>) results.get("bindings");
            List<Map<String, String>> output = new ArrayList<>();
            for (Map<String, Object> row : bindings) {
                Map<String, String> parsed = new HashMap<>();
                for (Map.Entry<String, Object> entry : row.entrySet()) {
                    Map<String, String> val = (Map<String, String>) entry.getValue();
                    parsed.put(entry.getKey(), val.get("value"));
                }
                output.add(parsed);
            }
            return output;
        } catch (Exception e) {
            throw new RuntimeException("SPARQL query failed: " + e.getMessage(), e);
        }
    }

    public void update(String sparqlUpdate) {
        String updateEndpoint = endpoint.replace("/sparql", "/update");
        String fullUpdate = PREFIXES + sparqlUpdate;
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.valueOf("application/sparql-update"));
        HttpEntity<String> request = new HttpEntity<>(fullUpdate, headers);
        try {
            restTemplate.exchange(updateEndpoint, HttpMethod.POST, request, String.class);
        } catch (Exception e) {
            throw new RuntimeException("SPARQL update failed: " + e.getMessage(), e);
        }
    }
}
