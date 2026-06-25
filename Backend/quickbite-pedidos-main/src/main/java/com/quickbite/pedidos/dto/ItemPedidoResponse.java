package com.quickbite.pedidos.dto;

import com.quickbite.pedidos.entity.ItemPedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ItemPedidoResponse {
    
    private Long id;
    private Long pedidoId;
    private Long productoId;
    private String nombreProducto;
    private String descripcionProducto;
    private Integer cantidad;
    private BigDecimal precioUnitario;
    private BigDecimal precioTotal;
    private String notasItem;
    
    public static ItemPedidoResponse fromEntity(ItemPedido item) {
        return ItemPedidoResponse.builder()
                .id(item.getId())
                .pedidoId(item.getPedido() != null ? item.getPedido().getId() : null)
                .productoId(item.getProductoId())
                .nombreProducto(item.getNombreProducto())
                .descripcionProducto(item.getDescripcionProducto())
                .cantidad(item.getCantidad())
                .precioUnitario(item.getPrecioUnitario())
                .precioTotal(item.getPrecioTotal())
                .notasItem(item.getNotasItem())
                .build();
    }
}
