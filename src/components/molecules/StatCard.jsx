import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";

const StatCard = ({ 
  title, 
  value, 
  icon, 
  trend,
  trendValue,
  className = "" 
}) => {
  return (
    <Card className={cn("p-6", className)} hover>
      <div className="flex items-center justify-between">
        <div className="flex-1">
          <p className="text-sm font-medium text-slate-600 uppercase tracking-wide">
            {title}
          </p>
          <p className="text-3xl font-bold text-slate-900 mt-2">
            {value}
          </p>
          {trend && trendValue && (
            <div className="flex items-center mt-3">
              <ApperIcon 
                name={trend === "up" ? "TrendingUp" : "TrendingDown"} 
                size={16} 
                className={trend === "up" ? "text-success" : "text-error"}
              />
              <span className={cn(
                "text-sm font-semibold ml-1",
                trend === "up" ? "text-success" : "text-error"
              )}>
                {trendValue}
              </span>
            </div>
          )}
        </div>
        <div className="w-12 h-12 bg-gradient-to-br from-primary to-accent rounded-xl flex items-center justify-center">
          <ApperIcon name={icon} className="w-6 h-6 text-white" />
        </div>
      </div>
    </Card>
  );
};

export default StatCard;