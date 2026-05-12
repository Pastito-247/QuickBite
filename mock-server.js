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
    { email: 'admin@quickbite.com', password: 'admin123', role: 'admin', token: 'admin-token' },
    { email: 'kitchen@quickbite.com', password: 'kitchen123', role: 'kitchen', token: 'kitchen-token' },
    { email: 'customer@quickbite.com', password: 'customer123', role: 'customer', token: 'customer-token' }
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
