import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import { healthMetricsService } from "@/services/api/healthMetricsService";
import { toast } from "react-toastify";

const FinalMetrics = () => {
  const navigate = useNavigate();
  const [initialMetrics, setInitialMetrics] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  
  const [formData, setFormData] = useState({
    // Final metrics
    weight: "",
    waist: "",
    hip: "",
    bodyFat: "",
    muscle: "",
    visceralFat: "",
    metabolicAge: "",
    
    // Photos
    frontPhoto: null,
    backPhoto: null,
    sidePhoto: null,
    
    // Self-evaluation
    energyLevel: 3,
    maintainHabits: [],
    satisfaction: 3,
    testimonial: "",
    allowTestimonial: false
  });

  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    side: null
  });

  const totalSteps = 3;

  const loadInitialMetrics = async () => {
    try {
      setLoading(true);
      const metrics = await healthMetricsService.getHealthMetrics();
      setInitialMetrics(metrics.day0);
      
      if (metrics.day0) {
        setFormData(prev => ({
          ...prev,
          weight: metrics.day0.weight?.toString() || "",
          waist: metrics.day0.waist?.toString() || "",
          hip: metrics.day0.hip?.toString() || "",
          bodyFat: metrics.day0.bodyFat?.toString() || "",
          muscle: metrics.day0.muscle?.toString() || "",
          visceralFat: metrics.day0.visceralFat?.toString() || "",
          metabolicAge: metrics.day0.metabolicAge?.toString() || ""
        }));
      }
    } catch (err) {
      toast.error("Error al cargar las métricas iniciales");
      console.error("Initial metrics load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInitialMetrics();
  }, []);

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handlePhotoUpload = (photoType, file) => {
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotos(prev => ({ ...prev, [photoType]: e.target.result }));
        setFormData(prev => ({ ...prev, [`${photoType}Photo`]: file }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleHabitToggle = (habit) => {
    setFormData(prev => ({
      ...prev,
      maintainHabits: prev.maintainHabits.includes(habit)
        ? prev.maintainHabits.filter(h => h !== habit)
        : [...prev.maintainHabits, habit]
    }));
  };

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const requiredFields = ["weight", "waist", "hip"];
        return requiredFields.every(field => formData[field] && formData[field].trim() !== "");
      
      case 2:
        return photos.front && photos.back && photos.side;
      
      case 3:
        return formData.testimonial.trim() !== "";
      
      default:
        return false;
    }
  };

  const handleNext = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, totalSteps));
    } else {
      toast.error("Por favor completa todos los campos requeridos");
    }
  };

  const handlePrevious = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  const handleSubmit = async () => {
    try {
      if (!validateStep(3)) {
        toast.error("Por favor completa la información requerida");
        return;
      }

      const finalData = {
        day: 21,
        weight: parseFloat(formData.weight),
        waist: parseFloat(formData.waist),
        hip: parseFloat(formData.hip),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscle: formData.muscle ? parseFloat(formData.muscle) : null,
        visceralFat: formData.visceralFat ? parseInt(formData.visceralFat) : null,
        metabolicAge: formData.metabolicAge ? parseInt(formData.metabolicAge) : null,
        energyLevel: formData.energyLevel,
        maintainHabits: formData.maintainHabits,
        satisfaction: formData.satisfaction,
        testimonial: formData.testimonial,
        allowTestimonial: formData.allowTestimonial
      };

      await healthMetricsService.createHealthMetrics(finalData);
      
      toast.success("¡Felicitaciones! Has completado el Reto 21D 🎉🏆");
      setTimeout(() => {
        navigate("/progreso");
      }, 2000);
    } catch (err) {
      toast.error("Error al guardar las métricas finales");
      console.error("Final metrics submit error:", err);
    }
  };

  if (loading) return <Loading />;

  const getMetricChange = (field) => {
    const initial = initialMetrics?.[field];
    const current = parseFloat(formData[field]);
    
    if (!initial || !current) return null;
    
    const change = current - initial;
    const percentage = Math.abs((change / initial) * 100).toFixed(1);
    
    return {
      value: change.toFixed(1),
      percentage,
      isPositive: field === "weight" ? change < 0 : change > 0
    };
  };

  const renderProgressBar = () => (
    <div className="w-full bg-gray-200 rounded-full h-2 mb-8">
      <div
        className="bg-gradient-to-r from-primary to-secondary h-2 rounded-full transition-all duration-300"
        style={{ width: `${(currentStep / totalSteps) * 100}%` }}
      ></div>
    </div>
  );

  const renderStep1 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-emerald-100 to-green-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ApperIcon name="Target" className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
          Métricas Finales - Día 21
        </h2>
        <p className="text-gray-600">
          ¡Felicitaciones! Vamos a registrar tu transformación
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Current Metrics */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg text-gray-900">Métricas Actuales</h3>
          
          <Input
            label="Peso actual (kg) *"
            type="number"
            step="0.1"
            value={formData.weight}
            onChange={(e) => handleInputChange("weight", e.target.value)}
            placeholder="70.5"
          />

          <Input
            label="Cintura actual (cm) *"
            type="number"
            step="0.1"
            value={formData.waist}
            onChange={(e) => handleInputChange("waist", e.target.value)}
            placeholder="85.5"
          />

          <Input
            label="Cadera actual (cm) *"
            type="number"
            step="0.1"
            value={formData.hip}
            onChange={(e) => handleInputChange("hip", e.target.value)}
            placeholder="95.0"
          />

          <Input
            label="Porcentaje de grasa corporal (%)"
            type="number"
            step="0.1"
            value={formData.bodyFat}
            onChange={(e) => handleInputChange("bodyFat", e.target.value)}
            placeholder="25.3"
          />

          <Input
            label="Porcentaje de músculo (%)"
            type="number"
            step="0.1"
            value={formData.muscle}
            onChange={(e) => handleInputChange("muscle", e.target.value)}
            placeholder="35.2"
          />

          <Input
            label="Grasa visceral (nivel)"
            type="number"
            value={formData.visceralFat}
            onChange={(e) => handleInputChange("visceralFat", e.target.value)}
            placeholder="8"
          />

          <Input
            label="Edad metabólica (años)"
            type="number"
            value={formData.metabolicAge}
            onChange={(e) => handleInputChange("metabolicAge", e.target.value)}
            placeholder="28"
          />
        </div>

        {/* Comparison */}
        <div className="space-y-6">
          <h3 className="font-semibold text-lg text-gray-900">Tu Progreso</h3>
          
          {initialMetrics && (
            <div className="space-y-4">
              {["weight", "waist", "hip", "bodyFat", "muscle"].map((field) => {
                const change = getMetricChange(field);
                const labels = {
                  weight: "Peso",
                  waist: "Cintura", 
                  hip: "Cadera",
                  bodyFat: "% Grasa",
                  muscle: "% Músculo"
                };
                const units = {
                  weight: "kg",
                  waist: "cm",
                  hip: "cm", 
                  bodyFat: "%",
                  muscle: "%"
                };

                return (
                  <Card key={field} className="p-4">
                    <div className="flex justify-between items-center">
                      <div>
                        <h4 className="font-medium text-gray-900">{labels[field]}</h4>
                        <p className="text-sm text-gray-600">
                          Inicial: {initialMetrics[field] || "N/A"} {units[field]}
                        </p>
                      </div>
                      {change && (
                        <Badge
                          variant={change.isPositive ? "success" : "danger"}
                        >
                          {change.isPositive ? "+" : ""}{change.value} {units[field]}
                          ({change.percentage}%)
                        </Badge>
                      )}
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );

  const renderStep2 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ApperIcon name="Camera" className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
          Fotos Finales
        </h2>
        <p className="text-gray-600">
          Captura tu transformación con las fotos del día 21
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {["front", "back", "side"].map((photoType) => (
          <Card key={photoType} className="p-6 text-center">
            <h3 className="font-semibold text-gray-900 mb-4 capitalize">
              {photoType === "front" ? "Frente" : photoType === "back" ? "Espalda" : "Perfil"}
            </h3>
            
            {photos[photoType] ? (
              <div className="space-y-4">
                <img
                  src={photos[photoType]}
                  alt={`Foto final de ${photoType}`}
                  className="w-full h-48 object-cover rounded-lg"
                />
                <Button
                  variant="secondary"
                  size="sm"
                  onClick={() => {
                    setPhotos(prev => ({ ...prev, [photoType]: null }));
                    setFormData(prev => ({ ...prev, [`${photoType}Photo`]: null }));
                  }}
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
                  <Button variant="primary" size="sm" className="w-full">
                    <ApperIcon name="Upload" className="h-4 w-4 mr-2" />
                    Seleccionar foto
                  </Button>
                </label>
              </div>
            )}
          </Card>
        ))}
      </div>

      <div className="bg-emerald-50 p-4 rounded-xl border border-emerald-200">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Trophy" className="h-5 w-5 text-emerald-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-emerald-900 font-medium mb-1">🏆 ¡Último paso para completar tu transformación!</p>
            <p className="text-emerald-800">
              Toma las fotos finales en las mismas condiciones que las iniciales para poder ver claramente tu progreso.
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => {
    const habitOptions = [
      "Hidratación adecuada",
      "Sueño reparador", 
      "Actividad física regular",
      "Alimentación consciente",
      "Manejo del estrés"
    ];

    return (
      <div className="space-y-6">
        <div className="text-center mb-8">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ApperIcon name="Heart" className="h-10 w-10 text-purple-600" />
          </div>
          <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
            Autoevaluación Final
          </h2>
          <p className="text-gray-600">
            Reflexiona sobre tu experiencia en estos 21 días
          </p>
        </div>

        <div className="space-y-8">
          {/* Energy Level */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              ¿Cómo calificarías tu nivel de energía actual? (1-5)
            </h3>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleInputChange("energyLevel", level)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all duration-200 ${
                    formData.energyLevel === level
                      ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Muy bajo</span>
              <span>Excelente</span>
            </div>
          </Card>

          {/* Habits to Maintain */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              ¿Qué hábitos planeas mantener? (Puedes seleccionar varios)
            </h3>
            <div className="space-y-3">
              {habitOptions.map((habit) => (
                <label
                  key={habit}
                  className="flex items-center space-x-3 cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={formData.maintainHabits.includes(habit)}
                    onChange={() => handleHabitToggle(habit)}
                    className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-purple-200"
                  />
                  <span className="text-gray-700">{habit}</span>
                </label>
              ))}
            </div>
          </Card>

          {/* Satisfaction */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Satisfacción general con el reto (1-5)
            </h3>
            <div className="flex space-x-4">
              {[1, 2, 3, 4, 5].map((level) => (
                <button
                  key={level}
                  onClick={() => handleInputChange("satisfaction", level)}
                  className={`w-12 h-12 rounded-full font-semibold transition-all duration-200 ${
                    formData.satisfaction === level
                      ? "bg-gradient-to-r from-primary to-secondary text-white scale-110"
                      : "bg-gray-200 text-gray-700 hover:bg-gray-300"
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>
            <div className="flex justify-between text-xs text-gray-600 mt-2">
              <span>Muy insatisfecho</span>
              <span>Muy satisfecho</span>
            </div>
          </Card>

          {/* Testimonial */}
          <Card className="p-6">
            <h3 className="font-semibold text-gray-900 mb-4">
              Comparte tu testimonio *
            </h3>
            <textarea
              value={formData.testimonial}
              onChange={(e) => handleInputChange("testimonial", e.target.value)}
              rows={6}
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
              placeholder="Cuéntanos sobre tu experiencia: ¿qué lograste? ¿cómo te sientes? ¿qué fue lo más desafiante? ¿qué aprendiste?"
              required
            />
            
            <div className="mt-4">
              <label className="flex items-center space-x-3 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.allowTestimonial}
                  onChange={(e) => handleInputChange("allowTestimonial", e.target.checked)}
                  className="w-5 h-5 text-primary border-gray-300 rounded focus:ring-purple-200"
                />
                <span className="text-sm text-gray-700">
                  Permito que este testimonio sea compartido de forma anónima para inspirar a otros participantes
                </span>
              </label>
            </div>
          </Card>
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl mb-2">
            ¡Felicitaciones! 🎉
          </h1>
          <p className="text-emerald-100">
            Has completado 21 días de transformación - Registra tus resultados finales
          </p>
        </div>
      </Card>

      {/* Progress Bar */}
      <Card className="p-6">
        {renderProgressBar()}
        
        {/* Step Content */}
        {currentStep === 1 && renderStep1()}
        {currentStep === 2 && renderStep2()}
        {currentStep === 3 && renderStep3()}
      </Card>

      {/* Navigation */}
      <Card className="p-6">
        <div className="flex justify-between">
          <Button
            variant="secondary"
            onClick={handlePrevious}
            disabled={currentStep === 1}
          >
            <ApperIcon name="ChevronLeft" className="h-4 w-4 mr-2" />
            Anterior
          </Button>

          {currentStep < totalSteps ? (
            <Button onClick={handleNext}>
              Siguiente
              <ApperIcon name="ChevronRight" className="h-4 w-4 ml-2" />
            </Button>
          ) : (
            <Button onClick={handleSubmit}>
              <ApperIcon name="Trophy" className="h-4 w-4 mr-2" />
              ¡Completar Reto 21D!
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default FinalMetrics;