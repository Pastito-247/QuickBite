const fs = require('fs');
const file = 'c:/Users/mmelo/Desktop/Quickbite/QuickBite/frontend/src/components/Navbar.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add import
if (!content.includes('CartContext')) {
  content = content.replace(/import \{ toast \} from 'react-toastify';/, "import { toast } from 'react-toastify';\nimport { useCart } from '../context/CartContext';");
}

// 2. Add hook usage
content = content.replace(/const Navbar = \(\) => \{/, "const Navbar = () => {\n  const { toggleCart, cart, clearCart } = useCart();");

// 3. Clear cart on logout
content = content.replace(/const handleLogout = \(\) => \{\s*localStorage\.removeItem\('token'\);\s*localStorage\.removeItem\('userRole'\);\s*navigate\('\/login'\);\s*\};/, "const handleLogout = () => {\n    localStorage.removeItem('token');\n    localStorage.removeItem('userRole');\n    clearCart();\n    navigate('/login');\n  };");

// 4. Update cart button
const targetRegex = /<button[\s\n]*onClick=\{\(\) => \{[\s\n]*if \(\!userRole\) \{[\s\n]*toast\.info\('Debes iniciar sesión para usar el carrito'\);[\s\n]*navigate\('\/login'\);[\s\n]*\} else \{[\s\n]*navigate\('\/menu'\);[\s\n]*\}[\s\n]*\}\}[\s\n]*className="p-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 rounded-full"[\s\n]*title="Ver Carrito"[\s\n]*>[\s\n]*<ShoppingCart className="h-5 w-5" \/>[\s\n]*<\/button>/m;

const replacementButton = `<button 
                  onClick={() => {
                    if (!userRole) {
                      toast.info('Debes iniciar sesión para usar el carrito');
                      navigate('/login');
                    } else {
                      toggleCart();
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 rounded-full relative" 
                  title="Ver Carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                  {cart.length > 0 && (
                    <span className="absolute top-0 right-0 inline-flex items-center justify-center px-1.5 py-1 text-[10px] font-bold leading-none text-white transform translate-x-1/4 -translate-y-1/4 bg-primary rounded-full">
                      {cart.length}
                    </span>
                  )}
                </button>`;

if (targetRegex.test(content)) {
  content = content.replace(targetRegex, replacementButton);
  fs.writeFileSync(file, content);
  console.log('Navbar.js updated successfully!');
} else {
  console.log('Target button NOT FOUND. Regex failed.');
}
