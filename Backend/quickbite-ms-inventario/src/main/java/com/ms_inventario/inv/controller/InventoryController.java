package com.ms_inventario.inv.controller;

import com.ms_inventario.inv.dto.*;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.StockMovement;
import com.ms_inventario.inv.service.InventoryService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.validation.annotation.Validated;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/inventory")
@Validated
@Slf4j
@Tag(name = "Inventory", description = "Inventory management API for managing ingredients and stock levels")
public class InventoryController {
    
    private final InventoryService inventoryService;
    
    public InventoryController(InventoryService inventoryService) {
        this.inventoryService = inventoryService;
    }
    
    @PostMapping
    public ResponseEntity<InventoryResponse> createIngredient(@Valid @RequestBody InventoryRequest request) {
        log.info("Creating new ingredient: {}", request.getName());
        Ingredient ingredient = inventoryService.createIngredient(request);
        return ResponseEntity.status(HttpStatus.CREATED)
            .body(InventoryResponse.fromEntity(ingredient));
    }
    
    @PutMapping("/{id}")
    public ResponseEntity<InventoryResponse> updateIngredient(
            @PathVariable Long id, 
            @Valid @RequestBody InventoryRequest request) {
        log.info("Updating ingredient with ID: {}", id);
        Ingredient ingredient = inventoryService.updateIngredient(id, request);
        return ResponseEntity.ok(InventoryResponse.fromEntity(ingredient));
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<InventoryResponse> getIngredient(@PathVariable Long id) {
        log.info("Getting ingredient with ID: {}", id);
        return inventoryService.getIngredient(id)
            .map(ingredient -> ResponseEntity.ok(InventoryResponse.fromEntity(ingredient)))
            .orElse(ResponseEntity.notFound().build());
    }
    
    @GetMapping
    @Operation(summary = "Get all active ingredients", description = "Retrieve a list of all active ingredients")
    public ResponseEntity<List<InventoryResponse>> getAllActiveIngredients() {
        log.info("Getting all active ingredients");
        List<Ingredient> ingredients = inventoryService.getAllActiveIngredients();
        List<InventoryResponse> responses = ingredients.stream()
            .map(InventoryResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }

    @PostMapping("/details")
    @Operation(summary = "Get ingredients by IDs", description = "Retrieve ingredient details by their IDs")
    public ResponseEntity<List<InventoryResponse>> getIngredientsByIds(@RequestBody List<Long> ids) {
        log.info("Getting ingredients by IDs: {}", ids);
        List<Ingredient> ingredients = inventoryService.getIngredientsByIds(ids);
        List<InventoryResponse> responses = ingredients.stream()
            .map(InventoryResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/paginated")
    @Operation(summary = "Get all active ingredients (paginated)", description = "Retrieve a paginated list of all active ingredients")
    public ResponseEntity<Page<InventoryResponse>> getAllActiveIngredientsPaginated(
            @Parameter(description = "Pagination parameters") Pageable pageable) {
        log.info("Getting paginated active ingredients");
        Page<Ingredient> ingredients = inventoryService.getAllActiveIngredientsPaginated(pageable);
        Page<InventoryResponse> responses = ingredients.map(InventoryResponse::fromEntity);
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/deduct-stock")
    public ResponseEntity<Void> deductStock(@Valid @RequestBody StockDeductionRequest request) {
        log.info("Deducting stock for order: {}", request.getOrderId());
        inventoryService.deductStock(request);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/check-availability")
    public ResponseEntity<Map<Long, Boolean>> checkIngredientsAvailability(
            @RequestBody Map<Long, Integer> ingredientQuantities) {
        log.info("Checking availability for {} ingredients", ingredientQuantities.size());
        Map<Long, Boolean> availability = inventoryService.checkMultipleIngredientsAvailability(ingredientQuantities);
        return ResponseEntity.ok(availability);
    }
    
    @PostMapping("/check")
    public ResponseEntity<Map<Long, Boolean>> checkIngredients(
            @RequestBody Map<Long, Integer> ingredientQuantities) {
        log.info("Checking availability for {} ingredients", ingredientQuantities.size());
        Map<Long, Boolean> availability = inventoryService.checkMultipleIngredientsAvailability(ingredientQuantities);
        return ResponseEntity.ok(availability);
    }
    
    @GetMapping("/critical-stock")
    @Operation(summary = "Get critical stock ingredients", description = "Retrieve ingredients with stock levels at or below minimum threshold")
    public ResponseEntity<List<InventoryResponse>> getCriticalStockIngredients() {
        log.info("Getting critical stock ingredients");
        List<Ingredient> ingredients = inventoryService.getCriticalStockIngredients();
        List<InventoryResponse> responses = ingredients.stream()
            .map(InventoryResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/critical-stock/paginated")
    @Operation(summary = "Get critical stock ingredients (paginated)", description = "Retrieve paginated list of ingredients with critical stock levels")
    public ResponseEntity<Page<InventoryResponse>> getCriticalStockIngredientsPaginated(
            @Parameter(description = "Pagination parameters") Pageable pageable) {
        log.info("Getting paginated critical stock ingredients");
        Page<Ingredient> ingredients = inventoryService.getCriticalStockIngredientsPaginated(pageable);
        Page<InventoryResponse> responses = ingredients.map(InventoryResponse::fromEntity);
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/out-of-stock")
    @Operation(summary = "Get out of stock ingredients", description = "Retrieve ingredients with zero stock")
    public ResponseEntity<List<InventoryResponse>> getOutOfStockIngredients() {
        log.info("Getting out of stock ingredients");
        List<Ingredient> ingredients = inventoryService.getOutOfStockIngredients();
        List<InventoryResponse> responses = ingredients.stream()
            .map(InventoryResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/out-of-stock/paginated")
    @Operation(summary = "Get out of stock ingredients (paginated)", description = "Retrieve paginated list of out of stock ingredients")
    public ResponseEntity<Page<InventoryResponse>> getOutOfStockIngredientsPaginated(
            @Parameter(description = "Pagination parameters") Pageable pageable) {
        log.info("Getting paginated out of stock ingredients");
        Page<Ingredient> ingredients = inventoryService.getOutOfStockIngredientsPaginated(pageable);
        Page<InventoryResponse> responses = ingredients.map(InventoryResponse::fromEntity);
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{ingredientId}/movements")
    @Operation(summary = "Get stock movements", description = "Retrieve stock movement history for a specific ingredient")
    public ResponseEntity<List<StockMovementResponse>> getStockMovements(
            @Parameter(description = "Ingredient ID") @PathVariable Long ingredientId) {
        log.info("Getting stock movements for ingredient ID: {}", ingredientId);
        List<StockMovement> movements = inventoryService.getStockMovements(ingredientId);
        List<StockMovementResponse> responses = movements.stream()
            .map(StockMovementResponse::fromEntity)
            .collect(Collectors.toList());
        return ResponseEntity.ok(responses);
    }
    
    @GetMapping("/{ingredientId}/movements/paginated")
    @Operation(summary = "Get stock movements (paginated)", description = "Retrieve paginated stock movement history")
    public ResponseEntity<Page<StockMovementResponse>> getStockMovementsPaginated(
            @Parameter(description = "Ingredient ID") @PathVariable Long ingredientId,
            @Parameter(description = "Pagination parameters") Pageable pageable) {
        log.info("Getting paginated stock movements for ingredient ID: {}", ingredientId);
        Page<StockMovement> movements = inventoryService.getStockMovementsPaginated(ingredientId, pageable);
        Page<StockMovementResponse> responses = movements.map(StockMovementResponse::fromEntity);
        return ResponseEntity.ok(responses);
    }
    
    @PostMapping("/{ingredientId}/add-stock")
    public ResponseEntity<Void> addStock(
            @PathVariable Long ingredientId,
            @RequestParam Integer quantity,
            @RequestParam String reason,
            @RequestParam String createdBy) {
        log.info("Adding {} units to ingredient ID: {}", quantity, ingredientId);
        inventoryService.addStock(ingredientId, quantity, reason, createdBy);
        return ResponseEntity.ok().build();
    }
    
    @PostMapping("/{ingredientId}/adjust-stock")
    public ResponseEntity<Void> adjustStock(
            @PathVariable Long ingredientId,
            @RequestParam Integer newStock,
            @RequestParam String reason,
            @RequestParam String createdBy) {
        log.info("Adjusting stock to {} units for ingredient ID: {}", newStock, ingredientId);
        inventoryService.adjustStock(ingredientId, newStock, reason, createdBy);
        return ResponseEntity.ok().build();
    }
    
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteIngredient(@PathVariable Long id) {
        log.info("Deleting ingredient with ID: {}", id);
        inventoryService.deleteIngredient(id);
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/health")
    public ResponseEntity<String> health() {
        return ResponseEntity.ok("Inventory service is running");
    }
}
