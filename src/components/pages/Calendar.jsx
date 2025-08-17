import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { calendarService } from "@/services/api/calendarService";
import { progressService } from "@/services/api/progressService";

const Calendar = () => {
  const navigate = useNavigate();
  const [calendarData, setCalendarData] = useState([]);
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [progressData, setProgressData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadCalendarData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [calendar, progress] = await Promise.all([
        calendarService.getCalendarData(),
        progressService.getUserProgress()
      ]);
      
      setCalendarData(calendar);
      setProgressData(progress);
    } catch (err) {
      setError("Error al cargar el calendario");
      console.error("Calendar load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCalendarData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCalendarData} />;

  const getDayStatus = (day) => {
    if (day > (progressData?.currentDay || 0)) return "future";
    
    const dayData = calendarData.find(d => d.day === day);
    if (!dayData) return "incomplete";
    
    const completedSections = [
      dayData.morning?.completed,
      dayData.midday?.completed, 
      dayData.afternoon?.completed,
      dayData.night?.completed
    ].filter(Boolean).length;
    
    if (completedSections === 4) return "completed";
    if (completedSections > 0) return "partial";
    return "incomplete";
  };

  const getStatusColor = (status) => {
    switch (status) {
      case "completed":
        return "bg-emerald-500 text-white hover:bg-emerald-600";
      case "partial":
        return "bg-yellow-500 text-white hover:bg-yellow-600";
      case "incomplete":
        return "bg-red-500 text-white hover:bg-red-600";
      case "future":
        return "bg-gray-300 text-gray-600 cursor-not-allowed";
      default:
        return "bg-gray-200 text-gray-700";
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case "completed":
        return "CheckCircle2";
      case "partial":
        return "Clock";
      case "incomplete":
        return "X";
      case "future":
        return "Lock";
      default:
        return "Circle";
    }
  };

  const handleDayClick = (day) => {
    const status = getDayStatus(day);
    if (status !== "future") {
      navigate(`/dia/${day}`);
    }
  };

  const completedDays = calendarData.filter(d => getDayStatus(d.day) === "completed").length;
  const partialDays = calendarData.filter(d => getDayStatus(d.day) === "partial").length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              Calendario del Reto 21D
            </h1>
            <p className="text-purple-100">
              Día {progressData?.currentDay || 0} de 21 - ¡Sigue adelante! 🚀
            </p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="Calendar" className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </Card>

      {/* Progress Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600">{completedDays}</div>
          <div className="text-sm text-gray-600">Días Completos</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-yellow-600">{partialDays}</div>
          <div className="text-sm text-gray-600">Días Parciales</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-purple-600">{progressData?.streakDays || 0}</div>
          <div className="text-sm text-gray-600">Racha Actual</div>
        </Card>
        <Card className="p-4 text-center">
          <div className="text-2xl font-bold text-blue-600">
            {progressData ? Math.round((progressData.currentDay / 21) * 100) : 0}%
          </div>
          <div className="text-sm text-gray-600">Completado</div>
        </Card>
      </div>

      {/* Calendar Grid */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">Tu Progreso Diario</h2>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-emerald-500 rounded-full"></div>
              <span>Completado</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
              <span>Parcial</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-red-500 rounded-full"></div>
              <span>Incompleto</span>
            </div>
            <div className="flex items-center space-x-2 text-sm">
              <div className="w-3 h-3 bg-gray-300 rounded-full"></div>
              <span>Futuro</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-7 gap-3">
          {/* Day headers */}
          {["D1", "D2", "D3", "D4", "D5", "D6", "D7"].map((day, index) => (
            <div key={day} className="text-center text-sm font-medium text-gray-600 p-2">
              {day}
            </div>
          ))}
          
          {/* Calendar days */}
          {Array.from({ length: 21 }, (_, i) => i + 1).map((day) => {
            const status = getDayStatus(day);
            const isToday = day === (progressData?.currentDay || 0);
            
            return (
              <button
                key={day}
                onClick={() => handleDayClick(day)}
                disabled={status === "future"}
                className={`
                  relative aspect-square rounded-xl font-semibold text-lg transition-all duration-200 transform hover:scale-105 disabled:hover:scale-100 disabled:cursor-not-allowed
                  ${getStatusColor(status)}
                  ${isToday ? "ring-4 ring-purple-300 ring-offset-2" : ""}
                `}
              >
                <span className="absolute inset-0 flex items-center justify-center">
                  {day}
                </span>
                
                {/* Status icon */}
                <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center">
                  <ApperIcon 
                    name={getStatusIcon(status)} 
                    className="h-3 w-3 text-gray-600"
                  />
                </div>
                
                {/* Today indicator */}
                {isToday && (
                  <div className="absolute -bottom-1 left-1/2 transform -translate-x-1/2">
                    <Badge variant="primary" className="text-xs px-2 py-0.5">
                      Hoy
                    </Badge>
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </Card>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
              <ApperIcon name="Play" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Plan de Hoy</h3>
              <p className="text-sm text-gray-600">Continúa con tu día actual</p>
            </div>
          </div>
          <Button
            className="w-full"
            onClick={() => navigate(`/dia/${progressData?.currentDay || 1}`)}
            disabled={(progressData?.currentDay || 0) === 0}
          >
            <ApperIcon name="ArrowRight" className="h-4 w-4 mr-2" />
            Ir a Día {progressData?.currentDay || 1}
          </Button>
        </Card>

        <Card className="p-6">
          <div className="flex items-center space-x-4 mb-4">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-3 rounded-lg">
              <ApperIcon name="Target" className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Mis Hábitos</h3>
              <p className="text-sm text-gray-600">Revisa tu progreso diario</p>
            </div>
          </div>
          <Button
            variant="secondary"
            className="w-full"
            onClick={() => navigate("/habitos")}
          >
            <ApperIcon name="CheckSquare" className="h-4 w-4 mr-2" />
            Ver Hábitos
          </Button>
        </Card>
      </div>
    </div>
  );
};

export default Calendar;