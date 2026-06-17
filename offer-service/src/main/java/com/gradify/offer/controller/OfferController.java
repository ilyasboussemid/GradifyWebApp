package com.gradify.offer.controller;

import com.gradify.offer.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur des offres de stage.
 * Endpoints : search, detail, filters.
 */
@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

    /**
     * GET /api/offers/search?skill=&company=&program=&city=&page=&size=
     */
    @GetMapping("/search")
    public ResponseEntity<?> search(
            @RequestParam(required = false) String skill,
            @RequestParam(required = false) String company,
            @RequestParam(required = false) String program,
            @RequestParam(required = false) String city,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            Map<String, Object> results = offerService.search(skill, company, program, city, page, size);
            return ResponseEntity.ok(results);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/offers/{id}
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getById(@PathVariable String id) {
        try {
            Map<String, Object> offer = offerService.getById(id);
            if (offer == null) {
                return ResponseEntity.notFound().build();
            }
            return ResponseEntity.ok(offer);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    /**
     * GET /api/offers/filters — Filtres disponibles
     */
    @GetMapping("/filters")
    public ResponseEntity<?> getFilters() {
        try {
            return ResponseEntity.ok(offerService.getFilters());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
