# QuickBite Inventory Microservice

Microservicio de gestión de inventario para el sistema QuickBite, implementado con Spring Boot y arquitectura de microservicios.

## Características

- **Gestión de ingredientes**: CRUD completo para ingredientes con control de stock
- **Sincronización en tiempo real**: Deducción automática de stock con cada pedido
- **Alertas de stock crítico**: Notificaciones automáticas cuando el stock alcanza niveles mínimos
- **Control de disponibilidad**: Integración con servicio de menú para desactivar platos sin ingredientes
- **Resiliencia**: Circuit Breaker para tolerancia a fallos
- **Containerización**: Docker y Docker Compose para despliegue
- **Monitoreo**: Endpoints de health y métricas con Prometheus

## Tecnologías

- **Backend**: Spring Boot 3.2.0, Java 17
- **Base de datos**: MySQL 8.0
- **ORM**: Spring Data JPA con Hibernate
- **Migraciones**: Flyway
- **Resiliencia**: Resilience4j Circuit Breaker
- **Comunicación**: OpenFeign para microservicios
- **Container**: Docker
- **Testing**: JUnit 5, TestContainers

## Estructura del Proyecto

```
src/main/java/com/ms_inventario/inv/
  controller/          # REST Controllers
  service/             # Lógica de negocio
  repository/          # Capa de datos (Repository Pattern)
  entity/              # Entidades JPA
  dto/                 # Data Transfer Objects
  config/              # Configuraciones (Circuit Breaker, Feign)
  client/              # Clientes Feign para otros microservicios
  exception/           # Excepciones personalizadas
```

## Endpoints API

### Gestión de Ingredientes
- `POST /api/inventory/inventory` - Crear ingrediente
- `GET /api/inventory/inventory/{id}` - Obtener ingrediente por ID
- `GET /api/inventory/inventory` - Listar todos los ingredientes activos
- `PUT /api/inventory/inventory/{id}` - Actualizar ingrediente
- `DELETE /api/inventory/inventory/{id}` - Eliminar (desactivar) ingrediente

### Gestión de Stock
- `POST /api/inventory/inventory/deduct-stock` - Deductir stock por pedido
- `POST /api/inventory/inventory/{id}/add-stock` - Agregar stock
- `POST /api/inventory/inventory/{id}/adjust-stock` - Ajustar stock manualmente
- `POST /api/inventory/inventory/check-availability` - Verificar disponibilidad de múltiples ingredientes

### Reportes y Alertas
- `GET /api/inventory/inventory/critical-stock` - Ingredientes con stock crítico
- `GET /api/inventory/inventory/out-of-stock` - Ingredientes sin stock
- `GET /api/inventory/inventory/{id}/movements` - Historial de movimientos de stock

### Health Check
- `GET /api/inventory/inventory/health` - Verificar estado del servicio

## Configuración

### Variables de Entorno
- `DB_HOST`: Host de base de datos (default: localhost)
- `DB_PORT`: Puerto de base de datos (default: 3306)
- `DB_NAME`: Nombre de la base de datos (default: quickbite_inventory)
- `DB_USERNAME`: Usuario de base de datos (default: inventory_user)
- `DB_PASSWORD`: Contraseña de base de datos (default: inventory_pass)

### Perfiles
- `default`: Configuración para desarrollo local
- `docker`: Configuración para contenedores Docker
- `test`: Configuración para pruebas (H2 in-memory)

## Despliegue

### Local
```bash
# Compilar el proyecto
mvn clean package

# Ejecutar la aplicación
java -jar target/inv-0.0.1-SNAPSHOT.jar
```

### Docker
```bash
# Construir imagen
docker build -t quickbite-inventory .

# Ejecutar contenedor
docker run -p 8082:8082 quickbite-inventory
```

### Docker Compose
```bash
# Iniciar todos los servicios (MySQL + Inventory)
docker-compose up -d

# Ver logs
docker-compose logs -f inventory-service

# Detener servicios
docker-compose down
```

## Base de Datos

El servicio utiliza MySQL con migraciones Flyway:

- **Tabla `ingredients`**: Almacena información de ingredientes
- **Tabla `stock_movements`**: Registra todos los movimientos de stock

Las migraciones se encuentran en `src/main/resources/db/migration/`

## Testing

### Ejecutar Tests
```bash
# Ejecutar todos los tests
mvn test

# Ejecutar tests con cobertura
mvn test jacoco:report
```

### Tests de Integración
Los tests utilizan TestContainers para levantar una base de datos real MySQL y probar la integración completa del servicio.

## Monitoreo

### Health Endpoints
- `GET /api/inventory/actuator/health` - Health check
- `GET /api/inventory/actuator/metrics` - Métricas de la aplicación
- `GET /api/inventory/actuator/prometheus` - Métricas en formato Prometheus

### Circuit Breaker
El servicio implementa Circuit Breaker con Resilience4j:
- Umbral de fallos: 50%
- Tiempo de espera en estado abierto: 5 segundos
- Ventana deslizante: 10 llamadas

## Integración con otros Microservicios

### Cliente de Notificación
- Notifica sobre stock crítico y agotado
- URL configurable via `services.notification-service.url`

### Cliente de Menú
- Comunica disponibilidad de ingredientes
- URL configurable via `services.menu-service.url`

## Arquitectura

El servicio sigue los siguientes patrones:

- **Repository Pattern**: Abstracción de la capa de datos
- **DTO Pattern**: Transferencia de datos entre capas
- **Circuit Breaker**: Tolerancia a fallos en comunicaciones externas
- **Transaction Management**: Consistencia de datos con Spring @Transactional
- **Exception Handling**: Manejo centralizado de excepciones

## Requerimientos Funcionales Implementados

- **RF-1**: Sincronización de stock en tiempo real
- **RF-2**: Alertas de inventario crítico
- **RF-3**: Control de disponibilidad (integración con servicio de menú)
- **RF-4**: Gestión administrativa de precios y descripciones

## Requerimientos No Funcionales Implementados

- **RNF-1**: Escalabilidad horizontal (containerización)
- **RNF-3**: Tolerancia a fallos (Circuit Breaker)
- **RNF-5**: Control de acceso (ready para integración con IAM)
- **RNF-7**: Baja latencia (optimizaciones de consultas)
- **RNF-10**: Sostenibilidad técnica (arquitectura modular)

## Licencia

© 2024 QuickBite Team. Todos los derechos reservados.
