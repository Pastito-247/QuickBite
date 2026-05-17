package com.quickbite.menu_service.integration;

import com.quickbite.menu_service.dto.IngredientAvailability;
import com.quickbite.menu_service.dto.IngredientConsumption;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.List;
import java.util.function.Supplier;

@Service
public class InventoryServiceClient {
    
    private final RestTemplate restTemplate;
    private final Resilience4JCircuitBreakerFactory circuitBreakerFactory;
    private final String inventoryServiceUrl;
    
    public InventoryServiceClient(RestTemplate restTemplate, 
                                Resilience4JCircuitBreakerFactory circuitBreakerFactory,
                                org.springframework.core.env.Environment env) {
        this.restTemplate = restTemplate;
        this.circuitBreakerFactory = circuitBreakerFactory;
        this.inventoryServiceUrl = env.getProperty("app.services.inventory.url", "http://localhost:8082");
    }
    
    public List<IngredientAvailability> checkAvailability(List<Long> ingredientIds) {
        Supplier<List<IngredientAvailability>> supplier = () -> {
            String url = inventoryServiceUrl + "/api/inventory/check";
            @SuppressWarnings("unchecked")
            List<IngredientAvailability> result = restTemplate.postForObject(url, ingredientIds, List.class);
            return result;
        };
        
        return circuitBreakerFactory.create("inventory-service")
                .run(supplier, throwable -> {
                    // Fallback: asumir que todos los ingredientes están disponibles
                    return ingredientIds.stream()
                            .map(id -> IngredientAvailability.builder()
                                    .ingredientId(id)
                                    .available(true)
                                    .currentStock(100.0)
                                    .minThreshold(10.0)
                                    .unit("units")
                                    .build())
                            .toList();
                });
    }
    
    public void consumeIngredients(List<IngredientConsumption> consumptions) {
        try {
            String url = inventoryServiceUrl + "/api/inventory/consume";
            restTemplate.postForObject(url, consumptions, Void.class);
        } catch (Exception e) {
            // Fallback: loggear el error pero no bloquear la operación
            System.err.println("Failed to consume ingredients: " + e.getMessage());
        }
    }
    
    public List<IngredientAvailability> getLowStockIngredients() {
        try {
            String url = inventoryServiceUrl + "/api/inventory/low-stock";
            @SuppressWarnings("unchecked")
            List<IngredientAvailability> result = restTemplate.getForObject(url, List.class);
            return result;
        } catch (Exception e) {
            // Fallback: retornar lista vacía
            return List.of();
        }
    }
}
