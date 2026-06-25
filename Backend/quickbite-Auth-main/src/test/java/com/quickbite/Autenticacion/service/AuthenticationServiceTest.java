package com.quickbite.Autenticacion.service;

import com.quickbite.Autenticacion.dto.AuthenticationRequest;
import com.quickbite.Autenticacion.dto.AuthenticationResponse;
import com.quickbite.Autenticacion.dto.RegisterRequest;
import com.quickbite.Autenticacion.dto.UpdateProfileRequest;
import com.quickbite.Autenticacion.entity.User;
import com.quickbite.Autenticacion.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.HashSet;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AuthenticationServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private JwtService jwtService;

    @Mock
    private AuthenticationManager authenticationManager;

    @InjectMocks
    private AuthenticationService authenticationService;

    private RegisterRequest registerRequest;
    private AuthenticationRequest authRequest;
    private User testUser;

    @BeforeEach
    void setUp() {
        registerRequest = new RegisterRequest();
        registerRequest.setUsername("testuser");
        registerRequest.setEmail("test@example.com");
        registerRequest.setPassword("password123");
        registerRequest.setFirstName("Test");
        registerRequest.setLastName("User");
        registerRequest.setPhoneNumber("1234567890");
        registerRequest.setRole(User.Role.CLIENT);

        authRequest = new AuthenticationRequest();
        authRequest.setUsername("testuser");
        authRequest.setPassword("password123");

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
    void shouldRegisterUserSuccessfully() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(false);
        when(passwordEncoder.encode("password123")).thenReturn("encodedPassword");
        when(userRepository.save(any(User.class))).thenReturn(testUser);
        when(jwtService.generateToken(any(User.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");

        // When
        AuthenticationResponse response = authenticationService.register(registerRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        assertThat(response.getUsername()).isEqualTo("testuser");
        assertThat(response.getEmail()).isEqualTo("test@example.com");
        assertThat(response.getRole()).isEqualTo("CLIENT");
        verify(userRepository).save(any(User.class));
        verify(jwtService).generateToken(any(User.class));
        verify(jwtService).generateRefreshToken(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisteringWithDuplicateUsername() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authenticationService.register(registerRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El nombre de usuario ya existe");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenRegisteringWithDuplicateEmail() {
        // Given
        when(userRepository.existsByUsername("testuser")).thenReturn(false);
        when(userRepository.existsByEmail("test@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authenticationService.register(registerRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El correo electrónico ya está registrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldAuthenticateUserSuccessfully() {
        // Given
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByUsernameOrEmail("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(jwtService.generateToken(any(User.class))).thenReturn("accessToken");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("refreshToken");

        // When
        AuthenticationResponse response = authenticationService.authenticate(authRequest);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("accessToken");
        assertThat(response.getRefreshToken()).isEqualTo("refreshToken");
        assertThat(response.getUsername()).isEqualTo("testuser");
        verify(authenticationManager).authenticate(any(UsernamePasswordAuthenticationToken.class));
        verify(jwtService).generateToken(any(User.class));
        verify(jwtService).generateRefreshToken(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenAuthenticatingDisabledUser() {
        // Given
        testUser.setEnabled(false);
        when(authenticationManager.authenticate(any(UsernamePasswordAuthenticationToken.class)))
            .thenReturn(null);
        when(userRepository.findByUsernameOrEmail("testuser")).thenReturn(java.util.Optional.of(testUser));

        // When & Then
        assertThatThrownBy(() -> authenticationService.authenticate(authRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("La cuenta de usuario está deshabilitada");
        verify(jwtService, never()).generateToken(any(User.class));
    }

    @Test
    void shouldRefreshTokenSuccessfully() {
        // Given
        String refreshToken = "validRefreshToken";
        when(jwtService.extractUsername(refreshToken)).thenReturn("testuser");
        when(userRepository.findByUsernameOrEmail("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(jwtService.isTokenValid(refreshToken, testUser)).thenReturn(true);
        when(jwtService.generateToken(any(User.class))).thenReturn("newAccessToken");
        when(jwtService.generateRefreshToken(any(User.class))).thenReturn("newRefreshToken");

        // When
        AuthenticationResponse response = authenticationService.refreshToken(refreshToken);

        // Then
        assertThat(response).isNotNull();
        assertThat(response.getAccessToken()).isEqualTo("newAccessToken");
        assertThat(response.getRefreshToken()).isEqualTo("newRefreshToken");
        verify(jwtService).extractUsername(refreshToken);
        verify(jwtService).isTokenValid(refreshToken, testUser);
    }

    @Test
    void shouldThrowExceptionWhenRefreshingInvalidToken() {
        // Given
        String refreshToken = "invalidToken";
        when(jwtService.extractUsername(refreshToken)).thenReturn(null);

        // When & Then
        assertThatThrownBy(() -> authenticationService.refreshToken(refreshToken))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Token de refresco inválido");
    }

    @Test
    void shouldEnableUserSuccessfully() {
        // Given
        testUser.setEnabled(false);
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authenticationService.enableUser("testuser");

        // Then
        assertThat(testUser.getEnabled()).isTrue();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenEnablingNonExistentUser() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.enableUser("testuser"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Usuario no encontrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldDisableUserSuccessfully() {
        // Given
        testUser.setEnabled(true);
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        authenticationService.disableUser("testuser");

        // Then
        assertThat(testUser.getEnabled()).isFalse();
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenDisablingNonExistentUser() {
        // Given
        when(userRepository.findByUsername("testuser")).thenReturn(java.util.Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.disableUser("testuser"))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Usuario no encontrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldUpdateProfileSuccessfully() {
        // Given
        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setFirstName("Updated");
        updateRequest.setLastName("Name");
        updateRequest.setPhoneNumber("9876543210");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));
        when(userRepository.save(any(User.class))).thenReturn(testUser);

        // When
        User updatedUser = authenticationService.updateProfile(1L, updateRequest);

        // Then
        assertThat(updatedUser.getFirstName()).isEqualTo("Updated");
        assertThat(updatedUser.getLastName()).isEqualTo("Name");
        assertThat(updatedUser.getPhoneNumber()).isEqualTo("9876543210");
        verify(userRepository).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingProfileWithDuplicateEmail() {
        // Given
        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setEmail("newemail@example.com");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));
        when(userRepository.existsByEmail("newemail@example.com")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> authenticationService.updateProfile(1L, updateRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("El correo electrónico ya está en uso");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentUser() {
        // Given
        UpdateProfileRequest updateRequest = new UpdateProfileRequest();
        updateRequest.setFirstName("Updated");

        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.updateProfile(1L, updateRequest))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Usuario no encontrado");
        verify(userRepository, never()).save(any(User.class));
    }

    @Test
    void shouldGetUserProfileSuccessfully() {
        // Given
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.of(testUser));

        // When
        User user = authenticationService.getUserProfile(1L);

        // Then
        assertThat(user).isNotNull();
        assertThat(user.getUsername()).isEqualTo("testuser");
        assertThat(user.getEmail()).isEqualTo("test@example.com");
        verify(userRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentUserProfile() {
        // Given
        when(userRepository.findById(1L)).thenReturn(java.util.Optional.empty());

        // When & Then
        assertThatThrownBy(() -> authenticationService.getUserProfile(1L))
            .isInstanceOf(IllegalArgumentException.class)
            .hasMessageContaining("Usuario no encontrado");
    }
}
