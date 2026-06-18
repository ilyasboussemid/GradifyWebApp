package com.gradify.auth.service;

import com.gradify.auth.dto.LoginRequest;
import com.gradify.auth.dto.TokenResponse;
import com.gradify.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;

    @Value("${auth.admin.username:admin}")
    private String adminUsername;

    @Value("${auth.admin.password:admin123}")
    private String adminPassword;

    private static final java.util.concurrent.ConcurrentHashMap<String, String> ENTERPRISE_ACCOUNTS = new java.util.concurrent.ConcurrentHashMap<>(Map.of(
            "techsecure", "pass123",
            "cloudfirst", "pass123",
            "datamaroc", "pass123",
            "webagency", "pass123",
            "ailab", "pass123"
    ));

    private static final java.util.concurrent.ConcurrentHashMap<String, String> STUDENT_ACCOUNTS = new java.util.concurrent.ConcurrentHashMap<>();

    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    public TokenResponse authenticate(LoginRequest request) {
        String identifier = request.getIdentifier();
        String password = request.getPassword();
        String role = request.getRole().toUpperCase();

        switch (role) {
            case "ADMIN":
                return authenticateAdmin(identifier, password);
            case "ENTERPRISE":
                return authenticateEnterprise(identifier, password);
            case "STUDENT":
                return authenticateStudent(identifier, password);
            default:
                throw new IllegalArgumentException("Rôle invalide : " + role);
        }
    }

    public void register(String identifier, String password, String role, Map<String, String> data) {
        switch (role.toUpperCase()) {
            case "ENTERPRISE":
                String key = identifier.toLowerCase().replaceAll("[^a-z0-9]", "");
                if (ENTERPRISE_ACCOUNTS.containsKey(key)) {
                    throw new IllegalArgumentException("Cet identifiant entreprise existe déjà");
                }
                ENTERPRISE_ACCOUNTS.put(key, password);
                break;
            case "STUDENT":
                if (STUDENT_ACCOUNTS.containsKey(identifier)) {
                    throw new IllegalArgumentException("Cet identifiant étudiant existe déjà");
                }
                STUDENT_ACCOUNTS.put(identifier, password);
                break;
            default:
                throw new IllegalArgumentException("L'inscription admin n'est pas autorisée");
        }
    }

    private TokenResponse authenticateAdmin(String identifier, String password) {
        if (!adminUsername.equals(identifier) || !adminPassword.equals(password)) {
            throw new IllegalArgumentException("Identifiants administrateur invalides");
        }
        String token = jwtUtil.generateToken(identifier, "ADMIN", "Administrateur");
        return new TokenResponse(token, identifier, "ADMIN", "Administrateur");
    }

    private TokenResponse authenticateEnterprise(String identifier, String password) {
        String key = identifier.toLowerCase().replaceAll("[^a-z0-9]", "");
        if (!ENTERPRISE_ACCOUNTS.containsKey(key) || !ENTERPRISE_ACCOUNTS.get(key).equals(password)) {
            throw new IllegalArgumentException("Identifiants entreprise invalides");
        }
        String name = identifier;
        String token = jwtUtil.generateToken(identifier, "ENTERPRISE", name);
        return new TokenResponse(token, identifier, "ENTERPRISE", name);
    }

    private TokenResponse authenticateStudent(String identifier, String password) {
        if (identifier == null || identifier.isBlank()) {
            throw new IllegalArgumentException("L'identifiant est requis");
        }
        if (STUDENT_ACCOUNTS.containsKey(identifier)) {
            if (!STUDENT_ACCOUNTS.get(identifier).equals(password)) {
                throw new IllegalArgumentException("Mot de passe invalide");
            }
        } else {
            if (!"etudiant".equals(password) && !"pass123".equals(password)) {
                throw new IllegalArgumentException("Mot de passe étudiant invalide");
            }
        }
        String name = "Étudiant " + identifier.substring(0, Math.min(16, identifier.length()));
        String token = jwtUtil.generateToken(identifier, "STUDENT", name);
        return new TokenResponse(token, identifier, "STUDENT", name);
    }
}
