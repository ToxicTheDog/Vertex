import { BarChart3, TrendingUp, Package, Users, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { demoInvoices, demoArticles, demoClients } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { reportsApi } from '@/services/apiService';

const monthlySales = [
  { month: 'Jan', sales: 385000 },
  { month: 'Feb', sales: 420000 },
  { month: 'Mar', sales: 395000 },
  { month: 'Apr', sales: 450000 },
  { month: 'Maj', sales: 410000 },
  { month: 'Jun', sales: 480000 },
];

const topProducts = [
  { name: 'Laptop HP ProBook', sales: 425000, quantity: 5 },
  { name: 'Monitor Dell 27"', sales: 350000, quantity: 10 },
  { name: 'Konsultantske usluge', sales: 280000, quantity: 56 },
  { name: 'Razvoj softvera', sales: 240000, quantity: 32 },
  { name: 'SEO optimizacija', sales: 96000, quantity: 12 },
];

const salesByCategory = [
  { name: 'Elektronika', value: 775000, color: 'hsl(var(--primary))' },
  { name: 'Usluge', value: 520000, color: 'hsl(var(--chart-2))' },
  { name: 'Periferije', value: 185000, color: 'hsl(var(--chart-3))' },
  { name: 'Nameštaj', value: 95000, color: 'hsl(var(--chart-4))' },
];

const SalesReports = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalSales = monthlySales.reduce((sum, m) => sum + m.sales, 0);
  const averageSale = totalSales / monthlySales.length;
  const invoiceCount = demoInvoices.filter(i => i.type === 'invoice').length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izveštaji o prodaji</h1>
          <p className="text-muted-foreground">Analiza prodaje po periodu, artiklu i klijentu</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Izvezi izveštaj
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
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +15% od prošle godine
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prosečna prodaja</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(averageSale)}</div>
            <p className="text-xs text-muted-foreground">mesečno</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Broj faktura</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoiceCount}</div>
            <p className="text-xs text-muted-foreground">izdatih</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktivnih kupaca</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{demoClients.length}</div>
            <p className="text-xs text-muted-foreground">ovog meseca</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Prodaja po mesecima</CardTitle>
            <CardDescription>Mesečni trend prodaje za tekuću godinu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={monthlySales}>
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
                  <Bar dataKey="sales" name="Prodaja" fill="hsl(var(--primary))" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Prodaja po kategorijama</CardTitle>
            <CardDescription>Raspodela prodaje po grupama proizvoda</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px] flex items-center">
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
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Top proizvodi po prodaji</CardTitle>
          <CardDescription>Najprodavaniji proizvodi i usluge</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>R.br.</TableHead>
                <TableHead>Proizvod / Usluga</TableHead>
                <TableHead className="text-right">Količina</TableHead>
                <TableHead className="text-right">Ukupna prodaja</TableHead>
                <TableHead className="text-right">Udeo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {topProducts.map((product, index) => (
                <TableRow key={product.name}>
                  <TableCell className="font-medium">{index + 1}</TableCell>
                  <TableCell>{product.name}</TableCell>
                  <TableCell className="text-right">{product.quantity}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(product.sales)}</TableCell>
                  <TableCell className="text-right">
                    {((product.sales / topProducts.reduce((s, p) => s + p.sales, 0)) * 100).toFixed(1)}%
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesReports;
