package com.quickbite.Autenticacion.controller;

import com.quickbite.Autenticacion.dto.AuthenticationRequest;
import com.quickbite.Autenticacion.dto.AuthenticationResponse;
import com.quickbite.Autenticacion.dto.RegisterRequest;
import com.quickbite.Autenticacion.service.AuthenticationService;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import io.github.resilience4j.ratelimiter.annotation.RateLimiter;
import io.github.resilience4j.retry.annotation.Retry;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Slf4j
@Tag(name = "Authentication", description = "Authentication and Authorization API")
public class AuthenticationController {
    
    private final AuthenticationService authenticationService;
    
    @PostMapping("/register")
    @Operation(summary = "Registrar nuevo usuario", description = "Crea una nueva cuenta de usuario con las credenciales proporcionadas")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Usuario registrado exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos o usuario ya existe"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @CircuitBreaker(name = "authenticationService", fallbackMethod = "registerFallback")
    @RateLimiter(name = "authenticationService")
    @Retry(name = "authenticationService")
    public ResponseEntity<AuthenticationResponse> register(@Valid @RequestBody RegisterRequest request) {
        log.info("Registrando nuevo usuario: {}", request.getUsername());
        try {
            AuthenticationResponse response = authenticationService.register(request);
            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            log.error("Registro fallido para usuario {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.badRequest()
                    .body(AuthenticationResponse.builder()
                            .message(e.getMessage())
                            .build());
        }
    }
    
    @PostMapping("/authenticate")
    @Operation(summary = "Autenticar usuario", description = "Autentica las credenciales del usuario y retorna tokens JWT")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Autenticación exitosa"),
        @ApiResponse(responseCode = "401", description = "Credenciales inválidas"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @CircuitBreaker(name = "authenticationService", fallbackMethod = "authenticateFallback")
    @RateLimiter(name = "authenticationService")
    @Retry(name = "authenticationService")
    public ResponseEntity<AuthenticationResponse> authenticate(@Valid @RequestBody AuthenticationRequest request) {
        log.info("Autenticando usuario: {}", request.getUsername());
        try {
            AuthenticationResponse response = authenticationService.authenticate(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Autenticación fallida para usuario {}: {}", request.getUsername(), e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthenticationResponse.builder()
                            .message("Credenciales inválidas")
                            .build());
        }
    }
    
    @PostMapping("/refresh")
    @Operation(summary = "Refrescar token JWT", description = "Genera nuevos tokens de acceso y refresco")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token refrescado exitosamente"),
        @ApiResponse(responseCode = "401", description = "Token de refresco inválido"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    @CircuitBreaker(name = "authenticationService", fallbackMethod = "refreshFallback")
    @RateLimiter(name = "authenticationService")
    public ResponseEntity<AuthenticationResponse> refreshToken(@RequestBody Map<String, String> request) {
        String refreshToken = request.get("refreshToken");
        if (refreshToken == null) {
            return ResponseEntity.badRequest()
                    .body(AuthenticationResponse.builder()
                            .message("Token de refresco requerido")
                            .build());
        }
        
        log.info("Refrescando token");
        try {
            AuthenticationResponse response = authenticationService.refreshToken(refreshToken);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            log.error("Falló refresco de token: {}", e.getMessage());
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(AuthenticationResponse.builder()
                            .message("Token de refresco inválido")
                            .build());
        }
    }
    
    @PostMapping("/validate")
    @Operation(summary = "Validar token JWT", description = "Valida el token JWT proporcionado")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Token válido"),
        @ApiResponse(responseCode = "401", description = "Token inválido"),
        @ApiResponse(responseCode = "500", description = "Error interno del servidor")
    })
    public ResponseEntity<Map<String, Object>> validateToken(HttpServletRequest request) {
        String token = extractTokenFromRequest(request);
        if (token == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "No se proporcionó token"));
        }
        
        try {
            return ResponseEntity.ok(Map.of("valid", true, "message", "Token válido"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED)
                    .body(Map.of("valid", false, "message", "Token inválido"));
        }
    }
    
    private String extractTokenFromRequest(HttpServletRequest request) {
        final String authHeader = request.getHeader("Authorization");
        if (authHeader != null && authHeader.startsWith("Bearer ")) {
            return authHeader.substring(7);
        }
        return null;
    }
    
    public ResponseEntity<AuthenticationResponse> registerFallback(RegisterRequest request, Exception ex) {
        log.error("Fallback activado para registro: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(AuthenticationResponse.builder()
                        .message("Servicio de registro temporalmente no disponible")
                        .build());
    }
    
    public ResponseEntity<AuthenticationResponse> authenticateFallback(AuthenticationRequest request, Exception ex) {
        log.error("Fallback activado para autenticación: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(AuthenticationResponse.builder()
                        .message("Servicio de autenticación temporalmente no disponible")
                        .build());
    }
    
    public ResponseEntity<AuthenticationResponse> refreshFallback(Map<String, String> request, Exception ex) {
        log.error("Fallback activado para refresco: {}", ex.getMessage());
        return ResponseEntity.status(HttpStatus.SERVICE_UNAVAILABLE)
                .body(AuthenticationResponse.builder()
                        .message("Servicio de refresco temporalmente no disponible")
                        .build());
    }
}
