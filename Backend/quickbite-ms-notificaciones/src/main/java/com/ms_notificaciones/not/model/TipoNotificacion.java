package com.ms_notificaciones.not.model;

public enum TipoNotificacion {
    INVENTARIO_CRITICO("INVENTARIO_CRITICO", "Alerta de inventario crítico"),
    PEDIDO_LISTO("PEDIDO_LISTO", "Pedido listo para entrega"),
    PEDIDO_RECIBIDO("PEDIDO_RECIBIDO", "Pedido recibido en cocina"),
    PEDIDO_PREPARACION("PEDIDO_PREPARACION", "Pedido en preparación"),
    PEDIDO_ENTREGADO("PEDIDO_ENTREGADO", "Pedido entregado");

    private final String codigo;
    private final String descripcion;

    TipoNotificacion(String codigo, String descripcion) {
        this.codigo = codigo;
        this.descripcion = descripcion;
    }

    public String getCodigo() { return codigo; }
    public String getDescripcion() { return descripcion; }
}
