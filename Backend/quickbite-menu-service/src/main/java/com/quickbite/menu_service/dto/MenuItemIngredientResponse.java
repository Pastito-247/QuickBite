package com.quickbite.menu_service.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemIngredientResponse {

    private Long id;
    private Long menuItemId;
    private Long ingredientId;
    private String ingredientName;
    private Integer quantity;
    private String unit;
    private Boolean isOptional;
}
