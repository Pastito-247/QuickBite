# QuickBite - Microservicio de Menú

Microservicio de gestión de menú para la plataforma QuickBite, desarrollado con Spring Boot y Docker.

## 🚀 Funcionalidades

### Gestión de Menú para Clientes
- **GET** `/api/menu` - Obtener todos los platos disponibles
- **GET** `/api/menu/{id}` - Obtener un plato específico por ID
- **POST** `/api/menu` - Crear nuevo plato (solo para administración)

### Gestión Administrativa
- **PUT** `/api/admin/menu/{id}/price` - Actualizar precio de un plato
- **PATCH** `/api/admin/menu/{id}/availability` - Cambiar disponibilidad de un plato
- **PUT** `/api/admin/menu/{id}` - Actualizar información completa de un plato
- **DELETE** `/api/admin/menu/{id}` - Eliminar un plato
- **GET** `/api/admin/menu/all` - Obtener todos los platos (incluyendo no disponibles)
- **GET** `/api/admin/menu/category/{category}` - Filtrar platos por categoría
- **GET** `/api/admin/menu/unavailable` - Obtener platos no disponibles

### Health Checks
- **GET** `/actuator/health` - Estado del servicio
- **GET** `/actuator/info` - Información del servicio
- **GET** `/actuator/metrics` - Métricas del servicio

## 🏗️ Arquitectura

El servicio sigue los patrones definidos en la arquitectura de QuickBite:
- **Repository Pattern** para persistencia de datos
- **Circuit Breaker** para tolerancia a fallos
- **API Gateway** ready para comunicación frontend
- **Docker** para contenerización
- **MySQL** como base de datos

## 🛠️ Tecnologías

- **Java 17**
- **Spring Boot 4.0.5**
- **Spring Data JPA**
- **MySQL 8.0**
- **Docker & Docker Compose**
- **Resilience4j** (Circuit Breaker)
- **Lombok** (Reducir boilerplate)

## 📋 Requisitos Funcionales Implementados

- ✅ **RF-1**: Sincronización de stock (conectores listos para integración)
- ✅ **RF-2**: Alertas de inventario crítico (endpoints admin)
- ✅ **RF-3**: Control de disponibilidad automática
- ✅ **RF-4**: Gestión administrativa completa

## 🚀 Despliegue Rápido

### 1. Clonar el repositorio
```bash
git clone <repository-url>
cd quickbite-menu-service
```

### 2. Iniciar con Docker Compose
```bash
docker-compose up -d
```

Esto iniciará:
- **Menu Service** en http://localhost:8081
- **MySQL** en localhost:3306
- **phpMyAdmin** en http://localhost:8080
- **Mock Inventory Service** en http://localhost:8082

### 3. Verificar estado
```bash
curl http://localhost:8081/actuator/health
```

## 📁 Estructura del Proyecto

```
quickbite-menu-service/
├── menu-service/                 # Código fuente del microservicio
│   ├── src/main/java/
│   │   └── com/quickbite/menu_service/
│   │       ├── controller/      # Controladores REST
│   │       ├── service/         # Lógica de negocio
│   │       ├── repository/      # Acceso a datos
│   │       ├── entity/          # Entidades JPA
│   │       ├── dto/             # Data Transfer Objects
│   │       ├── config/          # Configuración
│   │       └── exception/       # Manejo de excepciones
│   └── src/main/resources/
│       ├── application.yml       # Configuración base
│       ├── application-dev.yml   # Configuración desarrollo
│       └── application-prod.yml # Configuración producción
├── mocks/                       # Mocks para desarrollo
├── docker-compose.yml           # Orquestación de servicios
└── README.md                    # Este archivo
```

## 🔧 Configuración

### Variables de Entorno

| Variable | Descripción | Default |
|----------|-------------|---------|
| `SPRING_PROFILES_ACTIVE` | Perfil activo (dev/prod) | `dev` |
| `DB_USERNAME` | Usuario de MySQL | `root` |
| `DB_PASSWORD` | Contraseña de MySQL | `root` |
| `SERVER_PORT` | Puerto del servicio | `8081` |
| `INVENTORY_SERVICE_URL` | URL del servicio de inventario | `cambiar` |

### Perfiles

#### Desarrollo (dev)
- Base de datos local MySQL
- Logs detallados
- Mock de servicios externos
- CORS habilitado para localhost:3000

#### Producción (prod)
- Variables de entorno
- Logs optimizados
- Conexión real a servicios
- Seguridad mejorada

## 🧪 Testing

### Ejecutar tests unitarios
```bash
cd menu-service
mvn test
```

### Ejecutar tests de integración
```bash
cd menu-service
mvn verify
```

## 📊 API Documentation

La documentación de la API está disponible en:
- **Swagger UI**: http://localhost:8081/swagger-ui.html (cuando se implemente)
- **OpenAPI JSON**: http://localhost:8081/v3/api-docs

## 🔍 Monitoring

### Health Checks
```bash
# Estado general
curl http://localhost:8081/actuator/health

# Información detallada
curl http://localhost:8081/actuator/info

# Métricas
curl http://localhost:8081/actuator/metrics
```

### Logs
```bash
# Ver logs en tiempo real
docker-compose logs -f menu-service

# Logs de todos los servicios
docker-compose logs -f
```

## 🔄 Flujo de Trabajo (GitHub Flow)

1. **Branch `main`** - Siempre estable
2. **Branch `feature/*`** - Desarrollo de nuevas funcionalidades
3. **Pull Request** - Revisión de código
4. **Merge a `main`** - Despliegue automático

### Ejemplo de flujo:
```bash
# Crear feature branch
git checkout -b feature/nueva-funcionalidad

# Hacer cambios y commits
git add .
git commit -m "feat: agregar nueva funcionalidad"

# Push y crear Pull Request
git push origin feature/nueva-funcionalidad
```

## 🐛 Troubleshooting

### Problemas Comunes

#### 1. El servicio no inicia
```bash
# Verificar logs
docker-compose logs menu-service

# Verificar estado de MySQL
docker-compose logs mysql
```

#### 2. Error de conexión a MySQL
- Asegúrate que MySQL esté healthy: `docker-compose ps`
- Verifica las credenciales en `application-dev.yml`
- Espera a que MySQL esté completamente iniciado

#### 3. Problemas de CORS
- Verifica que el frontend esté en los orígenes permitidos en `CorsConfig.java`
- Asegúrate que el perfil correcto esté activo

#### 4. Puerto en uso
```bash
# Verificar qué proceso usa el puerto
netstat -ano | findstr :8081

# Cambiar puerto en docker-compose.yml
```

## 📝 Desarrollo Local

### Sin Docker
```bash
# 1. Iniciar MySQL localmente
# 2. Configurar application-dev.yml
# 3. Ejecutar
cd menu-service
mvn spring-boot:run
```

### Con IntelliJ IDEA
1. Importar proyecto Maven
2. Configurar perfil `dev`
3. Ejecutar `MenuServiceApplication.java`

## 🚀 Próximos Pasos

- [ ] Implementar integración con Circuit Breaker
- [ ] Agregar documentación OpenAPI/Swagger
- [ ] Implementar tests de integración completos
- [ ] Configurar CI/CD pipeline
- [ ] Agregar monitoring avanzado

## 📞 Soporte

Para reportar issues o solicitar ayuda:
1. Crear issue en GitHub
2. Revisar logs del servicio
3. Verificar health checks
4. Documentar pasos para reproducir

---

**QuickBite Team** - 🍔🚀
