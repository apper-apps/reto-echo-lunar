import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { progressService } from '@/services/api/progressService';
import { userService } from '@/services/api/userService';
import { toast } from 'react-toastify';
import ApperIcon from '@/components/ApperIcon';
import Loading from '@/components/ui/Loading';
import Error from '@/components/ui/Error';
import Button from '@/components/atoms/Button';
import Badge from '@/components/atoms/Badge';
import Card from '@/components/atoms/Card';

const FinalistsRanking = () => {
  const navigate = useNavigate();
  const [rankings, setRankings] = useState([]);
  const [userRole, setUserRole] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recalculating, setRecalculating] = useState(false);
  const [error, setError] = useState('');
  const [lastUpdated, setLastUpdated] = useState(null);

  useEffect(() => {
    loadRankingData();
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    try {
      const role = await userService.getRoleType();
      setUserRole(role);
    } catch (error) {
      console.error('Error checking user role:', error);
    }
  };

  const loadRankingData = async () => {
    try {
      setLoading(true);
      setError('');
      
      const rankingData = await progressService.getTopRankings(50);
      setRankings(rankingData.rankings || []);
      setLastUpdated(rankingData.lastUpdated);
      
      toast.success('Ranking cargado exitosamente');
    } catch (error) {
      console.error('Error loading ranking:', error);
      setError('Error al cargar el ranking de finalistas');
      toast.error('Error al cargar el ranking');
    } finally {
      setLoading(false);
    }
  };

  const handleRecalculateRanking = async () => {
    if (userRole !== 'Coach' && userRole !== 'Admin') {
      toast.error('No tienes permisos para recalcular el ranking');
      return;
    }

    try {
      setRecalculating(true);
      
      // Trigger recalculation
      await progressService.recalculateRanking();
      
      // Reload data
      await loadRankingData();
      
      toast.success('Ranking recalculado exitosamente');
    } catch (error) {
      console.error('Error recalculating ranking:', error);
      toast.error('Error al recalcular el ranking');
    } finally {
      setRecalculating(false);
    }
  };

  const getRankingBadgeColor = (position) => {
    if (position === 1) return 'bg-gradient-to-r from-yellow-400 to-yellow-600 text-white';
    if (position === 2) return 'bg-gradient-to-r from-gray-300 to-gray-500 text-white';
    if (position === 3) return 'bg-gradient-to-r from-amber-600 to-amber-800 text-white';
    if (position <= 10) return 'bg-gradient-to-r from-blue-500 to-blue-600 text-white';
    return 'bg-gradient-to-r from-gray-100 to-gray-200 text-gray-700';
  };

  const getRankingIcon = (position) => {
    if (position === 1) return 'Crown';
    if (position === 2) return 'Medal';
    if (position === 3) return 'Award';
    return 'User';
  };

  if (loading) return <Loading />;
  if (error) return <Error message={error} onRetry={loadRankingData} />;

  return (
    <div className="space-y-6 p-4 md:p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => navigate('/progreso')}
            className="p-2 hover:bg-gray-100"
          >
            <ApperIcon name="ArrowLeft" className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Ranking de Finalistas</h1>
            <p className="text-sm text-gray-600">
              {lastUpdated && `Actualizado: ${new Date(lastUpdated).toLocaleString()}`}
            </p>
          </div>
        </div>

        {/* Recalculate Button - Only for Coach/Admin */}
        {userRole && (userRole === 'Coach' || userRole === 'Admin') && (
          <Button
            onClick={handleRecalculateRanking}
            disabled={recalculating}
            className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700"
          >
            {recalculating ? (
              <>
                <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2 animate-spin" />
                Recalculando...
              </>
            ) : (
              <>
                <ApperIcon name="RefreshCw" className="h-4 w-4 mr-2" />
                Recalcular Ranking
              </>
            )}
          </Button>
        )}
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-blue-100 to-purple-100 p-3 rounded-lg">
              <ApperIcon name="Users" className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">{rankings.length}</h3>
              <p className="text-sm text-gray-600">Total Participantes</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-emerald-100 to-green-100 p-3 rounded-lg">
              <ApperIcon name="CheckCircle" className="h-6 w-6 text-emerald-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {rankings.filter(r => r.finalRankingEligible).length}
              </h3>
              <p className="text-sm text-gray-600">Finalistas Elegibles</p>
            </div>
          </div>
        </Card>

        <Card className="p-4">
          <div className="flex items-center space-x-3">
            <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-3 rounded-lg">
              <ApperIcon name="Trophy" className="h-6 w-6 text-yellow-600" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                {rankings.filter(r => r.bonusPoints > 0).length}
              </h3>
              <p className="text-sm text-gray-600">Con Puntos Bonus</p>
            </div>
          </div>
        </Card>
      </div>

      {/* Ranking List */}
      <div className="space-y-3">
        {rankings.map((participant, index) => (
          <Card key={participant.Id} className={`p-4 transition-all hover:shadow-md ${
            participant.finalRankingEligible ? 'border-l-4 border-l-emerald-500' : 'opacity-75'
          }`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                {/* Ranking Position */}
                <div className={`flex items-center justify-center w-12 h-12 rounded-full ${getRankingBadgeColor(participant.rankingPosition)}`}>
                  <ApperIcon name={getRankingIcon(participant.rankingPosition)} className="h-6 w-6" />
                </div>

                {/* Participant Info */}
                <div className="flex-1">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-gray-900">
                      {participant.profile?.name || `Participante ${participant.Id}`}
                    </h3>
                    {!participant.finalRankingEligible && (
                      <Badge variant="secondary" className="text-xs">
                        No Elegible
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center space-x-4 mt-1">
                    <p className="text-sm text-gray-600">
                      Día: {participant.currentDay}/21
                    </p>
                    <p className="text-sm text-gray-600">
                      Racha: {participant.streakDays} días
                    </p>
                    {participant.bonusPoints > 0 && (
                      <Badge variant="default" className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                        +{participant.bonusPoints} bonus
                      </Badge>
                    )}
                  </div>
                </div>
              </div>

              {/* Points */}
              <div className="text-right">
                <div className="text-2xl font-bold text-primary">
                  {participant.totalPoints}
                </div>
                <div className="text-sm text-gray-500">
                  #{participant.rankingPosition}
                </div>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="mt-3">
              <div className="flex justify-between text-xs text-gray-500 mb-1">
                <span>Progreso del Reto</span>
                <span>{Math.round((participant.currentDay / 21) * 100)}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className="bg-gradient-to-r from-purple-500 to-blue-500 h-2 rounded-full transition-all"
                  style={{ width: `${Math.min((participant.currentDay / 21) * 100, 100)}%` }}
                ></div>
              </div>
            </div>
          </Card>
        ))}
      </div>

      {rankings.length === 0 && (
        <Card className="p-8 text-center">
          <ApperIcon name="Users" className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            No hay participantes en el ranking
          </h3>
          <p className="text-gray-600">
            Los participantes aparecerán aquí una vez que completen el Día 21.
          </p>
        </Card>
      )}
    </div>
  );
};

export default FinalistsRanking;