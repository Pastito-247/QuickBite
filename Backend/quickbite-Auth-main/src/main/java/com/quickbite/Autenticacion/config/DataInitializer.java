package com.quickbite.Autenticacion.config;

import com.quickbite.Autenticacion.entity.User;
import com.quickbite.Autenticacion.repository.UserRepository;
import jakarta.persistence.EntityManager;
import jakarta.persistence.PersistenceContext;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.util.HashSet;

/**
 * Inicializa usuarios de prueba del sistema QuickBite al arrancar.
 * Si los usuarios ya existen, actualiza su contraseña para garantizar las credenciales conocidas.
 *
 * Credenciales:
 *   admin    / admin123    -> ADMIN
 *   kitchen  / kitchen123  -> KITCHEN
 *   customer / customer123 -> CLIENT
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PersistenceContext
    private EntityManager entityManager;

    @Override
    @Transactional
    public void run(String... args) {
        // Limpia filas con roles invalidos heredadas de un esquema anterior (p.ej. 'CUSTOMER')
        try {
            int cleaned = entityManager.createNativeQuery(
                    "DELETE FROM users WHERE role NOT IN ('CLIENT','KITCHEN','ADMIN','DELIVERY')"
            ).executeUpdate();
            if (cleaned > 0) {
                log.warn("Eliminadas {} filas de users con roles invalidos", cleaned);
            }
        } catch (Exception e) {
            log.debug("No se pudo limpiar tabla users (probablemente no existe aun): {}", e.getMessage());
        }

        upsertUser("admin",    "admin@quickbite.com",    "admin123",    "Admin",    "User",  User.Role.ADMIN);
        upsertUser("kitchen",  "kitchen@quickbite.com",  "kitchen123",  "Kitchen",  "Staff", User.Role.KITCHEN);
        upsertUser("customer", "customer@quickbite.com", "customer123", "Customer", "User",  User.Role.CLIENT);
        log.info("Usuarios de prueba inicializados correctamente");
    }

    private void upsertUser(String username, String email, String rawPassword,
                            String firstName, String lastName, User.Role role) {
        userRepository.findByUsername(username).ifPresentOrElse(
                existing -> {
                    existing.setPassword(passwordEncoder.encode(rawPassword));
                    existing.setEmail(email);
                    existing.setRole(role);
                    existing.setEnabled(true);
                    userRepository.save(existing);
                    log.info("Usuario '{}' actualizado con contrasena predeterminada", username);
                },
                () -> {
                    User user = User.builder()
                            .username(username)
                            .email(email)
                            .password(passwordEncoder.encode(rawPassword))
                            .firstName(firstName)
                            .lastName(lastName)
                            .role(role)
                            .permissions(new HashSet<>())
                            .enabled(true)
                            .accountNonExpired(true)
                            .accountNonLocked(true)
                            .credentialsNonExpired(true)
                            .build();
                    userRepository.save(user);
                    log.info("Usuario '{}' creado", username);
                }
        );
    }
}
