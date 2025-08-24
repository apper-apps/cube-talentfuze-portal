import React from "react";
import { cn } from "@/utils/cn";

const Card = React.forwardRef(({ 
  className = "", 
  children,
  hover = false,
  ...props 
}, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "bg-white border border-slate-200 rounded-xl shadow-lg",
        hover && "hover:shadow-xl transition-all duration-200 hover:scale-102",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
});

Card.displayName = "Card";

export default Card;