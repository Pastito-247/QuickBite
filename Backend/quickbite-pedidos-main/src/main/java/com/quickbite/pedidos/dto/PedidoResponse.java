package com.quickbite.pedidos.dto;

import com.quickbite.pedidos.entity.Pedido;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoResponse {
    
    private Long id;
    private String numeroPedido;
    private Long clienteId;
    private String nombreCliente;
    private String emailCliente;
    private String telefonoCliente;
    private String direccionEntrega;
    private Pedido.EstadoPedido estado;
    private Pedido.MetodoPago metodoPago;
    private BigDecimal subtotal;
    private BigDecimal impuesto;
    private BigDecimal total;
    private BigDecimal costoEnvio;
    private String notasCliente;
    private String notasRestaurante;
    private Integer tiempoEstimadoMinutos;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaActualizacion;
    private LocalDateTime fechaEntrega;
    private List<ItemPedidoResponse> items;
    
    public static PedidoResponse fromEntity(Pedido pedido) {
        return PedidoResponse.builder()
                .id(pedido.getId())
                .numeroPedido(pedido.getNumeroPedido())
                .clienteId(pedido.getClienteId())
                .nombreCliente(pedido.getNombreCliente())
                .emailCliente(pedido.getEmailCliente())
                .telefonoCliente(pedido.getTelefonoCliente())
                .direccionEntrega(pedido.getDireccionEntrega())
                .estado(pedido.getEstado())
                .metodoPago(pedido.getMetodoPago())
                .subtotal(pedido.getSubtotal())
                .impuesto(pedido.getImpuesto())
                .total(pedido.getTotal())
                .costoEnvio(pedido.getCostoEnvio())
                .notasCliente(pedido.getNotasCliente())
                .notasRestaurante(pedido.getNotasRestaurante())
                .tiempoEstimadoMinutos(pedido.getTiempoEstimadoMinutos())
                .fechaCreacion(pedido.getFechaCreacion())
                .fechaActualizacion(pedido.getFechaActualizacion())
                .fechaEntrega(pedido.getFechaEntrega())
                .items(pedido.getItems() != null ? 
                    pedido.getItems().stream()
                        .map(ItemPedidoResponse::fromEntity)
                        .toList() : null)
                .build();
    }
}
