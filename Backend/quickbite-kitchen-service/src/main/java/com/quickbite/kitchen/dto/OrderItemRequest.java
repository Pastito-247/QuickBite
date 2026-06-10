package com.quickbite.kitchen.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class OrderItemRequest {
    
    @NotNull(message = "El ID del menu item es requerido")
    private Long menuItemId;
    
    private String itemName;
    
    @NotNull(message = "La cantidad es requerida")
    private Integer quantity;
}
