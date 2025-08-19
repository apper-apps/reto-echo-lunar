import React, { useState, useEffect } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import Progress from "@/components/pages/Progress";
import DayPlan from "@/components/pages/DayPlan";
import Dashboard from "@/components/pages/Dashboard";
import Habits from "@/components/pages/Habits";
import DayZero from "@/components/pages/DayZero";
import FinalMetrics from "@/components/pages/FinalMetrics";
import Profile from "@/components/pages/Profile";
import Onboarding from "@/components/pages/Onboarding";
import Calendar from "@/components/pages/Calendar";
import CoachDashboard from "@/components/pages/CoachDashboard";
import Login from "@/components/pages/Login";
import Layout from "@/components/organisms/Layout";

// Layout

// Pages

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [userRole, setUserRole] = useState(null);

  // Check for existing authentication on app load
useEffect(() => {
    const initializeAuth = async () => {
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
        // Clear invalid auth data
        localStorage.removeItem('reto21d_auth');
        localStorage.removeItem('reto21d_role');
        localStorage.removeItem('reto21d_userId');
      }
    };
    
    initializeAuth();
  }, []);

  const handleLogin = async (role, userId = 1) => {
    try {
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
    } catch (error) {
      console.error('Login error:', error);
      throw error;
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUserRole(null);
    localStorage.removeItem('reto21d_auth');
    localStorage.removeItem('reto21d_role');
    localStorage.removeItem('reto21d_userId');
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