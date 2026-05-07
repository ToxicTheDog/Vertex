import { BarChart3, Package, Users, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { clientsApi, dashboardApi, invoicesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const emptyStats = {
  monthlyData: [] as Array<{ month: string; revenue: number; expenses: number }>,
  revenueBreakdown: [] as Array<{ name: string; value: number; color?: string }>,
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);

const EmptyChartState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

const SalesReports = () => {
  const { data: stats } = useFetchData(() => dashboardApi.getStats(), emptyStats);
  const { data: invoices } = useFetchData<any[]>(() => invoicesApi.getAll(), []);
  const { data: clients } = useFetchData<any[]>(() => clientsApi.getAll(), []);

  const monthlySales = (Array.isArray(stats.monthlyData) ? stats.monthlyData : []).map((entry) => ({
    month: entry.month,
    sales: Number(entry.revenue) || 0
  }));
  const totalSales = monthlySales.reduce((sum, entry) => sum + entry.sales, 0);
  const averageSale = monthlySales.length > 0 ? totalSales / monthlySales.length : 0;
  const salesByCategory = (Array.isArray(stats.revenueBreakdown) ? stats.revenueBreakdown : []).map((entry, index) => ({
    name: entry.name,
    value: Number(entry.value) || 0,
    color: entry.color || `hsl(var(--chart-${(index % 5) + 1}))`
  }));

  const topClients = Object.values(
    invoices.reduce<Record<string, { name: string; sales: number; quantity: number }>>((accumulator, invoice) => {
      const key = invoice.clientName || 'Nepoznat klijent';
      if (!accumulator[key]) {
        accumulator[key] = { name: key, sales: 0, quantity: 0 };
      }

      accumulator[key].sales += Number(invoice.total) || 0;
      accumulator[key].quantity += 1;
      return accumulator;
    }, {})
  )
    .sort((first, second) => second.sales - first.sales)
    .slice(0, 5);

  const topClientsTotal = topClients.reduce((sum, client) => sum + client.sales, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izvestaji o prodaji</h1>
          <p className="text-muted-foreground">Analiza prodaje po periodu i klijentu</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Izvezi izvestaj
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupna prodaja</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalSales)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prosecna prodaja</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
            <p className="text-xs text-muted-foreground">mesecno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Broj faktura</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">izdatih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktivnih kupaca</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-muted-foreground">u bazi</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prodaja po mesecima</CardTitle>
            <CardDescription>Mesecni trend prodaje</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              {monthlySales.length === 0 ? (
                <EmptyChartState message="Nema prodaje za prikaz." />
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={monthlySales}>
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
                    <Bar dataKey="sales" name="Prodaja" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prodaja po kategorijama</CardTitle>
            <CardDescription>Raspodela stvarnih prihoda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
              {salesByCategory.length === 0 ? (
                <EmptyChartState message="Nema kategorija prodaje za prikaz." />
              ) : (
                <>
                  <ResponsiveContainer width="60%" height="100%">
                    <PieChart>
                      <Pie
                        data={salesByCategory}
                        cx="50%"
                        cy="50%"
                        innerRadius={50}
                        outerRadius={90}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {salesByCategory.map((entry, index) => (
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
                  <div className="space-y-3">
                    {salesByCategory.map((item) => (
                      <div key={item.name} className="flex items-center gap-2 text-sm">
                        <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <div>
                          <p className="font-medium">{item.name}</p>
                          <p className="text-muted-foreground text-xs">{formatCurrency(item.value)}</p>
                        </div>
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
          <CardTitle>Top kupci po prodaji</CardTitle>
          <CardDescription>Najveci promet po klijentu</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>R.br.</TableHead>
                <TableHead>Klijent</TableHead>
                <TableHead className="text-right">Broj faktura</TableHead>
                <TableHead className="text-right">Ukupna prodaja</TableHead>
                <TableHead className="text-right">Udeo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topClients.map((client, index) => (
                <TableRow key={client.name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{client.name}</TableCell>
                  <TableCell className="text-right">{client.quantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(client.sales)}</TableCell>
                  <TableCell className="text-right">
                    {topClientsTotal > 0 ? `${((client.sales / topClientsTotal) * 100).toFixed(1)}%` : '0.0%'}
                  </TableCell>
                </TableRow>
              ))}
              {topClients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nema prodajnih podataka za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;
