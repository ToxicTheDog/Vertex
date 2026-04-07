import { useState } from 'react';
import { FileDown, Search, Filter, Eye, CheckCircle, XCircle, Upload } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoReceivedInvoices } from '@/data/demoData';
import { InvoiceViewDialog, InvoiceData } from '@/components/dialogs/InvoiceViewDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { receivedInvoicesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const statusColors = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-primary/20 text-primary',
  paid: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const statusLabels = {
  pending: 'Na čekanju',
  approved: 'Odobren',
  paid: 'Plaćen',
  rejected: 'Odbijen'
};

const sefStatusColors = {
  received: 'bg-muted text-muted-foreground',
  accepted: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const sefStatusLabels = {
  received: 'Primljen',
  accepted: 'Prihvaćen',
  rejected: 'Odbijen'
};

const ReceivedInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: invoices, setData: setInvoices, isLoading: _isLoading, refetch } = useFetchData(() => receivedInvoicesApi.getAll(), demoReceivedInvoices);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<InvoiceData | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [rejectDialogOpen, setRejectDialogOpen] = useState(false);
  const [invoiceToAction, setInvoiceToAction] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    const matchesSearch = invoice.supplierName.toLowerCase().includes(searchTerm.toLowerCase()) ||
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
      clientName: invoice.supplierName,
      date: invoice.date,
      dueDate: invoice.dueDate,
      status: invoice.status === 'pending' ? 'draft' : invoice.status === 'approved' ? 'sent' : invoice.status === 'rejected' ? 'cancelled' : invoice.status,
      total: invoice.total
    });
    setViewDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    setInvoiceToAction(id);
    setApproveDialogOpen(true);
  };

  const confirmApprove = () => {
    if (invoiceToAction) {
      setInvoices(invoices.map(inv => 
        inv.id === invoiceToAction ? { ...inv, status: 'approved' as const, sefStatus: 'accepted' as const } : inv
      ));
      toast({
        title: "Faktura odobrena",
        description: "Primljena faktura je odobrena za plaćanje."
      });
      setInvoiceToAction(null);
    }
  };

  const handleReject = (id: string) => {
    setInvoiceToAction(id);
    setRejectDialogOpen(true);
  };

  const confirmReject = () => {
    if (invoiceToAction) {
      setInvoices(invoices.map(inv => 
        inv.id === invoiceToAction ? { ...inv, status: 'rejected' as const, sefStatus: 'rejected' as const } : inv
      ));
      toast({
        title: "Faktura odbijena",
        description: "Primljena faktura je odbijena."
      });
      setInvoiceToAction(null);
    }
  };

  const handleImport = () => {
    toast({
      title: "Uvoz iz SEF-a",
      description: "Preuzimanje novih faktura iz Sistem Elektronskih Faktura..."
    });
    // Simulate import after a delay
    setTimeout(() => {
      const total = Math.floor(Math.random() * 500000) + 50000;
      const newInvoice = {
        id: `ri-${Date.now()}`,
        number: `SEF-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`,
        supplierId: 'supplier-new',
        supplierName: 'Novi dobavljač d.o.o.',
        date: new Date().toISOString().split('T')[0],
        dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        subtotal: Math.round(total / 1.2),
        vat: Math.round(total - total / 1.2),
        total: total,
        status: 'pending' as const,
        sefStatus: 'received' as const
      };
      setInvoices([newInvoice, ...invoices]);
      toast({
        title: "Nova faktura uvezena",
        description: `Faktura ${newInvoice.number} od ${newInvoice.supplierName} je uvezena.`
      });
    }, 1500);
  };

  const totalAmount = invoices.reduce((sum, inv) => sum + inv.total, 0);
  const pendingAmount = invoices.filter(i => i.status === 'pending').reduce((sum, inv) => sum + inv.total, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Primljeni računi (SEF)</h1>
          <p className="text-muted-foreground">Pregled i upravljanje ulaznim fakturama iz SEF sistema</p>
        </div>
        <Button onClick={handleImport}>
          <Upload className="mr-2 h-4 w-4" />
          Uvezi iz SEF-a
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno računa</CardTitle>
            <FileDown className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(totalAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Na čekanju</CardTitle>
            <FileDown className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'pending').length}</div>
            <p className="text-xs text-muted-foreground">{formatCurrency(pendingAmount)}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Odobreni</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'approved').length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Plaćeni</CardTitle>
            <CheckCircle className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => i.status === 'paid').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista primljenih računa</CardTitle>
          <CardDescription>Fakture primljene putem sistema elektronskih faktura</CardDescription>
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
                <SelectItem value="rejected">Odbijen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj</TableHead>
                <TableHead>Dobavljač</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Valuta</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>SEF Status</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.number}</TableCell>
                  <TableCell>{invoice.supplierName}</TableCell>
                  <TableCell>{new Date(invoice.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(invoice.dueDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(invoice.total)}</TableCell>
                  <TableCell>
                    {invoice.sefStatus && (
                      <Badge className={sefStatusColors[invoice.sefStatus]}>
                        {sefStatusLabels[invoice.sefStatus]}
                      </Badge>
                    )}
                  </TableCell>
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
                      {invoice.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" title="Odobri" onClick={() => handleApprove(invoice.id)}>
                            <CheckCircle className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" title="Odbij" onClick={() => handleReject(invoice.id)}>
                            <XCircle className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                    </div>
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
      />

      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Odobriti fakturu?"
        description="Da li ste sigurni da želite da odobrite ovu ulaznu fakturu za plaćanje?"
        confirmLabel="Odobri"
        onConfirm={confirmApprove}
      />

      <ConfirmDialog
        open={rejectDialogOpen}
        onOpenChange={setRejectDialogOpen}
        title="Odbiti fakturu?"
        description="Da li ste sigurni da želite da odbijete ovu ulaznu fakturu? Dobavljač će biti obavešten."
        confirmLabel="Odbij"
        variant="destructive"
        onConfirm={confirmReject}
      />
    </div>
  );
};

export default ReceivedInvoices;
