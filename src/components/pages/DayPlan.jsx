import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { dayPlanService } from "@/services/api/dayPlanService";
import { habitService } from "@/services/api/habitService";
import { toast } from "react-toastify";

const DayPlan = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
  const [dayData, setDayData] = useState(null);
  const [dayHabits, setDayHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadDayData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [day, habits] = await Promise.all([
        dayPlanService.getDayPlan(parseInt(dayNumber)),
        habitService.getHabitsForDay(parseInt(dayNumber))
      ]);
      
      setDayData(day);
      setDayHabits(habits);
    } catch (err) {
      setError("Error al cargar el plan del día");
      console.error("Day plan load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDayData();
  }, [dayNumber]);

  const handleSectionComplete = async (section) => {
    try {
      await dayPlanService.completeDaySection(parseInt(dayNumber), section);
      await loadDayData(); // Reload to get updated status
      
      const celebrationMessages = [
        "¡Excelente trabajo! 🎉",
        "¡Vas por buen camino! ⭐",
        "¡Sigue así, campeón! 💪",
        "¡Un paso más hacia tu meta! 🚀",
        "¡Increíble progreso! 🌟"
      ];
      
      const randomMessage = celebrationMessages[Math.floor(Math.random() * celebrationMessages.length)];
      toast.success(randomMessage);
    } catch (err) {
      toast.error("Error al completar la sección");
    }
  };

  const handleHabitToggle = async (habitId) => {
    try {
      await habitService.toggleHabitStatus(habitId);
      const updatedHabits = await habitService.getHabitsForDay(parseInt(dayNumber));
      setDayHabits(updatedHabits);
      toast.success("¡Hábito actualizado!");
    } catch (err) {
      toast.error("Error al actualizar el hábito");
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadDayData} />;

  const getSectionIcon = (section) => {
    const icons = {
      morning: "Sunrise",
      midday: "Sun",
      afternoon: "Sunset",
      night: "Moon"
    };
    return icons[section] || "Clock";
  };

  const getSectionTitle = (section) => {
    const titles = {
      morning: "Mañana",
      midday: "Mediodía", 
      afternoon: "Tarde",
      night: "Noche"
    };
    return titles[section] || section;
  };

  const getSectionTime = (section) => {
    const times = {
      morning: "6:00 - 10:00",
      midday: "12:00 - 14:00",
      afternoon: "16:00 - 18:00", 
      night: "20:00 - 22:00"
    };
    return times[section] || "";
  };

  const renderSectionCard = (sectionKey, sectionData) => {
    const isCompleted = sectionData?.completed || false;
    
    return (
      <Card 
        key={sectionKey}
        className={`p-6 transition-all duration-200 ${
          isCompleted ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200" : ""
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center space-x-3">
            <div className={`p-3 rounded-lg ${
              isCompleted ? "bg-emerald-100" : "bg-gradient-to-r from-purple-100 to-blue-100"
            }`}>
              <ApperIcon 
                name={getSectionIcon(sectionKey)} 
                className={`h-6 w-6 ${isCompleted ? "text-emerald-600" : "text-primary"}`}
              />
            </div>
            <div>
              <h3 className="font-display font-semibold text-lg">
                {getSectionTitle(sectionKey)}
              </h3>
              <p className="text-sm text-gray-600">{getSectionTime(sectionKey)}</p>
            </div>
          </div>
          
          {isCompleted ? (
            <Badge variant="success">
              <ApperIcon name="Check" className="h-3 w-3 mr-1" />
              Completado
            </Badge>
          ) : (
            <Badge variant="default">Pendiente</Badge>
          )}
        </div>

        {/* Content */}
        <div className="space-y-4">
          {sectionData?.title && (
            <h4 className="font-semibold text-gray-900">{sectionData.title}</h4>
          )}
          
          {sectionData?.content && (
            <p className="text-gray-700 leading-relaxed">{sectionData.content}</p>
          )}

          {sectionData?.reflection && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h5 className="font-medium text-purple-900 mb-2">💭 Reflexión:</h5>
              <p className="text-purple-800 text-sm">{sectionData.reflection}</p>
            </div>
          )}

          {sectionData?.checklist && sectionData.checklist.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">📝 Lista de tareas:</h5>
              {sectionData.checklist.map((item, index) => (
                <div key={index} className="flex items-center space-x-2">
                  <ApperIcon name="CheckSquare" className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          )}

          {sectionData?.survey && (
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h5 className="font-medium text-blue-900 mb-2">❓ Pregunta del día:</h5>
              <p className="text-blue-800 text-sm">{sectionData.survey}</p>
            </div>
          )}
        </div>

        {/* Action Button */}
        {!isCompleted && (
          <div className="mt-6">
            <Button
              onClick={() => handleSectionComplete(sectionKey)}
              className="w-full"
            >
              <ApperIcon name="Check" className="h-4 w-4 mr-2" />
              Marcar como Completado
            </Button>
          </div>
        )}
      </Card>
    );
  };

  const completedSections = [
    dayData?.morning?.completed,
    dayData?.midday?.completed,
    dayData?.afternoon?.completed, 
    dayData?.night?.completed
  ].filter(Boolean).length;

  const completedHabits = dayHabits.filter(h => h.status === "completed").length;
  const progressPercentage = Math.round(((completedSections + completedHabits) / (4 + dayHabits.length)) * 100) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center space-x-4 mb-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => navigate("/calendario")}
                className="text-white hover:bg-white/20 p-2"
              >
                <ApperIcon name="ArrowLeft" className="h-4 w-4" />
              </Button>
              <h1 className="font-display font-bold text-2xl lg:text-3xl">
                Día {dayNumber} de 21
              </h1>
            </div>
            <p className="text-purple-100">
              {progressPercentage}% completado - ¡Sigue adelante! 💪
            </p>
          </div>
          <div className="hidden md:block">
            <div className="text-right">
              <div className="text-3xl font-bold">{completedSections}/4</div>
              <div className="text-sm text-purple-200">Secciones</div>
            </div>
          </div>
        </div>
      </Card>

      {/* Progress Overview */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{completedSections}/4</div>
          <div className="text-sm text-gray-600">Momentos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{completedHabits}/{dayHabits.length}</div>
          <div className="text-sm text-gray-600">Hábitos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">{progressPercentage}%</div>
          <div className="text-sm text-gray-600">Progreso</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">+{completedSections * 10 + completedHabits * 5}</div>
          <div className="text-sm text-gray-600">Puntos</div>
        </Card>
      </div>

      {/* Day Plan Sections */}
      <div className="space-y-6">
        <h2 className="font-display font-semibold text-xl">Plan del Día</h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {dayData?.morning && renderSectionCard("morning", dayData.morning)}
          {dayData?.midday && renderSectionCard("midday", dayData.midday)}
          {dayData?.afternoon && renderSectionCard("afternoon", dayData.afternoon)}
          {dayData?.night && renderSectionCard("night", dayData.night)}
        </div>
      </div>

      {/* Today's Habits */}
      {dayHabits.length > 0 && (
        <Card className="p-6">
          <h3 className="font-display font-semibold text-lg mb-4">Hábitos de Hoy</h3>
          <div className="space-y-3">
            {dayHabits.map((habit) => (
              <div
                key={habit.id}
                className={`flex items-center justify-between p-4 rounded-xl border transition-all duration-200 cursor-pointer hover:shadow-md ${
                  habit.status === "completed"
                    ? "bg-emerald-50 border-emerald-200"
                    : habit.status === "partial"
                    ? "bg-yellow-50 border-yellow-200"
                    : "bg-gray-50 border-gray-200"
                }`}
                onClick={() => handleHabitToggle(habit.id)}
              >
                <div className="flex items-center space-x-3">
                  <ApperIcon
                    name={
                      habit.status === "completed"
                        ? "CheckCircle2"
                        : habit.status === "partial"
                        ? "Clock"
                        : "Circle"
                    }
                    className={`h-6 w-6 ${
                      habit.status === "completed"
                        ? "text-emerald-500"
                        : habit.status === "partial"
                        ? "text-yellow-500"
                        : "text-gray-400"
                    }`}
                  />
                  <div>
                    <h4 className="font-medium text-gray-900">{habit.name}</h4>
                    <p className="text-sm text-gray-600">{habit.category}</p>
                  </div>
                </div>

                <Badge
                  variant={
                    habit.status === "completed"
                      ? "success"
                      : habit.status === "partial"
                      ? "warning"
                      : "default"
                  }
                >
                  {habit.status === "completed"
                    ? "Completado"
                    : habit.status === "partial"
                    ? "Parcial"
                    : "Pendiente"}
                </Badge>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Navigation */}
      <div className="flex justify-between">
        <Button
          variant="secondary"
          onClick={() => {
            const prevDay = Math.max(1, parseInt(dayNumber) - 1);
            navigate(`/dia/${prevDay}`);
          }}
          disabled={parseInt(dayNumber) <= 1}
        >
          <ApperIcon name="ChevronLeft" className="h-4 w-4 mr-2" />
          Día Anterior
        </Button>

        <Button
          onClick={() => {
            const nextDay = Math.min(21, parseInt(dayNumber) + 1);
            navigate(`/dia/${nextDay}`);
          }}
          disabled={parseInt(dayNumber) >= 21}
        >
          Día Siguiente
          <ApperIcon name="ChevronRight" className="h-4 w-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default DayPlan;