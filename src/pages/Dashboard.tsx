import { useState, useEffect } from 'react';
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  FileText,
  AlertTriangle,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Wifi,
  WifiOff
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell
} from 'recharts';
import { dashboardStats, demoInvoices, demoTransactions, demoArticles } from '@/data/demoData';
import { Link } from 'react-router-dom';
import { startRealtimeUpdates } from '@/services/apiService';
import { dashboardApi } from '@/services/apiService';
import { DEMO_MODE, REALTIME_UPDATE_INTERVAL } from '@/config/api';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const statusColors = {
  paid: 'bg-success text-success-foreground',
  sent: 'bg-info text-info-foreground',
  overdue: 'bg-destructive text-destructive-foreground',
  draft: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground'
};

const statusLabels = {
  paid: 'Plaćeno',
  sent: 'Poslato',
  overdue: 'Dospelo',
  draft: 'Nacrt',
  cancelled: 'Otkazano'
};

const pieData = [
  { name: 'Prodaja', value: 45, color: 'hsl(var(--chart-1))' },
  { name: 'Usluge', value: 30, color: 'hsl(var(--chart-2))' },
  { name: 'Konsultacije', value: 15, color: 'hsl(var(--chart-3))' },
  { name: 'Ostalo', value: 10, color: 'hsl(var(--chart-4))' }
];

const Dashboard = () => {
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [isRealtimeConnected, setIsRealtimeConnected] = useState(false);
  const [lastUpdate, setLastUpdate] = useState<Date | null>(null);
  const [realtimeData, setRealtimeData] = useState<any>(null);

  // Učitavanje statistike sa API-ja ili demo podataka
  const fetchDashboardStats = async () => {
    setLoading(true);
    setError(null);

    if (DEMO_MODE) {
      await new Promise(resolve => setTimeout(resolve, 400)); // simulacija
      setStats(dashboardStats);
      setLoading(false);
      return;
    }

    try {
      const response = await dashboardApi.getStats();

      if (response.success && response.data) {
        setStats(response.data);
      } else {
        setError(response.message || 'Greška pri učitavanju dashboarda');
        // Fallback na demo podatke ako API padne
        setStats(dashboardStats);
      }
    } catch (err) {
      console.error('Dashboard stats error:', err);
      setError('Nije moguće učitati podatke sa servera');
      setStats(dashboardStats); // fallback
    } finally {
      setLoading(false);
    }
  };

  // Real-time ažuriranja
  useEffect(() => {
    fetchDashboardStats();

    const stopUpdates = startRealtimeUpdates((data) => {
      setRealtimeData(data);
      setLastUpdate(new Date());
      setIsRealtimeConnected(true);

      // Ako dobijemo nove podatke, možemo osvežiti stats (opciono)
      if (data?.data) {
        setStats(prev => ({ ...prev, ...data.data }));
      }
    }, REALTIME_UPDATE_INTERVAL);

    return () => {
      stopUpdates();
      setIsRealtimeConnected(false);
    };
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="flex flex-col items-center gap-3">
          <RefreshCw className="h-8 w-8 animate-spin text-primary" />
          <p className="text-muted-foreground">Učitavanje dashboarda...</p>
        </div>
      </div>
    );
  }

  const currentStats = stats || dashboardStats;
  const lowStockItems = demoArticles.filter(a => a.stock <= a.minStock);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground">
            Pregled poslovanja • {new Date().toLocaleDateString('sr-RS', { month: 'long', year: 'numeric' })}
          </p>
        </div>

        <div className="flex items-center gap-4">
          {/* Real-time status */}
          <div className="flex items-center gap-2 text-sm">
            {isRealtimeConnected ? (
              <>
                <Wifi className="h-4 w-4 text-success animate-pulse" />
                <span className="text-muted-foreground">
                  {DEMO_MODE ? 'Demo režim' : 'Uživo'}
                  {lastUpdate && ` • ${lastUpdate.toLocaleTimeString('sr-RS')}`}
                </span>
              </>
            ) : (
              <>
                <WifiOff className="h-4 w-4 text-muted-foreground" />
                <span className="text-muted-foreground">Offline</span>
              </>
            )}
          </div>

          <div className="flex gap-2">
            <Button variant="outline" asChild>
              <Link to="/financial-reports">Izveštaji</Link>
            </Button>
            <Button asChild>
              <Link to="/invoices/create">
                <FileText className="mr-2 h-4 w-4" />
                Nova faktura
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* KPI kartice */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupni prihodi</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentStats.totalRevenue)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+12.5%</span> u odnosu na prošli mesec
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupni rashodi</CardTitle>
            <TrendingDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentStats.totalExpenses)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowDownRight className="h-3 w-3 text-destructive mr-1" />
              <span className="text-destructive">+5.2%</span> u odnosu na prošli mesec
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Profit</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(currentStats.profit)}</div>
            <p className="text-xs text-muted-foreground flex items-center mt-1">
              <ArrowUpRight className="h-3 w-3 text-success mr-1" />
              <span className="text-success">+18.3%</span> u odnosu na prošli mesec
            </p>
          </CardContent>
        </Card>

        <Card className="card-hover">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">PDV za uplatu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(currentStats.vatToPay)}</div>
            <p className="text-xs text-muted-foreground mt-1">Rok: 15. februar 2024</p>
          </CardContent>
        </Card>
      </div>

      {/* Brze statistike */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neplaćene fakture</p>
                <p className="text-2xl font-bold">{currentStats.pendingInvoices}</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Dospele fakture</p>
                <p className="text-2xl font-bold text-destructive">{currentStats.overdueInvoices}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno klijenata</p>
                <p className="text-2xl font-bold">{currentStats.totalClients}</p>
              </div>
              <Users className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Niske zalihe</p>
                <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Grafici i tabele ostaju iste (za sada) */}
      {/* Grafici */}
      <div className="grid gap-4 md:grid-cols-7">
        <Card className="md:col-span-4">
          <CardHeader>
            <CardTitle>Pregled prihoda i rashoda</CardTitle>
            <CardDescription>Mesečni prikaz za 2024. godinu</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={dashboardStats.monthlyData}>
                <defs>
                  <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-1))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-1))" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="colorExpenses" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="hsl(var(--chart-4))" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="hsl(var(--chart-4))" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="hsl(var(--chart-1))"
                  fillOpacity={1}
                  fill="url(#colorRevenue)"
                  name="Prihodi"
                />
                <Area
                  type="monotone"
                  dataKey="expenses"
                  stroke="hsl(var(--chart-4))"
                  fillOpacity={1}
                  fill="url(#colorExpenses)"
                  name="Rashodi"
                />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card className="md:col-span-3">
          <CardHeader>
            <CardTitle>Struktura prihoda</CardTitle>
            <CardDescription>Po kategorijama</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => `${value}%`}
                />
              </PieChart>
            </ResponsiveContainer>
            <div className="flex flex-wrap justify-center gap-4 mt-4">
              {pieData.map((entry, index) => (
                <div key={index} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                  <span className="text-sm text-muted-foreground">{entry.name}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabele */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Nedavne fakture</CardTitle>
              <CardDescription>Poslednje izdati računi</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/invoices">Vidi sve</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoInvoices.slice(0, 5).map((invoice) => (
                <div key={invoice.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <p className="font-medium">{invoice.number}</p>
                    <p className="text-sm text-muted-foreground">{invoice.clientName}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-medium">{formatCurrency(invoice.total)}</p>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <div>
              <CardTitle>Nedavne transakcije</CardTitle>
              <CardDescription>Poslednja kretanja</CardDescription>
            </div>
            <Button variant="ghost" size="sm" asChild>
              <Link to="/bank-statements">Vidi sve</Link>
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {demoTransactions.slice(0, 5).map((transaction) => (
                <div key={transaction.id} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-full ${transaction.type === 'income' ? 'bg-success/20' : 'bg-destructive/20'}`}>
                      {transaction.type === 'income' ? (
                        <ArrowUpRight className={`h-4 w-4 text-success`} />
                      ) : (
                        <ArrowDownRight className={`h-4 w-4 text-destructive`} />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">{transaction.category}</p>
                    </div>
                  </div>
                  <div className={`font-medium ${transaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                    {transaction.type === 'income' ? '+' : '-'}{formatCurrency(transaction.amount)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Dashboard;