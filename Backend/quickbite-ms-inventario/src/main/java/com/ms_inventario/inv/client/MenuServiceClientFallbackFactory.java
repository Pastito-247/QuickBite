package com.ms_inventario.inv.client;

import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

@Component
@Slf4j
public class MenuServiceClientFallbackFactory implements FallbackFactory<MenuServiceClient> {
    
    @Override
    public MenuServiceClient create(Throwable cause) {
        log.error("Menu service fallback activated due to: {}", cause.getMessage());
        
        return new MenuServiceClient() {
            @Override
            public void notifyIngredientOutOfStock(Long ingredientId) {
                log.warn("Fallback: Could not notify menu service about out-of-stock ingredient: {}. Status will be synced when service is available.", 
                        ingredientId);
            }
            
            @Override
            public void notifyIngredientAvailable(Long ingredientId) {
                log.warn("Fallback: Could not notify menu service about available ingredient: {}. Status will be synced when service is available.", 
                        ingredientId);
            }
        };
    }
}
