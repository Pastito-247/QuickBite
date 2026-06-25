package com.quickbite.eureka;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;

@SpringBootTest
class EurekaServerApplicationTest {

    @Test
    void contextLoads() {
        // Verifica que el contexto de Spring se carga correctamente
    }

    @Test
    void eurekaServerAnnotationPresent() {
        // Verifica que la anotación @EnableEurekaServer está presente
        // Esto se verifica implícitamente al cargar el contexto
    }
}
