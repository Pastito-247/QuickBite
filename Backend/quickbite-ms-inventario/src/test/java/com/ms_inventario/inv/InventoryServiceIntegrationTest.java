package com.ms_inventario.inv;

import com.ms_inventario.inv.dto.InventoryRequest;
import com.ms_inventario.inv.dto.StockDeductionRequest;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.UnitType;
import com.ms_inventario.inv.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.test.context.TestPropertySource;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;

@SpringBootTest
@TestPropertySource(locations = "classpath:application-test.properties")
@Transactional
class InventoryServiceIntegrationTest {
    
    @Autowired
    private InventoryService inventoryService;
    
    private Ingredient testIngredient;
    
    @BeforeEach
    void setUp() {
        // Create a test ingredient
        InventoryRequest request = new InventoryRequest();
        request.setName("Tomato");
        request.setDescription("Fresh red tomatoes");
        request.setUnitCost(new BigDecimal("2.50"));
        request.setUnitType(UnitType.KILOGRAMS);
        request.setCurrentStock(100);
        request.setMinimumStock(10);
        request.setMaximumStock(500);
        
        testIngredient = inventoryService.createIngredient(request);
    }
    
    @Test
    void shouldCreateIngredientSuccessfully() {
        // Given
        InventoryRequest request = new InventoryRequest();
        request.setName("Lettuce");
        request.setDescription("Fresh green lettuce");
        request.setUnitCost(new BigDecimal("1.50"));
        request.setUnitType(UnitType.UNITS);
        request.setCurrentStock(50);
        request.setMinimumStock(5);
        request.setMaximumStock(200);
        
        // When
        Ingredient result = inventoryService.createIngredient(request);
        
        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Lettuce");
        assertThat(result.getCurrentStock()).isEqualTo(50);
        assertThat(result.getIsActive()).isTrue();
    }
    
    @Test
    void shouldGetIngredientById() {
        // When
        var result = inventoryService.getIngredient(testIngredient.getId());
        
        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Tomato");
        assertThat(result.get().getCurrentStock()).isEqualTo(100);
    }
    
    @Test
    void shouldGetAllActiveIngredients() {
        // Given - we already have one ingredient from setUp
        
        // When
        List<Ingredient> ingredients = inventoryService.getAllActiveIngredients();
        
        // Then
        assertThat(ingredients).isNotEmpty();
        assertThat(ingredients).anyMatch(ing -> "Tomato".equals(ing.getName()));
    }
    
    @Test
    void shouldDeductStockSuccessfully() {
        // Given
        StockDeductionRequest request = new StockDeductionRequest();
        request.setOrderId("ORDER-123");
        request.setItems(List.of(
            new StockDeductionRequest.StockDeductionItem(testIngredient.getId(), 5)
        ));
        
        // When
        inventoryService.deductStock(request);
        
        // Then
        Ingredient updated = inventoryService.getIngredient(testIngredient.getId()).orElseThrow();
        assertThat(updated.getCurrentStock()).isEqualTo(95);
    }
    
    @Test
    void shouldThrowExceptionWhenInsufficientStock() {
        // Given
        StockDeductionRequest request = new StockDeductionRequest();
        request.setOrderId("ORDER-123");
        request.setItems(List.of(
            new StockDeductionRequest.StockDeductionItem(testIngredient.getId(), 200)
        ));
        
        // When & Then
        assertThatThrownBy(() -> inventoryService.deductStock(request))
            .isInstanceOf(RuntimeException.class)
            .hasMessageContaining("Insufficient stock");
    }
    
    @Test
    void shouldAddStockSuccessfully() {
        // When
        inventoryService.addStock(testIngredient.getId(), 25, "Purchase from supplier", "ADMIN");
        
        // Then
        Ingredient updated = inventoryService.getIngredient(testIngredient.getId()).orElseThrow();
        assertThat(updated.getCurrentStock()).isEqualTo(125);
    }
    
    @Test
    void shouldCheckIngredientAvailability() {
        // When
        boolean available = inventoryService.checkIngredientAvailability(testIngredient.getId(), 50);
        boolean notAvailable = inventoryService.checkIngredientAvailability(testIngredient.getId(), 150);
        
        // Then
        assertThat(available).isTrue();
        assertThat(notAvailable).isFalse();
    }
    
    @Test
    void shouldCheckMultipleIngredientsAvailability() {
        // Given
        InventoryRequest secondRequest = new InventoryRequest();
        secondRequest.setName("Onion");
        secondRequest.setDescription("Fresh onions");
        secondRequest.setUnitCost(new BigDecimal("1.00"));
        secondRequest.setUnitType(UnitType.KILOGRAMS);
        secondRequest.setCurrentStock(30);
        secondRequest.setMinimumStock(5);
        secondRequest.setMaximumStock(100);
        
        Ingredient secondIngredient = inventoryService.createIngredient(secondRequest);
        
        Map<Long, Integer> requirements = Map.of(
            testIngredient.getId(), 50,
            secondIngredient.getId(), 25
        );
        
        // When
        Map<Long, Boolean> availability = inventoryService.checkMultipleIngredientsAvailability(requirements);
        
        // Then
        assertThat(availability.get(testIngredient.getId())).isTrue();
        assertThat(availability.get(secondIngredient.getId())).isTrue();
    }
    
    @Test
    void shouldUpdateIngredient() {
        // Given
        InventoryRequest updateRequest = new InventoryRequest();
        updateRequest.setName("Tomato Updated");
        updateRequest.setDescription("Updated description");
        updateRequest.setUnitCost(new BigDecimal("3.00"));
        updateRequest.setUnitType(UnitType.KILOGRAMS);
        updateRequest.setCurrentStock(80);
        updateRequest.setMinimumStock(15);
        updateRequest.setMaximumStock(400);
        
        // When
        Ingredient updated = inventoryService.updateIngredient(testIngredient.getId(), updateRequest);
        
        // Then
        assertThat(updated.getName()).isEqualTo("Tomato Updated");
        assertThat(updated.getDescription()).isEqualTo("Updated description");
        assertThat(updated.getUnitCost()).isEqualTo(new BigDecimal("3.00"));
    }
    
    @Test
    void shouldDeleteIngredient() {
        // When
        inventoryService.deleteIngredient(testIngredient.getId());
        
        // Then
        Ingredient deleted = inventoryService.getIngredient(testIngredient.getId()).orElseThrow();
        assertThat(deleted.getIsActive()).isFalse();
        
        // Should not appear in active ingredients list
        List<Ingredient> activeIngredients = inventoryService.getAllActiveIngredients();
        assertThat(activeIngredients).noneMatch(ing -> ing.getId().equals(testIngredient.getId()));
    }
}
