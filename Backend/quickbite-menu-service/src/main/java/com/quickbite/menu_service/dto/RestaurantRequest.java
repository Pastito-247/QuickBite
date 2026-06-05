package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RestaurantRequest {
    
    @NotBlank(message = "El nombre del restaurante es requerido")
    private String name;
    
    @NotBlank(message = "La dirección es requerida")
    private String address;
    
    @NotBlank(message = "El teléfono es requerido")
    private String phone;
    
    @NotNull(message = "El ID del dueño es requerido")
    private Long ownerId;

    private Boolean active;

    private String imageUrl;
}
