import { useEffect, useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Wallet, Calculator, CheckCircle, FileText, Eye, Check, Send } from 'lucide-react';
import { toast } from 'sonner';
import { PayrollEntry } from '@/data/demoData';
import { payrollApi } from '@/services/apiService';
import { MonthPickerField } from '@/components/shared/MonthPickerField';

const PAGE_SIZE = 10;

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

const getCurrentMonthValue = () => new Date().toISOString().slice(0, 7);

const formatMonthLabel = (month: string) => {
  if (!month) {
    return 'Tekući mesec';
  }

  const [year, monthIndex] = month.split('-').map(Number);
  return new Intl.DateTimeFormat('sr-RS', { month: 'long', year: 'numeric' }).format(new Date(year, monthIndex - 1, 1));
};

const Payroll = () => {
  const [entries, setEntries] = useState<PayrollEntry[]>([]);
  const [selectedMonth, setSelectedMonth] = useState(getCurrentMonthValue);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [resolvedMonth, setResolvedMonth] = useState(getCurrentMonthValue);
  const [isLoading, setIsLoading] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<PayrollEntry | null>(null);

  const totalGross = entries.reduce((sum, entry) => sum + entry.grossSalary, 0);
  const totalNet = entries.reduce((sum, entry) => sum + entry.netSalary, 0);
  const totalTax = entries.reduce((sum, entry) => sum + entry.tax, 0);
  const totalContributions = entries.reduce((sum, entry) => sum + entry.socialContributions, 0);

  const pageNumbers = useMemo(() => {
    if (totalPages <= 1) {
      return [];
    }

    const start = Math.max(1, currentPage - 2);
    const end = Math.min(totalPages, currentPage + 2);
    const pages: number[] = [];

    for (let page = start; page <= end; page += 1) {
      pages.push(page);
    }

    return pages;
  }, [currentPage, totalPages]);

  const loadEntries = async (month = selectedMonth, page = currentPage) => {
    setIsLoading(true);

    try {
      const response = await payrollApi.getPage({
        month,
        page,
        pageSize: PAGE_SIZE,
      });

      if (!response.success) {
        setEntries([]);
        setTotalItems(0);
        setTotalPages(0);
        return;
      }

      setEntries(response.data as PayrollEntry[]);
      setTotalItems(response.total || 0);
      setTotalPages(response.totalPages || 0);
      setResolvedMonth(response.month || month);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadEntries(selectedMonth, currentPage);
  }, [selectedMonth, currentPage]);

  const handleView = (entry: PayrollEntry) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  const handleApprove = async (id: string) => {
    const response = await payrollApi.approve(id);

    if (!response.success) {
      toast.error(response.message || 'Obračun nije moguće odobriti');
      return;
    }

    setEntries((currentEntries) => currentEntries.map((entry) => (
      entry.id === id ? { ...entry, status: 'approved' } : entry
    )));
    toast.success('Obračun je odobren');
  };

  const handlePay = async (id: string) => {
    const response = await payrollApi.pay(id);

    if (!response.success) {
      toast.error(response.message || 'Isplata nije uspela');
      return;
    }

    setEntries((currentEntries) => currentEntries.map((entry) => (
      entry.id === id ? { ...entry, status: 'paid' } : entry
    )));
    toast.success('Plata je isplaćena');
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Obračun zarada</h1>
          <p className="text-muted-foreground">Mesečni obračun plata zaposlenih</p>
        </div>
        <div className="flex items-center gap-3">
          <MonthPickerField
            value={selectedMonth}
            max={getCurrentMonthValue()}
            onChange={(event) => {
              setSelectedMonth(event || getCurrentMonthValue());
              setCurrentPage(1);
            }}
            className="w-[220px]"
          />
          <Button>
            <Calculator className="mr-2 h-4 w-4" />
            Novi obračun
          </Button>
        </div>
      </div>

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

      <Card>
        <CardHeader>
          <CardTitle>Obračuni za {formatMonthLabel(resolvedMonth)}</CardTitle>
          <CardDescription>
            {totalItems > 0
              ? `Prikaz ${entries.length} od ukupno ${totalItems} obračuna`
              : 'Nema obračuna za izabrani mesec'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {!isLoading && entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nema obračuna za izabrani mesec.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage((page) => page - 1);
                      }
                    }}
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
                {pageNumbers.map((pageNumber) => (
                  <PaginationItem key={pageNumber}>
                    <PaginationLink
                      href="#"
                      isActive={pageNumber === currentPage}
                      onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageNumber);
                      }}
                    >
                      {pageNumber}
                    </PaginationLink>
                  </PaginationItem>
                ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage((page) => page + 1);
                      }
                    }}
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Detalji obračuna</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
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
                <div className="flex justify-between border-b py-2">
                  <span className="text-muted-foreground">Bruto plata</span>
                  <span className="font-medium">{formatCurrency(selectedEntry.grossSalary)}</span>
                </div>
                {selectedEntry.bonuses > 0 && (
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">Bonusi</span>
                    <span className="font-medium text-success">+{formatCurrency(selectedEntry.bonuses)}</span>
                  </div>
                )}
                {selectedEntry.deductions > 0 && (
                  <div className="flex justify-between border-b py-2">
                    <span className="text-muted-foreground">Odbici</span>
                    <span className="font-medium text-destructive">-{formatCurrency(selectedEntry.deductions)}</span>
                  </div>
                )}
                <div className="flex justify-between border-b py-2">
                  <span className="text-muted-foreground">Porez na dohodak</span>
                  <span className="font-medium">-{formatCurrency(selectedEntry.tax)}</span>
                </div>
                <div className="flex justify-between border-b py-2">
                  <span className="text-muted-foreground">Socijalni doprinosi</span>
                  <span className="font-medium">-{formatCurrency(selectedEntry.socialContributions)}</span>
                </div>
                <div className="flex justify-between rounded-lg bg-success/10 px-4 py-4">
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
