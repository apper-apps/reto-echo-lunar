import React, { useState } from 'react';
import ApperIcon from '@/components/ApperIcon';
import Card from '@/components/atoms/Card';
import Button from '@/components/atoms/Button';
import Input from '@/components/atoms/Input';
import Badge from '@/components/atoms/Badge';

const CreateChallengeModal = ({ onClose, onSuccess }) => {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: 'incremental',
    target: '',
    unit: '',
    difficulty: 'Fácil',
    pointsReward: '',
    duration: 7
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const difficultyOptions = [
    { value: 'Fácil', points: 25, color: 'bg-green-100 text-green-800' },
    { value: 'Medio', points: 35, color: 'bg-yellow-100 text-yellow-800' },
    { value: 'Difícil', points: 50, color: 'bg-red-100 text-red-800' }
  ];

  const typeOptions = [
    { 
      value: 'incremental', 
      label: 'Incremental', 
      description: 'Acumular cantidad específica',
      icon: 'Plus'
    },
    { 
      value: 'consecutive', 
      label: 'Consecutivo', 
      description: 'Días seguidos sin fallar',
      icon: 'Calendar'
    }
  ];

  const handleInputChange = (field, value) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Auto-set points based on difficulty
    if (field === 'difficulty') {
      const difficultyOption = difficultyOptions.find(opt => opt.value === value);
      setFormData(prev => ({ ...prev, pointsReward: difficultyOption?.points || 25 }));
    }
    
    // Clear errors when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: null }));
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) {
      newErrors.title = 'El título es obligatorio';
    }
    if (!formData.description.trim()) {
      newErrors.description = 'La descripción es obligatoria';
    }
    if (!formData.target || formData.target < 1) {
      newErrors.target = 'La meta debe ser mayor a 0';
    }
    if (!formData.unit.trim()) {
      newErrors.unit = 'La unidad es obligatoria';
    }
    if (!formData.pointsReward || formData.pointsReward < 1) {
      newErrors.pointsReward = 'Los puntos deben ser mayor a 0';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      await onSuccess({
        ...formData,
        target: parseInt(formData.target),
        pointsReward: parseInt(formData.pointsReward),
        duration: parseInt(formData.duration)
      });
    } catch (err) {
      console.error('Error creating challenge:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="font-display font-bold text-2xl text-gray-900">
              🎯 Crear Nuevo Mini-Reto
            </h2>
            <Button
              variant="ghost"
              size="sm"
              onClick={onClose}
              className="text-gray-500 hover:text-gray-700"
            >
              <ApperIcon name="X" className="h-5 w-5" />
            </Button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Title */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Título del Reto *
              </label>
              <Input
                type="text"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Ej: Semana de Ejercicio Diario"
                className={errors.title ? 'border-red-500' : ''}
              />
              {errors.title && (
                <p className="text-red-500 text-sm mt-1">{errors.title}</p>
              )}
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Descripción *
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => handleInputChange('description', e.target.value)}
                placeholder="Describe el reto y cómo completarlo..."
                rows={3}
                className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent resize-none ${
                  errors.description ? 'border-red-500' : ''
                }`}
              />
              {errors.description && (
                <p className="text-red-500 text-sm mt-1">{errors.description}</p>
              )}
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Tipo de Reto
              </label>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {typeOptions.map(type => (
                  <div
                    key={type.value}
                    className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                      formData.type === type.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('type', type.value)}
                  >
                    <div className="flex items-center space-x-3">
                      <ApperIcon name={type.icon} className="h-5 w-5 text-purple-600" />
                      <div>
                        <h4 className="font-medium text-gray-900">{type.label}</h4>
                        <p className="text-sm text-gray-600">{type.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Target and Unit */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Meta {formData.type === 'consecutive' ? '(días)' : '(cantidad)'} *
                </label>
                <Input
                  type="number"
                  min="1"
                  value={formData.target}
                  onChange={(e) => handleInputChange('target', e.target.value)}
                  placeholder={formData.type === 'consecutive' ? '7' : '100'}
                  className={errors.target ? 'border-red-500' : ''}
                />
                {errors.target && (
                  <p className="text-red-500 text-sm mt-1">{errors.target}</p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Unidad *
                </label>
                <Input
                  type="text"
                  value={formData.unit}
                  onChange={(e) => handleInputChange('unit', e.target.value)}
                  placeholder={formData.type === 'consecutive' ? 'días' : 'vasos, pasos, minutos...'}
                  className={errors.unit ? 'border-red-500' : ''}
                />
                {errors.unit && (
                  <p className="text-red-500 text-sm mt-1">{errors.unit}</p>
                )}
              </div>
            </div>

            {/* Difficulty */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Dificultad
              </label>
              <div className="grid grid-cols-3 gap-3">
                {difficultyOptions.map(option => (
                  <div
                    key={option.value}
                    className={`p-3 rounded-lg border-2 cursor-pointer transition-all text-center ${
                      formData.difficulty === option.value
                        ? 'border-purple-500 bg-purple-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                    onClick={() => handleInputChange('difficulty', option.value)}
                  >
                    <Badge className={option.color}>{option.value}</Badge>
                    <p className="text-sm text-gray-600 mt-1">{option.points} puntos</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Custom Points */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Puntos de Recompensa *
              </label>
              <Input
                type="number"
                min="1"
                value={formData.pointsReward}
                onChange={(e) => handleInputChange('pointsReward', e.target.value)}
                placeholder="25"
                className={errors.pointsReward ? 'border-red-500' : ''}
              />
              {errors.pointsReward && (
                <p className="text-red-500 text-sm mt-1">{errors.pointsReward}</p>
              )}
              <p className="text-sm text-gray-600 mt-1">
                Los puntos se otorgan automáticamente al completar el reto
              </p>
            </div>

            {/* Duration */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Duración (días)
              </label>
              <Input
                type="number"
                min="1"
                max="30"
                value={formData.duration}
                onChange={(e) => handleInputChange('duration', e.target.value)}
                placeholder="7"
              />
              <p className="text-sm text-gray-600 mt-1">
                Tiempo disponible para completar el reto
              </p>
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-4 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={onClose}
                className="flex-1"
                disabled={loading}
              >
                Cancelar
              </Button>
              <Button
                type="submit"
                className="flex-1 bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <ApperIcon name="Loader2" className="h-4 w-4 mr-2 animate-spin" />
                    Creando...
                  </>
                ) : (
                  <>
                    <ApperIcon name="Plus" className="h-4 w-4 mr-2" />
                    Crear Mini-Reto
                  </>
                )}
              </Button>
            </div>
          </form>
        </div>
      </Card>
    </div>
  );
};

export default CreateChallengeModal;