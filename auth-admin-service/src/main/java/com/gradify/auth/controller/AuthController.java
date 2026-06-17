package com.gradify.auth.controller;

import com.gradify.auth.dto.LoginRequest;
import com.gradify.auth.dto.TokenResponse;
import com.gradify.auth.service.AuthService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

/**
 * Contrôleur d'authentification — login avec rôle (STUDENT/ENTERPRISE/ADMIN).
 */
@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    /**
     * POST /api/auth/login
     * Body: { identifier, password, role }
     * Returns: { token, identifier, role, name }
     */
    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest request) {
        try {
            TokenResponse response = authService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(401)
                    .body(Map.of("message", e.getMessage()));
        }
    }

    /**
     * GET /api/auth/me — Vérifie le token (santé)
     */
    @GetMapping("/me")
    public ResponseEntity<?> me(@RequestHeader(value = "X-User-Id", required = false) String userId,
                                @RequestHeader(value = "X-User-Role", required = false) String userRole) {
        if (userId == null) {
            return ResponseEntity.status(401).body(Map.of("message", "Non authentifié"));
        }
        return ResponseEntity.ok(Map.of(
                "identifier", userId,
                "role", userRole != null ? userRole : "UNKNOWN"
        ));
    }
}
