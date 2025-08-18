import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ReactApexChart from "react-apexcharts";
import { progressService } from "@/services/api/progressService";
import { healthMetricsService } from "@/services/api/healthMetricsService";
import { userService } from "@/services/api/userService";
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
  const [userRanking, setUserRanking] = useState(null);
  const [showRanking, setShowRanking] = useState(false);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

const loadProgressData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [progress, metrics, chart] = await Promise.all([
        progressService.getUserProgress(),
healthMetricsService.getHealthMetrics(),
        progressService.getProgressChart()
      ]);
      
      setProgressData(progress);
      setHealthMetrics(metrics);
      setChartData(chart);
      
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
    loadProgressData();
  }, []);

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadProgressData} />;

const getMetricChange = (initial, current) => {
    if (!initial || !current) return null;
    
    const change = current - initial;
    const percentage = Math.abs((change / initial) * 100).toFixed(1);
    
    return {
      value: `${change >= 0 ? '+' : ''}${change.toFixed(1)} (${percentage}%)`,
      type: ["peso_kg", "cintura_cm", "cadera_cm", "body_fat_pct"].includes(selectedMetric) ? (change < 0 ? "positive" : "negative") : (change > 0 ? "positive" : "negative")
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

  const chartSeries = chartData?.series || [];

  const metrics = [
{ key: "peso_kg", label: "Peso", unit: "kg", icon: "Scale" },
    { key: "cintura_cm", label: "Cintura", unit: "cm", icon: "Move" },
    { key: "cadera_cm", label: "Cadera", unit: "cm", icon: "Move" },
    { key: "body_fat_pct", label: "% Grasa", unit: "%", icon: "Activity" }
  ];

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

      {/* Progress Chart */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h3 className="font-display font-semibold text-lg">Evolución Temporal</h3>
          
          <div className="flex space-x-2">
{metrics.map((metric) => (
              <Button
                key={metric.key}
                size="sm"
                variant={selectedMetric === metric.key ? "primary" : "secondary"}
                onClick={() => setSelectedMetric(metric.key)}
              >
                {metric.label}
              </Button>
            ))}
          </div>
        </div>

        {chartData ? (
          <ReactApexChart
            options={chartOptions}
            series={chartSeries}
            type="line"
            height={350}
          />
        ) : (
          <div className="h-64 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <ApperIcon name="BarChart3" className="h-12 w-12 mx-auto mb-4" />
              <p>Los gráficos se generarán a medida que registres tus métricas</p>
            </div>
          </div>
        )}
      </Card>

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

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard
          title="Puntos Totales"
          value={progressData?.totalPoints || 0}
          icon="Star"
        />
        <MetricCard
          title="Nivel Actual"
          value={progressData?.currentLevel || 1}
          icon="Award"
        />
        <MetricCard
          title="Hábitos Creados"
          value={progressData?.totalHabits || 0}
          icon="Target"
        />
        <MetricCard
          title="Mejor Racha"
          value={progressData?.bestStreak || 0}
          icon="Zap"
        />
      </div>

{/* Action Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/calendario")}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
              <ApperIcon name="Calendar" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">Ver Calendario</h3>
              <p className="text-sm text-gray-600">Revisa tu progreso día a día</p>
            </div>
          </div>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/habitos")}>
          <div className="flex items-center space-x-4">
            <div className="bg-gradient-to-r from-emerald-100 to-blue-100 p-3 rounded-lg">
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
          <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer" onClick={() => navigate("/ranking-finalistas")}>
            <div className="flex items-center space-x-4">
              <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg">
                <ApperIcon name="Trophy" className="h-6 w-6 text-yellow-600" />
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">Ver Ranking de Finalistas</h3>
                <p className="text-sm text-gray-600">Consulta el ranking final del reto</p>
              </div>
            </div>
          </Card>
        )}
      </div>
    </div>
  );
};

export default Progress;