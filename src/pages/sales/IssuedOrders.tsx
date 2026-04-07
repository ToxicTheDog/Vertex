import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Send, Package, Truck, CheckCircle, Eye, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoIssuedOrders, demoSuppliers, demoArticles, Order } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { ordersApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const statusLabels: Record<string, string> = {
  pending: 'Na čekanju',
  confirmed: 'Potvrđena',
  shipped: 'U transportu',
  delivered: 'Primljeno',
  cancelled: 'Otkazana',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  confirmed: 'bg-info text-info-foreground',
  shipped: 'bg-purple-500/10 text-purple-500',
  delivered: 'bg-success text-success-foreground',
  cancelled: 'bg-destructive text-destructive-foreground',
};

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const IssuedOrders = () => {
  const { data: orders, setData: setOrders, isLoading: _isLoading, refetch } = useFetchData(() => ordersApi.getIssued(), demoIssuedOrders);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  
  const [formData, setFormData] = useState({
    supplierId: '',
    articleId: '',
    quantity: '',
  });

  const handleSubmit = () => {
    const supplier = demoSuppliers.find(s => s.id === formData.supplierId);
    const article = demoArticles.find(a => a.id === formData.articleId);
    
    if (!supplier || !article) {
      toast.error('Izaberite dobavljača i artikal');
      return;
    }

    const quantity = parseInt(formData.quantity);
    const total = quantity * article.price * 0.9; // pretpostavljena nabavna cena

    const newOrder: Order = {
      id: Date.now().toString(),
      number: `NAB-${new Date().getFullYear()}-${String(orders.length + 1).padStart(3, '0')}`,
      date: new Date().toISOString().split('T')[0],
      supplierId: supplier.id,
      supplierName: supplier.name,
      items: [{
        id: '1',
        articleId: article.id,
        articleName: article.name,
        quantity,
        unit: article.unit,
        price: article.price * 0.9,
        total,
      }],
      total,
      status: 'pending',
      type: 'issued',
    };

    setOrders([newOrder, ...orders]);
    toast.success('Narudžba je uspešno kreirana');
    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      supplierId: '',
      articleId: '',
      quantity: '',
    });
    setSelectedOrder(null);
  };

  const handleView = (order: Order) => {
    setSelectedOrder(order);
    setViewDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setOrders(orders.filter(o => o.id !== id));
    toast.success('Narudžba je obrisana');
  };

  const updateStatus = (id: string, status: Order['status']) => {
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o));
    toast.success('Status narudžbe je ažuriran');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izdate narudžbe</h1>
          <p className="text-muted-foreground">Narudžbe prema dobavljačima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova narudžba
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno</p>
                <p className="text-2xl font-bold">{orders.length}</p>
              </div>
              <Send className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Na čekanju</p>
                <p className="text-2xl font-bold text-warning">{orders.filter(o => o.status === 'pending').length}</p>
              </div>
              <Package className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">U transportu</p>
                <p className="text-2xl font-bold text-info">{orders.filter(o => o.status === 'shipped').length}</p>
              </div>
              <Truck className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Primljeno</p>
                <p className="text-2xl font-bold text-success">{orders.filter(o => o.status === 'delivered').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista narudžbi</CardTitle>
          <CardDescription>Sve narudžbe prema dobavljačima</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Dobavljač</TableHead>
                <TableHead className="text-right">Vrednost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map((order) => (
                <TableRow key={order.id}>
                  <TableCell className="font-medium">{order.number}</TableCell>
                  <TableCell>{new Date(order.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{order.supplierName}</TableCell>
                  <TableCell className="text-right">{formatCurrency(order.total)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[order.status]}>
                      {statusLabels[order.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(order)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {order.status === 'pending' && (
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(order.id, 'confirmed')}>
                          Pošalji
                        </Button>
                      )}
                      {order.status === 'confirmed' && (
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(order.id, 'shipped')}>
                          U transportu
                        </Button>
                      )}
                      {order.status === 'shipped' && (
                        <Button variant="ghost" size="sm" onClick={() => updateStatus(order.id, 'delivered')}>
                          Primi
                        </Button>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}>
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

      {/* Dialog za novu narudžbu */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova narudžba dobavljaču</DialogTitle>
            <DialogDescription>
              Unesite podatke o narudžbi
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Dobavljač</Label>
              <Select value={formData.supplierId} onValueChange={(v) => setFormData({...formData, supplierId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite dobavljača" />
                </SelectTrigger>
                <SelectContent>
                  {demoSuppliers.map((supplier) => (
                    <SelectItem key={supplier.id} value={supplier.id}>{supplier.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Artikal</Label>
              <Select value={formData.articleId} onValueChange={(v) => setFormData({...formData, articleId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite artikal" />
                </SelectTrigger>
                <SelectContent>
                  {demoArticles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>
                      {article.name} - {formatCurrency(article.price)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="quantity">Količina</Label>
              <Input
                id="quantity"
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({...formData, quantity: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>Kreiraj</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji narudžbe</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold">{selectedOrder.number}</h3>
                  <p className="text-muted-foreground">{new Date(selectedOrder.date).toLocaleDateString('sr-RS')}</p>
                </div>
                <Badge className={statusColors[selectedOrder.status]}>
                  {statusLabels[selectedOrder.status]}
                </Badge>
              </div>
              <div>
                <Label className="text-muted-foreground">Dobavljač</Label>
                <p className="font-medium">{selectedOrder.supplierName}</p>
              </div>
              <div className="border rounded-lg p-4">
                <Label className="text-muted-foreground">Stavke</Label>
                {selectedOrder.items.map((item) => (
                  <div key={item.id} className="flex justify-between py-2 border-b last:border-0">
                    <div>
                      <p className="font-medium">{item.articleName}</p>
                      <p className="text-sm text-muted-foreground">{item.quantity} {item.unit} x {formatCurrency(item.price)}</p>
                    </div>
                    <p className="font-bold">{formatCurrency(item.total)}</p>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-4 border-t">
                <span className="text-lg font-medium">Ukupno:</span>
                <span className="text-2xl font-bold">{formatCurrency(selectedOrder.total)}</span>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default IssuedOrders;
