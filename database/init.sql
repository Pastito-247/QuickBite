-- Script de inicialización de base de datos para QuickBite
-- Este script crea todas las bases de datos necesarias para los microservicios

-- Crear bases de datos
CREATE DATABASE IF NOT EXISTS auth_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS inventario_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS menu_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS pedidos_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS kitchen_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS notificaciones_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE DATABASE IF NOT EXISTS payment_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Crear usuario de base de datos para aplicaciones
CREATE USER IF NOT EXISTS 'quickbite_app'@'%' IDENTIFIED BY 'quickbite_password';
GRANT ALL PRIVILEGES ON auth_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON inventario_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON menu_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON pedidos_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON kitchen_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON notificaciones_db.* TO 'quickbite_app'@'%';
GRANT ALL PRIVILEGES ON payment_db.* TO 'quickbite_app'@'%';
FLUSH PRIVILEGES;

-- ============================================
-- BASE DE DATOS DE AUTENTICACIÓN (auth_db)
-- ============================================
USE auth_db;

-- Tabla de usuarios
CREATE TABLE IF NOT EXISTS usuarios (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    email VARCHAR(100) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    first_name VARCHAR(50),
    last_name VARCHAR(50),
    phone VARCHAR(20),
    address TEXT,
    role VARCHAR(20) NOT NULL DEFAULT 'CLIENT',
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_username (username),
    INDEX idx_email (email),
    INDEX idx_role (role)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de usuarios (contraseñas en formato BCrypt)
INSERT INTO usuarios (username, email, password, first_name, last_name, role) VALUES
('admin', 'admin@quickbite.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Admin', 'User', 'ADMIN'),
('kitchen', 'kitchen@quickbite.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Kitchen', 'User', 'KITCHEN'),
('delivery', 'delivery@quickbite.com', '$2a$10$N.zmdr9k7uOCQb376NoUnuTJ8iAt6Z5EHsM8lE9lBOsl7iKTVKIUi', 'Delivery', 'User', 'DELIVERY');

-- ============================================
-- BASE DE DATOS DE INVENTARIO (inventario_db)
-- ============================================
USE inventario_db;

-- Tabla de productos
CREATE TABLE IF NOT EXISTS productos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    categoria VARCHAR(50),
    precio_unitario DECIMAL(10, 2) NOT NULL,
    stock_actual INT DEFAULT 0,
    stock_minimo INT DEFAULT 10,
    unidad_medida VARCHAR(20) DEFAULT 'unidad',
    restaurante_id BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_categoria (categoria),
    INDEX idx_restaurante_id (restaurante_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BASE DE DATOS DE MENÚ (menu_db)
-- ============================================
USE menu_db;

-- Tabla de restaurantes
CREATE TABLE IF NOT EXISTS restaurantes (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    direccion TEXT,
    telefono VARCHAR(20),
    email VARCHAR(100),
    horario_apertura VARCHAR(50),
    horario_cierre VARCHAR(50),
    tipo_comida VARCHAR(50),
    calificacion DECIMAL(3, 2) DEFAULT 0.00,
    tiempo_entrega_estimado INT,
    costo_envio DECIMAL(10, 2),
    imagen_url VARCHAR(255),
    activo BOOLEAN DEFAULT TRUE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_tipo_comida (tipo_comida),
    INDEX idx_activo (activo)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de platos
CREATE TABLE IF NOT EXISTS platos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    restaurante_id BIGINT NOT NULL,
    nombre VARCHAR(100) NOT NULL,
    descripcion TEXT,
    precio DECIMAL(10, 2) NOT NULL,
    categoria VARCHAR(50),
    imagen_url VARCHAR(255),
    disponible BOOLEAN DEFAULT TRUE,
    tiempo_preparacion INT,
    ingredientes TEXT,
    alergenos TEXT,
    calorias INT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (restaurante_id) REFERENCES restaurantes(id) ON DELETE CASCADE,
    INDEX idx_restaurante_id (restaurante_id),
    INDEX idx_categoria (categoria),
    INDEX idx_disponible (disponible)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Datos iniciales de restaurantes
INSERT INTO restaurantes (nombre, descripcion, tipo_comida, calificacion, tiempo_entrega_estimado, costo_envio) VALUES
('Burger Queen', 'Hamburguesas artesanales', 'Hamburguesas', 4.8, 20, 1.50),
('Pizza Hub', 'Pizzas italianas', 'Pizzas', 4.6, 30, 2.00),
('Taco Fiesta', 'Comida mexicana auténtica', 'Mexicana', 4.7, 15, 1.00),
('Sushi Zen', 'Sushi japonés', 'Sushi', 4.9, 40, 2.50),
('Green Bowl', 'Comida saludable', 'Saludable', 4.5, 20, 1.00);

-- ============================================
-- BASE DE DATOS DE PEDIDOS (pedidos_db)
-- ============================================
USE pedidos_db;

-- Tabla de pedidos
CREATE TABLE IF NOT EXISTS pedidos (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    restaurante_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    total DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    costo_envio DECIMAL(10, 2) NOT NULL,
    direccion_entrega TEXT NOT NULL,
    notas TEXT,
    metodo_pago VARCHAR(20),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_restaurante_id (restaurante_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Tabla de items de pedido
CREATE TABLE IF NOT EXISTS pedido_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL,
    plato_id BIGINT NOT NULL,
    nombre_plato VARCHAR(100) NOT NULL,
    cantidad INT NOT NULL,
    precio_unitario DECIMAL(10, 2) NOT NULL,
    subtotal DECIMAL(10, 2) NOT NULL,
    notas TEXT,
    FOREIGN KEY (pedido_id) REFERENCES pedidos(id) ON DELETE CASCADE,
    INDEX idx_pedido_id (pedido_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BASE DE DATOS DE COCINA (kitchen_db)
-- ============================================
USE kitchen_db;

-- Tabla de órdenes de cocina
CREATE TABLE IF NOT EXISTS ordenes_cocina (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL UNIQUE,
    restaurante_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'RECIBIDO',
    prioridad INT DEFAULT 0,
    tiempo_estimado INT,
    tiempo_inicio TIMESTAMP NULL,
    tiempo_fin TIMESTAMP NULL,
    notas TEXT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_restaurante_id (restaurante_id),
    INDEX idx_estado (estado),
    INDEX idx_prioridad (prioridad),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BASE DE DATOS DE NOTIFICACIONES (notificaciones_db)
-- ============================================
USE notificaciones_db;

-- Tabla de notificaciones
CREATE TABLE IF NOT EXISTS notificaciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    usuario_id BIGINT NOT NULL,
    tipo VARCHAR(50) NOT NULL,
    mensaje TEXT NOT NULL,
    leida BOOLEAN DEFAULT FALSE,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_lectura TIMESTAMP NULL,
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_tipo (tipo),
    INDEX idx_leida (leida),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ============================================
-- BASE DE DATOS DE PAGOS (payment_db)
-- ============================================
USE payment_db;

-- Tabla de transacciones
CREATE TABLE IF NOT EXISTS transacciones (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    pedido_id BIGINT NOT NULL UNIQUE,
    usuario_id BIGINT NOT NULL,
    monto DECIMAL(10, 2) NOT NULL,
    metodo_pago VARCHAR(20) NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    referencia_transaccion VARCHAR(100),
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_pedido_id (pedido_id),
    INDEX idx_usuario_id (usuario_id),
    INDEX idx_estado (estado),
    INDEX idx_fecha_creacion (fecha_creacion)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Mostrar resumen
SELECT 'Base de datos inicializada exitosamente' AS mensaje;
SELECT COUNT(*) AS total_bases_de_datos FROM information_schema.schemata WHERE schema_name LIKE '%_db';
