package com.ms_inventario.inv.dto;

import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.UnitType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryResponse {
    private Long id;
    private String name;
    private String description;
    private BigDecimal unitCost;
    private UnitType unitType;
    private Integer currentStock;
    private Integer minimumStock;
    private Integer maximumStock;
    private Boolean isActive;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    public static InventoryResponse fromEntity(Ingredient ingredient) {
        InventoryResponse response = new InventoryResponse();
        response.setId(ingredient.getId());
        response.setName(ingredient.getName());
        response.setDescription(ingredient.getDescription());
        response.setUnitCost(ingredient.getUnitCost());
        response.setUnitType(ingredient.getUnitType());
        response.setCurrentStock(ingredient.getCurrentStock());
        response.setMinimumStock(ingredient.getMinimumStock());
        response.setMaximumStock(ingredient.getMaximumStock());
        response.setIsActive(ingredient.getIsActive());
        response.setCreatedAt(ingredient.getCreatedAt());
        response.setUpdatedAt(ingredient.getUpdatedAt());
        return response;
    }
}
