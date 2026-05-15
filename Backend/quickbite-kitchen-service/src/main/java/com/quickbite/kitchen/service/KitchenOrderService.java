package com.quickbite.kitchen.service;

import com.quickbite.kitchen.dto.OrderRequest;
import com.quickbite.kitchen.dto.OrderResponse;
import com.quickbite.kitchen.exception.ResourceNotFoundException;
import com.quickbite.kitchen.exception.OrderAlreadyExistsException;
import com.quickbite.kitchen.model.KitchenOrder;
import com.quickbite.kitchen.model.OrderStatus;
import com.quickbite.kitchen.repository.KitchenOrderRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class KitchenOrderService {
    
    @Autowired
    private KitchenOrderRepository kitchenOrderRepository;
    
    @Autowired
    private NotificationService notificationService;
    
    public OrderResponse createOrder(OrderRequest orderRequest) {
        if (kitchenOrderRepository.existsByOrderNumber(orderRequest.getOrderNumber())) {
            throw new OrderAlreadyExistsException("Order with number " + orderRequest.getOrderNumber() + " already exists");
        }
        
        KitchenOrder kitchenOrder = new KitchenOrder(
            orderRequest.getOrderNumber(),
            orderRequest.getCustomerName(),
            orderRequest.getItems(),
            orderRequest.getEstimatedPreparationTime()
        );
        kitchenOrder.setNotes(orderRequest.getNotes());
        
        KitchenOrder savedOrder = kitchenOrderRepository.save(kitchenOrder);
        return convertToResponse(savedOrder);
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getActiveOrders() {
        List<KitchenOrder> activeOrders = kitchenOrderRepository.findActiveOrdersOrderByCreatedAt();
        return activeOrders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByStatus(OrderStatus status) {
        List<KitchenOrder> orders = kitchenOrderRepository.findByStatus(status);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderByOrderNumber(String orderNumber) {
        KitchenOrder order = kitchenOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        return convertToResponse(order);
    }
    
    @Transactional(readOnly = true)
    public OrderResponse getOrderById(Long id) {
        KitchenOrder order = kitchenOrderRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + id));
        return convertToResponse(order);
    }
    
    public OrderResponse updateOrderStatus(Long orderId, OrderStatus newStatus) {
        KitchenOrder order = kitchenOrderRepository.findById(orderId)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with id: " + orderId));
        
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        
        KitchenOrder updatedOrder = kitchenOrderRepository.save(order);
        
        // RF-11: Notificar automáticamente al servicio de delivery cuando el pedido está listo para entrega
        if (newStatus == OrderStatus.LISTO_ENTREGA) {
            notificationService.notifyDeliveryService(updatedOrder.getOrderNumber());
        }
        
        return convertToResponse(updatedOrder);
    }
    
    public OrderResponse updateOrderStatusByOrderNumber(String orderNumber, OrderStatus newStatus) {
        KitchenOrder order = kitchenOrderRepository.findByOrderNumber(orderNumber)
                .orElseThrow(() -> new ResourceNotFoundException("Order not found with number: " + orderNumber));
        
        OrderStatus previousStatus = order.getStatus();
        order.setStatus(newStatus);
        
        KitchenOrder updatedOrder = kitchenOrderRepository.save(order);
        
        // RF-11: Notificar automáticamente al servicio de delivery cuando el pedido está listo para entrega
        if (newStatus == OrderStatus.LISTO_ENTREGA) {
            notificationService.notifyDeliveryService(updatedOrder.getOrderNumber());
        }
        
        return convertToResponse(updatedOrder);
    }
    
    @Transactional(readOnly = true)
    public List<OrderResponse> getOrdersByDateRange(LocalDateTime startDate, LocalDateTime endDate) {
        List<KitchenOrder> orders = kitchenOrderRepository.findByCreatedAtBetween(startDate, endDate);
        return orders.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Long getOrderCountByStatus(OrderStatus status, LocalDateTime since) {
        return kitchenOrderRepository.countByStatusAndCreatedAtAfter(status, since);
    }
    
    private OrderResponse convertToResponse(KitchenOrder order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerName(order.getCustomerName());
        response.setItems(order.getItems());
        response.setStatus(order.getStatus());
        response.setCreatedAt(order.getCreatedAt());
        response.setStartedAt(order.getStartedAt());
        response.setReadyAt(order.getReadyAt());
        response.setDeliveredAt(order.getDeliveredAt());
        response.setEstimatedPreparationTime(order.getEstimatedPreparationTime());
        response.setNotes(order.getNotes());
        return response;
    }
}
