package com.quickbite.pedidos.service;

import com.quickbite.pedidos.dto.ItemPedidoRequest;
import com.quickbite.pedidos.dto.ItemPedidoResponse;
import com.quickbite.pedidos.dto.PedidoRequest;
import com.quickbite.pedidos.dto.PedidoResponse;
import com.quickbite.pedidos.entity.ItemPedido;
import com.quickbite.pedidos.entity.Pedido;
import com.quickbite.pedidos.exception.PedidoNotFoundException;
import com.quickbite.pedidos.exception.PedidoValidationException;
import com.quickbite.pedidos.integration.MenuServiceClient;
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
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Slf4j
@Transactional
public class PedidoService {

    private final PedidoRepository pedidoRepository;
    private final ItemPedidoRepository itemPedidoRepository;
    private final MenuServiceClient menuServiceClient;
    
    public PedidoResponse crearPedido(PedidoRequest pedidoRequest) {
        log.info("Creando nuevo pedido para el cliente: {}", pedidoRequest.getNombreCliente());

        // Validar stock de ingredientes antes de crear el pedido
        for (ItemPedidoRequest item : pedidoRequest.getItems()) {
            try {
                Map<String, Object> stockValidation = menuServiceClient.validateStock(
                        item.getProductoId(),
                        item.getCantidad()
                );
                Boolean hasStock = (Boolean) stockValidation.get("hasSufficientStock");
                if (!hasStock) {
                    throw new PedidoValidationException(
                            "No hay suficiente stock para el item: " + item.getNombreProducto()
                    );
                }
            } catch (Exception e) {
                log.warn("Error validando stock para item {}: {}", item.getProductoId(), e.getMessage());
                // Continuar aunque falle la validación (fallback)
            }
        }

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

        // Validar stock antes de crear el pedido
        for (ItemPedido item : items) {
            System.out.println("DEBUG: Validating stock for product ID: " + item.getProductoId() + ", quantity: " + item.getCantidad());
            Map<String, Object> stockValidation = menuServiceClient.validateStock(item.getProductoId(), item.getCantidad());
            System.out.println("DEBUG: Stock validation result: " + stockValidation);
            boolean hasStock = (Boolean) stockValidation.get("hasSufficientStock");
            System.out.println("DEBUG: Has sufficient stock: " + hasStock);
            if (!hasStock) {
                log.error("No hay suficiente stock para el producto ID: {}", item.getProductoId());
                throw new RuntimeException("No hay suficiente stock para el producto: " + item.getProductoId());
            }
        }

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

    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorRestaurante(Long restaurantId) {
        List<Pedido> pedidos = pedidoRepository.findByRestaurantId(restaurantId);

        log.info("Obteniendo {} pedidos para el restaurante: {}", pedidos.size(), restaurantId);
        return pedidos.stream()
                .map(PedidoResponse::fromEntity)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerPedidosPorRestaurante(Long restaurantId, Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findByRestaurantId(restaurantId, pageable);

        log.info("Obteniendo página {} de pedidos para el restaurante: {}", pedidos.getNumber(), restaurantId);
        return pedidos.map(PedidoResponse::fromEntity);
    }
    
    public PedidoResponse actualizarEstadoPedido(Long id, Pedido.EstadoPedido nuevoEstado) {
        System.out.println("DEBUG: actualizarEstadoPedido called with ID: " + id + ", new state: " + nuevoEstado);
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));

        System.out.println("DEBUG: Current state: " + pedido.getEstado() + ", new state: " + nuevoEstado);
        log.info("Actualizando estado del pedido {} de {} a {}",
                pedido.getNumeroPedido(), pedido.getEstado(), nuevoEstado);

        // Consumir ingredientes cuando el pedido pasa a EN_PREPARACION
        if (nuevoEstado == Pedido.EstadoPedido.EN_PREPARACION && pedido.getEstado() != Pedido.EstadoPedido.EN_PREPARACION) {
            System.out.println("DEBUG: Consuming ingredients for order " + pedido.getNumeroPedido());
            for (ItemPedido item : pedido.getItems()) {
                try {
                    System.out.println("DEBUG: Consuming ingredients for item " + item.getProductoId() + ", quantity: " + item.getCantidad());
                    menuServiceClient.consumeIngredients(
                            item.getProductoId(),
                            item.getCantidad()
                    );
                    log.info("Ingredientes consumidos para item {} del pedido {}", item.getProductoId(), pedido.getNumeroPedido());
                    System.out.println("DEBUG: Ingredients consumed successfully for item " + item.getProductoId());
                } catch (Exception e) {
                    log.error("Error consumiendo ingredientes para item {} del pedido {}: {}", item.getProductoId(), pedido.getNumeroPedido(), e.getMessage());
                    System.err.println("ERROR: Error consuming ingredients for item " + item.getProductoId() + ": " + e.getMessage());
                    e.printStackTrace();
                    // No fallar el cambio de estado si falla el consumo de ingredientes (fallback)
                }
            }
        }

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
