import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Wallet, Calculator, CheckCircle, FileText, Eye, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { demoPayrollEntries, PayrollEntry } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { employeesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const statusLabels: Record<string, string> = {
  draft: 'Nacrt',
  approved: 'Odobreno',
  paid: 'Isplaćeno',
};

const statusColors: Record<string, string> = {
  draft: 'bg-muted text-muted-foreground',
  approved: 'bg-info text-info-foreground',
  paid: 'bg-success text-success-foreground',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const Payroll = () => {
  const { data: entries, setData: setEntries, isLoading: _isLoading, refetch } = useFetchData(() => employeesApi.getAll(), demoPayrollEntries);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);

  const totalGross = entries.reduce((sum, e) => sum + e.grossSalary, 0);
  const totalNet = entries.reduce((sum, e) => sum + e.netSalary, 0);
  const totalTax = entries.reduce((sum, e) => sum + e.tax, 0);
  const totalContributions = entries.reduce((sum, e) => sum + e.socialContributions, 0);

  const handleView = (entry: PayrollEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, status: 'approved' } : e));
    toast.success('Obračun je odobren');
  };

  const handlePay = (id: string) => {
    setEntries(entries.map(e => e.id === id ? { ...e, status: 'paid' } : e));
    toast.success('Plata je isplaćena');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Obračun zarada</h1>
          <p className="text-muted-foreground">Mesečni obračun plata zaposlenih</p>
        </div>
        <Button>
          <Calculator className="mr-2 h-4 w-4" />
          Novi obračun
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno bruto</p>
                <p className="text-2xl font-bold">{formatCurrency(totalGross)}</p>
              </div>
              <Wallet className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno neto</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(totalNet)}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Porez</p>
                <p className="text-2xl font-bold text-warning">{formatCurrency(totalTax)}</p>
              </div>
              <FileText className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Doprinosi</p>
                <p className="text-2xl font-bold">{formatCurrency(totalContributions)}</p>
              </div>
              <Calculator className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Obračuni za mart 2024</CardTitle>
          <CardDescription>Svi obračuni za tekući mesec</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaposleni</TableHead>
                <TableHead>Period</TableHead>
                <TableHead className="text-right">Bruto</TableHead>
                <TableHead className="text-right">Porez</TableHead>
                <TableHead className="text-right">Doprinosi</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="font-medium">{entry.employeeName}</TableCell>
                  <TableCell>{entry.month}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.grossSalary)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.tax)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(entry.socialContributions)}</TableCell>
                  <TableCell className="text-right font-bold">{formatCurrency(entry.netSalary)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[entry.status]}>
                      {statusLabels[entry.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {entry.status === 'draft' && (
                        <Button variant="ghost" size="sm" onClick={() => handleApprove(entry.id)}>
                          <Check className="mr-1 h-4 w-4" />
                          Odobri
                        </Button>
                      )}
                      {entry.status === 'approved' && (
                        <Button variant="ghost" size="sm" onClick={() => handlePay(entry.id)}>
                          <Send className="mr-1 h-4 w-4" />
                          Isplati
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

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalji obračuna</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Wallet className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedEntry.employeeName}</h3>
                  <Badge className={statusColors[selectedEntry.status]}>
                    {statusLabels[selectedEntry.status]}
                  </Badge>
                </div>
              </div>
              <div className="space-y-3 pt-4">
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Bruto plata</span>
                  <span className="font-medium">{formatCurrency(selectedEntry.grossSalary)}</span>
                </div>
                {selectedEntry.bonuses > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Bonusi</span>
                    <span className="font-medium text-success">+{formatCurrency(selectedEntry.bonuses)}</span>
                  </div>
                )}
                {selectedEntry.deductions > 0 && (
                  <div className="flex justify-between py-2 border-b">
                    <span className="text-muted-foreground">Odbici</span>
                    <span className="font-medium text-destructive">-{formatCurrency(selectedEntry.deductions)}</span>
                  </div>
                )}
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Porez na dohodak</span>
                  <span className="font-medium">-{formatCurrency(selectedEntry.tax)}</span>
                </div>
                <div className="flex justify-between py-2 border-b">
                  <span className="text-muted-foreground">Socijalni doprinosi</span>
                  <span className="font-medium">-{formatCurrency(selectedEntry.socialContributions)}</span>
                </div>
                <div className="flex justify-between py-4 bg-success/10 rounded-lg px-4">
                  <span className="font-bold">Neto plata</span>
                  <span className="text-2xl font-bold text-success">{formatCurrency(selectedEntry.netSalary)}</span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Payroll;
