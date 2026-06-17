package com.gradify.matching.controller;

import com.gradify.matching.service.MatchingService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/matching")
public class MatchingController {

    private final MatchingService matchingService;

    public MatchingController(MatchingService matchingService) {
        this.matchingService = matchingService;
    }

    @PostMapping("/score")
    public ResponseEntity<?> computeScore(@RequestBody Map<String, String> request) {
        try {
            String studentId = request.get("studentId");
            String offerId = request.get("offerId");
            return ResponseEntity.ok(matchingService.computeScore(studentId, offerId));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/offer/{offerId}/students")
    public ResponseEntity<?> studentsForOffer(
            @PathVariable String offerId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            return ResponseEntity.ok(matchingService.findStudentsForOffer(offerId, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/student/{studentId}/offers")
    public ResponseEntity<?> offersForStudent(
            @PathVariable String studentId,
            @RequestParam(defaultValue = "1") int page,
            @RequestParam(defaultValue = "10") int size) {
        try {
            return ResponseEntity.ok(matchingService.findOffersForStudent(studentId, page, size));
        } catch (Exception e) {
            return ResponseEntity.status(500).body(Map.of("error", e.getMessage()));
        }
    }
}
