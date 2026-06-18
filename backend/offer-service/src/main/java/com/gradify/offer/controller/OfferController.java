package com.gradify.offer.controller;

import com.gradify.offer.service.OfferService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.*;

@RestController
@RequestMapping("/api/offers")
public class OfferController {

    private final OfferService offerService;

    public OfferController(OfferService offerService) {
        this.offerService = offerService;
    }

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

    @GetMapping("/filters")
    public ResponseEntity<?> getFilters() {
        try {
            return ResponseEntity.ok(offerService.getFilters());
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping
    public ResponseEntity<?> createOffer(@RequestBody Map<String, Object> body) {
        try {
            Map<String, Object> result = offerService.createOffer(body);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<?> updateOffer(@PathVariable String id, @RequestBody Map<String, Object> body) {
        try {
            body.put("id", id);
            Map<String, Object> result = offerService.updateOffer(body);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteOffer(@PathVariable String id) {
        try {
            offerService.deleteOffer(id);
            return ResponseEntity.ok(Map.of("message", "Offre supprimée"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mine")
    public ResponseEntity<?> getMyOffers(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            return ResponseEntity.ok(offerService.getByCompany(userId != null ? userId : "unknown"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/apply")
    public ResponseEntity<?> applyToOffer(@PathVariable String id, @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            String studentId = userId != null ? userId : "anonymous";
            offerService.applyToOffer(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Candidature enregistrée", "offerId", id, "studentId", studentId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/{id}/applications")
    public ResponseEntity<?> getApplications(@PathVariable String id) {
        try {
            return ResponseEntity.ok(offerService.getApplications(id));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PutMapping("/applications/{studentId}/{offerId}/status")
    public ResponseEntity<?> updateApplicationStatus(@PathVariable String studentId, @PathVariable String offerId, @RequestBody Map<String, String> body) {
        try {
            String newStatus = body.get("status");
            offerService.updateApplicationStatus(offerId, studentId, newStatus);
            return ResponseEntity.ok(Map.of("message", "Statut mis à jour"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-applications")
    public ResponseEntity<?> getMyApplications(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            String studentId = userId != null ? userId : "anonymous";
            return ResponseEntity.ok(offerService.getStudentApplications(studentId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/mine/stats")
    public ResponseEntity<?> getMyStats(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            return ResponseEntity.ok(offerService.getCompanyStats(userId != null ? userId : "unknown"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<?> bookmarkOffer(@PathVariable String id, @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            String studentId = userId != null ? userId : "anonymous";
            offerService.bookmarkOffer(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Offre ajoutée aux favoris"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @DeleteMapping("/{id}/bookmark")
    public ResponseEntity<?> removeBookmark(@PathVariable String id, @RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            String studentId = userId != null ? userId : "anonymous";
            offerService.removeBookmark(id, studentId);
            return ResponseEntity.ok(Map.of("message", "Offre retirée des favoris"));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/bookmarks")
    public ResponseEntity<?> getBookmarks(@RequestHeader(value = "X-User-Id", required = false) String userId) {
        try {
            String studentId = userId != null ? userId : "anonymous";
            return ResponseEntity.ok(offerService.getBookmarks(studentId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
