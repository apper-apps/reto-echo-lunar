import React, { useEffect, useState } from "react";
import { coachService } from "@/services/api/coachService";
import { notificationService } from "@/services/api/notificationService";
import { miniChallengeService } from "@/services/api/miniChallengeService";
import { habitService } from "@/services/api/habitService";
import { userService } from "@/services/api/userService";
import { toast } from "react-toastify";
import ApperIcon from "@/components/ApperIcon";
import Error from "@/components/ui/Error";
import Loading from "@/components/ui/Loading";
import Button from "@/components/atoms/Button";
import Badge from "@/components/atoms/Badge";
import Card from "@/components/atoms/Card";

const CoachDashboard = () => {
  const [coachData, setCoachData] = useState(null);
  const [groupStats, setGroupStats] = useState(null);
  const [participants, setParticipants] = useState([]);
  const [recommendations, setRecommendations] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState('overview');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showNotificationModal, setShowNotificationModal] = useState(false);
  const [showRecommendationModal, setShowRecommendationModal] = useState(false);
  // Form states
  const [newRecommendation, setNewRecommendation] = useState({
    title: '',
    description: '',
    category: 'general',
    targetGroup: 'all'
  });
  const [newNotification, setNewNotification] = useState({
    title: '',
    message: '',
    type: 'info',
    targetUsers: 'all'
  });
  const [newChallenge, setNewChallenge] = useState({
    title: '',
    description: '',
    type: 'daily',
    target: 1,
    duration: 1,
    pointsReward: 10
  });

  useEffect(() => {
    loadCoachData();
  }, []);

const loadCoachData = async () => {
    try {
      setLoading(true);
      setError(null);

      const [coachUser, stats, participantsList, recommendationsList, notificationsList] = await Promise.all([
        userService.getCurrentUser(),
        coachService.getGroupStats(),
        coachService.getAllParticipants(),
        coachService.getRecommendations(),
        notificationService.getRecentNotifications()
      ]);

      setCoachData(coachUser);
      setGroupStats(stats);
      setParticipants(participantsList);
      setRecommendations(recommendationsList);
      setNotifications(notificationsList);
    } catch (err) {
      console.error('Error loading coach data:', err);
      setError('Error al cargar los datos del coach');
      toast.error('Error al cargar los datos');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateRecommendation = async () => {
    try {
      if (!newRecommendation.title.trim() || !newRecommendation.description.trim()) {
        toast.error('Título y descripción son obligatorios');
        return;
      }

      const recommendation = await coachService.createRecommendation(newRecommendation);
      setRecommendations(prev => [recommendation, ...prev]);
      setNewRecommendation({ title: '', description: '', category: 'general', targetGroup: 'all' });
      setShowRecommendationModal(false);
      toast.success('Recomendación creada exitosamente');
    } catch (err) {
      console.error('Error creating recommendation:', err);
      toast.error('Error al crear la recomendación');
    }
  };

  const handleSendNotification = async () => {
    try {
      if (!newNotification.title.trim() || !newNotification.message.trim()) {
        toast.error('Título y mensaje son obligatorios');
        return;
      }

      const notification = await notificationService.sendNotification(newNotification);
      setNotifications(prev => [notification, ...prev]);
      setNewNotification({ title: '', message: '', type: 'info', targetUsers: 'all' });
      setShowNotificationModal(false);
      toast.success('Notificación enviada exitosamente');
    } catch (err) {
      console.error('Error sending notification:', err);
      toast.error('Error al enviar la notificación');
    }
  };

  const handleCreateChallenge = async () => {
    try {
      if (!newChallenge.title.trim() || !newChallenge.description.trim()) {
        toast.error('Título y descripción son obligatorios');
        return;
      }

      let challenge;
      if (newChallenge.type === 'daily') {
        challenge = await habitService.createHabit({
          name: newChallenge.title,
          category: 'coach-challenge',
          target: newChallenge.target,
          unit: 'veces'
        });
      } else {
        challenge = await miniChallengeService.createChallenge({
          title: newChallenge.title,
          description: newChallenge.description,
          target: newChallenge.target,
          duration: newChallenge.duration,
          pointsReward: newChallenge.pointsReward
        });
      }

      setNewChallenge({ title: '', description: '', type: 'daily', target: 1, duration: 1, pointsReward: 10 });
      setShowCreateModal(false);
      toast.success(`${newChallenge.type === 'daily' ? 'Reto diario' : 'Mini-reto'} creado exitosamente`);
      
      // Reload data to show new challenge
      loadCoachData();
    } catch (err) {
      console.error('Error creating challenge:', err);
      toast.error('Error al crear el reto');
    }
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadCoachData} />;

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-emerald-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
<div className="mb-8">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 font-display">
                ¡Hola, Coach {coachData?.profile?.fullName?.split(' ')[0] || 'Entrenador'}! 👋
              </h1>
              <p className="text-gray-600 mt-2">Gestiona tu grupo y monitorea el progreso</p>
            </div>
            <div className="flex gap-3">
              <Button 
                onClick={() => setShowRecommendationModal(true)}
                className="bg-blue-600 hover:bg-blue-700"
              >
                <ApperIcon name="MessageCircle" size={16} />
                Nueva Recomendación
              </Button>
              <Button 
                onClick={() => setShowNotificationModal(true)}
                className="bg-green-600 hover:bg-green-700"
              >
                <ApperIcon name="Bell" size={16} />
                Enviar Notificación
              </Button>
              <Button 
                onClick={() => setShowCreateModal(true)}
                className="bg-purple-600 hover:bg-purple-700"
              >
                <ApperIcon name="Plus" size={16} />
                Crear Reto
              </Button>
            </div>
          </div>
        </div>

        {/* Stats Overview */}
        {groupStats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Participantes</p>
                  <p className="text-2xl font-bold text-gray-900">{groupStats.totalParticipants}</p>
                </div>
                <div className="p-3 bg-blue-100 rounded-full">
                  <ApperIcon name="Users" size={20} className="text-blue-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Adherencia Promedio</p>
                  <p className="text-2xl font-bold text-gray-900">{groupStats.averageAdherence}%</p>
                </div>
                <div className="p-3 bg-green-100 rounded-full">
                  <ApperIcon name="TrendingUp" size={20} className="text-green-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Participantes Activos</p>
                  <p className="text-2xl font-bold text-gray-900">{groupStats.activeParticipants}</p>
                </div>
                <div className="p-3 bg-purple-100 rounded-full">
                  <ApperIcon name="Activity" size={20} className="text-purple-600" />
                </div>
              </div>
            </Card>

            <Card className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Retos Completados</p>
                  <p className="text-2xl font-bold text-gray-900">{groupStats.completedChallenges}</p>
                </div>
                <div className="p-3 bg-yellow-100 rounded-full">
                  <ApperIcon name="Trophy" size={20} className="text-yellow-600" />
                </div>
              </div>
            </Card>
          </div>
        )}

        {/* Tabs */}
        <div className="mb-6">
          <div className="flex gap-2 p-1 bg-white rounded-lg shadow-sm">
            {[
              { id: 'overview', label: 'Resumen', icon: 'BarChart3' },
              { id: 'participants', label: 'Participantes', icon: 'Users' },
              { id: 'recommendations', label: 'Recomendaciones', icon: 'MessageCircle' },
              { id: 'notifications', label: 'Notificaciones', icon: 'Bell' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                  activeTab === tab.id
                    ? 'bg-purple-100 text-purple-700 shadow-sm'
                    : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
                }`}
              >
                <ApperIcon name={tab.icon} size={16} />
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            {/* Top Performers */}
            <Card className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <ApperIcon name="Award" size={20} />
                Mejores Participantes
              </h3>
              <div className="space-y-3">
                {participants.slice(0, 5).map((participant, index) => (
                  <div key={participant.Id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                        index === 0 ? 'bg-yellow-100 text-yellow-800' :
                        index === 1 ? 'bg-gray-100 text-gray-800' :
                        index === 2 ? 'bg-orange-100 text-orange-800' :
                        'bg-blue-100 text-blue-800'
                      }`}>
                        {index + 1}
                      </div>
                      <div>
                        <p className="font-medium text-gray-900">{participant.profile?.fullName || 'Usuario'}</p>
                        <p className="text-sm text-gray-600">Día {participant.currentDay}/21</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-gray-900">{participant.totalPoints} pts</p>
                      <p className="text-sm text-gray-600">{participant.adherencePercentage}% adherencia</p>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        )}

        {activeTab === 'participants' && (
          <Card className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Lista de Participantes</h3>
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Participante</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Progreso</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Adherencia</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Puntos</th>
                    <th className="text-left py-3 px-4 font-medium text-gray-600">Estado</th>
                  </tr>
                </thead>
                <tbody>
                  {participants.map((participant) => (
                    <tr key={participant.Id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium text-gray-900">{participant.profile?.fullName || 'Usuario'}</p>
                          <p className="text-sm text-gray-600">{participant.email}</p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="flex-1 bg-gray-200 rounded-full h-2">
                            <div 
                              className="bg-purple-600 h-2 rounded-full" 
                              style={{ width: `${(participant.currentDay / 21) * 100}%` }}
                            ></div>
                          </div>
                          <span className="text-sm text-gray-600">{participant.currentDay}/21</span>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <span className={`text-sm font-medium ${
                          participant.adherencePercentage >= 80 ? 'text-green-600' :
                          participant.adherencePercentage >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>
                          {participant.adherencePercentage}%
                        </span>
                      </td>
                      <td className="py-3 px-4">
                        <span className="font-medium text-gray-900">{participant.totalPoints}</span>
                      </td>
                      <td className="py-3 px-4">
                        <Badge variant={participant.currentDay > 0 ? 'success' : 'secondary'}>
                          {participant.currentDay > 0 ? 'Activo' : 'Pendiente'}
                        </Badge>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        )}

        {activeTab === 'recommendations' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Recomendaciones</h3>
              <Button onClick={() => setShowRecommendationModal(true)} size="sm">
                <ApperIcon name="Plus" size={16} />
                Nueva
              </Button>
            </div>
            <div className="space-y-4">
              {recommendations.map((recommendation) => (
                <div key={recommendation.Id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{recommendation.title}</h4>
                      <p className="text-gray-600 mt-1">{recommendation.description}</p>
                      <div className="flex items-center gap-4 mt-3">
                        <Badge variant="outline">{recommendation.category}</Badge>
                        <span className="text-sm text-gray-500">{recommendation.targetGroup}</span>
                        <span className="text-sm text-gray-500">{new Date(recommendation.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {recommendations.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay recomendaciones aún. Crea la primera.
                </div>
              )}
            </div>
          </Card>
        )}

        {activeTab === 'notifications' && (
          <Card className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-900">Notificaciones Recientes</h3>
              <Button onClick={() => setShowNotificationModal(true)} size="sm">
                <ApperIcon name="Plus" size={16} />
                Enviar
              </Button>
            </div>
            <div className="space-y-4">
              {notifications.map((notification) => (
                <div key={notification.Id} className="p-4 border border-gray-200 rounded-lg">
                  <div className="flex items-start gap-3">
                    <div className={`p-2 rounded-full ${
                      notification.type === 'success' ? 'bg-green-100' :
                      notification.type === 'warning' ? 'bg-yellow-100' :
                      notification.type === 'error' ? 'bg-red-100' : 'bg-blue-100'
                    }`}>
                      <ApperIcon name={
                        notification.type === 'success' ? 'CheckCircle' :
                        notification.type === 'warning' ? 'AlertTriangle' :
                        notification.type === 'error' ? 'XCircle' : 'Info'
                      } size={16} className={
                        notification.type === 'success' ? 'text-green-600' :
                        notification.type === 'warning' ? 'text-yellow-600' :
                        notification.type === 'error' ? 'text-red-600' : 'text-blue-600'
                      } />
                    </div>
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{notification.title}</h4>
                      <p className="text-gray-600 mt-1">{notification.message}</p>
                      <div className="flex items-center gap-4 mt-2">
                        <span className="text-sm text-gray-500">{notification.targetUsers}</span>
                        <span className="text-sm text-gray-500">{new Date(notification.createdAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
              {notifications.length === 0 && (
                <div className="text-center py-8 text-gray-500">
                  No hay notificaciones recientes.
                </div>
              )}
            </div>
          </Card>
        )}
      </div>

      {/* Create Recommendation Modal */}
      {showRecommendationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Nueva Recomendación</h3>
              <button 
                onClick={() => setShowRecommendationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newRecommendation.title}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título de la recomendación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newRecommendation.description}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe la recomendación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Categoría</label>
                <select
                  value={newRecommendation.category}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="general">General</option>
                  <option value="nutrition">Nutrición</option>
                  <option value="exercise">Ejercicio</option>
                  <option value="habits">Hábitos</option>
                  <option value="motivation">Motivación</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dirigido a</label>
                <select
                  value={newRecommendation.targetGroup}
                  onChange={(e) => setNewRecommendation(prev => ({ ...prev, targetGroup: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todo el grupo</option>
                  <option value="beginners">Principiantes</option>
                  <option value="advanced">Avanzados</option>
                  <option value="struggling">Con dificultades</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setShowRecommendationModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateRecommendation} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
              >
                Crear
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Send Notification Modal */}
      {showNotificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Enviar Notificación</h3>
              <button 
                onClick={() => setShowNotificationModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newNotification.title}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título de la notificación"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Mensaje</label>
                <textarea
                  value={newNotification.message}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, message: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Escribe tu mensaje"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newNotification.type}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="info">Información</option>
                  <option value="success">Éxito</option>
                  <option value="warning">Advertencia</option>
                  <option value="error">Error</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Destinatarios</label>
                <select
                  value={newNotification.targetUsers}
                  onChange={(e) => setNewNotification(prev => ({ ...prev, targetUsers: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="all">Todos los participantes</option>
                  <option value="active">Solo activos</option>
                  <option value="inactive">Solo inactivos</option>
                  <option value="top-performers">Mejores participantes</option>
                </select>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setShowNotificationModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleSendNotification} 
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                Enviar
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Create Challenge Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Crear Nuevo Reto</h3>
              <button 
                onClick={() => setShowCreateModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <ApperIcon name="X" size={20} />
              </button>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Título</label>
                <input
                  type="text"
                  value={newChallenge.title}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  placeholder="Título del reto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Descripción</label>
                <textarea
                  value={newChallenge.description}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  rows={3}
                  placeholder="Describe el reto"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Tipo</label>
                <select
                  value={newChallenge.type}
                  onChange={(e) => setNewChallenge(prev => ({ ...prev, type: e.target.value }))}
                  className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                >
                  <option value="daily">Reto Diario</option>
                  <option value="weekly">Mini-reto Semanal</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Meta</label>
                  <input
                    type="number"
                    value={newChallenge.target}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, target: parseInt(e.target.value) || 1 }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="1"
                  />
                </div>
                {newChallenge.type === 'weekly' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">Duración (días)</label>
                    <input
                      type="number"
                      value={newChallenge.duration}
                      onChange={(e) => setNewChallenge(prev => ({ ...prev, duration: parseInt(e.target.value) || 1 }))}
                      className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                      min="1"
                      max="7"
                    />
                  </div>
                )}
              </div>
              {newChallenge.type === 'weekly' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Puntos de Recompensa</label>
                  <input
                    type="number"
                    value={newChallenge.pointsReward}
                    onChange={(e) => setNewChallenge(prev => ({ ...prev, pointsReward: parseInt(e.target.value) || 10 }))}
                    className="w-full p-3 border border-gray-200 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    min="5"
                    step="5"
                  />
                </div>
              )}
            </div>
            <div className="flex gap-3 mt-6">
              <Button 
                onClick={() => setShowCreateModal(false)} 
                variant="outline" 
                className="flex-1"
              >
                Cancelar
              </Button>
              <Button 
                onClick={handleCreateChallenge} 
                className="flex-1 bg-purple-600 hover:bg-purple-700"
              >
                Crear
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CoachDashboard;