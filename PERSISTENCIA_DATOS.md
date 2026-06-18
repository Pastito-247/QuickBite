DESCRIPCIÓN DE PERSISTENCIA DE DATOS - QUICKBITE
================================================
Fecha: 17 de junio de 2026
Proyecto: Sistema de Pedidos de Comida QuickBite

INTRODUCCIÓN
============
Este documento describe la persistencia de datos para cada microservicio del sistema QuickBite, incluyendo las bases de datos utilizadas, las entidades principales y las relaciones entre ellas.

TECNOLOGÍAS DE PERSISTENCIA
============================
- Base de datos: MySQL 8.0
- ORM: Spring Data JPA (Hibernate)
- Migraciones: Flyway (en algunos servicios)
- Validaciones: Jakarta Bean Validation

MICROSERVICIOS Y PERSISTENCIA
==============================

1. SERVICIO DE AUTENTICACIÓN (quickbite-Auth-main)
---------------------------------------------------
Base de datos: auth_db

Entidades principales:
- User
  - id (Long, Primary Key, Auto-increment)
  - username (String, Unique, Not Null)
  - email (String, Unique, Not Null)
  - password (String, Not Null, BCrypt encrypted)
  - firstName (String)
  - lastName (String)
  - phoneNumber (String)
  - profileImage (String)
  - address (String)
  - role (Enum: CLIENT, KITCHEN, ADMIN, DELIVERY)
  - enabled (Boolean, Default: true)
  - accountNonExpired (Boolean)
  - accountNonLocked (Boolean)
  - credentialsNonExpired (Boolean)
  - createdAt (LocalDateTime)
  - updatedAt (LocalDateTime)

Repositorios:
- UserRepository
  - findByUsername(String username)
  - findByEmail(String email)
  - existsByUsername(String username)
  - existsByEmail(String email)

Índices:
- UNIQUE INDEX on username
- UNIQUE INDEX on email

2. SERVICIO DE INVENTARIO (quickbite-ms-inventario)
---------------------------------------------------
Base de datos: inventario_db

Entidades principales:
- Ingredient
  - id (Long, Primary Key, Auto-increment)
  - name (String, Not Null)
  - description (String)
  - category (String)
  - unit (String)
  - currentStock (Integer, Default: 0)
  - minimumStock (Integer, Default: 0)
  - costPerUnit (BigDecimal)
  - supplier (String)
  - isActive (Boolean, Default: true)
  - createdAt (LocalDateTime)
  - updatedAt (LocalDateTime)

Repositorios:
- InventoryRepository
  - findAllActiveIngredients()
  - findById(Long id)
  - save(Ingredient ingredient)
  - deleteById(Long id)
  - findByCategory(String category)
  - findCriticalStockIngredients()
  - findOutOfStockIngredients()
  - findAllByIdWithLock(List<Long> ids)

Índices:
- INDEX on category
- INDEX on isActive
- INDEX on currentStock

3. SERVICIO DE MENÚ (quickbite-menu-service)
--------------------------------------------
Base de datos: menu_db

Entidades principales:
- MenuItem
  - id (Long, Primary Key, Auto-increment)
  - name (String, Not Null)
  - description (String)
  - price (BigDecimal, Not Null, Positive)
  - category (String)
  - available (Boolean, Default: true)
  - restaurantId (Long)
  - imageUrl (String)
  - createdAt (LocalDateTime)
  - updatedAt (LocalDateTime)

- MenuItemIngredient
  - id (Long, Primary Key, Auto-increment)
  - menuItemId (Long)
  - ingredientId (Long)
  - quantity (Integer)
  - ingredientName (String)

Repositorios:
- MenuRepository
  - findByAvailableTrue()
  - findById(Long id)
  - save(MenuItem menuItem)
  - deleteById(Long id)
  - findByCategory(String category)
  - findByAvailableFalse()
  - findAll()
  - countByCategory(String category)

- MenuItemIngredientRepository
  - findByMenuItemId(Long menuItemId)
  - save(MenuItemIngredient menuItemIngredient)
  - deleteByMenuItemId(Long menuItemId)

Índices:
- INDEX on category
- INDEX on available
- INDEX on restaurantId
- INDEX on menuItemId (MenuItemIngredient)

4. SERVICIO DE PEDIDOS (quickbite-pedidos-main)
-----------------------------------------------
Base de datos: pedidos_db

Entidades principales:
- Pedido
  - id (Long, Primary Key, Auto-increment)
  - numeroPedido (String, Unique, Not Null)
  - clienteId (Long, Not Null)
  - nombreCliente (String, Not Null)
  - emailCliente (String)
  - telefonoCliente (String)
  - direccionEntrega (String, Not Null)
  - restaurantId (Long)
  - estado (Enum: PENDIENTE, CONFIRMADO, EN_PREPARACION, LISTO, EN_CAMINO, ENTREGADO, CANCELADO)
  - metodoPago (Enum: EFECTIVO, TARJETA_CREDITO, TARJETA_DEBITO, TRANSFERENCIA, PAYPAL, MERCADO_PAGO)
  - subtotal (BigDecimal, Not Null)
  - impuesto (BigDecimal, Not Null)
  - total (BigDecimal, Not Null)
  - costoEnvio (BigDecimal, Default: 0)
  - notasCliente (String)
  - notasRestaurante (String)
  - tiempoEstimadoMinutos (Integer)
  - fechaCreacion (LocalDateTime, Not Null)
  - fechaActualizacion (LocalDateTime)
  - fechaEntrega (LocalDateTime)

- ItemPedido
  - id (Long, Primary Key, Auto-increment)
  - pedido (Pedido, Many-to-One)
  - productoId (Long)
  - nombreProducto (String)
  - cantidad (Integer, Not Null)
  - precioUnitario (BigDecimal, Not Null)

Repositorios:
- PedidoRepository
  - findById(Long id)
  - findByNumeroPedido(String numeroPedido)
  - findByClienteId(Long clienteId)
  - findByEstado(EstadoPedido estado)
  - findAll(Pageable pageable)
  - findByClienteId(Long clienteId, Pageable pageable)
  - findActiveOrders()
  - findByRestaurantId(Long restaurantId)
  - findByRestaurantId(Long restaurantId, Pageable pageable)
  - count()
  - sumTotalVentas()
  - countDistinctClientes()
  - statsByRestaurant()

- ItemPedidoRepository
  - findByPedidoId(Long pedidoId)
  - save(ItemPedido itemPedido)
  - deleteByPedidoId(Long pedidoId)

Índices:
- UNIQUE INDEX on numeroPedido
- INDEX on clienteId
- INDEX on estado
- INDEX on restaurantId
- INDEX on fechaCreacion
- INDEX on pedidoId (ItemPedido)

5. SERVICIO DE COCINA (quickbite-kitchen-service)
-------------------------------------------------
Base de datos: kitchen_db

Entidades principales:
- KitchenOrder
  - id (Long, Primary Key, Auto-increment)
  - orderNumber (String, Unique, Not Null)
  - customerName (String, Not Null)
  - items (List<String>, ElementCollection)
  - orderItems (List<OrderItem>, ElementCollection)
  - status (Enum: RECIBIDO, EN_PREPARACION, LISTO_ENTREGA, ENTREGADO, CANCELADO)
  - createdAt (LocalDateTime, Not Null)
  - startedAt (LocalDateTime)
  - readyAt (LocalDateTime)
  - deliveredAt (LocalDateTime)
  - estimatedPreparationTime (Integer, Not Null)
  - notes (String)

- OrderItem
  - menuItemId (Long)
  - itemName (String)
  - quantity (Integer)

Repositorios:
- KitchenOrderRepository
  - findById(Long id)
  - findByOrderNumber(String orderNumber)
  - existsByOrderNumber(String orderNumber)
  - save(KitchenOrder kitchenOrder)
  - findActiveOrdersOrderByCreatedAt()
  - findByStatus(OrderStatus status)
  - findByCreatedAtBetween(LocalDateTime start, LocalDateTime end)
  - countByStatusAndCreatedAtAfter(OrderStatus status, LocalDateTime since)
  - findByIdRestauranteAndFechaCreacionGreaterThanEqual(Long restaurantId, LocalDateTime fecha, Pageable pageable)
  - findNotificacionesRecientes(Long restaurantId, LocalDateTime fecha)

Índices:
- UNIQUE INDEX on orderNumber
- INDEX on status
- INDEX on createdAt
- INDEX on restaurantId

6. SERVICIO DE NOTIFICACIONES (quickbite-ms-notificaciones)
-----------------------------------------------------------
Base de datos: notificaciones_db

Entidades principales:
- Notificacion
  - id (Long, Primary Key, Auto-increment)
  - tipo (Enum: INVENTARIO_CRITICO, PEDIDO_LISTO, PEDIDO_RECIBIDO, PEDIDO_PREPARACION, PEDIDO_ENTREGADO)
  - mensaje (String, Not Null)
  - idReferencia (String)
  - idRestaurante (Long)
  - idUsuarioDestino (Long)
  - leida (Boolean, Default: false)
  - enviada (Boolean, Default: false)
  - fechaCreacion (LocalDateTime, Not Null)
  - fechaEnvio (LocalDateTime)

Repositorios:
- NotificacionRepository
  - findById(Long id)
  - save(Notificacion notificacion)
  - findByIdUsuarioDestinoAndLeidaFalseOrderByFechaCreacionDesc(Long idUsuario)
  - findByIdUsuarioDestinoAndLeidaFalse(Long idUsuario, Pageable pageable)
  - findByIdRestauranteAndFechaCreacionGreaterThanEqual(Long idRestaurante, LocalDateTime fecha, Pageable pageable)
  - findNotificacionesRecientes(Long idRestaurante, LocalDateTime fecha)

Índices:
- INDEX on idUsuarioDestino
- INDEX on leida
- INDEX on idRestaurante
- INDEX on fechaCreacion
- INDEX on tipo

7. SERVICIO DE PAGOS (quickbite-payment-service)
-------------------------------------------------
Base de datos: payment_db

Entidades principales:
- Payment
  - id (Long, Primary Key, Auto-increment)
  - orderId (String, Not Null)
  - amount (BigDecimal, Not Null)
  - currency (String, Default: USD)
  - status (Enum: PENDING, COMPLETED, FAILED, REFUNDED)
  - paymentMethod (String)
  - transactionId (String)
  - trackingId (String, Unique)
  - createdAt (LocalDateTime, Not Null)

- Transaction
  - id (Long, Primary Key, Auto-increment)
  - paymentId (Long, Not Null)
  - type (Enum: PAYMENT, REFUND, DEPOSIT, WITHDRAWAL)
  - amount (BigDecimal, Not Null)
  - description (String)
  - status (Enum: SUCCESS, FAILED, PENDING)
  - createdAt (LocalDateTime, Not Null)

- Wallet
  - id (Long, Primary Key, Auto-increment)
  - userId (String, Unique, Not Null)
  - balance (BigDecimal, Default: 0)
  - currency (String, Default: USD)
  - createdAt (LocalDateTime, Not Null)
  - updatedAt (LocalDateTime)

Repositorios:
- PaymentRepository
  - findById(Long id)
  - findByOrderId(String orderId)
  - findByStatus(PaymentStatus status)
  - save(Payment payment)
  - findAll(Pageable pageable)

- TransactionRepository
  - findByPaymentId(Long paymentId)
  - findByUserId(String userId)
  - save(Transaction transaction)
  - findAll(Pageable pageable)

- WalletRepository
  - findByUserId(String userId)
  - save(Wallet wallet)
  - findById(Long id)

Índices:
- UNIQUE INDEX on trackingId (Payment)
- INDEX on orderId (Payment)
- INDEX on status (Payment)
- INDEX on paymentId (Transaction)
- INDEX on userId (Wallet)
- UNIQUE INDEX on userId (Wallet)

8. EUREKA SERVER (quickbite-eureka-server)
------------------------------------------
Base de datos: No utiliza base de datos relacional
Persistencia: Memoria (Netflix Eureka Server)

Información registrada:
- Instancias de servicios registrados
- Estado de salud de servicios
- Metadatos de servicios
- Configuración de descubrimiento

9. API GATEWAY (api-gateway)
-----------------------------
Base de datos: No utiliza base de datos relacional
Persistencia: Configuración en memoria y archivos

Información registrada:
- Configuración de rutas
- Filtros y middlewares
- Balanceo de carga
- Rate limiting

RELACIONES ENTRE MICROSERVICIOS
================================

Flujo de datos:
1. Cliente → Frontend (React)
2. Frontend → API Gateway
3. API Gateway → Microservicios (via Eureka Server)
4. Microservicios → Bases de datos MySQL

Integraciones:
- Menu Service → Inventory Service (validación de stock)
- Order Service → Menu Service (obtención de platos)
- Order Service → Kitchen Service (notificación de pedidos)
- Kitchen Service → Menu Service (consumo de ingredientes)
- Payment Service → Order Service (actualización de estado)
- Notification Service → Todos los servicios (alertas)

CONSIDERACIONES DE SEGURIDAD
==============================
- Todas las contraseñas están encriptadas con BCrypt
- Las conexiones a bases de datos usan SSL/TLS
- Los datos sensibles están protegidos con roles y permisos
- Implementación de JWT para autenticación entre servicios

BACKUP Y RECUPERACIÓN
=====================
- Backups diarios de todas las bases de datos
- Retención de backups por 30 días
- Réplicas de lectura para servicios de alta demanda
- Logs de transacciones para recuperación point-in-time

CONCLUSIÓN
==========
El sistema QuickBite utiliza una arquitectura de microservicios con bases de datos MySQL separadas para cada servicio, asegurando independencia de datos y escalabilidad. Cada microservicio tiene su propio esquema de base de datos optimizado para sus necesidades específicas.
