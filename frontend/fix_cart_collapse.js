const fs = require('fs');
const file = 'c:/Users/mmelo/Desktop/Quickbite/QuickBite/frontend/src/components/CartSidebar.js';
let content = fs.readFileSync(file, 'utf8');

// 1. Add useState
if (!content.includes('useState')) {
  content = content.replace(/import React from 'react';/, "import React, { useState } from 'react';");
}

// 2. Add ChevronDown, ChevronUp
if (!content.includes('ChevronDown')) {
  content = content.replace(/import \{ X, ShoppingCart, Plus, Minus, Trash2 \} from 'lucide-react';/, "import { X, ShoppingCart, Plus, Minus, Trash2, ChevronDown, ChevronUp } from 'lucide-react';");
}

// 3. Add state and toggle function
if (!content.includes('collapsedRestaurants')) {
  content = content.replace(/const navigate = useNavigate\(\);/, `const navigate = useNavigate();
  const [collapsedRestaurants, setCollapsedRestaurants] = useState({});

  const toggleRestaurantCollapse = (rId) => {
    setCollapsedRestaurants(prev => ({
      ...prev,
      [rId]: !prev[rId]
    }));
  };`);
}

// 4. Update header
const headerRegex = /<div className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center">[\s\S]*?<\/div>/;
const newHeader = `<div 
                      className="bg-gray-50 px-4 py-3 border-b border-gray-100 flex justify-between items-center cursor-pointer hover:bg-gray-100 transition-colors"
                      onClick={() => toggleRestaurantCollapse(rId)}
                    >
                      <div className="flex items-center gap-2">
                        {collapsedRestaurants[rId] ? <ChevronDown className="h-4 w-4 text-gray-500" /> : <ChevronUp className="h-4 w-4 text-gray-500" />}
                        <h3 className="font-bold text-gray-800">{group.restaurant.name}</h3>
                        {collapsedRestaurants[rId] && (
                          <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full ml-1">
                            {group.items.length}
                          </span>
                        )}
                      </div>
                      <button 
                        onClick={(e) => { e.stopPropagation(); clearCartForRestaurant(rId); }}
                        className="text-xs text-red-500 hover:text-red-700 font-medium flex items-center"
                      >
                        <Trash2 className="h-3 w-3 mr-1" /> Vaciar
                      </button>
                    </div>`;
content = content.replace(headerRegex, newHeader);

// 5. Wrap content
// We need to wrap <div className="p-4 space-y-4">...</div> and <div className="px-4 py-3 bg-gray-50 border-t border-gray-100 space-y-2">...</div>
content = content.replace(/<div className="p-4 space-y-4">/, "{!collapsedRestaurants[rId] && (\n                      <>\n                        <div className=\"p-4 space-y-4\">");
content = content.replace(/<\/button>\n                    <\/div>\n                  <\/div>/, "</button>\n                    </div>\n                      </>\n                    )}\n                  </div>");

fs.writeFileSync(file, content);
console.log('CartSidebar.js updated for collapse functionality!');
