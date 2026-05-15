package com.quickbite.kitchen.exception;

import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.ResponseStatus;

@ResponseStatus(HttpStatus.SERVICE_UNAVAILABLE)
public class NotificationException extends RuntimeException {
    
    public NotificationException(String message) {
        super(message);
    }
    
    public NotificationException(String message, Throwable cause) {
        super(message, cause);
    }
}
