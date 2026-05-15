package com.quickbite.kitchen.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.CONFLICT)
public class OrderAlreadyExistsException extends RuntimeException {
    
    public OrderAlreadyExistsException(String message) {
        super(message);
    }
    
    public OrderAlreadyExistsException(String message, Throwable cause) {
        super(message, cause);
    }
}
