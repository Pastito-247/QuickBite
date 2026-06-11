package com.quickbite.menu_service.integration;

import com.quickbite.menu_service.dto.IngredientAvailability;
import com.quickbite.menu_service.dto.IngredientConsumption;
import com.quickbite.menu_service.dto.IngredientDetail;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.function.Supplier;
import java.util.stream.Collectors;

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
        // Usa /details (acepta List<Long>) y construye IngredientAvailability
        // a partir de los datos reales del inventario.
        List<IngredientDetail> details = getIngredientsByIds(ingredientIds);
        if (details.isEmpty() && !ingredientIds.isEmpty()) {
            // Si el servicio de inventario no respondió, retornar no-disponible
            // para que la validación de stock bloquee de forma segura.
            return ingredientIds.stream()
                    .map(id -> IngredientAvailability.builder()
                            .ingredientId(id)
                            .available(false)
                            .currentStock(0.0)
                            .minThreshold(0.0)
                            .unit("units")
                            .build())
                    .toList();
        }
        return details.stream()
                .map(d -> IngredientAvailability.builder()
                        .ingredientId(d.getId())
                        .ingredientName(d.getName())
                        .available(d.getCurrentStock() != null && d.getCurrentStock() > 0)
                        .currentStock(d.getCurrentStock() != null ? d.getCurrentStock() : 0.0)
                        .minThreshold(d.getMinThreshold() != null ? d.getMinThreshold() : 0.0)
                        .unit(d.getUnit())
                        .build())
                .toList();
    }
    
    public void consumeIngredients(List<IngredientConsumption> consumptions) {
        try {
            String url = inventoryServiceUrl + "/api/inventory/deduct-stock";
            // Adaptar al formato StockDeductionRequest que espera el inventario
            Map<String, Object> request = new HashMap<>();
            request.put("orderId", "MENU-" + System.currentTimeMillis());
            List<Map<String, Object>> items = consumptions.stream()
                    .map(c -> {
                        Map<String, Object> item = new HashMap<>();
                        item.put("ingredientId", c.getIngredientId());
                        item.put("quantity", c.getQuantity().intValue());
                        return item;
                    })
                    .collect(Collectors.toList());
            request.put("items", items);
            restTemplate.postForObject(url, request, Void.class);
        } catch (Exception e) {
            System.err.println("Failed to consume ingredients: " + e.getMessage());
            throw new RuntimeException("Failed to deduct stock in inventory service", e);
        }
    }
    
    public List<IngredientAvailability> getLowStockIngredients() {
        try {
            String url = inventoryServiceUrl + "/api/inventory/critical-stock";
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> responses = restTemplate.getForObject(url, List.class);
            if (responses == null) {
                return List.of();
            }
            return responses.stream()
                    .map(r -> IngredientAvailability.builder()
                            .ingredientId(((Number) r.get("id")).longValue())
                            .ingredientName((String) r.get("name"))
                            .available(false)
                            .currentStock(((Number) r.get("currentStock")).doubleValue())
                            .minThreshold(((Number) r.get("minimumStock")).doubleValue())
                            .unit(r.get("unitType") != null ? r.get("unitType").toString() : "units")
                            .build())
                    .toList();
        } catch (Exception e) {
            return List.of();
        }
    }

    public List<IngredientDetail> getIngredientsByIds(List<Long> ingredientIds) {
        Supplier<List<IngredientDetail>> supplier = () -> {
            String url = inventoryServiceUrl + "/api/inventory/details";
            System.out.println("DEBUG: Calling inventory service at: " + url);
            System.out.println("DEBUG: Ingredient IDs: " + ingredientIds);
            @SuppressWarnings("unchecked")
            List<Map<String, Object>> responses = restTemplate.postForObject(url, ingredientIds, List.class);
            System.out.println("DEBUG: Response from inventory service: " + responses);
            if (responses == null) {
                System.out.println("DEBUG: Response is null, returning empty list");
                return List.of();
            }
            List<IngredientDetail> details = responses.stream()
                    .map(r -> IngredientDetail.builder()
                            .id(((Number) r.get("id")).longValue())
                            .name((String) r.get("name"))
                            .unit((String) r.get("unitType"))
                            .currentStock(((Number) r.get("currentStock")).doubleValue())
                            .minThreshold(((Number) r.get("minimumStock")).doubleValue())
                            .build())
                    .toList();
            System.out.println("DEBUG: Mapped ingredient details: " + details);
            return details;
        };

        return circuitBreakerFactory.create("inventory-service")
                .run(supplier, throwable -> {
                    System.err.println("ERROR: Circuit breaker activated for inventory service: " + throwable.getMessage());
                    throwable.printStackTrace();
                    // Fallback: retornar lista vacía
                    return List.of();
                });
    }
}
