package com.ms_inventario.inv.dto;

import com.ms_inventario.inv.entity.UnitType;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class InventoryRequest {
    
    @NotBlank(message = "Name is required")
    @Size(max = 100, message = "Name must not exceed 100 characters")
    private String name;
    
    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;
    
    @NotNull(message = "Unit cost is required")
    @DecimalMin(value = "0.0", inclusive = false, message = "Unit cost must be greater than 0")
    @Digits(integer = 8, fraction = 2, message = "Unit cost must have maximum 8 integer digits and 2 decimal digits")
    private BigDecimal unitCost;
    
    @NotNull(message = "Unit type is required")
    private UnitType unitType;
    
    @NotNull(message = "Current stock is required")
    @Min(value = 0, message = "Current stock cannot be negative")
    private Integer currentStock;
    
    @NotNull(message = "Minimum stock is required")
    @Min(value = 0, message = "Minimum stock cannot be negative")
    private Integer minimumStock;
    
    @NotNull(message = "Maximum stock is required")
    @Min(value = 1, message = "Maximum stock must be at least 1")
    private Integer maximumStock;
}
