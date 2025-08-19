import React, { useEffect, useState } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer, toast } from "react-toastify";
import { apperService } from "@/services/api/apperService";
import Progress from "@/components/pages/Progress";
import DayPlan from "@/components/pages/DayPlan";
import Dashboard from "@/components/pages/Dashboard";
import CoachDashboard from "@/components/pages/CoachDashboard";
import Login from "@/components/pages/Login";
import Habits from "@/components/pages/Habits";
import DayZero from "@/components/pages/DayZero";
import FinalMetrics from "@/components/pages/FinalMetrics";
import Profile from "@/components/pages/Profile";
import Onboarding from "@/components/pages/Onboarding";
import Calendar from "@/components/pages/Calendar";
import Error from "@/components/ui/Error";
import Layout from "@/components/organisms/Layout";
function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [isAppInitialized, setIsAppInitialized] = useState(false);

  // Initialize Apper Database Connection
  useEffect(() => {
    const initializeApperDatabase = async () => {
      try {
        await apperService.initialize();
        toast.success('Base de datos conectada exitosamente', {
          position: "top-center",
          autoClose: 2000
        });
      } catch (error) {
        console.error('Error inicializando base de datos:', error);
        toast.error('Error conectando con la base de datos', {
          position: "top-center",
          autoClose: 5000
        });
      } finally {
        setIsAppInitialized(true);
      }
    };

    initializeApperDatabase();
  }, []);

  // Initialize Authentication
  useEffect(() => {
    const initializeAuth = async () => {
      // Wait for Apper to be initialized first
      if (!isAppInitialized) return;
      
      try {
        const savedAuth = localStorage.getItem('reto21d_auth');
        const savedRole = localStorage.getItem('reto21d_role');
        const savedUserId = localStorage.getItem('reto21d_userId');
        
        if (savedAuth && savedRole && savedUserId) {
          // Validate user still exists and role is current
          const { userService } = await import('@/services/api/userService');
          const currentRole = await userService.getRoleType();
          
          if (currentRole === savedRole) {
            setIsAuthenticated(true);
            setUserRole(savedRole);
          } else {
            // Role changed, clear old auth
            localStorage.removeItem('reto21d_auth');
            localStorage.removeItem('reto21d_role');
            localStorage.removeItem('reto21d_userId');
          }
        }
      } catch (error) {
        console.error('Auth initialization error:', error);
        toast.error('Error validando sesión de usuario');
        // Clear invalid auth data
        localStorage.removeItem('reto21d_auth');
        localStorage.removeItem('reto21d_role');
        localStorage.removeItem('reto21d_userId');
      }
    };
    
    initializeAuth();
  }, [isAppInitialized]);

  const handleLogin = async (role, userId = 1) => {
    try {
      if (!isAppInitialized) {
        throw new Error('La aplicación aún se está inicializando. Intenta de nuevo.');
      }
      
      const { userService } = await import('@/services/api/userService');
      
      // Validate user and role
      const userRole = await userService.getRoleType();
      if (userRole !== role) {
        throw new Error('Rol de usuario inválido');
      }
      
      setIsAuthenticated(true);
      setUserRole(role);
      localStorage.setItem('reto21d_auth', 'true');
      localStorage.setItem('reto21d_role', role);
      localStorage.setItem('reto21d_userId', userId.toString());
      
      toast.success(`Bienvenido, ${role}!`, {
        position: "top-center",
        autoClose: 3000
      });
    } catch (error) {
      console.error('Login error:', error);
      toast.error(error.message || 'Error al iniciar sesión');
      throw error;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('reto21d_auth');
    localStorage.removeItem('reto21d_role');
    localStorage.removeItem('reto21d_userId');
    
    toast.info('Sesión cerrada correctamente', {
      position: "top-center",
      autoClose: 2000
    });
  };

  // Protected Route Component
  const ProtectedRoute = ({ children, allowedRoles = [] }) => {
    if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
    }
    
    if (allowedRoles.length > 0 && !allowedRoles.includes(userRole)) {
      return <Navigate to={userRole === 'Coach' ? '/coach' : '/dashboard'} replace />;
    }
    
    return children;
  };

  // Show loading screen while initializing
  if (!isAppInitialized) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary mx-auto mb-4"></div>
          <h2 className="text-2xl font-display font-semibold text-gray-800 mb-2">
            Conectando con la base de datos...
          </h2>
          <p className="text-gray-600">
            Inicializando Reto 21D
          </p>
        </div>
      </div>
    );
  }

  return (
    <BrowserRouter>
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50">
        <Routes>
          {/* Login route - accessible when not authenticated */}
          <Route 
            path="/login" 
            element={
              isAuthenticated 
                ? <Navigate to={userRole === 'Coach' ? '/coach' : '/dashboard'} replace />
                : <Login onLogin={handleLogin} />
            } 
          />
          
          {/* Protected routes */}
          <Route path="/" element={
            <ProtectedRoute>
              <Layout userRole={userRole} onLogout={handleLogout} />
            </ProtectedRoute>
          }>
            {/* Redirect root to appropriate dashboard */}
            <Route index element={<Navigate to={userRole === 'Coach' ? '/coach' : '/dashboard'} replace />} />
            
            {/* Participant-only routes */}
            <Route path="dashboard" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="calendario" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Calendar />
              </ProtectedRoute>
            } />
            
            <Route path="dia-0" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <DayZero />
              </ProtectedRoute>
            } />
            
            <Route path="desafios-semanales" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Dashboard />
              </ProtectedRoute>
            } />
            
            <Route path="dia/:dayNumber" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <DayPlan />
              </ProtectedRoute>
            } />
            
            <Route path="habitos" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Habits />
              </ProtectedRoute>
            } />
            
            <Route path="ranking" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Progress />
              </ProtectedRoute>
            } />
            
            <Route path="perfil" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Profile />
              </ProtectedRoute>
            } />
            
            <Route path="onboarding" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <Onboarding />
              </ProtectedRoute>
            } />
            
            <Route path="metricas-finales" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <FinalMetrics />
              </ProtectedRoute>
            } />
            
            <Route path="dia-21" element={
              <ProtectedRoute allowedRoles={['Participante']}>
                <FinalMetrics />
              </ProtectedRoute>
            } />
            
            {/* Coach-only routes */}
            <Route path="coach" element={
              <ProtectedRoute allowedRoles={['Coach']}>
                <CoachDashboard />
              </ProtectedRoute>
            } />
          </Route>

          {/* Catch all - redirect to login if not authenticated or appropriate dashboard */}
          <Route path="*" element={
            <Navigate to={
              isAuthenticated 
                ? (userRole === 'Coach' ? '/coach' : '/dashboard')
                : '/login'
            } replace />
          } />
        </Routes>
        <ToastContainer 
          position="top-right" 
          autoClose={3000} 
          hideProgressBar={false} 
          newestOnTop={false} 
          closeOnClick 
          rtl={false} 
          pauseOnFocusLoss 
          draggable 
          pauseOnHover 
          theme="colored"
          style={{ zIndex: 9999 }}
        />
      </div>
    </BrowserRouter>
  );
}

export default App;