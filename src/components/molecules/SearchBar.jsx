import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const SearchBar = ({ 
  value, 
  onChange, 
  placeholder = "Search...", 
  className = "" 
}) => {
  return (
    <div className={cn("relative", className)}>
      <ApperIcon 
        name="Search" 
        size={20} 
        className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400" 
      />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full pl-10 pr-4 py-3 bg-white border-2 border-slate-200 rounded-lg text-slate-900 placeholder-slate-400 focus:border-primary focus:ring-2 focus:ring-blue-100 transition-all duration-200"
      />
    </div>
  );
};

export default SearchBar;