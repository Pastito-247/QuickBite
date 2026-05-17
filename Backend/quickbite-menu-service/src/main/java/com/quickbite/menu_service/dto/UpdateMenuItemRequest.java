package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdateMenuItemRequest {
    
    @NotBlank(message = "El nombre del plato es requerido")
    private String name;

    private String description;

    @Positive(message = "El precio debe ser mayor a 0")
    private Double price;

    @NotBlank(message = "La categoría es obligatoria")
    private String category;

    private Boolean available;
}
