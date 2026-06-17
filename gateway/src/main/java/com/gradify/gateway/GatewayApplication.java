package com.gradify.gateway;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

/**
 * Gradify API Gateway — Point d'entrée unique pour le frontend.
 * Route les requêtes vers les microservices appropriés.
 * Gère : CORS, validation JWT (routes admin), rate limiting.
 */
@SpringBootApplication
public class GatewayApplication {

    public static void main(String[] args) {
        SpringApplication.run(GatewayApplication.class, args);
    }
}
