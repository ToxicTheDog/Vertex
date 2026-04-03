import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Hash, Package, CheckCircle, Clock, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoSerialNumbers, demoArticles, demoWarehouses, SerialNumber } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';

const statusLabels: Record<string, string> = {
  'in-stock': 'Na zalihama',
  'sold': 'Prodato',
  'reserved': 'Rezervisano',
};

const statusColors: Record<string, string> = {
  'in-stock': 'bg-success text-success-foreground',
  'sold': 'bg-muted text-muted-foreground',
  'reserved': 'bg-warning text-warning-foreground',
};

const SerialNumbers = () => {
  const [serialNumbers, setSerialNumbers] = useState<SerialNumber[]>(demoSerialNumbers);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSerial, setSelectedSerial] = useState<SerialNumber | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    articleId: '',
    serialNumber: '',
    lotNumber: '',
    expiryDate: '',
    warehouseId: '',
    status: 'in-stock' as SerialNumber['status'],
  });

  const filteredSerials = serialNumbers.filter(s => 
    s.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.articleName.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const article = demoArticles.find(a => a.id === formData.articleId);
    const warehouse = demoWarehouses.find(w => w.id === formData.warehouseId);
    
    if (!article || !warehouse) {
      toast.error('Izaberite artikal i magacin');
      return;
    }

    const newSerial: SerialNumber = {
      id: isEditing && selectedSerial ? selectedSerial.id : Date.now().toString(),
      articleId: formData.articleId,
      articleName: article.name,
      serialNumber: formData.serialNumber,
      lotNumber: formData.lotNumber || undefined,
      expiryDate: formData.expiryDate || undefined,
      warehouseId: formData.warehouseId,
      warehouseName: warehouse.name,
      status: formData.status,
    };

    if (isEditing && selectedSerial) {
      setSerialNumbers(serialNumbers.map(s => s.id === selectedSerial.id ? newSerial : s));
      toast.success('Serijski broj je uspešno izmenjen');
    } else {
      setSerialNumbers([newSerial, ...serialNumbers]);
      toast.success('Serijski broj je uspešno dodat');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      articleId: '',
      serialNumber: '',
      lotNumber: '',
      expiryDate: '',
      warehouseId: '',
      status: 'in-stock',
    });
    setIsEditing(false);
    setSelectedSerial(null);
  };

  const handleEdit = (serial: SerialNumber) => {
    setSelectedSerial(serial);
    setFormData({
      articleId: serial.articleId,
      serialNumber: serial.serialNumber,
      lotNumber: serial.lotNumber || '',
      expiryDate: serial.expiryDate || '',
      warehouseId: serial.warehouseId,
      status: serial.status,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSerialNumbers(serialNumbers.filter(s => s.id !== id));
    toast.success('Serijski broj je obrisan');
  };

  const handleView = (serial: SerialNumber) => {
    setSelectedSerial(serial);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Serijski brojevi / Lotovi</h1>
          <p className="text-muted-foreground">Praćenje serijskih brojeva i lot brojeva</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi serijski broj
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno</p>
                <p className="text-2xl font-bold">{serialNumbers.length}</p>
              </div>
              <Hash className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Na zalihama</p>
                <p className="text-2xl font-bold text-success">{serialNumbers.filter(s => s.status === 'in-stock').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Rezervisano</p>
                <p className="text-2xl font-bold text-warning">{serialNumbers.filter(s => s.status === 'reserved').length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prodato</p>
                <p className="text-2xl font-bold text-muted-foreground">{serialNumbers.filter(s => s.status === 'sold').length}</p>
              </div>
              <Package className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista serijskih brojeva</CardTitle>
              <CardDescription>Ukupno {serialNumbers.length} unosa</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serijski broj</TableHead>
                <TableHead>Artikal</TableHead>
                <TableHead>Lot broj</TableHead>
                <TableHead>Magacin</TableHead>
                <TableHead>Rok trajanja</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSerials.map((serial) => (
                <TableRow key={serial.id}>
                  <TableCell className="font-mono font-medium">{serial.serialNumber}</TableCell>
                  <TableCell>{serial.articleName}</TableCell>
                  <TableCell>{serial.lotNumber || '-'}</TableCell>
                  <TableCell>{serial.warehouseName}</TableCell>
                  <TableCell>
                    {serial.expiryDate ? new Date(serial.expiryDate).toLocaleDateString('sr-RS') : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[serial.status]}>
                      {statusLabels[serial.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(serial)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(serial)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(serial.id)}>
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

      {/* Dialog za novi/izmenu */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena serijskog broja' : 'Novi serijski broj'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o serijskom broju
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Artikal</Label>
              <Select value={formData.articleId} onValueChange={(v) => setFormData({...formData, articleId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite artikal" />
                </SelectTrigger>
                <SelectContent>
                  {demoArticles.map((article) => (
                    <SelectItem key={article.id} value={article.id}>{article.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serijski broj</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({...formData, serialNumber: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="lotNumber">Lot broj (opciono)</Label>
                <Input
                  id="lotNumber"
                  value={formData.lotNumber}
                  onChange={(e) => setFormData({...formData, lotNumber: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="expiryDate">Rok trajanja (opciono)</Label>
                <Input
                  id="expiryDate"
                  type="date"
                  value={formData.expiryDate}
                  onChange={(e) => setFormData({...formData, expiryDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Magacin</Label>
              <Select value={formData.warehouseId} onValueChange={(v) => setFormData({...formData, warehouseId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite magacin" />
                </SelectTrigger>
                <SelectContent>
                  {demoWarehouses.map((warehouse) => (
                    <SelectItem key={warehouse.id} value={warehouse.id}>{warehouse.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: SerialNumber['status']) => setFormData({...formData, status: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(statusLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Dodaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji serijskog broja</DialogTitle>
          </DialogHeader>
          {selectedSerial && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Hash className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono">{selectedSerial.serialNumber}</h3>
                  <Badge className={statusColors[selectedSerial.status]}>
                    {statusLabels[selectedSerial.status]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Artikal</Label>
                  <p className="font-medium">{selectedSerial.articleName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Magacin</Label>
                  <p className="font-medium">{selectedSerial.warehouseName}</p>
                </div>
                {selectedSerial.lotNumber && (
                  <div>
                    <Label className="text-muted-foreground">Lot broj</Label>
                    <p className="font-medium">{selectedSerial.lotNumber}</p>
                  </div>
                )}
                {selectedSerial.expiryDate && (
                  <div>
                    <Label className="text-muted-foreground">Rok trajanja</Label>
                    <p className="font-medium">{new Date(selectedSerial.expiryDate).toLocaleDateString('sr-RS')}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SerialNumbers;
