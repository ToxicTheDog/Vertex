import { useState } from 'react';
import { RefreshCw, Plus, Search, Play, Pause, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Switch } from '@/components/ui/switch';
import { demoRecurringInvoices } from '@/data/demoData';
import { RecurringInvoiceDialog, RecurringInvoiceFormData } from '@/components/dialogs/RecurringInvoiceDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

const frequencyLabels = {
  weekly: 'Nedeljno',
  monthly: 'Mesečno',
  quarterly: 'Kvartalno',
  yearly: 'Godišnje'
};

const RecurringInvoices = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [invoices, setInvoices] = useState(demoRecurringInvoices);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit'>('create');
  const [selectedInvoice, setSelectedInvoice] = useState<RecurringInvoiceFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [invoiceToDelete, setInvoiceToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredInvoices = invoices.filter(invoice => {
    return invoice.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           invoice.articleDescription.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const toggleActive = (id: string) => {
    setInvoices(invoices.map(inv => 
      inv.id === id ? { ...inv, isActive: !inv.isActive } : inv
    ));
    const invoice = invoices.find(i => i.id === id);
    toast({
      title: invoice?.isActive ? "Faktura pauzirana" : "Faktura aktivirana",
      description: `Automatska faktura za ${invoice?.clientName} je ${invoice?.isActive ? 'pauzirana' : 'aktivirana'}.`
    });
  };

  const handleCreate = () => {
    setSelectedInvoice(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleEdit = (invoice: typeof invoices[0]) => {
    setSelectedInvoice({
      id: invoice.id,
      clientId: invoice.clientId,
      clientName: invoice.clientName,
      articleDescription: invoice.articleDescription,
      amount: invoice.amount,
      frequency: invoice.frequency,
      nextDate: invoice.nextDate,
      isActive: invoice.isActive
    });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (data: RecurringInvoiceFormData) => {
    if (dialogMode === 'create') {
      const newInvoice = {
        ...data,
        id: `ri-${Date.now()}`,
        lastGenerated: null
      };
      setInvoices([newInvoice, ...invoices]);
      toast({
        title: "Automatska faktura kreirana",
        description: `Faktura za ${data.clientName} će se generisati ${frequencyLabels[data.frequency].toLowerCase()}.`
      });
    } else if (data.id) {
      setInvoices(invoices.map(i => i.id === data.id ? { ...i, ...data } : i));
      toast({
        title: "Automatska faktura ažurirana",
        description: "Podešavanja su uspešno sačuvana."
      });
    }
  };

  const handleDelete = (id: string) => {
    setInvoiceToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (invoiceToDelete) {
      setInvoices(invoices.filter(i => i.id !== invoiceToDelete));
      toast({
        title: "Automatska faktura obrisana",
        description: "Faktura je uspešno obrisana."
      });
      setInvoiceToDelete(null);
    }
  };

  const activeInvoices = invoices.filter(i => i.isActive);
  const monthlyTotal = activeInvoices.reduce((sum, inv) => {
    const multiplier = inv.frequency === 'weekly' ? 4 : inv.frequency === 'quarterly' ? 0.33 : inv.frequency === 'yearly' ? 0.083 : 1;
    return sum + (inv.amount * multiplier);
  }, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Automatske fakture</h1>
          <p className="text-muted-foreground">Podešavanje ponavljajućih faktura</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Nova automatska faktura
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno podešenih</CardTitle>
            <RefreshCw className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktivne</CardTitle>
            <Play className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeInvoices.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pauzirane</CardTitle>
            <Pause className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{invoices.filter(i => !i.isActive).length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Mesečni prihod</CardTitle>
            <RefreshCw className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(monthlyTotal)}</div>
            <p className="text-xs text-muted-foreground">procena</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Automatske fakture</CardTitle>
          <CardDescription>Lista svih podešenih automatskih faktura</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po klijentu ili opisu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Klijent</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Učestalost</TableHead>
                <TableHead>Sledeći datum</TableHead>
                <TableHead>Poslednje generisana</TableHead>
                <TableHead>Aktivna</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredInvoices.map((invoice) => (
                <TableRow key={invoice.id}>
                  <TableCell className="font-medium">{invoice.clientName}</TableCell>
                  <TableCell>{invoice.articleDescription}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(invoice.amount)}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{frequencyLabels[invoice.frequency]}</Badge>
                  </TableCell>
                  <TableCell>{new Date(invoice.nextDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    {invoice.lastGenerated ? new Date(invoice.lastGenerated).toLocaleDateString('sr-RS') : '-'}
                  </TableCell>
                  <TableCell>
                    <Switch 
                      checked={invoice.isActive} 
                      onCheckedChange={() => toggleActive(invoice.id)}
                    />
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Izmeni" onClick={() => handleEdit(invoice)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Obriši" onClick={() => handleDelete(invoice.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <RecurringInvoiceDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        invoice={selectedInvoice}
        onSave={handleSave}
        mode={dialogMode}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Obrisati automatsku fakturu?"
        description="Da li ste sigurni da želite da obrišete ovu automatsku fakturu? Neće se više generisati nove fakture."
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default RecurringInvoices;
