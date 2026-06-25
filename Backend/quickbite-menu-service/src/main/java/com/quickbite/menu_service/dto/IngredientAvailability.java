package com.quickbite.menu_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientAvailability {
    
    private Long ingredientId;
    private String ingredientName;
    private boolean available;
    private Double currentStock;
    private Double minThreshold;
    private String unit;
    
    public boolean isBelowThreshold() {
        return currentStock <= minThreshold;
    }
}
