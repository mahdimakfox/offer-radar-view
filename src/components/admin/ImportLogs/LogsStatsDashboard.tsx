
import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { TrendingUp, TrendingDown, Activity, AlertTriangle, CheckCircle, Clock } from 'lucide-react';

interface ImportLog {
  id: string;
  category: string;
  total_providers: number;
  successful_imports: number;
  failed_imports: number;
  import_status: string;
  error_details: any;
  created_at: string;
}

interface LogsStatsDashboardProps {
  logs: ImportLog[];
}

const LogsStatsDashboard: React.FC<LogsStatsDashboardProps> = ({ logs }) => {
  const calculateStats = () => {
    const totalImports = logs.length;
    const completedImports = logs.filter(log => log.import_status === 'completed').length;
    const failedImports = logs.filter(log => log.import_status === 'failed').length;
    const inProgressImports = logs.filter(log => log.import_status === 'in_progress').length;
    
    const totalProviders = logs.reduce((sum, log) => sum + log.total_providers, 0);
    const totalSuccessful = logs.reduce((sum, log) => sum + log.successful_imports, 0);
    const totalFailed = logs.reduce((sum, log) => sum + log.failed_imports, 0);
    
    const successRate = totalProviders > 0 ? Math.round((totalSuccessful / totalProviders) * 100) : 0;
    
    // Recent performance (last 10 imports)
    const recentLogs = logs.slice(0, 10);
    const recentSuccessRate = recentLogs.length > 0 
      ? Math.round((recentLogs.reduce((sum, log) => sum + log.successful_imports, 0) / 
          recentLogs.reduce((sum, log) => sum + log.total_providers, 0)) * 100) || 0
      : 0;
    
    // Category breakdown
    const categoryStats = logs.reduce((acc, log) => {
      if (!acc[log.category]) {
        acc[log.category] = { total: 0, successful: 0, failed: 0 };
      }
      acc[log.category].total += log.total_providers;
      acc[log.category].successful += log.successful_imports;
      acc[log.category].failed += log.failed_imports;
      return acc;
    }, {} as Record<string, { total: number; successful: number; failed: number }>);

    return {
      totalImports,
      completedImports,
      failedImports,
      inProgressImports,
      totalProviders,
      totalSuccessful,
      totalFailed,
      successRate,
      recentSuccessRate,
      categoryStats
    };
  };

  const stats = calculateStats();

  const getSuccessRateColor = (rate: number) => {
    if (rate >= 90) return 'text-green-600';
    if (rate >= 70) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getSuccessRateBadgeVariant = (rate: number) => {
    if (rate >= 90) return 'default';
    if (rate >= 70) return 'secondary';
    return 'destructive';
  };

  return (
    <div className="space-y-6">
      {/* Main Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Imports</p>
                <p className="text-2xl font-bold">{stats.totalImports}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <CheckCircle className="h-4 w-4 text-green-600 mr-1" />
              <span className="text-green-600">{stats.completedImports} completed</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Success Rate</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(stats.successRate)}`}>
                  {stats.successRate}%
                </p>
              </div>
              <TrendingUp className={`h-8 w-8 ${getSuccessRateColor(stats.successRate)}`} />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-600">
                {stats.totalSuccessful} / {stats.totalProviders} providers
              </span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Recent Performance</p>
                <p className={`text-2xl font-bold ${getSuccessRateColor(stats.recentSuccessRate)}`}>
                  {stats.recentSuccessRate}%
                </p>
              </div>
              <Clock className={`h-8 w-8 ${getSuccessRateColor(stats.recentSuccessRate)}`} />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-600">Last 10 imports</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Failed Imports</p>
                <p className="text-2xl font-bold text-red-600">{stats.failedImports}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-red-600" />
            </div>
            <div className="flex items-center mt-2 text-sm">
              <span className="text-gray-600">
                {stats.totalFailed} failed providers
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Category Breakdown */}
      {Object.keys(stats.categoryStats).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Category Performance</CardTitle>
            <CardDescription>
              Import success rates by category
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(stats.categoryStats).map(([category, data]) => {
                const categoryRate = data.total > 0 ? Math.round((data.successful / data.total) * 100) : 0;
                return (
                  <div key={category} className="bg-gray-50 p-4 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold capitalize">{category}</h4>
                      <Badge variant={getSuccessRateBadgeVariant(categoryRate)}>
                        {categoryRate}%
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-sm">
                      <div>
                        <p className="text-gray-600">Total</p>
                        <p className="font-semibold">{data.total}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Success</p>
                        <p className="font-semibold text-green-600">{data.successful}</p>
                      </div>
                      <div>
                        <p className="text-gray-600">Failed</p>
                        <p className="font-semibold text-red-600">{data.failed}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Status Overview */}
      <Card>
        <CardHeader>
          <CardTitle>Import Status Overview</CardTitle>
          <CardDescription>
            Current status distribution of all imports
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <CheckCircle className="h-8 w-8 text-green-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-green-600">{stats.completedImports}</p>
              <p className="text-sm text-gray-600">Completed</p>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-red-600">{stats.failedImports}</p>
              <p className="text-sm text-gray-600">Failed</p>
            </div>
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <Clock className="h-8 w-8 text-blue-600 mx-auto mb-2" />
              <p className="text-2xl font-bold text-blue-600">{stats.inProgressImports}</p>
              <p className="text-sm text-gray-600">In Progress</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LogsStatsDashboard;
