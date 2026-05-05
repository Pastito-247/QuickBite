package com.quickbite.pedidos.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;

@Entity
@Table(name = "pedidos")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Pedido {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(unique = true, nullable = false, updatable = false)
    private String numeroPedido;
    
    @Column(name = "cliente_id", nullable = false)
    private Long clienteId;
    
    @Column(name = "nombre_cliente", nullable = false)
    private String nombreCliente;
    
    @Column(name = "email_cliente")
    private String emailCliente;
    
    @Column(name = "telefono_cliente")
    private String telefonoCliente;
    
    @Column(name = "direccion_entrega", nullable = false)
    private String direccionEntrega;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private EstadoPedido estado;
    
    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private MetodoPago metodoPago;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal subtotal;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal impuesto;
    
    @Column(nullable = false, precision = 10, scale = 2)
    private BigDecimal total;
    
    @Column(name = "costo_envio", precision = 10, scale = 2)
    @Builder.Default
    private BigDecimal costoEnvio = BigDecimal.ZERO;
    
    @Column(name = "notas_cliente")
    private String notasCliente;
    
    @Column(name = "notas_restaurante")
    private String notasRestaurante;
    
    @Column(name = "tiempo_estimado_minutos")
    private Integer tiempoEstimadoMinutos;
    
    @CreationTimestamp
    @Column(name = "fecha_creacion", nullable = false, updatable = false)
    private LocalDateTime fechaCreacion;
    
    @UpdateTimestamp
    @Column(name = "fecha_actualizacion")
    private LocalDateTime fechaActualizacion;
    
    @Column(name = "fecha_entrega")
    private LocalDateTime fechaEntrega;
    
    @OneToMany(mappedBy = "pedido", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<ItemPedido> items;
    
    @PrePersist
    protected void onCreate() {
        if (numeroPedido == null) {
            numeroPedido = "PED-" + UUID.randomUUID().toString().substring(0, 8).toUpperCase();
        }
        if (estado == null) {
            estado = EstadoPedido.PENDIENTE;
        }
        calcularTotales();
    }
    
    @PreUpdate
    protected void onUpdate() {
        calcularTotales();
    }
    
    private void calcularTotales() {
        if (items != null && !items.isEmpty()) {
            subtotal = items.stream()
                .map(item -> item.getPrecioUnitario().multiply(BigDecimal.valueOf(item.getCantidad())))
                .reduce(BigDecimal.ZERO, BigDecimal::add);
            
            // Impuesto del 16%
            impuesto = subtotal.multiply(BigDecimal.valueOf(0.16));
            total = subtotal.add(impuesto).add(costoEnvio);
        }
    }
    
    public enum EstadoPedido {
        PENDIENTE,
        CONFIRMADO,
        EN_PREPARACION,
        LISTO,
        EN_CAMINO,
        ENTREGADO,
        CANCELADO
    }
    
    public enum MetodoPago {
        EFECTIVO,
        TARJETA_CREDITO,
        TARJETA_DEBITO,
        TRANSFERENCIA,
        PAYPAL,
        MERCADO_PAGO
    }
}
