package com.ms_inventario.inv.client;

import com.ms_inventario.inv.dto.StockAlertDTO;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.List;

@FeignClient(name = "notification-service", 
             url = "${services.notification-service.url}",
             configuration = com.ms_inventario.inv.config.FeignConfig.class,
             fallbackFactory = NotificationServiceClientFallbackFactory.class)
public interface NotificationServiceClient {
    
    @PostMapping("/alerts/stock")
    void sendStockAlert(@RequestBody StockAlertDTO alert);
    
    @PostMapping("/alerts/batch")
    void sendBatchStockAlerts(@RequestBody List<StockAlertDTO> alerts);
}
