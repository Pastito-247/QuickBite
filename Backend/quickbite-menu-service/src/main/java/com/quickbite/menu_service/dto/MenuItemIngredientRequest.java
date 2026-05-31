package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MenuItemIngredientRequest {

    @NotNull(message = "El ID del ingrediente es requerido")
    private Long ingredientId;

    @NotNull(message = "La cantidad es requerida")
    @Positive(message = "La cantidad debe ser mayor a 0")
    private Integer quantity;

    @NotNull(message = "La unidad es requerida")
    private String unit;

    private Boolean isOptional;
}
