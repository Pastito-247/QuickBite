package com.ms_notificaciones.not.dto;

import com.ms_notificaciones.not.model.TipoNotificacion;
import java.time.LocalDateTime;

public class NotificacionResponse {
    private Long id;
    private TipoNotificacion tipo;
    private String mensaje;
    private String idReferencia;
    private Long idRestaurante;
    private Long idUsuarioDestino;
    private Boolean leida;
    private Boolean enviada;
    private LocalDateTime fechaCreacion;
    private LocalDateTime fechaEnvio;
    
    // Getters y Setters
    public Long getId() { return id; }
    public void setId(Long id) { this.id = id; }
    
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
    
    public Boolean getLeida() { return leida; }
    public void setLeida(Boolean leida) { this.leida = leida; }
    
    public Boolean getEnviada() { return enviada; }
    public void setEnviada(Boolean enviada) { this.enviada = enviada; }
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
}
