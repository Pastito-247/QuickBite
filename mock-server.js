const express = require('express');
const cors = require('cors');
const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Mock authentication endpoint
app.post('/api/auth/login', (req, res) => {
  const { email, password } = req.body;
  
  const mockUsers = [
    { email: 'admin@quickbite.com', password: 'admin123', role: 'ADMIN', token: 'admin-token' },
    { email: 'kitchen@quickbite.com', password: 'kitchen123', role: 'KITCHEN', token: 'kitchen-token' },
    { email: 'customer@quickbite.com', password: 'customer123', role: 'CLIENT', token: 'customer-token' }
  ];

  const user = mockUsers.find(u => 
    u.email === email && 
    u.password === password
  );

  if (user) {
    res.json({
      success: true,
      accessToken: user.token,
      userId: user.email,
      role: user.role,
      user: {
        email: user.email,
        role: user.role
      }
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });
  }
});

// Mock authentication endpoint for frontend/Login.js
app.post('/api/v1/auth/authenticate', (req, res) => {
  const { username, password } = req.body;
  const email = username; // Login.js sends the email in the username field
  
  const mockUsers = [
    { email: 'admin@quickbite.com', password: 'admin123', role: 'ADMIN', token: 'admin-token' },
    { email: 'kitchen@quickbite.com', password: 'kitchen123', role: 'KITCHEN', token: 'kitchen-token' },
    { email: 'customer@quickbite.com', password: 'customer123', role: 'CLIENT', token: 'customer-token' }
  ];

  const user = mockUsers.find(u => 
    u.email === email && 
    u.password === password
  );

  if (user) {
    res.json({
      success: true,
      accessToken: user.token,
      userId: '1',
      username: email.split('@')[0],
      email: email,
      role: user.role
    });
  } else {
    res.status(401).json({
      success: false,
      message: 'Credenciales incorrectas'
    });
  }
});


// Mock registration endpoint
app.post('/api/auth/register', (req, res) => {
  const { username, email, password, firstName, lastName, role } = req.body;
  
  // Simulación de registro exitoso
  res.json({
    success: true,
    message: 'Usuario registrado exitosamente',
    accessToken: 'new-user-token',
    userId: email,
    role: role,
    user: {
      email: email,
      role: role
    }
  });
});

// Mock menu endpoint
app.get('/api/menu/items', (req, res) => {
  res.json([
    {
      id: 1,
      name: "Hamburguesa Clásica",
      description: "Carne premium con lechuga, tomate, cebolla y nuestra salsa especial",
      price: 8990,
      category: "Hamburguesas",
      available: true,
      preparationTime: 15
    },
    {
      id: 2,
      name: "Papas Fritas Grandes",
      description: "Papas crujientes con sal marina",
      price: 3990,
      category: "Acompañamientos",
      available: true,
      preparationTime: 8
    },
    {
      id: 3,
      name: "Combo Big Bite",
      description: "Hamburguesa doble + papas + bebida",
      price: 12990,
      category: "Combos",
      available: true,
      preparationTime: 20
    }
  ]);
});

// Mock orders endpoint
app.get('/api/orders/user/:userId', (req, res) => {
  res.json([
    {
      id: "ORD-001",
      items: [
        { name: "Hamburguesa Clásica", quantity: 2, price: 8990 },
        { name: "Papas Fritas Grandes", quantity: 1, price: 3990 }
      ],
      total: 21970,
      status: "preparing",
      createdAt: "2026-05-05T15:30:00Z",
      estimatedTime: 20,
      trackingNumber: "TRK-123456"
    },
    {
      id: "ORD-002",
      items: [
        { name: "Combo Big Bite", quantity: 1, price: 12990 }
      ],
      total: 12990,
      status: "ready",
      createdAt: "2026-05-05T15:15:00Z",
      estimatedTime: 5,
      trackingNumber: "TRK-123457"
    }
  ]);
});

// Mock kitchen orders endpoint
app.get('/api/kitchen/orders', (req, res) => {
  res.json([
    {
      id: "ORD-001",
      customerName: "Juan Pérez",
      items: [
        { name: "Hamburguesa Clásica", quantity: 2, notes: "Sin cebolla" },
        { name: "Papas Fritas Grandes", quantity: 1, notes: "" }
      ],
      status: "pending",
      priority: "normal",
      createdAt: "2026-05-05T15:30:00Z",
      estimatedTime: 20,
      tableNumber: "T-05"
    },
    {
      id: "ORD-002",
      customerName: "María González",
      items: [
        { name: "Combo Big Bite", quantity: 1, notes: "Extra queso" }
      ],
      status: "preparing",
      priority: "high",
      createdAt: "2026-05-05T15:25:00Z",
      estimatedTime: 10,
      tableNumber: "T-03"
    }
  ]);
});

// Mock kitchen status update
app.put('/api/kitchen/orders/:orderId/status', (req, res) => {
  const { orderId } = req.params;
  const { status } = req.body;
  
  console.log(`Order ${orderId} status updated to: ${status}`);
  
  res.json({
    success: true,
    message: `Order ${orderId} updated to ${status}`
  });
});

// Mock restaurants endpoints
app.get('/api/restaurants', (req, res) => {
  res.json([
    { id: 1, name: 'Burger Queen', category: 'Hamburguesas', imageUrl: '' },
    { id: 2, name: 'Pizza Hub', category: 'Pizzas', imageUrl: '' },
    { id: 3, name: 'Taco Fiesta', category: 'Tacos', imageUrl: '' },
    { id: 4, name: 'Sushi Zen', category: 'Sushi', imageUrl: '' },
    { id: 5, name: 'Green Bowl', category: 'Ensaladas', imageUrl: '' },
    { id: 6, name: 'El Asador', category: 'Carnes', imageUrl: '' },
    { id: 7, name: 'Wok Express', category: 'Asiática', imageUrl: '' },
    { id: 8, name: 'La Crêperie', category: 'Postres', imageUrl: '' }
  ]);
});

app.get('/api/restaurants/:id', (req, res) => {
  const { id } = req.params;
  const mockRestaurantNames = {
    1: 'Burger Queen',
    2: 'Pizza Hub',
    3: 'Taco Fiesta',
    4: 'Sushi Zen',
    5: 'Green Bowl',
    6: 'El Asador',
    7: 'Wok Express',
    8: 'La Crêperie'
  };
  const name = mockRestaurantNames[parseInt(id)];
  if (name) {
    res.json({ id: parseInt(id), name, imageUrl: '' });
  } else {
    res.status(404).json({ message: 'Restaurant not found' });
  }
});

// Mock orders endpoint for KDS (Kitchen)
app.get('/api/orders', (req, res) => {
  res.json([
    {
      id: 1,
      numeroPedido: "ORD-001",
      estado: "PENDIENTE",
      fechaCreacion: "2026-05-05T15:30:00Z",
      fechaActualizacion: "2026-05-05T15:30:00Z",
      tiempoEstimadoMinutos: 20,
      nombreCliente: "Juan Pérez",
      restaurantId: 1,
      restaurantName: "Burger Queen",
      items: [
        { nombreProducto: "Hamburguesa Clásica", cantidad: 2, notasItem: "Sin cebolla" },
        { nombreProducto: "Papas Fritas Grandes", cantidad: 1, notasItem: "" }
      ]
    },
    {
      id: 2,
      numeroPedido: "ORD-002",
      estado: "EN_PREPARACION",
      fechaCreacion: "2026-05-05T15:25:00Z",
      fechaActualizacion: "2026-05-05T15:25:00Z",
      tiempoEstimadoMinutos: 10,
      nombreCliente: "María González",
      restaurantId: 2,
      restaurantName: "Pizza Hub",
      items: [
        { nombreProducto: "Combo Big Bite", cantidad: 1, notasItem: "Extra queso" }
      ]
    }
  ]);
});

// Mock order status update from KDS (Kitchen)
app.put('/api/orders/:orderId/estado', (req, res) => {
  const { orderId } = req.params;
  const { estado } = req.body;
  console.log(`Order ${orderId} status updated to: ${estado}`);
  res.json({
    success: true,
    message: `Order ${orderId} updated to ${estado}`
  });
});

// Mock admin stats endpoint
app.get('/api/admin/stats', (req, res) => {
  res.json({
    totalOrders: 156,
    totalRevenue: 2456780,
    activeUsers: 89,
    lowStockItems: 5
  });
});

// Mock admin inventory endpoint
app.get('/api/admin/inventory', (req, res) => {
  res.json([
    { id: 1, name: 'Pan de hamburguesa', currentStock: 45, minStock: 50, unit: 'unidades', price: 250 },
    { id: 2, name: 'Carne de res', currentStock: 12, minStock: 20, unit: 'kg', price: 8900 },
    { id: 3, name: 'Lechuga', currentStock: 8, minStock: 10, unit: 'unidades', price: 800 }
  ]);
});

const PORT = 8080;
app.listen(PORT, () => {
  console.log(`🚀 Mock server running on http://localhost:${PORT}`);
  console.log('📋 Available endpoints:');
  console.log('  POST /api/auth/login');
  console.log('  GET  /api/menu/items');
  console.log('  GET  /api/orders/user/:userId');
  console.log('  GET  /api/kitchen/orders');
  console.log('  PUT  /api/kitchen/orders/:orderId/status');
  console.log('  GET  /api/admin/stats');
  console.log('  GET  /api/admin/inventory');
});
