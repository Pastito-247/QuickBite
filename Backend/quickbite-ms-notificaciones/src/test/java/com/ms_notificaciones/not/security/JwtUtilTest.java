package com.ms_notificaciones.not.security;

import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.test.util.ReflectionTestUtils;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Arrays;
import java.util.Date;
import java.util.List;

import static org.assertj.core.api.Assertions.assertThat;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private SecretKey signingKey;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil();
        String secret = "test-secret-key-for-jwt-signing-notifications-service-2024";
        ReflectionTestUtils.setField(jwtUtil, "secret", secret);
        ReflectionTestUtils.setField(jwtUtil, "expiration", 86400000L);
        signingKey = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
    }

    private String generateTestToken(String username, List<String> roles) {
        return Jwts.builder()
                .subject(username)
                .claim("roles", roles)
                .issuedAt(new Date())
                .expiration(new Date(System.currentTimeMillis() + 86400000))
                .signWith(signingKey)
                .compact();
    }

    @Test
    @DisplayName("Debe extraer username del token")
    void extractUsername_DebeRetornarUsername() {
        // Given
        String token = generateTestToken("testuser", Arrays.asList("ROLE_CLIENTE"));

        // When
        String username = jwtUtil.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    @DisplayName("Debe extraer roles del token")
    void extractRoles_DebeRetornarRoles() {
        // Given
        String token = generateTestToken("testuser", Arrays.asList("ROLE_ADMIN", "ROLE_COCINA"));

        // When
        List<String> roles = jwtUtil.extractRoles(token);

        // Then
        assertThat(roles).hasSize(2);
        assertThat(roles).contains("ROLE_ADMIN", "ROLE_COCINA");
    }

    @Test
    @DisplayName("Debe validar token válido")
    void validateToken_TokenValido_DebeRetornarTrue() {
        // Given
        String token = generateTestToken("testuser", Arrays.asList("ROLE_CLIENTE"));

        // When
        boolean isValid = jwtUtil.validateToken(token);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    @DisplayName("Debe retornar false para token expirado")
    void validateToken_TokenExpirado_DebeRetornarFalse() {
        // Given
        String expiredToken = Jwts.builder()
                .subject("testuser")
                .issuedAt(new Date(System.currentTimeMillis() - 86400000 * 2))
                .expiration(new Date(System.currentTimeMillis() - 86400000))
                .signWith(signingKey)
                .compact();

        // When
        boolean isValid = jwtUtil.validateToken(expiredToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Debe retornar false para token inválido")
    void validateToken_TokenInvalido_DebeRetornarFalse() {
        // Given
        String invalidToken = "invalid.token.here";

        // When
        boolean isValid = jwtUtil.validateToken(invalidToken);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    @DisplayName("Debe verificar si tiene rol específico")
    void hasRole_DebeRetornarTrueSiTieneRol() {
        // Given
        String token = generateTestToken("testuser", Arrays.asList("ROLE_ADMIN", "ROLE_COCINA"));

        // When
        boolean hasAdminRole = jwtUtil.hasRole(token, "ROLE_ADMIN");
        boolean hasClienteRole = jwtUtil.hasRole(token, "ROLE_CLIENTE");

        // Then
        assertThat(hasAdminRole).isTrue();
        assertThat(hasClienteRole).isFalse();
    }
}
