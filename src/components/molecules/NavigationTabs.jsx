import React from "react";
import { useNavigate, useLocation } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";

const NavigationTabs = () => {
  const navigate = useNavigate();
  const location = useLocation();

const tabs = [
    { 
      id: "dashboard", 
      label: "Inicio", 
      icon: "Home",
      path: "/dashboard" 
    },
    { 
      id: "dia-0", 
      label: "Día 0", 
      icon: "Target",
path: "/dia-0" 
    },
    { 
      id: "calendario", 
      label: "Calendario", 
      icon: "Calendar",
      path: "/calendario" 
    },
    { 
      id: "desafios", 
      label: "Desafíos", 
      icon: "Trophy",
      path: "/desafios-semanales" 
    },
    { 
      id: "habitos", 
      label: "Hábitos", 
      icon: "CheckSquare",
      path: "/habitos" 
    },
    { 
      id: "dia-21", 
      label: "Día 21", 
      icon: "Award",
      path: "/dia-21" 
    },
    { 
      id: "progreso", 
      label: "Progreso", 
      icon: "TrendingUp",
      path: "/progreso" 
    },
    { 
      id: "perfil", 
      label: "Perfil", 
      icon: "User",
      path: "/perfil" 
    }
  ];

const isActive = (path) => {
    return location.pathname === path || 
           (path === "/calendario" && location.pathname.startsWith("/dia/")) ||
           (path === "/dia-0" && location.pathname === "/dia-0") ||
           (path === "/dia-21" && (location.pathname === "/dia-21" || location.pathname === "/metricas-finales"));
  };

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 px-4 py-2 safe-area-bottom lg:static lg:border-t-0 lg:bg-transparent lg:px-0 lg:py-0">
      <div className="flex items-center justify-around lg:flex-col lg:space-y-2 lg:justify-start">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => navigate(tab.path)}
            className={`flex flex-col lg:flex-row items-center justify-center lg:justify-start space-y-1 lg:space-y-0 lg:space-x-3 px-3 py-2 lg:px-4 lg:py-3 rounded-xl transition-all duration-200 lg:w-full ${
              isActive(tab.path)
                ? "text-primary bg-purple-50 lg:bg-gradient-to-r lg:from-purple-100 lg:to-blue-100 lg:shadow-md"
                : "text-gray-600 hover:text-primary hover:bg-gray-50 lg:hover:bg-purple-50"
            }`}
          >
            <ApperIcon 
              name={tab.icon} 
              className={`h-5 w-5 lg:h-4 lg:w-4 ${
                isActive(tab.path) ? "text-primary" : "text-gray-500"
              }`}
            />
            <span className={`text-xs lg:text-sm font-medium ${
              isActive(tab.path) ? "text-primary" : "text-gray-600"
            }`}>
              {tab.label}
            </span>
          </button>
        ))}
      </div>
    </nav>
  );
};

export default NavigationTabs;