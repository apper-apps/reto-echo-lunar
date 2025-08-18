import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import CreateChallengeModal from "@/components/molecules/CreateChallengeModal";
import { userService } from "@/services/api/userService";
import { progressService } from "@/services/api/progressService";
import { habitService } from "@/services/api/habitService";
import { miniChallengeService } from "@/services/api/miniChallengeService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import MetricCard from "@/components/molecules/MetricCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const Dashboard = () => {
  const navigate = useNavigate();
const [userData, setUserData] = useState(null);
  const [progressData, setProgressData] = useState(null);
  const [todayHabits, setTodayHabits] = useState([]);
  const [activeMiniChallenges, setActiveMiniChallenges] = useState([]);
  const [userMiniChallenges, setUserMiniChallenges] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadDashboardData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [user, progress, habits, activeChallenges, userChallenges] = await Promise.all([
        userService.getCurrentUser(),
        progressService.getUserProgress(),
        habitService.getTodayHabits(),
        miniChallengeService.getActiveChallenges(),
        miniChallengeService.getUserActiveChallenges()
      ]);
      
      setUserData(user);
      setProgressData(progress);
      setTodayHabits(habits);
      setActiveMiniChallenges(activeChallenges);
      setUserMiniChallenges(userChallenges);
    } catch (err) {
      setError("Error al cargar los datos del dashboard");
      console.error("Dashboard load error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleJoinMiniChallenge = async (challengeId) => {
    try {
      await miniChallengeService.joinChallenge(challengeId);
      await loadDashboardData(); // Reload to get updated data
      toast.success("¡Te has unido al mini-reto! 🎯");
    } catch (err) {
      toast.error("Error al unirse al mini-reto");
    }
  };

  const handleLeaveMiniChallenge = async (challengeId) => {
    if (window.confirm("¿Estás seguro de que quieres abandonar este mini-reto?")) {
      try {
        await miniChallengeService.leaveChallenge(challengeId);
        await loadDashboardData();
        toast.success("Has abandonado el mini-reto");
      } catch (err) {
        toast.error("Error al abandonar el mini-reto");
      }
    }
  };

  const handleUpdateChallengeProgress = async (challengeId, progress) => {
    try {
      await miniChallengeService.updateProgress(challengeId, progress);
      await loadDashboardData();
      toast.success("Progreso actualizado!");
    } catch (err) {
      toast.error("Error al actualizar el progreso");
    }
};

  const handleCreateChallenge = async (challengeData) => {
    try {
      await miniChallengeService.createChallenge(challengeData);
      await loadDashboardData(); // Reload to get updated data
      setShowCreateModal(false);
      toast.success("¡Mini-reto creado exitosamente! 🎯");
    } catch (err) {
      toast.error("Error al crear el mini-reto");
    }
  };
const [showCreateModal, setShowCreateModal] = useState(false);
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

{/* Mini-Challenges Section */}
<Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-bold text-xl text-gray-900">
            🏆 Mini-Retos Semanales
          </h2>
          <div className="flex items-center space-x-3">
            <Badge variant="secondary" className="bg-gradient-to-r from-amber-100 to-orange-100 text-amber-800">
              ¡Puntos Extra!
            </Badge>
            <Button
              size="sm"
              onClick={() => setShowCreateModal(true)}
              className="bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
            >
              <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
              Crear Reto
            </Button>
          </div>
        </div>

{/* Create Challenge Modal */}
        {showCreateModal && (
          <CreateChallengeModal 
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleCreateChallenge}
          />
        )}
          {/* User's Active Challenges */}
          {userMiniChallenges.length > 0 && (
            <div className="mb-6">
              <h3 className="font-semibold text-gray-800 mb-3">Tus Mini-Retos Activos</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {userMiniChallenges.map((challenge) => (
                  <Card key={challenge.Id} className="p-4 bg-gradient-to-r from-emerald-50 to-blue-50 border-emerald-200">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                        <p className="text-sm text-gray-600 mt-1">{challenge.description}</p>
                      </div>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleLeaveMiniChallenge(challenge.Id)}
                        className="text-red-600 hover:bg-red-50"
                      >
                        <ApperIcon name="X" className="h-4 w-4" />
                      </Button>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-600">Progreso</span>
                        <span className="font-medium">{challenge.userProgress || 0}/{challenge.target} {challenge.unit}</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 h-2 rounded-full transition-all duration-300"
                          style={{ width: `${Math.min(((challenge.userProgress || 0) / challenge.target) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between items-center mt-3">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Calendar" className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">{challenge.daysRemaining} días restantes</span>
                        </div>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Coins" className="h-4 w-4 text-amber-500" />
                          <span className="text-xs font-medium text-amber-600">+{challenge.pointsReward} pts</span>
                        </div>
                      </div>
                      
                      {challenge.type === 'incremental' && (
                        <div className="flex space-x-2 mt-3">
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateChallengeProgress(challenge.Id, (challenge.userProgress || 0) + 1)}
                            className="flex-1"
                          >
                            <ApperIcon name="Plus" className="h-3 w-3 mr-1" />
                            +1
                          </Button>
                          <Button
                            size="sm"
                            variant="secondary"
                            onClick={() => handleUpdateChallengeProgress(challenge.Id, Math.max((challenge.userProgress || 0) - 1, 0))}
                            className="flex-1"
                          >
                            <ApperIcon name="Minus" className="h-3 w-3 mr-1" />
                            -1
                          </Button>
                        </div>
                      )}
                    </div>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Available Challenges */}
          {activeMiniChallenges.length > 0 && (
            <div>
              <h3 className="font-semibold text-gray-800 mb-3">Mini-Retos Disponibles</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {activeMiniChallenges
                  .filter(challenge => !userMiniChallenges.some(uc => uc.Id === challenge.Id))
                  .slice(0, 4)
                  .map((challenge) => (
                  <Card key={challenge.Id} className="p-4 hover:shadow-lg transition-shadow">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2 mb-1">
                          <h4 className="font-semibold text-gray-900">{challenge.title}</h4>
                          <Badge variant="primary" className="text-xs">
                            {challenge.difficulty}
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-600">{challenge.description}</p>
                      </div>
                    </div>
                    
                    <div className="space-y-3">
                      <div className="flex justify-between items-center text-sm">
                        <span className="text-gray-600">Meta: {challenge.target} {challenge.unit}</span>
                        <div className="flex items-center space-x-1">
                          <ApperIcon name="Coins" className="h-4 w-4 text-amber-500" />
                          <span className="font-medium text-amber-600">+{challenge.pointsReward} pts</span>
                        </div>
                      </div>
                      
                      <div className="flex justify-between items-center">
                        <div className="flex items-center space-x-2">
                          <ApperIcon name="Calendar" className="h-4 w-4 text-gray-500" />
                          <span className="text-xs text-gray-500">{challenge.duration} días</span>
                        </div>
                        <Button
                          size="sm"
                          onClick={() => handleJoinMiniChallenge(challenge.Id)}
                          className="bg-gradient-to-r from-emerald-500 to-blue-500 hover:from-emerald-600 hover:to-blue-600"
                        >
                          <ApperIcon name="Plus" className="h-3 w-3 mr-1" />
                          Unirse
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
              
              {activeMiniChallenges.filter(challenge => !userMiniChallenges.some(uc => uc.Id === challenge.Id)).length > 4 && (
                <div className="text-center mt-4">
                  <Button variant="secondary" size="sm">
                    Ver todos los mini-retos
                  </Button>
                </div>
              )}
</div>
          )}
          
          {/* Empty State */}
          {activeMiniChallenges.length === 0 && userMiniChallenges.length === 0 && (
            <div className="text-center py-8">
              <ApperIcon name="Trophy" className="h-16 w-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-600 mb-2">
                No hay mini-retos disponibles
              </h3>
              <p className="text-gray-500 mb-4">
                Los mini-retos semanales aparecerán aquí cuando estén activos
              </p>
              <Button variant="secondary" size="sm">
                <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
                Actualizar
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