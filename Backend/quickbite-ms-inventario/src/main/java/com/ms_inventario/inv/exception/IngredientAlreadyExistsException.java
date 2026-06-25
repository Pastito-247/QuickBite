package com.ms_inventario.inv.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(value = HttpStatus.CONFLICT)
public class IngredientAlreadyExistsException extends RuntimeException {
    
    public IngredientAlreadyExistsException(String message) {
        super(message);
    }
    
    public IngredientAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
