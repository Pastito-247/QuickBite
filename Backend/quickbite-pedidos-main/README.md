# QuickBite - Microservicio de Pedidos

Microservicio Spring Boot para la gestión de pedidos del sistema QuickBite.

## 🚀 Características

- CRUD completo de pedidos con validaciones
- Estados del pedido (PENDIENTE → ENTREGADO)
- Items múltiples por pedido
- Cálculos automáticos (subtotal + 16% IVA + envío)
- API REST con paginación
- Base de datos MySQL

## 🛠️ Requisitos

- Java 21
- Maven 3.8+
- MySQL 8.0+
- Spring Boot 4.0.5

## ⚙️ Configuración

1. Crear base de datos:
```sql
CREATE DATABASE quickbite_pedidos;
```

2. Configurar `application.properties`:
```properties
spring.datasource.url=jdbc:mysql://localhost:3306/quickbite_pedidos?useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
spring.datasource.username=root
spring.datasource.password=
spring.jpa.hibernate.ddl-auto=update
```

## 🚀 Ejecución

```bash
./mvnw spring-boot:run
```

- **Puerto**: 8082
- **URL**: http://localhost:8082

## 📚 API Principal

### Crear Pedido
```bash
POST /api/v1/pedidos
Content-Type: application/json

{
  "clienteId": 1,
  "nombreCliente": "Juan Perez",
  "emailCliente": "juan@quickbite.com",
  "telefonoCliente": "123456789",
  "direccionEntrega": "Calle Principal 123",
  "metodoPago": "EFECTIVO",
  "costoEnvio": 50,
  "items": [
    {
      "productoId": 1,
      "nombreProducto": "Hamburguesa Clasica",
      "cantidad": 2,
      "precioUnitario": 15000
    }
  ]
}
```

### Otros Endpoints

- `GET /api/v1/pedidos/{id}` - Obtener pedido
- `GET /api/v1/pedidos/cliente/{id}` - Pedidos por cliente
- `GET /api/v1/pedidos/estado/{estado}` - Por estado
- `PUT /api/v1/pedidos/{id}/estado` - Actualizar estado
- `DELETE /api/v1/pedidos/{id}/cancelar` - Cancelar pedido
- `GET /api/v1/pedidos/estados` - Lista estados
- `GET /api/v1/pedidos/metodos-pago` - Lista métodos pago

## 🧪 Ejemplos cURL

```bash
# Crear pedido
curl -X POST http://localhost:8082/api/v1/pedidos \
  -H "Content-Type: application/json" \
  -d '{"clienteId": 1, "nombreCliente": "Juan Perez", "direccionEntrega": "Calle Principal 123", "metodoPago": "EFECTIVO", "items": [{"productoId": 1, "nombreProducto": "Hamburguesa", "cantidad": 2, "precioUnitario": 15000}]}'

# Consultar pedido
curl -X GET http://localhost:8082/api/v1/pedidos/1

# Actualizar estado
curl -X PUT http://localhost:8082/api/v1/pedidos/1/estado \
  -H "Content-Type: application/json" \
  -d '{"estado": "CONFIRMADO"}'
```

## 📋 Estados del Pedido

- `PENDIENTE` - Esperando confirmación
- `CONFIRMADO` - Confirmado, en preparación  
- `EN_PREPARACION` - Siendo preparado
- `LISTO` - Listo para entrega
- `EN_CAMINO` - En ruta de entrega
- `ENTREGADO` - Entregado
- `CANCELADO` - Cancelado

## 💳 Métodos de Pago

- EFECTIVO
- TARJETA_CREDITO
- TARJETA_DEBITO
- TRANSFERENCIA
- PAYPAL
- MERCADO_PAGO

## 🏗️ Estructura

```
src/main/java/com/quickbite/pedidos/
├── controller/     # Endpoints REST
├── service/        # Lógica de negocio  
├── repository/     # Consultas JPA
├── entity/         # Entidades JPA
├── dto/           # Transferencia de datos
└── exception/     # Manejo de errores
```

## 📊 Base de Datos

### Tablas
- `pedidos` - Pedidos principales
- `items_pedido` - Items de cada pedido

### Campos principales
- `numero_pedido` - Identificador único
- `estado` - Estado actual
- `total` - Total con impuestos (16%)
- `fecha_creacion` - Timestamp de creación

---

**QuickBite Pedidos** - Gestión eficiente de pedidos 🍔
