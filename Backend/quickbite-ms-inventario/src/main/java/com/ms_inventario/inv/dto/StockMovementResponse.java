package com.ms_inventario.inv.dto;

import com.ms_inventario.inv.entity.MovementType;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class StockMovementResponse {
    private Long id;
    private Long ingredientId;
    private String ingredientName;
    private MovementType movementType;
    private Integer quantity;
    private Integer previousStock;
    private Integer newStock;
    private String reason;
    private String orderId;
    private LocalDateTime createdAt;
    private String createdBy;
    
    public static StockMovementResponse fromEntity(com.ms_inventario.inv.entity.StockMovement movement) {
        StockMovementResponse response = new StockMovementResponse();
        response.setId(movement.getId());
        response.setIngredientId(movement.getIngredient().getId());
        response.setIngredientName(movement.getIngredient().getName());
        response.setMovementType(movement.getMovementType());
        response.setQuantity(movement.getQuantity());
        response.setPreviousStock(movement.getPreviousStock());
        response.setNewStock(movement.getNewStock());
        response.setReason(movement.getReason());
        response.setOrderId(movement.getOrderId());
        response.setCreatedAt(movement.getCreatedAt());
        response.setCreatedBy(movement.getCreatedBy());
        return response;
    }
}
