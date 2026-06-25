# Quick Bite - Servicio de Autenticación

Microservicio de autenticación y autorización para Quick Bite con JWT y Spring Security.

## 🚀 Características

- ✅ Autenticación JWT con tokens stateless
- ✅ Control de acceso basado en roles (RBAC)
- ✅ Rate limiting y circuit breaker
- ✅ API REST con documentación Swagger
- ✅ Docker ready

## 🛠️ Tecnologías

- Java 21
- Spring Boot 4.0.5
- Spring Security + JWT
- MySQL 8.0
- Resilience4j
- Docker

## 📋 Roles

- **CLIENTE** - Clientes del restaurante
- **COCINA** - Personal de cocina
- **ADMIN** - Administradores
- **REPARTIDOR** - Repartidores

## 🏃‍♂️ Ejecución

### Local
```bash
# 1. Crear base de datos
CREATE DATABASE quickbite_auth;

# 2. Ejecutar aplicación
./mvnw spring-boot:run
```

### Docker
```bash
docker-compose up -d
```

La aplicación corre en `http://localhost:8081`

## 📚 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| POST | `/api/v1/auth/register` | Registrar usuario |
| POST | `/api/v1/auth/authenticate` | Iniciar sesión |
| POST | `/api/v1/auth/refresh` | Refrescar token |
| POST | `/api/v1/auth/validate` | Validar token |

### Ejemplo de uso

```bash
# Registrar usuario
curl -X POST http://localhost:8081/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juanperez",
    "email": "juan@quickbite.com", 
    "password": "password123",
    "firstName": "Juan",
    "lastName": "Perez",
    "role": "CLIENT"
  }'

# Autenticar
curl -X POST http://localhost:8081/api/v1/auth/authenticate \
  -H "Content-Type: application/json" \
  -d '{
    "username": "juanperez",
    "password": "password123"
  }'
```

## 📖 Documentación

- **Swagger UI**: `http://localhost:8081/swagger-ui.html`
- **Health Check**: `http://localhost:8081/actuator/health`

## 🔧 Configuración

Variables de entorno principales:

```bash
SPRING_DATASOURCE_URL=jdbc:mysql://localhost:3306/quickbite_auth
JWT_SECRET_KEY=mySecretKeyForQuickBiteAuthenticationService2024
JWT_EXPIRATION=86400000
SERVER_PORT=8081
```

## 🧪 Testing

```bash
./mvnw test
```

## 🚀 Despliegue

```bash
docker-compose up -d
```

## 📝 Licencia

Apache License 2.0
