package com.quickbite.pedidos.integration;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@FeignClient(name = "kitchen-service", url = "${services.kitchen-service.url:http://localhost:8086}")
public interface KitchenServiceClient {

    /**
     * Actualizar el estado de una orden en cocina por número de pedido
     */
    @PutMapping("/orders/number/{orderNumber}/status")
    Map<String, Object> updateOrderStatus(
            @PathVariable("orderNumber") String orderNumber,
            @RequestParam("status") String status
    );
}
