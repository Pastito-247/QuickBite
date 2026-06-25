package com.quickbite.pedidos.exception;

public class PedidoValidationException extends RuntimeException {
    
    public PedidoValidationException(String message) {
        super(message);
    }
    
    public PedidoValidationException(String message, Throwable cause) {
        super(message, cause);
    }
}
