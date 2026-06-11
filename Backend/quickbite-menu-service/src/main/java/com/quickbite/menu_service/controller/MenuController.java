package com.quickbite.menu_service.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import com.quickbite.menu_service.dto.MenuItemRequest;
import com.quickbite.menu_service.dto.MenuItemResponse;
import com.quickbite.menu_service.entity.MenuItem;
import com.quickbite.menu_service.service.MenuService;

import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/menu")
@RequiredArgsConstructor
@CrossOrigin(origins = "*")
public class MenuController {

private final MenuService menuService;

    @GetMapping
    public List<MenuItemResponse> showMenu() {
        return menuService.getAvailableMenu();
    }

    @GetMapping("/{id}")
    public MenuItemResponse getMenuById(@PathVariable Long id) {
        return menuService.getMenuItemById(id);
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemResponse addMenuItem(@Valid @RequestBody MenuItemRequest request) {
        return menuService.createMenuItem(request);
    }

    /**
     * Validar stock disponible para un menu item
     * GET /api/menu/{id}/validate-stock?quantity=1
     */
    @GetMapping("/{id}/validate-stock")
    public Map<String, Object> validateStock(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer quantity) {
        boolean hasStock = menuService.validateStockForMenuItem(id, quantity);
        return Map.of(
            "menuItemId", id,
            "quantity", quantity,
            "hasSufficientStock", hasStock
        );
    }

    /**
     * Consumir ingredientes de un menu item (llamado por servicio de pedidos)
     * POST /api/menu/{id}/consume-ingredients
     */
    @PostMapping("/{id}/consume-ingredients")
    @ResponseStatus(HttpStatus.OK)
    public Map<String, String> consumeIngredients(
            @PathVariable Long id,
            @RequestParam(defaultValue = "1") Integer quantity) {
        menuService.consumeIngredientsForMenuItem(id, quantity);
        return Map.of("message", "Ingredientes consumidos exitosamente");
    }
}
