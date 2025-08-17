import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import { healthMetricsService } from "@/services/api/healthMetricsService";
import { toast } from "react-toastify";

const Onboarding = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    // Health metrics
    weight: "",
    height: "",
    waist: "",
    hip: "",
    bodyFat: "",
    muscle: "",
    visceralFat: "",
    metabolicAge: "",
    waterGlasses: "",
    dailySteps: "",
    sleepHours: "",
    caffeineSource: "ninguna",
    
    // Photos
    frontPhoto: null,
    backPhoto: null,
    sidePhoto: null,
    
    // Notes
    initialNotes: ""
  });

  const [photos, setPhotos] = useState({
    front: null,
    back: null,
    side: null
  });

  const totalSteps = 3;

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

  const validateStep = (step) => {
    switch (step) {
      case 1:
        const requiredFields = ["weight", "height", "waist", "hip"];
        return requiredFields.every(field => formData[field] && formData[field].trim() !== "");
      
      case 2:
        return photos.front && photos.back && photos.side;
      
      case 3:
        return true; // Notes are optional
      
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

      const healthData = {
        day: 0,
        weight: parseFloat(formData.weight),
        height: parseFloat(formData.height),
        waist: parseFloat(formData.waist),
        hip: parseFloat(formData.hip),
        bodyFat: formData.bodyFat ? parseFloat(formData.bodyFat) : null,
        muscle: formData.muscle ? parseFloat(formData.muscle) : null,
        visceralFat: formData.visceralFat ? parseInt(formData.visceralFat) : null,
        metabolicAge: formData.metabolicAge ? parseInt(formData.metabolicAge) : null,
        waterGlasses: formData.waterGlasses ? parseInt(formData.waterGlasses) : null,
        dailySteps: formData.dailySteps ? parseInt(formData.dailySteps) : null,
        sleepHours: formData.sleepHours ? parseFloat(formData.sleepHours) : null,
        caffeineSource: formData.caffeineSource,
        initialNotes: formData.initialNotes || null
      };

      await healthMetricsService.createHealthMetrics(healthData);
      
      toast.success("¡Datos iniciales guardados exitosamente! Bienvenido al Reto 21D 🎉");
      navigate("/dashboard");
    } catch (err) {
      toast.error("Error al guardar los datos iniciales");
      console.error("Onboarding submit error:", err);
    }
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
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ApperIcon name="Scale" className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
          Métricas Corporales Iniciales
        </h2>
        <p className="text-gray-600">
          Registra tus medidas del día 0 para poder trackear tu progreso
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Input
          label="Peso (kg) *"
          type="number"
          step="0.1"
          value={formData.weight}
          onChange={(e) => handleInputChange("weight", e.target.value)}
          placeholder="70.5"
        />

        <Input
          label="Estatura (cm) *"
          type="number"
          value={formData.height}
          onChange={(e) => handleInputChange("height", e.target.value)}
          placeholder="170"
        />

        <Input
          label="Cintura (cm) *"
          type="number"
          step="0.1"
          value={formData.waist}
          onChange={(e) => handleInputChange("waist", e.target.value)}
          placeholder="85.5"
        />

        <Input
          label="Cadera (cm) *"
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

        <Input
          label="Vasos de agua al día"
          type="number"
          value={formData.waterGlasses}
          onChange={(e) => handleInputChange("waterGlasses", e.target.value)}
          placeholder="8"
        />

        <Input
          label="Pasos diarios promedio"
          type="number"
          value={formData.dailySteps}
          onChange={(e) => handleInputChange("dailySteps", e.target.value)}
          placeholder="8000"
        />

        <Input
          label="Horas de sueño promedio"
          type="number"
          step="0.5"
          value={formData.sleepHours}
          onChange={(e) => handleInputChange("sleepHours", e.target.value)}
          placeholder="7.5"
        />

        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Fuente de cafeína
          </label>
          <select
            value={formData.caffeineSource}
            onChange={(e) => handleInputChange("caffeineSource", e.target.value)}
            className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
          >
            <option value="ninguna">Ninguna</option>
            <option value="te">Té</option>
            <option value="cafe">Café</option>
            <option value="bebidas-energeticas">Bebidas energéticas</option>
          </select>
        </div>
      </div>

      <div className="bg-purple-50 p-4 rounded-xl border border-purple-200">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Info" className="h-5 w-5 text-purple-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-purple-900 font-medium mb-1">💡 Consejos para mediciones precisas:</p>
            <ul className="text-purple-800 space-y-1">
              <li>• Pésate en ayunas, sin ropa y después de ir al baño</li>
              <li>• Mide la cintura en el punto más estrecho</li>
              <li>• Mide la cadera en el punto más ancho</li>
              <li>• Si tienes báscula de bioimpedancia, úsala para %grasa y músculo</li>
            </ul>
          </div>
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
          Fotos de Progreso
        </h2>
        <p className="text-gray-600">
          Toma 3 fotos para documentar tu punto de partida
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
                  alt={`Foto de ${photoType}`}
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
                    <p className="text-sm text-gray-600">Subir foto</p>
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

      <div className="bg-blue-50 p-4 rounded-xl border border-blue-200">
        <div className="flex items-start space-x-3">
          <ApperIcon name="Camera" className="h-5 w-5 text-blue-600 mt-0.5" />
          <div className="text-sm">
            <p className="text-blue-900 font-medium mb-1">📸 Consejos para fotos de progreso:</p>
            <ul className="text-blue-800 space-y-1">
              <li>• Usa ropa ajustada o mínima para ver mejor los cambios</li>
              <li>• Toma las fotos en el mismo lugar con buena iluminación</li>
              <li>• Mantén la misma pose y distancia de la cámara</li>
              <li>• Estas fotos son privadas y solo tú podrás verlas</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStep3 = () => (
    <div className="space-y-6">
      <div className="text-center mb-8">
        <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
          <ApperIcon name="FileText" className="h-10 w-10 text-purple-600" />
        </div>
        <h2 className="font-display font-bold text-2xl text-gray-900 mb-2">
          Notas Iniciales
        </h2>
        <p className="text-gray-600">
          Comparte cómo te sientes hoy y qué esperas del reto
        </p>
      </div>

      <Card className="p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              ¿Cómo te sientes hoy y qué esperas lograr en estos 21 días? (Opcional)
            </label>
            <textarea
              value={formData.initialNotes}
              onChange={(e) => handleInputChange("initialNotes", e.target.value)}
              rows={6}
              className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
              placeholder="Por ejemplo: Me siento emocionado/a por comenzar este reto. Mi meta es perder 3 kg, mejorar mi energía y crear hábitos saludables que pueda mantener a largo plazo..."
            />
          </div>
        </div>
      </Card>

      <div className="bg-emerald-50 p-6 rounded-xl border border-emerald-200">
        <div className="flex items-start space-x-4">
          <div className="bg-emerald-100 p-3 rounded-lg">
            <ApperIcon name="Heart" className="h-6 w-6 text-emerald-600" />
          </div>
          <div>
            <h3 className="font-semibold text-emerald-900 mb-2">¡Estás listo para comenzar! 🎉</h3>
            <p className="text-emerald-800 text-sm leading-relaxed">
              Has completado tu configuración inicial. Durante los próximos 21 días te acompañaremos 
              en tu transformación con planes diarios personalizados, seguimiento de hábitos y 
              herramientas de motivación. ¡Es hora de comenzar tu mejor versión!
            </p>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="text-center">
          <h1 className="font-display font-bold text-3xl mb-2">
            ¡Bienvenido al Reto 21D! 
          </h1>
          <p className="text-purple-100">
            Paso {currentStep} de {totalSteps} - Configuración inicial
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
              <ApperIcon name="CheckCircle" className="h-4 w-4 mr-2" />
              ¡Comenzar Reto!
            </Button>
          )}
        </div>
      </Card>
    </div>
  );
};

export default Onboarding;