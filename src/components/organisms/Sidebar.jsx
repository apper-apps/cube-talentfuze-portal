import { NavLink } from "react-router-dom";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
const navItems = [
    { to: "/", label: "Dashboard", icon: "LayoutDashboard" },
    { to: "/agencies", label: "Agencies", icon: "Building2" },
    { to: "/virtual-assistants", label: "Virtual Assistants", icon: "Users" },
    { to: "/check-ins", label: "Check-ins", icon: "CheckSquare" }
  ];

  const SidebarContent = () => (
    <>
      <div className="p-6 border-b border-slate-200 lg:hidden">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-lg flex items-center justify-center">
              <ApperIcon name="Users" className="w-4 h-4 text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-slate-900">TalentFuze</h2>
              <p className="text-xs text-slate-600">Client Portal</p>
            </div>
          </div>
          <button
            onClick={closeMobileSidebar}
            className="p-2 rounded-lg hover:bg-slate-100 transition-colors"
          >
            <ApperIcon name="X" size={20} className="text-slate-600" />
          </button>
        </div>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            onClick={closeMobileSidebar}
            className={({ isActive }) =>
              cn(
                "flex items-center gap-3 px-4 py-3 rounded-xl text-slate-700 hover:bg-slate-100 transition-all duration-200 font-medium",
                isActive && "bg-gradient-to-r from-primary to-accent text-white hover:from-blue-600 hover:to-blue-500 shadow-lg"
              )
            }
          >
            <ApperIcon name={item.icon} size={20} />
            {item.label}
          </NavLink>
        ))}
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <div className="hidden lg:flex lg:flex-col lg:w-64 lg:bg-white lg:border-r lg:border-slate-200 lg:h-screen">
        <SidebarContent />
      </div>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <>
          <div
            className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm z-40 lg:hidden"
            onClick={closeMobileSidebar}
          />
          <div className="fixed left-0 top-0 h-full w-64 bg-white z-50 lg:hidden transform transition-transform duration-300 shadow-2xl flex flex-col">
            <SidebarContent />
          </div>
        </>
      )}
    </>
  );
};

export default Sidebar;