import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import { healthMetricsService } from "@/services/api/healthMetricsService";
import { photosService } from "@/services/api/photosService";
import { cohortMembersService } from "@/services/api/cohortMembersService";
import { toast } from "react-toastify";

const FinalMetrics = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialMetrics, setInitialMetrics] = useState(null);
  const [finalMetrics, setFinalMetrics] = useState(null);
  const [showComparison, setShowComparison] = useState(false);
  
  const [formData, setFormData] = useState({
    // Final metrics
    peso_kg: "",
    cintura_cm: "",
    cadera_cm: "",
    body_fat_pct: "",
    muscle_pct: "",
    grasa_visceral: "",
    edad_metabolica: "",
    agua_vasos_promedio: "",
    pasos_promedio: "",
    horas_sueno: "",
    
    // Self-evaluation
    energia_percibida: 3,
    habitos_mantener: [],
    satisfaccion_general: 3,
    testimonio: "",
    permiso_uso_testimonio: false
  });

  const [photos, setPhotos] = useState({
    frente: null,
    espalda: null,
    perfil: null
  });

  const habitOptions = [
    "Hidratación adecuada",
    "Sueño reparador", 
    "Actividad física regular",
    "Alimentación consciente",
    "Manejo del estrés"
  ];

  const loadInitialData = async () => {
    try {
      setLoading(true);
      const metrics = await healthMetricsService.getHealthMetrics();
      setInitialMetrics(metrics.day0);
      setFinalMetrics(metrics.day21);
      
      // If final metrics already exist, show comparison
      if (metrics.day21) {
        setShowComparison(true);
        setFormData(prev => ({
          ...prev,
          peso_kg: metrics.day21.peso_kg?.toString() || "",
          cintura_cm: metrics.day21.cintura_cm?.toString() || "",
          cadera_cm: metrics.day21.cadera_cm?.toString() || "",
          body_fat_pct: metrics.day21.body_fat_pct?.toString() || "",
          muscle_pct: metrics.day21.muscle_pct?.toString() || "",
          grasa_visceral: metrics.day21.grasa_visceral?.toString() || "",
          edad_metabolica: metrics.day21.edad_metabolica?.toString() || "",
          agua_vasos_promedio: metrics.day21.agua_vasos_promedio?.toString() || "",
          pasos_promedio: metrics.day21.pasos_promedio?.toString() || "",
          horas_sueno: metrics.day21.horas_sueno?.toString() || ""
        }));
      }
    } catch (err) {
      toast.error("Error al cargar los datos");
      console.error("Load initial data error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (photoType, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => ({ ...prev, [photoType]: e.target.result }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHabitToggle = (habit) => {
    setFormData(prev => ({
      ...prev,
      habitos_mantener: prev.habitos_mantener.includes(habit)
        ? prev.habitos_mantener.filter(h => h !== habit)
        : [...prev.habitos_mantener, habit]
    }));
  };

  const validateForm = () => {
    const requiredFields = ["peso_kg", "cintura_cm", "cadera_cm"];
    const hasRequiredFields = requiredFields.every(field => 
      formData[field] && formData[field].trim() !== ""
    );
    
    const hasTestimonial = formData.testimonio.trim() !== "";
    
    return hasRequiredFields && hasTestimonial;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error("Por favor completa todos los campos requeridos");
      return;
    }

    try {
      setSaving(true);

      // Save final metrics
      const finalData = {
        phase: "fin",
        peso_kg: parseFloat(formData.peso_kg),
        cintura_cm: parseFloat(formData.cintura_cm),
        cadera_cm: parseFloat(formData.cadera_cm),
        body_fat_pct: formData.body_fat_pct ? parseFloat(formData.body_fat_pct) : null,
        muscle_pct: formData.muscle_pct ? parseFloat(formData.muscle_pct) : null,
        grasa_visceral: formData.grasa_visceral ? parseInt(formData.grasa_visceral) : null,
        edad_metabolica: formData.edad_metabolica ? parseInt(formData.edad_metabolica) : null,
        agua_vasos_promedio: formData.agua_vasos_promedio ? parseInt(formData.agua_vasos_promedio) : null,
        pasos_promedio: formData.pasos_promedio ? parseInt(formData.pasos_promedio) : null,
        horas_sueno: formData.horas_sueno ? parseFloat(formData.horas_sueno) : null,
        energia_percibida: formData.energia_percibida,
        habitos_mantener: formData.habitos_mantener,
        satisfaccion_general: formData.satisfaccion_general,
        testimonio: formData.testimonio,
        permiso_uso_testimonio: formData.permiso_uso_testimonio
      };

      await healthMetricsService.createHealthMetrics(finalData);

      // Save photos if any
      if (photos.frente || photos.espalda || photos.perfil) {
        await photosService.savePhotos("fin", {
          foto_frente_url: photos.frente,
          foto_espalda_url: photos.espalda,
          foto_perfil_url: photos.perfil
        });
      }

      // Mark day 21 as completed
      await cohortMembersService.markDay21Completed();
toast.success("¡Excelente! Tus resultados finales se guardaron.");
      
      // Check for Day 21 bonus points eligibility
      try {
        const photos = await photosService.getUserFinalPhotos(1);
        const finalPhotosCount = photos.filter(p => p.type === 'final').length;
        
        if (finalPhotosCount >= 2) {
          toast.info("🎉 ¡Puntos extra! Subiste 2+ fotos finales y completaste la autoevaluación");
        }
      } catch (error) {
        console.warn("Error checking bonus eligibility:", error);
      }
      
      // Reload data to show comparison
      await loadInitialData();
      setShowComparison(true);

    } catch (err) {
      toast.error("Error al guardar los resultados finales");
      console.error("Submit error:", err);
    } finally {
      setSaving(false);
    }
  };

  const getMetricChange = (field) => {
    if (!initialMetrics || !finalMetrics) return null;
    
    const initial = initialMetrics[field];
    const final = finalMetrics[field];
    
    if (!initial || !final) return null;
    
    const change = final - initial;
    const percentage = Math.abs((change / initial) * 100);
    
    // For weight, body fat, visceral fat, metabolic age, and waist/hip - decrease is good
    const positiveChange = ["peso_kg", "body_fat_pct", "grasa_visceral", "edad_metabolica", "cintura_cm", "cadera_cm"].includes(field)
      ? change < 0
      : change > 0;

    return {
      initial,
      final,
      change: change.toFixed(1),
      percentage: percentage.toFixed(1),
      isPositive: positiveChange
    };
  };

  const renderComparison = () => {
    if (!initialMetrics || !finalMetrics) return null;

    const metrics = [
      { field: "peso_kg", label: "Peso", unit: "kg" },
      { field: "cintura_cm", label: "Cintura", unit: "cm" },
      { field: "cadera_cm", label: "Cadera", unit: "cm" },
      { field: "body_fat_pct", label: "% Grasa", unit: "%" },
      { field: "muscle_pct", label: "% Músculo", unit: "%" },
      { field: "grasa_visceral", label: "Grasa Visceral", unit: "" }
    ];

    return (
      <Card className="p-6">
        <h3 className="font-display font-bold text-2xl text-gray-900 mb-6">
          Tu Progreso
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {metrics.map(({ field, label, unit }) => {
            const change = getMetricChange(field);
            
            if (!change) return null;

            return (
              <Card key={field} className="p-4 border">
                <div className="text-center space-y-2">
                  <h4 className="font-semibold text-gray-900">{label}</h4>
                  <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
                    <span>{change.initial}{unit}</span>
                    <ApperIcon 
                      name="ArrowRight" 
                      className="h-4 w-4" 
                    />
                    <span>{change.final}{unit}</span>
                  </div>
                  <div className={`flex items-center justify-center space-x-1 ${
                    change.isPositive ? 'text-green-600' : 'text-red-600'
                  }`}>
                    <ApperIcon 
                      name={change.isPositive ? "TrendingUp" : "TrendingDown"} 
                      className="h-4 w-4" 
                    />
                    <span className="font-semibold">
                      {change.isPositive ? "+" : ""}{change.change} {unit}
                    </span>
                    <span className="text-xs">
                      ({change.percentage}%)
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>

        {/* BMI Comparison */}
        {initialMetrics.imc && finalMetrics.imc && (
          <div className="mt-6 p-4 bg-blue-50 rounded-xl">
            <h4 className="font-semibold text-blue-900 mb-2">Índice de Masa Corporal (IMC)</h4>
            <div className="flex items-center justify-center space-x-4 text-blue-800">
              <span>Inicial: {initialMetrics.imc}</span>
              <ApperIcon name="ArrowRight" className="h-4 w-4" />
              <span>Final: {finalMetrics.imc}</span>
              <span className="font-semibold">
                (Δ {(finalMetrics.imc - initialMetrics.imc).toFixed(1)})
              </span>
            </div>
          </div>
        )}
      </Card>
    );
  };

  if (loading) return <Loading />;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl mb-2">
            Día 21 – Cierre y Resultados
          </h1>
          <p className="text-emerald-100">
            Registra tus resultados finales y mira tu progreso
          </p>
        </div>
      </Card>

      {/* Final Metrics Form */}
      <Card className="p-6">
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">
          Métricas Finales
        </h2>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Input
            label="Peso final (kg) *"
            type="number"
            step="0.1"
            value={formData.peso_kg}
            onChange={(e) => handleInputChange("peso_kg", e.target.value)}
            placeholder="70.5"
          />

          <Input
            label="Cintura final (cm) *"
            type="number"
            step="0.1"
            value={formData.cintura_cm}
            onChange={(e) => handleInputChange("cintura_cm", e.target.value)}
            placeholder="85.5"
          />

          <Input
            label="Cadera final (cm) *"
            type="number"
            step="0.1"
            value={formData.cadera_cm}
            onChange={(e) => handleInputChange("cadera_cm", e.target.value)}
            placeholder="95.0"
          />

          <Input
            label="% de grasa final"
            type="number"
            step="0.1"
            value={formData.body_fat_pct}
            onChange={(e) => handleInputChange("body_fat_pct", e.target.value)}
            placeholder="25.3"
          />

          <Input
            label="% de músculo final"
            type="number"
            step="0.1"
            value={formData.muscle_pct}
            onChange={(e) => handleInputChange("muscle_pct", e.target.value)}
            placeholder="35.2"
          />

          <Input
            label="Grasa visceral final"
            type="number"
            value={formData.grasa_visceral}
            onChange={(e) => handleInputChange("grasa_visceral", e.target.value)}
            placeholder="8"
          />

          <Input
            label="Edad metabólica final"
            type="number"
            value={formData.edad_metabolica}
            onChange={(e) => handleInputChange("edad_metabolica", e.target.value)}
            placeholder="28"
          />

          <Input
            label="Vasos de agua (promedio)"
            type="number"
            value={formData.agua_vasos_promedio}
            onChange={(e) => handleInputChange("agua_vasos_promedio", e.target.value)}
            placeholder="8"
          />

          <Input
            label="Pasos (promedio diario)"
            type="number"
            value={formData.pasos_promedio}
            onChange={(e) => handleInputChange("pasos_promedio", e.target.value)}
            placeholder="10000"
          />

          <Input
            label="Horas de sueño (promedio)"
            type="number"
            step="0.1"
            value={formData.horas_sueno}
            onChange={(e) => handleInputChange("horas_sueno", e.target.value)}
            placeholder="7.5"
          />
        </div>
      </Card>

      {/* Photos Section */}
      <Card className="p-6">
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">
          Fotos Finales (Opcionales pero recomendadas)
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {["frente", "espalda", "perfil"].map((photoType) => (
            <div key={photoType} className="text-center">
              <h3 className="font-semibold text-gray-900 mb-4 capitalize">
                Foto de {photoType}
              </h3>
              
              {photos[photoType] ? (
                <div className="space-y-4">
                  <img
                    src={photos[photoType]}
                    alt={`Foto final de ${photoType}`}
                    className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
                  />
                  <Button
                    variant="secondary"
                    size="sm"
                    onClick={() => setPhotos(prev => ({ ...prev, [photoType]: null }))}
                  >
                    <ApperIcon name="X" className="h-4 w-4 mr-2" />
                    Eliminar
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="w-full h-48 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                    <div className="text-center">
                      <ApperIcon name="Camera" className="h-12 w-12 text-gray-400 mx-auto mb-2" />
                      <p className="text-sm text-gray-600">Subir foto final</p>
                    </div>
                  </div>
                  
                  <label className="block">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={(e) => handlePhotoUpload(photoType, e.target.files[0])}
                      className="hidden"
                    />
                    <Button variant="secondary" size="sm" className="w-full">
                      <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
                      Seleccionar foto
                    </Button>
                  </label>
                </div>
              )}
            </div>
          ))}
        </div>
      </Card>

      {/* Self-Evaluation */}
      <Card className="p-6">
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-6">
          Autoevaluación
        </h2>
        
        <div className="space-y-8">
          {/* Energy Level */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Energía percibida (1-5)
            </h3>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleInputChange("energia_percibida", level)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all duration-200 ${
                    formData.energia_percibida === level
                      ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Habits to Maintain */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Hábitos que mantendrías (puedes seleccionar varios)
            </h3>
            <div className="space-y-3">
              {habitOptions.map((habit) => (
                <label
                  key={habit}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.habitos_mantener.includes(habit)}
                    onChange={() => handleHabitToggle(habit)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-purple-200"
                  />
                  <span className="text-gray-700">{habit}</span>
                </label>
              ))}
            </div>
          </div>

          {/* Satisfaction */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Satisfacción general (1-5)
            </h3>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleInputChange("satisfaccion_general", level)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all duration-200 ${
                    formData.satisfaccion_general === level
                      ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
          </div>

          {/* Testimonial */}
          <div>
            <h3 className="font-semibold text-gray-900 mb-4">
              Testimonio *
            </h3>
            <textarea
              value={formData.testimonio}
              onChange={(e) => handleInputChange("testimonio", e.target.value)}
              rows={6}
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
              placeholder="Cuéntanos sobre tu experiencia: ¿qué lograste? ¿cómo te sientes? ¿qué fue lo más desafiante? ¿qué aprendiste?"
              required
            />
            
            <div className="mt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.permiso_uso_testimonio}
                  onChange={(e) => handleInputChange("permiso_uso_testimonio", e.target.checked)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-purple-200"
                />
                <span className="text-sm text-gray-700">
                  Permiso de uso: Autorizo compartir este testimonio de forma anónima
                </span>
              </label>
            </div>
          </div>
        </div>
      </Card>

      {/* Save Button */}
      {!showComparison && (
        <Card className="p-6">
          <div className="text-center">
            <Button 
              onClick={handleSubmit} 
              disabled={saving}
              size="lg"
            >
              <ApperIcon name="Save" className="h-5 w-5 mr-2" />
              {saving ? "Guardando..." : "Guardar Día 21"}
            </Button>
          </div>
        </Card>
      )}

      {/* Comparison Section */}
      {showComparison && renderComparison()}

      {/* Navigation Button */}
      {showComparison && (
        <Card className="p-6">
          <div className="text-center">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Button onClick={() => navigate("/progreso")} size="lg">
                <ApperIcon name="BarChart" className="h-5 w-5 mr-2" />
                Ver Mi Progreso Completo
              </Button>
              
              <Button onClick={() => navigate("/progreso?showRanking=true")} size="lg" variant="secondary">
                <ApperIcon name="Trophy" className="h-5 w-5 mr-2" />
                Ver Ranking de Finalistas
              </Button>
            </div>
          </div>
        </Card>
      )}
    </div>
  );
};

export default FinalMetrics;