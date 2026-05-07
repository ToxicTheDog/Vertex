import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Building, Star, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoSuppliers, Supplier } from '@/data/demoData';
import { suppliersApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const Suppliers = () => {
  const { data: suppliers, refetch } = useFetchData(() => suppliersApi.getAll(), demoSuppliers);
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

  const filteredSuppliers = suppliers.filter((supplier) =>
    supplier.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    supplier.city.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const averagePaymentTerms = suppliers.length > 0
    ? Math.round(suppliers.reduce((sum, supplier) => sum + supplier.paymentTerms, 0) / suppliers.length)
    : 0;
  const averageRating = suppliers.length > 0
    ? suppliers.reduce((sum, supplier) => sum + supplier.rating, 0) / suppliers.length
    : 0;

  const handleSubmit = async () => {
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
      paymentTerms: parseInt(formData.paymentTerms, 10) || 0,
      rating: parseInt(formData.rating, 10) || 0,
    };

    const response = isEditing && selectedSupplier
      ? await suppliersApi.update(selectedSupplier.id, newSupplier)
      : await suppliersApi.create(newSupplier);

    if (!response.success) {
      toast.error(response.message || 'Dobavljac trenutno nije sacuvan na backendu.');
      return;
    }

    toast.success(isEditing ? 'Dobavljac je uspesno izmenjen' : 'Dobavljac je uspesno dodat');
    setDialogOpen(false);
    resetForm();
    refetch();
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
    void id;
    toast.error('Brisanje dobavljaca jos nije podrzano na backendu.');
  };

  const handleView = (supplier: Supplier) => {
    setSelectedSupplier(supplier);
    setViewDialogOpen(true);
  };

  const renderStars = (rating: number) =>
    Array.from({ length: 5 }, (_, index) => (
      <Star key={index} className={`h-4 w-4 ${index < rating ? 'fill-warning text-warning' : 'text-muted'}`} />
    ));

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Dobavljaci</h1>
          <p className="text-muted-foreground">Upravljanje dobavljacima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi dobavljac
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno dobavljaca</p>
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
                <p className="text-sm text-muted-foreground">Prosecan rok placanja</p>
                <p className="text-2xl font-bold">{averagePaymentTerms} dana</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-info/20 flex items-center justify-center text-info font-bold">
                T
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prosecna ocena</p>
                <div className="flex items-center gap-1">
                  <p className="text-2xl font-bold">{averageRating.toFixed(1)}</p>
                  <Star className="h-5 w-5 fill-warning text-warning" />
                </div>
              </div>
              <div className="flex">{renderStars(Math.round(averageRating))}</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista dobavljaca</CardTitle>
              <CardDescription>Ukupno {suppliers.length} dobavljaca</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi..."
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
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
                <TableHead>Rok placanja</TableHead>
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
              {filteredSuppliers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema dobavljaca za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena dobavljaca' : 'Novi dobavljac'}</DialogTitle>
            <DialogDescription>Unesite podatke o dobavljacu</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Naziv</Label>
                <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="city">Grad</Label>
                <Input id="city" value={formData.city} onChange={(event) => setFormData({ ...formData, city: event.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="pib">PIB</Label>
                <Input id="pib" value={formData.pib} onChange={(event) => setFormData({ ...formData, pib: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maticniBroj">Maticni broj</Label>
                <Input id="maticniBroj" value={formData.maticniBroj} onChange={(event) => setFormData({ ...formData, maticniBroj: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="contactPerson">Kontakt osoba</Label>
                <Input id="contactPerson" value={formData.contactPerson} onChange={(event) => setFormData({ ...formData, contactPerson: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="paymentTerms">Rok placanja (dana)</Label>
                <Input id="paymentTerms" type="number" value={formData.paymentTerms} onChange={(event) => setFormData({ ...formData, paymentTerms: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="rating">Ocena (1-5)</Label>
                <Input id="rating" type="number" min="1" max="5" value={formData.rating} onChange={(event) => setFormData({ ...formData, rating: event.target.value })} />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkazi</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sacuvaj' : 'Dodaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji dobavljaca</DialogTitle>
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
                  <Label className="text-muted-foreground">Maticni broj</Label>
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
                  <Label className="text-muted-foreground">Rok placanja</Label>
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
