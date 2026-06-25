package com.quickbite.pedidos.service;

import com.quickbite.pedidos.dto.DashboardStatsResponse;
import com.quickbite.pedidos.dto.ItemPedidoRequest;
import com.quickbite.pedidos.dto.ItemPedidoResponse;
import com.quickbite.pedidos.dto.PedidoRequest;
import com.quickbite.pedidos.dto.PedidoResponse;
import com.quickbite.pedidos.entity.ItemPedido;
import com.quickbite.pedidos.entity.Pedido;
import com.quickbite.pedidos.exception.PedidoNotFoundException;
import com.quickbite.pedidos.exception.PedidoValidationException;
import com.quickbite.pedidos.integration.KitchenServiceClient;
import com.quickbite.pedidos.integration.MenuServiceClient;
import com.quickbite.pedidos.repository.ItemPedidoRepository;
import com.quickbite.pedidos.repository.PedidoRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
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
    private final KitchenServiceClient kitchenServiceClient;
    
    public PedidoResponse crearPedido(PedidoRequest pedidoRequest) {
        log.info("Creando nuevo pedido para el cliente: {}", pedidoRequest.getNombreCliente());

        // Validar stock de ingredientes antes de crear el pedido.
        // No se permite comprar cuando no hay stock suficiente (ni cuando no se puede verificar).
        for (ItemPedidoRequest item : pedidoRequest.getItems()) {
            String nombreProducto = item.getNombreProducto() != null
                    ? item.getNombreProducto()
                    : ("ID " + item.getProductoId());

            boolean hasStock;
            try {
                Map<String, Object> stockValidation = menuServiceClient.validateStock(
                        item.getProductoId(),
                        item.getCantidad()
                );
                hasStock = stockValidation != null
                        && Boolean.TRUE.equals(stockValidation.get("hasSufficientStock"));
            } catch (Exception e) {
                log.error("No se pudo validar el stock para el producto {}: {}",
                        item.getProductoId(), e.getMessage());
                throw new PedidoValidationException(
                        "No se pudo verificar el stock del producto: " + nombreProducto
                                + ". Intente nuevamente.");
            }

            if (!hasStock) {
                log.warn("Pedido rechazado por falta de stock: {} (cantidad {})",
                        nombreProducto, item.getCantidad());
                throw new PedidoValidationException(
                        "No hay suficiente stock para el producto: " + nombreProducto);
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
                .restaurantId(pedidoRequest.getRestaurantId())
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
        return convertToResponse(pedidoGuardado);
    }
    
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedidoPorId(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        log.info("Obteniendo pedido: {}", pedido.getNumeroPedido());
        return convertToResponse(pedido);
    }
    
    @Transactional(readOnly = true)
    public PedidoResponse obtenerPedidoPorNumero(String numeroPedido) {
        Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con número: " + numeroPedido));
        
        log.info("Obteniendo pedido por número: {}", numeroPedido);
        return convertToResponse(pedido);
    }
    
    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorCliente(Long clienteId) {
        List<Pedido> pedidos = pedidoRepository.findByClienteId(clienteId);
        
        log.info("Obteniendo {} pedidos para el cliente: {}", pedidos.size(), clienteId);
        return pedidos.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerPedidosPorCliente(Long clienteId, Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findByClienteId(clienteId, pageable);
        
        log.info("Obteniendo página {} de pedidos para el cliente: {}", pedidos.getNumber(), clienteId);
        return pedidos.map(this::convertToResponse);
    }
    
    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorEstado(Pedido.EstadoPedido estado) {
        List<Pedido> pedidos = pedidoRepository.findByEstado(estado);
        
        log.info("Obteniendo {} pedidos con estado: {}", pedidos.size(), estado);
        return pedidos.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }
    
    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerTodosLosPedidos(Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findAll(pageable);

        log.info("Obteniendo página {} de todos los pedidos", pedidos.getNumber());
        return pedidos.map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerPedidosActivos(Pageable pageable) {
        List<Pedido.EstadoPedido> excluidos = List.of(
                Pedido.EstadoPedido.CANCELADO,
                Pedido.EstadoPedido.ENTREGADO
        );
        Page<Pedido> pedidos = pedidoRepository.findByEstadoNotIn(excluidos, pageable);
        log.info("Obteniendo página {} de pedidos activos (excluyendo cancelados/entregados)", pedidos.getNumber());
        return pedidos.map(this::convertToResponse);
    }

    @Transactional(readOnly = true)
    public List<PedidoResponse> obtenerPedidosPorRestaurante(Long restaurantId) {
        List<Pedido> pedidos = pedidoRepository.findByRestaurantId(restaurantId);

        log.info("Obteniendo {} pedidos para el restaurante: {}", pedidos.size(), restaurantId);
        return pedidos.stream()
                .map(this::convertToResponse)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public Page<PedidoResponse> obtenerPedidosPorRestaurante(Long restaurantId, Pageable pageable) {
        Page<Pedido> pedidos = pedidoRepository.findByRestaurantId(restaurantId, pageable);

        log.info("Obteniendo página {} de pedidos para el restaurante: {}", pedidos.getNumber(), restaurantId);
        return pedidos.map(this::convertToResponse);
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
        return convertToResponse(pedidoActualizado);
    }

    public PedidoResponse actualizarEstadoPedidoPorNumero(String numeroPedido, Pedido.EstadoPedido nuevoEstado) {
        Pedido pedido = pedidoRepository.findByNumeroPedido(numeroPedido)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con número: " + numeroPedido));
        return actualizarEstadoPedido(pedido.getId(), nuevoEstado);
    }

    public PedidoResponse actualizarNotasRestaurante(Long id, String notas) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        log.info("Actualizando notas del restaurante para el pedido: {}", pedido.getNumeroPedido());
        pedido.setNotasRestaurante(notas);
        
        Pedido pedidoActualizado = pedidoRepository.save(pedido);
        return convertToResponse(pedidoActualizado);
    }
    
    public void cancelarPedido(Long id) {
        Pedido pedido = pedidoRepository.findById(id)
                .orElseThrow(() -> new PedidoNotFoundException("Pedido no encontrado con ID: " + id));
        
        // No se pueden cancelar pedidos ya entregados o ya cancelados
        if (pedido.getEstado() == Pedido.EstadoPedido.ENTREGADO ||
            pedido.getEstado() == Pedido.EstadoPedido.CANCELADO) {
            throw new PedidoValidationException("No se puede cancelar un pedido ya " + pedido.getEstado().name().toLowerCase());
        }
        
        log.info("Cancelando pedido: {}", pedido.getNumeroPedido());
        pedido.setEstado(Pedido.EstadoPedido.CANCELADO);
        pedidoRepository.save(pedido);

        // Notificar a cocina para que retire el pedido del KDS
        try {
            kitchenServiceClient.updateOrderStatus(pedido.getNumeroPedido(), "CANCELADO");
            log.info("Cocina notificada de cancelación del pedido {}", pedido.getNumeroPedido());
        } catch (Exception e) {
            log.warn("No se pudo notificar a cocina la cancelación del pedido {}: {}",
                    pedido.getNumeroPedido(), e.getMessage());
        }
    }
    
    @Transactional(readOnly = true)
    public List<Object[]> obtenerEstadisticasPedidos() {
        LocalDateTime fechaInicio = LocalDateTime.now().minusDays(30);
        List<Object[]> estadisticas = pedidoRepository.countPedidosByEstadoDesdeFecha(fechaInicio);
        
        log.info("Obteniendo estadísticas de pedidos desde: {}", fechaInicio);
        return estadisticas;
    }

    @Transactional(readOnly = true)
    public DashboardStatsResponse obtenerDashboardStats() {
        long totalOrders = pedidoRepository.count();
        java.math.BigDecimal totalRevenue = pedidoRepository.sumTotalVentas();
        long activeUsers = pedidoRepository.countDistinctClientes();

        // Últimos 10 pedidos
        Pageable top10 = PageRequest.of(0, 10, Sort.by("fechaCreacion").descending());
        List<PedidoResponse> recentOrders = pedidoRepository.findAll(top10)
                .map(PedidoResponse::fromEntity)
                .getContent();

        // Stats por restaurante
        Map<Long, String> restaurantNames = loadRestaurantNames();
        List<Object[]> rawStats = pedidoRepository.statsByRestaurant();
        List<DashboardStatsResponse.RestaurantStats> byRestaurant = rawStats.stream()
                .map(row -> {
                    Long restId = (Long) row[0];
                    long count = ((Number) row[1]).longValue();
                    java.math.BigDecimal revenue = (java.math.BigDecimal) row[2];
                    String name = restaurantNames.getOrDefault(restId,
                            restId != null ? "Restaurante #" + restId : "Sin restaurante");
                    return DashboardStatsResponse.RestaurantStats.builder()
                            .restaurantId(restId)
                            .restaurantName(name)
                            .orders(count)
                            .revenue(revenue)
                            .build();
                })
                .collect(Collectors.toList());

        return DashboardStatsResponse.builder()
                .totalOrders(totalOrders)
                .totalRevenue(totalRevenue)
                .activeUsers(activeUsers)
                .lowStockItems(0)
                .recentOrders(recentOrders)
                .ordersByRestaurant(byRestaurant)
                .build();
    }

    private Map<Long, String> loadRestaurantNames() {
        try {
            List<Map<String, Object>> restaurants = menuServiceClient.getAllRestaurants();
            return restaurants.stream()
                    .collect(Collectors.toMap(
                            r -> ((Number) r.get("id")).longValue(),
                            r -> (String) r.getOrDefault("name", "Desconocido"),
                            (a, b) -> a
                    ));
        } catch (Exception e) {
            log.warn("No se pudo obtener nombres de restaurantes: {}", e.getMessage());
            return Map.of();
        }
    }

    private PedidoResponse convertToResponse(Pedido pedido) {
        if (pedido == null) return null;
        PedidoResponse response = PedidoResponse.fromEntity(pedido);
        if (pedido.getRestaurantId() != null) {
            try {
                Map<String, Object> restaurant = menuServiceClient.getRestaurantById(pedido.getRestaurantId());
                if (restaurant != null && restaurant.containsKey("name")) {
                    response.setRestaurantName((String) restaurant.get("name"));
                } else {
                    response.setRestaurantName(getMockRestaurantName(pedido.getRestaurantId()));
                }
            } catch (Exception e) {
                log.warn("No se pudo obtener nombre del restaurante {} de menu-service: {}", 
                        pedido.getRestaurantId(), e.getMessage());
                response.setRestaurantName(getMockRestaurantName(pedido.getRestaurantId()));
            }
        } else {
            response.setRestaurantName("Cocina Global");
        }
        return response;
    }

    private String getMockRestaurantName(Long restaurantId) {
        if (restaurantId == null) return "Cocina Global";
        switch (restaurantId.intValue()) {
            case 1: return "Burger Queen";
            case 2: return "Pizza Hub";
            case 3: return "Taco Fiesta";
            case 4: return "Sushi Zen";
            case 5: return "Green Bowl";
            case 6: return "El Asador";
            case 7: return "Wok Express";
            case 8: return "La Crêperie";
            default: return "Restaurante #" + restaurantId;
        }
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
