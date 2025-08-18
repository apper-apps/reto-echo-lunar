import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { progressService } from "@/services/api/progressService";
import { healthMetricsService } from "@/services/api/healthMetricsService";
import { userService } from "@/services/api/userService";
import { habitService } from "@/services/api/habitService";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import MetricCard from "@/components/molecules/MetricCard";
import ProgressRing from "@/components/molecules/ProgressRing";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";
const Progress = () => {
  const navigate = useNavigate();
  const [progressData, setProgressData] = useState(null);
  const [healthMetrics, setHealthMetrics] = useState(null);
const [chartData, setChartData] = useState(null);
const [selectedMetric, setSelectedMetric] = useState("peso_kg");
const [chartType, setChartType] = useState("line");
const [viewMode, setViewMode] = useState("daily"); // daily or weekly
  const [userRanking, setUserRanking] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
const loadProgressData = async () => {
    try {
      setLoading(true);
      setError("");
      
const [progress, metrics, chart, user, habits] = await Promise.all([
progressService.getUserProgress(),
healthMetricsService.getHealthMetrics(),
progressService.getProgressChart(),
userService.getCurrentUser(),
habitService.getTodayHabits()
]);
      
// Get additional progress data
      const [habitChart, weeklyComparison, additionalData] = await Promise.all([
        progressService.getHabitProgressChart(),
        progressService.getWeeklyComparison(),
        progressService.getAdditionalData()
      ]);

      setProgressData(progress);
      setHealthMetrics(metrics);
      setChartData({
        ...chart,
        habitChart,
        weeklyComparison,
        ...additionalData
      });
      setUserRole(user?.role);
      
      // Check if user completed the challenge (day 21) to show ranking
      if (progress?.currentDay >= 21 || metrics?.day21) {
        try {
          const ranking = await progressService.getUserRanking();
          setUserRanking(ranking);
          setShowRanking(true);
        } catch (rankingErr) {
          console.warn("Could not load ranking data:", rankingErr);
setShowRanking(false);
        }
      }
      
    } catch (err) {
      setError("Error al cargar los datos de progreso");
      console.error("Progress load error:", err);
    } finally {
      setLoading(false);
    }
  };

useEffect(() => {
    const initializeData = async () => {
      await loadProgressData();
    };
    initializeData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProgressData} />;

const getMetricChange = (initial, current) => {
    if (!initial || !current) return null;
    
    const change = current - initial;
    const percentage = Math.abs((change / initial) * 100).toFixed(1);
    const isImprovement = ["peso_kg", "cintura_cm", "cadera_cm", "body_fat_pct"].includes(selectedMetric) ? change < 0 : change > 0;
    
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)} (${percentage}%)`,
      type: isImprovement ? "positive" : "negative",
      isImprovement,
      percentage: parseFloat(percentage)
    };
  };

  const chartOptions = {
    chart: {
      height: 350,
      type: "line",
      toolbar: { show: false },
      fontFamily: "Inter, system-ui, sans-serif"
    },
    colors: ["#7C3AED", "#2563EB", "#10B981"],
    stroke: {
      curve: "smooth",
      width: 3
    },
    xaxis: {
      categories: chartData?.categories || [],
      labels: {
        style: {
          colors: "#6B7280"
        }
      }
    },
    yaxis: {
      labels: {
        style: {
          colors: "#6B7280"
        }
      }
    },
    grid: {
      borderColor: "#E5E7EB",
      strokeDashArray: 5
    },
    legend: {
      position: "top",
      horizontalAlign: "left"
    },
    dataLabels: {
      enabled: false
    },
    tooltip: {
      y: {
        formatter: (val, opts) => {
const suffixes = {
            peso_kg: " kg",
            cintura_cm: " cm",
            cadera_cm: " cm",
            body_fat_pct: "%"
          };
          return val + (suffixes[selectedMetric] || "");
        }
      }
    }
  };

const chartSeries = chartData?.series?.filter(s => s.name.toLowerCase().includes(selectedMetric.replace('_', ' '))) || [];

// Enhanced chart options with better colors and interactivity
const enhancedChartOptions = {
...chartOptions,
chart: {
...chartOptions.chart,
type: chartType,
animations: {
enabled: true,
easing: 'easeinout',
speed: 800
}
},
colors: ['#7C3AED', '#2563EB', '#10B981', '#F59E0B', '#EF4444'],
fill: {
type: chartType === 'area' ? 'gradient' : 'solid',
gradient: {
shade: 'dark',
gradientToColors: ['#9333EA', '#3B82F6', '#059669'],
shadeIntensity: 1,
type: 'vertical',
opacityFrom: 0.8,
opacityTo: 0.1
}
}
};

// Weekly summary calculation
const weeklyData = chartData?.weeklyData || [];
const habitCompletionData = progressData?.habitCompletion || [];
  const metrics = [
{ key: "peso_kg", label: "Peso", unit: "kg", icon: "Scale" },
    { key: "cintura_cm", label: "Cintura", unit: "cm", icon: "Move" },
    { key: "cadera_cm", label: "Cadera", unit: "cm", icon: "Move" },
    { key: "body_fat_pct", label: "% Grasa", unit: "%", icon: "Activity" }
  ];
{/* Challenger Progress Dashboard */}
      <div className="mb-8 p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white rounded-2xl">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-3xl font-bold font-display">Mi Progreso</h1>
            <p className="text-purple-100 mt-2">Desafío de 21 Días - Transformación Personal</p>
          </div>
          <div className="flex items-center space-x-4">
            <div className="text-center">
              <div className="text-3xl font-bold">{progressData?.currentDay || 1}</div>
              <div className="text-sm text-purple-100">Día Actual</div>
            </div>
            <div className="w-px h-12 bg-purple-300"></div>
            <div className="text-center">
              <div className="text-3xl font-bold">{progressData?.streakDays || 0}</div>
              <div className="text-sm text-purple-100">Días Consecutivos</div>
            </div>
          </div>
        </div>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{progressData?.totalPoints || 0}</div>
            <div className="text-xs text-purple-100">Puntos Totales</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{progressData?.adherencePercentage || 0}%</div>
            <div className="text-xs text-purple-100">Adherencia</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{progressData?.completedDays || 0}/21</div>
            <div className="text-xs text-purple-100">Días Completados</div>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4 text-center">
            <div className="text-2xl font-bold">{progressData?.bestStreak || 0}</div>
            <div className="text-xs text-purple-100">Mejor Racha</div>
          </div>
        </div>

        {/* Achievement Badges */}
        {progressData?.achievements && progressData.achievements.length > 0 && (
          <div className="mt-6">
            <h3 className="text-lg font-semibold mb-3">Logros Desbloqueados</h3>
            <div className="flex flex-wrap gap-3">
              {progressData.achievements.map((achievement) => (
                <Badge 
                  key={achievement.id}
                  variant="secondary"
                  className="bg-white/20 text-white border-white/30 px-3 py-2"
                >
                  <ApperIcon name={achievement.icon} className="w-4 h-4 mr-2" />
                  {achievement.title}
                </Badge>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Progress Ring */}
      <div className="mb-8 flex justify-center">
        <div className="bg-white rounded-2xl p-8 shadow-lg">
          <div className="text-center mb-4">
            <h2 className="text-xl font-semibold text-gray-800">Progreso General</h2>
            <p className="text-gray-600">Completado del desafío</p>
          </div>
          <ProgressRing
            progress={Math.round(((progressData?.currentDay || 1) / 21) * 100)}
            size={200}
            strokeWidth={16}
            className="mx-auto"
          />
          <div className="text-center mt-4">
            <div className="text-3xl font-bold text-purple-600">
              {Math.round(((progressData?.currentDay || 1) / 21) * 100)}%
            </div>
            <div className="text-gray-600">
              {progressData?.currentDay || 1} de 21 días
            </div>
          </div>
        </div>
      </div>

      {/* Habit Progress Chart */}
      {chartData?.habitChart && (
        <Card className="mb-8 p-6">
          <div className="flex items-center justify-between mb-6">
            <div>
              <h2 className="text-xl font-semibold text-gray-800">Progreso de Hábitos</h2>
              <p className="text-gray-600">Evolución diaria de tu adherencia</p>
            </div>
          </div>
          <div className="h-80">
            <ReactApexChart
              options={{
                chart: {
                  type: 'line',
                  height: 320,
                  toolbar: { show: false },
                  zoom: { enabled: false }
                },
                colors: chartData.habitChart.series.map(s => s.color),
                stroke: {
                  curve: 'smooth',
                  width: 3
                },
                xaxis: {
                  categories: chartData.habitChart.categories,
                  labels: {
                    rotate: -45,
                    style: { fontSize: '12px' }
                  }
                },
                yaxis: [
                  {
                    title: { text: 'Porcentaje (%)' },
                    min: 0,
                    max: 100
                  },
                  {
                    opposite: true,
                    title: { text: 'Cantidad' },
                    min: 0,
                    max: 10
                  }
                ],
                tooltip: {
                  shared: true,
                  intersect: false
                },
                legend: {
                  position: 'top',
                  horizontalAlign: 'center'
                },
                grid: {
                  borderColor: '#f1f5f9'
                }
              }}
              series={chartData.habitChart.series}
              type="line"
              height={320}
            />
          </div>
        </Card>
      )}

      {/* Weekly Comparison */}
      {chartData?.weeklyComparison && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Progreso Semanal</h3>
            <div className="space-y-4">
              {chartData.weeklyComparison.weeks.map((week) => (
                <div key={week.week} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center">
                    <div className="w-8 h-8 bg-purple-100 text-purple-600 rounded-full flex items-center justify-center text-sm font-semibold mr-3">
                      {week.week}
                    </div>
                    <div>
                      <div className="font-medium">Semana {week.week}</div>
                      <div className="text-sm text-gray-600">{week.metrics.adherence}% adherencia</div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">{week.metrics.peso_kg} kg</div>
                    <div className="text-sm text-gray-600">{week.metrics.cintura_cm} cm</div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-800 mb-4">Mejoras Totales</h3>
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ApperIcon name="TrendingDown" className="w-5 h-5 text-green-500 mr-3" />
                  <span className="font-medium">Peso</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-green-600">
                    {chartData.weeklyComparison.improvements.weight > 0 ? '+' : ''}
                    {chartData.weeklyComparison.improvements.weight} kg
                  </div>
                  <div className="text-sm text-gray-600">Cambio total</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ApperIcon name="TrendingDown" className="w-5 h-5 text-blue-500 mr-3" />
                  <span className="font-medium">Cintura</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-blue-600">
                    {chartData.weeklyComparison.improvements.waist > 0 ? '+' : ''}
                    {chartData.weeklyComparison.improvements.waist} cm
                  </div>
                  <div className="text-sm text-gray-600">Reducción</div>
                </div>
              </div>
              
              <div className="flex items-center justify-between">
                <div className="flex items-center">
                  <ApperIcon name="TrendingUp" className="w-5 h-5 text-purple-500 mr-3" />
                  <span className="font-medium">Adherencia</span>
                </div>
                <div className="text-right">
                  <div className="text-2xl font-bold text-purple-600">
                    +{chartData.weeklyComparison.improvements.adherence}%
                  </div>
                  <div className="text-sm text-gray-600">Mejora</div>
                </div>
              </div>
            </div>
          </Card>
        </div>
      )}

      {/* Habit Completion Detail */}
      {chartData?.habitCompletion && (
        <Card className="mb-8 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-6">Detalle por Hábito</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {chartData.habitCompletion.map((habit, index) => (
              <div key={index} className="p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-800">{habit.name}</h4>
                  <ApperIcon 
                    name={habit.trend === 'up' ? 'TrendingUp' : habit.trend === 'down' ? 'TrendingDown' : 'Minus'}
                    className={`w-4 h-4 ${
                      habit.trend === 'up' ? 'text-green-500' : 
                      habit.trend === 'down' ? 'text-red-500' : 'text-gray-500'
                    }`}
                  />
                </div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-2xl font-bold text-purple-600">{habit.completionRate}%</span>
                  <span className="text-sm text-gray-600">{habit.completedDays}/{habit.totalDays}</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className={`h-2 rounded-full ${
                      habit.completionRate >= 90 ? 'bg-green-500' :
                      habit.completionRate >= 70 ? 'bg-blue-500' :
                      habit.completionRate >= 50 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${habit.completionRate}%` }}
                  ></div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}
return (
<div className="space-y-6">
{/* Header */}
<Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
<div className="flex items-center justify-between">
<div>
<h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
Mi Progreso
</h1>
<p className="text-purple-100">
Día {progressData?.currentDay || 0} de 21 - Transformación en marcha 📊
</p>
</div>
<div className="hidden md:block">
<ApperIcon name="TrendingUp" className="h-16 w-16 text-purple-200" />
</div>
</div>
</Card>

{/* Ranking Section for Finalists */}
{showRanking && userRanking && (
<Card className="p-6 mb-6">
<div className="flex items-center justify-between mb-6">
<h2 className="font-display font-semibold text-xl">Ranking de Finalistas</h2>
<Badge variant="success">Reto Completado</Badge>
</div>

{/* User Position */}
<div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100">
<div className="flex items-center justify-between">
<div>
<h3 className="font-semibold text-gray-900">Tu Posición</h3>
<p className="text-sm text-gray-600">De {userRanking.totalParticipants} finalistas</p>
</div>
<div className="text-center">
<div className="text-3xl font-bold text-purple-600">#{userRanking.position}</div>
<div className="text-sm text-gray-600">{userRanking.user.totalPoints} puntos</div>
{userRanking.user.bonusPoints > 0 && (
<div className="text-xs text-emerald-600">+{userRanking.user.bonusPoints} bonus</div>
)}
</div>
</div>
</div>

{/* Top 10 */}
<div>
<h3 className="font-semibold text-gray-900 mb-4">Top 10 del Reto</h3>
<div className="space-y-3">
{userRanking.topTen.map((member, index) => (
<div 
key={member.Id}
className={`flex items-center justify-between p-3 rounded-lg ${
member.Id === userRanking.user.Id 
? 'bg-purple-100 border-2 border-purple-300' 
: 'bg-gray-50'
}`}
>
<div className="flex items-center space-x-3">
<div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
index < 3 ? 'bg-gradient-to-r from-yellow-400 to-orange-400 text-white' : 'bg-gray-200 text-gray-700'
}`}>
{index + 1}
</div>
<div>
<p className="font-medium text-gray-900">
{member.profile?.fullName || `Participante ${member.Id}`}
</p>
<p className="text-sm text-gray-600">
{member.totalPoints} puntos
{member.bonusPoints > 0 && (
<span className="text-emerald-600"> (+{member.bonusPoints} bonus)</span>
)}
</p>
</div>
</div>
{index < 3 && (
<ApperIcon 
name="Trophy" 
className={`h-5 w-5 ${
index === 0 ? 'text-yellow-500' : 
index === 1 ? 'text-gray-400' : 
'text-orange-600'
}`} 
/>
)}
</div>
))}
</div>
</div>
</Card>
)}

{/* Progress Rings */}
<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
<Card className="p-6 text-center">
<ProgressRing
progress={(progressData?.currentDay / 21) * 100}
size={120}
label="Progreso General"
value={`${Math.round((progressData?.currentDay / 21) * 100)}%`}
color="#7C3AED"
/>
<h3 className="font-semibold text-gray-900 mt-4">Días Completados</h3>
<p className="text-sm text-gray-600">{progressData?.currentDay}/21 días</p>
</Card>

<Card className="p-6 text-center">
<ProgressRing
progress={progressData?.adherencePercentage || 0}
size={120}
label="Adherencia"
value={`${progressData?.adherencePercentage || 0}%`}
color="#10B981"
/>
<h3 className="font-semibold text-gray-900 mt-4">Cumplimiento</h3>
<p className="text-sm text-gray-600">Hábitos completados</p>
</Card>

<Card className="p-6 text-center">
<ProgressRing
progress={Math.min((progressData?.streakDays / 21) * 100, 100)}
size={120}
label="Racha"
value={`${progressData?.streakDays || 0}`}
color="#2563EB"
/>
<h3 className="font-semibold text-gray-900 mt-4">Días Consecutivos</h3>
<p className="text-sm text-gray-600">¡Sigue así!</p>
</Card>
</div>

{/* Weekly Progress Summary */}
{weeklyData.length > 0 && (
<Card className="p-6">
<h3 className="font-display font-semibold text-lg mb-6">Resumen Semanal</h3>
<div className="grid grid-cols-1 md:grid-cols-3 gap-4">
{weeklyData.map((week, index) => (
<div key={week.week} className="p-4 bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 rounded-xl border border-purple-100">
<div className="flex items-center justify-between mb-3">
<h4 className="font-semibold text-gray-900">Semana {week.week}</h4>
<Badge variant={week.completionRate >= 80 ? "success" : week.completionRate >= 60 ? "warning" : "error"}>
{week.completionRate}%
</Badge>
</div>
<div className="space-y-2">
<div className="flex justify-between text-sm">
<span className="text-gray-600">Hábitos:</span>
<span className="font-medium">{week.habitsCompleted}/{week.totalHabits}</span>
</div>
<div className="flex justify-between text-sm">
<span className="text-gray-600">Días activos:</span>
<span className="font-medium">{week.activeDays}/7</span>
</div>
<div className="w-full bg-gray-200 rounded-full h-2">
<div 
className="bg-gradient-to-r from-purple-600 to-blue-600 h-2 rounded-full transition-all duration-300"
style={{ width: `${week.completionRate}%` }}
></div>
</div>
</div>
</div>
))}
</div>
</Card>
)}

{/* Habit Completion Visualization */}
{habitCompletionData.length > 0 && (
<Card className="p-6">
<div className="flex items-center justify-between mb-6">
<h3 className="font-display font-semibold text-lg">Seguimiento de Hábitos</h3>
<div className="flex space-x-2">
<Button
size="sm"
variant={viewMode === "daily" ? "primary" : "secondary"}
onClick={() => setViewMode("daily")}
>
Diario
</Button>
<Button
size="sm"
variant={viewMode === "weekly" ? "primary" : "secondary"}
onClick={() => setViewMode("weekly")}
>
Semanal
</Button>
</div>
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
{habitCompletionData.slice(0, 6).map((habit, index) => (
<div key={habit.name} className="p-4 bg-gradient-to-r from-gray-50 to-purple-50 rounded-xl">
<div className="text-center">
<ProgressRing
progress={habit.completionRate}
size={80}
label={habit.name}
value={`${habit.completionRate}%`}
color={`hsl(${260 + (index * 30)}, 70%, 50%)`}
/>
<h4 className="font-medium text-gray-900 mt-2 text-sm">{habit.name}</h4>
<p className="text-xs text-gray-600">{habit.completedDays}/{habit.totalDays} días</p>
</div>
</div>
))}
</div>

{viewMode === "daily" && (
<div className="grid grid-cols-7 gap-2">
{Array.from({ length: 21 }, (_, i) => {
const day = i + 1;
const dayData = habitCompletionData.find(h => h.day === day);
const completionRate = dayData?.completionRate || 0;
return (
<div key={day} className="text-center">
<div 
className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium mb-1 ${
completionRate >= 80 ? 'bg-emerald-500 text-white' :
completionRate >= 60 ? 'bg-yellow-500 text-white' :
completionRate >= 40 ? 'bg-orange-500 text-white' :
completionRate > 0 ? 'bg-red-500 text-white' :
'bg-gray-200 text-gray-600'
}`}
>
{day}
</div>
<div className="text-xs text-gray-600">{completionRate}%</div>
</div>
);
})}
</div>
)}
</Card>
)}

{/* Health Metrics Comparison */}
{healthMetrics && (
<>
<div className="flex items-center justify-between">
<h2 className="font-display font-semibold text-xl">Métricas de Salud</h2>
{healthMetrics.day21 ? (
<Badge variant="success">Reto Completado</Badge>
) : (
<Button
size="sm"
onClick={() => navigate("/metricas-finales")}
disabled={(progressData?.currentDay || 0) < 21}
>
Registrar Día 21
</Button>
)}
</div>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
{metrics.map((metric) => {
const initial = healthMetrics.day0?.[metric.key];
const current = healthMetrics.day21?.[metric.key];
const change = getMetricChange(initial, current);

return (
<MetricCard
key={metric.key}
title={metric.label}
value={current || initial || 0}
unit={metric.unit}
icon={metric.icon}
change={change}
gradient={metric.key === selectedMetric}
/>
);
})}
</div>
</>
)}

{/* Enhanced Progress Chart */}
<Card className="p-6">
<div className="flex flex-col space-y-4 mb-6">
<div className="flex items-center justify-between">
<h3 className="font-display font-semibold text-lg">Evolución Temporal</h3>
<div className="flex space-x-2">
<Button
size="sm"
variant={chartType === "line" ? "primary" : "secondary"}
onClick={() => setChartType("line")}
>
<ApperIcon name="TrendingUp" size={14} />
</Button>
<Button
size="sm"
variant={chartType === "area" ? "primary" : "secondary"}
onClick={() => setChartType("area")}
>
<ApperIcon name="AreaChart" size={14} />
</Button>
<Button
size="sm"
variant={chartType === "bar" ? "primary" : "secondary"}
onClick={() => setChartType("bar")}
>
<ApperIcon name="BarChart3" size={14} />
</Button>
</div>
</div>

<div className="flex flex-wrap gap-2">
{metrics.map((metric) => (
<Button
key={metric.key}
size="sm"
variant={selectedMetric === metric.key ? "primary" : "secondary"}
onClick={() => setSelectedMetric(metric.key)}
className="text-xs"
>
{metric.label}
</Button>
))}
</div>
</div>

{chartData ? (
<ReactApexChart
options={enhancedChartOptions}
series={chartSeries}
type={chartType}
height={400}
/>
) : (
<div className="h-80 flex items-center justify-center text-gray-500">
<div className="text-center">
<ApperIcon name="BarChart3" className="h-16 w-16 mx-auto mb-4 text-gray-300" />
<p className="text-lg font-medium text-gray-600 mb-2">Gráficos en construcción</p>
<p className="text-sm text-gray-500">Los datos se actualizarán automáticamente</p>
</div>
</div>
)}
</Card>

{/* Comparative Analysis */}
{healthMetrics?.day0 && healthMetrics?.day21 && (
<Card className="p-6">
<h3 className="font-display font-semibold text-lg mb-6">Análisis Comparativo</h3>
<div className="grid grid-cols-1 md:grid-cols-2 gap-6">
<div>
<h4 className="font-medium text-gray-900 mb-4 text-center">Día 0 (Inicio)</h4>
<div className="space-y-3">
{metrics.slice(0, 4).map((metric) => {
const value = healthMetrics.day0[metric.key];
return (
<div key={`initial-${metric.key}`} className="flex justify-between items-center p-3 bg-red-50 rounded-lg">
<span className="text-sm font-medium text-gray-700">{metric.label}</span>
<span className="text-lg font-bold text-red-600">{value || 0} {metric.unit}</span>
</div>
);
})}
</div>
</div>
<div>
<h4 className="font-medium text-gray-900 mb-4 text-center">Día 21 (Final)</h4>
<div className="space-y-3">
{metrics.slice(0, 4).map((metric) => {
const value = healthMetrics.day21[metric.key];
const change = getMetricChange(healthMetrics.day0[metric.key], value);
return (
<div key={`final-${metric.key}`} className="flex justify-between items-center p-3 bg-emerald-50 rounded-lg">
<div className="flex items-center space-x-2">
<span className="text-sm font-medium text-gray-700">{metric.label}</span>
{change && (
<Badge variant={change.isImprovement ? "success" : "error"} className="text-xs">
{change.isImprovement ? '↓' : '↑'} {Math.abs(change.percentage)}%
</Badge>
)}
</div>
<span className="text-lg font-bold text-emerald-600">{value || 0} {metric.unit}</span>
</div>
);
})}
</div>
</div>
</div>
</Card>
)}

{/* Achievements */}
<Card className="p-6">
<h3 className="font-display font-semibold text-lg mb-4">Logros y Reconocimientos</h3>

<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
{progressData?.achievements?.map((achievement) => (
<div
key={achievement.id}
className="flex items-center space-x-4 p-4 bg-gradient-to-r from-purple-50 to-blue-50 rounded-xl border border-purple-100"
>
<div className="bg-gradient-to-r from-purple-100 to-blue-100 p-3 rounded-full">
<ApperIcon name={achievement.icon} className="h-6 w-6 text-purple-600" />
</div>
<div>
<h4 className="font-semibold text-gray-900">{achievement.title}</h4>
<p className="text-sm text-gray-600">{achievement.description}</p>
</div>
</div>
)) || (
<div className="col-span-full text-center py-8">
<ApperIcon name="Trophy" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
<p className="text-gray-600">Los logros aparecerán aquí a medida que avances</p>
</div>
)}
</div>
</Card>

{/* Enhanced Stats Summary */}
<div className="grid grid-cols-2 md:grid-cols-4 gap-4">
<MetricCard
title="Puntos Totales"
value={progressData?.totalPoints || 0}
icon="Star"
gradient={true}
/>
<MetricCard
title="Nivel Actual"
value={progressData?.currentLevel || 1}
icon="Award"
gradient={true}
/>
<MetricCard
title="Hábitos Creados"
value={progressData?.totalHabits || 0}
icon="Target"
gradient={true}
/>
<MetricCard
title="Mejor Racha"
value={progressData?.bestStreak || 0}
icon="Zap"
gradient={true}
/>
</div>

{/* Action Buttons */}
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
<Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate("/calendario")}>
<div className="flex items-center space-x-4">
<div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg group-hover:from-blue-200 group-hover:to-purple-200 transition-all duration-300">
<ApperIcon name="Calendar" className="h-6 w-6 text-primary" />
</div>
<div>
<h3 className="font-semibold text-gray-900">Ver Calendario</h3>
<p className="text-sm text-gray-600">Revisa tu progreso día a día</p>
</div>
</div>
</Card>

<Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate("/habitos")}>
<div className="flex items-center space-x-4">
<div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-3 rounded-lg group-hover:from-emerald-200 group-hover:to-blue-200 transition-all duration-300">
<ApperIcon name="CheckSquare" className="h-6 w-6 text-emerald-600" />
</div>
<div>
<h3 className="font-semibold text-gray-900">Gestionar Hábitos</h3>
<p className="text-sm text-gray-600">Actualiza tus hábitos diarios</p>
</div>
</div>
</Card>

{/* Finalists Ranking Button - Only visible for Coach/Admin */}
{userRole && (userRole === 'Coach' || userRole === 'Admin') && (
<Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate("/ranking-finalistas")}>
<div className="flex items-center space-x-4">
<div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg group-hover:from-yellow-200 group-hover:to-orange-200 transition-all duration-300">
<ApperIcon name="Trophy" className="h-6 w-6 text-yellow-600" />
</div>
<div>
<h3 className="font-semibold text-gray-900">Ver Ranking de Finalistas</h3>
<p className="text-sm text-gray-600">Consulta el ranking final del reto</p>
</div>
</div>
</Card>
)}

<Card className="p-6 hover:shadow-lg transition-all duration-300 cursor-pointer group" onClick={() => navigate("/perfil")}>
<div className="flex items-center space-x-4">
<div className="bg-gradient-to-r from-purple-100 to-pink-100 p-3 rounded-lg group-hover:from-purple-200 group-hover:to-pink-200 transition-all duration-300">
<ApperIcon name="User" className="h-6 w-6 text-purple-600" />
</div>
<div>
<h3 className="font-semibold text-gray-900">Ver Perfil</h3>
<p className="text-sm text-gray-600">Revisa y actualiza tu información</p>
</div>
</div>
</Card>
</div>
</div>
);
};

export default Progress;