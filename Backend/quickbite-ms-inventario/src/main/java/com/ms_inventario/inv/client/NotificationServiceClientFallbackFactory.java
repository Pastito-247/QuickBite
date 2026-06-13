package com.ms_inventario.inv.client;

import com.ms_inventario.inv.dto.StockAlertDTO;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cloud.openfeign.FallbackFactory;
import org.springframework.stereotype.Component;

import java.util.List;

@Component
@Slf4j
public class NotificationServiceClientFallbackFactory implements FallbackFactory<NotificationServiceClient> {
    
    @Override
    public NotificationServiceClient create(Throwable cause) {
        log.error("Notification service fallback activated due to: {}", cause.getMessage());
        
        return new NotificationServiceClient() {
            @Override
            public void sendStockAlert(String idIngrediente, Long idRestaurante,
                                       String nombreIngrediente, Integer stockActual, Integer stockMinimo) {
                log.warn("Fallback: Could not send stock alert for ingredient: {}. Alert logged locally.",
                        nombreIngrediente);
            }
            
            @Override
            public void sendBatchStockAlerts(List<StockAlertDTO> alerts) {
                log.warn("Fallback: Could not send batch stock alerts. {} alerts logged locally.", alerts.size());
            }
        };
    }
}
