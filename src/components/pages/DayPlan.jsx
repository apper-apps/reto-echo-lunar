import React, { useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { dayPlanService } from "@/services/api/dayPlanService";
import { habitService } from "@/services/api/habitService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Input from "@/components/atoms/Input";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const DayPlan = () => {
  const { dayNumber } = useParams();
  const navigate = useNavigate();
const [dayData, setDayData] = useState(null);
  const [dayHabits, setDayHabits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [interactionStates, setInteractionStates] = useState({});
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
    const sectionState = interactionStates[sectionKey] || {};
    
    const getContentTypeStyle = (type) => {
      const styles = {
        survey: "from-blue-50 to-indigo-50 border-blue-200",
        reflection: "from-purple-50 to-violet-50 border-purple-200",
        educational: "from-emerald-50 to-teal-50 border-emerald-200",
        confirmation: "from-amber-50 to-orange-50 border-amber-200",
        default: ""
      };
      return styles[type] || styles.default;
    };
    
    const contentType = sectionData?.type || 'default';
    const cardStyle = isCompleted 
      ? "bg-gradient-to-r from-emerald-50 to-green-50 border-emerald-200" 
      : `bg-gradient-to-r ${getContentTypeStyle(contentType)}`;
    
    return (
      <Card 
        key={sectionKey}
        className={`p-6 transition-all duration-200 ${cardStyle}`}
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

          {/* Educational Post with Image */}
          {sectionData?.type === 'educational' && sectionData?.imageUrl && (
            <div className="bg-white p-4 rounded-lg border border-emerald-100 shadow-sm">
              <div className="aspect-video bg-gradient-to-r from-emerald-100 to-teal-100 rounded-lg mb-3 flex items-center justify-center">
                <ApperIcon name="BookOpen" className="h-12 w-12 text-emerald-600" />
              </div>
              <div className="flex items-center justify-between">
                <Badge className="bg-emerald-100 text-emerald-700 border-emerald-200">
                  📚 Contenido Educativo
                </Badge>
                <span className="text-xs text-emerald-600 font-medium">
                  {sectionData.readTime || '2 min lectura'}
                </span>
              </div>
            </div>
          )}

          {/* Survey with Rating Scale */}
          {sectionData?.type === 'survey' && sectionData?.survey && (
            <div className="bg-white p-4 rounded-lg border border-blue-100 shadow-sm">
              <h5 className="font-medium text-blue-900 mb-3 flex items-center">
                <ApperIcon name="HelpCircle" className="h-4 w-4 mr-2" />
                Encuesta del Día
              </h5>
              <p className="text-blue-800 text-sm mb-4">{sectionData.survey}</p>
              
              <div className="space-y-3">
                <p className="text-xs text-blue-600 font-medium">Califica del 1 al 5:</p>
                <div className="flex space-x-2 justify-center">
                  {[1, 2, 3, 4, 5].map((rating) => (
                    <button
                      key={rating}
                      onClick={() => setInteractionStates(prev => ({
                        ...prev,
                        [sectionKey]: { ...prev[sectionKey], rating }
                      }))}
                      className={`w-10 h-10 rounded-full border-2 transition-all duration-200 flex items-center justify-center font-semibold ${
                        sectionState.rating === rating
                          ? 'bg-blue-500 border-blue-500 text-white shadow-lg scale-110'
                          : 'border-blue-300 text-blue-400 hover:border-blue-400 hover:scale-105'
                      }`}
                    >
                      {rating}
                    </button>
                  ))}
                </div>
                {sectionState.rating && (
                  <div className="text-center">
                    <span className="text-blue-700 text-sm font-medium">
                      Calificación: {sectionState.rating}/5 ⭐
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Reflection Prompt with Text Input */}
          {sectionData?.type === 'reflection' && sectionData?.reflection && (
            <div className="bg-white p-4 rounded-lg border border-purple-100 shadow-sm">
              <h5 className="font-medium text-purple-900 mb-3 flex items-center">
                <ApperIcon name="Brain" className="h-4 w-4 mr-2" />
                Momento de Reflexión
              </h5>
              <p className="text-purple-800 text-sm mb-4">{sectionData.reflection}</p>
              
              <div className="space-y-2">
                <textarea
                  value={sectionState.reflectionText || ''}
                  onChange={(e) => setInteractionStates(prev => ({
                    ...prev,
                    [sectionKey]: { ...prev[sectionKey], reflectionText: e.target.value }
                  }))}
                  placeholder="Escribe tu reflexión aquí..."
                  className="w-full p-3 border border-purple-200 rounded-lg resize-none focus:outline-none focus:ring-2 focus:ring-purple-400 focus:border-transparent"
                  rows={3}
                  maxLength={250}
                />
                <div className="flex justify-between items-center text-xs text-purple-600">
                  <span>Comparte tus pensamientos</span>
                  <span>{(sectionState.reflectionText || '').length}/250</span>
                </div>
              </div>
            </div>
          )}

          {/* Completion Confirmation */}
          {sectionData?.type === 'confirmation' && (
            <div className="bg-white p-4 rounded-lg border border-amber-100 shadow-sm">
              <div className="text-center space-y-3">
                <div className="w-16 h-16 bg-gradient-to-r from-amber-400 to-orange-400 rounded-full flex items-center justify-center mx-auto">
                  <ApperIcon name="Trophy" className="h-8 w-8 text-white" />
                </div>
                <h5 className="font-semibold text-amber-900">¡Momento de Celebración! 🎉</h5>
<p className="text-amber-800 text-sm">{sectionData.content}</p>
                <div className="flex justify-center space-x-2 mt-4">
                  {['🌟', '💪', '🚀', '✨', '🏆'].map((emoji, index) => (
                    <span
                      key={`celebration-emoji-${index}`}
                      className="text-2xl animate-bounce"
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      {emoji}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Legacy content types */}
          {!sectionData?.type && sectionData?.reflection && (
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h5 className="font-medium text-purple-900 mb-2">💭 Reflexión:</h5>
              <p className="text-purple-800 text-sm">{sectionData.reflection}</p>
            </div>
          )}

          {sectionData?.checklist && sectionData.checklist.length > 0 && (
            <div className="space-y-2">
              <h5 className="font-medium text-gray-900">📝 Lista de tareas:</h5>
              {sectionData.checklist.map((item, index) => (
                <div key={`${item}-${index}`} className="flex items-center space-x-2">
                  <ApperIcon name="CheckSquare" className="h-4 w-4 text-emerald-500" />
                  <span className="text-sm text-gray-700">{item}</span>
                </div>
              ))}
            </div>
          )}

          {!sectionData?.type && sectionData?.survey && (
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
              disabled={
                (sectionData?.type === 'survey' && !sectionState.rating) ||
                (sectionData?.type === 'reflection' && (!sectionState.reflectionText || sectionState.reflectionText.trim().length < 10))
              }
            >
              <ApperIcon name="Check" className="h-4 w-4 mr-2" />
              {sectionData?.type === 'confirmation' ? '¡Celebrar Logro!' : 'Marcar como Completado'}
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
{/* Sections */}
      <div className="space-y-6">
        {dayData?.sections && Object.entries(dayData.sections).map(([sectionKey, sectionData]) => (
          <div key={`section-${sectionKey}`}>
            {renderSectionCard(sectionKey, sectionData)}
          </div>
        ))}
      </div>

{/* Today's Habits */}
      {dayHabits && dayHabits.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-semibold mb-4 flex items-center">
            <span className="text-2xl mr-2">🎯</span>
            Hábitos de Hoy
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
{dayHabits.map((habit) => (
              <div
                key={habit?.id || `habit-${habit?.name}-${Math.random()}`}
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