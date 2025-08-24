import { NavLink, useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { useAuth } from "@/contexts/AuthContext";
import React from "react";
import { cn } from "@/utils/cn";
import ApperIcon from "@/components/ApperIcon";

const Sidebar = ({ isMobileOpen, closeMobileSidebar }) => {
const getNavItems = (userRole) => {
  const baseItems = [
    { to: "/", label: "Dashboard", icon: "LayoutDashboard" }
  ];

  if (userRole === 'TalentFuze') {
    return [
      ...baseItems,
      { to: "/agencies", label: "Agencies", icon: "Building2" },
      { to: "/virtual-assistants", label: "Virtual Assistants", icon: "Users" },
      { to: "/check-ins", label: "Check-ins", icon: "CheckSquare" },
      { to: "/va-requests", label: "VA Requests", icon: "UserPlus" }
    ];
  } else if (userRole === 'Agency') {
    return [
      ...baseItems,
      { to: "/virtual-assistants", label: "My Virtual Assistants", icon: "Users" },
      { to: "/check-ins", label: "Check-ins", icon: "CheckSquare" },
      { to: "/va-requests", label: "VA Requests", icon: "UserPlus" }
    ];
  } else if (userRole === 'VirtualAssistant') {
    return [
      ...baseItems,
      { to: "/check-ins", label: "My Check-ins", icon: "CheckSquare" }
    ];
  }

  return baseItems;
};

const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Signed out successfully');
      navigate('/login');
    } catch (error) {
      toast.error('Error signing out');
    }
  };

  const SidebarContent = () => (
    <div className="flex flex-col h-full">
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

      <div className="flex items-center px-4 py-6 border-b border-gray-200 hidden lg:flex">
        <div className="w-10 h-10 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
          <ApperIcon name="Building2" size={20} className="text-white" />
        </div>
        <h1 className="ml-3 text-xl font-bold text-gray-900">TalentFuze</h1>
      </div>

      <nav className="flex-1 p-4 space-y-2">
        {getNavItems(user?.role).map((item) => (
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

      <div className="mt-auto pt-6 border-t border-gray-200">
        <div className="px-4 py-3">
          <div className="flex items-center mb-3">
            <div className="w-8 h-8 bg-gradient-to-br from-primary to-accent rounded-full flex items-center justify-center">
              <ApperIcon name="User" size={14} className="text-white" />
            </div>
            <div className="ml-3 flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">
                {user?.role}
              </p>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center px-3 py-2 text-sm text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-md transition-colors"
          >
            <ApperIcon name="LogOut" size={16} className="mr-3" />
            Sign Out
          </button>
        </div>
      </div>
    </div>
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