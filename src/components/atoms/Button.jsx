import React from "react";
import { cn } from "@/utils/cn";

const Button = React.forwardRef(({ 
  className = "", 
  variant = "primary", 
  size = "md", 
  children, 
  disabled = false,
  ...props 
}, ref) => {
  const baseClasses = "inline-flex items-center justify-center font-medium transition-all duration-200 transform focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed";
  
  const variants = {
    primary: "bg-gradient-to-r from-primary to-accent text-white hover:from-blue-600 hover:to-blue-500 focus:ring-blue-500 hover:scale-105 shadow-lg hover:shadow-xl",
    secondary: "bg-gradient-to-r from-slate-100 to-slate-50 text-slate-700 hover:from-slate-200 hover:to-slate-100 focus:ring-slate-500 hover:scale-102",
    outline: "border-2 border-slate-200 text-slate-700 hover:border-primary hover:text-primary hover:bg-blue-50 focus:ring-blue-500 hover:scale-102",
    danger: "bg-gradient-to-r from-error to-red-600 text-white hover:from-red-600 hover:to-red-700 focus:ring-red-500 hover:scale-105 shadow-lg hover:shadow-xl"
  };

  const sizes = {
    sm: "px-3 py-2 text-sm rounded-md",
    md: "px-6 py-3 text-base rounded-lg",
    lg: "px-8 py-4 text-lg rounded-xl"
  };

  return (
    <button
      ref={ref}
      className={cn(
        baseClasses,
        variants[variant],
        sizes[size],
        disabled && "transform-none hover:scale-100",
        className
      )}
      disabled={disabled}
      {...props}
    >
      {children}
    </button>
  );
});

Button.displayName = "Button";

export default Button;