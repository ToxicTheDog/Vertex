import { useState } from 'react';
import { Wallet, Search, Filter, Eye, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoReceivedInvoices, demoSuppliers } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { invoicesApi } from '@/services/apiService';

const SupplierPayments = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  const payments = demoReceivedInvoices.map(inv => ({
    ...inv,
    daysUntilDue: Math.ceil((new Date(inv.dueDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))
  }));

  const filteredPayments = payments.filter(payment => {
    const matchesSearch = payment.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         payment.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || payment.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalToPay = payments.filter(p => p.status !== 'paid').reduce((sum, p) => sum + p.total, 0);
  const overdue = payments.filter(p => p.daysUntilDue < 0 && p.status !== 'paid');
  const dueSoon = payments.filter(p => p.daysUntilDue >= 0 && p.daysUntilDue <= 7 && p.status !== 'paid');

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Plaćanja dobavljačima</h1>
          <p className="text-muted-foreground">Evidencija i status plaćanja ulaznih faktura</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Za plaćanje</CardTitle>
            <Wallet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalToPay)}</div>
            <p className="text-xs text-muted-foreground">{payments.filter(p => p.status !== 'paid').length} faktura</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Dospeva uskoro</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{dueSoon.length}</div>
            <p className="text-xs text-muted-foreground">u narednih 7 dana</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prekoračeno</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{overdue.length}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(overdue.reduce((s, p) => s + p.total, 0))}
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plaćeno</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{payments.filter(p => p.status === 'paid').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Pregled plaćanja</CardTitle>
          <CardDescription>Status plaćanja svih ulaznih faktura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po dobavljaču ili broju..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="pending">Na čekanju</SelectItem>
                <SelectItem value="approved">Odobren</SelectItem>
                <SelectItem value="paid">Plaćen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Faktura</TableHead>
                <TableHead>Dobavljač</TableHead>
                <TableHead>Datum fakture</TableHead>
                <TableHead>Rok plaćanja</TableHead>
                <TableHead>Dana do roka</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell className="font-medium">{payment.number}</TableCell>
                  <TableCell>{payment.supplierName}</TableCell>
                  <TableCell>{new Date(payment.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(payment.dueDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    <Badge className={
                      payment.status === 'paid' ? 'bg-success/20 text-success' :
                      payment.daysUntilDue < 0 ? 'bg-destructive/20 text-destructive' :
                      payment.daysUntilDue <= 7 ? 'bg-warning/20 text-warning' :
                      'bg-muted text-muted-foreground'
                    }>
                      {payment.status === 'paid' ? 'Plaćeno' :
                       payment.daysUntilDue < 0 ? `${Math.abs(payment.daysUntilDue)} dana kasni` :
                       `${payment.daysUntilDue} dana`}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(payment.total)}</TableCell>
                  <TableCell>
                    <Badge className={
                      payment.status === 'paid' ? 'bg-success/20 text-success' :
                      payment.status === 'approved' ? 'bg-primary/20 text-primary' :
                      'bg-warning/20 text-warning'
                    }>
                      {payment.status === 'paid' ? 'Plaćeno' :
                       payment.status === 'approved' ? 'Odobreno' : 'Na čekanju'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Prikaži">
                        <Eye className="h-4 w-4" />
                      </Button>
                      {payment.status !== 'paid' && (
                        <Button variant="ghost" size="icon" title="Označi kao plaćeno">
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                    </div>
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

export default SupplierPayments;
