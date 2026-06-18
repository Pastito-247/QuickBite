# GUÍA DE INSTALACIÓN Y DESPLIEGUE LOCAL - QUICKBITE

## Descripción
Esta guía proporciona instrucciones detalladas para instalar y desplegar el sistema QuickBite en un entorno local utilizando Docker y Docker Compose.

## Requisitos Previos

### Hardware
- CPU: 4 núcleos o más
- RAM: 8 GB o más
- Disco: 20 GB de espacio libre

### Software
- Docker 20.10+
- Docker Compose 2.0+
- Git
- (Opcional) Java 21+ para desarrollo local sin Docker
- (Opcional) Node.js 18+ para desarrollo local sin Docker
- (Opcional) Maven 3.9+ para desarrollo local sin Docker

## Instalación de Docker

### Windows
1. Descargar Docker Desktop desde https://www.docker.com/products/docker-desktop
2. Ejecutar el instalador
3. Reiniciar el sistema
4. Verificar instalación: `docker --version` y `docker-compose --version`

### macOS
1. Descargar Docker Desktop para Mac desde https://www.docker.com/products/docker-desktop
2. Arrastrar Docker.app a Applications
3. Iniciar Docker Desktop
4. Verificar instalación: `docker --version` y `docker-compose --version`

### Linux (Ubuntu/Debian)
```bash
# Actualizar paquetes
sudo apt-get update

# Instalar dependencias
sudo apt-get install -y ca-certificates curl gnupg lsb-release

# Agregar clave GPG de Docker
sudo mkdir -p /etc/apt/keyrings
curl -fsSL https://download.docker.com/linux/ubuntu/gpg | sudo gpg --dearmor -o /etc/apt/keyrings/docker.gpg

# Agregar repositorio de Docker
echo "deb [arch=$(dpkg --print-architecture) signed-by=/etc/apt/keyrings/docker.gpg] https://download.docker.com/linux/ubuntu $(lsb_release -cs) stable" | sudo tee /etc/apt/sources.list.d/docker.list > /dev/null

# Instalar Docker
sudo apt-get update
sudo apt-get install -y docker-ce docker-ce-cli containerd.io docker-compose-plugin

# Verificar instalación
docker --version
docker-compose --version
```

## Clonación del Repositorio

```bash
git clone https://github.com/Pastito-247/QuickBite.git
cd QuickBite
```

## Estructura del Proyecto

```
QuickBite/
├── Backend/
│   ├── quickbite-Auth-main/          # Servicio de autenticación
│   ├── quickbite-ms-inventario/      # Servicio de inventario
│   ├── quickbite-menu-service/       # Servicio de menú
│   ├── quickbite-pedidos-main/       # Servicio de pedidos
│   ├── quickbite-kitchen-service/    # Servicio de cocina
│   ├── quickbite-ms-notificaciones/  # Servicio de notificaciones
│   ├── quickbite-payment-service/    # Servicio de pagos
│   ├── eureka-server/                # Eureka Server
│   └── api-gateway/                  # API Gateway
├── frontend/                         # Aplicación React
├── docker-compose.yml                # Orquestación de servicios
├── run-all-tests.sh                  # Script para ejecutar pruebas (Linux/Mac)
└── run-all-tests.ps1                 # Script para ejecutar pruebas (Windows)
```

## Configuración de Variables de Entorno

### Backend
Cada servicio backend tiene su archivo `application.yml` en `src/main/resources/`. Las configuraciones principales incluyen:

- **Eureka Server**: Puerto 8761
- **API Gateway**: Puerto 8080
- **Auth Service**: Puerto 8081
- **Inventory Service**: Puerto 8082
- **Menu Service**: Puerto 8083
- **Orders Service**: Puerto 8084
- **Kitchen Service**: Puerto 8085
- **Notifications Service**: Puerto 8086
- **Payment Service**: Puerto 8087

### Frontend
Crear archivo `.env` en el directorio `frontend/`:
```bash
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=30000
```

## Despliegue con Docker Compose

### Paso 1: Construir Imágenes Docker
```bash
docker-compose build
```

Este comando construirá las imágenes Docker para todos los servicios. Este proceso puede tomar varios minutos la primera vez.

### Paso 2: Iniciar Servicios
```bash
docker-compose up -d
```

Este comando iniciará todos los servicios en modo detached (en segundo plano).

### Paso 3: Verificar Estado de Servicios
```bash
docker-compose ps
```

Deberías ver todos los servicios con estado "Up".

### Paso 4: Verificar Logs
```bash
# Ver logs de todos los servicios
docker-compose logs -f

# Ver logs de un servicio específico
docker-compose logs -f eureka-server
docker-compose logs -f api-gateway
docker-compose logs -f auth-service
```

### Paso 5: Acceder a la Aplicación
- **Frontend**: http://localhost
- **API Gateway**: http://localhost:8080
- **Eureka Server**: http://localhost:8761
- **Auth Service**: http://localhost:8081
- **Inventory Service**: http://localhost:8082
- **Menu Service**: http://localhost:8083
- **Orders Service**: http://localhost:8084
- **Kitchen Service**: http://localhost:8085
- **Notifications Service**: http://localhost:8086
- **Payment Service**: http://localhost:8087

## Detener Servicios

```bash
# Detener todos los servicios
docker-compose down

# Detener y eliminar volúmenes
docker-compose down -v

# Detener y eliminar imágenes
docker-compose down --rmi all
```

## Desarrollo Local sin Docker

### Requisitos Adicionales
- Java 21+
- Maven 3.9+
- Node.js 18+
- npm o yarn
- MySQL 8.0+

### Configuración de Base de Datos

1. Instalar MySQL 8.0
2. Crear bases de datos:
```sql
CREATE DATABASE auth_db;
CREATE DATABASE inventario_db;
CREATE DATABASE menu_db;
CREATE DATABASE pedidos_db;
CREATE DATABASE kitchen_db;
CREATE DATABASE notificaciones_db;
CREATE DATABASE payment_db;
```

### Iniciar Servicios Backend

```bash
# Eureka Server
cd Backend/eureka-server
mvn spring-boot:run

# API Gateway (en otra terminal)
cd Backend/api-gateway
mvn spring-boot:run

# Auth Service (en otra terminal)
cd Backend/quickbite-Auth-main
mvn spring-boot:run

# Repetir para cada servicio en terminales separadas
```

### Iniciar Frontend

```bash
cd frontend
npm install
npm start
```

## Ejecución de Pruebas

### Ejecutar Todas las Pruebas (Linux/Mac)
```bash
chmod +x run-all-tests.sh
./run-all-tests.sh
```

### Ejecutar Todas las Pruebas (Windows)
```powershell
.\run-all-tests.ps1
```

### Ejecutar Pruebas de un Servicio Específico

#### Backend
```bash
cd Backend/<nombre-servicio>
mvn test
```

#### Frontend
```bash
cd frontend
npm test
```

## Troubleshooting

### Problema: Puertos en uso
**Solución**: Modificar los puertos en `docker-compose.yml` o detener los servicios que usan esos puertos.

### Problema: Servicios no se conectan a Eureka
**Solución**: 
1. Verificar que Eureka Server esté ejecutándose
2. Verificar la configuración de `eureka.client.service-url.defaultZone`
3. Esperar 30-60 segundos para que los servicios se registren

### Problema: Error de conexión a MySQL
**Solución**:
1. Verificar que el contenedor MySQL esté ejecutándose
2. Verificar las credenciales en `docker-compose.yml`
3. Verificar que las bases de datos se hayan creado correctamente

### Problema: Frontend no se conecta a API Gateway
**Solución**:
1. Verificar que el archivo `nginx.conf` esté configurado correctamente
2. Verificar que API Gateway esté ejecutándose
3. Verificar la configuración de `REACT_APP_API_URL`

### Problema: Imágenes Docker no se construyen
**Solución**:
1. Verificar que Docker esté ejecutándose
2. Verificar que haya suficiente espacio en disco
3. Limpiar caché de Docker: `docker system prune -a`

### Problema: Servicios consumen mucha memoria
**Solución**:
1. Limitar memoria en `docker-compose.yml` agregando `mem_limit: 512m` a cada servicio
2. Reducir el número de servicios activos simultáneamente
3. Aumentar la memoria RAM disponible en el sistema

## Monitoreo

### Verificar Uso de Recursos
```bash
docker stats
```

### Verificar Logs de un Servicio
```bash
docker-compose logs -f <nombre-servicio>
```

### Acceder a un Contenedor
```bash
docker-compose exec <nombre-servicio> /bin/bash
```

## Actualización del Sistema

### Actualizar Código
```bash
git pull origin main
```

### Reconstruir Imágenes
```bash
docker-compose build
docker-compose up -d
```

## Limpieza

### Eliminar Contenedores Detenidos
```bash
docker container prune
```

### Eliminar Imágenes No Utilizadas
```bash
docker image prune -a
```

### Eliminar Volúmenes No Utilizados
```bash
docker volume prune
```

### Limpieza Completa
```bash
docker-compose down -v --rmi all
docker system prune -a
```

## Seguridad

### Cambiar Contraseñas por Defecto
Modificar las contraseñas en `docker-compose.yml`:
```yaml
environment:
  - MYSQL_ROOT_PASSWORD=tu_contraseña_segura
```

### Configurar Firewall
Asegurarse de que los puertos necesarios estén abiertos:
- 80 (Frontend)
- 8080 (API Gateway)
- 8761 (Eureka Server)
- 8081-8087 (Microservicios)

### Usar HTTPS en Producción
Configurar certificados SSL/TLS en nginx.conf para el frontend.

## Soporte

Para problemas o preguntas:
- Revisar los README.md de cada servicio
- Revisar los logs de Docker: `docker-compose logs`
- Crear un issue en el repositorio de GitHub

## Recursos Adicionales

- [Documentación de Docker](https://docs.docker.com/)
- [Documentación de Docker Compose](https://docs.docker.com/compose/)
- [Documentación de Spring Boot](https://docs.spring.io/spring-boot/)
- [Documentación de React](https://react.dev/)
- [Documentación de MySQL](https://dev.mysql.com/doc/)

---
**Última actualización**: 17 de junio de 2026
**Versión**: 1.0
