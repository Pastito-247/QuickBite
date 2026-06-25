# QuickBite Frontend - React

## Descripción
Aplicación web React para el sistema de pedidos de comida QuickBite. Proporciona interfaces para clientes, administradores, cocina y delivery.

## Tecnologías
- React 18
- React Router DOM
- Axios
- Tailwind CSS
- React Toastify
- Lucide React (iconos)
- Context API (gestión de estado global)

## Instalación

### Requisitos Previos
- Node.js 18+
- npm o yarn

### Pasos de Instalación
1. Clonar el repositorio:
```bash
git clone https://github.com/Pastito-247/QuickBite.git
cd frontend
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar variables de entorno (opcional):
```bash
# Crear archivo .env en la raíz del proyecto
REACT_APP_API_URL=http://localhost:8080
REACT_APP_API_TIMEOUT=30000
```

4. Ejecutar la aplicación:
```bash
npm start
```

La aplicación estará disponible en http://localhost:3000

## Estructura del Proyecto

```
frontend/
├── public/              # Archivos estáticos
├── src/
│   ├── components/      # Componentes reutilizables
│   │   ├── Navbar.js
│   │   ├── CartSidebar.js
│   │   ├── NotificationBadge.js
│   │   └── QuickBiteLogo.js
│   ├── context/         # Contextos de React
│   │   └── CartContext.js
│   ├── pages/           # Páginas de la aplicación
│   │   ├── Home.js
│   │   ├── Restaurants.js
│   │   ├── Menu.js
│   │   ├── Orders.js
│   │   ├── Kitchen.js
│   │   ├── Login.js
│   │   ├── Admin.js
│   │   ├── Profile.js
│   │   └── Payment.js
│   ├── App.js           # Componente principal
│   ├── index.js         # Punto de entrada
│   ├── App.css          # Estilos globales
│   └── index.css        # Estilos base
├── package.json         # Dependencias del proyecto
└── tailwind.config.js   # Configuración de Tailwind
```

## Componentes Principales

### Navbar
Barra de navegación principal que incluye:
- Logo de QuickBite
- Enlaces de navegación según el rol del usuario
- Badge de notificaciones
- Icono de carrito
- Menú de usuario

### CartSidebar
Panel lateral del carrito de compras que muestra:
- Items agrupados por restaurante
- Subtotal por restaurante
- Costos de envío
- Botón de checkout

### CartContext
Contexto de React para gestionar el estado del carrito:
- Agregar items al carrito
- Actualizar cantidad de items
- Eliminar items del carrito
- Limpiar carrito por restaurante

## Páginas

### Home
Página de inicio con:
- Banner principal
- Restaurantes destacados
- Promociones especiales

### Restaurants
Lista de restaurantes con:
- Filtros por categoría
- Búsqueda por nombre
- Información de cada restaurante

### Menu
Menú de restaurante con:
- Lista de platos disponibles
- Filtros por categoría
- Información de precios
- Botón para agregar al carrito

### Orders
Historial de pedidos del usuario con:
- Lista de pedidos
- Estado de cada pedido
- Detalles de pedido
- Opciones de reordenar

### Kitchen
Kitchen Display System (KDS) para cocina con:
- Lista de órdenes activas
- Estados de preparación
- Tiempos estimados
- Notificaciones de nuevos pedidos

### Login
Página de autenticación con:
- Formulario de login
- Formulario de registro
- Recuperación de contraseña

### Admin
Panel de administración con:
- Gestión de usuarios
- Estadísticas de ventas
- Configuración del sistema

### Profile
Perfil de usuario con:
- Información personal
- Historial de pedidos
- Configuración de cuenta

### Payment
Página de pago con:
- Resumen del pedido
- Métodos de pago
- Formulario de tarjeta
- Confirmación de pago

## Configuración de Tailwind CSS

Tailwind CSS está configurado en `tailwind.config.js`:
```javascript
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {},
  },
  plugins: [],
}
```

## Uso de Context API

### CartContext
```javascript
import { useCart } from './context/CartContext';

function MiComponente() {
  const { cart, addToCart, removeFromCart, updateQuantity } = useCart();
  
  // Usar el contexto
  addToCart(item);
}
```

## Integración con API

El frontend se comunica con los microservicios a través del API Gateway en el puerto 8080.

### Ejemplo de llamada a API
```javascript
import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080';

// Obtener menú
const getMenu = async () => {
  const response = await axios.get(`${API_URL}/api/menu/available`);
  return response.data;
};

// Crear pedido
const createOrder = async (orderData) => {
  const response = await axios.post(`${API_URL}/api/pedidos`, orderData);
  return response.data;
};
```

## Autenticación

El frontend utiliza JWT para autenticación:
- El token se almacena en localStorage
- El token se incluye en el header Authorization de cada solicitud
- El token se refresca automáticamente cuando expira

## Pruebas

### Ejecutar pruebas
```bash
npm test
```

### Pruebas unitarias creadas
- App.test.js (5 pruebas)
- Navbar.test.js (6 pruebas)
- CartSidebar.test.js (6 pruebas)

## Build para Producción

### Crear build de producción
```bash
npm run build
```

Esto crea una carpeta `build/` con los archivos optimizados para producción.

## Variables de Entorno

| Variable | Descripción | Valor por defecto |
|----------|-------------|-------------------|
| REACT_APP_API_URL | URL del API Gateway | http://localhost:8080 |
| REACT_APP_API_TIMEOUT | Timeout de solicitudes API | 30000 |

## Troubleshooting

### Problemas Comunes
1. **Error al instalar dependencias**
   - Borrar node_modules y package-lock.json
   - Ejecutar `npm install` nuevamente

2. **Error de conexión con API**
   - Verificar que el API Gateway esté ejecutándose
   - Verificar la configuración de REACT_APP_API_URL

3. **Errores de autenticación**
   - Verificar que el token JWT sea válido
   - Limpiar localStorage y volver a iniciar sesión

4. **Estilos no se aplican**
   - Verificar que Tailwind CSS esté configurado correctamente
   - Verificar que los archivos CSS estén importados

## Dependencias Principales

```json
{
  "react": "^18.2.0",
  "react-dom": "^18.2.0",
  "react-router-dom": "^6.0.0",
  "axios": "^1.0.0",
  "tailwindcss": "^3.0.0",
  "react-toastify": "^9.0.0",
  "lucide-react": "^0.0.0"
}
```

## Scripts Disponibles

- `npm start` - Ejecuta la aplicación en modo desarrollo
- `npm test` - Ejecuta las pruebas en modo interactivo
- `npm run build` - Crea build de producción
- `npm run eject` - Expone la configuración de webpack (no recomendado)

## Contribución
Para contribuir al desarrollo del frontend:
1. Crear una rama desde `main`
2. Hacer los cambios necesarios
3. Ejecutar las pruebas: `npm test`
4. Crear un Pull Request

## Licencia
Este proyecto es parte de QuickBite y está bajo la misma licencia del proyecto principal.
