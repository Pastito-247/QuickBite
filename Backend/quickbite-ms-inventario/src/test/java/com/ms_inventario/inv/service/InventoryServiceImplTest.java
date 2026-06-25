package com.ms_inventario.inv.service;

import com.ms_inventario.inv.client.MenuServiceClient;
import com.ms_inventario.inv.client.NotificationServiceClient;
import com.ms_inventario.inv.dto.InventoryRequest;
import com.ms_inventario.inv.dto.StockDeductionRequest;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.UnitType;
import com.ms_inventario.inv.exception.IngredientAlreadyExistsException;
import com.ms_inventario.inv.exception.IngredientNotFoundException;
import com.ms_inventario.inv.exception.InsufficientStockException;
import com.ms_inventario.inv.repository.InventoryRepository;
import com.ms_inventario.inv.repository.StockMovementRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;

import java.math.BigDecimal;
import java.util.*;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class InventoryServiceImplTest {

    @Mock
    private InventoryRepository inventoryRepository;

    @Mock
    private StockMovementRepository stockMovementRepository;

    @Mock
    private NotificationServiceClient notificationServiceClient;

    @Mock
    private MenuServiceClient menuServiceClient;

    @InjectMocks
    private InventoryServiceImpl inventoryService;

    private Ingredient testIngredient;
    private InventoryRequest testRequest;

    @BeforeEach
    void setUp() {
        testIngredient = new Ingredient();
        testIngredient.setId(1L);
        testIngredient.setName("Tomato");
        testIngredient.setDescription("Fresh red tomatoes");
        testIngredient.setUnitCost(new BigDecimal("2.50"));
        testIngredient.setUnitType(UnitType.KILOGRAMS);
        testIngredient.setCurrentStock(100);
        testIngredient.setMinimumStock(10);
        testIngredient.setMaximumStock(500);
        testIngredient.setIsActive(true);

        testRequest = new InventoryRequest();
        testRequest.setName("Tomato");
        testRequest.setDescription("Fresh red tomatoes");
        testRequest.setUnitCost(new BigDecimal("2.50"));
        testRequest.setUnitType(UnitType.KILOGRAMS);
        testRequest.setCurrentStock(100);
        testRequest.setMinimumStock(10);
        testRequest.setMaximumStock(500);
    }

    @Test
    void shouldCreateIngredientSuccessfully() {
        // Given
        when(inventoryRepository.findByName(anyString())).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        Ingredient result = inventoryService.createIngredient(testRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Tomato");
        assertThat(result.getCurrentStock()).isEqualTo(100);
        verify(inventoryRepository).save(any(Ingredient.class));
        verify(stockMovementRepository).save(any());
    }

    @Test
    void shouldThrowExceptionWhenCreatingDuplicateIngredient() {
        // Given
        when(inventoryRepository.findByName(anyString())).thenReturn(Optional.of(testIngredient));

        // When & Then
        assertThatThrownBy(() -> inventoryService.createIngredient(testRequest))
            .isInstanceOf(IngredientAlreadyExistsException.class)
            .hasMessageContaining("already exists");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }

    @Test
    void shouldUpdateIngredientSuccessfully() {
        // Given
        InventoryRequest updateRequest = new InventoryRequest();
        updateRequest.setName("Tomato Updated");
        updateRequest.setDescription("Updated description");
        updateRequest.setUnitCost(new BigDecimal("3.00"));
        updateRequest.setUnitType(UnitType.KILOGRAMS);
        updateRequest.setCurrentStock(80);
        updateRequest.setMinimumStock(15);
        updateRequest.setMaximumStock(400);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.findByName("Tomato Updated")).thenReturn(Optional.empty());
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        Ingredient result = inventoryService.updateIngredient(1L, updateRequest);

        // Then
        assertThat(result).isNotNull();
        verify(inventoryRepository).save(any(Ingredient.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inventoryService.updateIngredient(1L, testRequest))
            .isInstanceOf(IngredientNotFoundException.class)
            .hasMessageContaining("not found");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingWithDuplicateName() {
        // Given
        Ingredient existingIngredient = new Ingredient();
        existingIngredient.setId(2L);
        existingIngredient.setName("Lettuce");

        InventoryRequest updateRequest = new InventoryRequest();
        updateRequest.setName("Lettuce");
        updateRequest.setDescription("Updated description");
        updateRequest.setUnitCost(new BigDecimal("3.00"));
        updateRequest.setUnitType(UnitType.KILOGRAMS);
        updateRequest.setCurrentStock(80);
        updateRequest.setMinimumStock(15);
        updateRequest.setMaximumStock(400);

        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.findByName("Lettuce")).thenReturn(Optional.of(existingIngredient));

        // When & Then
        assertThatThrownBy(() -> inventoryService.updateIngredient(1L, updateRequest))
            .isInstanceOf(IngredientAlreadyExistsException.class)
            .hasMessageContaining("already exists");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }

    @Test
    void shouldGetIngredientById() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));

        // When
        Optional<Ingredient> result = inventoryService.getIngredient(1L);

        // Then
        assertThat(result).isPresent();
        assertThat(result.get().getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findById(1L);
    }

    @Test
    void shouldReturnEmptyWhenGettingNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        Optional<Ingredient> result = inventoryService.getIngredient(1L);

        // Then
        assertThat(result).isEmpty();
        verify(inventoryRepository).findById(1L);
    }

    @Test
    void shouldGetAllActiveIngredients() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryRepository.findAllActiveIngredients()).thenReturn(ingredients);

        // When
        List<Ingredient> result = inventoryService.getAllActiveIngredients();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findAllActiveIngredients();
    }

    @Test
    void shouldGetIngredientsByIds() {
        // Given
        List<Long> ids = Arrays.asList(1L, 2L);
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryRepository.findAllById(ids)).thenReturn(ingredients);

        // When
        List<Ingredient> result = inventoryService.getIngredientsByIds(ids);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findAllById(ids);
    }

    @Test
    void shouldGetAllActiveIngredientsPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryRepository.findAllActiveIngredientsPaginated(pageable)).thenReturn(page);

        // When
        Page<Ingredient> result = inventoryService.getAllActiveIngredientsPaginated(pageable);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findAllActiveIngredientsPaginated(pageable);
    }

    @Test
    void shouldDeleteIngredientSuccessfully() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        inventoryService.deleteIngredient(1L);

        // Then
        verify(inventoryRepository).save(any(Ingredient.class));
        assertThat(testIngredient.getIsActive()).isFalse();
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inventoryService.deleteIngredient(1L))
            .isInstanceOf(IngredientNotFoundException.class)
            .hasMessageContaining("not found");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }

    @Test
    void shouldDeductStockSuccessfully() {
        // Given
        StockDeductionRequest request = new StockDeductionRequest();
        request.setOrderId("ORDER-123");
        request.setItems(List.of(
            new StockDeductionRequest.StockDeductionItem(1L, 10)
        ));

        when(inventoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        inventoryService.deductStock(request);

        // Then
        verify(inventoryRepository).findByIdWithLock(1L);
        verify(inventoryRepository).save(any(Ingredient.class));
        verify(stockMovementRepository).save(any());
    }

    @Test
    void shouldThrowExceptionWhenDeductingWithInsufficientStock() {
        // Given
        StockDeductionRequest request = new StockDeductionRequest();
        request.setOrderId("ORDER-123");
        request.setItems(List.of(
            new StockDeductionRequest.StockDeductionItem(1L, 200)
        ));

        when(inventoryRepository.findByIdWithLock(1L)).thenReturn(Optional.of(testIngredient));

        // When & Then
        assertThatThrownBy(() -> inventoryService.deductStock(request))
            .isInstanceOf(InsufficientStockException.class)
            .hasMessageContaining("Insufficient stock");
    }

    @Test
    void shouldAddStockSuccessfully() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        inventoryService.addStock(1L, 25, "Purchase from supplier", "ADMIN");

        // Then
        verify(inventoryRepository).save(any(Ingredient.class));
        verify(stockMovementRepository).save(any());
    }

    @Test
    void shouldThrowExceptionWhenAddingStockToNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inventoryService.addStock(1L, 25, "Purchase from supplier", "ADMIN"))
            .isInstanceOf(IngredientNotFoundException.class)
            .hasMessageContaining("not found");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }

    @Test
    void shouldCheckIngredientAvailability() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));

        // When
        boolean available = inventoryService.checkIngredientAvailability(1L, 50);
        boolean notAvailable = inventoryService.checkIngredientAvailability(1L, 150);

        // Then
        assertThat(available).isTrue();
        assertThat(notAvailable).isFalse();
    }

    @Test
    void shouldReturnFalseWhenCheckingAvailabilityForNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When
        boolean available = inventoryService.checkIngredientAvailability(1L, 50);

        // Then
        assertThat(available).isFalse();
    }

    @Test
    void shouldCheckMultipleIngredientsAvailability() {
        // Given
        Ingredient secondIngredient = new Ingredient();
        secondIngredient.setId(2L);
        secondIngredient.setName("Onion");
        secondIngredient.setCurrentStock(30);
        secondIngredient.setMinimumStock(5);
        secondIngredient.setIsActive(true);

        Map<Long, Integer> requirements = Map.of(
            1L, 50,
            2L, 25
        );

        when(inventoryRepository.findAllById(anyList())).thenReturn(Arrays.asList(testIngredient, secondIngredient));

        // When
        Map<Long, Boolean> result = inventoryService.checkMultipleIngredientsAvailability(requirements);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.get(1L)).isTrue();
        assertThat(result.get(2L)).isTrue();
    }

    @Test
    void shouldGetCriticalStockIngredients() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryRepository.findCriticalStockIngredients()).thenReturn(ingredients);

        // When
        List<Ingredient> result = inventoryService.getCriticalStockIngredients();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findCriticalStockIngredients();
    }

    @Test
    void shouldGetCriticalStockIngredientsPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryRepository.findCriticalStockIngredientsPaginated(pageable)).thenReturn(page);

        // When
        Page<Ingredient> result = inventoryService.getCriticalStockIngredientsPaginated(pageable);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findCriticalStockIngredientsPaginated(pageable);
    }

    @Test
    void shouldGetOutOfStockIngredients() {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryRepository.findOutOfStockIngredients()).thenReturn(ingredients);

        // When
        List<Ingredient> result = inventoryService.getOutOfStockIngredients();

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findOutOfStockIngredients();
    }

    @Test
    void shouldGetOutOfStockIngredientsPaginated() {
        // Given
        Pageable pageable = PageRequest.of(0, 10);
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryRepository.findOutOfStockIngredientsPaginated(pageable)).thenReturn(page);

        // When
        Page<Ingredient> result = inventoryService.getOutOfStockIngredientsPaginated(pageable);

        // Then
        assertThat(result).hasSize(1);
        assertThat(result.getContent().get(0).getName()).isEqualTo("Tomato");
        verify(inventoryRepository).findOutOfStockIngredientsPaginated(pageable);
    }

    @Test
    void shouldAdjustStockSuccessfully() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.of(testIngredient));
        when(inventoryRepository.save(any(Ingredient.class))).thenReturn(testIngredient);

        // When
        inventoryService.adjustStock(1L, 150, "Manual adjustment", "ADMIN");

        // Then
        verify(inventoryRepository).save(any(Ingredient.class));
        verify(stockMovementRepository).save(any());
    }

    @Test
    void shouldThrowExceptionWhenAdjustingStockForNonExistentIngredient() {
        // Given
        when(inventoryRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> inventoryService.adjustStock(1L, 150, "Manual adjustment", "ADMIN"))
            .isInstanceOf(IngredientNotFoundException.class)
            .hasMessageContaining("not found");
        verify(inventoryRepository, never()).save(any(Ingredient.class));
    }
}
