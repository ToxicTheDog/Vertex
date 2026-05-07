import { useEffect, useState } from 'react';
import { CreditCard, Plus, Search, Filter, Eye, CheckCircle, Send, Clock } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { PaymentOrderDialog, PaymentOrderFormData } from '@/components/dialogs/PaymentOrderDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';
import { paymentOrdersApi } from '@/services/apiService';

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-primary/20 text-primary',
  executed: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const statusLabels: Record<string, string> = {
  pending: 'Na cekanju',
  approved: 'Odobren',
  executed: 'Izvrsen',
  rejected: 'Odbijen'
};

const formatCurrency = (amount: number) =>
  new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('sr-RS');
};

const PaymentOrders = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'view'>('create');
  const [selectedOrder, setSelectedOrder] = useState<PaymentOrderFormData | null>(null);
  const [approveDialogOpen, setApproveDialogOpen] = useState(false);
  const [executeDialogOpen, setExecuteDialogOpen] = useState(false);
  const [orderToAction, setOrderToAction] = useState<string | null>(null);
  const { toast } = useToast();

  const fetchOrders = async (page = currentPage, status = statusFilter, search = searchTerm) => {
    const response = await paymentOrdersApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      status: status === 'all' ? undefined : status,
      search,
    });

    setOrders(response.success ? response.data : []);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
    setTotalItems(response.success ? response.total || 0 : 0);
  };

  useEffect(() => {
    fetchOrders(currentPage, statusFilter, searchTerm);
  }, [currentPage, statusFilter, searchTerm]);

  const handleCreate = () => {
    setSelectedOrder(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (order: any) => {
    setSelectedOrder({
      id: order.id,
      number: order.number,
      date: order.date,
      recipientName: order.recipientName,
      recipientAccount: order.recipientAccount,
      amount: Number(order.amount) || 0,
      purpose: order.purpose,
      referenceNumber: order.referenceNumber || '',
      status: order.status
    });
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleSave = async (data: PaymentOrderFormData) => {
    const response = await paymentOrdersApi.create(data);

    if (!response.success) {
      toast({
        title: 'Greska',
        description: response.message || 'Nalog nije kreiran.',
        variant: 'destructive'
      });
      return;
    }

    toast({
      title: 'Nalog kreiran',
      description: 'Nalog za placanje je uspesno kreiran.'
    });
    fetchOrders(currentPage, statusFilter, searchTerm);
  };

  const handleApprove = (id: string) => {
    setOrderToAction(id);
    setApproveDialogOpen(true);
  };

  const confirmApprove = async () => {
    if (!orderToAction) return;

    const response = await paymentOrdersApi.approve(orderToAction);
    if (!response.success) {
      toast({ title: 'Greska', description: response.message || 'Odobravanje nije uspelo.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Nalog odobren', description: 'Nalog za placanje je odobren.' });
    setApproveDialogOpen(false);
    setOrderToAction(null);
    fetchOrders(currentPage, statusFilter, searchTerm);
  };

  const handleExecute = (id: string) => {
    setOrderToAction(id);
    setExecuteDialogOpen(true);
  };

  const confirmExecute = async () => {
    if (!orderToAction) return;

    const response = await paymentOrdersApi.execute(orderToAction);
    if (!response.success) {
      toast({ title: 'Greska', description: response.message || 'Izvrsenje nije uspelo.', variant: 'destructive' });
      return;
    }

    toast({ title: 'Nalog izvrsen', description: 'Nalog za placanje je uspesno izvrsen.' });
    setExecuteDialogOpen(false);
    setOrderToAction(null);
    fetchOrders(currentPage, statusFilter, searchTerm);
  };

  const totalPending = orders.filter((order) => order.status === 'pending').reduce((sum, order) => sum + (Number(order.amount) || 0), 0);
  const totalApproved = orders.filter((order) => order.status === 'approved').reduce((sum, order) => sum + (Number(order.amount) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Nalozi za placanje</h1>
          <p className="text-muted-foreground">Kreiranje i pregled naloga za placanje</p>
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
            <div className="text-2xl font-bold">{totalItems}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Na cekanju</CardTitle>
            <Clock className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalPending)}</div>
            <p className="text-xs text-muted-foreground">{orders.filter((order) => order.status === 'pending').length} naloga</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Odobreni</CardTitle>
            <CheckCircle className="h-4 w-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalApproved)}</div>
            <p className="text-xs text-muted-foreground">{orders.filter((order) => order.status === 'approved').length} naloga</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Izvrseni</CardTitle>
            <Send className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{orders.filter((order) => order.status === 'executed').length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista naloga za placanje</CardTitle>
          <CardDescription>Pregled svih naloga sa opcijama pretrage i filtriranja</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi po primaocu ili broju..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={(value) => {
              setStatusFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="pending">Na cekanju</SelectItem>
                <SelectItem value="approved">Odobren</SelectItem>
                <SelectItem value="executed">Izvrsen</SelectItem>
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
                <TableHead>Racun primaoca</TableHead>
                <TableHead>Svrha</TableHead>
                <TableHead className="text-right">Iznos</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.number}</TableCell>
                  <TableCell>{formatDate(order.date)}</TableCell>
                  <TableCell>{order.recipientName}</TableCell>
                  <TableCell className="font-mono text-sm">{order.recipientAccount}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{order.purpose}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(Number(order.amount) || 0)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status] || statusColors.pending}>
                      {statusLabels[order.status] || order.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Prikazi" onClick={() => handleView(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="icon" title="Odobri" onClick={() => handleApprove(order.id)}>
                          <CheckCircle className="h-4 w-4 text-success" />
                        </Button>
                      )}
                      {order.status === 'approved' && (
                        <Button variant="ghost" size="icon" title="Izvrsi" onClick={() => handleExecute(order.id)}>
                          <Send className="h-4 w-4 text-primary" />
                        </Button>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {orders.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nema naloga za prikaz.
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
        description="Da li ste sigurni da zelite da odobrite ovaj nalog za placanje?"
        confirmLabel="Odobri"
        onConfirm={confirmApprove}
      />

      <ConfirmDialog
        open={executeDialogOpen}
        onOpenChange={setExecuteDialogOpen}
        title="Izvrsiti nalog?"
        description="Da li ste sigurni da zelite da izvrsite ovaj nalog za placanje?"
        confirmLabel="Izvrsi"
        onConfirm={confirmExecute}
      />
    </div>
  );
};

export default PaymentOrders;
