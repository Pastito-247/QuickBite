package com.quickbite.kitchen.service;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import io.github.resilience4j.circuitbreaker.CircuitBreaker;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;

@Service
public class NotificationService {
    
    private static final Logger logger = LoggerFactory.getLogger(NotificationService.class);
    
    @Autowired
    private WebClient.Builder webClientBuilder;
    
    @Autowired
    private CircuitBreaker deliveryServiceCircuitBreaker;
    
    @Value("${delivery.service.url}")
    private String deliveryServiceUrl;
    
    @Value("${delivery.service.timeout:5s}")
    private String timeout;
    
    public void notifyDeliveryService(String orderNumber) {
        logger.info("Notifying delivery service for order: {}", orderNumber);
        
        String notificationUrl = deliveryServiceUrl + "/notifications/order-ready";
        
        DeliveryNotificationRequest notification = new DeliveryNotificationRequest(orderNumber);
        
        try {
            String response = deliveryServiceCircuitBreaker.executeSupplier(() -> {
                logger.info("Making request to delivery service at: {}", notificationUrl);
                return webClientBuilder.build()
                    .post()
                    .uri(notificationUrl)
                    .bodyValue(notification)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.parse("PT" + timeout.toUpperCase()))
                    .block();
            });
            
            logger.info("Delivery service notification successful for order: {}. Response: {}", orderNumber, response);
            
        } catch (Exception e) {
            logger.error("Failed to notify delivery service for order: {}", orderNumber, e);
            handleDeliveryServiceFailure(orderNumber, e);
        }
    }
    
    private String handleDeliveryServiceFailure(String orderNumber, Throwable throwable) {
        logger.warn("Delivery service unavailable for order: {}. Implementing fallback mechanism.", orderNumber);
        
        // Fallback: Could implement alternative notification methods
        // 1. Queue notification for retry
        // 2. Send email notification
        // 3. Log for manual intervention
        
        return "Notification queued for retry";
    }
    
    public boolean isDeliveryServiceAvailable() {
        try {
            String healthUrl = deliveryServiceUrl + "/actuator/health";
            Boolean result = deliveryServiceCircuitBreaker.executeSupplier(() -> {
                return webClientBuilder.build()
                    .get()
                    .uri(healthUrl)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(java.time.Duration.parse("PT" + timeout.toUpperCase()))
                    .map(response -> true)
                    .onErrorReturn(false)
                    .block();
            });
            
            return result != null ? result : false;
        } catch (Exception e) {
            logger.error("Error checking delivery service availability", e);
            return false;
        }
    }
    
    private static class DeliveryNotificationRequest {
        private String orderNumber;
        private String message;
        private java.time.LocalDateTime timestamp;
        
        public DeliveryNotificationRequest(String orderNumber) {
            this.orderNumber = orderNumber;
            this.message = "Order is ready for delivery";
            this.timestamp = java.time.LocalDateTime.now();
        }
        
        // Getters and Setters
        public String getOrderNumber() {
            return orderNumber;
        }
        
        public void setOrderNumber(String orderNumber) {
            this.orderNumber = orderNumber;
        }
        
        public String getMessage() {
            return message;
        }
        
        public void setMessage(String message) {
            this.message = message;
        }
        
        public java.time.LocalDateTime getTimestamp() {
            return timestamp;
        }
        
        public void setTimestamp(java.time.LocalDateTime timestamp) {
            this.timestamp = timestamp;
        }
    }
}
