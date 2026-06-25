const fs = require('fs');
const file = 'c:/Users/mmelo/Desktop/Quickbite/QuickBite/frontend/src/components/Navbar.js';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes('CartContext')) {
  content = content.replace(/import \{ toast \} from 'react-toastify';/, "import { toast } from 'react-toastify';\nimport { useCart } from '../context/CartContext';");
  content = content.replace(/const Navbar = \(\) => \{/, "const Navbar = () => {\n  const { toggleCart, cart } = useCart();");
}

const targetButton = `<button 
                  onClick={() => {
                    if (!userRole) {
                      toast.info('Debes iniciar sesión para usar el carrito');
                      navigate('/login');
                    } else {
                      navigate('/menu');
                    }
                  }}
                  className="p-2 text-gray-500 hover:text-primary transition-colors hover:bg-gray-50 rounded-full" 
                  title="Ver Carrito"
                >
                  <ShoppingCart className="h-5 w-5" />
                </button>`;

const replacementButton = `<button 
                  onClick={toggleCart}
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

content = content.replace(targetButton, replacementButton);

fs.writeFileSync(file, content);
console.log('Done!');
