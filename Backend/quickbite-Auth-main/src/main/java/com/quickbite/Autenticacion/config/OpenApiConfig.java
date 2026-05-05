package com.quickbite.Autenticacion.config;

import io.swagger.v3.oas.models.Components;
import io.swagger.v3.oas.models.OpenAPI;
import io.swagger.v3.oas.models.info.Contact;
import io.swagger.v3.oas.models.info.Info;
import io.swagger.v3.oas.models.info.License;
import io.swagger.v3.oas.models.security.SecurityRequirement;
import io.swagger.v3.oas.models.security.SecurityScheme;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

/**
 * Configuración de OpenAPI para la documentación de la API del microservicio de Autenticación
 */
@Configuration
public class OpenApiConfig {
    
    @Bean
    public OpenAPI customOpenAPI() {
        return new OpenAPI()
                .info(new Info()
                        .title("API del Servicio de Autenticación Quick Bite")
                        .description("Microservicio de Autenticación y Autorización para Quick Bite - Gestiona login, registro, y validación de tokens JWT para los diferentes roles del sistema")
                        .version("1.0.0")
                        .contact(new Contact()
                                .name("Equipo de Desarrollo Quick Bite")
                                .email("dev@quickbite.com")
                                .url("https://quickbite.com"))
                        .license(new License()
                                .name("Apache 2.0")
                                .url("https://www.apache.org/licenses/LICENSE-2.0")))
                .addSecurityItem(new SecurityRequirement().addList("Autenticación Bearer"))
                .components(new Components()
                        .addSecuritySchemes("Autenticación Bearer", createAPIKeyScheme()));
    }
    
    /**
     * Configura el esquema de seguridad para tokens JWT
     * @return Esquema de seguridad configurado para autenticación Bearer
     */
    private SecurityScheme createAPIKeyScheme() {
        return new SecurityScheme()
                .type(SecurityScheme.Type.HTTP)
                .bearerFormat("JWT")
                .scheme("bearer")
                .description("Por favor, ingrese el token JWT sin la palabra 'Bearer'. Formato: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...");
    }
}
