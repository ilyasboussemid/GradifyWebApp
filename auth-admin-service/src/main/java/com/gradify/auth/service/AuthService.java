package com.gradify.auth.service;

import com.gradify.auth.dto.LoginRequest;
import com.gradify.auth.dto.TokenResponse;
import com.gradify.auth.security.JwtUtil;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.Map;
import java.util.Set;

/**
 * Service d'authentification — validation des credentials et génération JWT.
 * Utilise des comptes en mémoire (adapté au contexte académique).
 *
 * Rôles supportés :
 * - STUDENT : tout ID étudiant valide (format student-xxxx)
 * - ENTERPRISE : identifiants d'entreprise prédéfinis
 * - ADMIN : compte admin unique configurable
 */
@Service
public class AuthService {

    private final JwtUtil jwtUtil;

    @Value("${auth.admin.username:admin}")
    private String adminUsername;

    @Value("${auth.admin.password:admin123}")
    private String adminPassword;

    // Entreprises prédéfinies (mot de passe simplifié pour le contexte académique)
    private static final Map<String, String> ENTERPRISE_ACCOUNTS = Map.of(
            "techsecure", "pass123",
            "cloudfirst", "pass123",
            "datamaroc", "pass123",
            "webagency", "pass123",
            "ailab", "pass123"
    );

    public AuthService(JwtUtil jwtUtil) {
        this.jwtUtil = jwtUtil;
    }

    /**
     * Authentifie un utilisateur et retourne un token JWT.
     * @throws IllegalArgumentException si les credentials sont invalides
     */
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
        // Pour les étudiants, on accepte tout ID au format student-xxxx
        // avec un mot de passe standard (simplifié pour le contexte académique)
        if (identifier == null || !identifier.startsWith("student-")) {
            throw new IllegalArgumentException("L'identifiant étudiant doit commencer par 'student-'");
        }
        // Mot de passe simplifié : "etudiant" ou "pass123"
        if (!"etudiant".equals(password) && !"pass123".equals(password)) {
            throw new IllegalArgumentException("Mot de passe étudiant invalide");
        }
        String name = "Étudiant " + identifier.substring(8, Math.min(16, identifier.length()));
        String token = jwtUtil.generateToken(identifier, "STUDENT", name);
        return new TokenResponse(token, identifier, "STUDENT", name);
    }
}
