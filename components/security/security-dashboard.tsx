'use client';

import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Shield,
  AlertTriangle,
  CheckCircle,
  Lock,
  TrendingUp,
  TrendingDown,
  Clock,
  FileWarning,
  Ban,
  Eye,
} from 'lucide-react';

interface SecurityStats {
  totalScans: number;
  threatsDetected: number;
  threatsBlocked: number;
  quarantinedFiles: number;
  cleanFiles: number;
  lastScanTime?: Date;
  threatRate: number; // Pourcentage
  trend: 'up' | 'down' | 'stable';
}

interface RecentThreat {
  id: string;
  fileName: string;
  threatLevel: 'critical' | 'high' | 'medium' | 'low';
  confidence: number;
  timestamp: Date;
  status: 'blocked' | 'quarantined' | 'investigating';
}

interface SecurityDashboardProps {
  stats: SecurityStats;
  recentThreats?: RecentThreat[];
}

export function SecurityDashboard({ stats, recentThreats = [] }: SecurityDashboardProps) {
  const threatLevelColors = {
    critical: 'bg-red-600',
    high: 'bg-orange-600',
    medium: 'bg-yellow-600',
    low: 'bg-blue-600',
  };

  const statusColors = {
    blocked: 'bg-red-100 text-red-800 border-red-300',
    quarantined: 'bg-orange-100 text-orange-800 border-orange-300',
    investigating: 'bg-yellow-100 text-yellow-800 border-yellow-300',
  };

  const TrendIcon = stats.trend === 'up' ? TrendingUp : stats.trend === 'down' ? TrendingDown : Clock;
  const trendColor = stats.trend === 'up' ? 'text-red-600' : stats.trend === 'down' ? 'text-green-600' : 'text-gray-600';

  return (
    <div className="space-y-6">
      {/* En-tête avec statistiques globales */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total des scans */}
        <Card className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 border-blue-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-blue-600 font-medium">Total Scans</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{stats.totalScans}</p>
            </div>
            <div className="p-3 bg-blue-500 rounded-full">
              <Shield className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Menaces détectées */}
        <Card className="p-6 bg-gradient-to-br from-red-50 to-red-100 border-red-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-red-600 font-medium">Menaces Détectées</p>
              <p className="text-3xl font-bold text-red-900 mt-2">{stats.threatsDetected}</p>
              <div className="flex items-center gap-1 mt-1">
                <TrendIcon className={`w-4 h-4 ${trendColor}`} />
                <span className={`text-xs ${trendColor}`}>{stats.threatRate.toFixed(1)}%</span>
              </div>
            </div>
            <div className="p-3 bg-red-500 rounded-full animate-pulse">
              <AlertTriangle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Fichiers en quarantaine */}
        <Card className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 border-orange-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-orange-600 font-medium">En Quarantaine</p>
              <p className="text-3xl font-bold text-orange-900 mt-2">{stats.quarantinedFiles}</p>
            </div>
            <div className="p-3 bg-orange-500 rounded-full">
              <Lock className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>

        {/* Fichiers sûrs */}
        <Card className="p-6 bg-gradient-to-br from-green-50 to-green-100 border-green-300">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-green-600 font-medium">Fichiers Sûrs</p>
              <p className="text-3xl font-bold text-green-900 mt-2">{stats.cleanFiles}</p>
            </div>
            <div className="p-3 bg-green-500 rounded-full">
              <CheckCircle className="w-6 h-6 text-white" />
            </div>
          </div>
        </Card>
      </div>

      {/* Taux de détection */}
      <Card className="p-6">
        <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
          <Shield className="w-5 h-5 text-blue-600" />
          Taux de Protection
        </h3>
        
        <div className="space-y-4">
          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Menaces Bloquées</span>
              <span className="text-sm font-bold text-green-600">
                {stats.threatsBlocked} / {stats.threatsDetected}
              </span>
            </div>
            <Progress 
              value={(stats.threatsBlocked / (stats.threatsDetected || 1)) * 100} 
              className="h-3"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Taux de Menaces</span>
              <span className="text-sm font-bold text-red-600">{stats.threatRate.toFixed(2)}%</span>
            </div>
            <Progress 
              value={stats.threatRate} 
              className="h-3 bg-red-100"
            />
          </div>

          <div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium text-gray-700">Fichiers Sécurisés</span>
              <span className="text-sm font-bold text-green-600">
                {((stats.cleanFiles / (stats.totalScans || 1)) * 100).toFixed(2)}%
              </span>
            </div>
            <Progress 
              value={(stats.cleanFiles / (stats.totalScans || 1)) * 100} 
              className="h-3"
            />
          </div>
        </div>
      </Card>

      {/* Menaces récentes */}
      {recentThreats.length > 0 && (
        <Card className="p-6">
          <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-red-600" />
            Menaces Récentes
            <Badge className="ml-2 bg-red-600">{recentThreats.length}</Badge>
          </h3>

          <div className="space-y-3">
            {recentThreats.map((threat) => (
              <div
                key={threat.id}
                className="p-4 border rounded-lg hover:shadow-md transition-shadow bg-white"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3 flex-1">
                    <div className={`w-2 h-full ${threatLevelColors[threat.threatLevel]} rounded`} />
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <FileWarning className="w-4 h-4 text-red-600" />
                        <span className="font-medium text-sm">{threat.fileName}</span>
                        <Badge 
                          variant="outline" 
                          className={`text-xs ${statusColors[threat.status]}`}
                        >
                          {threat.status === 'blocked' && '🚫 Bloqué'}
                          {threat.status === 'quarantined' && '🔒 Quarantaine'}
                          {threat.status === 'investigating' && '🔍 En analyse'}
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-4 text-xs text-gray-500">
                        <span>
                          Niveau: <strong className="text-red-600">{threat.threatLevel.toUpperCase()}</strong>
                        </span>
                        <span>
                          Confiance: <strong>{(threat.confidence * 100).toFixed(1)}%</strong>
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {new Date(threat.timestamp).toLocaleString('fr-FR')}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2">
                    {threat.status === 'blocked' && (
                      <Badge className="bg-red-600">
                        <Ban className="w-3 h-3 mr-1" />
                        Bloqué
                      </Badge>
                    )}
                    {threat.status === 'quarantined' && (
                      <Badge className="bg-orange-600">
                        <Lock className="w-3 h-3 mr-1" />
                        Quarantaine
                      </Badge>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Statut en temps réel */}
      <Card className="p-6 bg-gradient-to-r from-purple-50 to-pink-50 border-purple-200">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse" />
              <div className="absolute inset-0 w-3 h-3 bg-green-500 rounded-full animate-ping" />
            </div>
            <div>
              <h4 className="font-bold text-gray-900">Système de Protection Actif</h4>
              <p className="text-sm text-gray-600">
                Dernier scan: {stats.lastScanTime ? new Date(stats.lastScanTime).toLocaleString('fr-FR') : 'N/A'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <Eye className="w-5 h-5 text-purple-600" />
            <span className="text-sm font-medium text-purple-600">Surveillance Active</span>
          </div>
        </div>
      </Card>
    </div>
  );
}

