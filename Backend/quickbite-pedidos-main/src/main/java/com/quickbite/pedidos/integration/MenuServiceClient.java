package com.quickbite.pedidos.integration;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "menu-service", url = "${services.menu-service.url:http://localhost:8083}")
public interface MenuServiceClient {

    /**
     * Validar stock disponible para un menu item
     */
    @GetMapping("/api/menu/{id}/validate-stock")
    Map<String, Object> validateStock(
            @PathVariable("id") Long id,
            @RequestParam("quantity") Integer quantity
    );

    /**
     * Consumir ingredientes de un menu item
     */
    @PostMapping("/api/menu/{id}/consume-ingredients")
    Map<String, String> consumeIngredients(
            @PathVariable("id") Long id,
            @RequestParam("quantity") Integer quantity
    );

    @GetMapping("/api/restaurants/{id}")
    Map<String, Object> getRestaurantById(@PathVariable("id") Long id);

    @GetMapping("/api/restaurants")
    java.util.List<Map<String, Object>> getAllRestaurants();
}
