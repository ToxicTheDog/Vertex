import { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, FileCheck, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoInvoices } from '@/data/demoData';
import { Link } from 'react-router-dom';
import { InvoiceViewDialog, InvoiceData } from '@/components/dialogs/InvoiceViewDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { invoicesApi } from '@/services/apiService';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  sent: 'bg-primary/20 text-primary',
  paid: 'bg-success/20 text-success',
  overdue: 'bg-destructive/20 text-destructive',
  cancelled: 'bg-muted text-muted-foreground'
};

const statusLabels = {
  draft: 'Nacrt',
  sent: 'Poslat',
  paid: 'Plaćen',
  overdue: 'Dospeo',
  cancelled: 'Otkazan'
};

const Proforma = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [invoices, setInvoices] = useState(demoInvoices.filter(inv => inv.type === 'proforma'));
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [convertDialogOpen, setConvertDialogOpen] = useState(false);
  const [invoiceToConvert, setInvoiceToConvert] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         invoice.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || invoice.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

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

  const handleConvert = (id: string) => {
    setInvoiceToConvert(id);
    setConvertDialogOpen(true);
  };

  const confirmConvert = () => {
    if (invoiceToConvert) {
      const proforma = invoices.find(i => i.id === invoiceToConvert);
      setInvoices(invoices.map(inv => 
        inv.id === invoiceToConvert ? { ...inv, status: 'paid' as const } : inv
      ));
      toast({
        title: "Predračun konvertovan",
        description: `Predračun ${proforma?.number} je konvertovan u fakturu.`
      });
      setInvoiceToConvert(null);
    }
  };

  const handleSend = (invoice: typeof invoices[0]) => {
    setInvoices(invoices.map(inv => 
      inv.id === invoice.id ? { ...inv, status: 'sent' as const } : inv
    ));
    toast({
      title: "Predračun poslat",
      description: `Predračun ${invoice.number} je poslat klijentu ${invoice.clientName}.`
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Predračuni</h1>
          <p className="text-muted-foreground">Upravljanje predračunima i konverzija u fakture</p>
        </div>
        <Button asChild>
          <Link to="/invoices/create">
            <Plus className="mr-2 h-4 w-4" />
            Novi predračun
          </Link>
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno predračuna</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">U nacrtu</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'draft').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Poslati</CardTitle>
            <Send className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'sent').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Konvertovani</CardTitle>
            <FileCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'paid').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista predračuna</CardTitle>
          <CardDescription>Pregled svih predračuna sa opcijama pretrage i filtriranja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po klijentu ili broju..."
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
                <SelectItem value="draft">Nacrt</SelectItem>
                <SelectItem value="sent">Poslat</SelectItem>
                <SelectItem value="paid">Konvertovan</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj</TableHead>
                <TableHead>Klijent</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Važi do</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    Nema predračuna koji odgovaraju pretrazi
                  </TableCell>
                </TableRow>
              ) : (
                filteredInvoices.map((invoice) => (
                  <TableRow key={invoice.id}>
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
                      <div className="flex justify-end gap-1">
                        <Button variant="ghost" size="icon" title="Prikaži" onClick={() => handleView(invoice)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                        {invoice.status === 'draft' && (
                          <Button variant="ghost" size="icon" title="Pošalji" onClick={() => handleSend(invoice)}>
                            <Send className="h-4 w-4 text-primary" />
                          </Button>
                        )}
                        {invoice.status !== 'paid' && (
                          <Button variant="ghost" size="icon" title="Konvertuj u fakturu" onClick={() => handleConvert(invoice.id)}>
                            <FileCheck className="h-4 w-4 text-success" />
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <InvoiceViewDialog
        open={viewDialogOpen}
        onOpenChange={setViewDialogOpen}
        invoice={selectedInvoice}
      />

      <ConfirmDialog
        open={convertDialogOpen}
        onOpenChange={setConvertDialogOpen}
        title="Konvertovati u fakturu?"
        description="Da li ste sigurni da želite da konvertujete ovaj predračun u fakturu? Biće kreirana nova faktura sa istim podacima."
        confirmLabel="Konvertuj"
        onConfirm={confirmConvert}
      />
    </div>
  );
};

export default Proforma;
