import { FileSpreadsheet, Download, Eye, Plus, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { API_ENDPOINTS } from '@/config/api';
import { taxesApi } from '@/services/apiService';

interface PPPDVForm {
  id: string;
  period: string;
  year: number;
  outputVat: number;
  inputVat: number;
  vatDue: number;
  status: 'draft' | 'submitted' | 'approved';
  submittedDate?: string;
}

const demoForms: PPPDVForm[] = [
  { id: '1', period: 'Januar 2024', year: 2024, outputVat: 180000, inputVat: 55000, vatDue: 125000, status: 'submitted', submittedDate: '2024-02-15' },
  { id: '2', period: 'Februar 2024', year: 2024, outputVat: 195000, inputVat: 50000, vatDue: 145000, status: 'submitted', submittedDate: '2024-03-15' },
  { id: '3', period: 'Mart 2024', year: 2024, outputVat: 210000, inputVat: 65000, vatDue: 145000, status: 'draft' },
];

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  submitted: 'bg-primary/20 text-primary',
  approved: 'bg-success/20 text-success'
};

const statusLabels = {
  draft: 'Nacrt',
  submitted: 'Poslat',
  approved: 'Odobren'
};

const PPPDV = () => {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalVatDue = demoForms.reduce((sum, f) => sum + f.vatDue, 0);
  const totalOutputVat = demoForms.reduce((sum, f) => sum + f.outputVat, 0);
  const totalInputVat = demoForms.reduce((sum, f) => sum + f.inputVat, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">PPPDV obrasci</h1>
          <p className="text-muted-foreground">Generisanje i pregled PPPDV obrazaca</p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Generiši novi obrazac
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Izlazni PDV</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalOutputVat)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ulazni PDV</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalInputVat)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">PDV obaveza</CardTitle>
            <FileSpreadsheet className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-primary">{formatCurrency(totalVatDue)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Sledeći rok</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">15.04.2024</div>
            <p className="text-xs text-muted-foreground">za Mart 2024</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>PPPDV obrasci</CardTitle>
          <CardDescription>Pregled svih generisanih obrazaca po periodima</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Period</TableHead>
                <TableHead>Godina</TableHead>
                <TableHead className="text-right">Izlazni PDV</TableHead>
                <TableHead className="text-right">Ulazni PDV</TableHead>
                <TableHead className="text-right">Za uplatu</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Datum slanja</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {demoForms.map((form) => (
                <TableRow key={form.id}>
                  <TableCell className="font-medium">{form.period}</TableCell>
                  <TableCell>{form.year}</TableCell>
                  <TableCell className="text-right">{formatCurrency(form.outputVat)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(form.inputVat)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(form.vatDue)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[form.status]}>
                      {statusLabels[form.status]}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {form.submittedDate ? new Date(form.submittedDate).toLocaleDateString('sr-RS') : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" title="Prikaži">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Preuzmi PDF">
                        <Download className="h-4 w-4" />
                      </Button>
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

export default PPPDV;
