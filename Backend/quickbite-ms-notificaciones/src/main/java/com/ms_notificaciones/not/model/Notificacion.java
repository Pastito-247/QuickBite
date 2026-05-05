package com.ms_notificaciones.not.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "notificaciones")
public class Notificacion {
    
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    @Column(nullable = false)
    @Enumerated(EnumType.STRING)
    private TipoNotificacion tipo;
    
    @Column(nullable = false)
    private String mensaje;
    
    @Column(name = "id_referencia")
    private String idReferencia; // ID del pedido o ingrediente relacionado
    
    @Column(name = "id_restaurante")
    private Long idRestaurante;
    
    @Column(name = "id_usuario_destino")
    private Long idUsuarioDestino;
    
    @Column(name = "leida")
    private Boolean leida = false;
    
    @Column(name = "fecha_creacion")
    private LocalDateTime fechaCreacion = LocalDateTime.now();
    
    @Column(name = "fecha_envio")
    private LocalDateTime fechaEnvio;
    
    @Column(name = "enviada")
    private Boolean enviada = false;
    
    // Constructor por defecto
    public Notificacion() {}
    
    // Constructor con todos los campos
    public Notificacion(Long id, TipoNotificacion tipo, String mensaje, String idReferencia, 
                       Long idRestaurante, Long idUsuarioDestino, Boolean leida, 
                       LocalDateTime fechaCreacion, LocalDateTime fechaEnvio, Boolean enviada) {
        this.id = id;
        this.tipo = tipo;
        this.mensaje = mensaje;
        this.idReferencia = idReferencia;
        this.idRestaurante = idRestaurante;
        this.idUsuarioDestino = idUsuarioDestino;
        this.leida = leida;
        this.fechaCreacion = fechaCreacion;
        this.fechaEnvio = fechaEnvio;
        this.enviada = enviada;
    }
    
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
    
    public LocalDateTime getFechaCreacion() { return fechaCreacion; }
    public void setFechaCreacion(LocalDateTime fechaCreacion) { this.fechaCreacion = fechaCreacion; }
    
    public LocalDateTime getFechaEnvio() { return fechaEnvio; }
    public void setFechaEnvio(LocalDateTime fechaEnvio) { this.fechaEnvio = fechaEnvio; }
    
    public Boolean getEnviada() { return enviada; }
    public void setEnviada(Boolean enviada) { this.enviada = enviada; }
}
