import React from 'react';
import { ChefHat } from 'lucide-react';

const QuickBiteLogo = ({ className = "", iconSize = "h-8 w-8", speedLineSize = "h-6 w-6", color = "text-primary" }) => {
  return (
    <div className={`flex items-center ${className}`}>
      {/* Speed Lines */}
      <svg
        className={`${speedLineSize} ${color} -mr-2 opacity-80`}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        <path d="M2 12h8" />
        <path d="M5 6h5" />
        <path d="M5 18h5" />
      </svg>
      {/* Main Hat */}
      <ChefHat className={`${iconSize} ${color} z-10`} />
    </div>
  );
};

export default QuickBiteLogo;
