import React, { useState, useEffect } from "react";
import ApperIcon from "@/components/ApperIcon";
import Card from "@/components/atoms/Card";
import Button from "@/components/atoms/Button";
import Input from "@/components/atoms/Input";
import Badge from "@/components/atoms/Badge";
import Loading from "@/components/ui/Loading";
import Error from "@/components/ui/Error";
import { userService } from "@/services/api/userService";
import { toast } from "react-toastify";

const Profile = () => {
const [userData, setUserData] = useState(null);
  const [profileData, setProfileData] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notificationPreferences, setNotificationPreferences] = useState(null);
  const [showNotificationSettings, setShowNotificationSettings] = useState(false);

const loadUserData = async () => {
    try {
      setLoading(true);
      setError("");
      
      const [user, profile, notifications] = await Promise.all([
        userService.getCurrentUser(),
        userService.getUserProfile(),
        userService.getNotificationPreferences()
      ]);
      
      setUserData(user);
      setProfileData(profile);
      setEditForm(profile || {});
      setNotificationPreferences(notifications);
    } catch (err) {
      setError("Error al cargar los datos del perfil");
      console.error("Profile load error:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUserData();
  }, []);

const handleSaveProfile = async (e) => {
    e.preventDefault();
    
    try {
      await userService.updateProfile(editForm);
      await loadUserData();
      setIsEditing(false);
      toast.success("¡Perfil actualizado exitosamente!");
    } catch (err) {
      toast.error("Error al actualizar el perfil");
    }
  };

  const handleNotificationToggle = async (type) => {
    try {
      const updatedPreferences = {
        ...notificationPreferences,
        [type]: !notificationPreferences[type]
      };
      
      await userService.updateNotificationPreferences(updatedPreferences);
      setNotificationPreferences(updatedPreferences);
      toast.success("¡Configuración de notificaciones actualizada!");
    } catch (err) {
      toast.error("Error al actualizar las notificaciones");
    }
  };

  const handleTimeChange = async (moment, time) => {
    try {
      const updatedPreferences = {
        ...notificationPreferences,
        times: {
          ...notificationPreferences.times,
          [moment]: time
        }
      };
      
      await userService.updateNotificationPreferences(updatedPreferences);
      setNotificationPreferences(updatedPreferences);
      toast.success("¡Horario de recordatorio actualizado!");
    } catch (err) {
      toast.error("Error al actualizar el horario");
    }
  };

  const calculateAge = (birthDate) => {
    if (!birthDate) return "No especificada";
    const today = new Date();
    const birth = new Date(birthDate);
    let age = today.getFullYear() - birth.getFullYear();
    const monthDiff = today.getMonth() - birth.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
      age--;
    }
    
    return `${age} años`;
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadUserData} />;

  const objectives = [
    "Bajar grasa",
    "Ganar músculo", 
    "Mejorar hábitos",
    "Energía/Bienestar",
    "Otro"
  ];

  const activityLevels = [
    "Sedentario",
    "Ligero",
    "Moderado", 
    "Alto"
  ];

  const genderOptions = [
    "Femenino",
    "Masculino",
    "Prefiero no decir"
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card className="p-6 bg-gradient-to-r from-purple-600 via-blue-600 to-emerald-600 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display font-bold text-2xl lg:text-3xl mb-2">
              Mi Perfil
            </h1>
            <p className="text-purple-100">
              Gestiona tu información personal y preferencias 👤
            </p>
          </div>
          <div className="hidden md:block">
            <ApperIcon name="User" className="h-16 w-16 text-purple-200" />
          </div>
        </div>
      </Card>

      {/* Profile Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="p-6 text-center">
          <div className="bg-gradient-to-r from-purple-100 to-blue-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ApperIcon name="User" className="h-10 w-10 text-purple-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">
            {profileData?.fullName || "Usuario"}
          </h3>
          <p className="text-gray-600">{calculateAge(profileData?.birthDate)}</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="bg-gradient-to-r from-emerald-100 to-green-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ApperIcon name="Target" className="h-10 w-10 text-emerald-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Objetivo</h3>
          <p className="text-gray-600">{profileData?.objective || "No definido"}</p>
        </Card>

        <Card className="p-6 text-center">
          <div className="bg-gradient-to-r from-blue-100 to-cyan-100 w-20 h-20 rounded-full mx-auto mb-4 flex items-center justify-center">
            <ApperIcon name="Activity" className="h-10 w-10 text-blue-600" />
          </div>
          <h3 className="font-semibold text-gray-900 text-lg">Actividad</h3>
          <p className="text-gray-600">{profileData?.activityLevel || "No definido"}</p>
        </Card>
      </div>

      {/* Profile Details */}
      <Card className="p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display font-semibold text-xl">Información Personal</h2>
          <Button
            onClick={() => {
              setIsEditing(!isEditing);
              if (isEditing) {
                setEditForm(profileData || {});
              }
            }}
            variant={isEditing ? "secondary" : "primary"}
          >
            {isEditing ? (
              <>
                <ApperIcon name="X" className="h-4 w-4 mr-2" />
                Cancelar
              </>
            ) : (
              <>
                <ApperIcon name="Edit2" className="h-4 w-4 mr-2" />
                Editar
              </>
            )}
          </Button>
        </div>

        {isEditing ? (
          <form onSubmit={handleSaveProfile} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Nombre completo"
                value={editForm.fullName || ""}
                onChange={(e) => setEditForm({ ...editForm, fullName: e.target.value })}
                placeholder="Juan Pérez González"
              />

              <Input
                label="Fecha de nacimiento"
                type="date"
                value={editForm.birthDate || ""}
                onChange={(e) => setEditForm({ ...editForm, birthDate: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Sexo
                </label>
                <select
                  value={editForm.gender || ""}
                  onChange={(e) => setEditForm({ ...editForm, gender: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                >
                  <option value="">Seleccionar...</option>
                  {genderOptions.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <Input
                label="Teléfono"
                value={editForm.phone || ""}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="+52-555-123-4567"
              />

              <Input
                label="Correo electrónico"
                type="email"
                value={editForm.email || userData?.email || ""}
                onChange={(e) => setEditForm({ ...editForm, email: e.target.value })}
              />

              <Input
                label="Ciudad"
                value={editForm.city || ""}
                onChange={(e) => setEditForm({ ...editForm, city: e.target.value })}
                placeholder="Ciudad de México"
              />

              <Input
                label="Estado"
                value={editForm.state || ""}
                onChange={(e) => setEditForm({ ...editForm, state: e.target.value })}
                placeholder="CDMX"
              />

              <Input
                label="País"
                value={editForm.country || "México"}
                onChange={(e) => setEditForm({ ...editForm, country: e.target.value })}
              />

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Zona horaria
                </label>
                <select
                  value={editForm.timezone || "America/Mexico_City"}
                  onChange={(e) => setEditForm({ ...editForm, timezone: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                >
                  <option value="America/Mexico_City">México Central (CDMX)</option>
                  <option value="America/Tijuana">México Pacífico (Tijuana)</option>
                  <option value="America/Hermosillo">México Pacífico (Hermosillo)</option>
                  <option value="America/Cancun">México Este (Cancún)</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Objetivo principal
                </label>
                <select
                  value={editForm.objective || ""}
                  onChange={(e) => setEditForm({ ...editForm, objective: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                >
                  <option value="">Seleccionar...</option>
                  {objectives.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-700">
                  Nivel de actividad
                </label>
                <select
                  value={editForm.activityLevel || ""}
                  onChange={(e) => setEditForm({ ...editForm, activityLevel: e.target.value })}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                >
                  <option value="">Seleccionar...</option>
                  {activityLevels.map(option => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Condiciones de salud (opcional)
                </label>
                <textarea
                  value={editForm.healthConditions || ""}
                  onChange={(e) => setEditForm({ ...editForm, healthConditions: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-3 text-gray-900 bg-white border border-gray-200 rounded-xl transition-all duration-200 placeholder:text-gray-400 focus:outline-none focus:ring-4 focus:ring-purple-200 focus:border-primary"
                  placeholder="Describe cualquier condición médica relevante..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setIsEditing(false);
                  setEditForm(profileData || {});
                }}
              >
                Cancelar
              </Button>
              <Button type="submit">
                Guardar Cambios
              </Button>
            </div>
          </form>
        ) : (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Información básica</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="text-gray-600">Nombre:</span> {profileData?.fullName || "No especificado"}</p>
                    <p><span className="text-gray-600">Edad:</span> {calculateAge(profileData?.birthDate)}</p>
                    <p><span className="text-gray-600">Sexo:</span> {profileData?.gender || "No especificado"}</p>
                    <p><span className="text-gray-600">Teléfono:</span> {profileData?.phone || "No especificado"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Ubicación</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="text-gray-600">Ciudad:</span> {profileData?.city || "No especificada"}</p>
                    <p><span className="text-gray-600">Estado:</span> {profileData?.state || "No especificado"}</p>
                    <p><span className="text-gray-600">País:</span> {profileData?.country || "México"}</p>
                    <p><span className="text-gray-600">Zona horaria:</span> {profileData?.timezone || "America/Mexico_City"}</p>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="font-medium text-gray-900">Objetivos y actividad</h4>
                  <div className="mt-2 space-y-2 text-sm">
                    <p><span className="text-gray-600">Objetivo:</span> {profileData?.objective || "No definido"}</p>
                    <p><span className="text-gray-600">Nivel de actividad:</span> {profileData?.activityLevel || "No definido"}</p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900">Condiciones de salud</h4>
                  <p className="mt-2 text-sm text-gray-600">
                    {profileData?.healthConditions || "Ninguna condición reportada"}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* Account Settings */}
<Card className="p-6">
        <h2 className="font-display font-semibold text-xl mb-4">Configuración de Cuenta</h2>
        
        <div className="space-y-4">
          <div className="border border-gray-200 rounded-xl overflow-hidden">
            <div 
              className="flex items-center justify-between p-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setShowNotificationSettings(!showNotificationSettings)}
            >
              <div className="flex items-center space-x-4">
                <div className="bg-blue-100 p-3 rounded-lg">
                  <ApperIcon name="Bell" className="h-5 w-5 text-blue-600" />
                </div>
                <div>
                  <h4 className="font-medium text-gray-900">Notificaciones</h4>
                  <p className="text-sm text-gray-600">Configurar recordatorios y alertas</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Badge variant={notificationPreferences?.enabled ? "success" : "default"}>
                  {notificationPreferences?.enabled ? "Activo" : "Inactivo"}
                </Badge>
                <ApperIcon 
                  name={showNotificationSettings ? "ChevronUp" : "ChevronDown"} 
                  className="h-4 w-4 text-gray-400" 
                />
              </div>
            </div>

            {showNotificationSettings && notificationPreferences && (
              <div className="border-t border-gray-200 bg-gray-50 p-4">
                <div className="space-y-6">
                  {/* Master Toggle */}
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-medium text-gray-900">Habilitar notificaciones</h5>
                      <p className="text-sm text-gray-600">Activar/desactivar todas las notificaciones</p>
                    </div>
                    <button
                      onClick={() => handleNotificationToggle('enabled')}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        notificationPreferences.enabled ? 'bg-blue-600' : 'bg-gray-300'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          notificationPreferences.enabled ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  {notificationPreferences.enabled && (
                    <>
                      {/* Daily Moment Reminders */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Recordatorios de momentos diarios</h5>
                        <div className="space-y-4">
                          {[
                            { key: 'morning', label: 'Mañana', icon: 'Sunrise', color: 'yellow' },
                            { key: 'noon', label: 'Mediodía', icon: 'Sun', color: 'orange' },
                            { key: 'evening', label: 'Tarde', icon: 'Sunset', color: 'pink' },
                            { key: 'night', label: 'Noche', icon: 'Moon', color: 'purple' }
                          ].map((moment) => (
                            <div key={moment.key} className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                              <div className="flex items-center space-x-3">
                                <div className={`bg-${moment.color}-100 p-2 rounded-lg`}>
                                  <ApperIcon name={moment.icon} className={`h-4 w-4 text-${moment.color}-600`} />
                                </div>
                                <div>
                                  <span className="font-medium text-gray-900">{moment.label}</span>
                                  <p className="text-xs text-gray-600">Recordatorio de reflexión</p>
                                </div>
                              </div>
                              <div className="flex items-center space-x-3">
                                <Input
                                  type="time"
                                  value={notificationPreferences.times[moment.key] || ''}
                                  onChange={(e) => handleTimeChange(moment.key, e.target.value)}
                                  className="w-20 h-8 text-sm"
                                  disabled={!notificationPreferences.dailyMoments[moment.key]}
                                />
                                <button
                                  onClick={() => handleNotificationToggle(`dailyMoments.${moment.key}`)}
                                  className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                                    notificationPreferences.dailyMoments[moment.key] ? 'bg-blue-600' : 'bg-gray-300'
                                  }`}
                                >
                                  <span
                                    className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                      notificationPreferences.dailyMoments[moment.key] ? 'translate-x-5' : 'translate-x-1'
                                    }`}
                                  />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Habit Completion Alerts */}
                      <div>
                        <h5 className="font-medium text-gray-900 mb-3">Alertas de hábitos</h5>
                        <div className="flex items-center justify-between p-3 bg-white rounded-lg border border-gray-200">
                          <div className="flex items-center space-x-3">
                            <div className="bg-green-100 p-2 rounded-lg">
                              <ApperIcon name="CheckCircle" className="h-4 w-4 text-green-600" />
                            </div>
                            <div>
                              <span className="font-medium text-gray-900">Completar hábitos</span>
                              <p className="text-xs text-gray-600">Notificaciones de progreso</p>
                            </div>
                          </div>
                          <button
                            onClick={() => handleNotificationToggle('habitCompletion')}
                            className={`relative inline-flex h-5 w-9 items-center rounded-full transition-colors ${
                              notificationPreferences.habitCompletion ? 'bg-blue-600' : 'bg-gray-300'
                            }`}
                          >
                            <span
                              className={`inline-block h-3 w-3 transform rounded-full bg-white transition-transform ${
                                notificationPreferences.habitCompletion ? 'translate-x-5' : 'translate-x-1'
                              }`}
                            />
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              </div>
            )}
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-green-100 p-3 rounded-lg">
                <ApperIcon name="Shield" className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Privacidad de datos</h4>
                <p className="text-sm text-gray-600">Consentimiento de uso de datos</p>
              </div>
            </div>
            <Badge variant="success">Otorgado</Badge>
          </div>

          <div className="flex items-center justify-between p-4 border border-gray-200 rounded-xl">
            <div className="flex items-center space-x-4">
              <div className="bg-purple-100 p-3 rounded-lg">
                <ApperIcon name="Camera" className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-medium text-gray-900">Uso de imágenes</h4>
                <p className="text-sm text-gray-600">Consentimiento para fotos de progreso</p>
              </div>
            </div>
            <Badge variant="success">Otorgado</Badge>
          </div>
        </div>
      </Card>

      {/* Danger Zone */}
      <Card className="p-6 border-red-200">
        <h2 className="font-display font-semibold text-xl mb-4 text-red-900">Zona de Peligro</h2>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div>
              <h4 className="font-medium text-red-900">Descargar mis datos</h4>
              <p className="text-sm text-red-700">Exportar toda tu información en formato CSV</p>
            </div>
            <Button variant="secondary" size="sm">
              <ApperIcon name="Download" className="h-4 w-4 mr-2" />
              Descargar
            </Button>
          </div>

          <div className="flex items-center justify-between p-4 bg-red-50 border border-red-200 rounded-xl">
            <div>
              <h4 className="font-medium text-red-900">Eliminar cuenta</h4>
              <p className="text-sm text-red-700">Eliminar permanentemente tu cuenta y todos los datos</p>
            </div>
            <Button variant="danger" size="sm">
              <ApperIcon name="Trash2" className="h-4 w-4 mr-2" />
              Eliminar
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default Profile;