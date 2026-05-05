package com.quickbite.pedidos.service;

import com.quickbite.pedidos.dto.ItemPedidoRequest;
import com.quickbite.pedidos.dto.ItemPedidoResponse;
import com.quickbite.pedidos.dto.PedidoRequest;
import com.quickbite.pedidos.dto.PedidoResponse;
import com.quickbite.pedidos.entity.ItemPedido;
import com.quickbite.pedidos.entity.Pedido;
import com.quickbite.pedidos.exception.PedidoNotFoundException;
import com.quickbite.pedidos.exception.PedidoValidationException;
import com.quickbite.pedidos.repository.ItemPedidoRepository;
import com.quickbite.pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PedidoService {
    
    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    
    public PedidoResponse crearPedido(PedidoRequest pedidoRequest) {
        log.info("Creando nuevo pedido para el cliente: {}", pedidoRequest.getNombreCliente());
        
        Pedido pedido = Pedido.builder()
                .clienteId(pedidoRequest.getClienteId())
                .nombreCliente(pedidoRequest.getNombreCliente())
                .emailCliente(pedidoRequest.getEmailCliente())
                .telefonoCliente(pedidoRequest.getTelefonoCliente())
                .direccionEntrega(pedidoRequest.getDireccionEntrega())
                .metodoPago(pedidoRequest.getMetodoPago())
                .costoEnvio(pedidoRequest.getCostoEnvio())
                .notasCliente(pedidoRequest.getNotasCliente())
                .tiempoEstimadoMinutos(30) // Tiempo estimado por defecto
                .build();
        
        // Crear items del pedido
        List<ItemPedido> items = pedidoRequest.getItems().stream()
                .map(this::convertToItemPedido)
                .collect(Collectors.toList());
        
        items.forEach(item -> item.setPedido(pedido));
        pedido.setItems(items);
        
        Pedido pedidoGuardado = pedidoRepository.save(pedido);
        
        log.info("Pedido creado exitosamente con número: {}", pedidoGuardado.getNumeroPedido());
        return PedidoResponse.fromEntity(pedidoGuardado);
    }
    
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        log.info("Obteniendo pedido: {}", pedido.getNumeroPedido());
        return PedidoResponse.fromEntity(pedido);
    }
    
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedidoPorNumero(String numeroPedido) {
        Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con número: " + numeroPedido));
        
        log.info("Obteniendo pedido por número: {}", numeroPedido);
        return PedidoResponse.fromEntity(pedido);
    }
    
    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorCliente(Long clienteId) {
        List<Pedido> pedidos = pedidoRepository.findByClienteId(clienteId);
        
        log.info("Obteniendo {} pedidos para el cliente: {}", pedidos.size(), clienteId);
        return pedidos.stream()
                .map(PedidoResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerPedidosPorCliente(Long clienteId, Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findByClienteId(clienteId, pageable);
        
        log.info("Obteniendo página {} de pedidos para el cliente: {}", pedidos.getNumber(), clienteId);
        return pedidos.map(PedidoResponse::fromEntity);
    }
    
    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorEstado(Pedido.EstadoPedido estado) {
        List<Pedido> pedidos = pedidoRepository.findByEstado(estado);
        
        log.info("Obteniendo {} pedidos con estado: {}", pedidos.size(), estado);
        return pedidos.stream()
                .map(PedidoResponse::fromEntity)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerTodosLosPedidos(Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findAll(pageable);
        
        log.info("Obteniendo página {} de todos los pedidos", pedidos.getNumber());
        return pedidos.map(PedidoResponse::fromEntity);
    }
    
    public PedidoResponse actualizarEstadoPedido(Long id, Pedido.EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        log.info("Actualizando estado del pedido {} de {} a {}", 
                pedido.getNumeroPedido(), pedido.getEstado(), nuevoEstado);
        
        pedido.setEstado(nuevoEstado);
        
        // Si el pedido se marca como entregado, registrar la fecha de entrega
        if (nuevoEstado == Pedido.EstadoPedido.ENTREGADO) {
            pedido.setFechaEntrega(LocalDateTime.now());
        }
        
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        return PedidoResponse.fromEntity(pedidoActualizado);
    }
    
    public PedidoResponse actualizarNotasRestaurante(Long id, String notas) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        log.info("Actualizando notas del restaurante para el pedido: {}", pedido.getNumeroPedido());
        pedido.setNotasRestaurante(notas);
        
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        return PedidoResponse.fromEntity(pedidoActualizado);
    }
    
    public void cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        // Solo se pueden cancelar pedidos que estén en estado PENDIENTE o CONFIRMADO
        if (pedido.getEstado() != Pedido.EstadoPedido.PENDIENTE && 
            pedido.getEstado() != Pedido.EstadoPedido.CONFIRMADO) {
            throw new PedidoValidationException("Solo se pueden cancelar pedidos en estado PENDIENTE o CONFIRMADO");
        }
        
        log.info("Cancelando pedido: {}", pedido.getNumeroPedido());
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedidoRepository.save(pedido);
    }
    
    @Transactional(readOnly = true)
    public List<Object[]> obtenerEstadisticasPedidos() {
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(30);
        List<Object[]> estadisticas = pedidoRepository.countPedidosByEstadoDesdeFecha(fechaInicio);
        
        log.info("Obteniendo estadísticas de pedidos desde: {}", fechaInicio);
        return estadisticas;
    }
    
    private ItemPedido convertToItemPedido(ItemPedidoRequest request) {
        return ItemPedido.builder()
                .productoId(request.getProductoId())
                .nombreProducto(request.getNombreProducto())
                .descripcionProducto(request.getDescripcionProducto())
                .cantidad(request.getCantidad())
                .precioUnitario(request.getPrecioUnitario())
                .notasItem(request.getNotasItem())
                .build();
    }
}
