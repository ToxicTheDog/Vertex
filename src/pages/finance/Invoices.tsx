import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Search, Filter, Download, MoreHorizontal, Eye, Edit, Trash2, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { demoInvoices } from '@/data/demoData';
import { InvoiceViewDialog, InvoiceData } from '@/components/dialogs/InvoiceViewDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { invoicesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const Invoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: invoices, setData: setInvoices, isLoading: _isLoading, refetch } = useFetchData(() => invoicesApi.getAll(), demoInvoices.filter(inv => inv.type === 'invoice'));
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = 
      invoice.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
      invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleView = (invoice: typeof invoices[0]) => {
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

  const handleSend = (invoice: InvoiceData) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    ));
    setViewDialogOpen(false);
    toast({
      title: "Faktura poslata",
      description: `Faktura ${invoice.number} je uspešno poslata klijentu.`
    });
  };

  const handleDownload = (invoice: InvoiceData) => {
    toast({
      title: "Preuzimanje PDF-a",
      description: `Faktura ${invoice.number} se preuzima...`
    });
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      setInvoices(invoices.filter(inv => inv.id !== invoiceToDelete));
      toast({
        title: "Faktura obrisana",
        description: "Faktura je uspešno obrisana."
      });
      setInvoiceToDelete(null);
    }
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
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po broju ili klijentu..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Select value={statusFilter} onValueChange={setStatusFilter}>
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
        <CardContent>
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
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id} className="data-table-row">
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.clientName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[invoice.status]}>
                      {statusLabels[invoice.status]}
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
                        <DropdownMenuItem onClick={() => {
                          setInvoices(invoices.map(inv => 
                            inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
                          ));
                          toast({
                            title: "Faktura poslata",
                            description: `Faktura ${invoice.number} je poslata klijentu.`
                          });
                        }}>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
        onSend={handleSend}
        onDownload={handleDownload}
      />

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
