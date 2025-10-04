package com.healthtracker.htbackend.config;

import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.servers.Server;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

import java.util.List;

/**
 * OpenAPI configuration for Health Tracker Backend API
 * Provides comprehensive API documentation with authentication details
 */
@Configuration
public class OpenApiConfig {

    @Bean
    public OpenAPI healthTrackerOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("Health Tracker Backend API")
                        .description("Comprehensive health tracking API with session-based authentication. " +
                                "Track water intake, food consumption, workouts, and daily health scores.")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Health Tracker Team")
                                .email("support@healthtracker.com"))
                        .license(new License()
                                .name("MIT License")
                                .url("https://opensource.org/licenses/MIT")))
                .servers(List.of(
                        new Server().url("http://localhost:8080").description("Development server"),
                        new Server().url("https://api.healthtracker.com").description("Production server")))
                .components(new Components()
                        .addSecuritySchemes("sessionAuth", new SecurityScheme()
                                .type(SecurityScheme.Type.APIKEY)
                                .in(SecurityScheme.In.COOKIE)
                                .name("JSESSIONID")
                                .description("Session-based authentication using HTTP cookies. " +
                                        "Login via /api/auth/login to obtain session cookie.")))
                .addSecurityItem(new SecurityRequirement().addList("sessionAuth"));
    }
}