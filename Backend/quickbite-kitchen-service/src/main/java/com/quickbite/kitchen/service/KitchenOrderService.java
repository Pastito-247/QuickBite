package com.quickbite.kitchen.service;

import com.quickbite.kitchen.dto.OrderItemRequest;
import com.quickbite.kitchen.dto.OrderItemResponse;
import com.quickbite.kitchen.dto.OrderRequest;
import com.quickbite.kitchen.dto.OrderResponse;
import com.quickbite.kitchen.exception.ResourceNotFoundException;
import com.quickbite.kitchen.exception.OrderAlreadyExistsException;
import com.quickbite.kitchen.integration.MenuServiceClient;
import com.quickbite.kitchen.model.KitchenOrder;
import com.quickbite.kitchen.model.OrderItem;
import com.quickbite.kitchen.model.OrderStatus;
import com.quickbite.kitchen.repository.KitchenOrderRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class KitchenOrderService {

    private static final Logger logger = LoggerFactory.getLogger(KitchenOrderService.class);
    
    @Autowired
    private KitchenOrderRepository kitchenOrderRepository;
    
    @Autowired
    private NotificationService notificationService;

    @Autowired
    private MenuServiceClient menuServiceClient;
    
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
        kitchenOrder.setOrderItems(toOrderItems(orderRequest.getOrderItems()));
        
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

        // Descontar ingredientes del inventario cuando el pedido entra a preparación
        discountIngredientsIfEnteringPreparation(updatedOrder, previousStatus, newStatus);
        
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

        // Descontar ingredientes del inventario cuando el pedido entra a preparación
        discountIngredientsIfEnteringPreparation(updatedOrder, previousStatus, newStatus);
        
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
    
    /**
     * Descuenta los ingredientes en el servicio de menú cuando el pedido entra
     * a preparación. Solo se ejecuta en la transición hacia EN_PREPARACION para
     * evitar descontar ingredientes más de una vez por el mismo pedido.
     */
    private void discountIngredientsIfEnteringPreparation(KitchenOrder order, OrderStatus previousStatus, OrderStatus newStatus) {
        if (newStatus != OrderStatus.EN_PREPARACION || previousStatus == OrderStatus.EN_PREPARACION) {
            return;
        }

        List<OrderItem> orderItems = order.getOrderItems();
        if (orderItems == null || orderItems.isEmpty()) {
            logger.warn("Pedido {} pasa a preparación sin detalle de items; no se descuentan ingredientes",
                    order.getOrderNumber());
            return;
        }

        for (OrderItem item : orderItems) {
            if (item.getMenuItemId() == null || item.getQuantity() == null) {
                continue;
            }
            try {
                menuServiceClient.consumeIngredients(item.getMenuItemId(), item.getQuantity());
                logger.info("Ingredientes descontados para menu item {} (cantidad {}) del pedido {}",
                        item.getMenuItemId(), item.getQuantity(), order.getOrderNumber());
            } catch (Exception e) {
                logger.error("No se pudieron descontar los ingredientes del menu item {} para el pedido {}: {}",
                        item.getMenuItemId(), order.getOrderNumber(), e.getMessage());
            }
        }
    }

    private List<OrderItem> toOrderItems(List<OrderItemRequest> requests) {
        if (requests == null) {
            return null;
        }
        return requests.stream()
                .map(req -> new OrderItem(req.getMenuItemId(), req.getItemName(), req.getQuantity()))
                .collect(Collectors.toList());
    }

    private List<OrderItemResponse> toOrderItemResponses(List<OrderItem> orderItems) {
        if (orderItems == null) {
            return null;
        }
        return orderItems.stream()
                .map(item -> new OrderItemResponse(item.getMenuItemId(), item.getItemName(), item.getQuantity()))
                .collect(Collectors.toList());
    }

    private OrderResponse convertToResponse(KitchenOrder order) {
        OrderResponse response = new OrderResponse();
        response.setId(order.getId());
        response.setOrderNumber(order.getOrderNumber());
        response.setCustomerName(order.getCustomerName());
        response.setItems(order.getItems());
        response.setOrderItems(toOrderItemResponses(order.getOrderItems()));
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
