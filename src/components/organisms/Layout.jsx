import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import NavigationTabs from "@/components/molecules/NavigationTabs";
import ApperIcon from "@/components/ApperIcon";
import { progressService } from "@/services/api/progressService";
import { toast } from "react-toastify";

const Layout = () => {
  const [userProgress, setUserProgress] = useState(null);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadUserProgress = async () => {
      try {
        const progress = await progressService.getUserProgress();
        setUserProgress(progress);
      } catch (error) {
        console.error("Error loading user progress:", error);
      } finally {
        setLoading(false);
      }
    };

    loadUserProgress();
  }, []);

  const handleNotificationClick = () => {
    toast.info("No tienes notificaciones nuevas", {
      position: "top-right",
      autoClose: 2000,
    });
    setNotifications(0);
  };

  const currentDate = new Date();
  const formattedDate = format(currentDate, "EEEE, d 'de' MMMM", { locale: es });
  const dayNumber = format(currentDate, "d");
  const monthYear = format(currentDate, "MMM yyyy", { locale: es });

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
      {/* Desktop layout */}
      <div className="hidden lg:flex">
        {/* Desktop sidebar */}
        <aside className="w-64 h-screen bg-white shadow-xl border-r border-purple-100 p-6">
          <div className="mb-8">
            <h1 className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              Reto 21D
            </h1>
            <p className="text-sm text-gray-600 mt-1">Transformación 80/20</p>
          </div>
          
          <NavigationTabs />
        </aside>
        
{/* Desktop main content */}
        <div className="flex-1 flex flex-col">
          {/* Desktop banner header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white px-6 py-4 shadow-lg">
            <div className="grid grid-cols-3 gap-4 items-center max-w-6xl mx-auto">
              {/* Calendario */}
              <div className="flex items-center space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center min-w-[60px]">
                  <div className="text-2xl font-bold">{dayNumber}</div>
                  <div className="text-xs opacity-90 uppercase">{monthYear}</div>
                </div>
                <div>
                  <div className="text-sm font-medium capitalize">{formattedDate}</div>
                  <div className="text-xs opacity-90">Día {userProgress?.currentDay || 1} de 21</div>
                </div>
              </div>

              {/* Título central */}
              <div className="text-center">
                <h1 className="font-display font-bold text-xl">Reto 21D</h1>
                <p className="text-xs opacity-90">Transformación 80/20</p>
              </div>

              {/* Puntos y notificaciones */}
              <div className="flex items-center justify-end space-x-4">
                {/* Puntos acumulados */}
                <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                  <ApperIcon name="Trophy" size={18} className="text-yellow-300" />
                  <div className="text-right">
                    <div className="text-sm font-bold">
                      {loading ? "..." : (userProgress?.totalPoints || 0)}
                    </div>
                    <div className="text-xs opacity-90">puntos</div>
                  </div>
                </div>

                {/* Campana de notificaciones */}
                <button
                  onClick={handleNotificationClick}
                  className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ApperIcon name="Bell" size={20} />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Main content */}
          <main className="flex-1 overflow-auto">
            <div className="p-6">
              <Outlet />
            </div>
          </main>
        </div>
      </div>
      
      {/* Mobile layout */}
      <div className="lg:hidden">
        {/* Mobile header */}
{/* Banner superior con calendario, puntos y notificaciones */}
        <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white px-4 py-4 sticky top-0 z-50 shadow-lg">
          <div className="grid grid-cols-3 gap-4 items-center max-w-6xl mx-auto">
            {/* Calendario */}
            <div className="flex items-center space-x-3">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-3 flex flex-col items-center min-w-[60px]">
                <div className="text-2xl font-bold">{dayNumber}</div>
                <div className="text-xs opacity-90 uppercase">{monthYear}</div>
              </div>
<div className="hidden sm:block">
                <div className="text-sm font-medium">¡Hola María!</div>
                <div className="text-xs opacity-90 capitalize">{formattedDate}</div>
                <div className="text-xs opacity-90">Día {userProgress?.currentDay || 1} de 21</div>
              </div>
            </div>

            {/* Título central */}
<div className="text-center">
              <h1 className="font-display font-bold text-xl">¡Hola María!</h1>
              <p className="text-xs opacity-90">Reto 21D - Transformación 80/20</p>
            </div>

            {/* Puntos y notificaciones */}
            <div className="flex items-center justify-end space-x-4">
              {/* Puntos acumulados */}
              <div className="flex items-center space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-3 py-2">
                <ApperIcon name="Trophy" size={18} className="text-yellow-300" />
                <div className="text-right">
                  <div className="text-sm font-bold">
                    {loading ? "..." : (userProgress?.totalPoints || 0)}
                  </div>
                  <div className="text-xs opacity-90">puntos</div>
                </div>
              </div>

              {/* Campana de notificaciones */}
              <button
                onClick={handleNotificationClick}
                className="relative p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
              >
                <ApperIcon name="Bell" size={20} />
                {notifications > 0 && (
                  <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[18px] h-[18px] flex items-center justify-center font-medium">
                    {notifications > 9 ? '9+' : notifications}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
{/* Mobile main content */}
<main className="pb-20">
          <div className="p-4">
            <Outlet />
          </div>
        </main>
        
        {/* Mobile bottom navigation */}
        <NavigationTabs />
      </div>
    </div>
  );
};

export default Layout;