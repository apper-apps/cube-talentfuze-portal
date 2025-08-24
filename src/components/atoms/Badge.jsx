import React from "react";
import { cn } from "@/utils/cn";

const Badge = React.forwardRef(({ 
  className = "", 
  variant = "default", 
  children,
  ...props 
}, ref) => {
  const variants = {
default: "bg-slate-100 text-slate-700",
    active: "bg-gradient-to-r from-success to-emerald-600 text-white",
    inactive: "bg-gradient-to-r from-slate-400 to-slate-500 text-white",
    pending: "bg-gradient-to-r from-accent to-blue-500 text-white",
    available: "bg-gradient-to-r from-success to-emerald-600 text-white",
    assigned: "bg-gradient-to-r from-accent to-blue-500 text-white",
    warning: "bg-gradient-to-r from-warning to-amber-600 text-white",
    error: "bg-gradient-to-r from-error to-red-600 text-white"
  };

  return (
    <span
      ref={ref}
      className={cn(
        "inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
});

Badge.displayName = "Badge";

export default Badge;