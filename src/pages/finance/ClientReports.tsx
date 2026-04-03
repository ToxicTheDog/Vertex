import { Users, TrendingUp, AlertTriangle, Star, Download } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { demoClients, demoInvoices, demoSuppliers } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { reportsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const clientStats = demoClients.map(client => {
  const invoices = demoInvoices.filter(i => i.clientId === client.id);
  const totalRevenue = invoices.reduce((sum, i) => sum + i.total, 0);
  const paidInvoices = invoices.filter(i => i.status === 'paid').length;
  const overdueInvoices = invoices.filter(i => i.status === 'overdue').length;
  
  return {
    ...client,
    totalRevenue,
    invoiceCount: invoices.length,
    paidInvoices,
    overdueInvoices,
    paymentRate: invoices.length > 0 ? (paidInvoices / invoices.length) * 100 : 0
  };
}).sort((a, b) => b.totalRevenue - a.totalRevenue);

const topClientsChart = clientStats.slice(0, 5).map(c => ({
  name: c.name.length > 15 ? c.name.substring(0, 15) + '...' : c.name,
  revenue: c.totalRevenue
}));

const ClientReports = () => {
  const { data: clients } = useFetchData(() => reportsApi.getFinancial("", ""), demoClients);
  const { data: invoices } = useFetchData(() => reportsApi.getSales("", ""), demoInvoices);
  const { data: suppliers } = useFetchData(() => reportsApi.getFinancial("", ""), demoSuppliers);
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalRevenue = clientStats.reduce((sum, c) => sum + c.totalRevenue, 0);
  const clientsWithOverdue = clientStats.filter(c => c.overdueInvoices > 0).length;
  const avgPaymentRate = clientStats.reduce((sum, c) => sum + c.paymentRate, 0) / clientStats.length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kupci i dobavljači</h1>
          <p className="text-muted-foreground">Analiza kupaca po prometu i plaćanjima</p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Izvezi izveštaj
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno kupaca</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clients.length}</div>
            <p className="text-xs text-success flex items-center gap-1">
              <TrendingUp className="h-3 w-3" /> +3 ovog meseca
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni promet</CardTitle>
            <TrendingUp className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalRevenue)}</div>
            <p className="text-xs text-muted-foreground">od svih kupaca</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sa kašnjenjem</CardTitle>
            <AlertTriangle className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{clientsWithOverdue}</div>
            <p className="text-xs text-muted-foreground">kupaca sa dospelim fakturama</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prosek plaćanja</CardTitle>
            <Star className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{avgPaymentRate.toFixed(0)}%</div>
            <p className="text-xs text-muted-foreground">stopa plaćanja</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Top 5 kupaca po prometu</CardTitle>
            <CardDescription>Najveći kupci po ukupnom prometu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={topClientsChart} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" className="stroke-muted" />
                  <XAxis type="number" className="text-xs" tickFormatter={(value) => `${(value / 1000)}k`} />
                  <YAxis type="category" dataKey="name" className="text-xs" width={120} />
                  <Tooltip 
                    formatter={(value: number) => formatCurrency(value)}
                    contentStyle={{ 
                      backgroundColor: 'hsl(var(--card))', 
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                  />
                  <Bar dataKey="revenue" name="Promet" fill="hsl(var(--primary))" radius={[0, 4, 4, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Dobavljači</CardTitle>
            <CardDescription>Lista aktivnih dobavljača</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Dobavljač</TableHead>
                  <TableHead>Ocena</TableHead>
                  <TableHead>Rok plaćanja</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {suppliers.map((supplier) => (
                  <TableRow key={supplier.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{supplier.name}</p>
                        <p className="text-sm text-muted-foreground">{supplier.city}</p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        {[...Array(5)].map((_, i) => (
                          <Star 
                            key={i} 
                            className={`h-3 w-3 ${i < supplier.rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted'}`} 
                          />
                        ))}
                      </div>
                    </TableCell>
                    <TableCell>{supplier.paymentTerms} dana</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Detaljan pregled kupaca</CardTitle>
          <CardDescription>Svi kupci sa statistikom prometa i plaćanja</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Kupac</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead className="text-right">Broj faktura</TableHead>
                <TableHead className="text-right">Ukupan promet</TableHead>
                <TableHead className="text-right">Plaćeno</TableHead>
                <TableHead className="text-right">Dospelo</TableHead>
                <TableHead>Stopa plaćanja</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clientStats.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell className="text-right">{client.invoiceCount}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(client.totalRevenue)}</TableCell>
                  <TableCell className="text-right text-success">{client.paidInvoices}</TableCell>
                  <TableCell className="text-right">
                    {client.overdueInvoices > 0 ? (
                      <span className="text-destructive">{client.overdueInvoices}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <Badge className={
                      client.paymentRate >= 80 ? 'bg-success/20 text-success' :
                      client.paymentRate >= 50 ? 'bg-warning/20 text-warning' :
                      'bg-destructive/20 text-destructive'
                    }>
                      {client.paymentRate.toFixed(0)}%
                    </Badge>
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

export default ClientReports;
