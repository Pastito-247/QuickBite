package com.quickbite.menu_service.service;

import com.quickbite.menu_service.dto.IngredientAvailability;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.integration.InventoryServiceClient;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
@Slf4j
public class AvailabilityService {
    
    private final MenuService menuService;
    private final InventoryServiceClient inventoryServiceClient;
    
    /**
     * Verifica la disponibilidad de ingredientes y desactiva platos automáticamente
     * Se ejecuta cada 5 minutos
     */
    @Scheduled(fixedRate = 300000) // 5 minutos en milisegundos
    @Transactional
    public void checkAndUpdateMenuAvailability() {
        log.info("Starting automatic availability check");
        
        try {
            // Obtener todos los platos disponibles
            List<MenuItem> availableItems = menuService.getAllMenuItemsInternal()
                    .stream()
                    .filter(MenuItem::isAvailable)
                    .toList();
            
            for (MenuItem item : availableItems) {
                checkMenuItemAvailability(item);
            }
            
        } catch (Exception e) {
            log.error("Error during automatic availability check", e);
        }
        
        log.info("Finished automatic availability check");
    }
    
    /**
     * Verifica la disponibilidad de un plato específico
     */
    @Transactional
    public void checkMenuItemAvailability(MenuItem item) {
        try {
            // Aquí asumimos que cada MenuItem tiene una lista de ingredientes
            // En una implementación real, esto vendría de una tabla de ingredientes_por_plato
            List<Long> ingredientIds = getIngredientIdsForMenuItem(item.getId());
            
            if (ingredientIds.isEmpty()) {
                log.warn("No ingredients found for menu item: {}", item.getId());
                return;
            }
            
            // Verificar disponibilidad con el servicio de inventario
            List<IngredientAvailability> availabilities = inventoryServiceClient.checkAvailability(ingredientIds);
            
            // Verificar si algún ingrediente no está disponible
            boolean hasUnavailableIngredient = availabilities.stream()
                    .anyMatch(availability -> !availability.isAvailable());
            
            if (hasUnavailableIngredient) {
                log.warn("Deactivating menu item {} due to unavailable ingredients", item.getId());
                menuService.updateAvailability(item.getId(), false);
            }
            
        } catch (Exception e) {
            log.error("Error checking availability for menu item: " + item.getId(), e);
        }
    }
    
    /**
     * Verifica platos con ingredientes bajos en stock
     */
    public List<MenuItem> getItemsWithLowStockIngredients() {
        try {
            List<IngredientAvailability> lowStockIngredients = inventoryServiceClient.getLowStockIngredients();
            
            return menuService.getAllMenuItemsInternal()
                    .stream()
                    .filter(item -> hasLowStockIngredient(item, lowStockIngredients))
                    .toList();
                    
        } catch (Exception e) {
            log.error("Error getting items with low stock ingredients", e);
            return List.of();
        }
    }
    
    /**
     * Método simulado para obtener IDs de ingredientes de un plato
     * En una implementación real, esto consultaría una tabla de ingredientes_por_plato
     */
    private List<Long> getIngredientIdsForMenuItem(Long menuItemId) {
        // Simulación: cada plato usa ingredientes con IDs basados en su propio ID
        return List.of(
            menuItemId % 10 + 1,  // Ingrediente principal
            (menuItemId + 1) % 10 + 1,  // Ingrediente secundario
            (menuItemId + 2) % 10 + 1   // Ingrediente terciario
        );
    }
    
    /**
     * Verifica si un plato tiene ingredientes bajos en stock
     */
    private boolean hasLowStockIngredient(MenuItem item, List<IngredientAvailability> lowStockIngredients) {
        List<Long> itemIngredientIds = getIngredientIdsForMenuItem(item.getId());
        
        return lowStockIngredients.stream()
                .anyMatch(availability -> itemIngredientIds.contains(availability.getIngredientId()));
    }
}
