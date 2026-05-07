import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';
import { TrendingUp, TrendingDown, DollarSign, Wallet } from 'lucide-react';
import { dashboardApi, vatReductionApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const emptyStats = {
  totalRevenue: 0,
  totalExpenses: 0,
  profit: 0,
  monthlyData: [] as Array<{ month: string; revenue: number; expenses: number }>,
};

const categoryLabels: Record<string, string> = {
  kancelarijski_materijal: 'Kancelarijski materijal',
  oprema: 'Oprema',
  gorivo: 'Gorivo',
  reprezentacija: 'Reprezentacija',
  usluge: 'Usluge',
  ostalo: 'Ostalo',
};

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const EmptyChartState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

const FinancialReports = () => {
  const { data: stats } = useFetchData(() => dashboardApi.getStats(), emptyStats);
  const { data: purchases } = useFetchData<any[]>(() => vatReductionApi.getAll(), []);

  const expenseData = Object.entries(
    purchases.reduce<Record<string, number>>((accumulator, purchase) => {
      const key = purchase.category || 'ostalo';
      accumulator[key] = (accumulator[key] || 0) + (Number(purchase.netAmount) || 0);
      return accumulator;
    }, {})
  ).map(([category, amount], index) => ({
    category: categoryLabels[category] || category,
    amount,
    color: `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  const monthlyData = Array.isArray(stats.monthlyData) ? stats.monthlyData : [];
  const totalRevenue = Number(stats.totalRevenue) || 0;
  const totalExpenses = Number(stats.totalExpenses) || 0;
  const profit = Number(stats.profit) || 0;
  const profitMargin = totalRevenue > 0 ? ((profit / totalRevenue) * 100).toFixed(1) : '0.0';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Finansijski izvestaji</h1>
          <p className="text-muted-foreground">Pregled finansijskog stanja</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <TrendingUp className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupni prihodi</p>
                <p className="text-2xl font-bold">{formatCurrency(totalRevenue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <TrendingDown className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupni rashodi</p>
                <p className="text-2xl font-bold">{formatCurrency(totalExpenses)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <DollarSign className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Neto profit</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(profit)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <Wallet className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Profitna marza</p>
                <p className="text-2xl font-bold">{profitMargin}%</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prihodi vs rashodi</CardTitle>
            <CardDescription>Mesecni pregled</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.length === 0 ? (
              <EmptyChartState message="Nema finansijskih kretanja za prikaz." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Bar dataKey="revenue" fill="hsl(var(--chart-2))" name="Prihodi" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="expenses" fill="hsl(var(--chart-4))" name="Rashodi" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Struktura rashoda</CardTitle>
            <CardDescription>Po kategorijama kupovina</CardDescription>
          </CardHeader>
          <CardContent>
            {expenseData.length === 0 ? (
              <EmptyChartState message="Nema rashoda za prikaz po kategorijama." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={expenseData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="amount"
                    >
                      {expenseData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {expenseData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-muted-foreground">{entry.category}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend profita</CardTitle>
          <CardDescription>Mesecni pregled profita</CardDescription>
        </CardHeader>
        <CardContent>
          {monthlyData.length === 0 ? (
            <EmptyChartState message="Nema profitnog trenda za prikaz." />
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={monthlyData.map((entry) => ({ ...entry, profit: (Number(entry.revenue) || 0) - (Number(entry.expenses) || 0) }))}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000}k`} />
                <Tooltip
                  contentStyle={{
                    backgroundColor: 'hsl(var(--popover))',
                    border: '1px solid hsl(var(--border))',
                    borderRadius: '8px'
                  }}
                  formatter={(value: number) => formatCurrency(value)}
                />
                <Line
                  type="monotone"
                  dataKey="profit"
                  stroke="hsl(var(--chart-2))"
                  strokeWidth={3}
                  dot={{ fill: 'hsl(var(--chart-2))' }}
                  name="Profit"
                />
              </LineChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default FinancialReports;
