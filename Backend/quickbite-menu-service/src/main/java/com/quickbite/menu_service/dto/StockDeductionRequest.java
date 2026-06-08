package com.quickbite.menu_service.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockDeductionRequest {
    
    @NotEmpty(message = "Items list cannot be empty")
    private List<StockDeductionItem> items;
    
    @NotBlank(message = "Order ID is required")
    private String orderId;
    
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class StockDeductionItem {
        @NotNull(message = "Ingredient ID is required")
        private Long ingredientId;
        
        @NotNull(message = "Quantity is required")
        @Min(value = 1, message = "Quantity must be at least 1")
        private Integer quantity;
    }
}
