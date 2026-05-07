import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { InvoiceViewDialog, InvoiceData } from '@/components/dialogs/InvoiceViewDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { invoicesApi } from '@/services/apiService';

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  paid: 'bg-success text-success-foreground',
  sent: 'bg-info text-info-foreground',
  overdue: 'bg-destructive text-destructive-foreground',
  draft: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground'
};

const statusLabels: Record<string, string> = {
  paid: 'Plaćeno',
  sent: 'Poslato',
  overdue: 'Dospelo',
  draft: 'Nacrt',
  cancelled: 'Otkazano'
};

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchInvoices = async (page = currentPage, status = statusFilter) => {
    const response = await invoicesApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      status: status === 'all' ? undefined : status,
      search: searchTerm,
    });

    setInvoices(response.success ? response.data : []);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  useEffect(() => {
    fetchInvoices(currentPage, statusFilter);
  }, [currentPage, statusFilter, searchTerm]);

  const handleView = (invoice: any) => {
    setSelectedInvoice({
      id: invoice.id,
      number: invoice.number,
      clientName: invoice.clientName,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status,
      total: invoice.total
    });
    setViewDialogOpen(true);
  };

  const handleSend = async (invoice: InvoiceData) => {
    const response = await invoicesApi.send(invoice.id);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Slanje nije uspelo', variant: 'destructive' });
      return;
    }

    setInvoices((currentInvoices) => currentInvoices.map((currentInvoice) =>
      currentInvoice.id === invoice.id ? { ...currentInvoice, status: 'sent' } : currentInvoice
    ));
    setViewDialogOpen(false);
    toast({ title: 'Faktura poslata', description: `Faktura ${invoice.number} je uspešno poslata klijentu.` });
  };

  const handleDownload = (invoice: InvoiceData) => {
    toast({ title: 'Preuzimanje PDF-a', description: `Faktura ${invoice.number} se preuzima...` });
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (!invoiceToDelete) {
      return;
    }

    const response = await invoicesApi.delete(invoiceToDelete);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Brisanje nije uspelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Faktura obrisana', description: 'Faktura je uspešno obrisana.' });

    if (invoices.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchInvoices(currentPage, statusFilter);
    }

    setInvoiceToDelete(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izdati računi</h1>
          <p className="text-muted-foreground">Pregled i upravljanje fakturama</p>
        </div>
        <Button asChild>
          <Link to="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Nova faktura
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po broju ili klijentu..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={(value) => {
                setStatusFilter(value);
                setCurrentPage(1);
              }}>
                <SelectTrigger className="w-[180px]">
                  <Filter className="mr-2 h-4 w-4" />
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Svi statusi</SelectItem>
                  <SelectItem value="draft">Nacrt</SelectItem>
                  <SelectItem value="sent">Poslato</SelectItem>
                  <SelectItem value="paid">Plaćeno</SelectItem>
                  <SelectItem value="overdue">Dospelo</SelectItem>
                </SelectContent>
              </Select>
              <Button variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Izvezi
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj fakture</TableHead>
                <TableHead>Klijent</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Rok plaćanja</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {invoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(invoice.total) || 0)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status] || statusColors.draft}>
                      {statusLabels[invoice.status] || invoice.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akcije</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleView(invoice)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Prikaži
                        </DropdownMenuItem>
                        <DropdownMenuItem asChild>
                          <Link to="/invoices/create">
                            <Edit className="mr-2 h-4 w-4" />
                            Izmeni
                          </Link>
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleSend({
                          id: invoice.id,
                          number: invoice.number,
                          clientName: invoice.clientName,
                          date: invoice.date,
                          dueDate: invoice.dueDate,
                          status: invoice.status,
                          total: invoice.total
                        })}>
                          <Send className="mr-2 h-4 w-4" />
                          Pošalji
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleDownload({
                          id: invoice.id,
                          number: invoice.number,
                          clientName: invoice.clientName,
                          date: invoice.date,
                          dueDate: invoice.dueDate,
                          status: invoice.status,
                          total: invoice.total
                        })}>
                          <Download className="mr-2 h-4 w-4" />
                          Preuzmi PDF
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(invoice.id)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {invoices.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema faktura za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage((page) => page - 1);
                  }} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                  .map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink href="#" isActive={pageNumber === currentPage} onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageNumber);
                      }}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext href="#" className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((page) => page + 1);
                  }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <InvoiceViewDialog open={viewDialogOpen} onOpenChange={setViewDialogOpen} invoice={selectedInvoice} onSend={handleSend} onDownload={handleDownload} />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Obrisati fakturu?"
        description="Da li ste sigurni da želite da obrišete ovu fakturu? Ova akcija se ne može poništiti."
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Invoices;
