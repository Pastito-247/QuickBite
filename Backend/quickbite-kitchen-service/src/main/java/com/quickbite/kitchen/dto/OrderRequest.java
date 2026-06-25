package com.quickbite.kitchen.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Min;
import java.util.List;

public class OrderRequest {
    
    @NotBlank(message = "El número de orden es requerido")
    private String orderNumber;
    
    @NotBlank(message = "El nombre del cliente es requerido")
    private String customerName;
    
    @NotEmpty(message = "La lista de items no puede estar vacía")
    private List<String> items;

    // Detalle opcional de los items (menuItemId y cantidad). Cuando se provee,
    // permite descontar ingredientes al pasar el pedido a preparación.
    private List<OrderItemRequest> orderItems;
    
    @NotNull(message = "El tiempo estimado de preparación es requerido")
    @Min(value = 1, message = "El tiempo estimado debe ser mayor a 0")
    private Integer estimatedPreparationTime;
    
    private String notes;
    
    public OrderRequest() {}
    
    public OrderRequest(String orderNumber, String customerName, List<String> items, Integer estimatedPreparationTime) {
        this.orderNumber = orderNumber;
        this.customerName = customerName;
        this.items = items;
        this.estimatedPreparationTime = estimatedPreparationTime;
    }
    
    // Getters and Setters
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
    
    public List<OrderItemRequest> getOrderItems() {
        return orderItems;
    }
    
    public void setOrderItems(List<OrderItemRequest> orderItems) {
        this.orderItems = orderItems;
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
