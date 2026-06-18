# API Gateway - QuickBite

## Descripción
API Gateway es el punto de entrada principal para todas las solicitudes de los clientes al sistema QuickBite. Actúa como un proxy inverso, balanceador de carga y puerta de enlace para todos los microservicios del sistema.

## Tecnologías
- Spring Boot 4.0.5
- Spring Cloud Gateway
- Netflix Eureka (Service Discovery)
- Spring Security
- Resilience4j (Circuit Breaker, Retry, Rate Limiting)

## Funcionalidades
- Enrutamiento de solicitudes a microservicios específicos
- Balanceo de carga entre instancias de servicios
- Autenticación y autorización centralizada
- Circuit Breaker para resiliencia
- Rate Limiting para protección contra sobrecarga
- Logging y monitoreo de solicitudes

## Configuración de Rutas

### Rutas Configuradas
- `/api/auth/**` → quickbite-Auth-main (puerto 8081)
- `/api/inventory/**` → quickbite-ms-inventario (puerto 8082)
- `/api/menu/**` → quickbite-menu-service (puerto 8083)
- `/api/pedidos/**` → quickbite-pedidos-main (puerto 8084)
- `/api/kitchen/**` → quickbite-kitchen-service (puerto 8085)
- `/api/notificaciones/**` → quickbite-ms-notificaciones (puerto 8086)
- `/api/payments/**` → quickbite-payment-service (puerto 8087)

## Instalación

### Requisitos Previos
- Java 21
- Maven 3.6+
- Eureka Server ejecutándose en puerto 8761

### Pasos de Instalación
1. Clonar el repositorio:
```bash
git clone https://github.com/Pastito-247/QuickBite.git
cd Backend/api-gateway
```

2. Configurar application.yml:
```yaml
server:
  port: 8080

spring:
  application:
    name: api-gateway
  cloud:
    gateway:
      discovery:
        locator:
          enabled: true
eureka:
  client:
    service-url:
      defaultZone: http://localhost:8761/eureka/
```

3. Compilar el proyecto:
```bash
mvn clean install
```

4. Ejecutar el servicio:
```bash
mvn spring-boot:run
```

## Uso

### Acceder a la API
Una vez que el gateway está ejecutándose, puedes acceder a los microservicios a través del puerto 8080:

```bash
# Autenticación
curl http://localhost:8080/api/auth/authenticate

# Menú
curl http://localhost:8080/api/menu/available

# Pedidos
curl http://localhost:8080/api/pedidos
```

### Filtros y Middlewares
El gateway incluye los siguientes filtros:
- **AuthenticationFilter**: Valida tokens JWT
- **LoggingFilter**: Registra todas las solicitudes
- **RateLimitFilter**: Limita la tasa de solicitudes por IP
- **CircuitBreakerFilter**: Implementa circuit breaker para resiliencia

## Configuración de Circuit Breaker
```yaml
resilience4j:
  circuitbreaker:
    instances:
      circuitBreaker:
        failure-rate-threshold: 50
        wait-duration-in-open-state: 5s
        sliding-window-size: 10
```

## Monitoreo
El gateway expone endpoints de Actuator para monitoreo:
- `/actuator/health` - Estado de salud del servicio
- `/actuator/metrics` - Métricas del sistema
- `/actuator/gateway` - Información de rutas del gateway

## Troubleshooting

### Problemas Comunes
1. **Gateway no puede conectar con Eureka Server**
   - Verificar que Eureka Server esté ejecutándose en puerto 8761
   - Verificar la configuración de `eureka.client.service-url.defaultZone`

2. **Rutas no funcionan**
   - Verificar que los microservicios estén registrados en Eureka
   - Verificar la configuración de rutas en application.yml

3. **Errores de autenticación**
   - Verificar que el token JWT sea válido
   - Verificar la configuración de Spring Security

## Dependencias
```xml
<dependencies>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-gateway</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.cloud</groupId>
        <artifactId>spring-cloud-starter-netflix-eureka-client</artifactId>
    </dependency>
    <dependency>
        <groupId>org.springframework.boot</groupId>
        <artifactId>spring-boot-starter-actuator</artifactId>
    </dependency>
    <dependency>
        <groupId>io.github.resilience4j</groupId>
        <artifactId>resilience4j-spring-boot-starter</artifactId>
    </dependency>
</dependencies>
```

## Desarrollo
Para ejecutar el gateway en modo desarrollo:
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

## Contribución
Para contribuir al desarrollo del API Gateway:
1. Crear una rama desde `main`
2. Hacer los cambios necesarios
3. Ejecutar las pruebas: `mvn test`
4. Crear un Pull Request

## Licencia
Este proyecto es parte de QuickBite y está bajo la misma licencia del proyecto principal.
