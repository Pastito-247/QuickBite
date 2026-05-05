package com.quickbite.Autenticacion.service;

import com.quickbite.Autenticacion.dto.AuthenticationRequest;
import com.quickbite.Autenticacion.dto.AuthenticationResponse;
import com.quickbite.Autenticacion.dto.RegisterRequest;
import com.quickbite.Autenticacion.entity.User;
import com.quickbite.Autenticacion.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

/**
 * Servicio de Autenticación para el microservicio IAM
 * Maneja el registro, login, y gestión de tokens JWT para usuarios del sistema Quick Bite
 */
@Service
@RequiredArgsConstructor
public class AuthenticationService {
    
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuthenticationManager authenticationManager;
    
    /**
     * Registra un nuevo usuario en el sistema
     * @param request Datos de registro del usuario
     * @return Respuesta de autenticación con tokens JWT
     * @throws IllegalArgumentException si el username o email ya existen
     */
    @Transactional
    public AuthenticationResponse register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalArgumentException("El nombre de usuario ya existe");
        }
        
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("El correo electrónico ya está registrado");
        }
        
        User user = User.builder()
                .username(request.getUsername())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .permissions(new HashSet<>())
                .enabled(true)
                .accountNonExpired(true)
                .accountNonLocked(true)
                .credentialsNonExpired(true)
                .build();
        
        User savedUser = userRepository.save(user);
        
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .userId(savedUser.getId())
                .username(savedUser.getUsername())
                .email(savedUser.getEmail())
                .role(savedUser.getRole().name())
                .build();
    }
    
    /**
     * Autentica un usuario y genera tokens JWT
     * @param request Credenciales de autenticación
     * @return Respuesta de autenticación con tokens JWT
     * @throws IllegalArgumentException si las credenciales son inválidas o el usuario está deshabilitado
     */
    public AuthenticationResponse authenticate(AuthenticationRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getUsername(),
                        request.getPassword()
                )
        );
        
        User user = userRepository.findByUsernameOrEmail(request.getUsername())
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        
        if (!user.getEnabled()) {
            throw new IllegalArgumentException("La cuenta de usuario está deshabilitada");
        }
        
        var jwtToken = jwtService.generateToken(user);
        var refreshToken = jwtService.generateRefreshToken(user);
        
        return AuthenticationResponse.builder()
                .accessToken(jwtToken)
                .refreshToken(refreshToken)
                .userId(user.getId())
                .username(user.getUsername())
                .email(user.getEmail())
                .role(user.getRole().name())
                .build();
    }
    
    /**
     * Refresca un token JWT usando un refresh token válido
     * @param refreshToken Token de refresco válido
     * @return Nueva respuesta de autenticación con tokens actualizados
     * @throws IllegalArgumentException si el refresh token es inválido
     */
    public AuthenticationResponse refreshToken(String refreshToken) {
        String username = jwtService.extractUsername(refreshToken);
        
        if (username != null) {
            User user = userRepository.findByUsernameOrEmail(username)
                    .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
            
            if (jwtService.isTokenValid(refreshToken, user)) {
                var newToken = jwtService.generateToken(user);
                var newRefreshToken = jwtService.generateRefreshToken(user);
                
                return AuthenticationResponse.builder()
                        .accessToken(newToken)
                        .refreshToken(newRefreshToken)
                        .userId(user.getId())
                        .username(user.getUsername())
                        .email(user.getEmail())
                        .role(user.getRole().name())
                        .build();
            }
        }
        
        throw new IllegalArgumentException("Token de refresco inválido");
    }
    
    /**
     * Habilita una cuenta de usuario
     * @param username Nombre de usuario a habilitar
     * @throws IllegalArgumentException si el usuario no existe
     */
    @Transactional
    public void enableUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setEnabled(true);
        userRepository.save(user);
    }
    
    /**
     * Deshabilita una cuenta de usuario
     * @param username Nombre de usuario a deshabilitar
     * @throws IllegalArgumentException si el usuario no existe
     */
    @Transactional
    public void disableUser(String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new IllegalArgumentException("Usuario no encontrado"));
        user.setEnabled(false);
        userRepository.save(user);
    }
}
