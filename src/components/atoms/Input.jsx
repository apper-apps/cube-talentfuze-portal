import React, { forwardRef } from "react";
import { cn } from "@/utils/cn";

const Input = React.forwardRef(({ className, type = 'text', helpText, ...props }, ref) => {
  return (
    <div className="w-full">
      <input
        type={type}
        className={cn(
          'flex h-10 w-full rounded-md border border-slate-200 bg-white px-3 py-2 text-sm ring-offset-white file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-slate-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-slate-950 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
          className
        )}
        ref={ref}
        {...props}
      />
      {helpText && (
        <p className="mt-1 text-sm text-slate-600">{helpText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;