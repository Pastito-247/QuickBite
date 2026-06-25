package com.ms_inventario.inv.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.NOT_FOUND)
public class IngredientNotFoundException extends RuntimeException {
    
    public IngredientNotFoundException(String message) {
        super(message);
    }
    
    public IngredientNotFoundException(String message, Throwable cause) {
        super(message, cause);
    }
}
