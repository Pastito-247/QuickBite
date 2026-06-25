import React, { useState, useEffect, useMemo } from 'react';
import { toast } from 'react-toastify';
import { Plus, Minus, ShoppingCart, Clock, DollarSign, Star, Truck, ArrowLeft, UtensilsCrossed, Search, X } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import apiURL from '../utils/api';

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

const restaurantDetails = {
  1: { name: 'Burger Queen', type: 'Hamburguesas & Fast Food', rating: 4.8, time: '15-25 min', deliveryFee: '$1.50', gradient: 'from-orange-500 via-amber-500 to-orange-600', logo: '/logo_burger_queen.png', banner: '/banner_burger_queen.png' },
  2: { name: 'Pizza Hub', type: 'Pizzas & Italiana', rating: 4.6, time: '20-35 min', deliveryFee: 'Gratis', gradient: 'from-red-500 via-rose-600 to-red-600', logo: '/logo_pizza_hub.png', banner: '/banner_pizza_hub.png' },
  3: { name: 'Taco Fiesta', type: 'Tacos & Antojos Mexicanos', rating: 4.7, time: '10-20 min', deliveryFee: '$1.00', gradient: 'from-yellow-500 via-orange-500 to-red-500', logo: '/logo_taco_fiesta.png', banner: '/banner_taco_fiesta.png' },
  4: { name: 'Sushi Zen', type: 'Sushi & Gastronomía Japonesa', rating: 4.9, time: '30-45 min', deliveryFee: '$2.50', gradient: 'from-indigo-600 via-blue-500 to-cyan-500', logo: '/logo_sushi_zen.png', banner: '/banner_sushi_zen.png' },
  5: { name: 'Green Bowl', type: 'Saludable & Bowls Orgánicos', rating: 4.5, time: '15-20 min', deliveryFee: '$1.00', gradient: 'from-emerald-600 via-teal-500 to-emerald-500', logo: '/logo_green_bowl.png', banner: '/banner_green_bowl.png' },
  6: { name: 'El Asador', type: 'Carnes a la Parrilla', rating: 4.8, time: '35-50 min', deliveryFee: '$3.00', gradient: 'from-amber-600 via-yellow-700 to-amber-800', logo: '/logo_el_asador.png', banner: '/banner_el_asador.png' },
  7: { name: 'Wok Express', type: 'Comida Asiática & Woks', rating: 4.4, time: '20-30 min', deliveryFee: 'Gratis', gradient: 'from-purple-600 via-indigo-500 to-indigo-600', logo: '/logo_wok_express.png', banner: '/banner_wok_express.png' },
  8: { name: 'La Crêperie', type: 'Postres & Crêpes Dulces', rating: 4.7, time: '15-25 min', deliveryFee: '$1.20', gradient: 'from-pink-500 via-rose-500 to-pink-600', logo: '/logo_la_creperie.png', banner: '/banner_la_creperie.png' },
};


const mockMenuDatabase = {
  1: [
    { id: 101, name: "Hamburguesa Clásica", description: "Carne premium con lechuga fresca, rodajas de tomate, cebolla morada y salsa secreta QuickBite.", price: 8990, category: "Hamburguesas", preparationTime: 15, restaurantId: 1 },
    { id: 102, name: "Papas Fritas Grandes", description: "Papas rústicas crujientes cortadas a mano, sazonadas con pizca de sal marina fina.", price: 3990, category: "Acompañamientos", preparationTime: 8, restaurantId: 1 },
    { id: 103, name: "Combo Big Bite", description: "Hamburguesa doble carne fundida con queso cheddar, porción de papas y refresco grande.", price: 12990, category: "Combos", preparationTime: 20, restaurantId: 1 },
    { id: 104, name: "Aros de Cebolla", description: "Aros de cebolla morada fresca rebozados en panko crujiente y fritos a la perfección.", price: 2990, category: "Acompañamientos", preparationTime: 10, restaurantId: 1 }
  ],
  2: [
    { id: 201, name: "Pizza Pepperoni Pepper", description: "Base de masa delgada con salsa de tomate italiana, queso mozzarella doble y pepperoni americano.", price: 10990, category: "Pizzas", preparationTime: 15, restaurantId: 2 },
    { id: 202, name: "Pizza Margarita Deluxe", description: "Rodajas de tomate cherry fresco, hojas de albahaca, queso mozzarella premium y un chorrito de aceite de oliva virgen.", price: 9990, category: "Pizzas", preparationTime: 12, restaurantId: 2 },
    { id: 203, name: "Pan de Ajo Especial", description: "Rebanadas horneadas untadas con mantequilla de ajo y hierbas aromáticas, gratinadas con queso.", price: 3490, category: "Acompañamientos", preparationTime: 8, restaurantId: 2 },
    { id: 204, name: "Calzone de Jamón", description: "Masa plegada rellena de jamón cocido seleccionado, mezcla de quesos mozzarella y ricotta cremosa.", price: 7990, category: "Pizzas", preparationTime: 18, restaurantId: 2 }
  ],
  3: [
    { id: 301, name: "Tacos al Pastor x3", description: "Tortillas de maíz caliente rellenas de cerdo marinado al pastor, piña asada dulce, cebolla y cilantro.", price: 6990, category: "Tacos", preparationTime: 12, restaurantId: 3 },
    { id: 302, name: "Burrito de Pollo Asado", description: "Tortilla gigante rellena de pechuga de pollo desmechada, arroz sazonado, frijoles negros y guacamole casero.", price: 7990, category: "Burritos", preparationTime: 15, restaurantId: 3 },
    { id: 303, name: "Quesadillas de Champiñón", description: "Tortillas a la plancha rellenas de queso fundido, champiñones salteados y cebollín fresco.", price: 5990, category: "Quesadillas", preparationTime: 10, restaurantId: 3 },
    { id: 304, name: "Nachos con Guacamole", description: "Totopos crujientes de maíz acompañados de guacamole tradicional preparado al momento.", price: 4990, category: "Entradas", preparationTime: 5, restaurantId: 3 }
  ],
  4: [
    { id: 401, name: "Roll de Salmón y Palta x10", description: "Rol de sushi relleno de salmón fresco y palta cremosa, envuelto en crujientes semillas de sésamo tostadas.", price: 7990, category: "Sushi Rolls", preparationTime: 20, restaurantId: 4 },
    { id: 402, name: "Roll de Camarón Tempura x10", description: "Camarón tempura crujiente, queso crema y cebollín, envuelto en láminas finas de palta madura.", price: 8490, category: "Sushi Rolls", preparationTime: 20, restaurantId: 4 },
    { id: 403, name: "Gyozas de Cerdo x5", description: "Finas empanadas de masa japonesa rellenas de cerdo y vegetales, cocidas al vapor y selladas a la plancha.", price: 3990, category: "Entradas", preparationTime: 10, restaurantId: 4 },
    { id: 404, name: "Sashimi de Atún x5", description: "Láminas frescas de atún rojo de aleta amarilla cortadas al estilo tradicional sashimi.", price: 5990, category: "Sashimi", preparationTime: 12, restaurantId: 4 }
  ],
  5: [
    { id: 501, name: "Ensalada César con Pollo", description: "Mezcla de lechugas, tiras de pechuga de pollo a la parrilla, crutones crujientes y láminas de queso parmesano con aderezo César.", price: 7990, category: "Ensaladas", preparationTime: 10, restaurantId: 5 },
    { id: 502, name: "Bowl de Quinoa y Aguacate", description: "Base nutritiva de quinoa con cubos de palta, tomate cherry fresco, pepino, garbanzos aliñados y vinagreta.", price: 8490, category: "Bowls", preparationTime: 12, restaurantId: 5 },
    { id: 503, name: "Wrap de Falafel y Hummus", description: "Fina tortilla de trigo enrollada rellena de croquetas de falafel, hummus de garbanzo y hojas verdes.", price: 6990, category: "Wraps", preparationTime: 10, restaurantId: 5 },
    { id: 504, name: "Jugo Verde Natural", description: "Prensado frío de manzana verde ácida, espinacas tiernas, pepino hidratante y un toque picante de jengibre.", price: 2990, category: "Bebidas", preparationTime: 5, restaurantId: 5 }
  ],
  6: [
    { id: 601, name: "Lomo Vetado a la Parrilla", description: "Corte de carne premium de 350g asado a las brasas a tu punto de cocción preferido, acompañado de chimichurri.", price: 14990, category: "Parrilla", preparationTime: 25, restaurantId: 6 },
    { id: 602, name: "Costillas de Cerdo BBQ", description: "Costillitas de cerdo tiernas cocidas a fuego lento bañadas en salsa barbacoa ahumada casera, acompañadas de papas fritas.", price: 12990, category: "Parrilla", preparationTime: 25, restaurantId: 6 },
    { id: 603, name: "Choripán Especial", description: "Chorizo artesanal de campo asado servido en crujiente pan baguette con salsa criolla y chimichurri.", price: 3990, category: "Entradas", preparationTime: 10, restaurantId: 6 },
    { id: 604, name: "Copa de Vino Tinto", description: "Copa de vino Carmenere o Cabernet Sauvignon reserva de viñas chilenas.", price: 3500, category: "Bebidas", preparationTime: 2, restaurantId: 6 }
  ],
  7: [
    { id: 701, name: "Pad Thai de Camarón", description: "Fideos de arroz salteados al wok con camarones, dados de tofu, huevo, brotes de soya y maní picado dulce.", price: 8990, category: "Fideos", preparationTime: 15, restaurantId: 7 },
    { id: 702, name: "Arroz Tres Delicias", description: "Arroz jazmín salteado al wok a alta temperatura con jamón, tortilla de huevo y guisantes verdes.", price: 6990, category: "Arroz", preparationTime: 10, restaurantId: 7 },
    { id: 703, name: "Pollo Kung Pao", description: "Trozos de pollo salteados con cacahuates tostados, pimientos morrones y guindillas secas picantes.", price: 7990, category: "Pollo", preparationTime: 12, restaurantId: 7 },
    { id: 704, name: "Rollitos de Primavera x4", description: "Rollos de masa crujiente rellenos de verduras salteadas en salsa de soya dulce, acompañados de salsa agridulce.", price: 2990, category: "Entradas", preparationTime: 8, restaurantId: 7 }
  ],
  8: [
    { id: 801, name: "Crêpe de Nutella y Frutilla", description: "Fina crepa dulce rellena de auténtica crema de avellanas Nutella y frutillas maduras picadas.", price: 4990, category: "Crêpes", preparationTime: 10, restaurantId: 8 },
    { id: 802, name: "Waffle con Helado y Caramelo", description: "Waffle belga calentito espolvoreado con azúcar flor, bola de helado de vainilla y salsa espesa de caramelo.", price: 5490, category: "Waffles", preparationTime: 10, restaurantId: 8 },
    { id: 803, name: "Tarta de Queso con Frutos Rojos", description: "Tarta de queso horneada de textura cremosa sobre base de galleta crocante con coulis de frutos silvestres.", price: 3990, category: "Pasteles", preparationTime: 5, restaurantId: 8 },
    { id: 804, name: "Café Capuccino Italiano", description: "Taza de café expreso doble con leche emulsionada y espuma cremosa, espolvoreado con cacao.", price: 2990, category: "Cafetería", preparationTime: 4, restaurantId: 8 }
  ]
};

const getFallbackMenu = (restaurantId) => {
  const rId = parseInt(restaurantId);
  return mockMenuDatabase[rId] || [
    { id: 991, name: "Plato de Prueba 1", description: "Descripción de prueba para el local", price: 5990, category: "Destacados", preparationTime: 15, restaurantId: rId },
    { id: 992, name: "Plato de Prueba 2", description: "Descripción de prueba para el local", price: 4990, category: "Destacados", preparationTime: 12, restaurantId: rId }
  ];
};

const getFoodImageUrl = (itemName, category) => {
  const name = itemName.toLowerCase();
  const cat = category.toLowerCase();
  
  if (name.includes('hamburguesa') || name.includes('burger') || name.includes('bite')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('papas') || name.includes('fritas')) {
    return 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('pizza') || name.includes('margarita') || name.includes('calzone')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('taco') || name.includes('pastor')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('burrito')) {
    return 'https://images.unsplash.com/photo-1626700051175-6518c4793f4f?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('quesadilla')) {
    return 'https://images.unsplash.com/photo-1599974579688-8dbdd335c77f?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('nachos') || name.includes('guacamole')) {
    return 'https://images.unsplash.com/photo-1513456852971-30c0b8199d4d?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('sushi') || name.includes('roll')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('gyoza') || name.includes('primavera')) {
    return 'https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('sashimi')) {
    return 'https://images.unsplash.com/photo-1534482421-64566f976cfa?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('ensalada') || name.includes('césar') || name.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('lomo') || name.includes('costilla') || name.includes('parrilla') || name.includes('choripán')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('pad thai') || name.includes('arroz') || name.includes('wok') || name.includes('kung pao')) {
    return 'https://images.unsplash.com/photo-1585032226651-759b368d7246?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('crêpe') || name.includes('crepa') || name.includes('tarta') || name.includes('pasteles')) {
    return 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('waffle')) {
    return 'https://images.unsplash.com/photo-1562376502-6f769499c886?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('jugo') || name.includes('bebida') || name.includes('refresco')) {
    return 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('café') || name.includes('capuccino')) {
    return 'https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('aros') || name.includes('cebolla')) {
    return 'https://images.unsplash.com/photo-1639024471283-2da7b3c6a26b?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('pan') || name.includes('ajo')) {
    return 'https://images.unsplash.com/photo-1573140247632-f8fd74997d5c?auto=format&fit=crop&w=300&q=80';
  }
  if (name.includes('vino') || name.includes('copa')) {
    return 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=300&q=80';
  }

  // Fallbacks por categoría
  if (cat.includes('hamburguesa') || cat.includes('combo')) {
    return 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('pizza')) {
    return 'https://images.unsplash.com/photo-1513104890138-7c749659a591?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('taco') || cat.includes('mexicana')) {
    return 'https://images.unsplash.com/photo-1565299585323-38d6b0865b47?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('sushi')) {
    return 'https://images.unsplash.com/photo-1579871494447-9811cf80d66c?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('ensalada') || cat.includes('saludable') || cat.includes('bowl')) {
    return 'https://images.unsplash.com/photo-1512621776951-a57141f2eefd?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('carne') || cat.includes('parrilla')) {
    return 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('bebida') || cat.includes('cafetería') || cat.includes('jugo')) {
    return 'https://images.unsplash.com/photo-1536882240095-0379873feb4e?auto=format&fit=crop&w=300&q=80';
  }
  if (cat.includes('postre') || cat.includes('crêpe') || cat.includes('waffle')) {
    return 'https://images.unsplash.com/photo-1519676867240-f03562e64548?auto=format&fit=crop&w=300&q=80';
  }

  return 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80';
};


const Menu = () => {
  const [menuItems, setMenuItems] = useState([]);
  const { addToCart } = useCart();
  const [loading, setLoading] = useState(true);
  const [selectedCustomizationItem, setSelectedCustomizationItem] = useState(null);
  const [customizationNote, setCustomizationNote] = useState('');
  const [menuIngredients, setMenuIngredients] = useState({});
  const [restaurantName, setRestaurantName] = useState('');
  const [restaurantImageUrl, setRestaurantImageUrl] = useState('');
  const [menuStockStatus, setMenuStockStatus] = useState({});
  const [menuSearchTerm, setMenuSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState('');
  const navigate = useNavigate();
  const { id } = useParams();

  const currentMockRestaurant = restaurantDetails[parseInt(id)];
  const isApiRestaurant = Boolean(restaurantName);
  const details = {
    name: restaurantName || currentMockRestaurant?.name || 'Nuestro Menú',
    type: isApiRestaurant ? 'Restaurante' : currentMockRestaurant?.type || 'Comida Rápida',
    rating: isApiRestaurant ? 4.7 : currentMockRestaurant?.rating || 4.7,
    time: isApiRestaurant ? '20-30 min' : currentMockRestaurant?.time || '20-30 min',
    deliveryFee: isApiRestaurant ? 'Gratis' : currentMockRestaurant?.deliveryFee || 'Gratis',
    gradient: isApiRestaurant ? 'from-primary-600 via-orange-500 to-primary-700' : currentMockRestaurant?.gradient || 'from-primary-600 via-orange-500 to-primary-700',
    logo: restaurantImageUrl || currentMockRestaurant?.logo || null,
    banner: restaurantImageUrl || currentMockRestaurant?.banner || null
  };

  useEffect(() => {
    loadMenuItems();
    if (id) {
      loadRestaurantName();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  const loadRestaurantName = async () => {
    try {
      const response = await fetch(apiURL(`/api/restaurants/${id}`));
      if (response.ok) {
        const data = await response.json();
        setRestaurantName(data.name);
        setRestaurantImageUrl(data.imageUrl || '');
      } else {
        setRestaurantName(mockRestaurantNames[parseInt(id)] || 'Nuestro Menú');
        setRestaurantImageUrl('');
      }
    } catch (error) {
      setRestaurantName(mockRestaurantNames[parseInt(id)] || 'Nuestro Menú');
      setRestaurantImageUrl('');
    }
  };

  const loadMenuItems = async () => {
    try {
      const response = await fetch(apiURL('/api/menu'));
      if (response.ok) {
        const data = await response.json();
        const filteredData = id ? data.filter(item => item.restaurantId === parseInt(id)) : data;
        
        if (id && filteredData.length === 0) {
          const fallbackData = getFallbackMenu(id).map((item) => ({ ...item, isMock: true }));
          setMenuItems(fallbackData);
          await loadMenuIngredients(fallbackData);
          await validateMenuStock(fallbackData);
        } else {
          const realData = filteredData.map((item) => ({ ...item, isMock: false }));
          setMenuItems(realData);
          await loadMenuIngredients(realData);
          await validateMenuStock(realData);
        }
      } else {
        const fallbackData = id ? getFallbackMenu(id) : [];
        setMenuItems(fallbackData);
        toast.info('Cargando menú local de prueba');
      }
      setLoading(false);
    } catch (error) {
      const fallbackData = id ? getFallbackMenu(id) : [];
      setMenuItems(fallbackData);
      setLoading(false);
    }
  };

  const validateMenuStock = async (items) => {
    const stockStatus = {};
    for (const item of items) {
      try {
        if (!item.isMock) {
          const response = await fetch(apiURL(`/api/menu/${item.id}/validate-stock?quantity=1`));
          if (response.ok) {
            const data = await response.json();
            stockStatus[item.id] = data.hasSufficientStock;
          } else {
            stockStatus[item.id] = true;
          }
        } else {
          stockStatus[item.id] = true;
        }
      } catch (error) {
        stockStatus[item.id] = true;
      }
    }
    setMenuStockStatus(stockStatus);
  };

  const loadMenuIngredients = async (items) => {
    const ingredientsMap = {};
    for (const item of items) {
      try {
        if (!item.isMock) {
          const response = await fetch(apiURL(`/api/admin/menu-ingredients/${item.id}`));
          if (response.ok) {
            const data = await response.json();
            ingredientsMap[item.id] = data;
          } else {
            ingredientsMap[item.id] = [];
          }
        } else {
          ingredientsMap[item.id] = [];
        }
      } catch (error) {
        ingredientsMap[item.id] = [];
      }
    }
    setMenuIngredients(ingredientsMap);
  };

  const openCustomization = (item) => {
    setSelectedCustomizationItem(item);
    setCustomizationNote('');
  };

  const confirmAddToCart = () => {
    const userRole = localStorage.getItem('userRole');
    if (!userRole) {
      toast.info('Debes iniciar sesión para agregar productos al carrito');
      navigate('/login');
      return;
    }
    const item = selectedCustomizationItem;
    addToCart(item, customizationNote, { id: parseInt(id) || 1, name: details.name, deliveryFee: details.deliveryFee });
    toast.success(`${item.name} agregado al carrito`);
    setSelectedCustomizationItem(null);
    setCustomizationNote('');
  };

  const filteredMenuItems = menuItems.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(menuSearchTerm.toLowerCase()) || 
                          (item.description && item.description.toLowerCase().includes(menuSearchTerm.toLowerCase()));
    return matchesSearch;
  });

  const categories = useMemo(() => {
    return [...new Set(filteredMenuItems.map(item => item.category))];
  }, [filteredMenuItems]);

  useEffect(() => {
    if (categories.length > 0 && !activeCategory) {
      setActiveCategory(categories[0]);
    }
  }, [categories, activeCategory]);

  useEffect(() => {
    const handleScroll = () => {
      const categoryElements = categories.map(cat => document.getElementById(`category-sec-${cat}`));
      
      let currentCategory = '';
      for (const el of categoryElements) {
        if (el) {
          const rect = el.getBoundingClientRect();
          if (rect.top <= 140) {
            currentCategory = el.id.replace('category-sec-', '');
          }
        }
      }
      
      if (currentCategory) {
        setActiveCategory(currentCategory);
      }
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [categories]);

  const scrollToCategory = (categoryName) => {
    const element = document.getElementById(`category-sec-${categoryName}`);
    if (element) {
      const offset = 120; // sticky header + category bar height
      const bodyRect = document.body.getBoundingClientRect().top;
      const elementRect = element.getBoundingClientRect().top;
      const elementPosition = elementRect - bodyRect;
      const offsetPosition = elementPosition - offset;
      
      window.scrollTo({
        top: offsetPosition,
        behavior: 'smooth'
      });
      setActiveCategory(categoryName);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  return (
    <div className="bg-appbg min-h-screen pb-16 animate-fade-in">
      
      {/* RESTAURANT HERO COVER BANNER */}
      <div className={`bg-gradient-to-br ${details.gradient} text-white h-44 relative border-b border-gray-100 shadow-sm overflow-hidden`}>
        {/* Imagen de banner del restaurante */}
        {details.banner && (
          <img
            src={details.banner}
            alt={`Banner ${details.name}`}
            className="absolute inset-0 w-full h-full object-cover opacity-60"
            onError={(e) => { e.target.style.display = 'none'; }}
          />
        )}
        {/* Overlay oscuro para legibilidad */}
        <div className="absolute inset-0 bg-black/30" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full relative z-10 flex items-start pt-6">
          {/* Botón de Retorno */}
          <button 
            onClick={() => navigate('/restaurants')}
            className="flex items-center text-xs font-black text-white/90 hover:text-white bg-black/20 hover:bg-black/35 px-4 py-2.5 rounded-xl transition-all focus:outline-none backdrop-blur-sm"
          >
            <ArrowLeft className="h-4 w-4 mr-1.5" />
            <span>Volver a Locales</span>
          </button>
        </div>
      </div>


      {/* RESTAURANT PROFILE CARD OVERLAPPING */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-20 md:-mt-24 relative z-20 mb-8">
        <div className="bg-white border border-gray-100 rounded-3xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5">
            {/* Logo Circular */}
            <div className={`h-24 w-24 rounded-full bg-gradient-to-br ${details.gradient} border-4 border-white shadow-lg flex-shrink-0 flex items-center justify-center overflow-hidden`}>
              {details.logo ? (
                <img
                  src={details.logo}
                  alt={details.name}
                  className="h-full w-full object-cover"
                  onError={(e) => { e.target.style.display='none'; e.target.nextSibling.style.display='flex'; }}
                />
              ) : null}
              <span className="text-white font-extrabold text-2xl tracking-tighter" style={{display: details.logo ? 'none' : 'flex'}}>
                {details.name.split(' ').map(n => n[0]).join('')}
              </span>
            </div>

            
            {/* Info del local */}
            <div className="text-center sm:text-left">
              <div className="flex flex-wrap items-center justify-center sm:justify-start gap-2 mb-1.5">
                <span className="bg-orange-50 text-primary text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                  {details.type}
                </span>
                {details.deliveryFee === 'Gratis' ? (
                  <span className="bg-emerald-50 text-accent text-[10px] font-extrabold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Envío Gratis
                  </span>
                ) : (
                  <span className="bg-gray-100 text-gray-600 text-[10px] font-bold px-2 py-0.5 rounded-md uppercase tracking-wider">
                    Envío Conveniente
                  </span>
                )}
              </div>
              
              <h1 className="text-2xl md:text-3xl font-black text-secondary-900 leading-tight">
                {details.name}
              </h1>
              
              {/* Badges de Información */}
              <div className="flex flex-wrap justify-center sm:justify-start items-center gap-x-4 gap-y-1.5 mt-2.5 text-xs font-bold text-gray-500">
                <span className="flex items-center text-gray-700 bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  <Star className="h-3.5 w-3.5 text-yellow-500 mr-1 fill-current" />
                  {details.rating} <span className="text-gray-400 font-medium ml-1">Excelente</span>
                </span>
                <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  <Clock className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  {details.time}
                </span>
                <span className="flex items-center bg-gray-50 px-2.5 py-1 rounded-lg border border-gray-100">
                  <Truck className="h-3.5 w-3.5 text-gray-400 mr-1" />
                  Despacho: <span className="font-extrabold text-secondary-900 ml-0.5">{details.deliveryFee}</span>
                </span>
              </div>
            </div>
          </div>
          
          {/* Promoción decorativa */}
          <div className="flex flex-col items-center md:items-end gap-2 border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 w-full md:w-auto">
            <div className="bg-orange-50 border border-orange-100 rounded-2xl px-5 py-3 text-center md:text-right w-full sm:w-auto">
              <span className="text-xs font-black text-primary block uppercase tracking-wide">Promoción QuickBite</span>
              <span className="text-[11px] font-extrabold text-orange-600 block mt-0.5">¡10% OFF en todos los combos usando la app!</span>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE CATEGORÍAS STICKY Y BUSCADOR INTERNO */}
      <div className="sticky top-0 z-30 bg-white border-b border-gray-100 shadow-sm mb-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3.5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          
          {/* Categorías (Píldoras scrollables) */}
          <div className="flex items-center space-x-2 overflow-x-auto pb-1 md:pb-0 scrollbar-hide flex-grow mr-4">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => scrollToCategory(cat)}
                className={`whitespace-nowrap px-4 py-2 rounded-full text-xs font-bold transition-all duration-200 border ${
                  activeCategory === cat
                    ? 'bg-primary text-white border-primary shadow-sm'
                    : 'bg-gray-50 text-gray-600 border-gray-100 hover:border-gray-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
          
          {/* Buscador de menú */}
          <div className="relative w-full md:max-w-xs flex-shrink-0">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar plato en el menú..."
              value={menuSearchTerm}
              onChange={(e) => setMenuSearchTerm(e.target.value)}
              className="pl-9 pr-4 py-2 w-full rounded-full border border-gray-200 focus:outline-none focus:ring-1 focus:ring-primary focus:border-transparent text-xs font-semibold text-gray-700 shadow-sm bg-gray-50/50 hover:bg-white focus:bg-white transition-all"
            />
          </div>

        </div>
      </div>

      {/* Main Grid con lista de platos a la izquierda y carrito a la derecha */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
          
          {/* Columna Izquierda: Listado de Platos */}
          <div className="lg:col-span-2 space-y-10">
            {categories.length > 0 ? (
              categories.map(category => (
                <div 
                  key={category} 
                  id={`category-sec-${category}`}
                  className="bg-white border border-gray-100 rounded-3xl p-6 shadow-sm scroll-mt-28"
                >
                  <h2 className="text-lg font-black text-secondary-900 mb-6 pb-2 border-b border-gray-100 flex items-center">
                    <UtensilsCrossed className="h-5 w-5 text-primary mr-2" />
                    {category}
                  </h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {filteredMenuItems
                      .filter(item => item.category === category)
                      .map(item => {
                        const hasStock = menuStockStatus[item.id] !== false;
                        return (
                          <div 
                            key={item.id} 
                            onClick={() => hasStock && openCustomization(item)}
                            className={`flex flex-row justify-between items-stretch p-4 bg-white border border-gray-100 hover:border-primary/20 rounded-2xl hover:shadow-lg transition-all duration-300 cursor-pointer relative group ${!hasStock ? 'opacity-60 cursor-not-allowed' : ''}`}
                          >
                            
                            {/* Información del plato */}
                            <div className="flex-grow flex flex-col justify-between pr-3">
                              <div>
                                <h3 className="text-sm font-black text-secondary-900 leading-snug group-hover:text-primary transition-colors">
                                  {item.name}
                                </h3>
                                <p className="text-xs text-gray-400 mt-1.5 mb-3 line-clamp-2 leading-relaxed font-semibold">
                                  {item.description}
                                </p>
                              </div>
                              
                              <div className="flex items-center space-x-3 text-[11px] font-bold mt-auto">
                                <span className="text-primary text-sm font-black">
                                  ${item.price.toLocaleString('es-CL')}
                                </span>
                                <span className="flex items-center text-gray-400">
                                  <Clock className="h-3.5 w-3.5 mr-0.5" />
                                  {item.preparationTime} min
                                </span>
                              </div>
                            </div>
                            
                            {/* Imagen del plato a la derecha (Estilo PedidosYa exacto) */}
                            <div className="h-20 w-20 bg-gray-50 border border-gray-100 rounded-xl flex-shrink-0 flex items-center justify-center font-bold text-gray-300 text-[10px] relative overflow-hidden self-center shadow-inner">
                              <img
                                src={item.imageUrl || getFoodImageUrl(item.name, item.category)}
                                alt={item.name}
                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                onError={(e) => { e.target.src = 'https://images.unsplash.com/photo-1498837167922-ddd27525d352?auto=format&fit=crop&w=300&q=80'; }}
                              />
                              
                              {/* Botón flotante de añadir '+' */}
                              {hasStock ? (
                                <div className="absolute bottom-1 right-1 h-7 w-7 rounded-full bg-primary hover:bg-primary-600 text-white flex items-center justify-center shadow-md transform group-hover:scale-105 active:scale-95 transition-all">
                                  <Plus className="h-4 w-4" />
                                </div>
                              ) : (
                                <div className="absolute inset-0 bg-black/45 flex items-center justify-center">
                                  <span className="text-white text-[8px] font-black uppercase tracking-wider bg-black/60 px-1.5 py-0.5 rounded">Sin Stock</span>
                                </div>
                              )}
                            </div>
                            
                          </div>
                        );
                      })}
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-20 bg-white border border-gray-100 rounded-3xl shadow-sm">
                <UtensilsCrossed className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-xl font-bold text-gray-900 mb-2">No se encontraron platos</h3>
                <p className="text-sm text-gray-500">Prueba ajustando el término de búsqueda en la barra superior.</p>
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Modal de Personalización */}
      {selectedCustomizationItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 max-h-[90vh] overflow-y-auto border border-gray-100 animate-slide-up">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-gray-100">
              <h3 className="text-md font-black text-secondary-900">
                Personalizar {selectedCustomizationItem.name}
              </h3>
              <button
                onClick={() => setSelectedCustomizationItem(null)}
                className="text-gray-400 hover:text-gray-600 hover:bg-gray-50 p-1 rounded-full transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {menuIngredients[selectedCustomizationItem.id] && menuIngredients[selectedCustomizationItem.id].length > 0 && (
              <div className="mb-4">
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                  Ingredientes incluidos
                </label>
                <div className="space-y-2">
                  {menuIngredients[selectedCustomizationItem.id].map((mi) => (
                    <div key={mi.id} className="flex items-center justify-between p-2.5 bg-gray-50 rounded-xl border border-gray-100">
                      <div className="flex items-center">
                        {mi.isOptional ? (
                          <input
                            type="checkbox"
                            id={`ingredient-${mi.id}`}
                            checked={!customizationNote?.toLowerCase().includes(`sin ${mi.ingredientName?.toLowerCase()}`)}
                            onChange={(e) => {
                              if (!e.target.checked) {
                                setCustomizationNote(prev => {
                                      const current = prev || '';
                                      if (!current.toLowerCase().includes(`sin ${mi.ingredientName?.toLowerCase()}`)) {
                                        return current ? `${current}, Sin ${mi.ingredientName}` : `Sin ${mi.ingredientName}`;
                                      }
                                      return current;
                                    });
                              } else {
                                setCustomizationNote(prev => {
                                      const current = prev || '';
                                      return current.replace(new RegExp(`,?\\s*Sin ${mi.ingredientName}`, 'gi'), '').trim();
                                    });
                              }
                            }}
                            className="h-4 w-4 text-primary focus:ring-primary border-gray-300 rounded"
                          />
                        ) : (
                          <div className="h-4 w-4 text-emerald-500 flex items-center justify-center">
                            <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          </div>
                        )}
                        <label htmlFor={`ingredient-${mi.id}`} className="ml-2 text-xs font-bold text-gray-700">
                          {mi.ingredientName}
                          {mi.isOptional && <span className="text-[10px] text-gray-400 font-medium ml-1">(Removible)</span>}
                          {!mi.isOptional && <span className="text-[10px] text-emerald-600 font-medium ml-1">(Fijo)</span>}
                        </label>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="mb-4">
              <label className="block text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">
                Notas Adicionales (Ej: Extra aderezo, bien cocido)
              </label>
              <textarea
                className="w-full p-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-1 focus:ring-primary text-xs font-semibold text-gray-700 bg-gray-50/50"
                rows="3"
                placeholder="Escribe tus preferencias adicionales aquí..."
                value={customizationNote}
                onChange={(e) => setCustomizationNote(e.target.value)}
              ></textarea>
            </div>
            <div className="flex justify-end space-x-3 border-t border-gray-100 pt-4">
              <button 
                onClick={() => setSelectedCustomizationItem(null)}
                className="px-4 py-2 border border-gray-200 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-50"
              >
                Cancelar
              </button>
              <button 
                onClick={confirmAddToCart}
                className="px-4 py-2 bg-primary hover:bg-primary-600 text-white rounded-xl text-xs font-bold transition-colors shadow-sm"
              >
                Agregar al Carrito
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Menu;

