CREATE TABLE stock_movements (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    ingredient_id BIGINT NOT NULL,
    movement_type ENUM('INITIAL', 'PURCHASE', 'ORDER_DEDUCTION', 'ADJUSTMENT', 'WASTE', 'RETURN') NOT NULL,
    quantity INT NOT NULL,
    previous_stock INT NOT NULL,
    new_stock INT NOT NULL,
    reason VARCHAR(500),
    order_id VARCHAR(100),
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    created_by VARCHAR(100) NOT NULL,
    
    FOREIGN KEY (ingredient_id) REFERENCES ingredients(id) ON DELETE CASCADE,
    INDEX idx_movements_ingredient (ingredient_id),
    INDEX idx_movements_date (created_at),
    INDEX idx_movements_type (movement_type)
);
