package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

@Data
public class UpdatePriceRequest {
    
    @NotNull(message = "El nuevo precio es requerido")
    @Positive(message = "El precio debe ser mayor a 0")
    private Double newPrice;
}
