package com.ms_notificaciones.not.exception;

public class NotificacionNotFoundException extends RuntimeException {
    
    public NotificacionNotFoundException(Long id) {
        super("Notification not found with id: " + id);
    }
    
    public NotificacionNotFoundException(String message) {
        super(message);
    }
}
