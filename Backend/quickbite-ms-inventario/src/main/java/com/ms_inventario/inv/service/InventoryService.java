package com.ms_inventario.inv.service;

import com.ms_inventario.inv.dto.StockDeductionRequest;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.StockMovement;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface InventoryService {
    
    Ingredient createIngredient(com.ms_inventario.inv.dto.InventoryRequest request);
    
    Ingredient updateIngredient(Long id, com.ms_inventario.inv.dto.InventoryRequest request);
    
    Optional<Ingredient> getIngredient(Long id);
    
    List<Ingredient> getAllActiveIngredients();

    List<Ingredient> getIngredientsByIds(List<Long> ids);

    Page<Ingredient> getAllActiveIngredientsPaginated(Pageable pageable);
    
    void deleteIngredient(Long id);
    
    void deductStock(StockDeductionRequest request);
    
    void addStock(Long ingredientId, Integer quantity, String reason, String createdBy);
    
    List<Ingredient> getCriticalStockIngredients();
    
    Page<Ingredient> getCriticalStockIngredientsPaginated(Pageable pageable);
    
    List<Ingredient> getOutOfStockIngredients();
    
    Page<Ingredient> getOutOfStockIngredientsPaginated(Pageable pageable);
    
    List<StockMovement> getStockMovements(Long ingredientId);
    
    Page<StockMovement> getStockMovementsPaginated(Long ingredientId, Pageable pageable);
    
    boolean checkIngredientAvailability(Long ingredientId, Integer requiredQuantity);
    
    Map<Long, Boolean> checkMultipleIngredientsAvailability(Map<Long, Integer> ingredientQuantities);
    
    void adjustStock(Long ingredientId, Integer newStock, String reason, String createdBy);
}
