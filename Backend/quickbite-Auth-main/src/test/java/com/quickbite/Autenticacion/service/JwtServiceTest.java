package com.quickbite.Autenticacion.service;

import com.quickbite.Autenticacion.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.test.util.ReflectionTestUtils;

import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@ExtendWith(MockitoExtension.class)
class JwtServiceTest {

    @InjectMocks
    private JwtService jwtService;

    private User testUser;

    @BeforeEach
    void setUp() {
        ReflectionTestUtils.setField(jwtService, "secretKey", "mySecretKeyForTestingPurposes123456789");
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", 86400000L);
        ReflectionTestUtils.setField(jwtService, "refreshExpiration", 604800000L);

        testUser = User.builder()
                .id(1L)
                .username("testuser")
                .email("test@example.com")
                .password("encodedPassword")
                .firstName("Test")
                .lastName("User")
                .phoneNumber("1234567890")
                .role(User.Role.CLIENT)
                .permissions(new HashSet<>())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
    }

    @Test
    void shouldGenerateTokenSuccessfully() {
        // When
        String token = jwtService.generateToken(testUser);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }

    @Test
    void shouldGenerateRefreshTokenSuccessfully() {
        // When
        String refreshToken = jwtService.generateRefreshToken(testUser);

        // Then
        assertThat(refreshToken).isNotNull();
        assertThat(refreshToken).isNotEmpty();
    }

    @Test
    void shouldExtractUsernameFromToken() {
        // Given
        String token = jwtService.generateToken(testUser);

        // When
        String username = jwtService.extractUsername(token);

        // Then
        assertThat(username).isEqualTo("testuser");
    }

    @Test
    void shouldValidateTokenSuccessfully() {
        // Given
        String token = jwtService.generateToken(testUser);

        // When
        boolean isValid = jwtService.isTokenValid(token, testUser);

        // Then
        assertThat(isValid).isTrue();
    }

    @Test
    void shouldReturnFalseWhenTokenIsExpired() {
        // Given
        ReflectionTestUtils.setField(jwtService, "jwtExpiration", -1000L); // Expired token
        String token = jwtService.generateToken(testUser);

        // When & Then
        assertThatThrownBy(() -> jwtService.isTokenValid(token, testUser))
            .isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    @Test
    void shouldReturnFalseWhenTokenUsernameDoesNotMatch() {
        // Given
        String token = jwtService.generateToken(testUser);
        User differentUser = User.builder()
                .id(2L)
                .username("differentuser")
                .email("different@example.com")
                .password("encodedPassword")
                .role(User.Role.CLIENT)
                .permissions(new HashSet<>())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();

        // When
        boolean isValid = jwtService.isTokenValid(token, differentUser);

        // Then
        assertThat(isValid).isFalse();
    }

    @Test
    void shouldThrowExceptionWhenTokenIsInvalid() {
        // Given
        String invalidToken = "invalid.token.string";

        // When & Then
        assertThatThrownBy(() -> jwtService.extractUsername(invalidToken))
            .isInstanceOf(io.jsonwebtoken.JwtException.class);
    }

    @Test
    void shouldGetJwtExpiration() {
        // When
        long expiration = jwtService.getJwtExpiration();

        // Then
        assertThat(expiration).isEqualTo(86400000L);
    }

    @Test
    void shouldGetRefreshExpiration() {
        // When
        long expiration = jwtService.getRefreshExpiration();

        // Then
        assertThat(expiration).isEqualTo(604800000L);
    }

    @Test
    void shouldGenerateTokenWithExtraClaims() {
        // Given
        java.util.Map<String, Object> extraClaims = new java.util.HashMap<>();
        extraClaims.put("customClaim", "customValue");

        // When
        String token = jwtService.generateToken(extraClaims, testUser);

        // Then
        assertThat(token).isNotNull();
        assertThat(token).isNotEmpty();
    }
}
