# Documentación Swagger/OpenAPI - QuickBite

## Descripción
Todos los microservicios de QuickBite tienen documentación Swagger/OpenAPI configurada para facilitar la prueba y comprensión de las APIs.

## Tecnologías
- SpringDoc OpenAPI 2.3.0
- Swagger UI
- OpenAPI 3.0

## Acceso a Swagger UI

### Servicios Backend

#### 1. Eureka Server
- **URL**: http://localhost:8761/swagger-ui.html
- **Descripción**: Service Discovery Server
- **Autenticación**: No requiere

#### 2. API Gateway
- **URL**: http://localhost:8080/swagger-ui.html
- **Descripción**: API Gateway para todos los microservicios
- **Autenticación**: JWT Bearer Token

#### 3. Authentication Service
- **URL**: http://localhost:8081/swagger-ui.html
- **Descripción**: Servicio de autenticación y autorización
- **Autenticación**: JWT Bearer Token

#### 4. Inventory Service
- **URL**: http://localhost:8082/swagger-ui.html
- **Descripción**: Servicio de gestión de inventario
- **Autenticación**: JWT Bearer Token

#### 5. Menu Service
- **URL**: http://localhost:8083/swagger-ui.html
- **Descripción**: Servicio de gestión de menús
- **Autenticación**: JWT Bearer Token

#### 6. Orders Service
- **URL**: http://localhost:8084/swagger-ui.html
- **Descripción**: Servicio de gestión de pedidos
- **Autenticación**: JWT Bearer Token

#### 7. Kitchen Service
- **URL**: http://localhost:8085/swagger-ui.html
- **Descripción**: Kitchen Display System (KDS)
- **Autenticación**: JWT Bearer Token

#### 8. Notifications Service
- **URL**: http://localhost:8086/swagger-ui.html
- **Descripción**: Servicio de notificaciones
- **Autenticación**: JWT Bearer Token

#### 9. Payment Service
- **URL**: http://localhost:8087/swagger-ui.html
- **Descripción**: Servicio de procesamiento de pagos
- **Autenticación**: JWT Bearer Token

## Configuración de Autenticación en Swagger UI

### Pasos para configurar JWT Bearer Token:

1. Acceder a la URL de Swagger UI del servicio
2. Hacer clic en el botón "Authorize" (candado) en la parte superior derecha
3. En el campo "Value", ingresar el token JWT con el prefijo "Bearer "
4. Ejemplo: `Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
5. Hacer clic en "Authorize"
6. El token ahora se incluirá automáticamente en todas las solicitudes

### Obtener un Token JWT

1. Acceder a Swagger UI del Authentication Service: http://localhost:8081/swagger-ui.html
2. Expandir el endpoint `/api/v1/auth/authenticate`
3. Hacer clic en "Try it out"
4. Ingresar credenciales de prueba:
   ```json
   {
     "email": "test@example.com",
     "password": "password123"
   }
   ```
5. Hacer clic en "Execute"
6. Copiar el token de la respuesta (campo `accessToken`)
7. Usar este token en los demás servicios

## Características de la Documentación

### Información General
Cada servicio incluye:
- Título del servicio
- Descripción funcional
- Versión
- Contacto del equipo
- Licencia

### Seguridad
La mayoría de los servicios requieren autenticación JWT:
- Esquema: Bearer JWT
- Tipo: HTTP
- Formato: JWT

### Endpoints Documentados
Cada servicio documenta:
- Métodos HTTP (GET, POST, PUT, DELETE)
- Parámetros de solicitud
- Cuerpo de solicitud (request body)
- Respuestas esperadas
- Códigos de estado HTTP
- Ejemplos de uso

## Uso de Swagger UI

### Probar un Endpoint

1. Expandir el endpoint deseado
2. Hacer clic en "Try it out"
3. Ingresar los parámetros requeridos
4. Hacer clic en "Execute"
5. Revisar la respuesta

### Descargar Especificación OpenAPI

1. Hacer clic en el enlace "OpenAPI spec" en la página de Swagger UI
2. Descargar el archivo JSON o YAML
3. Importar en herramientas como Postman, Insomnia, o generar clientes

## Configuración en Docker

Cuando se ejecuta con Docker Compose, las URLs son las mismas pero accediendo a través de los puertos mapeados en `docker-compose.yml`.

## Troubleshooting

### Swagger UI no carga
- Verificar que el servicio esté ejecutándose
- Verificar que el puerto esté disponible
- Revisar los logs del servicio

### Error de autenticación
- Verificar que el token JWT sea válido
- Verificar que el token no haya expirado
- Asegurarse de incluir el prefijo "Bearer "

### Endpoints no aparecen
- Verificar que las anotaciones Swagger estén en los controladores
- Verificar que la configuración de Swagger sea correcta
- Revisar los logs del servicio

## Configuración Personalizada

Cada servicio tiene su propia clase `SwaggerConfig` en el paquete `config` que puede personalizarse para:
- Modificar información del servicio
- Agregar esquemas de seguridad adicionales
- Configurar servidores alternativos
- Agregar tags personalizados

## Recursos Adicionales

- [Documentación de SpringDoc OpenAPI](https://springdoc.org/)
- [Documentación de Swagger UI](https://swagger.io/tools/swagger-ui/)
- [Especificación OpenAPI 3.0](https://swagger.io/specification/)

---
**Última actualización**: 17 de junio de 2026
**Versión**: 1.0
