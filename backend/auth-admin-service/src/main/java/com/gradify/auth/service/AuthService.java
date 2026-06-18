package com.gradify.auth.service;

import com.gradify.auth.dto.LoginRequest;
import com.gradify.auth.dto.TokenResponse;
import com.gradify.auth.security.JwtUtil;
import com.gradify.auth.sparql.SparqlClient;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
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

    private static final ConcurrentHashMap<String, String> PASSWORDS = new ConcurrentHashMap<>(Map.of(
            "admin", "admin123",
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
                String storedPwd = PASSWORDS.get(key);
                if (storedPwd == null || !storedPwd.equals(password)) {
                    throw new IllegalArgumentException("Identifiants entreprise invalides");
                }
                String entName = identifier;
                return new TokenResponse(jwtUtil.generateToken(identifier, "ENTERPRISE", entName), identifier, "ENTERPRISE", entName);
            case "STUDENT":
                if (identifier == null || identifier.isBlank()) {
                    throw new IllegalArgumentException("Identifiant requis");
                }
                String studentPwd = PASSWORDS.get(identifier);
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
        String key = role.equals("ENTERPRISE") ? identifier.toLowerCase().replaceAll("[^a-z0-9]", "") : identifier;

        if (PASSWORDS.containsKey(key)) {
            throw new IllegalArgumentException("Cet identifiant existe déjà");
        }

        PASSWORDS.put(key, password);

        try {
            if ("ENTERPRISE".equalsIgnoreCase(role)) {
                insertEnterprise(identifier, data);
            } else if ("STUDENT".equalsIgnoreCase(role)) {
                insertStudent(identifier, data);
            }
        } catch (Exception e) {
            System.err.println("Warning: Could not persist to Fuseki: " + e.getMessage());
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
        String firstName = data.getOrDefault("firstName", "");
        String lastName = data.getOrDefault("lastName", "");
        String programLabel = data.getOrDefault("program", "Genie Logiciel");
        String level = data.getOrDefault("level", "2A");
        String city = data.getOrDefault("city", "Casablanca");
        String hash = UUID.nameUUIDFromBytes(identifier.getBytes()).toString().substring(0, 12);
        String programHash = UUID.nameUUIDFromBytes(programLabel.getBytes()).toString().substring(0, 12);

        String nameTriples = "";
        if (!firstName.isBlank()) {
            nameTriples += String.format("    schema:givenName \"%s\"^^xsd:string ;\n", firstName);
        }
        if (!lastName.isBlank()) {
            nameTriples += String.format("    schema:familyName \"%s\"^^xsd:string ;\n", lastName);
        }

        String sparql = String.format("""
            INSERT DATA {
                base:student-%s a lod:Student, schema:Person ;
                    dcterms:identifier "%s"^^xsd:string ;
                    %s
                    lod:level "%s" ;
                    lod:enrolledIn base:program-%s ;
                    schema:addressLocality "%s"^^xsd:string ;
                    lod:mention "Non évalué"@fr ;
                    lod:academicYear "2026"^^xsd:gYear .
            }
            """, hash, identifier, nameTriples, level, programHash, city);

        sparqlClient.update(sparql);
    }
}
