package com.ms_inventario.inv.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.ms_inventario.inv.dto.InventoryRequest;
import com.ms_inventario.inv.dto.InventoryResponse;
import com.ms_inventario.inv.dto.StockDeductionRequest;
import com.ms_inventario.inv.entity.Ingredient;
import com.ms_inventario.inv.entity.UnitType;
import com.ms_inventario.inv.exception.IngredientNotFoundException;
import com.ms_inventario.inv.service.InventoryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.PageRequest;
import org.springframework.http.MediaType;
import org.springframework.test.web.servlet.MockMvc;

import java.math.BigDecimal;
import java.util.Arrays;
import java.util.List;
import java.util.Map;

import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.doNothing;
import static org.mockito.Mockito.when;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(InventoryController.class)
class InventoryControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private InventoryService inventoryService;

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
    void shouldCreateIngredientSuccessfully() throws Exception {
        // Given
        when(inventoryService.createIngredient(any(InventoryRequest.class))).thenReturn(testIngredient);

        // When & Then
        mockMvc.perform(post("/api/inventory")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.name").value("Tomato"))
                .andExpect(jsonPath("$.currentStock").value(100));
    }

    @Test
    void shouldUpdateIngredientSuccessfully() throws Exception {
        // Given
        when(inventoryService.updateIngredient(eq(1L), any(InventoryRequest.class))).thenReturn(testIngredient);

        // When & Then
        mockMvc.perform(put("/api/inventory/1")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(testRequest)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tomato"));
    }

    @Test
    void shouldGetIngredientById() throws Exception {
        // Given
        when(inventoryService.getIngredient(1L)).thenReturn(java.util.Optional.of(testIngredient));

        // When & Then
        mockMvc.perform(get("/api/inventory/1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.name").value("Tomato"));
    }

    @Test
    void shouldReturnNotFoundWhenGettingNonExistentIngredient() throws Exception {
        // Given
        when(inventoryService.getIngredient(1L)).thenReturn(java.util.Optional.empty());

        // When & Then
        mockMvc.perform(get("/api/inventory/1"))
                .andExpect(status().isNotFound());
    }

    @Test
    void shouldGetAllActiveIngredients() throws Exception {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryService.getAllActiveIngredients()).thenReturn(ingredients);

        // When & Then
        mockMvc.perform(get("/api/inventory"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Tomato"));
    }

    @Test
    void shouldGetAllActiveIngredientsPaginated() throws Exception {
        // Given
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryService.getAllActiveIngredientsPaginated(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/inventory/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Tomato"));
    }

    @Test
    void shouldDeleteIngredientSuccessfully() throws Exception {
        // Given
        doNothing().when(inventoryService).deleteIngredient(1L);

        // When & Then
        mockMvc.perform(delete("/api/inventory/1"))
                .andExpect(status().isNoContent());
    }

    @Test
    void shouldDeductStockSuccessfully() throws Exception {
        // Given
        StockDeductionRequest request = new StockDeductionRequest();
        request.setOrderId("ORDER-123");
        request.setItems(List.of(
            new StockDeductionRequest.StockDeductionItem(1L, 10)
        ));

        doNothing().when(inventoryService).deductStock(any(StockDeductionRequest.class));

        // When & Then
        mockMvc.perform(post("/api/inventory/deduct-stock")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk());
    }

    @Test
    void shouldAddStockSuccessfully() throws Exception {
        // Given
        doNothing().when(inventoryService).addStock(eq(1L), eq(25), eq("Purchase from supplier"), eq("ADMIN"));

        // When & Then
        mockMvc.perform(post("/api/inventory/1/add-stock")
                .param("quantity", "25")
                .param("reason", "Purchase from supplier")
                .param("createdBy", "ADMIN"))
                .andExpect(status().isOk());
    }

    @Test
    void shouldGetCriticalStockIngredients() throws Exception {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryService.getCriticalStockIngredients()).thenReturn(ingredients);

        // When & Then
        mockMvc.perform(get("/api/inventory/critical-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Tomato"));
    }

    @Test
    void shouldGetCriticalStockIngredientsPaginated() throws Exception {
        // Given
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryService.getCriticalStockIngredientsPaginated(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/inventory/critical-stock/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Tomato"));
    }

    @Test
    void shouldGetOutOfStockIngredients() throws Exception {
        // Given
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryService.getOutOfStockIngredients()).thenReturn(ingredients);

        // When & Then
        mockMvc.perform(get("/api/inventory/out-of-stock"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Tomato"));
    }

    @Test
    void shouldGetOutOfStockIngredientsPaginated() throws Exception {
        // Given
        Page<Ingredient> page = new PageImpl<>(Arrays.asList(testIngredient));
        when(inventoryService.getOutOfStockIngredientsPaginated(any())).thenReturn(page);

        // When & Then
        mockMvc.perform(get("/api/inventory/out-of-stock/paginated")
                .param("page", "0")
                .param("size", "10"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.content").isArray())
                .andExpect(jsonPath("$.content[0].name").value("Tomato"));
    }

    @Test
    void shouldGetIngredientsByIds() throws Exception {
        // Given
        List<Long> ids = Arrays.asList(1L, 2L);
        List<Ingredient> ingredients = Arrays.asList(testIngredient);
        when(inventoryService.getIngredientsByIds(ids)).thenReturn(ingredients);

        // When & Then
        mockMvc.perform(post("/api/inventory/details")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(ids)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$").isArray())
                .andExpect(jsonPath("$[0].name").value("Tomato"));
    }

    @Test
    void shouldCheckMultipleIngredientsAvailability() throws Exception {
        // Given
        Map<Long, Integer> requirements = Map.of(1L, 50, 2L, 25);
        Map<Long, Boolean> availability = Map.of(1L, true, 2L, true);
        when(inventoryService.checkMultipleIngredientsAvailability(requirements)).thenReturn(availability);

        // When & Then
        mockMvc.perform(post("/api/inventory/check")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(requirements)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.1").value(true))
                .andExpect(jsonPath("$.2").value(true));
    }

    @Test
    void shouldAdjustStockSuccessfully() throws Exception {
        // Given
        doNothing().when(inventoryService).adjustStock(eq(1L), eq(150), eq("Manual adjustment"), eq("ADMIN"));

        // When & Then
        mockMvc.perform(post("/api/inventory/1/adjust-stock")
                .param("newStock", "150")
                .param("reason", "Manual adjustment")
                .param("createdBy", "ADMIN"))
                .andExpect(status().isOk());
    }
}
