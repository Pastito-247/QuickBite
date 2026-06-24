package com.quickbite.pedidos.controller;

import com.quickbite.pedidos.dto.DashboardStatsResponse;
import com.quickbite.pedidos.dto.PedidoRequest;
import com.quickbite.pedidos.dto.PedidoResponse;
import com.quickbite.pedidos.entity.Pedido;
import com.quickbite.pedidos.service.PedidoService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/v1/pedidos")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class PedidoController {
    
    private final PedidoService pedidoService;
    
    @PostMapping
    public ResponseEntity<PedidoResponse> crearPedido(@Valid @RequestBody PedidoRequest pedidoRequest) {
        log.info("Solicitud para crear nuevo pedido para cliente: {}", pedidoRequest.getNombreCliente());
        
        PedidoResponse pedidoCreado = pedidoService.crearPedido(pedidoRequest);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(pedidoCreado);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<PedidoResponse> obtenerPedidoPorId(@PathVariable Long id) {
        log.info("Solicitud para obtener pedido con ID: {}", id);
        
        PedidoResponse pedido = pedidoService.obtenerPedidoPorId(id);
        
        return ResponseEntity.ok(pedido);
    }
    
    @GetMapping("/numero/{numeroPedido}")
    public ResponseEntity<PedidoResponse> obtenerPedidoPorNumero(@PathVariable String numeroPedido) {
        log.info("Solicitud para obtener pedido con número: {}", numeroPedido);
        
        PedidoResponse pedido = pedidoService.obtenerPedidoPorNumero(numeroPedido);
        
        return ResponseEntity.ok(pedido);
    }
    
    @GetMapping("/cliente/{clienteId}")
    public ResponseEntity<List<PedidoResponse>> obtenerPedidosPorCliente(@PathVariable Long clienteId) {
        log.info("Solicitud para obtener pedidos del cliente: {}", clienteId);

        List<PedidoResponse> pedidos = pedidoService.obtenerPedidosPorCliente(clienteId);

        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/restaurante/{restaurantId}")
    public ResponseEntity<List<PedidoResponse>> obtenerPedidosPorRestaurante(@PathVariable Long restaurantId) {
        log.info("Solicitud para obtener pedidos del restaurante: {}", restaurantId);

        List<PedidoResponse> pedidos = pedidoService.obtenerPedidosPorRestaurante(restaurantId);

        return ResponseEntity.ok(pedidos);
    }

    @GetMapping("/restaurante/{restaurantId}/paginados")
    public ResponseEntity<Page<PedidoResponse>> obtenerPedidosPorRestaurantePaginados(
            @PathVariable Long restaurantId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {

        log.info("Solicitud para obtener pedidos paginados del restaurante: {}", restaurantId);

        Sort sort = sortDir.equalsIgnoreCase("desc") ?
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);

        Page<PedidoResponse> pedidos = pedidoService.obtenerPedidosPorRestaurante(restaurantId, pageable);

        return ResponseEntity.ok(pedidos);
    }
    
    @GetMapping("/cliente/{clienteId}/paginados")
    public ResponseEntity<Page<PedidoResponse>> obtenerPedidosPorClientePaginados(
            @PathVariable Long clienteId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir) {
        
        log.info("Solicitud para obtener pedidos paginados del cliente: {}", clienteId);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PedidoResponse> pedidos = pedidoService.obtenerPedidosPorCliente(clienteId, pageable);
        
        return ResponseEntity.ok(pedidos);
    }
    
    @GetMapping("/estado/{estado}")
    public ResponseEntity<List<PedidoResponse>> obtenerPedidosPorEstado(@PathVariable Pedido.EstadoPedido estado) {
        log.info("Solicitud para obtener pedidos con estado: {}", estado);
        
        List<PedidoResponse> pedidos = pedidoService.obtenerPedidosPorEstado(estado);
        
        return ResponseEntity.ok(pedidos);
    }
    
    @GetMapping
    public ResponseEntity<Page<PedidoResponse>> obtenerTodosLosPedidos(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "fechaCreacion") String sortBy,
            @RequestParam(defaultValue = "desc") String sortDir,
            @RequestParam(defaultValue = "false") boolean activos) {
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<PedidoResponse> pedidos = activos
                ? pedidoService.obtenerPedidosActivos(pageable)
                : pedidoService.obtenerTodosLosPedidos(pageable);
        
        return ResponseEntity.ok(pedidos);
    }
    
    @PutMapping("/{id}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstadoPedido(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String estadoStr = request.get("estado");
        Pedido.EstadoPedido nuevoEstado = Pedido.EstadoPedido.valueOf(estadoStr.toUpperCase());
        
        log.info("Solicitud para actualizar estado del pedido {} a: {}", id, nuevoEstado);
        
        PedidoResponse pedidoActualizado = pedidoService.actualizarEstadoPedido(id, nuevoEstado);
        
        return ResponseEntity.ok(pedidoActualizado);
    }

    @PutMapping("/numero/{numeroPedido}/estado")
    public ResponseEntity<PedidoResponse> actualizarEstadoPedidoPorNumero(
            @PathVariable String numeroPedido,
            @RequestBody Map<String, String> request) {

        String estadoStr = request.get("estado");
        Pedido.EstadoPedido nuevoEstado = Pedido.EstadoPedido.valueOf(estadoStr.toUpperCase());

        log.info("Solicitud para actualizar estado del pedido {} a: {}", numeroPedido, nuevoEstado);

        PedidoResponse pedidoActualizado = pedidoService.actualizarEstadoPedidoPorNumero(numeroPedido, nuevoEstado);

        return ResponseEntity.ok(pedidoActualizado);
    }
    
    @PutMapping("/{id}/notas")
    public ResponseEntity<PedidoResponse> actualizarNotasRestaurante(
            @PathVariable Long id,
            @RequestBody Map<String, String> request) {
        
        String notas = request.get("notas");
        
        log.info("Solicitud para actualizar notas del restaurante para el pedido: {}", id);
        
        PedidoResponse pedidoActualizado = pedidoService.actualizarNotasRestaurante(id, notas);
        
        return ResponseEntity.ok(pedidoActualizado);
    }
    
    @DeleteMapping("/{id}/cancelar")
    public ResponseEntity<Void> cancelarPedido(@PathVariable Long id) {
        log.info("Solicitud para cancelar pedido: {}", id);
        
        pedidoService.cancelarPedido(id);
        
        return ResponseEntity.noContent().build();
    }
    
    @GetMapping("/estadisticas")
    public ResponseEntity<DashboardStatsResponse> obtenerEstadisticasDashboard() {
        log.info("Solicitud para obtener estadísticas del dashboard");
        return ResponseEntity.ok(pedidoService.obtenerDashboardStats());
    }
    
    @GetMapping("/estados")
    public ResponseEntity<Pedido.EstadoPedido[]> obtenerEstadosPedidos() {
        log.info("Solicitud para obtener lista de estados de pedidos");
        
        return ResponseEntity.ok(Pedido.EstadoPedido.values());
    }
    
    @GetMapping("/metodos-pago")
    public ResponseEntity<Pedido.MetodoPago[]> obtenerMetodosPago() {
        log.info("Solicitud para obtener lista de métodos de pago");
        
        return ResponseEntity.ok(Pedido.MetodoPago.values());
    }
}
