package com.quickbite.menu_service.controller;

import com.quickbite.menu_service.dto.MenuItemIngredientRequest;
import com.quickbite.menu_service.dto.MenuItemIngredientResponse;
import com.quickbite.menu_service.service.MenuItemIngredientService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/admin/menu-ingredients")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class MenuItemIngredientController {

    private final MenuItemIngredientService menuItemIngredientService;

    /**
     * Agregar un ingrediente a un menu item
     * POST /api/admin/menu-ingredients/{menuItemId}
     */
    @PostMapping("/{menuItemId}")
    @ResponseStatus(HttpStatus.CREATED)
    public MenuItemIngredientResponse addIngredient(
            @PathVariable Long menuItemId,
            @Valid @RequestBody MenuItemIngredientRequest request) {
        log.info("POST /api/admin/menu-ingredients/{} - Agregando ingrediente", menuItemId);
        return menuItemIngredientService.addIngredientToMenuItem(menuItemId, request);
    }

    /**
     * Obtener todos los ingredientes de un menu item
     * GET /api/admin/menu-ingredients/{menuItemId}
     */
    @GetMapping("/{menuItemId}")
    public List<MenuItemIngredientResponse> getIngredients(@PathVariable Long menuItemId) {
        log.info("GET /api/admin/menu-ingredients/{} - Obteniendo ingredientes", menuItemId);
        return menuItemIngredientService.getIngredientsByMenuItem(menuItemId);
    }

    /**
     * Reemplazar todos los ingredientes de un menu item
     * PUT /api/admin/menu-ingredients/{menuItemId}
     */
    @PutMapping("/{menuItemId}")
    public List<MenuItemIngredientResponse> replaceIngredients(
            @PathVariable Long menuItemId,
            @Valid @RequestBody List<MenuItemIngredientRequest> requests) {
        log.info("PUT /api/admin/menu-ingredients/{} - Reemplazando ingredientes", menuItemId);
        return menuItemIngredientService.replaceIngredientsForMenuItem(menuItemId, requests);
    }

    /**
     * Actualizar un ingrediente específico de un menu item
     * PATCH /api/admin/menu-ingredients/{menuItemId}/{ingredientId}
     */
    @PatchMapping("/{menuItemId}/{ingredientId}")
    public MenuItemIngredientResponse updateIngredient(
            @PathVariable Long menuItemId,
            @PathVariable Long ingredientId,
            @Valid @RequestBody MenuItemIngredientRequest request) {
        log.info("PATCH /api/admin/menu-ingredients/{}/{} - Actualizando ingrediente", menuItemId, ingredientId);
        return menuItemIngredientService.updateIngredientInMenuItem(menuItemId, ingredientId, request);
    }

    /**
     * Eliminar un ingrediente de un menu item
     * DELETE /api/admin/menu-ingredients/{menuItemId}/{ingredientId}
     */
    @DeleteMapping("/{menuItemId}/{ingredientId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void removeIngredient(
            @PathVariable Long menuItemId,
            @PathVariable Long ingredientId) {
        log.info("DELETE /api/admin/menu-ingredients/{}/{} - Eliminando ingrediente", menuItemId, ingredientId);
        menuItemIngredientService.removeIngredientFromMenuItem(menuItemId, ingredientId);
    }
}
