import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, List, Calendar, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoPriceLists, PriceList } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const PriceLists = () => {
  const [priceLists, setPriceLists] = useState<PriceList[]>(demoPriceLists);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPriceList, setSelectedPriceList] = useState<PriceList | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    validFrom: '',
    validTo: '',
    currency: 'RSD',
    isActive: true,
  });

  const handleSubmit = () => {
    const newPriceList: PriceList = {
      id: isEditing && selectedPriceList ? selectedPriceList.id : Date.now().toString(),
      name: formData.name,
      validFrom: formData.validFrom,
      validTo: formData.validTo,
      currency: formData.currency,
      isActive: formData.isActive,
      itemsCount: isEditing && selectedPriceList ? selectedPriceList.itemsCount : 0,
    };

    if (isEditing && selectedPriceList) {
      setPriceLists(priceLists.map(p => p.id === selectedPriceList.id ? newPriceList : p));
      toast.success('Cenovnik je uspešno izmenjen');
    } else {
      setPriceLists([newPriceList, ...priceLists]);
      toast.success('Cenovnik je uspešno kreiran');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      validFrom: '',
      validTo: '',
      currency: 'RSD',
      isActive: true,
    });
    setIsEditing(false);
    setSelectedPriceList(null);
  };

  const handleEdit = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setFormData({
      name: priceList.name,
      validFrom: priceList.validFrom,
      validTo: priceList.validTo,
      currency: priceList.currency,
      isActive: priceList.isActive,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPriceLists(priceLists.filter(p => p.id !== id));
    toast.success('Cenovnik je obrisan');
  };

  const handleView = (priceList: PriceList) => {
    setSelectedPriceList(priceList);
    setViewDialogOpen(true);
  };

  const toggleActive = (id: string) => {
    setPriceLists(priceLists.map(p => 
      p.id === id ? { ...p, isActive: !p.isActive } : p
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Cenovnici</h1>
          <p className="text-muted-foreground">Upravljanje cenovnicima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi cenovnik
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno cenovnika</p>
                <p className="text-2xl font-bold">{priceLists.length}</p>
              </div>
              <List className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivni</p>
                <p className="text-2xl font-bold text-success">{priceLists.filter(p => p.isActive).length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neaktivni</p>
                <p className="text-2xl font-bold text-muted-foreground">{priceLists.filter(p => !p.isActive).length}</p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista cenovnika</CardTitle>
          <CardDescription>Svi cenovnici u sistemu</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Važi od</TableHead>
                <TableHead>Važi do</TableHead>
                <TableHead>Valuta</TableHead>
                <TableHead>Broj artikala</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {priceLists.map((priceList) => (
                <TableRow key={priceList.id}>
                  <TableCell className="font-medium">{priceList.name}</TableCell>
                  <TableCell>{new Date(priceList.validFrom).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(priceList.validTo).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{priceList.currency}</TableCell>
                  <TableCell>{priceList.itemsCount}</TableCell>
                  <TableCell>
                    <Badge className={priceList.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                      {priceList.isActive ? 'Aktivan' : 'Neaktivan'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(priceList)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(priceList)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(priceList.id)}>
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

      {/* Dialog za novi/izmenu cenovnika */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena cenovnika' : 'Novi cenovnik'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o cenovniku
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv cenovnika</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="validFrom">Važi od</Label>
                <Input
                  id="validFrom"
                  type="date"
                  value={formData.validFrom}
                  onChange={(e) => setFormData({...formData, validFrom: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="validTo">Važi do</Label>
                <Input
                  id="validTo"
                  type="date"
                  value={formData.validTo}
                  onChange={(e) => setFormData({...formData, validTo: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="currency">Valuta</Label>
              <Input
                id="currency"
                value={formData.currency}
                onChange={(e) => setFormData({...formData, currency: e.target.value})}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktivan cenovnik</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({...formData, isActive: checked})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji cenovnika</DialogTitle>
          </DialogHeader>
          {selectedPriceList && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <List className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedPriceList.name}</h3>
                  <Badge className={selectedPriceList.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {selectedPriceList.isActive ? 'Aktivan' : 'Neaktivan'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Važi od</Label>
                  <p className="font-medium">{new Date(selectedPriceList.validFrom).toLocaleDateString('sr-RS')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Važi do</Label>
                  <p className="font-medium">{new Date(selectedPriceList.validTo).toLocaleDateString('sr-RS')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Valuta</Label>
                  <p className="font-medium">{selectedPriceList.currency}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Broj artikala</Label>
                  <p className="font-medium">{selectedPriceList.itemsCount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PriceLists;
