# Guía de Despliegue con Docker

Esta guía explica cómo desplegar la aplicación QuickBite utilizando Docker y Docker Compose.

## Requisitos Previos

- Docker Desktop instalado (Windows/Mac) o Docker Engine (Linux)
- Docker Compose incluido con Docker Desktop
- Al menos 8GB de RAM disponibles para Docker
- Al menos 20GB de espacio en disco

## Arquitectura de Contenedores

La aplicación QuickBite consiste en los siguientes contenedores:

| Servicio | Puerto | Descripción |
|----------|--------|-------------|
| eureka-server | 8761 | Service Discovery (Eureka) |
| api-gateway | 8080 | API Gateway |
| auth-service | 8081 | Servicio de Autenticación |
| inventory-service | 8082 | Servicio de Inventario |
| menu-service | 8083 | Servicio de Menú |
| orders-service | 8084 | Servicio de Pedidos |
| kitchen-service | 8085 | Servicio de Cocina |
| notifications-service | 8086 | Servicio de Notificaciones |
| payment-service | 8087 | Servicio de Pagos |
| mysql | 3306 | Base de datos MySQL |
| frontend | 80 | Frontend React (Nginx) |

## Pasos de Despliegue

### 1. Clonar el Repositorio

```bash
git clone https://github.com/Pastito-247/QuickBite.git
cd QuickBite
```

### 2. Construir las Imágenes Docker

Opción A: Construir todas las imágenes manualmente:

```bash
# Construir imagen de Eureka Server
docker build -t quickbite/eureka-server:latest ./Backend/eureka-server

# Construir imagen de API Gateway
docker build -t quickbite/api-gateway:latest ./Backend/api-gateway

# Construir imagen de Auth Service
docker build -t quickbite/auth-service:latest ./Backend/quickbite-Auth-main

# Construir imagen de Inventory Service
docker build -t quickbite/inventory-service:latest ./Backend/quickbite-ms-inventario

# Construir imagen de Menu Service
docker build -t quickbite/menu-service:latest ./Backend/quickbite-menu-service

# Construir imagen de Orders Service
docker build -t quickbite/orders-service:latest ./Backend/quickbite-pedidos-main

# Construir imagen de Kitchen Service
docker build -t quickbite/kitchen-service:latest ./Backend/quickbite-kitchen-service

# Construir imagen de Notifications Service
docker build -t quickbite/notifications-service:latest ./Backend/quickbite-ms-notificaciones

# Construir imagen de Payment Service
docker build -t quickbite/payment-service:latest ./Backend/quickbite-payment-service

# Construir imagen de Frontend
docker build -t quickbite/frontend:latest ./frontend
```

Opción B: Usar Docker Compose (recomendado):

```bash
docker-compose build
```

### 3. Iniciar los Servicios

Usar Docker Compose para iniciar todos los servicios:

```bash
docker-compose up -d
```

El flag `-d` ejecuta los contenedores en modo detached (segundo plano).

### 4. Verificar el Estado de los Servicios

Verificar que todos los contenedores estén corriendo:

```bash
docker-compose ps
```

Ver los logs de un servicio específico:

```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f eureka-server
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

Verificar el estado de salud de los servicios:

```bash
docker-compose ps
```

Deberías ver que todos los servicios tienen el estado "healthy" después de unos minutos.

### 5. Acceder a la Aplicación

- **Frontend**: http://localhost
- **API Gateway**: http://localhost:8080
- **Eureka Server**: http://localhost:8761
- **Swagger UI (API Gateway)**: http://localhost:8080/swagger-ui.html

## Gestión de Servicios

### Detener los Servicios

```bash
docker-compose down
```

### Detener y Eliminar Volúmenes

```bash
docker-compose down -v
```

**Nota**: Esto eliminará todos los datos de la base de datos.

### Reiniciar un Servicio Específico

```bash
docker-compose restart auth-service
```

### Escalar un Servicio

```bash
docker-compose up -d --scale auth-service=3
```

## Configuración

### Variables de Entorno

Puedes modificar las variables de entorno en el archivo `docker-compose.yml`:

- **MySQL**: `MYSQL_ROOT_PASSWORD`, `MYSQL_DATABASE`
- **Servicios Spring**: `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPING_DATASOURCE_PASSWORD`
- **Eureka**: `EUREKA_CLIENT_SERVICE_URL_DEFAULTZONE`

### Puertos

Si necesitas cambiar los puertos expuestos, modifica la sección `ports` en `docker-compose.yml`:

```yaml
ports:
  - "8081:8081"  # Host:Container
```

## Solución de Problemas

### Los contenedores no inician

1. Verificar que Docker esté corriendo:
```bash
docker ps
```

2. Verificar los logs para identificar errores:
```bash
docker-compose logs
```

3. Reconstruir las imágenes:
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Error de conexión a MySQL

1. Verificar que MySQL esté corriendo:
```bash
docker-compose ps mysql
```

2. Esperar a que MySQL esté completamente inicializado (puede tomar 30-60 segundos)

3. Verificar las credenciales en `docker-compose.yml`

### Los servicios no se registran en Eureka

1. Verificar que Eureka Server esté corriendo:
```bash
docker-compose logs eureka-server
```

2. Acceder a http://localhost:8761 para ver los servicios registrados

3. Verificar que los servicios tengan la configuración correcta de Eureka

### Error de memoria

Si los contenedores se cierran por falta de memoria:

1. Aumentar la memoria asignada a Docker en Docker Desktop
2. Modificar los límites de memoria en `docker-compose.yml`:
```yaml
deploy:
  resources:
    limits:
      memory: 1G
```

## Health Checks

Todos los servicios tienen health checks configurados:

- **Intervalo**: 30 segundos
- **Timeout**: 10 segundos
- **Retries**: 3 intentos
- **Start period**: 30-60 segundos (dependiendo del servicio)

Verificar el estado de salud:

```bash
docker inspect --format='{{json .State.Health}}' quickbite-eureka-server
```

## Backup y Restauración

### Backup de la Base de Datos

```bash
docker exec quickbite-mysql mysqldump -u root -prootpassword --all-databases > backup.sql
```

### Restaurar la Base de Datos

```bash
docker exec -i quickbite-mysql mysql -u root -prootpassword < backup.sql
```

## Monitoreo

### Ver el consumo de recursos

```bash
docker stats
```

### Ver el uso de disco

```bash
docker system df
```

### Limpiar recursos no utilizados

```bash
docker system prune -a
```

**Advertencia**: Esto eliminará todas las imágenes Docker no utilizadas.

## Actualización de la Aplicación

### Actualizar el código

1. Hacer pull de los cambios:
```bash
git pull origin main
```

2. Reconstruir y reiniciar:
```bash
docker-compose build
docker-compose up -d
```

### Actualizar solo un servicio

```bash
docker-compose build auth-service
docker-compose up -d auth-service
```

## Producción

Para despliegue en producción, considera:

1. **Seguridad**:
   - Cambiar contraseñas por defecto
   - Usar secrets de Docker Swarm o Kubernetes
   - Habilitar HTTPS/TLS

2. **Performance**:
   - Configurar recursos apropiados (CPU, RAM)
   - Usar balanceo de carga
   - Configurar caché

3. **Monitoreo**:
   - Implementar Prometheus y Grafana
   - Configurar alertas
   - Centralizar logs (ELK Stack)

4. **Backup**:
   - Configurar backups automáticos de la base de datos
   - Implementar disaster recovery

## Soporte

Para problemas o preguntas:
- Revisar los logs: `docker-compose logs`
- Verificar la documentación de cada servicio en sus respectivos directorios
- Consultar el README principal del proyecto
