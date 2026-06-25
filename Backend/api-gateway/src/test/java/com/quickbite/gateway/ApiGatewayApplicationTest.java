package com.quickbite.gateway;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class ApiGatewayApplicationTest {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring se carga correctamente
    }

    @Test
    void gatewayConfigurationLoads() {
        // Verifica que la configuración del gateway se carga correctamente
        // Esto se verifica implícitamente al cargar el contexto
    }
}
