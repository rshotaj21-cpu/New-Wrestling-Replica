import { Outlet, NavLink } from "react-router-dom";
import { 
  LayoutDashboard, 
  Calendar as CalendarIcon, 
  UserCheck, 
  Target, 
  Dumbbell, 
  Trophy, 
  ClipboardList,
  BarChart3,
  Swords
} from "lucide-react";

export function Layout() {
  const navItems = [
    { path: "/", icon: LayoutDashboard, label: "Dashboard" },
    { path: "/sessions", icon: ClipboardList, label: "Sessions" },
    { path: "/121", icon: UserCheck, label: "1-2-1" },
    { path: "/techniques", icon: Target, label: "Techniques" },
    { path: "/system", icon: Swords, label: "System" },
    { path: "/sc", icon: Dumbbell, label: "S&C" },
    { path: "/competitions", icon: Trophy, label: "Comps" },
    { path: "/calendar", icon: CalendarIcon, label: "Calendar" },
    { path: "/stats", icon: BarChart3, label: "Stats" },
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      <main className="flex-1 overflow-y-auto pb-20">
        <Outlet />
      </main>

      <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 shadow-lg z-40">
        <div className="flex justify-around items-center max-w-md mx-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.path}
              to={item.path}
              end={item.path === "/"}
              className={({ isActive }) =>
                `flex flex-col items-center py-2 px-2 text-xs transition-colors ${
                  isActive ? "text-blue-600" : "text-gray-500 hover:text-gray-700"
                }`
              }
            >
              <item.icon className="w-5 h-5 mb-1" />
              <span className="text-[10px]">{item.label}</span>
            </NavLink>
          ))}
        </div>
      </nav>
    </div>
  );
}
