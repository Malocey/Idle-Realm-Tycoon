import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost' | 'success';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ children, variant = 'primary', size = 'md', icon, className, onClick, ...props }) => {
  const baseStyle = "font-semibold rounded-lg shadow-md focus:outline-none focus:ring-2 focus:ring-opacity-75 transition-all duration-150 ease-in-out flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95 active:brightness-90 relative overflow-hidden"; // Added relative and overflow-hidden
  const variantStyles = {
    primary: "bg-sky-500 hover:bg-sky-600 text-white focus:ring-sky-400",
    secondary: "bg-slate-600 hover:bg-slate-700 text-slate-100 focus:ring-slate-500",
    danger: "bg-red-500 hover:bg-red-600 text-white focus:ring-red-400",
    ghost: "bg-transparent hover:bg-slate-700 text-slate-300 focus:ring-slate-500 border border-slate-600 hover:border-slate-500 active:bg-slate-700/50",
    success: "bg-green-500 hover:bg-green-600 text-white focus:ring-green-400"
  };
  const sizeStyles = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };

  const handleRippleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    const button = event.currentTarget;
    const ripple = document.createElement("span");
    const rect = button.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;

    ripple.style.width = ripple.style.height = `${size}px`;
    ripple.style.left = `${x}px`;
    ripple.style.top = `${y}px`;
    ripple.classList.add("ripple");

    // Determine ripple color based on variant
    if (variant === 'ghost') {
      ripple.style.backgroundColor = 'rgba(100, 116, 139, 0.3)'; // slate-500 with opacity
    } else {
      ripple.style.backgroundColor = 'rgba(255, 255, 255, 0.3)'; // white with opacity
    }

    // Remove existing ripples to prevent too many overlapping if clicked rapidly
    const existingRipple = button.querySelector(".ripple");
    if (existingRipple) {
      existingRipple.remove();
    }
    
    button.appendChild(ripple);

    setTimeout(() => {
      ripple.remove();
    }, 600); // Matches animation duration

    // Call the original onClick handler if it exists
    if (onClick) {
      onClick(event);
    }
  };

  return (
    <button 
      className={`${baseStyle} ${variantStyles[variant]} ${sizeStyles[size]} ${className || ''}`} 
      onClick={handleRippleClick} // Use the new handler
      {...props}
    >
      {icon && <span className="w-4 h-4">{icon}</span>}
      {children && <span>{children}</span>}
    </button>
  );
};

export default Button;