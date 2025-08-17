import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';
import Loading from '@/components/ui/Loading';
import { healthMetricsService } from '@/services/api/healthMetricsService';
import { userService } from '@/services/api/userService';
import { photosService } from '@/services/api/photosService';
import { toast } from 'react-toastify';

const DayZero = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [existingData, setExistingData] = useState(null);
  const [completionStatus, setCompletionStatus] = useState('Pendiente');

  const [formData, setFormData] = useState({
    peso_kg: '',
    estatura_cm: '',
    edad_anios: '',
    cintura_cm: '',
    cadera_cm: '',
    body_fat_pct: '',
    muscle_pct: '',
    grasa_visceral: '',
    edad_metabolica: '',
    agua_vasos_promedio: '',
    pasos_promedio: '',
    horas_sueno: '',
    cafeina_fuente: []
  });

  const [photos, setPhotos] = useState({
    frente: null,
    espalda: null,
    perfil: null
  });

  const [errors, setErrors] = useState({});

  const caffeineOptions = [
    { id: 'te', label: 'Té' },
    { id: 'cafe', label: 'Café' },
    { id: 'bebidas-energeticas', label: 'Bebidas energéticas' },
    { id: 'ninguna', label: 'Ninguna' }
  ];

  const validationRules = {
    peso_kg: { min: 30.0, max: 300.0, decimal: true, label: 'Peso' },
    estatura_cm: { min: 120, max: 220, integer: true, label: 'Estatura' },
    edad_anios: { min: 10, max: 100, integer: true, label: 'Edad' },
    cintura_cm: { min: 40, max: 200, integer: true, label: 'Cintura' },
    cadera_cm: { min: 40, max: 200, integer: true, label: 'Cadera' },
    body_fat_pct: { min: 0, max: 70, decimal: true, label: 'Porcentaje de grasa corporal' },
    muscle_pct: { min: 10, max: 70, decimal: true, label: 'Porcentaje de músculo' },
    grasa_visceral: { min: 1, max: 30, integer: true, label: 'Grasa visceral' },
    edad_metabolica: { min: 10, max: 100, integer: true, label: 'Edad metabólica' },
    agua_vasos_promedio: { min: 0, max: 20, integer: true, label: 'Vasos de agua' },
    pasos_promedio: { min: 0, max: 40000, integer: true, label: 'Pasos diarios' },
    horas_sueno: { min: 0, max: 14, decimal: true, label: 'Horas de sueño' }
  };

  useEffect(() => {
    loadInitialData();
  }, []);

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Load existing Day 0 data if available
      const metrics = await healthMetricsService.getMetricsByPhase('inicio');
      const dayZeroStatus = await userService.getDayZeroStatus();
      
      if (metrics) {
        setFormData({
          peso_kg: metrics.peso_kg || '',
          estatura_cm: metrics.estatura_cm || '',
          edad_anios: metrics.edad_anios || '',
          cintura_cm: metrics.cintura_cm || '',
          cadera_cm: metrics.cadera_cm || '',
          body_fat_pct: metrics.body_fat_pct || '',
          muscle_pct: metrics.muscle_pct || '',
          grasa_visceral: metrics.grasa_visceral || '',
          edad_metabolica: metrics.edad_metabolica || '',
          agua_vasos_promedio: metrics.agua_vasos_promedio || '',
          pasos_promedio: metrics.pasos_promedio || '',
          horas_sueno: metrics.horas_sueno || '',
          cafeina_fuente: Array.isArray(metrics.cafeina_fuente) ? metrics.cafeina_fuente : []
        });
        setExistingData(metrics);
        
        // Load existing photos
        try {
          const existingPhotos = await photosService.getPhotosByPhase('inicio');
          if (existingPhotos) {
            setPhotos({
              frente: existingPhotos.foto_frente_url || null,
              espalda: existingPhotos.foto_espalda_url || null,
              perfil: existingPhotos.foto_perfil_url || null
            });
          }
        } catch (photoError) {
          // Photos might not exist yet
          console.log('No existing photos found');
        }
      }

      setCompletionStatus(dayZeroStatus.day0_completed ? 'Completado' : 'Pendiente');
      
    } catch (error) {
      toast.error('Error al cargar los datos existentes');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleCaffeineChange = (optionId) => {
    setFormData(prev => {
      let newSources = [...prev.cafeina_fuente];
      
      if (optionId === 'ninguna') {
        // If "Ninguna" is selected, clear all others
        newSources = newSources.includes('ninguna') ? [] : ['ninguna'];
      } else {
        // Remove "Ninguna" if selecting other options
        newSources = newSources.filter(s => s !== 'ninguna');
        
        if (newSources.includes(optionId)) {
          newSources = newSources.filter(s => s !== optionId);
        } else {
          newSources.push(optionId);
        }
      }
      
      return {
        ...prev,
        cafeina_fuente: newSources
      };
    });

    // Clear caffeine error
    if (errors.cafeina_fuente) {
      setErrors(prev => ({
        ...prev,
        cafeina_fuente: null
      }));
    }
  };

  const handlePhotoUpload = async (photoType, event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
      toast.error('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error('El archivo es demasiado grande. Máximo 5MB.');
      return;
    }

    try {
      // Create object URL for preview
      const imageUrl = URL.createObjectURL(file);
      
      setPhotos(prev => ({
        ...prev,
        [photoType]: imageUrl
      }));

      // Clear photo error
      if (errors[`foto_${photoType}`]) {
        setErrors(prev => ({
          ...prev,
          [`foto_${photoType}`]: null
        }));
      }

      toast.success(`Foto de ${photoType} cargada exitosamente`);
    } catch (error) {
      toast.error('Error al cargar la imagen');
    }
  };

  const validateForm = () => {
    const newErrors = {};

    // Validate numeric fields
    Object.entries(validationRules).forEach(([field, rules]) => {
      const value = formData[field];
      
      if (!value || value === '') {
        newErrors[field] = `${rules.label} es requerido`;
        return;
      }

      const numValue = parseFloat(value);
      
      if (isNaN(numValue)) {
        newErrors[field] = `${rules.label} debe ser un número válido`;
        return;
      }

      if (rules.integer && !Number.isInteger(numValue)) {
        newErrors[field] = `${rules.label} debe ser un número entero`;
        return;
      }

      if (numValue < rules.min || numValue > rules.max) {
        newErrors[field] = `Introduce un valor entre ${rules.min} y ${rules.max}`;
        return;
      }
    });

    // Validate caffeine source
    if (formData.cafeina_fuente.length === 0) {
      newErrors.cafeina_fuente = 'Selecciona al menos una fuente de cafeína';
    }

    // Validate photos
    if (!photos.frente) {
      newErrors.foto_frente = 'La foto de frente es obligatoria';
    }
    if (!photos.espalda) {
      newErrors.foto_espalda = 'La foto de espalda es obligatoria';
    }
    if (!photos.perfil) {
      newErrors.foto_perfil = 'La foto de perfil es obligatoria';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const calculateBMI = () => {
    const weight = parseFloat(formData.peso_kg);
    const height = parseFloat(formData.estatura_cm);
    
    if (weight && height) {
      const heightInMeters = height / 100;
      return (weight / (heightInMeters * heightInMeters)).toFixed(1);
    }
    
    return null;
  };

  const handleSubmit = async () => {
    if (!validateForm()) {
      toast.error('Por favor corrige los errores en el formulario');
      return;
    }

    try {
      setSaving(true);

      // Convert caffeine array to appropriate format
      const caffeineFormatted = formData.cafeina_fuente.map(source => {
        const option = caffeineOptions.find(opt => opt.id === source);
        return option ? option.label : source;
      });

      // Prepare metrics data
      const metricsData = {
        phase: 'inicio',
        peso_kg: parseFloat(formData.peso_kg),
        estatura_cm: parseInt(formData.estatura_cm),
        edad_anios: parseInt(formData.edad_anios),
        cintura_cm: parseInt(formData.cintura_cm),
        cadera_cm: parseInt(formData.cadera_cm),
        body_fat_pct: parseFloat(formData.body_fat_pct),
        muscle_pct: parseFloat(formData.muscle_pct),
        grasa_visceral: parseInt(formData.grasa_visceral),
        edad_metabolica: parseInt(formData.edad_metabolica),
        agua_vasos_promedio: parseInt(formData.agua_vasos_promedio),
        pasos_promedio: parseInt(formData.pasos_promedio),
        horas_sueno: parseFloat(formData.horas_sueno),
        cafeina_fuente: caffeineFormatted
      };

      // Save or update health metrics
      let savedMetrics;
      if (existingData) {
        savedMetrics = await healthMetricsService.updateHealthMetrics('inicio', metricsData);
      } else {
        savedMetrics = await healthMetricsService.createHealthMetrics(metricsData);
      }

      // Save photos
      await photosService.savePhotos('inicio', {
        foto_frente_url: photos.frente,
        foto_espalda_url: photos.espalda,
        foto_perfil_url: photos.perfil
      });

      // Mark Day 0 as completed
      await userService.updateDayZeroStatus(true);

      toast.success('¡Listo! Tu Día 0 quedó guardado. Ya puedes comenzar.');
      setCompletionStatus('Completado');
      
      // Navigate to dashboard or calendar after successful save
      setTimeout(() => {
        navigate('/dashboard');
      }, 2000);

    } catch (error) {
      console.error('Error saving Day 0 data:', error);
      toast.error('Error al guardar los datos. Por favor intenta de nuevo.');
    } finally {
      setSaving(false);
    }
  };

  const getStatusBadgeVariant = () => {
    switch (completionStatus) {
      case 'Completado':
        return 'success';
      case 'Incompleto':
        return 'warning';
      default:
        return 'secondary';
    }
  };

  const bmi = calculateBMI();

  if (loading) {
    return <Loading className="min-h-screen" />;
  }

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-3">
          <ApperIcon name="Target" className="h-8 w-8 text-primary" />
          <h1 className="text-3xl lg:text-4xl font-display font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
            Día 0 – Evaluación Inicial
          </h1>
        </div>
        
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Establece tu punto de partida. Estos datos serán comparados al final.
        </p>

        <div className="flex justify-center">
          <Badge variant={getStatusBadgeVariant()}>
            {completionStatus}
          </Badge>
        </div>
      </div>

      {/* BMI Display */}
      {bmi && (
        <Card className="p-6 bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <div className="text-center">
            <h3 className="text-lg font-semibold text-gray-800 mb-2">
              IMC Calculado
            </h3>
            <div className="text-3xl font-bold text-primary">
              {bmi}
            </div>
            <p className="text-sm text-gray-600 mt-1">
              Índice de Masa Corporal (solo informativo)
            </p>
          </div>
        </Card>
      )}

      {/* Form */}
      <div className="grid gap-8">
        {/* Physical Measurements */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ApperIcon name="Ruler" className="h-5 w-5 text-primary" />
            Medidas Físicas
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Peso (kg) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="30"
                max="300"
                value={formData.peso_kg}
                onChange={(e) => handleInputChange('peso_kg', e.target.value)}
                placeholder="72.5"
                className={errors.peso_kg ? 'border-red-500' : ''}
              />
              {errors.peso_kg && (
                <p className="text-red-500 text-xs mt-1">{errors.peso_kg}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Estatura (cm) *
              </label>
              <Input
                type="number"
                min="120"
                max="220"
                value={formData.estatura_cm}
                onChange={(e) => handleInputChange('estatura_cm', e.target.value)}
                placeholder="165"
                className={errors.estatura_cm ? 'border-red-500' : ''}
              />
              {errors.estatura_cm && (
                <p className="text-red-500 text-xs mt-1">{errors.estatura_cm}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad (años) *
              </label>
              <Input
                type="number"
                min="10"
                max="100"
                value={formData.edad_anios}
                onChange={(e) => handleInputChange('edad_anios', e.target.value)}
                placeholder="28"
                className={errors.edad_anios ? 'border-red-500' : ''}
              />
              {errors.edad_anios && (
                <p className="text-red-500 text-xs mt-1">{errors.edad_anios}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cintura (cm) *
              </label>
              <Input
                type="number"
                min="40"
                max="200"
                value={formData.cintura_cm}
                onChange={(e) => handleInputChange('cintura_cm', e.target.value)}
                placeholder="88"
                className={errors.cintura_cm ? 'border-red-500' : ''}
              />
              {errors.cintura_cm && (
                <p className="text-red-500 text-xs mt-1">{errors.cintura_cm}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Cadera (cm) *
              </label>
              <Input
                type="number"
                min="40"
                max="200"
                value={formData.cadera_cm}
                onChange={(e) => handleInputChange('cadera_cm', e.target.value)}
                placeholder="98"
                className={errors.cadera_cm ? 'border-red-500' : ''}
              />
              {errors.cadera_cm && (
                <p className="text-red-500 text-xs mt-1">{errors.cadera_cm}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Body Composition */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ApperIcon name="Activity" className="h-5 w-5 text-primary" />
            Composición Corporal
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de grasa corporal (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="0"
                max="70"
                value={formData.body_fat_pct}
                onChange={(e) => handleInputChange('body_fat_pct', e.target.value)}
                placeholder="28.5"
                className={errors.body_fat_pct ? 'border-red-500' : ''}
              />
              {errors.body_fat_pct && (
                <p className="text-red-500 text-xs mt-1">{errors.body_fat_pct}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Porcentaje de músculo (%) *
              </label>
              <Input
                type="number"
                step="0.1"
                min="10"
                max="70"
                value={formData.muscle_pct}
                onChange={(e) => handleInputChange('muscle_pct', e.target.value)}
                placeholder="32.8"
                className={errors.muscle_pct ? 'border-red-500' : ''}
              />
              {errors.muscle_pct && (
                <p className="text-red-500 text-xs mt-1">{errors.muscle_pct}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Grasa visceral *
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.grasa_visceral}
                onChange={(e) => handleInputChange('grasa_visceral', e.target.value)}
                placeholder="9"
                className={errors.grasa_visceral ? 'border-red-500' : ''}
              />
              {errors.grasa_visceral && (
                <p className="text-red-500 text-xs mt-1">{errors.grasa_visceral}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Edad metabólica (años) *
              </label>
              <Input
                type="number"
                min="10"
                max="100"
                value={formData.edad_metabolica}
                onChange={(e) => handleInputChange('edad_metabolica', e.target.value)}
                placeholder="32"
                className={errors.edad_metabolica ? 'border-red-500' : ''}
              />
              {errors.edad_metabolica && (
                <p className="text-red-500 text-xs mt-1">{errors.edad_metabolica}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Lifestyle Habits */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ApperIcon name="Heart" className="h-5 w-5 text-primary" />
            Hábitos de Vida
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promedio de vasos de agua al día *
              </label>
              <Input
                type="number"
                min="0"
                max="20"
                value={formData.agua_vasos_promedio}
                onChange={(e) => handleInputChange('agua_vasos_promedio', e.target.value)}
                placeholder="6"
                className={errors.agua_vasos_promedio ? 'border-red-500' : ''}
              />
              {errors.agua_vasos_promedio && (
                <p className="text-red-500 text-xs mt-1">{errors.agua_vasos_promedio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Promedio de pasos diarios *
              </label>
              <Input
                type="number"
                min="0"
                max="40000"
                value={formData.pasos_promedio}
                onChange={(e) => handleInputChange('pasos_promedio', e.target.value)}
                placeholder="7500"
                className={errors.pasos_promedio ? 'border-red-500' : ''}
              />
              {errors.pasos_promedio && (
                <p className="text-red-500 text-xs mt-1">{errors.pasos_promedio}</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Horas de sueño promedio *
              </label>
              <Input
                type="number"
                step="0.5"
                min="0"
                max="14"
                value={formData.horas_sueno}
                onChange={(e) => handleInputChange('horas_sueno', e.target.value)}
                placeholder="7.5"
                className={errors.horas_sueno ? 'border-red-500' : ''}
              />
              {errors.horas_sueno && (
                <p className="text-red-500 text-xs mt-1">{errors.horas_sueno}</p>
              )}
            </div>

            <div className="md:col-span-2 lg:col-span-1">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Fuente de cafeína *
              </label>
              <div className="space-y-2">
                {caffeineOptions.map(option => (
                  <label key={option.id} className="flex items-center">
                    <input
                      type="checkbox"
                      checked={formData.cafeina_fuente.includes(option.id)}
                      onChange={() => handleCaffeineChange(option.id)}
                      className="rounded border-gray-300 text-primary focus:ring-primary"
                    />
                    <span className="ml-2 text-sm text-gray-700">{option.label}</span>
                  </label>
                ))}
              </div>
              {errors.cafeina_fuente && (
                <p className="text-red-500 text-xs mt-1">{errors.cafeina_fuente}</p>
              )}
            </div>
          </div>
        </Card>

        {/* Photos */}
        <Card className="p-6">
          <h3 className="text-xl font-semibold text-gray-800 mb-6 flex items-center gap-2">
            <ApperIcon name="Camera" className="h-5 w-5 text-primary" />
            Fotos Obligatorias
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Object.entries({ frente: 'Frente', espalda: 'Espalda', perfil: 'Perfil' }).map(([key, label]) => (
              <div key={key}>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Foto de {label} *
                </label>
                
                <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-primary transition-colors">
                  {photos[key] ? (
                    <div className="space-y-2">
                      <img
                        src={photos[key]}
                        alt={`Foto de ${label}`}
                        className="w-full h-32 object-cover rounded-lg"
                      />
                      <Button
                        variant="secondary"
                        size="sm"
                        onClick={() => {
                          setPhotos(prev => ({ ...prev, [key]: null }));
                          document.getElementById(`photo-${key}`).value = '';
                        }}
                      >
                        <ApperIcon name="Trash2" className="h-4 w-4 mr-1" />
                        Eliminar
                      </Button>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <ApperIcon name="Upload" className="h-8 w-8 text-gray-400 mx-auto" />
                      <p className="text-sm text-gray-600">
                        Haz clic para subir foto de {label.toLowerCase()}
                      </p>
                    </div>
                  )}
                  
                  <input
                    id={`photo-${key}`}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handlePhotoUpload(key, e)}
                    className="hidden"
                  />
                  
                  {!photos[key] && (
                    <Button
                      variant="secondary"
                      size="sm"
                      className="mt-2"
                      onClick={() => document.getElementById(`photo-${key}`).click()}
                    >
                      Seleccionar Imagen
                    </Button>
                  )}
                </div>
                
                {errors[`foto_${key}`] && (
                  <p className="text-red-500 text-xs mt-1">{errors[`foto_${key}`]}</p>
                )}
              </div>
            ))}
          </div>
        </Card>

        {/* Save Button */}
        <div className="flex justify-center">
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="px-8 py-3 text-lg"
          >
            {saving ? (
              <>
                <ApperIcon name="Loader2" className="h-5 w-5 mr-2 animate-spin" />
                Guardando...
              </>
            ) : (
              <>
                <ApperIcon name="Save" className="h-5 w-5 mr-2" />
                Guardar Día 0
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  );
};

export default DayZero;