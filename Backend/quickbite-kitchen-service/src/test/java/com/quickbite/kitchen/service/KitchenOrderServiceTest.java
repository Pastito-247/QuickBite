package com.quickbite.kitchen.service;

import com.quickbite.kitchen.dto.OrderItemRequest;
import com.quickbite.kitchen.dto.OrderRequest;
import com.quickbite.kitchen.dto.OrderResponse;
import com.quickbite.kitchen.exception.OrderAlreadyExistsException;
import com.quickbite.kitchen.exception.ResourceNotFoundException;
import com.quickbite.kitchen.integration.MenuServiceClient;
import com.quickbite.kitchen.model.KitchenOrder;
import com.quickbite.kitchen.model.OrderItem;
import com.quickbite.kitchen.model.OrderStatus;
import com.quickbite.kitchen.repository.KitchenOrderRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;
import static org.assertj.core.api.Assertions.assertThatThrownBy;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class KitchenOrderServiceTest {

    @Mock
    private KitchenOrderRepository kitchenOrderRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private MenuServiceClient menuServiceClient;

    @InjectMocks
    private KitchenOrderService kitchenOrderService;

    private KitchenOrder testOrder;
    private OrderRequest orderRequest;
    private OrderItemRequest orderItemRequest;

    @BeforeEach
    void setUp() {
        orderItemRequest = new OrderItemRequest();
        orderItemRequest.setMenuItemId(1L);
        orderItemRequest.setItemName("Burger");
        orderItemRequest.setQuantity(2);

        orderRequest = new OrderRequest();
        orderRequest.setOrderNumber("ORD-001");
        orderRequest.setCustomerName("John Doe");
        orderRequest.setItems(Arrays.asList("Burger", "Fries"));
        orderRequest.setEstimatedPreparationTime(30);
        orderRequest.setNotes("No onions");
        orderRequest.setOrderItems(Arrays.asList(orderItemRequest));

        testOrder = new KitchenOrder();
        testOrder.setId(1L);
        testOrder.setOrderNumber("ORD-001");
        testOrder.setCustomerName("John Doe");
        testOrder.setItems(Arrays.asList("Burger", "Fries"));
        testOrder.setStatus(OrderStatus.RECIBIDO);
        testOrder.setEstimatedPreparationTime(30);
        testOrder.setNotes("No onions");
        testOrder.setCreatedAt(LocalDateTime.now());
    }

    @Test
    void shouldCreateOrderSuccessfully() {
        // Given
        when(kitchenOrderRepository.existsByOrderNumber("ORD-001")).thenReturn(false);
        when(kitchenOrderRepository.save(any(KitchenOrder.class))).thenReturn(testOrder);

        // When
        OrderResponse result = kitchenOrderService.createOrder(orderRequest);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderNumber()).isEqualTo("ORD-001");
        verify(kitchenOrderRepository).existsByOrderNumber("ORD-001");
        verify(kitchenOrderRepository).save(any(KitchenOrder.class));
    }

    @Test
    void shouldThrowExceptionWhenCreatingOrderWithDuplicateNumber() {
        // Given
        when(kitchenOrderRepository.existsByOrderNumber("ORD-001")).thenReturn(true);

        // When & Then
        assertThatThrownBy(() -> kitchenOrderService.createOrder(orderRequest))
            .isInstanceOf(OrderAlreadyExistsException.class)
            .hasMessageContaining("Order with number ORD-001 already exists");
        verify(kitchenOrderRepository, never()).save(any(KitchenOrder.class));
    }

    @Test
    void shouldGetActiveOrdersSuccessfully() {
        // Given
        when(kitchenOrderRepository.findActiveOrdersOrderByCreatedAt()).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderResponse> result = kitchenOrderService.getActiveOrders();

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(kitchenOrderRepository).findActiveOrdersOrderByCreatedAt();
    }

    @Test
    void shouldGetOrdersByStatusSuccessfully() {
        // Given
        when(kitchenOrderRepository.findByStatus(OrderStatus.RECIBIDO)).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderResponse> result = kitchenOrderService.getOrdersByStatus(OrderStatus.RECIBIDO);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(kitchenOrderRepository).findByStatus(OrderStatus.RECIBIDO);
    }

    @Test
    void shouldGetOrderByOrderNumberSuccessfully() {
        // Given
        when(kitchenOrderRepository.findByOrderNumber("ORD-001")).thenReturn(Optional.of(testOrder));

        // When
        OrderResponse result = kitchenOrderService.getOrderByOrderNumber("ORD-001");

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getOrderNumber()).isEqualTo("ORD-001");
        verify(kitchenOrderRepository).findByOrderNumber("ORD-001");
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentOrderByNumber() {
        // Given
        when(kitchenOrderRepository.findByOrderNumber("ORD-001")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> kitchenOrderService.getOrderByOrderNumber("ORD-001"))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Order not found with number: ORD-001");
    }

    @Test
    void shouldGetOrderByIdSuccessfully() {
        // Given
        when(kitchenOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));

        // When
        OrderResponse result = kitchenOrderService.getOrderById(1L);

        // Then
        assertThat(result).isNotNull();
        assertThat(result.getId()).isEqualTo(1L);
        verify(kitchenOrderRepository).findById(1L);
    }

    @Test
    void shouldThrowExceptionWhenGettingNonExistentOrderById() {
        // Given
        when(kitchenOrderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> kitchenOrderService.getOrderById(1L))
            .isInstanceOf(ResourceNotFoundException.class)
            .hasMessageContaining("Order not found with id: 1");
    }

    @Test
    void shouldUpdateOrderStatusSuccessfully() {
        // Given
        when(kitchenOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(kitchenOrderRepository.save(any(KitchenOrder.class))).thenReturn(testOrder);

        // When
        OrderResponse result = kitchenOrderService.updateOrderStatus(1L, OrderStatus.EN_PREPARACION);

        // Then
        assertThat(result).isNotNull();
        verify(kitchenOrderRepository).findById(1L);
        verify(kitchenOrderRepository).save(any(KitchenOrder.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingStatusForNonExistentOrder() {
        // Given
        when(kitchenOrderRepository.findById(1L)).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> kitchenOrderService.updateOrderStatus(1L, OrderStatus.EN_PREPARACION))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(kitchenOrderRepository, never()).save(any(KitchenOrder.class));
    }

    @Test
    void shouldNotifyDeliveryServiceWhenOrderIsReady() {
        // Given
        when(kitchenOrderRepository.findById(1L)).thenReturn(Optional.of(testOrder));
        when(kitchenOrderRepository.save(any(KitchenOrder.class))).thenReturn(testOrder);
        doNothing().when(notificationService).notifyDeliveryService(anyString());

        // When
        OrderResponse result = kitchenOrderService.updateOrderStatus(1L, OrderStatus.LISTO_ENTREGA);

        // Then
        assertThat(result).isNotNull();
        verify(kitchenOrderRepository).findById(1L);
        verify(kitchenOrderRepository).save(any(KitchenOrder.class));
        verify(notificationService).notifyDeliveryService("ORD-001");
    }

    @Test
    void shouldUpdateOrderStatusByOrderNumberSuccessfully() {
        // Given
        when(kitchenOrderRepository.findByOrderNumber("ORD-001")).thenReturn(Optional.of(testOrder));
        when(kitchenOrderRepository.save(any(KitchenOrder.class))).thenReturn(testOrder);

        // When
        OrderResponse result = kitchenOrderService.updateOrderStatusByOrderNumber("ORD-001", OrderStatus.EN_PREPARACION);

        // Then
        assertThat(result).isNotNull();
        verify(kitchenOrderRepository).findByOrderNumber("ORD-001");
        verify(kitchenOrderRepository).save(any(KitchenOrder.class));
    }

    @Test
    void shouldThrowExceptionWhenUpdatingStatusByOrderNumberForNonExistentOrder() {
        // Given
        when(kitchenOrderRepository.findByOrderNumber("ORD-001")).thenReturn(Optional.empty());

        // When & Then
        assertThatThrownBy(() -> kitchenOrderService.updateOrderStatusByOrderNumber("ORD-001", OrderStatus.EN_PREPARACION))
            .isInstanceOf(ResourceNotFoundException.class);
        verify(kitchenOrderRepository, never()).save(any(KitchenOrder.class));
    }

    @Test
    void shouldGetOrdersByDateRangeSuccessfully() {
        // Given
        LocalDateTime startDate = LocalDateTime.now().minusDays(1);
        LocalDateTime endDate = LocalDateTime.now();
        when(kitchenOrderRepository.findByCreatedAtBetween(startDate, endDate)).thenReturn(Arrays.asList(testOrder));

        // When
        List<OrderResponse> result = kitchenOrderService.getOrdersByDateRange(startDate, endDate);

        // Then
        assertThat(result).isNotNull();
        assertThat(result).hasSize(1);
        verify(kitchenOrderRepository).findByCreatedAtBetween(startDate, endDate);
    }

    @Test
    void shouldGetOrderCountByStatusSuccessfully() {
        // Given
        LocalDateTime since = LocalDateTime.now().minusDays(1);
        when(kitchenOrderRepository.countByStatusAndCreatedAtAfter(OrderStatus.RECIBIDO, since)).thenReturn(10L);

        // When
        Long result = kitchenOrderService.getOrderCountByStatus(OrderStatus.RECIBIDO, since);

        // Then
        assertThat(result).isEqualTo(10L);
        verify(kitchenOrderRepository).countByStatusAndCreatedAtAfter(OrderStatus.RECIBIDO, since);
    }
}
