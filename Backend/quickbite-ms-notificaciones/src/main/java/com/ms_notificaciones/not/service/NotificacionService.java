package com.ms_notificaciones.not.service;

import com.ms_notificaciones.not.dto.NotificacionRequest;
import com.ms_notificaciones.not.dto.NotificacionResponse;
import com.ms_notificaciones.not.exception.NotificacionNotFoundException;
import com.ms_notificaciones.not.model.Notificacion;
import com.ms_notificaciones.not.model.TipoNotificacion;
import com.ms_notificaciones.not.repository.NotificacionRepository;
import io.micrometer.core.instrument.MeterRegistry;
import io.micrometer.core.instrument.Timer;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageImpl;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
@Transactional
public class NotificacionService {
    
    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);
    
    private final NotificacionRepository notificacionRepository;
    private final InventarioNotificacionService inventarioNotificacionService;
    private final PedidoNotificacionService pedidoNotificacionService;
    
    public NotificacionService(NotificacionRepository notificacionRepository,
                              InventarioNotificacionService inventarioNotificacionService,
                              PedidoNotificacionService pedidoNotificacionService) {
        this.notificacionRepository = notificacionRepository;
        this.inventarioNotificacionService = inventarioNotificacionService;
        this.pedidoNotificacionService = pedidoNotificacionService;
    }
    
    public NotificacionResponse crearNotificacion(NotificacionRequest request) {
        log.info("Creando notificación de tipo: {} para restaurante: {}", 
                request.getTipo(), request.getIdRestaurante());
        
        Notificacion notificacion = new Notificacion();
        notificacion.setTipo(request.getTipo());
        notificacion.setMensaje(request.getMensaje());
        notificacion.setIdReferencia(request.getIdReferencia());
        notificacion.setIdRestaurante(request.getIdRestaurante());
        notificacion.setIdUsuarioDestino(request.getIdUsuarioDestino());
        
        notificacion = notificacionRepository.save(notificacion);
        
        // Procesar notificación según su tipo
        procesarNotificacionPorTipo(notificacion);
        
        return convertirAResponse(notificacion);
    }
    
    private void procesarNotificacionPorTipo(Notificacion notificacion) {
        switch (notificacion.getTipo()) {
            case INVENTARIO_CRITICO:
                inventarioNotificacionService.procesarAlertaInventario(notificacion);
                break;
            case PEDIDO_LISTO:
            case PEDIDO_RECIBIDO:
            case PEDIDO_PREPARACION:
            case PEDIDO_ENTREGADO:
                pedidoNotificacionService.procesarNotificacionPedido(notificacion);
                break;
            default:
                log.warn("Tipo de notificación no manejado: {}", notificacion.getTipo());
        }
    }
    
    public List<NotificacionResponse> obtenerNotificacionesNoLeidas(Long idUsuario) {
        List<Notificacion> notificaciones = notificacionRepository
                .findByIdUsuarioDestinoAndLeidaFalseOrderByFechaCreacionDesc(idUsuario);
        
        return notificaciones.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }
    
    public void marcarComoLeida(Long idNotificacion) {
        Notificacion notificacion = notificacionRepository.findById(idNotificacion)
                .orElseThrow(() -> new NotificacionNotFoundException(idNotificacion));
        
        notificacion.setLeida(true);
        notificacionRepository.save(notificacion);
        log.info("Notificación {} marcada como leída", idNotificacion);
    }
    
    public Page<NotificacionResponse> obtenerNotificacionesNoLeidasPaginadas(Long idUsuario, Pageable pageable) {
        Page<Notificacion> page = notificacionRepository
                .findByIdUsuarioDestinoAndLeidaFalse(idUsuario, pageable);
        
        List<NotificacionResponse> responses = page.getContent().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }
    
    public Page<NotificacionResponse> obtenerNotificacionesPorRestaurantePaginadas(Long idRestaurante, 
                                                                                     LocalDateTime fechaInicio,
                                                                                     Pageable pageable) {
        Page<Notificacion> page = notificacionRepository
                .findByIdRestauranteAndFechaCreacionGreaterThanEqual(idRestaurante, fechaInicio, pageable);
        
        List<NotificacionResponse> responses = page.getContent().stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
        
        return new PageImpl<>(responses, pageable, page.getTotalElements());
    }
    
    public List<NotificacionResponse> obtenerNotificacionesPorRestaurante(Long idRestaurante, 
                                                                         LocalDateTime fechaInicio) {
        List<Notificacion> notificaciones = notificacionRepository
                .findNotificacionesRecientes(idRestaurante, fechaInicio);
        
        return notificaciones.stream()
                .map(this::convertirAResponse)
                .collect(Collectors.toList());
    }
    
    private NotificacionResponse convertirAResponse(Notificacion notificacion) {
        NotificacionResponse response = new NotificacionResponse();
        response.setId(notificacion.getId());
        response.setTipo(notificacion.getTipo());
        response.setMensaje(notificacion.getMensaje());
        response.setIdReferencia(notificacion.getIdReferencia());
        response.setIdRestaurante(notificacion.getIdRestaurante());
        response.setIdUsuarioDestino(notificacion.getIdUsuarioDestino());
        response.setLeida(notificacion.getLeida());
        response.setEnviada(notificacion.getEnviada());
        response.setFechaCreacion(notificacion.getFechaCreacion());
        response.setFechaEnvio(notificacion.getFechaEnvio());
        return response;
    }
}
