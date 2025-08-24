import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Error = ({ 
  message = "Something went wrong. Please try again.", 
  onRetry, 
  className = "",
  ...props 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)} {...props}>
      <div className="w-20 h-20 bg-gradient-to-br from-red-100 to-red-50 rounded-full flex items-center justify-center mb-6">
        <ApperIcon name="AlertTriangle" className="w-10 h-10 text-error" />
      </div>
      <h3 className="text-xl font-semibold text-slate-900 mb-3">
        Oops! Something went wrong
      </h3>
      <p className="text-slate-600 mb-6 max-w-md">
        {message}
      </p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="bg-gradient-to-r from-primary to-accent text-white px-6 py-3 rounded-lg font-medium hover:from-blue-600 hover:to-blue-500 transition-all duration-200 transform hover:scale-105 flex items-center gap-2"
        >
          <ApperIcon name="RefreshCw" size={18} />
          Try Again
        </button>
      )}
    </div>
  );
};

export default Error;