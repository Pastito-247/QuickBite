const fs = require('fs');
const file = 'c:/Users/mmelo/Desktop/Quickbite/QuickBite/frontend/src/pages/Menu.js';
let content = fs.readFileSync(file, 'utf8');

content = content.replace(/import \{ useNavigate, useParams \} from 'react-router-dom';/, `import { useNavigate, useParams } from 'react-router-dom';\nimport { useCart } from '../context/CartContext';`);

content = content.replace(/const \[cart, setCart\] = useState\(\[\]\);/, `const { addToCart } = useCart();`);

content = content.replace(/  const confirmAddToCart = \(\) => \{[\s\S]*?const filteredMenuItems = menuItems\.filter/, `  const confirmAddToCart = () => {\n    const item = selectedCustomizationItem;\n    addToCart(item, customizationNote, { id: parseInt(id) || 1, name: details.name, deliveryFee: details.deliveryFee });\n    toast.success(\`\${item.name} agregado al carrito\`);\n    setSelectedCustomizationItem(null);\n    setCustomizationNote('');\n  };\n\n  const filteredMenuItems = menuItems.filter`);

content = content.replace(/          \{\/\* Columna Derecha: Tu Pedido \(Carrito\) \*\/\}\s*<div className=.lg:col-span-1.>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>\s*\{\/\* Modal de Personalización \*\/\}/, `        </div>\n      </div>\n\n      {/* Modal de Personalización */}`);

content = content.replace(/<div className=.lg:col-span-2.>/, '<div className="col-span-full">');

fs.writeFileSync(file, content);
console.log('Done!');
