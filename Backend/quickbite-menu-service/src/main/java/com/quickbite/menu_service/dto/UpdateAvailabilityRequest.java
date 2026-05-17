package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class UpdateAvailabilityRequest {
    
    @NotNull(message = "El estado de disponibilidad es requerido")
    private Boolean available;
}
