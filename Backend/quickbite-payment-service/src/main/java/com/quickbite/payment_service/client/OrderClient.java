package com.quickbite.payment_service.client;

import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;

import java.util.Map;

@FeignClient(name = "order-service", url = "${services.order-service.url:http://localhost:8084}")
public interface OrderClient {

    @GetMapping("/api/v1/pedidos/{orderId}")
    Map<String, Object> getOrderById(@PathVariable String orderId);

    /**
     * Actualiza el estado de un pedido. Body: { "estado": "CONFIRMADO" }
     */
    @PutMapping("/api/v1/pedidos/numero/{numeroPedido}/estado")
    Map<String, Object> updateOrderStatus(@PathVariable String numeroPedido, @RequestBody Map<String, Object> statusUpdate);

    @GetMapping("/api/v1/pedidos/cliente/{userId}")
    Map<String, Object>[] getOrdersByCustomer(@PathVariable String userId);
}
