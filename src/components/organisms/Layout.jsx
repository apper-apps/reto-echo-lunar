import React, { useEffect, useState } from "react";
import { Outlet, useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { progressService } from "@/services/api/progressService";
import { userService } from "@/services/api/userService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import NavigationTabs from "@/components/molecules/NavigationTabs";
const Layout = ({ userRole, onLogout }) => {
const navigate = useNavigate();
  const [userProgress, setUserProgress] = useState(null);
  const [notifications, setNotifications] = useState(3); // Mock notification count
  const [loading, setLoading] = useState(true);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const [currentUserRole, setCurrentUserRole] = useState(null);

  // Get user role from props or localStorage
  const effectiveUserRole = userRole || localStorage.getItem('reto21d_role') || 'Participante';

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 1024);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

useEffect(() => {
    const loadUserData = async () => {
      try {
        const [progress, role] = await Promise.all([
          progressService.getUserProgress(),
          userService.getRoleType()
        ]);
        setUserProgress(progress);
        setCurrentUserRole(role);
      } catch (error) {
        console.error("Error loading user data:", error);
        toast.error("Error loading user data");
      } finally {
        setLoading(false);
      }
    };

    loadUserData();
  }, []);

  const handleLogout = () => {
    if (onLogout) {
      onLogout();
    }
    navigate('/login');
  };

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
      {!isMobile && (
        <div className="hidden lg:flex">
          {/* Desktop sidebar */}
          <aside className="w-64 h-screen bg-white shadow-xl border-r border-purple-100 p-6">
            <div className="mb-8">
              <h1 className="font-display font-bold text-2xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Reto 21D
              </h1>
              <p className="text-sm text-gray-600 mt-1">Transformación 80/20</p>
            </div>
            
<NavigationTabs userRole={effectiveUserRole} />
            
            {/* Logout button for desktop */}
            <div className="mt-auto pt-6 border-t border-purple-100">
              <button
                onClick={handleLogout}
                className="flex items-center space-x-3 px-4 py-3 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all duration-200 w-full"
              >
                <ApperIcon name="LogOut" className="h-4 w-4" />
                <span className="text-sm font-medium">Cerrar Sesión</span>
              </button>
            </div>
          </aside>
        
          {/* Desktop main content */}
          <div className="flex-1 flex flex-col">
            {/* Unified responsive banner header */}
            <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white px-4 md:px-6 py-4 sticky top-0 z-50 shadow-lg">
              <div className="grid grid-cols-3 gap-2 md:gap-4 items-center max-w-6xl mx-auto">
                {/* Calendario */}
                <div className="flex items-center space-x-2 md:space-x-3">
                  <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col items-center min-w-[50px] md:min-w-[60px]">
                    <div className="text-xl md:text-2xl font-bold">{dayNumber}</div>
                    <div className="text-xs opacity-90 uppercase">{monthYear}</div>
                  </div>
                  <div className="hidden sm:block">
                    <div className="text-sm font-medium">¡Hola María!</div>
                    <div className="text-xs opacity-90 capitalize">{formattedDate}</div>
                    <div className="text-xs opacity-90">Día {userProgress?.currentDay || 1} de 21</div>
                    <div className="text-xs opacity-90">Tu constancia es tu superpoder ⚡</div>
                  </div>
                </div>

                {/* Título central */}
                <div className="text-center">
                  <h1 className="font-display font-bold text-lg md:text-xl">Reto 21D</h1>
                  <p className="text-xs opacity-90">Transformación 80/20</p>
                </div>

                {/* Puntos y notificaciones */}
                <div className="flex items-center justify-end space-x-2 md:space-x-4">
                  {/* Puntos acumulados */}
                  <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                    <ApperIcon name="Trophy" size={16} className="text-yellow-300 md:w-[18px] md:h-[18px]" />
                    <div className="text-right">
                      <div className="text-xs md:text-sm font-bold">
                        {loading ? "..." : (userProgress?.totalPoints || 0)}
                      </div>
                      <div className="text-xs opacity-90 hidden md:block">puntos</div>
                    </div>
                  </div>

                  {/* Campana de notificaciones */}
                  <button
                    onClick={handleNotificationClick}
                    className="relative p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                  >
                    <ApperIcon name="Bell" size={18} className="md:w-5 md:h-5" />
                    {notifications > 0 && (
                      <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] flex items-center justify-center font-medium">
                        {notifications > 9 ? '9+' : notifications}
                      </span>
                    )}
                  </button>
                </div>
              </div>
            </div>

            {/* Desktop main content */}
            <main className="flex-1 p-6">
              <Outlet />
            </main>
          </div>
        </div>
      )}

      {/* Mobile layout */}
      {isMobile && (
        <>
          {/* Unified responsive banner header */}
          <div className="bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white px-4 md:px-6 py-4 sticky top-0 z-50 shadow-lg">
            <div className="grid grid-cols-3 gap-2 md:gap-4 items-center max-w-6xl mx-auto">
              {/* Calendario */}
              <div className="flex items-center space-x-2 md:space-x-3">
                <div className="bg-white/20 backdrop-blur-sm rounded-xl p-2 md:p-3 flex flex-col items-center min-w-[50px] md:min-w-[60px]">
                  <div className="text-xl md:text-2xl font-bold">{dayNumber}</div>
                  <div className="text-xs opacity-90 uppercase">{monthYear}</div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-sm font-medium">¡Hola María!</div>
                  <div className="text-xs opacity-90 capitalize">{formattedDate}</div>
                  <div className="text-xs opacity-90">Día {userProgress?.currentDay || 1} de 21</div>
                  <div className="text-xs opacity-90">Tu constancia es tu superpoder ⚡</div>
                </div>
              </div>

              {/* Título central */}
              <div className="text-center">
                <h1 className="font-display font-bold text-lg md:text-xl">Reto 21D</h1>
                <p className="text-xs opacity-90">Transformación 80/20</p>
              </div>

              {/* Puntos y notificaciones */}
              <div className="flex items-center justify-end space-x-2 md:space-x-4">
                {/* Puntos acumulados */}
                <div className="flex items-center space-x-1 md:space-x-2 bg-white/20 backdrop-blur-sm rounded-lg px-2 md:px-3 py-1 md:py-2">
                  <ApperIcon name="Trophy" size={16} className="text-yellow-300 md:w-[18px] md:h-[18px]" />
                  <div className="text-right">
                    <div className="text-xs md:text-sm font-bold">
                      {loading ? "..." : (userProgress?.totalPoints || 0)}
                    </div>
                    <div className="text-xs opacity-90 hidden md:block">puntos</div>
                  </div>
                </div>

                {/* Campana de notificaciones */}
                <button
                  onClick={handleNotificationClick}
                  className="relative p-1.5 md:p-2 bg-white/20 backdrop-blur-sm rounded-lg hover:bg-white/30 transition-colors"
                >
                  <ApperIcon name="Bell" size={18} className="md:w-5 md:h-5" />
                  {notifications > 0 && (
                    <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs rounded-full min-w-[16px] h-[16px] md:min-w-[18px] md:h-[18px] flex items-center justify-center font-medium">
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
<NavigationTabs userRole={effectiveUserRole} />
</>
      )}
    </div>
  );
};

export default Layout;