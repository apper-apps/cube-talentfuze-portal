import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Empty = ({ 
  title = "No data found",
  description = "Get started by adding your first item.",
  actionLabel = "Add Item",
  onAction,
  icon = "Database",
  className = "",
  ...props 
}) => {
  return (
    <div className={cn("flex flex-col items-center justify-center py-16 px-4 text-center", className)} {...props}>
      <div className="w-24 h-24 bg-gradient-to-br from-slate-100 to-slate-50 rounded-full flex items-center justify-center mb-8">
        <ApperIcon name={icon} className="w-12 h-12 text-slate-400" />
      </div>
      <h3 className="text-2xl font-bold text-slate-900 mb-4">
        {title}
      </h3>
      <p className="text-slate-600 mb-8 max-w-md text-lg">
        {description}
      </p>
      {onAction && (
        <button
          onClick={onAction}
          className="bg-gradient-to-r from-primary to-accent text-white px-8 py-3 rounded-lg font-semibold hover:from-blue-600 hover:to-blue-500 transition-all duration-200 transform hover:scale-105 flex items-center gap-3 text-base shadow-lg hover:shadow-xl"
        >
          <ApperIcon name="Plus" size={20} />
          {actionLabel}
        </button>
      )}
    </div>
  );
};

export default Empty;