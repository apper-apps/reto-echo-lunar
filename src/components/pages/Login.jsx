import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { userService } from '@/services/api/userService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Button from '@/components/atoms/Button';
import Card from '@/components/atoms/Card';

const Login = ({ onLogin }) => {
  const [selectedRole, setSelectedRole] = useState(null);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRoleSelect = (role) => {
    setSelectedRole(role);
  };

  const handleLogin = async () => {
    if (!selectedRole) {
      toast.error('Por favor selecciona un rol para continuar');
      return;
    }

    setLoading(true);
    
    try {
      // Set user role in service
      await userService.setUserRole(1, selectedRole);
      
      // Call parent login handler
      onLogin(selectedRole);
      
      // Navigate to appropriate dashboard
      if (selectedRole === 'Coach') {
        navigate('/coach');
      } else {
        navigate('/dashboard');
      }
      
      toast.success(`¡Bienvenido como ${selectedRole}!`);
    } catch (error) {
      console.error('Error during login:', error);
      toast.error('Error al iniciar sesión. Inténtalo de nuevo.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 flex items-center justify-center px-4">
      <div className="w-full max-w-md">
        {/* Logo and title */}
        <div className="text-center mb-8">
          <h1 className="font-display font-bold text-4xl bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent mb-2">
            Reto 21D
          </h1>
          <p className="text-lg text-gray-600">Transformación 80/20</p>
          <p className="text-sm text-gray-500 mt-2">Selecciona tu rol para acceder al sistema</p>
        </div>

        {/* Role selection cards */}
        <div className="space-y-4 mb-8">
          {/* Participant card */}
          <Card 
            className={`p-6 cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === 'Participante' 
                ? 'border-primary bg-purple-50 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-purple-300 hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('Participante')}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                selectedRole === 'Participante' ? 'bg-primary' : 'bg-gray-100'
              }`}>
                <ApperIcon 
                  name="User" 
                  className={`h-6 w-6 ${
                    selectedRole === 'Participante' ? 'text-white' : 'text-gray-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  selectedRole === 'Participante' ? 'text-primary' : 'text-gray-800'
                }`}>
                  Participante
                </h3>
                <p className="text-sm text-gray-600">
                  Accede al programa completo de transformación con seguimiento de hábitos, desafíos y progreso personal
                </p>
              </div>
              {selectedRole === 'Participante' && (
                <ApperIcon name="CheckCircle" className="h-6 w-6 text-primary" />
              )}
            </div>
          </Card>

          {/* Coach card */}
          <Card 
            className={`p-6 cursor-pointer transition-all duration-200 border-2 ${
              selectedRole === 'Coach' 
                ? 'border-secondary bg-blue-50 shadow-lg transform scale-105' 
                : 'border-gray-200 hover:border-blue-300 hover:shadow-md'
            }`}
            onClick={() => handleRoleSelect('Coach')}
          >
            <div className="flex items-center space-x-4">
              <div className={`p-3 rounded-full ${
                selectedRole === 'Coach' ? 'bg-secondary' : 'bg-gray-100'
              }`}>
                <ApperIcon 
                  name="Users" 
                  className={`h-6 w-6 ${
                    selectedRole === 'Coach' ? 'text-white' : 'text-gray-600'
                  }`}
                />
              </div>
              <div className="flex-1">
                <h3 className={`text-lg font-semibold ${
                  selectedRole === 'Coach' ? 'text-secondary' : 'text-gray-800'
                }`}>
                  Coach
                </h3>
                <p className="text-sm text-gray-600">
                  Herramientas de seguimiento y gestión para guiar a los participantes en su transformación
                </p>
              </div>
              {selectedRole === 'Coach' && (
                <ApperIcon name="CheckCircle" className="h-6 w-6 text-secondary" />
              )}
            </div>
          </Card>
        </div>

        {/* Login button */}
        <Button
          onClick={handleLogin}
          disabled={!selectedRole || loading}
          className="w-full py-3 text-base font-medium"
        >
          {loading ? (
            <div className="flex items-center justify-center space-x-2">
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
              <span>Iniciando sesión...</span>
            </div>
          ) : (
            `Acceder como ${selectedRole || 'Usuario'}`
          )}
        </Button>

        {/* Additional info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-gray-500">
            Al continuar, aceptas nuestros términos de servicio y política de privacidad
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;