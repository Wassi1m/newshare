'use client';

import { useState, useEffect } from 'react';
import { SecurityDashboard } from '@/components/security/security-dashboard';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Shield, 
  AlertTriangle, 
  Lock, 
  TrendingUp, 
  RefreshCw,
  FileWarning,
  History
} from 'lucide-react';

export default function SecurityPage() {
  const [stats, setStats] = useState({
    totalScans: 0,
    threatsDetected: 0,
    threatsBlocked: 0,
    quarantinedFiles: 0,
    cleanFiles: 0,
    threatRate: 0,
    trend: 'stable' as 'up' | 'down' | 'stable',
  });

  const [recentThreats, setRecentThreats] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [period, setPeriod] = useState('7d');

  // Charger les statistiques
  const loadStats = async () => {
    setIsLoading(true);
    try {
      const [statsRes, threatsRes] = await Promise.all([
        fetch(`/api/security/stats?period=${period}`),
        fetch('/api/security/threats?limit=5'),
      ]);

      if (statsRes.ok) {
        const data = await statsRes.json();
        setStats(data.stats);
      }

      if (threatsRes.ok) {
        const data = await threatsRes.json();
        setRecentThreats(data.threats);
      }
    } catch (error) {
      console.error('Error loading security data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadStats();
  }, [period]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* En-tête */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-3">
              <Shield className="w-8 h-8 text-blue-600" />
              Centre de Sécurité
            </h1>
            <p className="text-gray-600 mt-1">
              Surveillance et protection contre les malwares en temps réel
            </p>
          </div>

          <div className="flex items-center gap-3">
            <select 
              value={period}
              onChange={(e) => setPeriod(e.target.value)}
              className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="7d">7 derniers jours</option>
              <option value="30d">30 derniers jours</option>
              <option value="all">Tout le temps</option>
            </select>

            <Button
              onClick={loadStats}
              disabled={isLoading}
              className="flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
              Actualiser
            </Button>
          </div>
        </div>

        {/* Dashboard principal */}
        {isLoading ? (
          <Card className="p-12 text-center">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-blue-600 mb-4" />
            <p className="text-gray-600">Chargement des données de sécurité...</p>
          </Card>
        ) : (
          <SecurityDashboard stats={stats} recentThreats={recentThreats} />
        )}

        {/* Onglets pour plus de détails */}
        <Tabs defaultValue="overview" className="w-full">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview" className="flex items-center gap-2">
              <Shield className="w-4 h-4" />
              Vue d'ensemble
            </TabsTrigger>
            <TabsTrigger value="threats" className="flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Menaces
            </TabsTrigger>
            <TabsTrigger value="quarantine" className="flex items-center gap-2">
              <Lock className="w-4 h-4" />
              Quarantaine
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center gap-2">
              <History className="w-4 h-4" />
              Historique
            </TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="mt-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-blue-600" />
                  Tendances de Sécurité
                </h3>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Scans cette semaine</span>
                    <span className="text-2xl font-bold text-blue-600">{stats.totalScans}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Taux de détection</span>
                    <span className="text-2xl font-bold text-red-600">{stats.threatRate.toFixed(1)}%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-sm text-gray-600">Protection active</span>
                    <span className="text-2xl font-bold text-green-600">100%</span>
                  </div>
                </div>
              </Card>

              <Card className="p-6">
                <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                  <FileWarning className="w-5 h-5 text-orange-600" />
                  Actions Recommandées
                </h3>
                <div className="space-y-3">
                  {stats.quarantinedFiles > 0 && (
                    <div className="p-3 bg-orange-50 border border-orange-200 rounded-lg">
                      <p className="text-sm font-medium text-orange-900">
                        {stats.quarantinedFiles} fichier(s) en quarantaine
                      </p>
                      <p className="text-xs text-orange-600 mt-1">
                        Examinez et supprimez les fichiers dangereux
                      </p>
                    </div>
                  )}
                  
                  {stats.threatRate > 10 && (
                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg">
                      <p className="text-sm font-medium text-red-900">
                        Taux de menaces élevé détecté
                      </p>
                      <p className="text-xs text-red-600 mt-1">
                        Renforcez la surveillance des téléchargements
                      </p>
                    </div>
                  )}

                  {stats.threatRate <= 10 && stats.quarantinedFiles === 0 && (
                    <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
                      <p className="text-sm font-medium text-green-900">
                        ✅ Tout est sous contrôle
                      </p>
                      <p className="text-xs text-green-600 mt-1">
                        Aucune action requise pour le moment
                      </p>
                    </div>
                  )}
                </div>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="threats">
            <Card className="p-6">
              <p className="text-gray-600 text-center py-12">
                Liste détaillée des menaces détectées...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="quarantine">
            <Card className="p-6">
              <p className="text-gray-600 text-center py-12">
                Fichiers en quarantaine...
              </p>
            </Card>
          </TabsContent>

          <TabsContent value="history">
            <Card className="p-6">
              <p className="text-gray-600 text-center py-12">
                Historique des scans...
              </p>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

