package com.ms_notificaciones.not.service;

import com.ms_notificaciones.not.model.Notificacion;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.cloud.client.circuitbreaker.CircuitBreaker;
import org.springframework.cloud.circuitbreaker.resilience4j.Resilience4JCircuitBreakerFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

@Service
public class InventarioNotificacionService {
    
    private static final Logger log = LoggerFactory.getLogger(InventarioNotificacionService.class);
    
    private final Resilience4JCircuitBreakerFactory circuitBreakerFactory;
    private final RestTemplate restTemplate = new RestTemplate();
    
    public InventarioNotificacionService(Resilience4JCircuitBreakerFactory circuitBreakerFactory) {
        this.circuitBreakerFactory = circuitBreakerFactory;
    }
    
    public void procesarAlertaInventario(Notificacion notificacion) {
        log.info("Procesando alerta de inventario crítico: {}", notificacion.getIdReferencia());
        
        CircuitBreaker circuitBreaker = circuitBreakerFactory.create("inventario-service");
        
        String resultado = circuitBreaker.run(
            () -> {
                // Lógica para notificar al sistema de administración
                return notificarAdministrador(notificacion);
            },
            throwable -> {
                log.error("Error al procesar alerta de inventario: {}", throwable.getMessage());
                return "FALLBACK: Alerta registrada pero no enviada";
            }
        );
        
        log.info("Resultado de procesamiento de alerta: {}", resultado);
    }
    
    private String notificarAdministrador(Notificacion notificacion) {
        // Aquí se integraría con el servicio de administración
        // o se enviaría email/push notification
        
        // Ejemplo de llamada a otro microservicio
        String url = "http://administracion-service/api/admin/alertas";
        
        try {
            // Simulación de envío
            log.info("Enviando alerta de inventario crítico al sistema de administración");
            notificacion.setEnviada(true);
            notificacion.setFechaEnvio(java.time.LocalDateTime.now());
            
            return "Alerta enviada exitosamente";
        } catch (Exception e) {
            log.error("Error al enviar alerta: {}", e.getMessage());
            throw e;
        }
    }
}
