package com.quickbite.kitchen.model;

public enum OrderStatus {
    RECIBIDO("Pedido recibido en cocina"),
    EN_PREPARACION("Pedido en preparación"),
    LISTO_ENTREGA("Pedido listo para entrega"),
    ENTREGADO("Pedido entregado"),
    CANCELADO("Pedido cancelado");
    
    private final String description;
    
    OrderStatus(String description) {
        this.description = description;
    }
    
    public String getDescription() {
        return description;
    }
}
