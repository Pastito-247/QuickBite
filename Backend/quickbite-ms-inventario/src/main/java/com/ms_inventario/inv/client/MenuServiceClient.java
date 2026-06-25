package com.ms_inventario.inv.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;

@FeignClient(name = "menu-service", 
             url = "${services.menu-service.url}",
             configuration = com.ms_inventario.inv.config.FeignConfig.class,
             fallbackFactory = MenuServiceClientFallbackFactory.class)
public interface MenuServiceClient {
    
    @PostMapping("/ingredients/{ingredientId}/out-of-stock")
    void notifyIngredientOutOfStock(@PathVariable Long ingredientId);
    
    @PostMapping("/ingredients/{ingredientId}/available")
    void notifyIngredientAvailable(@PathVariable Long ingredientId);
}
