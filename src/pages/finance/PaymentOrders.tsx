import { useState } from 'react';
import { CreditCard, Plus, Search, Filter, Eye, CheckCircle, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoPaymentOrders } from '@/data/demoData';
import { PaymentOrderDialog, PaymentOrderFormData } from '@/components/dialogs/PaymentOrderDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { paymentOrdersApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const statusColors = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-primary/20 text-primary',
  executed: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const statusLabels = {
  pending: 'Na čekanju',
  approved: 'Odobren',
  executed: 'Izvršen',
  rejected: 'Odbijen'
};

const PaymentOrders = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const { data: orders, setData: setOrders, isLoading: _isLoading, refetch } = useFetchData(() => paymentOrdersApi.getAll(), demoPaymentOrders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrderFormData | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [orderToAction, setOrderToAction] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.recipientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         order.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const handleCreate = () => {
    setSelectedOrder(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (order: typeof orders[0]) => {
    setSelectedOrder({
      id: order.id,
      number: order.number,
      date: order.date,
      recipientName: order.recipientName,
      recipientAccount: order.recipientAccount,
      amount: order.amount,
      purpose: order.purpose,
      status: order.status
    });
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSave = (data: PaymentOrderFormData) => {
    const newOrder = {
      ...data,
      id: `po-${Date.now()}`,
      paymentCode: '289',
      referenceNumber: data.referenceNumber || ''
    };
    setOrders([newOrder, ...orders]);
    toast({
      title: "Nalog kreiran",
      description: `Nalog ${data.number} je uspešno kreiran.`
    });
  };

  const handleApprove = (id: string) => {
    setOrderToAction(id);
    setApproveDialogOpen(true);
  };

  const confirmApprove = () => {
    if (orderToAction) {
      setOrders(orders.map(o => 
        o.id === orderToAction ? { ...o, status: 'approved' as const } : o
      ));
      toast({
        title: "Nalog odobren",
        description: "Nalog za plaćanje je odobren."
      });
      setOrderToAction(null);
    }
  };

  const handleExecute = (id: string) => {
    setOrderToAction(id);
    setExecuteDialogOpen(true);
  };

  const confirmExecute = () => {
    if (orderToAction) {
      setOrders(orders.map(o => 
        o.id === orderToAction ? { ...o, status: 'executed' as const } : o
      ));
      toast({
        title: "Nalog izvršen",
        description: "Nalog za plaćanje je uspešno izvršen."
      });
      setOrderToAction(null);
    }
  };

  const totalPending = orders.filter(o => o.status === 'pending').reduce((sum, o) => sum + o.amount, 0);
  const totalApproved = orders.filter(o => o.status === 'approved').reduce((sum, o) => sum + o.amount, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nalozi za plaćanje</h1>
          <p className="text-muted-foreground">Kreiranje i pregled naloga za plaćanje</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novi nalog
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno naloga</CardTitle>
            <CreditCard className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Na čekanju</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">{orders.filter(o => o.status === 'pending').length} naloga</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Odobreni</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalApproved)}</div>
            <p className="text-xs text-muted-foreground">{orders.filter(o => o.status === 'approved').length} naloga</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Izvršeni</CardTitle>
            <Send className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter(o => o.status === 'executed').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista naloga za plaćanje</CardTitle>
          <CardDescription>Pregled svih naloga sa opcijama pretrage i filtriranja</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po primaocu ili broju..."
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
                <SelectItem value="executed">Izvršen</SelectItem>
                <SelectItem value="rejected">Odbijen</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj naloga</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Primalac</TableHead>
                <TableHead>Račun primaoca</TableHead>
                <TableHead>Svrha</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredOrders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.number}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{order.recipientName}</TableCell>
                  <TableCell className="font-mono text-sm">{order.recipientAccount}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.purpose}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(order.amount)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Prikaži" onClick={() => handleView(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="icon" title="Odobri" onClick={() => handleApprove(order.id)}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {order.status === 'approved' && (
                        <Button variant="ghost" size="icon" title="Izvrši" onClick={() => handleExecute(order.id)}>
                          <Send className="h-4 w-4 text-primary" />
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

      <PaymentOrderDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        paymentOrder={selectedOrder}
        onSave={handleSave}
        mode={dialogMode}
      />

      <ConfirmDialog
        open={approveDialogOpen}
        onOpenChange={setApproveDialogOpen}
        title="Odobriti nalog?"
        description="Da li ste sigurni da želite da odobrite ovaj nalog za plaćanje?"
        confirmLabel="Odobri"
        onConfirm={confirmApprove}
      />

      <ConfirmDialog
        open={executeDialogOpen}
        onOpenChange={setExecuteDialogOpen}
        title="Izvršiti nalog?"
        description="Da li ste sigurni da želite da izvršite ovaj nalog za plaćanje? Sredstva će biti preneta na račun primaoca."
        confirmLabel="Izvrši"
        onConfirm={confirmExecute}
      />
    </div>
  );
};

export default PaymentOrders;
