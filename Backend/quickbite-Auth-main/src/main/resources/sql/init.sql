-- Script de inicialización de base de datos para el Servicio de Autenticación Quick Bite
-- Este script crea las tablas necesarias y datos iniciales

-- Crear tabla de usuarios
CREATE TABLE IF NOT EXISTS users (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone_number VARCHAR(20),
    role ENUM('CLIENT', 'KITCHEN', 'ADMIN', 'DELIVERY') NOT NULL DEFAULT 'CLIENT',
    enabled BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    account_non_locked BOOLEAN NOT NULL DEFAULT TRUE,
    credentials_non_expired BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
);

-- Crear tabla de permisos de usuario
CREATE TABLE IF NOT EXISTS user_permissions (
    user_id BIGINT NOT NULL,
    permission VARCHAR(100) NOT NULL,
    PRIMARY KEY (user_id, permission),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Insertar usuario administrador por defecto (contraseña: admin123)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES ('admin', 'admin@quickbite.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Sistema', 'Administrador', 'ADMIN')
ON DUPLICATE KEY UPDATE username = username;

-- Insertar usuario de cocina por defecto (contraseña: kitchen123)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES ('kitchen', 'kitchen@quickbite.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Cocina', 'Personal', 'KITCHEN')
ON DUPLICATE KEY UPDATE username = username;

-- Insertar usuario de reparto por defecto (contraseña: delivery123)
INSERT INTO users (username, email, password, first_name, last_name, role) 
VALUES ('delivery', 'delivery@quickbite.com', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'Reparto', 'Personal', 'DELIVERY')
ON DUPLICATE KEY UPDATE username = username;
