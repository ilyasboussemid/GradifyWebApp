package com.gradify.auth;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Auth & Admin Service — Gère l'authentification JWT avec rôles
 * (STUDENT, ENTERPRISE, ADMIN) et les endpoints admin (SHACL, logs).
 */
@SpringBootApplication
public class AuthAdminApplication {

    public static void main(String[] args) {
        SpringApplication.run(AuthAdminApplication.class, args);
    }
}
