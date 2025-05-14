import { NavLink } from "react-router-dom";
import { Clock, Monitor, Settings, ChevronLeft, ChevronRight, Lock, Unlock } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  toggleSidebar: () => void;
  isLocked: boolean;
}

const Sidebar = ({ isOpen, toggleSidebar, isLocked }: SidebarProps) => {
  const navItems = [
    {
      name: "Prayer Dashboard",
      path: "/",
      icon: <Clock className="w-5 h-5" />,
    },
    {
      name: "Devices",
      path: "/devices",
      icon: <Monitor className="w-5 h-5" />,
    },
    {
      name: "Configuration",
      path: "/configuration",
      icon: <Settings className="w-5 h-5" />,
    },
  ];

  return (
    <div
      className={`bg-sidebar text-sidebar-foreground h-screen flex-shrink-0
        ${isOpen ? "w-64" : "w-16"}
        overflow-x-hidden transition-all duration-300 fixed lg:relative z-40`}
    >
      <div className="flex items-center justify-between p-4">
        <div className="flex items-center">
          {isOpen && (
            <h2 className="font-semibold ml-2 text-sidebar-foreground">
              Admin Panel
            </h2>
          )}
        </div>
        <button
          onClick={toggleSidebar}
          className="p-1 rounded-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground transition-colors flex items-center gap-1"
          title={isOpen ? (isLocked ? "Unlock sidebar" : "Lock sidebar") : "Expand sidebar"}
        >
          {isOpen ? (
            isLocked ? (
              <>
                <ChevronLeft size={18} />
              </>
            ) : (
              <>
                <ChevronLeft size={18} />
              </>
            )
          ) : (
            <ChevronRight size={18} />
          )}
        </button>
      </div>

      <div className="mt-8 space-y-2 px-3">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `flex items-center px-3 py-2 rounded-md transition-all ${
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50"
              } ${!isOpen && "justify-center"}`
            }
          >
            <div className="flex items-center">
              {item.icon}
              {isOpen && <span className="ml-3">{item.name}</span>}
            </div>
          </NavLink>
        ))}
      </div>
    </div>
  );
};

export default Sidebar;
