import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Building, Star, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoSuppliers, Supplier } from '@/data/demoData';

const Suppliers = () => {
  const [suppliers, setSuppliers] = useState<Supplier[]>(demoSuppliers);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedSupplier, setSelectedSupplier] = useState<Supplier | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    pib: '',
    maticniBroj: '',
    address: '',
    city: '',
    email: '',
    phone: '',
    contactPerson: '',
    paymentTerms: '30',
    rating: '5',
  });

  const filteredSuppliers = suppliers.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const newSupplier: Supplier = {
      id: isEditing && selectedSupplier ? selectedSupplier.id : Date.now().toString(),
      name: formData.name,
      pib: formData.pib,
      maticniBroj: formData.maticniBroj,
      address: formData.address,
      city: formData.city,
      email: formData.email,
      phone: formData.phone,
      contactPerson: formData.contactPerson,
      paymentTerms: parseInt(formData.paymentTerms),
      rating: parseInt(formData.rating),
    };

    if (isEditing && selectedSupplier) {
      setSuppliers(suppliers.map(s => s.id === selectedSupplier.id ? newSupplier : s));
      toast.success('Dobavljač je uspešno izmenjen');
    } else {
      setSuppliers([newSupplier, ...suppliers]);
      toast.success('Dobavljač je uspešno dodat');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      pib: '',
      maticniBroj: '',
      address: '',
      city: '',
      email: '',
      phone: '',
      contactPerson: '',
      paymentTerms: '30',
      rating: '5',
    });
    setIsEditing(false);
    setSelectedSupplier(null);
  };

  const handleEdit = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setFormData({
      name: supplier.name,
      pib: supplier.pib,
      maticniBroj: supplier.maticniBroj,
      address: supplier.address,
      city: supplier.city,
      email: supplier.email,
      phone: supplier.phone,
      contactPerson: supplier.contactPerson,
      paymentTerms: supplier.paymentTerms.toString(),
      rating: supplier.rating.toString(),
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setSuppliers(suppliers.filter(s => s.id !== id));
    toast.success('Dobavljač je obrisan');
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`h-4 w-4 ${i < rating ? 'fill-warning text-warning' : 'text-muted'}`} />
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dobavljači</h1>
          <p className="text-muted-foreground">Upravljanje dobavljačima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi dobavljač
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno dobavljača</p>
                <p className="text-2xl font-bold">{suppliers.length}</p>
              </div>
              <Building className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prosečan rok plaćanja</p>
                <p className="text-2xl font-bold">
                  {Math.round(suppliers.reduce((sum, s) => sum + s.paymentTerms, 0) / suppliers.length)} dana
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center text-info font-bold">
                ⏱
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prosečna ocena</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">
                    {(suppliers.reduce((sum, s) => sum + s.rating, 0) / suppliers.length).toFixed(1)}
                  </p>
                  <Star className="h-5 w-5 fill-warning text-warning" />
                </div>
              </div>
              <div className="flex">{renderStars(5)}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista dobavljača</CardTitle>
              <CardDescription>Ukupno {suppliers.length} dobavljača</CardDescription>
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
                <TableHead>Naziv</TableHead>
                <TableHead>PIB</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead>Kontakt</TableHead>
                <TableHead>Rok plaćanja</TableHead>
                <TableHead>Ocena</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredSuppliers.map((supplier) => (
                <TableRow key={supplier.id}>
                  <TableCell className="font-medium">{supplier.name}</TableCell>
                  <TableCell>{supplier.pib}</TableCell>
                  <TableCell>{supplier.city}</TableCell>
                  <TableCell>{supplier.contactPerson}</TableCell>
                  <TableCell>{supplier.paymentTerms} dana</TableCell>
                  <TableCell>
                    <div className="flex">{renderStars(supplier.rating)}</div>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(supplier)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(supplier)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(supplier.id)}>
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

      {/* Dialog za novog/izmenu dobavljača */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena dobavljača' : 'Novi dobavljač'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o dobavljaču
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Grad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({...formData, city: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pib">PIB</Label>
                <Input
                  id="pib"
                  value={formData.pib}
                  onChange={(e) => setFormData({...formData, pib: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maticniBroj">Matični broj</Label>
                <Input
                  id="maticniBroj"
                  value={formData.maticniBroj}
                  onChange={(e) => setFormData({...formData, maticniBroj: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({...formData, email: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Kontakt osoba</Label>
                <Input
                  id="contactPerson"
                  value={formData.contactPerson}
                  onChange={(e) => setFormData({...formData, contactPerson: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Rok plaćanja (dana)</Label>
                <Input
                  id="paymentTerms"
                  type="number"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({...formData, paymentTerms: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Ocena (1-5)</Label>
                <Input
                  id="rating"
                  type="number"
                  min="1"
                  max="5"
                  value={formData.rating}
                  onChange={(e) => setFormData({...formData, rating: e.target.value})}
                />
              </div>
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
            <DialogTitle>Detalji dobavljača</DialogTitle>
          </DialogHeader>
          {selectedSupplier && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedSupplier.name}</h3>
                  <div className="flex">{renderStars(selectedSupplier.rating)}</div>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">PIB</Label>
                  <p className="font-medium">{selectedSupplier.pib}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Matični broj</Label>
                  <p className="font-medium">{selectedSupplier.maticniBroj}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Adresa</Label>
                  <p className="font-medium">{selectedSupplier.address}, {selectedSupplier.city}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kontakt osoba</Label>
                  <p className="font-medium">{selectedSupplier.contactPerson}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Email</Label>
                  <p className="font-medium">{selectedSupplier.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefon</Label>
                  <p className="font-medium">{selectedSupplier.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Rok plaćanja</Label>
                  <p className="font-medium">{selectedSupplier.paymentTerms} dana</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Suppliers;
