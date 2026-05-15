package com.quickbite.payment_service.controller;

import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api")
@CrossOrigin(origins = "*")
public class HealthController {

    @GetMapping("/health")
    public Map<String, Object> health() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "payment-service");
        health.put("timestamp", LocalDateTime.now());
        health.put("version", "1.0.0");
        return health;
    }

    @GetMapping("/ready")
    public Map<String, Object> ready() {
        Map<String, Object> ready = new HashMap<>();
        ready.put("status", "READY");
        ready.put("service", "payment-service");
        ready.put("timestamp", LocalDateTime.now());
        return ready;
    }
}
