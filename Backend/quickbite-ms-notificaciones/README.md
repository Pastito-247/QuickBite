# Microservicio de Notificaciones - QuickBite

Microservicio de Spring Boot para gestionar notificaciones en tiempo real del sistema QuickBite.

## Arquitectura y Tecnologías

- **Spring Boot 3.2.0** - Framework principal
- **Spring Data JPA** - Persistencia de datos
- **Spring Security + JWT** - Autenticación y autorización
- **MySQL 8.0** - Base de datos
- **Redis** - Caché distribuida
- **Spring Cloud Eureka** - Service Discovery
- **Resilience4J** - Circuit Breaker
- **OpenFeign** - Client HTTP
- **Micrometer + Prometheus** - Métricas y observabilidad
- **Zipkin** - Distributed tracing
- **OpenAPI/Swagger** - Documentación API
- **Docker** - Contenerización
- **Maven** - Gestión de dependencias
- **BCrypt/BouncyCastle** - Cifrado AES-256-GCM

## Requerimientos Funcionales Implementados

### RF-2: Alertas de inventario crítico
- Generación automática de notificaciones cuando un ingrediente alcanza nivel crítico
- Notificación inmediata al sistema de administración

### RF-11: Notificación de despacho
- Notificación automática al personal de entrega cuando un pedido cambia a estado "Listo para entrega"
- Integración con sistema de coordinación de cocina

## Estructura del Proyecto

```
src/main/java/com/ms_notificaciones/not/
├── NotificacionesServiceApplication.java    # Clase principal
├── config/
│   ├── CircuitBreakerConfiguration.java    # Configuración Circuit Breaker
│   └── OpenApiConfig.java                  # Configuración Swagger/OpenAPI
├── controller/
│   └── NotificacionController.java         # Endpoints REST con Swagger
├── dto/
│   ├── NotificacionRequest.java            # DTO de entrada
│   └── NotificacionResponse.java           # DTO de salida
├── exception/
│   ├── GlobalExceptionHandler.java         # Manejo global de excepciones
│   └── NotificacionNotFoundException.java  # Excepción personalizada
├── model/
│   ├── Notificacion.java                   # Entidad principal
│   └── TipoNotificacion.java               # Enum de tipos
├── repository/
│   └── NotificacionRepository.java         # Repositorio JPA con paginación
├── security/
│   ├── JwtUtil.java                        # Utilidad JWT
│   ├── JwtAuthenticationFilter.java       # Filtro de autenticación
│   ├── SecurityConfig.java                 # Configuración de seguridad
│   └── EncryptionService.java              # Servicio de cifrado AES-256-GCM
└── service/
    ├── NotificacionService.java            # Servicio principal con métricas
    ├── InventarioNotificacionService.java  # Servicio inventario (RF-2)
    └── PedidoNotificacionService.java      # Servicio pedidos (RF-11)

src/test/java/com/ms_notificaciones/not/
├── service/
│   └── NotificacionServiceTest.java        # Pruebas unitarias
├── controller/
│   └── NotificacionControllerIntegrationTest.java  # Pruebas de integración
└── security/
    └── JwtUtilTest.java                    # Pruebas de seguridad JWT
```

## Endpoints REST

### Gestión de Notificaciones
- `POST /api/notificaciones` - Crear notificación general
- `GET /api/notificaciones/usuario/{id}/no-leidas` - Obtener no leídas
- `PUT /api/notificaciones/{id}/marcar-leida` - Marcar como leída
- `GET /api/notificaciones/restaurante/{id}` - Por restaurante

### Endpoints Específicos

#### Inventario (RF-2)
```bash
POST /api/notificaciones/inventario-critico
Content-Type: application/x-www-form-urlencoded

idIngrediente=ING001&idRestaurante=1&nombreIngrediente=Tomate&stockActual=5&stockMinimo=10
```

#### Pedidos (RF-11)
```bash
POST /api/notificaciones/pedido/PED123/estado
Content-Type: application/x-www-form-urlencoded

estado=LISTO&idRestaurante=1&idUsuarioDestino=45
```

Estados válidos: `RECIBIDO`, `PREPARACION`, `LISTO`, `ENTREGADO`

## Configuración

### Base de Datos
```yaml
spring:
  datasource:
    url: jdbc:mysql://localhost:3306/quickbite_notificaciones
    username: root
    password: password
```

### Eureka
```yaml
spring:
  cloud:
    eureka:
      client:
        service-url:
          defaultZone: http://localhost:8761/eureka/
```

## Instalación y Ejecución

### Prerrequisitos
- Java 17+
- Maven 3.8+
- MySQL 8.0+
- Docker (opcional)

### 1. Base de Datos
```sql
CREATE DATABASE quickbite_notificaciones;
```

### 2. Compilar y Ejecutar
```bash
# Compilar
mvn clean compile

# Ejecutar pruebas
mvn test

# Iniciar aplicación
mvn spring-boot:run
```

### 3. Docker
```bash
# Construir imagen
docker build -t notificaciones-service .

# Ejecutar con docker-compose
docker-compose up -d
```

## Seguridad y Autenticación (RNF-5, RNF-6)

### JWT Authentication
Todas las APIs (excepto Swagger y Actuator públicos) requieren autenticación JWT.

**Header requerido:**
```
Authorization: Bearer <token_jwt>
```

### Roles Disponibles
- **ADMIN**: Acceso completo a todas las operaciones
- **SYSTEM**: Servicios internos, alertas automáticas
- **COCINA**: Actualización de estados de pedidos, visualización de comandas
- **REPARTIDOR**: Notificaciones de despacho
- **CLIENTE**: Ver sus notificaciones, historial

### Endpoints por Rol

| Endpoint | Roles Permitidos |
|----------|-----------------|
| POST /api/notificaciones | ADMIN, SYSTEM, CLIENTE |
| GET /api/notificaciones/usuario/{id}/no-leidas | ADMIN, CLIENTE, COCINA, REPARTIDOR |
| PUT /api/notificaciones/{id}/marcar-leida | ADMIN, CLIENTE, COCINA, REPARTIDOR |
| GET /api/notificaciones/restaurante/{id} | ADMIN, COCINA |
| POST /api/notificaciones/inventario-critico | ADMIN, SYSTEM |
| POST /api/notificaciones/pedido/{id}/estado | ADMIN, COCINA, SYSTEM |

### Cifrado de Datos (RNF-6)
- Cifrado AES-256-GCM para datos sensibles en reposo
- Hashing SHA-256 para datos sensibles de identificación
- BCrypt para almacenamiento seguro de credenciales

## Circuit Breaker

Configurado con Resilience4J para manejar fallos en servicios externos:

- **inventario-service**: 50% fallos abre circuito, timeout 5s
- **pedido-service**: 60% fallos abre circuito, timeout 3s

## Monitoreo y Observabilidad

### Endpoints de Actuator
- **Health**: http://localhost:8084/actuator/health
- **Info**: http://localhost:8084/actuator/info
- **Metrics**: http://localhost:8084/actuator/metrics
- **Prometheus**: http://localhost:8084/actuator/prometheus
- **Circuit Breakers**: http://localhost:8084/actuator/circuitbreakers

### Documentación API (Swagger)
- **Swagger UI**: http://localhost:8084/swagger-ui.html
- **API Docs**: http://localhost:8084/v3/api-docs

### Métricas Disponibles
- JVM Memory, GC, Threads
- HTTP Request duration and count
- Custom business metrics
- Circuit breaker state
- Database connection pool

### Distributed Tracing
- **Zipkin**: http://localhost:9411 (si está configurado)

## Integración con API Gateway

Para integrar con el API Gateway, agregar la siguiente ruta:

```yaml
spring:
  cloud:
    gateway:
      routes:
        - id: notificaciones-service
          uri: lb://notificaciones-service
          predicates:
            - Path=/api/notificaciones/**
```

## Ejemplos de Uso

### Crear alerta de inventario crítico
```bash
curl -X POST "http://localhost:8084/api/notificaciones/inventario-critico" \
  -d "idIngrediente=ING001&idRestaurante=1&nombreIngrediente=Tomate&stockActual=5&stockMinimo=10"
```

### Notificar pedido listo
```bash
curl -X POST "http://localhost:8084/api/notificaciones/pedido/PED123/estado" \
  -d "estado=LISTO&idRestaurante=1&idUsuarioDestino=45"
```

### Obtener notificaciones no leídas
```bash
curl -X GET "http://localhost:8084/api/notificaciones/usuario/45/no-leidas"
```

## Testing

El proyecto incluye pruebas unitarias e integración con cobertura completa:

### Ejecutar Pruebas
```bash
# Todas las pruebas
mvn test

# Solo pruebas unitarias
mvn test -Dtest=NotificacionServiceTest

# Solo pruebas de integración
mvn test -Dtest=NotificacionControllerIntegrationTest

# Con cobertura
mvn jacoco:report
```

### Tipos de Pruebas

1. **Pruebas Unitarias** (`NotificacionServiceTest`)
   - Lógica de negocio
   - Manejo de excepciones
   - Conversión de DTOs
   - Circuit Breaker

2. **Pruebas de Integración** (`NotificacionControllerIntegrationTest`)
   - Endpoints REST
   - Seguridad JWT
   - Validaciones
   - Swagger/OpenAPI

3. **Pruebas de Seguridad** (`JwtUtilTest`)
   - Generación/validación de tokens
   - Expiración de tokens
   - Extracción de roles
   - Cifrado/descifrado

### Cobertura Esperada
- Líneas de código: >80%
- Branches: >70%
- Métodos públicos: 100%

## Logging

Configurado para mostrar logs en nivel DEBUG para el paquete del servicio:

```yaml
logging:
  level:
    com.ms_notificaciones.not: DEBUG
    org.springframework.cloud.circuitbreaker: DEBUG
```

## Desarrollo

### Agregar nuevo tipo de notificación
1. Agregar valor al enum `TipoNotificacion`
2. Actualizar lógica en `NotificacionService.procesarNotificacionPorTipo()`
3. Agregar endpoint específico si es necesario

### Extender Circuit Breaker
1. Agregar nueva configuración en `CircuitBreakerConfig`
2. Inyectar en servicio correspondiente
3. Usar con `circuitBreakerFactory.create("service-name")`

## Licencia

© QuickBite 2024 - Todos los derechos reservados
