package com.quickbite.menu_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class IngredientDetail {
    private Long id;
    private String name;
    private String unit;
    private Double currentStock;
    private Double minThreshold;
}
