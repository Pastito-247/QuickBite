-- QuickBite Database Setup
-- Crear bases de datos para cada microservicio

-- Base de datos para Autenticación
-- Las tablas de usuarios las crea Hibernate (ddl-auto=update)
-- Los usuarios predeterminados los crea DataInitializer.java del Auth Service al arrancar:
--   admin    / admin123    -> ADMIN
--   kitchen  / kitchen123  -> KITCHEN
--   customer / customer123 -> CLIENT
CREATE DATABASE IF NOT EXISTS quickbite_auth CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Base de datos para Inventario
-- Tablas y datos iniciales los crea el microservicio via Hibernate + DataInitializer (idempotente)
CREATE DATABASE IF NOT EXISTS quickbite_inventory CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Base de datos para Menu
-- Tablas y datos iniciales los crea MenuDataInitializer.java (idempotente, solo si la tabla esta vacia)
CREATE DATABASE IF NOT EXISTS quickbite_menu CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Base de datos para Pedidos
CREATE DATABASE IF NOT EXISTS quickbite_orders CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbite_orders;

CREATE TABLE IF NOT EXISTS orders (
    id VARCHAR(20) PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    total DECIMAL(10,2) NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'READY', 'DELIVERED', 'CANCELLED') NOT NULL DEFAULT 'PENDING',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estimated_time INT,
    tracking_number VARCHAR(20)
);

CREATE TABLE IF NOT EXISTS order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    price DECIMAL(10,2) NOT NULL,
    FOREIGN KEY (order_id) REFERENCES orders(id) ON DELETE CASCADE
);

-- Insertar datos de prueba
INSERT INTO orders (id, user_email, total, status, estimated_time, tracking_number) VALUES
('ORD-001', 'customer@quickbite.com', 21970.00, 'PREPARING', 20, 'TRK-123456'),
('ORD-002', 'customer@quickbite.com', 12990.00, 'READY', 5, 'TRK-123457');

INSERT INTO order_items (order_id, item_name, quantity, price) VALUES
('ORD-001', 'Hamburguesa Clasica', 2, 8990.00),
('ORD-001', 'Papas Fritas Grandes', 1, 3990.00),
('ORD-002', 'Combo Big Bite', 1, 12990.00);

-- Base de datos para Pagos
CREATE DATABASE IF NOT EXISTS quickbite_payments CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbite_payments;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    amount DECIMAL(10,2) NOT NULL,
    payment_method ENUM('CREDIT_CARD', 'DEBIT_CARD', 'CASH', 'TRANSFER') NOT NULL,
    status ENUM('PENDING', 'COMPLETED', 'FAILED', 'REFUNDED') NOT NULL DEFAULT 'PENDING',
    transaction_id VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Base de datos para Cocina
CREATE DATABASE IF NOT EXISTS quickbite_kitchen CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbite_kitchen;

CREATE TABLE IF NOT EXISTS kitchen_orders (
    id VARCHAR(20) PRIMARY KEY,
    customer_name VARCHAR(100) NOT NULL,
    status ENUM('PENDING', 'PREPARING', 'READY', 'DELIVERED') NOT NULL DEFAULT 'PENDING',
    priority ENUM('LOW', 'NORMAL', 'HIGH', 'URGENT') NOT NULL DEFAULT 'NORMAL',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    estimated_time INT,
    table_number VARCHAR(10),
    started_at TIMESTAMP NULL,
    completed_at TIMESTAMP NULL
);

CREATE TABLE IF NOT EXISTS kitchen_order_items (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    order_id VARCHAR(20) NOT NULL,
    item_name VARCHAR(100) NOT NULL,
    quantity INT NOT NULL,
    notes TEXT,
    FOREIGN KEY (order_id) REFERENCES kitchen_orders(id) ON DELETE CASCADE
);

-- Insertar datos de prueba
INSERT INTO kitchen_orders (id, customer_name, status, priority, estimated_time, table_number) VALUES
('ORD-001', 'Juan Pérez', 'PENDING', 'NORMAL', 20, 'T-05'),
('ORD-002', 'María González', 'PREPARING', 'HIGH', 10, 'T-03');

INSERT INTO kitchen_order_items (order_id, item_name, quantity, notes) VALUES
('ORD-001', 'Hamburguesa Clásica', 2, 'Sin cebolla'),
('ORD-001', 'Papas Fritas Grandes', 1, ''),
('ORD-002', 'Combo Big Bite', 1, 'Extra queso');

-- Base de datos para Notificaciones
CREATE DATABASE IF NOT EXISTS quickbite_notifications CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE quickbite_notifications;

CREATE TABLE IF NOT EXISTS notifications (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_email VARCHAR(100) NOT NULL,
    title VARCHAR(100) NOT NULL,
    message TEXT NOT NULL,
    type ENUM('INFO', 'SUCCESS', 'WARNING', 'ERROR') NOT NULL DEFAULT 'INFO',
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Insertar datos de prueba
INSERT INTO notifications (user_email, title, message, type) VALUES
('customer@quickbite.com', 'Pedido Confirmado', 'Tu pedido ORD-001 ha sido confirmado', 'SUCCESS'),
('kitchen@quickbite.com', 'Nuevo Pedido', 'Nuevo pedido ORD-001 listo para preparar', 'INFO');

-- Mostrar resumen
SELECT 'Database setup completed successfully!' as message;
SELECT COUNT(*) as auth_users FROM quickbite_auth.users;
SELECT COUNT(*) as inventory_items FROM quickbite_inventory.inventory_items;
SELECT COUNT(*) as menu_items FROM quickbite_menu.menu_items;
SELECT COUNT(*) as orders FROM quickbite_orders.orders;
SELECT COUNT(*) as kitchen_orders FROM quickbite_kitchen.kitchen_orders;
SELECT COUNT(*) as notifications FROM quickbite_notifications.notifications;
