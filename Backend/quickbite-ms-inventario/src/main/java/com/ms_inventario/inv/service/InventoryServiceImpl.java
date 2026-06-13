package com.ms_inventario.inv.service;

import com.ms_inventario.inv.client.MenuServiceClient;
import com.ms_inventario.inv.client.NotificationServiceClient;
import com.ms_inventario.inv.dto.InventoryRequest;
import com.ms_inventario.inv.dto.StockAlertDTO;
import com.ms_inventario.inv.dto.StockDeductionRequest;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.MovementType;
import com.ms_inventario.inv.entity.StockMovement;
import com.ms_inventario.inv.exception.IngredientAlreadyExistsException;
import com.ms_inventario.inv.exception.IngredientNotFoundException;
import com.ms_inventario.inv.exception.InsufficientStockException;
import com.ms_inventario.inv.repository.InventoryRepository;
import com.ms_inventario.inv.repository.StockMovementRepository;
import io.github.resilience4j.circuitbreaker.annotation.CircuitBreaker;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.*;
import java.util.stream.Collectors;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Service
@Transactional
@Slf4j
public class InventoryServiceImpl implements InventoryService {
    
    private final InventoryRepository inventoryRepository;
    private final StockMovementRepository stockMovementRepository;
    private final NotificationServiceClient notificationServiceClient;
    private final MenuServiceClient menuServiceClient;
    
    public InventoryServiceImpl(InventoryRepository inventoryRepository,
                              StockMovementRepository stockMovementRepository,
                              NotificationServiceClient notificationServiceClient,
                              MenuServiceClient menuServiceClient) {
        this.inventoryRepository = inventoryRepository;
        this.stockMovementRepository = stockMovementRepository;
        this.notificationServiceClient = notificationServiceClient;
        this.menuServiceClient = menuServiceClient;
    }
    
    @Override
    public Ingredient createIngredient(InventoryRequest request) {
        log.info("Creating new ingredient: {}", request.getName());
        
        if (inventoryRepository.findByName(request.getName()).isPresent()) {
            throw new IngredientAlreadyExistsException("Ingredient with name '" + request.getName() + "' already exists");
        }
        
        Ingredient ingredient = new Ingredient();
        ingredient.setName(request.getName());
        ingredient.setDescription(request.getDescription());
        ingredient.setUnitCost(request.getUnitCost());
        ingredient.setUnitType(request.getUnitType());
        ingredient.setCurrentStock(request.getCurrentStock());
        ingredient.setMinimumStock(request.getMinimumStock());
        ingredient.setMaximumStock(request.getMaximumStock());
        ingredient.setIsActive(true);
        
        Ingredient savedIngredient = inventoryRepository.save(ingredient);
        
        // Create initial stock movement
        createStockMovement(savedIngredient, MovementType.INITIAL, request.getCurrentStock(), 
                           0, request.getCurrentStock(), "Initial stock", "SYSTEM");
        
        log.info("Successfully created ingredient with ID: {}", savedIngredient.getId());
        return savedIngredient;
    }
    
    @Override
    public Ingredient updateIngredient(Long id, InventoryRequest request) {
        log.info("Updating ingredient with ID: {}", id);
        
        Ingredient ingredient = inventoryRepository.findById(id)
            .orElseThrow(() -> new IngredientNotFoundException("Ingredient not found with ID: " + id));
        
        // Check if name is being changed and if new name already exists
        if (!ingredient.getName().equals(request.getName()) && 
            inventoryRepository.findByName(request.getName()).isPresent()) {
            throw new IngredientAlreadyExistsException("Ingredient with name '" + request.getName() + "' already exists");
        }
        
        ingredient.setName(request.getName());
        ingredient.setDescription(request.getDescription());
        ingredient.setUnitCost(request.getUnitCost());
        ingredient.setUnitType(request.getUnitType());
        ingredient.setCurrentStock(request.getCurrentStock());
        ingredient.setMinimumStock(request.getMinimumStock());
        ingredient.setMaximumStock(request.getMaximumStock());
        
        Ingredient updatedIngredient = inventoryRepository.save(ingredient);
        log.info("Successfully updated ingredient with ID: {}", id);
        return updatedIngredient;
    }
    
    @Override
    public Optional<Ingredient> getIngredient(Long id) {
        return inventoryRepository.findById(id);
    }
    
    @Override
    public List<Ingredient> getAllActiveIngredients() {
        return inventoryRepository.findAllActiveIngredients();
    }

    @Override
    public List<Ingredient> getIngredientsByIds(List<Long> ids) {
        return inventoryRepository.findAllById(ids);
    }

    @Override
    public void deleteIngredient(Long id) {
        log.info("Deleting ingredient with ID: {}", id);
        
        Ingredient ingredient = inventoryRepository.findById(id)
            .orElseThrow(() -> new IngredientNotFoundException("Ingredient not found with ID: " + id));
        
        ingredient.setIsActive(false);
        inventoryRepository.save(ingredient);
        
        log.info("Successfully deactivated ingredient with ID: {}", id);
    }
    
    @Override
    @Transactional
    public void deductStock(StockDeductionRequest request) {
        log.info("Processing stock deduction for order: {}", request.getOrderId());
        
        List<StockMovement> movements = new ArrayList<>();
        List<Long> outOfStockIngredients = new ArrayList<>();
        
        for (StockDeductionRequest.StockDeductionItem item : request.getItems()) {
            try {
                Ingredient ingredient = inventoryRepository.findByIdWithLock(item.getIngredientId())
                    .orElseThrow(() -> new IngredientNotFoundException("Ingredient not found with ID: " + item.getIngredientId()));
                
                if (!ingredient.getIsActive()) {
                    throw new IllegalStateException("Ingredient is not active: " + ingredient.getName());
                }
                
                if (ingredient.getCurrentStock() < item.getQuantity()) {
                    outOfStockIngredients.add(ingredient.getId());
                    log.warn("Insufficient stock for ingredient {}: required={}, available={}", 
                            ingredient.getName(), item.getQuantity(), ingredient.getCurrentStock());
                    continue;
                }
                
                Integer previousStock = ingredient.getCurrentStock();
                ingredient.setCurrentStock(ingredient.getCurrentStock() - item.getQuantity());
                inventoryRepository.save(ingredient);
                
                // Create stock movement record
                StockMovement movement = createStockMovement(ingredient, MovementType.ORDER_DEDUCTION, 
                                                           item.getQuantity(), previousStock, 
                                                           ingredient.getCurrentStock(), 
                                                           "Order: " + request.getOrderId(), "SYSTEM");
                movements.add(movement);
                
                // Check if stock reached critical level.
                // El envío de la alerta es un efecto secundario: si falla NO debe
                // abortar ni revertir el descuento de stock ya realizado.
                if (ingredient.getCurrentStock() <= ingredient.getMinimumStock()) {
                    try {
                        sendCriticalStockAlert(ingredient);
                    } catch (Exception alertError) {
                        log.error("Failed to send critical stock alert for ingredient {}; stock deduction is kept",
                                ingredient.getName(), alertError);
                    }
                }
                
                // Check if ingredient is out of stock
                if (ingredient.getCurrentStock() == 0) {
                    log.warn("Ingredient {} is now out of stock", ingredient.getName());
                    // Notify menu service that ingredient is out of stock
                    try {
                        menuServiceClient.notifyIngredientOutOfStock(ingredient.getId());
                    } catch (Exception e) {
                        log.error("Failed to notify menu service about out-of-stock ingredient: {}", ingredient.getId(), e);
                        // Fallback: The Feign client fallback will handle this
                    }
                }
                
            } catch (Exception e) {
                log.error("Error processing stock deduction for ingredient ID: {}", item.getIngredientId(), e);
                throw new InsufficientStockException("Failed to deduct stock for ingredient ID: " + item.getIngredientId());
            }
        }
        
        if (!outOfStockIngredients.isEmpty()) {
            throw new InsufficientStockException("Insufficient stock for ingredients: " + outOfStockIngredients);
        }
        
        log.info("Successfully processed stock deduction for order: {}", request.getOrderId());
    }
    
    @Override
    public void addStock(Long ingredientId, Integer quantity, String reason, String createdBy) {
        log.info("Adding {} units to ingredient ID: {}", quantity, ingredientId);
        
        Ingredient ingredient = inventoryRepository.findById(ingredientId)
            .orElseThrow(() -> new IngredientNotFoundException("Ingredient not found with ID: " + ingredientId));
        
        Integer previousStock = ingredient.getCurrentStock();
        ingredient.setCurrentStock(ingredient.getCurrentStock() + quantity);
        inventoryRepository.save(ingredient);
        
        createStockMovement(ingredient, MovementType.PURCHASE, quantity, 
                           previousStock, ingredient.getCurrentStock(), reason, createdBy);
        
        log.info("Successfully added stock to ingredient ID: {}", ingredientId);
    }
    
    @Override
    public List<Ingredient> getCriticalStockIngredients() {
        return inventoryRepository.findCriticalStockIngredients();
    }
    
    @Override
    public List<Ingredient> getOutOfStockIngredients() {
        return inventoryRepository.findOutOfStockIngredients();
    }
    
    @Override
    public List<StockMovement> getStockMovements(Long ingredientId) {
        return stockMovementRepository.findByIngredientIdOrderByCreatedAtDesc(ingredientId);
    }
    
    @Override
    public Page<StockMovement> getStockMovementsPaginated(Long ingredientId, Pageable pageable) {
        return stockMovementRepository.findByIngredientIdOrderByCreatedAtDescPaginated(ingredientId, pageable);
    }
    
    @Override
    public Page<Ingredient> getAllActiveIngredientsPaginated(Pageable pageable) {
        return inventoryRepository.findAllActiveIngredientsPaginated(pageable);
    }
    
    @Override
    public Page<Ingredient> getCriticalStockIngredientsPaginated(Pageable pageable) {
        return inventoryRepository.findCriticalStockIngredientsPaginated(pageable);
    }
    
    @Override
    public Page<Ingredient> getOutOfStockIngredientsPaginated(Pageable pageable) {
        return inventoryRepository.findOutOfStockIngredientsPaginated(pageable);
    }
    
    @Override
    public boolean checkIngredientAvailability(Long ingredientId, Integer requiredQuantity) {
        return inventoryRepository.findById(ingredientId)
            .map(ingredient -> ingredient.getIsActive() && ingredient.getCurrentStock() >= requiredQuantity)
            .orElse(false);
    }
    
    @Override
    public Map<Long, Boolean> checkMultipleIngredientsAvailability(Map<Long, Integer> ingredientQuantities) {
        List<Long> ingredientIds = new ArrayList<>(ingredientQuantities.keySet());
        List<Ingredient> ingredients = inventoryRepository.findAllById(ingredientIds);
        
        Map<Long, Boolean> availability = new HashMap<>();
        
        for (Ingredient ingredient : ingredients) {
            Integer requiredQuantity = ingredientQuantities.get(ingredient.getId());
            availability.put(ingredient.getId(), 
                ingredient.getIsActive() && ingredient.getCurrentStock() >= requiredQuantity);
        }
        
        return availability;
    }
    
    @Override
    public void adjustStock(Long ingredientId, Integer newStock, String reason, String createdBy) {
        log.info("Adjusting stock to {} units for ingredient ID: {}", newStock, ingredientId);
        
        Ingredient ingredient = inventoryRepository.findById(ingredientId)
            .orElseThrow(() -> new IngredientNotFoundException("Ingredient not found with ID: " + ingredientId));
        
        if (newStock < 0) {
            throw new IllegalArgumentException("New stock cannot be negative");
        }
        
        Integer previousStock = ingredient.getCurrentStock();
        Integer quantity = Math.abs(newStock - previousStock);
        MovementType movementType = newStock > previousStock ? MovementType.ADJUSTMENT : MovementType.ADJUSTMENT;
        
        ingredient.setCurrentStock(newStock);
        inventoryRepository.save(ingredient);
        
        createStockMovement(ingredient, movementType, quantity, 
                           previousStock, newStock, reason, createdBy);
        
        log.info("Successfully adjusted stock for ingredient ID: {}", ingredientId);
    }
    
    private StockMovement createStockMovement(Ingredient ingredient, MovementType movementType, 
                                            Integer quantity, Integer previousStock, Integer newStock, 
                                            String reason, String createdBy) {
        StockMovement movement = new StockMovement();
        movement.setIngredient(ingredient);
        movement.setMovementType(movementType);
        movement.setQuantity(quantity);
        movement.setPreviousStock(previousStock);
        movement.setNewStock(newStock);
        movement.setReason(reason);
        movement.setCreatedBy(createdBy);
        
        return stockMovementRepository.save(movement);
    }
    
    @CircuitBreaker(name = "inventoryService", fallbackMethod = "sendCriticalStockAlertFallback")
    private void sendCriticalStockAlert(Ingredient ingredient) {
        try {
            // Usar la firma con @RequestParam que coincide con el endpoint real
            // del servicio de notificaciones (/api/notificaciones/inventario-critico)
            notificationServiceClient.sendStockAlert(
                    String.valueOf(ingredient.getId()),
                    ingredient.getRestaurantId() != null ? ingredient.getRestaurantId() : 0L,
                    ingredient.getName(),
                    ingredient.getCurrentStock(),
                    ingredient.getMinimumStock()
            );
            log.info("Critical stock alert sent for ingredient: {}", ingredient.getName());

        } catch (Exception e) {
            log.error("Failed to send critical stock alert for ingredient: {}", ingredient.getName(), e);
            throw e;
        }
    }
    
    private void sendCriticalStockAlertFallback(Ingredient ingredient, Exception ex) {
        log.error("Circuit breaker activated: Failed to send critical stock alert for ingredient: {}. Fallback executed.", 
                 ingredient.getName(), ex);
        // Implement alternative notification mechanism (e.g., local logging, database flag)
    }
}
