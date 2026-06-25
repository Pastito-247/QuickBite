package com.ms_notificaciones.not.service;

import com.ms_notificaciones.not.model.Notificacion;
import com.ms_notificaciones.not.model.TipoNotificacion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.stereotype.Service;

@Service
public class PedidoNotificacionService {
    
    private static final Logger log = LoggerFactory.getLogger(PedidoNotificacionService.class);
    
    private final Resilience4JCircuitBreakerFactory circuitBreakerFactory;
    
    public PedidoNotificacionService(Resilience4JCircuitBreakerFactory circuitBreakerFactory) {
        this.circuitBreakerFactory = circuitBreakerFactory;
    }
    
    public void procesarNotificacionPedido(Notificacion notificacion) {
        log.info("Procesando notificación de pedido: {} - {}", 
                notificacion.getTipo(), notificacion.getIdReferencia());
        
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("pedido-service");
        
        String resultado = circuitBreaker.run(
            () -> procesarSegunTipo(notificacion),
            throwable -> {
                log.error("Error al procesar notificación de pedido: {}", throwable.getMessage());
                return "FALLBACK: Notificación registrada pero no procesada";
            }
        );
        
        log.info("Resultado de procesamiento de pedido: {}", resultado);
    }
    
    private String procesarSegunTipo(Notificacion notificacion) {
        switch (notificacion.getTipo()) {
            case PEDIDO_RECIBIDO:
                return notificarCocina(notificacion);
            case PEDIDO_PREPARACION:
                return actualizarEstadoPedido(notificacion);
            case PEDIDO_LISTO:
                return notificarPersonalEntrega(notificacion);
            case PEDIDO_ENTREGADO:
                return confirmarEntrega(notificacion);
            default:
                return "Tipo de notificación no manejado";
        }
    }
    
    private String notificarCocina(Notificacion notificacion) {
        log.info("Notificando a cocina sobre pedido recibido: {}", notificacion.getIdReferencia());
        // Lógica para enviar a pantallas de cocina
        notificacion.setEnviada(true);
        notificacion.setFechaEnvio(java.time.LocalDateTime.now());
        return "Notificación enviada a cocina";
    }
    
    private String actualizarEstadoPedido(Notificacion notificacion) {
        log.info("Actualizando estado de pedido en preparación: {}", notificacion.getIdReferencia());
        notificacion.setEnviada(true);
        notificacion.setFechaEnvio(java.time.LocalDateTime.now());
        return "Estado actualizado";
    }
    
    private String notificarPersonalEntrega(Notificacion notificacion) {
        log.info("Notificando al personal de entrega - Pedido listo: {}", notificacion.getIdReferencia());
        // Lógica para notificar al personal de entrega (RF-11)
        notificacion.setEnviada(true);
        notificacion.setFechaEnvio(java.time.LocalDateTime.now());
        return "Personal de entrega notificado";
    }
    
    private String confirmarEntrega(Notificacion notificacion) {
        log.info("Confirmando entrega de pedido: {}", notificacion.getIdReferencia());
        notificacion.setEnviada(true);
        notificacion.setFechaEnvio(java.time.LocalDateTime.now());
        return "Entrega confirmada";
    }
}
