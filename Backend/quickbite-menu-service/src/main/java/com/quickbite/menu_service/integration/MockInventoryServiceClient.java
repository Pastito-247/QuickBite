package com.quickbite.menu_service.integration;

import com.quickbite.menu_service.dto.IngredientAvailability;
import com.quickbite.menu_service.dto.IngredientConsumption;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Random;

@Service
@ConditionalOnProperty(name = "app.services.inventory.mock", havingValue = "true")
public class MockInventoryServiceClient {
    
    private final Random random = new Random();
    
    public List<IngredientAvailability> checkAvailability(List<Long> ingredientIds) {
        return ingredientIds.stream()
                .map(this::createMockAvailability)
                .toList();
    }
    
    public void consumeIngredients(List<IngredientConsumption> consumptions) {
        // Simulate consumption - in real implementation this would update stock
        System.out.println("Mock: Consuming ingredients: " + consumptions);
    }
    
    public List<IngredientAvailability> getLowStockIngredients() {
        // Simulate some ingredients being low on stock
        return List.of(
            IngredientAvailability.builder()
                .ingredientId(1L)
                .ingredientName("Tomate")
                .available(true)
                .currentStock(5.0)
                .minThreshold(10.0)
                .unit("kg")
                .build(),
            IngredientAvailability.builder()
                .ingredientId(3L)
                .ingredientName("Queso")
                .available(true)
                .currentStock(2.5)
                .minThreshold(5.0)
                .unit("kg")
                .build()
        );
    }
    
    private IngredientAvailability createMockAvailability(Long ingredientId) {
        // Simulate realistic stock levels
        double currentStock = random.nextDouble() * 100;
        double minThreshold = random.nextDouble() * 20 + 5;
        boolean available = currentStock > minThreshold * 0.2; // Available if above 20% of threshold
        
        String[] ingredientNames = {"Harina", "Tomate", "Queso", "Carne", "Lechuga", "Pan", "Cebolla"};
        String ingredientName = ingredientNames[(int)(ingredientId % ingredientNames.length)];
        
        return IngredientAvailability.builder()
                .ingredientId(ingredientId)
                .ingredientName(ingredientName)
                .available(available)
                .currentStock(currentStock)
                .minThreshold(minThreshold)
                .unit("kg")
                .build();
    }
}
