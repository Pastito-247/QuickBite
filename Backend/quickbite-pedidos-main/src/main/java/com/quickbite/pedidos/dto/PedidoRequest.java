package com.quickbite.pedidos.dto;

import com.quickbite.pedidos.entity.Pedido;
import jakarta.validation.Valid;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PedidoRequest {
    
    @NotNull(message = "El ID del cliente es obligatorio")
    @Positive(message = "El ID del cliente debe ser positivo")
    private Long clienteId;
    
    @NotBlank(message = "El nombre del cliente es obligatorio")
    @Size(min = 2, max = 100, message = "El nombre del cliente debe tener entre 2 y 100 caracteres")
    private String nombreCliente;
    
    @Email(message = "El email debe ser válido")
    @Size(max = 100, message = "El email no puede exceder 100 caracteres")
    private String emailCliente;
    
    @Size(max = 20, message = "El teléfono no puede exceder 20 caracteres")
    private String telefonoCliente;
    
    @NotBlank(message = "La dirección de entrega es obligatoria")
    @Size(min = 5, max = 200, message = "La dirección debe tener entre 5 y 200 caracteres")
    private String direccionEntrega;
    
    @NotNull(message = "El método de pago es obligatorio")
    private Pedido.MetodoPago metodoPago;
    
    @DecimalMin(value = "0.0", message = "El costo de envío no puede ser negativo")
    @Builder.Default
    private BigDecimal costoEnvio = BigDecimal.ZERO;
    
    @Size(max = 500, message = "Las notas no pueden exceder 500 caracteres")
    private String notasCliente;
    
    @NotNull(message = "Los items del pedido son obligatorios")
    @NotEmpty(message = "El pedido debe tener al menos un item")
    @Valid
    private List<ItemPedidoRequest> items;
}
