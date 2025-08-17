import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import MetricCard from "@/components/molecules/MetricCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { userService } from "@/services/api/userService";
import { progressService } from "@/services/api/progressService";
import { habitService } from "@/services/api/habitService";
import { toast } from "react-toastify";

const Dashboard = () => {
  const navigate = useNavigate();
  const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [todayHabits, setTodayHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [user, progress, habits] = await Promise.all([
        userService.getCurrentUser(),
        progressService.getUserProgress(),
        habitService.getTodayHabits()
      ]);
      
      setUserData(user);
      setProgressData(progress);
      setTodayHabits(habits);
    } catch (err) {
      setError("Error al cargar los datos del dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const handleQuickHabitToggle = async (habitId) => {
    try {
      await habitService.toggleHabitStatus(habitId);
      const updatedHabits = await habitService.getTodayHabits();
      setTodayHabits(updatedHabits);
      toast.success("¡Hábito actualizado!");
    } catch (err) {
      toast.error("Error al actualizar el hábito");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDashboardData} />;

  const completedHabitsToday = todayHabits.filter(h => h.status === "completed").length;
  const totalHabitsToday = todayHabits.length;
  const adherencePercentage = totalHabitsToday > 0 ? Math.round((completedHabitsToday / totalHabitsToday) * 100) : 0;

  const motivationalMessages = [
    "¡Tu transformación comienza hoy! 💪",
    "Cada día cuenta en tu jornada 🌟",
    "¡Vas por buen camino! Sigue así 🚀",
    "Tu constancia es tu superpoder ⚡",
    "¡Hoy es un gran día para crecer! 🌱"
  ];

  const todayMessage = motivationalMessages[progressData?.currentDay % motivationalMessages.length || 0];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              ¡Hola, {userData?.profile?.fullName?.split(' ')[0] || 'Campeón'}! 👋
            </h1>
            <p className="text-purple-100 text-lg">{todayMessage}</p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="Target" className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <ProgressRing
            progress={(progressData?.currentDay / 21) * 100}
            size={100}
            label="Días"
            value={`${progressData?.currentDay || 0}/21`}
            color="#7C3AED"
          />
          <h3 className="font-semibold text-gray-900 mt-4">Progreso General</h3>
        </Card>

        <Card className="p-6 text-center">
          <ProgressRing
            progress={progressData?.streakDays ? (progressData.streakDays / 21) * 100 : 0}
            size={100}
            label="Racha"
            value={`${progressData?.streakDays || 0}`}
            color="#10B981"
          />
          <h3 className="font-semibold text-gray-900 mt-4">Días Consecutivos</h3>
        </Card>

        <Card className="p-6 text-center">
          <ProgressRing
            progress={adherencePercentage}
            size={100}
            label="Hoy"
            value={`${adherencePercentage}%`}
            color="#2563EB"
          />
          <h3 className="font-semibold text-gray-900 mt-4">Cumplimiento</h3>
        </Card>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <MetricCard
          title="Puntos Totales"
          value={progressData?.totalPoints || 0}
          icon="Star"
          gradient
        />
        <MetricCard
          title="Nivel Actual"
          value={progressData?.currentLevel || 1}
          icon="Trophy"
        />
        <MetricCard
          title="Hábitos Activos"
          value={totalHabitsToday}
          icon="Target"
        />
        <MetricCard
          title="Completados Hoy"
          value={completedHabitsToday}
          icon="CheckCircle"
        />
      </div>

      {/* Today's Habits Quick View */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">Hábitos de Hoy</h2>
          <Button
            variant="secondary"
            size="sm"
            onClick={() => navigate("/habitos")}
          >
            Ver todos
          </Button>
        </div>

        {todayHabits.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{todayHabits?.slice(0, 4).map((habit, index) => (
              <div
                key={habit?.id || `habit-${index}`}
                className="flex items-center justify-between p-4 rounded-xl bg-gray-50 hover:bg-gray-100 transition-colors cursor-pointer"
                onClick={() => handleQuickHabitToggle(habit?.id)}
              >
                <div className="flex items-center space-x-3">
                  <ApperIcon
                    name={habit?.status === "completed" ? "CheckCircle2" : "Circle"}
                    className={`h-5 w-5 ${
                      habit?.status === "completed" ? "text-emerald-500" : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{habit?.name || 'Hábito sin nombre'}</h4>
                    <p className="text-sm text-gray-600">{habit?.category || 'Sin categoría'}</p>
                  </div>
                </div>
                <Badge
                  variant={habit?.status === "completed" ? "success" : "default"}
                >
                  {habit?.status === "completed" ? "Completado" : "Pendiente"}
                </Badge>
              </div>
            )) || []}
          </div>
        ) : (
          <div className="text-center py-8">
            <ApperIcon name="Target" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
            <p className="text-gray-600">No tienes hábitos configurados para hoy</p>
            <Button
              className="mt-4"
              onClick={() => navigate("/habitos")}
            >
              Configurar Hábitos
            </Button>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/calendario")}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
              <ApperIcon name="Calendar" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ver Calendario</h3>
              <p className="text-sm text-gray-600">Revisa tu progreso diario</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/progreso")}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-3 rounded-lg">
              <ApperIcon name="TrendingUp" className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mi Progreso</h3>
              <p className="text-sm text-gray-600">Gráficas y métricas</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/perfil")}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg">
              <ApperIcon name="User" className="h-6 w-6 text-purple-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mi Perfil</h3>
              <p className="text-sm text-gray-600">Configuración y datos</p>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;