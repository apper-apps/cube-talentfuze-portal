import { cn } from "@/utils/cn";

const Loading = ({ className = "", rows = 5, ...props }) => {
  return (
    <div className={cn("space-y-4 animate-pulse", className)} {...props}>
      {Array.from({ length: rows }).map((_, index) => (
        <div key={index} className="bg-gradient-to-r from-slate-200 via-slate-100 to-slate-200 bg-[length:200%_100%] animate-pulse rounded-lg h-16 w-full"></div>
      ))}
    </div>
  );
};

export default Loading;