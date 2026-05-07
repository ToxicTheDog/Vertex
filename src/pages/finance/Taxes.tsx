import { useState } from 'react';
import { Receipt, Search, Filter, CheckCircle, Clock, AlertTriangle, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoTaxRecords } from '@/data/demoData';
import { taxesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const typeLabels: Record<string, string> = {
  vat: 'PDV',
  income_tax: 'Porez na dobit',
  payroll_tax: 'Porez na zarade',
  property_tax: 'Porez na imovinu'
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  paid: 'bg-success/20 text-success',
  overdue: 'bg-destructive/20 text-destructive'
};

const statusLabels: Record<string, string> = {
  pending: 'Na cekanju',
  paid: 'Placeno',
  overdue: 'Prekoraceno'
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('sr-RS');
};

const Taxes = () => {
  const { data: taxRecords, setData: setTaxRecords } = useFetchData(() => taxesApi.getAll(), demoTaxRecords);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');

  const filteredRecords = taxRecords.filter((record) => {
    const matchesSearch = record.period.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;
    const matchesType = typeFilter === 'all' || record.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const totalPending = taxRecords
    .filter((record) => record.status === 'pending')
    .reduce((sum, record) => sum + record.amount, 0);
  const totalOverdue = taxRecords
    .filter((record) => record.status === 'overdue')
    .reduce((sum, record) => sum + record.amount, 0);
  const totalPaid = taxRecords
    .filter((record) => record.status === 'paid')
    .reduce((sum, record) => sum + record.amount, 0);

  const nextDueRecord = [...taxRecords]
    .filter((record) => record.status === 'pending' || record.status === 'overdue')
    .sort((first, second) => new Date(first.dueDate).getTime() - new Date(second.dueDate).getTime())[0];

  const handlePay = async (id: string) => {
    const paidDate = new Date().toISOString().split('T')[0];
    const response = await taxesApi.pay(id, paidDate);

    if (!response.success) {
      return;
    }

    setTaxRecords((current) =>
      current.map((record) => record.id === id ? { ...record, status: 'paid', paidDate } : record)
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Porezi i doprinosi</h1>
          <p className="text-muted-foreground">Pregled poreskih obaveza i doprinosa</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Za placanje</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">{taxRecords.filter((record) => record.status === 'pending').length} obaveza</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Prekoraceno</CardTitle>
            <AlertTriangle className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalOverdue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Placeno</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalPaid)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sledeci rok</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDate(nextDueRecord?.dueDate)}</div>
            <p className="text-xs text-muted-foreground">{nextDueRecord ? typeLabels[nextDueRecord.type] : 'Nema obaveza'}</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Poreske obaveze</CardTitle>
          <CardDescription>Pregled svih poreza i doprinosa</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi po periodu..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Receipt className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tip poreza" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="vat">PDV</SelectItem>
                <SelectItem value="income_tax">Porez na dobit</SelectItem>
                <SelectItem value="payroll_tax">Porez na zarade</SelectItem>
                <SelectItem value="property_tax">Porez na imovinu</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="pending">Na cekanju</SelectItem>
                <SelectItem value="paid">Placeno</SelectItem>
                <SelectItem value="overdue">Prekoraceno</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tip poreza</TableHead>
                <TableHead>Period</TableHead>
                <TableHead>Rok placanja</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum placanja</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredRecords.map((record) => (
                <TableRow key={record.id}>
                  <TableCell className="font-medium">
                    <Badge variant="outline">{typeLabels[record.type]}</Badge>
                  </TableCell>
                  <TableCell>{record.period}</TableCell>
                  <TableCell>{formatDate(record.dueDate)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>{formatDate(record.paidDate)}</TableCell>
                  <TableCell className="text-right">
                    {record.status !== 'paid' && (
                      <Button variant="ghost" size="sm" onClick={() => handlePay(record.id)}>
                        <CheckCircle className="h-4 w-4 mr-2" />
                        Plati
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredRecords.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema poreskih obaveza za prikaz.
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

export default Taxes;
