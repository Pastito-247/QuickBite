package com.ms_inventario.inv.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockAlertDTO {
    private Long ingredientId;
    private String ingredientName;
    private Integer currentStock;
    private Integer minimumStock;
    private AlertType alertType;
    private LocalDateTime createdAt;
    
    public enum AlertType {
        CRITICAL_STOCK,
        OUT_OF_STOCK,
        LOW_STOCK
    }
}
