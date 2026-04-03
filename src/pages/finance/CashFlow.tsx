import { Wallet, TrendingUp, TrendingDown, ArrowUpRight, ArrowDownRight, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { demoTransactions, demoBankStatements } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { apiService } from '@/services/apiService';

const cashFlowData = [
  { month: 'Jan', inflow: 380000, outflow: 290000, balance: 90000 },
  { month: 'Feb', inflow: 420000, outflow: 310000, balance: 110000 },
  { month: 'Mar', inflow: 390000, outflow: 280000, balance: 110000 },
  { month: 'Apr', inflow: 450000, outflow: 320000, balance: 130000 },
  { month: 'Maj', inflow: 410000, outflow: 300000, balance: 110000 },
  { month: 'Jun', inflow: 400000, outflow: 280000, balance: 120000 },
];

const projectionData = [
  { month: 'Jul', projected: 125000, actual: null },
  { month: 'Avg', projected: 140000, actual: null },
  { month: 'Sep', projected: 155000, actual: null },
];

const upcomingInflows = [
  { id: '1', description: 'Tech Solutions - faktura', date: '2024-04-05', amount: 95000 },
  { id: '2', description: 'Digital Media - usluge', date: '2024-04-10', amount: 45000 },
  { id: '3', description: 'Green Energy - rata', date: '2024-04-15', amount: 78000 },
];

const upcomingOutflows = [
  { id: '1', description: 'Plate zaposlenih', date: '2024-04-01', amount: 820000 },
  { id: '2', description: 'Zakup prostora', date: '2024-04-05', amount: 80000 },
  { id: '3', description: 'Struja i komunalije', date: '2024-04-10', amount: 45000 },
  { id: '4', description: 'PDV obaveza', date: '2024-04-15', amount: 145000 },
];

const CashFlow = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const currentBalance = demoBankStatements[0]?.closingBalance || 0;
  const totalInflow = cashFlowData.reduce((sum, m) => sum + m.inflow, 0);
  const totalOutflow = cashFlowData.reduce((sum, m) => sum + m.outflow, 0);
  const netCashFlow = totalInflow - totalOutflow;

  const upcomingIn = upcomingInflows.reduce((sum, i) => sum + i.amount, 0);
  const upcomingOut = upcomingOutflows.reduce((sum, i) => sum + i.amount, 0);
  const projectedBalance = currentBalance + upcomingIn - upcomingOut;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Keš flow izveštaji</h1>
          <p className="text-muted-foreground">Praćenje novčanih tokova i projekcije</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trenutno stanje</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(currentBalance)}</div>
            <p className="text-xs text-muted-foreground">na svim računima</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prilivi</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalInflow)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Odlivi</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOutflow)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Neto keš flow</CardTitle>
            <TrendingUp className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className={`text-2xl font-bold ${netCashFlow >= 0 ? 'text-success' : 'text-destructive'}`}>
              {formatCurrency(netCashFlow)}
            </div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Trend keš flowa</CardTitle>
          <CardDescription>Mesečni pregled priliva i odliva novca</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={cashFlowData}>
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
                <Area type="monotone" dataKey="inflow" name="Prilivi" stackId="1" stroke="hsl(var(--success))" fill="hsl(var(--success)/0.3)" />
                <Area type="monotone" dataKey="outflow" name="Odlivi" stackId="2" stroke="hsl(var(--destructive))" fill="hsl(var(--destructive)/0.3)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowDownRight className="h-5 w-5 text-success" />
              Očekivani prilivi
            </CardTitle>
            <CardDescription>Nadolazeće uplate od kupaca</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opis</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Iznos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingInflows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('sr-RS')}</TableCell>
                    <TableCell className="text-right font-medium text-success">
                      +{formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-medium">Ukupno očekivano</TableCell>
                  <TableCell className="text-right font-bold text-success">
                    +{formatCurrency(upcomingIn)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ArrowUpRight className="h-5 w-5 text-destructive" />
              Planirani odlivi
            </CardTitle>
            <CardDescription>Nadolazeće obaveze za plaćanje</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Opis</TableHead>
                  <TableHead>Datum</TableHead>
                  <TableHead className="text-right">Iznos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {upcomingOutflows.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell>{new Date(item.date).toLocaleDateString('sr-RS')}</TableCell>
                    <TableCell className="text-right font-medium text-destructive">
                      -{formatCurrency(item.amount)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow className="bg-muted/50">
                  <TableCell colSpan={2} className="font-medium">Ukupno planirano</TableCell>
                  <TableCell className="text-right font-bold text-destructive">
                    -{formatCurrency(upcomingOut)}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Projekcija stanja</CardTitle>
          <CardDescription>Očekivano stanje na osnovu planiranih priliva i odliva</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 mb-6">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Trenutno stanje</p>
              <p className="text-2xl font-bold">{formatCurrency(currentBalance)}</p>
            </div>
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Neto promene</p>
              <p className={`text-2xl font-bold ${upcomingIn - upcomingOut >= 0 ? 'text-success' : 'text-destructive'}`}>
                {upcomingIn - upcomingOut >= 0 ? '+' : ''}{formatCurrency(upcomingIn - upcomingOut)}
              </p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Projektovano stanje</p>
              <p className="text-2xl font-bold text-primary">{formatCurrency(projectedBalance)}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default CashFlow;
