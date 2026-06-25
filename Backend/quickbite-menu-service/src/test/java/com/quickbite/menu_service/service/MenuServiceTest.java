package com.quickbite.menu_service.service;

import com.quickbite.menu_service.dto.MenuItemRequest;
import com.quickbite.menu_service.dto.MenuItemResponse;
import com.quickbite.menu_service.dto.UpdateMenuItemRequest;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.exception.ResourceNotFoundException;
import com.quickbite.menu_service.repository.MenuRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class MenuServiceTest {

    @Mock
    private MenuRepository menuRepository;

    @Mock
    private MenuItemIngredientService menuItemIngredientService;

    @InjectMocks
    private MenuService menuService;

    private MenuItem testMenuItem;
    private MenuItemRequest menuItemRequest;
    private UpdateMenuItemRequest updateMenuItemRequest;

    @BeforeEach
    void setUp() {
        testMenuItem = MenuItem.builder()
                .id(1L)
                .name("Burger")
                .description("Delicious burger")
                .price(10.99)
                .category("Main Course")
                .available(true)
                .imageUrl("burger.jpg")
                .restaurantId(1L)
                .build();

        menuItemRequest = new MenuItemRequest();
        menuItemRequest.setName("Burger");
        menuItemRequest.setDescription("Delicious burger");
        menuItemRequest.setPrice(10.99);
        menuItemRequest.setCategory("Main Course");
        menuItemRequest.setImageUrl("burger.jpg");
        menuItemRequest.setRestaurantId(1L);

        updateMenuItemRequest = new UpdateMenuItemRequest();
        updateMenuItemRequest.setName("Updated Burger");
        updateMenuItemRequest.setDescription("Updated description");
        updateMenuItemRequest.setPrice(12.99);
        updateMenuItemRequest.setCategory("Main Course");
        updateMenuItemRequest.setAvailable(true);
        updateMenuItemRequest.setImageUrl("updated-burger.jpg");
        updateMenuItemRequest.setRestaurantId(1L);
    }

    @Test
    void shouldGetAvailableMenuSuccessfully() {
        // Given
        when(menuRepository.findByAvailableTrue()).thenReturn(Arrays.asList(testMenuItem));

        // When
        List<MenuItemResponse> result = menuService.getAvailableMenu();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        assertThat(result.get(0).getName()).isEqualTo("Burger");
        verify(menuRepository).findByAvailableTrue();
    }

    @Test
    void shouldCreateMenuItemSuccessfully() {
        // Given
        when(menuRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // When
        MenuItemResponse result = menuService.createMenuItem(menuItemRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Burger");
        assertThat(result.getPrice()).isEqualTo(10.99);
        assertThat(result.getAvailable()).isTrue();
        verify(menuRepository).save(any(MenuItem.class));
    }

    @Test
    void shouldGetMenuItemByIdSuccessfully() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));

        // When
        MenuItemResponse result = menuService.getMenuItemById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getName()).isEqualTo("Burger");
        verify(menuRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentMenuItem() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuService.getMenuItemById(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Plato no encontrado con el ID: 1");
    }

    @Test
    void shouldUpdatePriceSuccessfully() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // When
        MenuItemResponse result = menuService.updatePrice(1L, 15.99);

        // Then
        assertThat(result).isNotNull();
        verify(menuRepository).findById(1L);
        verify(menuRepository).save(any(MenuItem.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingPriceForNonExistentItem() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuService.updatePrice(1L, 15.99))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(menuRepository, never()).save(any(MenuItem.class));
    }

    @Test
    void shouldUpdateAvailabilitySuccessfully() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // When
        MenuItemResponse result = menuService.updateAvailability(1L, false);

        // Then
        assertThat(result).isNotNull();
        verify(menuRepository).findById(1L);
        verify(menuRepository).save(any(MenuItem.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingAvailabilityForNonExistentItem() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuService.updateAvailability(1L, false))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(menuRepository, never()).save(any(MenuItem.class));
    }

    @Test
    void shouldUpdateMenuItemSuccessfully() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.of(testMenuItem));
        when(menuRepository.save(any(MenuItem.class))).thenReturn(testMenuItem);

        // When
        MenuItemResponse result = menuService.updateMenuItem(1L, updateMenuItemRequest);

        // Then
        assertThat(result).isNotNull();
        verify(menuRepository).findById(1L);
        verify(menuRepository).save(any(MenuItem.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingNonExistentMenuItem() {
        // Given
        when(menuRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> menuService.updateMenuItem(1L, updateMenuItemRequest))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(menuRepository, never()).save(any(MenuItem.class));
    }

    @Test
    void shouldDeleteMenuItemSuccessfully() {
        // Given
        when(menuRepository.existsById(1L)).thenReturn(true);
        doNothing().when(menuItemIngredientService).deleteIngredientsByMenuItemId(1L);
        doNothing().when(menuRepository).deleteById(1L);

        // When
        menuService.deleteMenuItem(1L);

        // Then
        verify(menuRepository).existsById(1L);
        verify(menuItemIngredientService).deleteIngredientsByMenuItemId(1L);
        verify(menuRepository).deleteById(1L);
    }

    @Test
    void shouldThrowExceptionWhenDeletingNonExistentMenuItem() {
        // Given
        when(menuRepository.existsById(1L)).thenReturn(false);

        // When & Then
        assertThatThrownBy(() -> menuService.deleteMenuItem(1L))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(menuRepository, never()).deleteById(1L);
    }

    @Test
    void shouldGetAllMenuItemsSuccessfully() {
        // Given
        when(menuRepository.findAll()).thenReturn(Arrays.asList(testMenuItem));

        // When
        List<MenuItemResponse> result = menuService.getAllMenuItems();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(menuRepository).findAll();
    }

    @Test
    void shouldGetMenuItemsByCategorySuccessfully() {
        // Given
        when(menuRepository.findByCategory("Main Course")).thenReturn(Arrays.asList(testMenuItem));

        // When
        List<MenuItemResponse> result = menuService.getMenuItemsByCategory("Main Course");

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(menuRepository).findByCategory("Main Course");
    }

    @Test
    void shouldGetUnavailableItemsSuccessfully() {
        // Given
        testMenuItem.setAvailable(false);
        when(menuRepository.findByAvailableFalse()).thenReturn(Arrays.asList(testMenuItem));

        // When
        List<MenuItemResponse> result = menuService.getUnavailableItems();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(menuRepository).findByAvailableFalse();
    }

    @Test
    void shouldGetAllCategoriesSuccessfully() {
        // Given
        MenuItem secondItem = MenuItem.builder()
                .id(2L)
                .name("Pizza")
                .category("Main Course")
                .build();
        when(menuRepository.findAll()).thenReturn(Arrays.asList(testMenuItem, secondItem));

        // When
        List<String> result = menuService.getAllCategories();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).contains("Main Course");
        verify(menuRepository).findAll();
    }

    @Test
    void shouldGetCategoriesWithItemCountSuccessfully() {
        // Given
        MenuItem secondItem = MenuItem.builder()
                .id(2L)
                .name("Pizza")
                .category("Main Course")
                .build();
        when(menuRepository.findAll()).thenReturn(Arrays.asList(testMenuItem, secondItem));

        // When
        var result = menuService.getCategoriesWithItemCount();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).containsKey("Main Course");
        assertThat(result.get("Main Course")).isEqualTo(2);
        verify(menuRepository).findAll();
    }

    @Test
    void shouldGetPopularCategoriesSuccessfully() {
        // Given
        MenuItem secondItem = MenuItem.builder()
                .id(2L)
                .name("Pizza")
                .category("Main Course")
                .build();
        when(menuRepository.findAll()).thenReturn(Arrays.asList(testMenuItem, secondItem));

        // When
        List<String> result = menuService.getPopularCategories();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).contains("Main Course");
        verify(menuRepository).findAll();
    }

    @Test
    void shouldGetAllMenuItemsInternalSuccessfully() {
        // Given
        when(menuRepository.findAll()).thenReturn(Arrays.asList(testMenuItem));

        // When
        List<MenuItem> result = menuService.getAllMenuItemsInternal();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(menuRepository).findAll();
    }

    @Test
    void shouldValidateStockForMenuItemSuccessfully() {
        // Given
        when(menuItemIngredientService.hasSufficientStock(1L, 5)).thenReturn(true);

        // When
        boolean result = menuService.validateStockForMenuItem(1L, 5);

        // Then
        assertThat(result).isTrue();
        verify(menuItemIngredientService).hasSufficientStock(1L, 5);
    }

    @Test
    void shouldConsumeIngredientsForMenuItemSuccessfully() {
        // Given
        doNothing().when(menuItemIngredientService).consumeIngredientsForMenuItem(1L, 5);

        // When
        menuService.consumeIngredientsForMenuItem(1L, 5);

        // Then
        verify(menuItemIngredientService).consumeIngredientsForMenuItem(1L, 5);
    }
}
