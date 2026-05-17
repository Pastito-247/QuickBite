# QuickBite Kitchen Service

Microservicio para la coordinación de cocina (Kitchen Display System - KDS) del sistema QuickBite.

## Arquitectura

- **Tecnología**: Java 17 + Spring Boot 3.x
- **Base de Datos**: MySQL (Repository Pattern)
- **Comunicación**: REST API + Circuit Breaker
- **Contenedorización**: Docker

## Funcionalidades

- **RF-9**: Visualización de comandas en pantallas de cocina organizadas
- **RF-10**: Gestión de estados (Recibido, En preparación, Listo para entrega, Entregado)
- **RF-11**: Notificación automática al personal de entrega

## Estados de Pedido

- `RECIBIDO`: Pedido recibido en cocina
- `EN_PREPARACION`: Pedido en preparación
- `LISTO_ENTREGA`: Pedido listo para entrega
- `ENTREGADO`: Pedido entregado

## GitHub Flow

- `main`: Rama principal estable
- `feature/kitchen-service`: Desarrollo del microservicio

## Endpoints

- `GET /api/kitchen/orders`: Obtener órdenes activas
- `PUT /api/kitchen/orders/{id}/status`: Actualizar estado de orden
- `POST /api/kitchen/orders/{id}/notify`: Notificar al servicio de delivery

## Desarrollo

```bash
# Ejecutar en desarrollo
mvn spring-boot:run

# Construir imagen Docker
docker build -t quickbite/kitchen-service .
```
