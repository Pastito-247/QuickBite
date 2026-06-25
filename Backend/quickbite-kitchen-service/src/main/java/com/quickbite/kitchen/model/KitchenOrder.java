package com.quickbite.kitchen.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;
import java.util.List;

@Entity
@Table(name = "kitchen_orders")
public class KitchenOrder {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false, unique = true)
    private String orderNumber;
    
    @Column(nullable = false)
    private String customerName;
    
    @ElementCollection
    @CollectionTable(name = "order_items", joinColumns = @JoinColumn(name = "order_id"))
    @Column(name = "item_description")
    private List<String> items;

    // Detalle estructurado de los items (menuItemId y cantidad) usado para
    // descontar ingredientes en el servicio de menú cuando el pedido pasa a preparación
    @ElementCollection
    @CollectionTable(name = "kitchen_order_details", joinColumns = @JoinColumn(name = "order_id"))
    private List<OrderItem> orderItems;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private OrderStatus status;
    
    @Column(nullable = false)
    private LocalDateTime createdAt;
    
    private LocalDateTime startedAt;
    private LocalDateTime readyAt;
    private LocalDateTime deliveredAt;
    
    @Column(nullable = false)
    private Integer estimatedPreparationTime; // in minutes
    
    private String notes;
    
    public KitchenOrder() {
        this.createdAt = LocalDateTime.now();
        this.status = OrderStatus.RECIBIDO;
    }
    
    public KitchenOrder(String orderNumber, String customerName, List<String> items, Integer estimatedPreparationTime) {
        this();
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.items = items;
        this.estimatedPreparationTime = estimatedPreparationTime;
    }
    
    @PreUpdate
    public void preUpdate() {
        if (status == OrderStatus.EN_PREPARACION && startedAt == null) {
            startedAt = LocalDateTime.now();
        }
        if (status == OrderStatus.LISTO_ENTREGA && readyAt == null) {
            readyAt = LocalDateTime.now();
        }
        if (status == OrderStatus.ENTREGADO && deliveredAt == null) {
            deliveredAt = LocalDateTime.now();
        }
    }
    
    // Getters and Setters
    public Long getId() {
        return id;
    }
    
    public void setId(Long id) {
        this.id = id;
    }
    
    public String getOrderNumber() {
        return orderNumber;
    }
    
    public void setOrderNumber(String orderNumber) {
        this.orderNumber = orderNumber;
    }
    
    public String getCustomerName() {
        return customerName;
    }
    
    public void setCustomerName(String customerName) {
        this.customerName = customerName;
    }
    
    public List<String> getItems() {
        return items;
    }
    
    public void setItems(List<String> items) {
        this.items = items;
    }

    public List<OrderItem> getOrderItems() {
        return orderItems;
    }

    public void setOrderItems(List<OrderItem> orderItems) {
        this.orderItems = orderItems;
    }
    
    public OrderStatus getStatus() {
        return status;
    }
    
    public void setStatus(OrderStatus status) {
        this.status = status;
    }
    
    public LocalDateTime getCreatedAt() {
        return createdAt;
    }
    
    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
    
    public LocalDateTime getStartedAt() {
        return startedAt;
    }
    
    public void setStartedAt(LocalDateTime startedAt) {
        this.startedAt = startedAt;
    }
    
    public LocalDateTime getReadyAt() {
        return readyAt;
    }
    
    public void setReadyAt(LocalDateTime readyAt) {
        this.readyAt = readyAt;
    }
    
    public LocalDateTime getDeliveredAt() {
        return deliveredAt;
    }
    
    public void setDeliveredAt(LocalDateTime deliveredAt) {
        this.deliveredAt = deliveredAt;
    }
    
    public Integer getEstimatedPreparationTime() {
        return estimatedPreparationTime;
    }
    
    public void setEstimatedPreparationTime(Integer estimatedPreparationTime) {
        this.estimatedPreparationTime = estimatedPreparationTime;
    }
    
    public String getNotes() {
        return notes;
    }
    
    public void setNotes(String notes) {
        this.notes = notes;
    }
}
