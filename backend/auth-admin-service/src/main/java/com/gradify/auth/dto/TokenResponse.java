package com.gradify.auth.dto;

public class TokenResponse {

    private String token;
    private String identifier;
    private String role;
    private String name;

    public TokenResponse() {}

    public TokenResponse(String token, String identifier, String role, String name) {
        this.token = token;
        this.identifier = identifier;
        this.role = role;
        this.name = name;
    }

    public String getToken() { return token; }
    public void setToken(String token) { this.token = token; }

    public String getIdentifier() { return identifier; }
    public void setIdentifier(String identifier) { this.identifier = identifier; }

    public String getRole() { return role; }
    public void setRole(String role) { this.role = role; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }
}
