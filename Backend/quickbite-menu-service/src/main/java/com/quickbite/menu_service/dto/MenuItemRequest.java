package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;


@Data
public class MenuItemRequest {
    @NotBlank(message = "el nombre del plato es requerido")
    private String name;

    private String description;

    @NotNull(message = "el precio del plato es requerido")
    @Positive(message = "el precio del plato debe ser mayor a 0")
    private Double price;

    @NotBlank(message = "La categoria es obligatoria")
    private String category;
}
