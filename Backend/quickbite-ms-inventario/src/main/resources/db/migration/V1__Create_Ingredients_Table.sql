CREATE TABLE ingredients (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(500),
    unit_cost DECIMAL(10,2) NOT NULL,
    unit_type ENUM('GRAMS', 'KILOGRAMS', 'LITERS', 'MILLILITERS', 'UNITS', 'DOZENS') NOT NULL,
    current_stock INT NOT NULL DEFAULT 0,
    minimum_stock INT NOT NULL DEFAULT 0,
    maximum_stock INT NOT NULL DEFAULT 0,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    
    INDEX idx_ingredients_name (name),
    INDEX idx_ingredients_active (is_active),
    INDEX idx_ingredients_stock_level (current_stock, minimum_stock)
);
