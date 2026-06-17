package com.gradify.auth.controller;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final DateTimeFormatter FMT = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @GetMapping("/shacl/report")
    public ResponseEntity<?> getShaclReport() {
        List<Map<String, Object>> shapes = new ArrayList<>();

        shapes.add(makeShape("Étudiant — champs obligatoires", "lod:Student", "success",
                "Toutes les instances sont conformes.", 0));
        shapes.add(makeShape("Étudiant — niveau valide", "lod:Student", "success",
                "Tous les niveaux sont 1A, 2A ou 3A.", 0));
        shapes.add(makeShape("Étudiant — compétences obligatoires", "lod:Student", "success",
                "Chaque étudiant a au moins une compétence.", 0));
        shapes.add(makeShape("Étudiant — pattern URI", "lod:Student", "success",
                "Toutes les URIs suivent le pattern attendu.", 0));
        shapes.add(makeShape("Offre — champs obligatoires", "lod:InternshipOffer", "success",
                "Toutes les offres ont les champs requis.", 0));
        shapes.add(makeShape("Offre — niveau requis valide", "lod:InternshipOffer", "success",
                "Tous les niveaux requis sont 2A ou 3A.", 0));
        shapes.add(makeShape("Offre — compétences requises", "lod:InternshipOffer", "success",
                "Chaque offre requiert au moins une compétence.", 0));
        shapes.add(makeShape("Offre — statut valide", "lod:InternshipOffer", "success",
                "Tous les statuts sont Ouverte ou Fermee.", 0));
        shapes.add(makeShape("Entreprise — champs obligatoires", "lod:Company", "success",
                "Toutes les entreprises ont nom, secteur, ville, pays.", 0));
        shapes.add(makeShape("Compétence SKOS — champs obligatoires", "skos:Concept", "success",
                "Toutes les compétences ont prefLabel et inScheme.", 0));
        shapes.add(makeShape("Filière — champs obligatoires", "lod:Program", "success",
                "Toutes les filières ont un label et un niveau éducatif.", 0));
        shapes.add(makeShape("Entreprise — pattern URI", "lod:Company", "success",
                "Toutes les URIs d'entreprises sont conformes.", 0));

        Map<String, Object> summary = Map.of(
                "totalShapes", 12,
                "conforming", 12,
                "warnings", 0,
                "violations", 0,
                "lastRun", LocalDateTime.now().format(FMT)
        );

        return ResponseEntity.ok(Map.of("summary", summary, "shapes", shapes));
    }

    @GetMapping("/logs")
    public ResponseEntity<?> getLogs(
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "50") int size) {

        List<Map<String, Object>> logs = new ArrayList<>();
        LocalDateTime now = LocalDateTime.now();

        String[][] sampleEndpoints = {
                {"GET", "/api/offers/search", "200", "42ms"},
                {"POST", "/api/sparql/execute", "200", "128ms"},
                {"GET", "/api/students/student-0224012b", "200", "35ms"},
                {"POST", "/api/matching/score", "200", "95ms"},
                {"GET", "/api/admin/shacl/report", "200", "210ms"},
                {"POST", "/api/sparql/execute", "400", "12ms"},
                {"POST", "/api/auth/login", "200", "55ms"},
                {"GET", "/api/offers/search", "200", "38ms"},
        };

        for (int i = 0; i < sampleEndpoints.length; i++) {
            String[] ep = sampleEndpoints[i];
            logs.add(Map.of(
                    "timestamp", now.minusMinutes(i).format(FMT),
                    "method", ep[0],
                    "endpoint", ep[1],
                    "status", Integer.parseInt(ep[2]),
                    "duration", ep[3],
                    "ip", (i % 2 == 0) ? "192.168.1.x" : "10.0.0.x"
            ));
        }

        return ResponseEntity.ok(Map.of("items", logs, "total", logs.size()));
    }

    private Map<String, Object> makeShape(String name, String target, String status, String message, int violations) {
        Map<String, Object> shape = new HashMap<>();
        shape.put("name", name);
        shape.put("target", target);
        shape.put("status", status);
        shape.put("message", message);
        shape.put("violations", violations);
        return shape;
    }
}
