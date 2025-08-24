import React from "react";
import { cn } from "@/utils/cn";

const Select = React.forwardRef(({ 
  className = "", 
  label,
  error,
  options = [],
  placeholder = "Select an option...",
  ...props 
}, ref) => {
  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-semibold text-slate-700 mb-2">
          {label}
        </label>
      )}
      <select
        ref={ref}
        className={cn(
          "w-full px-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200 text-base",
          error && "border-error focus:border-error focus:ring-red-100",
          className
        )}
        {...props}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && (
        <p className="mt-2 text-sm text-error font-medium">{error}</p>
      )}
    </div>
  );
});

Select.displayName = "Select";

export default Select;