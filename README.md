# QuickBite - Sistema de Gestión de Restaurantes

Arquitectura de microservicios para la gestión moderna de restaurantes de comida rápida.

## 🚀 Inicio Rápido para Evaluación Local

### Prerrequisitos
- Node.js 18+
- Java 17+
- Maven 3.6+
- MySQL 8.0+

### Iniciar el Sistema
**Windows con MySQL (Recomendado para evaluación):**
```bash
START_MYSQL.bat
```

**Windows sin MySQL (Mock Server):**
```bash
START_EVALUACION.bat
```

### Acceso a la Aplicación
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Server**: http://localhost:8761

### Credenciales de Prueba
| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@quickbite.com | admin123 |
| Cocina | kitchen@quickbite.com | kitchen123 |
| Cliente | customer@quickbite.com | customer123 |

## 🏗️ Arquitectura

### Microservicios Implementados
- **Auth Service** (`quickbite-Auth-main`) - Autenticación y autorización
- **Inventory Service** (`quickbite-ms-inventario`) - Gestión de inventario
- **Menu Service** (`quickbite-menu-service`) - Catálogo de productos
- **Order Service** (`quickbite-pedidos-main`) - Procesamiento de pedidos
- **Payment Service** (`quickbite-payment-service`) - Gestión de pagos
- **Kitchen Service** (`quickbite-kitchen-service`) - Sistema de visualización de cocina (KDS)
- **Notification Service** (`quickbite-ms-notificaciones`) - Sistema de notificaciones

### Frontend
Aplicación React con las siguientes características:
- **Interfaz moderna** con Tailwind CSS
- **Navegación por roles** (Cliente, Cocina, Administrador)
- **Actualizaciones en tiempo real**
- **Diseño responsive**

## 📁 Estructura del Proyecto

```
QuickBite/
├── frontend/                    # Aplicación React
│   ├── src/
│   │   ├── components/         # Componentes reutilizables
│   │   ├── pages/             # Páginas principales
│   │   └── App.js             # Componente principal
│   └── package.json
├── Backend/                    # Microservicios
│   ├── quickbite-Auth-main/
│   ├── quickbite-ms-inventario/
│   ├── quickbite-menu-service/
│   ├── quickbite-pedidos-main/
│   ├── quickbite-payment-service/
│   ├── quickbite-kitchen-service/
│   └── quickbite-ms-notificaciones/
├── backend/                    # Gateway y Discovery
│   ├── api-gateway/           # API Gateway
│   └── eureka-server/         # Service Discovery
├── START.bat                   # Script de inicio
├── STOP.bat                    # Script de detención
└── README.md
```

## �️ Tecnologías

### Frontend
- **React 18** - Framework principal
- **React Router** - Navegación
- **Tailwind CSS** - Estilos
- **Lucide React** - Iconos
- **Axios** - Cliente HTTP
- **React Toastify** - Notificaciones

### Backend
- **Java 17** - Lenguaje principal
- **Spring Boot** - Framework
- **Spring Cloud** - Microservicios
- **MySQL** - Base de datos
- **Eureka** - Service Discovery

### Infraestructura
- **API Gateway** - Enrutamiento
- **Service Discovery** - Descubrimiento de servicios

## 📋 Funcionalidades

### Cliente
- 📋 Visualización del menú en tiempo real
- 🛒 Carrito de compras
- 📦 Seguimiento de pedidos
- 💳 Procesamiento de pagos

### Cocina (KDS)
- 👨‍🍳 Visualización de comandas
- ⏱️ Gestión de tiempos de preparación
- 📊 Actualización de estados
- 🔔 Notificaciones de pedidos urgentes

### Administrador
- 📊 Dashboard con estadísticas
- 📦 Gestión de inventario
- 🍔 Administración del menú
- 👥 Gestión de usuarios
- 📈 Reportes y análisis

## 🔌 Endpoints Principales

### API Gateway (Port 8080)
- `GET /api/auth/**` - Autenticación
- `GET /api/menu/**` - Gestión de menú
- `GET /api/inventory/**` - Inventario
- `GET /api/orders/**` - Pedidos
- `GET /api/payments/**` - Pagos
- `GET /api/kitchen/**` - Cocina
- `GET /api/notifications/**` - Notificaciones

## 🔄 Flujo de Trabajo

1. **Cliente** realiza un pedido a través del frontend
2. **API Gateway** enruta la petición al servicio correspondiente
3. **Order Service** procesa el pedido
4. **Inventory Service** actualiza el stock
5. **Kitchen Service** muestra la comanda en cocina
6. **Payment Service** procesa el pago
7. **Notification Service** envía confirmaciones

## 🛠️ Desarrollo Local

### Para detener los servicios
**Con MySQL:**
```bash
STOP_MYSQL.bat
```

**Sin MySQL:**
```bash
STOP.bat
```

### Monitoreo
- **Eureka Dashboard**: http://localhost:8761

## 🔒 Seguridad

- Autenticación basada en JWT
- Control de acceso por roles (RBAC)
- Comunicación cifrada entre servicios
- Validación de datos en todos los endpoints

## 📈 Escalabilidad

La arquitectura permite:
- Escalado horizontal de microservicios
- Balanceo de carga
- Tolerancia a fallos con Circuit Breaker
- Despliegue independiente de servicios

## 🤝 Contribución

1. Crear una feature branch
2. Implementar los cambios
3. Ejecutar pruebas
4. Crear Pull Request

## 📄 Licencia

Proyecto desarrollado para el curso Desarrollo Fullstack III - Duoc UC

**Integrantes:**
- Martin Céspedes
- Eduardo Chacana  
- Michelle Melo

**Docente:** Ignacio Cuturrufo
