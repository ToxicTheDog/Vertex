import { TrendingUp, TrendingDown, DollarSign, Percent } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line, PieChart, Pie, Cell } from 'recharts';
import { dashboardApi, vatReductionApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const emptyStats = {
  totalRevenue: 0,
  totalExpenses: 0,
  profit: 0,
  monthlyData: [] as Array<{ month: string; revenue: number; expenses: number }>,
  revenueBreakdown: [] as Array<{ name: string; value: number; color?: string }>,
};

const categoryLabels: Record<string, string> = {
  kancelarijski_materijal: 'Kancelarijski materijal',
  oprema: 'Oprema',
  gorivo: 'Gorivo',
  reprezentacija: 'Reprezentacija',
  usluge: 'Usluge',
  ostalo: 'Ostalo',
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);

const EmptyChartState = ({ message }: { message: string }) => (
  <div className="flex h-[320px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

const Profitability = () => {
  const { data: stats } = useFetchData(() => dashboardApi.getStats(), emptyStats);
  const { data: purchases } = useFetchData<any[]>(() => vatReductionApi.getAll(), []);

  const totalRevenue = Number(stats.totalRevenue) || 0;
  const totalCost = Number(stats.totalExpenses) || 0;
  const totalProfit = Number(stats.profit) || 0;
  const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100).toFixed(1) : '0.0';
  const revenueBreakdown = Array.isArray(stats.revenueBreakdown) ? stats.revenueBreakdown : [];
  const costBreakdown = Object.entries(
    purchases.reduce<Record<string, number>>((accumulator, purchase) => {
      const key = purchase.category || 'ostalo';
      accumulator[key] = (accumulator[key] || 0) + (Number(purchase.netAmount) || 0);
      return accumulator;
    }, {})
  ).map(([name, value], index) => ({
    name: categoryLabels[name] || name,
    value,
    color: `hsl(var(--chart-${(index % 5) + 1}))`
  }));
  const monthlyData = Array.isArray(stats.monthlyData) ? stats.monthlyData : [];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Profitabilnost i troskovi</h1>
          <p className="text-muted-foreground">Analiza profitabilnosti i strukture troskova</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni prihodi</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni troskovi</CardTitle>
            <TrendingDown className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCost)}</div>
            <p className="text-xs text-muted-foreground">
              {totalRevenue > 0 ? `${((totalCost / totalRevenue) * 100).toFixed(1)}% od prihoda` : '0.0% od prihoda'}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Neto profit</CardTitle>
            <DollarSign className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalProfit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Profitna marza</CardTitle>
            <Percent className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{profitMargin}%</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Struktura prihoda</CardTitle>
            <CardDescription>Prihodi po tipu dokumenta</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px]">
              {revenueBreakdown.length === 0 ? (
                <EmptyChartState message="Nema prihoda za prikaz po tipu." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={revenueBreakdown}>
                    <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                    <XAxis dataKey="name" className="text-xs" />
                    <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}k`} />
                    <Tooltip
                      formatter={(value: number) => formatCurrency(value)}
                      contentStyle={{
                        backgroundColor: 'hsl(var(--card))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                    />
                    <Bar dataKey="value" name="Prihod" fill="hsl(var(--success))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Struktura troskova</CardTitle>
            <CardDescription>Raspodela troskova po kategorijama</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[350px] flex items-center">
              {costBreakdown.length === 0 ? (
                <EmptyChartState message="Nema troskova za prikaz po kategorijama." />
              ) : (
                <>
                  <ResponsiveContainer width="60%" height="100%">
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
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend profita</CardTitle>
          <CardDescription>Mesecni pregled prihoda, troskova i profita</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[300px]">
            {monthlyData.length === 0 ? (
              <EmptyChartState message="Nema mesecnih podataka za prikaz." />
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={monthlyData.map((entry) => ({ ...entry, profit: (Number(entry.revenue) || 0) - (Number(entry.expenses) || 0) }))}>
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis dataKey="month" className="text-xs" />
                  <YAxis className="text-xs" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{
                      backgroundColor: 'hsl(var(--card))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Line type="monotone" dataKey="revenue" name="Prihod" stroke="hsl(var(--success))" strokeWidth={2} />
                  <Line type="monotone" dataKey="expenses" name="Troskovi" stroke="hsl(var(--destructive))" strokeWidth={2} />
                  <Line type="monotone" dataKey="profit" name="Profit" stroke="hsl(var(--primary))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Profitability;
