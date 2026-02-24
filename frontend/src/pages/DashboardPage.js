import React, { useEffect, useState } from 'react';
import { dashboardAPI } from '@/lib/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, ShoppingBag, Clock, CheckCircle, DollarSign } from 'lucide-react';

export default function DashboardPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await dashboardAPI.getStats();
      setStats(res.data);
    } catch (err) {
      console.error('Error loading stats:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full" />
      </div>
    );
  }

  const statCards = [
    {
      title: 'Klientë Gjithsej',
      value: stats?.total_clients || 0,
      icon: Users,
      color: 'text-blue-600',
      bg: 'bg-blue-50',
    },
    {
      title: 'Porosi Gjithsej',
      value: stats?.total_orders || 0,
      icon: ShoppingBag,
      color: 'text-sky-600',
      bg: 'bg-sky-50',
    },
    {
      title: 'Në Pritje',
      value: stats?.pending_orders || 0,
      icon: Clock,
      color: 'text-amber-600',
      bg: 'bg-amber-50',
    },
    {
      title: 'Të Përfunduara',
      value: stats?.completed_orders || 0,
      icon: CheckCircle,
      color: 'text-emerald-600',
      bg: 'bg-emerald-50',
    },
    {
      title: 'Të Ardhura Gjithsej',
      value: `${(stats?.total_revenue || 0).toLocaleString('sq-AL')} Lekë`,
      icon: DollarSign,
      color: 'text-violet-600',
      bg: 'bg-violet-50',
      wide: true,
    },
  ];

  return (
    <div data-testid="dashboard-page">
      <div className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight text-zinc-900 font-['Outfit']" data-testid="dashboard-title">
          Pasqyra
        </h1>
        <p className="text-zinc-500 mt-1">Përshëndetje! Ja një përmbledhje e aktivitetit tuaj.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8" data-testid="stats-grid">
        {statCards.map((stat, i) => (
          <Card
            key={i}
            className={`bg-white border border-zinc-200 shadow-sm rounded-xl hover:shadow-md transition-all duration-200 ${stat.wide ? 'sm:col-span-2 lg:col-span-1' : ''}`}
            data-testid={`stat-card-${i}`}
          >
            <CardContent className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className={`w-10 h-10 rounded-lg ${stat.bg} flex items-center justify-center`}>
                  <stat.icon className={`w-5 h-5 ${stat.color}`} />
                </div>
              </div>
              <p className="text-sm text-zinc-500 font-medium">{stat.title}</p>
              <p className="text-2xl font-bold text-zinc-900 mt-1 font-['Outfit']">{stat.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Orders */}
      <Card className="bg-white border border-zinc-200 shadow-sm rounded-xl" data-testid="recent-orders-card">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg font-semibold text-zinc-900 font-['Outfit']">Porositë e Fundit</CardTitle>
        </CardHeader>
        <CardContent>
          {stats?.recent_orders?.length > 0 ? (
            <div className="space-y-3">
              {stats.recent_orders.map((order) => (
                <div
                  key={order.id}
                  className="flex items-center justify-between p-3 rounded-lg bg-zinc-50/50 border border-zinc-100 hover:bg-zinc-50 transition-colors"
                  data-testid={`recent-order-${order.id}`}
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-orange-100 flex items-center justify-center">
                      <ShoppingBag className="w-4 h-4 text-orange-600" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-zinc-900">{order.client_name}</p>
                      <p className="text-xs text-zinc-500">
                        {new Date(order.created_at).toLocaleDateString('sq-AL')}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      className={
                        order.status === 'completed'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-50'
                          : 'bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-50'
                      }
                      variant="outline"
                    >
                      {order.status === 'completed' ? 'E Përfunduar' : 'Në Pritje'}
                    </Badge>
                    <span className="text-sm font-semibold text-zinc-900">
                      {order.total_price?.toLocaleString('sq-AL')} Lekë
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-12 text-zinc-400">
              <ShoppingBag className="w-10 h-10 mx-auto mb-3 opacity-50" />
              <p className="text-sm">Nuk ka porosi ende</p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
