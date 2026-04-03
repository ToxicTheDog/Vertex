import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { dashboardStats } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { reportsApi } from '@/services/apiService';

const categoryData = [
  { name: 'Konsultacije', revenue: 850000, cost: 320000, profit: 530000 },
  { name: 'Proizvodi', revenue: 620000, cost: 450000, profit: 170000 },
  { name: 'Održavanje', revenue: 480000, cost: 180000, profit: 300000 },
  { name: 'Licence', revenue: 350000, cost: 120000, profit: 230000 },
  { name: 'Ostalo', revenue: 150000, cost: 80000, profit: 70000 },
];

const costBreakdown = [
  { name: 'Plate', value: 820000, color: 'hsl(var(--primary))' },
  { name: 'Materijal', value: 350000, color: 'hsl(var(--chart-2))' },
  { name: 'Marketing', value: 150000, color: 'hsl(var(--chart-3))' },
  { name: 'Režije', value: 120000, color: 'hsl(var(--chart-4))' },
  { name: 'Ostalo', value: 80000, color: 'hsl(var(--chart-5))' },
];

const Profitability = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalRevenue = categoryData.reduce((sum, c) => sum + c.revenue, 0);
  const totalCost = categoryData.reduce((sum, c) => sum + c.cost, 0);
  const totalProfit = totalRevenue - totalCost;
  const profitMargin = ((totalProfit / totalRevenue) * 100).toFixed(1);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profitabilnost i troškovi</h1>
          <p className="text-muted-foreground">Analiza profitabilnosti po kategorijama i pregled troškova</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni prihod</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +12% od prošlog meseca
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni troškovi</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">46.8% od prihoda</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Neto profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalProfit)}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +8% od prošlog meseca
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profitna marža</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
            <p className="text-xs text-muted-foreground">cilj: 60%</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Profitabilnost po kategorijama</CardTitle>
            <CardDescription>Prihodi i troškovi po poslovnim kategorijama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={categoryData}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="name" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${(value / 1000)}k`} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" name="Prihod" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="cost" name="Troškovi" fill="hsl(var(--destructive))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Struktura troškova</CardTitle>
            <CardDescription>Raspodela troškova po kategorijama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={costBreakdown}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {costBreakdown.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {costBreakdown.map((item) => (
                  <div key={item.name} className="flex items-center gap-2 text-sm">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                    <span>{item.name}</span>
                  </div>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend profita</CardTitle>
          <CardDescription>Mesečni pregled prihoda, troškova i profita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dashboardStats.monthlyData}>
                <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                <XAxis dataKey="month" className="text-xs" />
                <YAxis className="text-xs" tickFormatter={(value) => `${(value / 1000)}k`} />
                <Tooltip 
                  formatter={(value: number) => formatCurrency(value)}
                  contentStyle={{ 
                    backgroundColor: 'hsl(var(--card))', 
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                />
                <Line type="monotone" dataKey="revenue" name="Prihod" stroke="hsl(var(--success))" strokeWidth={2} />
                <Line type="monotone" dataKey="expenses" name="Troškovi" stroke="hsl(var(--destructive))" strokeWidth={2} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profitability;
