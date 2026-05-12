# 🍔 QuickBite - Guía de Usuario y Pruebas

## 📋 Tabla de Contenidos
1. [Descripción del Sistema](#descripción-del-sistema)
2. [Requisitos Previos](#requisitos-previos)
3. [Instalación y Configuración](#instalación-y-configuración)
4. [Guía de Pruebas Paso a Paso](#guía-de-pruebas-paso-a-paso)
5. [Funcionalidades por Rol](#funcionalidades-por-rol)
6. [Solución de Problemas Comunes](#solución-de-problemas-comunes)

---

## 🎯 Descripción del Sistema

QuickBite es un sistema de gestión de restaurantes basado en microservicios que incluye:

### **Módulos Principales**
- **🛒 Gestión de Pedidos**: Recepción, seguimiento y procesamiento
- **🍽️ Kitchen Display System (KDS)**: Visualización de comandas en tiempo real
- **📋 Gestión de Menú**: Catálogo de productos con disponibilidad en tiempo real
- **📦 Control de Inventario**: Gestión de stock y alertas automáticas
- **👥 Administración**: Panel de control para gestión del restaurante

### **Roles de Usuario**
- **👤 Cliente**: Realiza pedidos y sigue su estado
- **👨‍🍳 Personal de Cocina**: Gestiona comandas y tiempos de preparación
- **⚙️ Administrador**: Gestión completa del sistema

---

## 🛠️ Requisitos Previos

### **Para Evaluación Local (Windows)**
- Node.js 18+
- Java 17+
- Maven 3.6+
- MySQL 8.0+
- Git

---

## 🚀 Instalación y Configuración

### **Método 1: Evaluación con MySQL (Recomendado)**
```bash
# Windows
START_MYSQL.bat
```

### **Método 2: Evaluación con Mock Server**
```bash
# Windows
START_EVALUACION.bat
```

### **Método 3: Desarrollo Manual**
```bash
# 1. Instalar dependencias del frontend
cd frontend
npm install

# 2. Iniciar backend mock
cd ..
node mock-server.js

# 3. Iniciar frontend (en otra terminal)
cd frontend
npm start
```

---

## 🧪 Guía de Pruebas Paso a Paso

### **Paso 1: Verificar Acceso**
1. Abrir navegador en: http://localhost:3000
2. Debería ver la página de bienvenida de QuickBite
3. Verificar que no haya errores en la consola del navegador

### **Paso 2: Probar Autenticación**
1. Hacer clic en "Iniciar Sesión" o ir a http://localhost:3000/login
2. Probar las siguientes credenciales:

#### **Credenciales de Prueba**
| Rol | Email | Contraseña |
|-----|-------|------------|
| Administrador | admin@quickbite.com | admin123 |
| Cocina | kitchen@quickbite.com | kitchen123 |
| Cliente | customer@quickbite.com | customer123 |

3. Verificar que redirija al dashboard correspondiente

### **Paso 3: Probar Flujo de Cliente**
1. Iniciar sesión como **cliente**
2. Navegar a **Menú** → Ver productos disponibles
3. Agregar productos al carrito:
   - Seleccionar "Hamburguesa Clásica"
   - Hacer clic en "Agregar"
   - Ver que aparezca en el carrito lateral
4. Proceder al pago:
   - Hacer clic en "Proceder al Pago"
   - Verificar mensaje de procesamiento
5. Ir a **Mis Pedidos**:
   - Verificar que aparezcan los pedidos realizados
6. **Con MySQL**: Verificar que los datos se guarden en la base de datos
7. **Con Mock Server**: Verificar que los datos se guarden en localStorage
   - Probar hacer clic en "Ver detalles"

### **Paso 4: Probar Flujo de Cocina**
1. Cerrar sesión y volver a iniciar como **personal de cocina**
2. Navegar a **Cocina** (KDS)
3. Verificar que aparezcan las comandas:
   - Órdenes en estado "Pendiente"
   - Órdenes en estado "En preparación"
   - Órdenes en estado "Listo para entregar"
4. Probar actualización de estados:
   - Hacer clic en "Iniciar Preparación"
   - Hacer clic en "Marcar como Listo"
   - Verificar que los estados se actualizan
5. Probar estadísticas:
   - Verificar contador de pedidos pendientes
   - Verificar contador de pedidos en preparación
   - Verificar contador de pedidos listos
6. **Con MySQL**: Verificar que los cambios se guarden en la base de datos
7. **Con Mock Server**: Verificar que los cambios se actualicen en tiempo real para entregar

### **Paso 5: Probar Flujo de Administrador**
1. Cerrar sesión y volver a iniciar como **administrador**
2. Explorar el **Dashboard**:
   - Verificar estadísticas (pedidos totales, ingresos, usuarios activos)
   - Verificar gráficos y métricas
3. Probar **Gestión de Inventario**:
   - Verificar lista de productos con stock
   - Identificar productos con stock crítico (en rojo)
4. Probar **Gestión de Menú**:
   - Verificar lista de platillos disponibles
   - Probar botones de "Editar" y "Eliminar"

---

## 🎭 Funcionalidades por Rol

### **👤 Cliente**
- ✅ Visualización del menú en tiempo real
- ✅ Carrito de compras interactivo
- ✅ Procesamiento de pedidos
- ✅ Seguimiento de estado de pedidos
- ✅ Historial de pedidos anteriores

### **👨‍🍳 Personal de Cocina**
- ✅ Visualización de comandas en tiempo real
- ✅ Gestión de prioridades (urgente, alto, normal)
- ✅ Actualización de estados de preparación
- ✅ Controles de tiempo estimado
- ✅ Notificaciones visuales de cambios

### **⚙️ Administrador**
- ✅ Dashboard con estadísticas en tiempo real
- ✅ Gestión completa de inventario
- ✅ Administración del menú y precios
- ✅ Control de usuarios y permisos
- ✅ Reportes y análisis de datos

---

## 🔧 Solución de Problemas Comunes

### **Problema: Frontend no carga**
**Síntomas**: Página en blanco o error de conexión
**Solución**:
```bash
# Verificar que el frontend esté corriendo
netstat -ano | findstr :3000

# Reiniciar frontend
cd frontend
npm start
```

### **Problema: Error de conexión con backend**
**Síntomas**: Error 502 o "Could not proxy request"
**Solución**:
```bash
# Verificar que el backend esté corriendo
netstat -ano | findstr :8080

# Iniciar backend mock
node mock-server.js
```

### **Problema: Login no funciona**
**Síntomas**: Error al intentar iniciar sesión
**Solución**:
1. Verificar credenciales correctas
2. Limpiar localStorage del navegador
3. Verificar consola para errores específicos

### **Problema: Scripts no funcionan**
**Síntomas**: Error al ejecutar START_MYSQL.bat
**Solución**:
```powershell
# Ejecutar como administrador
# Verificar que MySQL este corriendo
# O iniciar manualmente cada servicio
```

### **Problema: MySQL no conecta**
**Síntomas**: Error de conexión a la base de datos
**Solución**:
```powershell
# 1. Verificar que MySQL este corriendo
mysql --version

# 2. Configurar la contraseña de root si es necesaria
# Editar application.properties en cada microservicio

# 3. Ejecutar el script de base de datos
mysql -u root -p < database-setup.sql
```

### **Problema: Permisos en Windows**
**Síntomas**: Error de permisos al ejecutar scripts
**Solución**:
```powershell
# Ejecutar como administrador
Set-ExecutionPolicy -ExecutionPolicy RemoteSigned -Scope CurrentUser
```

---

## 📊 Verificación de Funcionamiento

### **Endpoints API para Testing**
```bash
# Test de autenticación
curl -X POST http://localhost:8080/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@quickbite.com","password":"admin123","role":"admin"}'

# Test de menú
curl http://localhost:8080/api/menu/items

# Test de órdenes de cocina
curl http://localhost:8080/api/kitchen/orders
```

### **Verificación en Navegador**
- **Frontend**: http://localhost:3000
- **API Gateway**: http://localhost:8080
- **Eureka Dashboard**: http://localhost:8761 (solo con MySQL)

---

## 🎯 Checklist de Pruebas

### **✅ Frontend**
- [ ] Página carga correctamente
- [ ] Navegación funciona
- [ ] Login con todos los roles
- [ ] Menú muestra productos
- [ ] Carrito de compras funciona
- [ ] Pedidos se crean y muestran

### **✅ Backend**
- [ ] API responde en puerto 8080
- [ ] Endpoints de autenticación funcionan
- [ ] Endpoints de menú retornan datos
- [ ] Endpoints de cocina funcionan
- [ ] Actualización de estados funciona

### **✅ Integración**
- [ ] Frontend se comunica con backend
- [ ] Login redirige correctamente
- [ ] Datos se actualizan en tiempo real
- [ ] No hay errores en consola

---

## 📞 Soporte

### **Logs y Depuración**
```bash
# Logs de frontend
cd frontend && npm start

# Logs de backend mock
node mock-server.js

# Logs de MySQL
mysql -u root -p -e "SHOW DATABASES;"

# Logs de microservicios
cd Backend/[nombre-servicio] && mvn spring-boot:run
```

### **Contacto del Equipo**
- **Martin Céspedes**: Desarrollo Frontend
- **Eduardo Chacana**: Arquitectura y Backend
- **Michelle Melo**: Gestión de Proyecto y Testing

---

## 🚀 Siguientes Pasos

1. **✅ Microservicios reales integrados** (MySQL configurado)
2. **✅ Bases de datos MySQL configuradas**
3. **Implementar WebSockets** para actualizaciones en tiempo real
4. **Agregar pruebas unitarias y de integración**
5. **Desplegar en producción**

---

**¡Listo! QuickBite está funcionando correctamente.** 🎉

Para cualquier problema, revisa la sección de solución de problemas o contacta al equipo de desarrollo.
