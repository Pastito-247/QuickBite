package com.quickbite.kitchen.controller;

import com.quickbite.kitchen.dto.OrderRequest;
import com.quickbite.kitchen.dto.OrderResponse;
import com.quickbite.kitchen.model.OrderStatus;
import com.quickbite.kitchen.service.KitchenOrderService;
import com.quickbite.kitchen.service.NotificationService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/orders")
@CrossOrigin(origins = "*")
public class KitchenOrderController {
    
    @Autowired
    private KitchenOrderService kitchenOrderService;
    
    @Autowired
    private NotificationService notificationService;
    
    // RF-9: Visualización de comandas en pantallas de cocina organizadas
    @GetMapping
    public ResponseEntity<List<OrderResponse>> getActiveOrders() {
        List<OrderResponse> orders = kitchenOrderService.getActiveOrders();
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/status/{status}")
    public ResponseEntity<List<OrderResponse>> getOrdersByStatus(@PathVariable OrderStatus status) {
        List<OrderResponse> orders = kitchenOrderService.getOrdersByStatus(status);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/number/{orderNumber}")
    public ResponseEntity<OrderResponse> getOrderByOrderNumber(@PathVariable String orderNumber) {
        OrderResponse order = kitchenOrderService.getOrderByOrderNumber(orderNumber);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<OrderResponse> getOrderById(@PathVariable Long id) {
        OrderResponse order = kitchenOrderService.getOrderById(id);
        return ResponseEntity.ok(order);
    }
    
    @GetMapping("/date-range")
    public ResponseEntity<List<OrderResponse>> getOrdersByDateRange(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<OrderResponse> orders = kitchenOrderService.getOrdersByDateRange(startDate, endDate);
        return ResponseEntity.ok(orders);
    }
    
    @GetMapping("/count/{status}")
    public ResponseEntity<Long> getOrderCountByStatus(
            @PathVariable OrderStatus status,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime since) {
        Long count = kitchenOrderService.getOrderCountByStatus(status, since);
        return ResponseEntity.ok(count);
    }
    
    @PostMapping
    public ResponseEntity<OrderResponse> createOrder(@Valid @RequestBody OrderRequest orderRequest) {
        OrderResponse createdOrder = kitchenOrderService.createOrder(orderRequest);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdOrder);
    }
    
    // RF-10: Gestión de estados de pedidos
    @PutMapping("/{id}/status")
    public ResponseEntity<OrderResponse> updateOrderStatus(
            @PathVariable Long id,
            @RequestParam OrderStatus status) {
        OrderResponse updatedOrder = kitchenOrderService.updateOrderStatus(id, status);
        return ResponseEntity.ok(updatedOrder);
    }
    
    @PutMapping("/number/{orderNumber}/status")
    public ResponseEntity<OrderResponse> updateOrderStatusByOrderNumber(
            @PathVariable String orderNumber,
            @RequestParam OrderStatus status) {
        OrderResponse updatedOrder = kitchenOrderService.updateOrderStatusByOrderNumber(orderNumber, status);
        return ResponseEntity.ok(updatedOrder);
    }
    
    // RF-11: Notificación automática al personal de entrega
    @PostMapping("/{id}/notify")
    public ResponseEntity<String> notifyDeliveryService(@PathVariable Long id) {
        OrderResponse order = kitchenOrderService.getOrderById(id);
        notificationService.notifyDeliveryService(order.getOrderNumber());
        return ResponseEntity.ok("Notification sent to delivery service for order: " + order.getOrderNumber());
    }
    
    @PostMapping("/number/{orderNumber}/notify")
    public ResponseEntity<String> notifyDeliveryServiceByOrderNumber(@PathVariable String orderNumber) {
        notificationService.notifyDeliveryService(orderNumber);
        return ResponseEntity.ok("Notification sent to delivery service for order: " + orderNumber);
    }
    
    @GetMapping("/delivery-service/status")
    public ResponseEntity<Boolean> checkDeliveryServiceAvailability() {
        boolean isAvailable = notificationService.isDeliveryServiceAvailable();
        return ResponseEntity.ok(isAvailable);
    }
}
