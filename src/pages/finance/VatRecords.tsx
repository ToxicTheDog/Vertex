import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Calculator, FileText, TrendingUp, AlertCircle } from 'lucide-react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { API_ENDPOINTS } from '@/config/api';
import { apiService } from '@/services/apiService';

interface VatRecord {
  id: string;
  period: string;
  inputVat: number;
  outputVat: number;
  difference: number;
  status: 'pending' | 'paid' | 'due';
  dueDate: string;
}

const vatRecords: VatRecord[] = [
  { id: '1', period: 'Januar 2024', inputVat: 85000, outputVat: 125000, difference: 40000, status: 'paid', dueDate: '2024-02-15' },
  { id: '2', period: 'Februar 2024', inputVat: 72000, outputVat: 118000, difference: 46000, status: 'paid', dueDate: '2024-03-15' },
  { id: '3', period: 'Mart 2024', inputVat: 68000, outputVat: 135000, difference: 67000, status: 'due', dueDate: '2024-04-15' },
  { id: '4', period: 'April 2024', inputVat: 55000, outputVat: 98000, difference: 43000, status: 'pending', dueDate: '2024-05-15' }
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const statusColors: Record<string, string> = {
  paid: 'bg-success text-success-foreground',
  due: 'bg-destructive text-destructive-foreground',
  pending: 'bg-warning text-warning-foreground'
};

const statusLabels: Record<string, string> = {
  paid: 'Plaćeno',
  due: 'Dospelo',
  pending: 'Na čekanju'
};

const VatRecords = () => {
  const totalInputVat = vatRecords.reduce((sum, r) => sum + r.inputVat, 0);
  const totalOutputVat = vatRecords.reduce((sum, r) => sum + r.outputVat, 0);
  const totalDifference = totalOutputVat - totalInputVat;
  const pendingAmount = vatRecords.filter(r => r.status !== 'paid').reduce((sum, r) => sum + r.difference, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PDV Evidencija</h1>
          <p className="text-muted-foreground">Pregled ulaznog i izlaznog PDV-a</p>
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
                <p className="text-sm text-muted-foreground">Izlazni PDV</p>
                <p className="text-2xl font-bold">{formatCurrency(totalOutputVat)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Calculator className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ulazni PDV</p>
                <p className="text-2xl font-bold">{formatCurrency(totalInputVat)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <FileText className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Za uplatu</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(pendingAmount)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-destructive/10 rounded-full">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Dospele obaveze</p>
                <p className="text-2xl font-bold text-destructive">
                  {vatRecords.filter(r => r.status === 'due').length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PDV po periodima</CardTitle>
          <CardDescription>Mesečni pregled PDV obaveza</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Izlazni PDV</TableHead>
                <TableHead className="text-right">Ulazni PDV</TableHead>
                <TableHead className="text-right">Za uplatu</TableHead>
                <TableHead>Rok</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {vatRecords.map((record) => (
                <TableRow key={record.id} className="data-table-row">
                  <TableCell className="font-medium">{record.period}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.outputVat)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(record.inputVat)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(record.difference)}</TableCell>
                  <TableCell>{new Date(record.dueDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[record.status]}>
                      {statusLabels[record.status]}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            <TableFooter>
              <TableRow>
                <TableCell className="font-bold">UKUPNO</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalOutputVat)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalInputVat)}</TableCell>
                <TableCell className="text-right font-bold">{formatCurrency(totalDifference)}</TableCell>
                <TableCell></TableCell>
                <TableCell></TableCell>
              </TableRow>
            </TableFooter>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default VatRecords;
