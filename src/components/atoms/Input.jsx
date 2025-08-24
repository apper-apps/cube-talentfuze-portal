import React from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ 
  className = "", 
  type = "text",
  label,
  error,
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <input
        ref={ref}
        type={type}
        className={cn(
          "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base",
          error && "border-error focus:border-error focus:ring-red-100",
          className
        )}
        {...props}
      />
      {error && (
        <p className="mt-2 text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
});

Input.displayName = "Input";

export default Input;