package com.quickbite.menu_service.controller;

import com.quickbite.menu_service.service.MenuItemIngredientService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * Endpoints invocados por el servicio de inventario para notificar cambios
 * de disponibilidad de ingredientes. Cuando un ingrediente queda sin stock
 * o vuelve a estar disponible, estos endpoints actualizan la disponibilidad
 * de los menu items afectados.
 */
@RestController
@RequestMapping("/ingredients")
@RequiredArgsConstructor
@Slf4j
public class IngredientAvailabilityController {

    private final MenuItemIngredientService menuItemIngredientService;

    @PostMapping("/{ingredientId}/out-of-stock")
    public ResponseEntity<Void> ingredientOutOfStock(@PathVariable Long ingredientId) {
        log.info("Notificación de inventario: ingrediente {} sin stock", ingredientId);
        menuItemIngredientService.markMenuItemsUnavailableByIngredient(ingredientId);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{ingredientId}/available")
    public ResponseEntity<Void> ingredientAvailable(@PathVariable Long ingredientId) {
        log.info("Notificación de inventario: ingrediente {} disponible nuevamente", ingredientId);
        menuItemIngredientService.markMenuItemsAvailableByIngredient(ingredientId);
        return ResponseEntity.ok().build();
    }
}
