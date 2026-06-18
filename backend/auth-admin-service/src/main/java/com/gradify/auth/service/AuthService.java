package com.gradify.auth.service;

import com.gradify.auth.dto.LoginRequest;
import com.gradify.auth.dto.TokenResponse;
import com.gradify.auth.security.JwtUtil;
import com.gradify.auth.sparql.SparqlClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.util.*;
import java.util.concurrent.ConcurrentHashMap;

@Service
public class AuthService {

    private final JwtUtil jwtUtil;
    private final SparqlClient sparqlClient;

    @Value("${auth.admin.username:admin}")
    private String adminUsername;

    @Value("${auth.admin.password:admin123}")
    private String adminPassword;

    private static final ConcurrentHashMap<String, String> STUDENT_PASSWORDS = new ConcurrentHashMap<>();
    private static final ConcurrentHashMap<String, String> ENTERPRISE_PASSWORDS = new ConcurrentHashMap<>(Map.of(
            "techsecure", "pass123",
            "cloudfirst", "pass123",
            "datamaroc", "pass123",
            "webagency", "pass123",
            "ailab", "pass123"
    ));

    public AuthService(JwtUtil jwtUtil, SparqlClient sparqlClient) {
        this.jwtUtil = jwtUtil;
        this.sparqlClient = sparqlClient;
    }

    public TokenResponse authenticate(LoginRequest request) {
        String identifier = request.getIdentifier();
        String password = request.getPassword();
        String role = request.getRole().toUpperCase();

        switch (role) {
            case "ADMIN":
                if (!adminUsername.equals(identifier) || !adminPassword.equals(password)) {
                    throw new IllegalArgumentException("Identifiants administrateur invalides");
                }
                return new TokenResponse(jwtUtil.generateToken(identifier, "ADMIN", "Administrateur"), identifier, "ADMIN", "Administrateur");

            case "ENTERPRISE":
                String key = identifier.toLowerCase().replaceAll("[^a-z0-9]", "");
                String entPwd = ENTERPRISE_PASSWORDS.get(key);
                if (entPwd == null || !entPwd.equals(password)) {
                    throw new IllegalArgumentException("Identifiants entreprise invalides. Vérifiez que vous avez choisi le bon rôle.");
                }
                return new TokenResponse(jwtUtil.generateToken(identifier, "ENTERPRISE", identifier), identifier, "ENTERPRISE", identifier);

            case "STUDENT":
                if (identifier == null || identifier.isBlank()) {
                    throw new IllegalArgumentException("Identifiant requis");
                }
                if (ENTERPRISE_PASSWORDS.containsKey(identifier.toLowerCase().replaceAll("[^a-z0-9]", ""))) {
                    throw new IllegalArgumentException("Cet identifiant est une entreprise. Choisissez le rôle Entreprise.");
                }
                if (identifier.equals(adminUsername)) {
                    throw new IllegalArgumentException("Cet identifiant est l'admin. Choisissez le rôle Admin.");
                }
                String studentPwd = STUDENT_PASSWORDS.get(identifier);
                if (studentPwd != null) {
                    if (!studentPwd.equals(password)) throw new IllegalArgumentException("Mot de passe invalide");
                } else {
                    if (!"etudiant".equals(password) && !"pass123".equals(password)) {
                        throw new IllegalArgumentException("Mot de passe étudiant invalide");
                    }
                }
                String name = "Étudiant " + identifier.substring(0, Math.min(16, identifier.length()));
                return new TokenResponse(jwtUtil.generateToken(identifier, "STUDENT", name), identifier, "STUDENT", name);

            default:
                throw new IllegalArgumentException("Rôle invalide : " + role);
        }
    }

    public void register(String identifier, String password, String role, Map<String, String> data) {
        switch (role.toUpperCase()) {
            case "ENTERPRISE":
                String key = identifier.toLowerCase().replaceAll("[^a-z0-9]", "");
                if (ENTERPRISE_PASSWORDS.containsKey(key)) {
                    throw new IllegalArgumentException("Cet identifiant entreprise existe déjà");
                }
                if (STUDENT_PASSWORDS.containsKey(identifier)) {
                    throw new IllegalArgumentException("Cet identifiant est déjà utilisé par un étudiant");
                }
                ENTERPRISE_PASSWORDS.put(key, password);
                try { insertEnterprise(identifier, data); } catch (Exception e) {
                    System.err.println("Warning: Could not persist to Fuseki: " + e.getMessage());
                }
                break;

            case "STUDENT":
                if (STUDENT_PASSWORDS.containsKey(identifier)) {
                    throw new IllegalArgumentException("Cet identifiant étudiant existe déjà");
                }
                if (ENTERPRISE_PASSWORDS.containsKey(identifier.toLowerCase().replaceAll("[^a-z0-9]", ""))) {
                    throw new IllegalArgumentException("Cet identifiant est déjà utilisé par une entreprise");
                }
                STUDENT_PASSWORDS.put(identifier, password);
                try { insertStudent(identifier, data); } catch (Exception e) {
                    System.err.println("Warning: Could not persist to Fuseki: " + e.getMessage());
                }
                break;

            default:
                throw new IllegalArgumentException("L'inscription admin n'est pas autorisée");
        }
    }

    private void insertEnterprise(String identifier, Map<String, String> data) {
        String companyName = data.getOrDefault("companyName", identifier);
        String sector = data.getOrDefault("sector", "Technologie");
        String city = data.getOrDefault("city", "Casablanca");
        String hash = UUID.nameUUIDFromBytes(identifier.getBytes()).toString().substring(0, 12);

        String sparql = String.format("""
            INSERT DATA {
                base:company-%s a lod:Company, schema:Organization ;
                    schema:name "%s"^^xsd:string ;
                    lod:sector "%s"@fr ;
                    schema:addressLocality "%s"^^xsd:string ;
                    schema:addressCountry "Maroc"^^xsd:string ;
                    dcterms:identifier "%s"^^xsd:string .
            }
            """, hash, companyName, sector, city, identifier);

        sparqlClient.update(sparql);
    }

    private void insertStudent(String identifier, Map<String, String> data) {
        String programLabel = data.getOrDefault("program", "Genie Logiciel");
        String level = data.getOrDefault("level", "2A");
        String city = data.getOrDefault("city", "Casablanca");
        String hash = UUID.nameUUIDFromBytes(identifier.getBytes()).toString().substring(0, 12);
        String programHash = UUID.nameUUIDFromBytes(programLabel.getBytes()).toString().substring(0, 12);

        String sparql = String.format("""
            INSERT DATA {
                base:student-%s a lod:Student, schema:Person ;
                    dcterms:identifier "%s"^^xsd:string ;
                    lod:level "%s" ;
                    lod:enrolledIn base:program-%s ;
                    schema:addressLocality "%s"^^xsd:string ;
                    lod:mention "Non evalue"@fr ;
                    lod:academicYear "2026"^^xsd:gYear .
            }
            """, hash, identifier, level, programHash, city);

        sparqlClient.update(sparql);
    }
}
