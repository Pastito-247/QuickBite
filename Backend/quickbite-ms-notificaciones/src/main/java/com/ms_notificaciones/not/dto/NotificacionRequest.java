package com.ms_notificaciones.not.dto;

import com.ms_notificaciones.not.model.TipoNotificacion;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.NotBlank;

public class NotificacionRequest {
    
    @NotNull(message = "El tipo de notificación es requerido")
    private TipoNotificacion tipo;
    
    @NotBlank(message = "El mensaje es requerido")
    private String mensaje;
    
    private String idReferencia;
    
    private Long idRestaurante;
    
    private Long idUsuarioDestino;
    
    // Getters y Setters
    public TipoNotificacion getTipo() { return tipo; }
    public void setTipo(TipoNotificacion tipo) { this.tipo = tipo; }
    
    public String getMensaje() { return mensaje; }
    public void setMensaje(String mensaje) { this.mensaje = mensaje; }
    
    public String getIdReferencia() { return idReferencia; }
    public void setIdReferencia(String idReferencia) { this.idReferencia = idReferencia; }
    
    public Long getIdRestaurante() { return idRestaurante; }
    public void setIdRestaurante(Long idRestaurante) { this.idRestaurante = idRestaurante; }
    
    public Long getIdUsuarioDestino() { return idUsuarioDestino; }
    public void setIdUsuarioDestino(Long idUsuarioDestino) { this.idUsuarioDestino = idUsuarioDestino; }
}
