package com.ms_notificaciones.not.controller;

import com.ms_notificaciones.not.dto.NotificacionRequest;
import com.ms_notificaciones.not.dto.NotificacionResponse;
import com.ms_notificaciones.not.service.NotificacionService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.Parameter;
import io.swagger.v3.oas.annotations.media.Content;
import io.swagger.v3.oas.annotations.media.Schema;
import io.swagger.v3.oas.annotations.responses.ApiResponse;
import io.swagger.v3.oas.annotations.responses.ApiResponses;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.List;

@RestController
@RequestMapping("/api/notificaciones")
@CrossOrigin(origins = "*")
@Tag(name = "Notificaciones", description = "API para gestionar notificaciones del sistema QuickBite")
@SecurityRequirement(name = "bearerAuth")
public class NotificacionController {
    
    private static final Logger log = LoggerFactory.getLogger(NotificacionController.class);
    
    private final NotificacionService notificacionService;
    
    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }
    
    @PostMapping
    @Operation(summary = "Crear notificación", description = "Crea una nueva notificación genérica")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notificación creada exitosamente",
                    content = @Content(schema = @Schema(implementation = NotificacionResponse.class))),
        @ApiResponse(responseCode = "400", description = "Datos de entrada inválidos"),
        @ApiResponse(responseCode = "401", description = "No autorizado"),
        @ApiResponse(responseCode = "403", description = "No tiene permisos")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM', 'CLIENTE')")
    public ResponseEntity<NotificacionResponse> crearNotificacion(
            @Valid @RequestBody NotificacionRequest request) {
        log.info("Recibida solicitud para crear notificación: {}", request.getTipo());
        
        NotificacionResponse response = notificacionService.crearNotificacion(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @GetMapping("/usuario/{idUsuario}/no-leidas")
    @Operation(summary = "Obtener notificaciones no leídas", description = "Retorna todas las notificaciones pendientes de un usuario con paginación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de notificaciones",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE', 'COCINA', 'REPARTIDOR')")
    public ResponseEntity<Page<NotificacionResponse>> obtenerNotificacionesNoLeidas(
            @PathVariable @Parameter(description = "ID del usuario") Long idUsuario,
            @RequestParam(defaultValue = "0") @Parameter(description = "Número de página") int page,
            @RequestParam(defaultValue = "10") @Parameter(description = "Tamaño de página") int size,
            @RequestParam(defaultValue = "fechaCreacion") @Parameter(description = "Campo de ordenamiento") String sortBy,
            @RequestParam(defaultValue = "desc") @Parameter(description = "Dirección del ordenamiento") String sortDir) {
        
        log.info("Obteniendo notificaciones no leídas para usuario: {} - página: {}, tamaño: {}", 
                idUsuario, page, size);
        
        Sort sort = sortDir.equalsIgnoreCase("desc") ? 
                Sort.by(sortBy).descending() : Sort.by(sortBy).ascending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<NotificacionResponse> notificaciones = 
                notificacionService.obtenerNotificacionesNoLeidasPaginadas(idUsuario, pageable);
        
        return ResponseEntity.ok(notificaciones);
    }
    
    @PutMapping("/{idNotificacion}/marcar-leida")
    @Operation(summary = "Marcar notificación como leída", description = "Actualiza el estado de una notificación a leída")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Notificación actualizada"),
        @ApiResponse(responseCode = "404", description = "Notificación no encontrada"),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'CLIENTE', 'COCINA', 'REPARTIDOR')")
    public ResponseEntity<Void> marcarComoLeida(
            @PathVariable @Parameter(description = "ID de la notificación") Long idNotificacion) {
        log.info("Marcando notificación como leída: {}", idNotificacion);
        
        notificacionService.marcarComoLeida(idNotificacion);
        
        return ResponseEntity.ok().build();
    }
    
    @GetMapping("/restaurante/{idRestaurante}")
    @Operation(summary = "Obtener notificaciones por restaurante", description = "Retorna notificaciones de un restaurante en un rango de fechas con paginación")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "200", description = "Lista de notificaciones",
                    content = @Content(schema = @Schema(implementation = Page.class))),
        @ApiResponse(responseCode = "401", description = "No autorizado")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'COCINA')")
    public ResponseEntity<Page<NotificacionResponse>> obtenerNotificacionesPorRestaurante(
            @PathVariable @Parameter(description = "ID del restaurante") Long idRestaurante,
            @RequestParam(required = false) 
            @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) 
            @Parameter(description = "Fecha de inicio (default: 7 días atrás)") LocalDateTime fechaInicio,
            @RequestParam(defaultValue = "0") @Parameter(description = "Número de página") int page,
            @RequestParam(defaultValue = "20") @Parameter(description = "Tamaño de página") int size) {
        
        if (fechaInicio == null) {
            fechaInicio = LocalDateTime.now().minusDays(7);
        }
        
        log.info("Obteniendo notificaciones para restaurante: {} desde: {} - página: {}", 
                idRestaurante, fechaInicio, page);
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("fechaCreacion").descending());
        
        Page<NotificacionResponse> notificaciones = 
                notificacionService.obtenerNotificacionesPorRestaurantePaginadas(idRestaurante, fechaInicio, pageable);
        
        return ResponseEntity.ok(notificaciones);
    }
    
    // Endpoints específicos para los requerimientos funcionales
    
    @PostMapping("/inventario-critico")
    @Operation(summary = "Alerta de inventario crítico (RF-2)", description = "Genera una notificación cuando un ingrediente alcanza nivel crítico - Requerimiento RF-2")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Alerta creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Datos inválidos"),
        @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN o SYSTEM")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'SYSTEM')")
    public ResponseEntity<NotificacionResponse> alertaInventarioCritico(
            @RequestParam String idIngrediente,
            @RequestParam Long idRestaurante,
            @RequestParam String nombreIngrediente,
            @RequestParam Integer stockActual,
            @RequestParam Integer stockMinimo) {
        
        log.info("Generando alerta de inventario crítico para ingrediente: {}", idIngrediente);
        
        NotificacionRequest request = new NotificacionRequest();
        request.setTipo(com.ms_notificaciones.not.model.TipoNotificacion.INVENTARIO_CRITICO);
        request.setMensaje(String.format("⚠️ Inventario crítico: %s (Stock: %d, Mínimo: %d)", 
                nombreIngrediente, stockActual, stockMinimo));
        request.setIdReferencia(idIngrediente);
        request.setIdRestaurante(idRestaurante);
        
        NotificacionResponse response = notificacionService.crearNotificacion(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
    
    @PostMapping("/pedido/{idPedido}/estado")
    @Operation(summary = "Notificación de estado de pedido (RF-11)", description = "Notifica cambios de estado en pedidos (Recibido, Preparación, Listo, Entregado) - Requerimiento RF-11")
    @ApiResponses(value = {
        @ApiResponse(responseCode = "201", description = "Notificación creada exitosamente"),
        @ApiResponse(responseCode = "400", description = "Estado no válido"),
        @ApiResponse(responseCode = "403", description = "Requiere rol ADMIN, COCINA o SYSTEM")
    })
    @PreAuthorize("hasAnyRole('ADMIN', 'COCINA', 'SYSTEM')")
    public ResponseEntity<NotificacionResponse> notificarEstadoPedido(
            @PathVariable String idPedido,
            @RequestParam String estado,
            @RequestParam Long idRestaurante,
            @RequestParam(required = false) Long idUsuarioDestino) {
        
        log.info("Notificando estado de pedido: {} - {}", idPedido, estado);
        
        com.ms_notificaciones.not.model.TipoNotificacion tipoNotificacion;
        String mensaje;
        
        switch (estado.toUpperCase()) {
            case "RECIBIDO":
                tipoNotificacion = com.ms_notificaciones.not.model.TipoNotificacion.PEDIDO_RECIBIDO;
                mensaje = "📋 Pedido recibido en cocina";
                break;
            case "PREPARACION":
                tipoNotificacion = com.ms_notificaciones.not.model.TipoNotificacion.PEDIDO_PREPARACION;
                mensaje = "👨‍🍳 Pedido en preparación";
                break;
            case "LISTO":
                tipoNotificacion = com.ms_notificaciones.not.model.TipoNotificacion.PEDIDO_LISTO;
                mensaje = "✅ Pedido listo para entrega";
                break;
            case "ENTREGADO":
                tipoNotificacion = com.ms_notificaciones.not.model.TipoNotificacion.PEDIDO_ENTREGADO;
                mensaje = "🚚 Pedido entregado";
                break;
            default:
                throw new IllegalArgumentException("Estado de pedido no válido: " + estado);
        }
        
        NotificacionRequest request = new NotificacionRequest();
        request.setTipo(tipoNotificacion);
        request.setMensaje(String.format("%s - Pedido %s", mensaje, idPedido));
        request.setIdReferencia(idPedido);
        request.setIdRestaurante(idRestaurante);
        request.setIdUsuarioDestino(idUsuarioDestino);
        
        NotificacionResponse response = notificacionService.crearNotificacion(request);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(response);
    }
}
