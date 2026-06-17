package com.gradify.sparql.controller;

import com.gradify.sparql.service.SparqlExecutionService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/sparql")
public class SparqlExplorerController {

    private final SparqlExecutionService executionService;

    public SparqlExplorerController(SparqlExecutionService executionService) {
        this.executionService = executionService;
    }

    /**
     * POST /api/sparql/execute — Exécuter une requête SPARQL
     */
    @PostMapping("/execute")
    public ResponseEntity<?> execute(@RequestBody Map<String, String> request) {
        try {
            String query = request.get("query");
            String format = request.getOrDefault("format", "json");
            if (query == null || query.isBlank()) {
                return ResponseEntity.badRequest().body(Map.of("message", "Query is required"));
            }
            // Security: block write operations
            String upper = query.toUpperCase();
            if (upper.contains("INSERT") || upper.contains("DELETE") || upper.contains("DROP") || upper.contains("CLEAR")) {
                return ResponseEntity.status(403).body(Map.of("message", "Write operations are not allowed"));
            }
            Object results = executionService.execute(query, format);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/sparql/stats — Statistiques globales
     */
    @GetMapping("/stats")
    public ResponseEntity<?> getStats() {
        try {
            return ResponseEntity.ok(executionService.getStats());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/sparql/templates — Liste des templates prédéfinis
     */
    @GetMapping("/templates")
    public ResponseEntity<?> getTemplates() {
        return ResponseEntity.ok(executionService.getTemplates());
    }
}
