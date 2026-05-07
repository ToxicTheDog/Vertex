import { useEffect, useState } from 'react';
import { Plus, Building2, MapPin, Phone, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { Branch } from '@/data/demoData';
import { branchesApi } from '@/services/apiService';

const PAGE_SIZE = 10;

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<Branch | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    address: '',
    city: '',
    manager: '',
    phone: '',
    isActive: true,
  });

  const fetchBranches = async (page = currentPage, search = searchTerm) => {
    setIsLoading(true);
    const response = await branchesApi.getPage({ page, pageSize: PAGE_SIZE, search });
    setBranches(response.success ? response.data : []);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
    setTotalItems(response.success ? response.total || 0 : 0);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchBranches(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      manager: '',
      phone: '',
      isActive: true,
    });
    setSelectedBranch(null);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (branch: Branch) => {
    setSelectedBranch(branch);
    setFormData({
      name: branch.name,
      address: branch.address,
      city: branch.city,
      manager: branch.manager,
      phone: branch.phone,
      isActive: branch.isActive,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (branch: Branch) => {
    setSelectedBranch(branch);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      toast.error('Naziv, adresa i grad su obavezni.');
      return;
    }

    setIsSubmitting(true);
    const response = isEditing && selectedBranch
      ? await branchesApi.update(selectedBranch.id, formData)
      : await branchesApi.create(formData);
    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || 'Poslovnica nije sacuvana.');
      return;
    }

    toast.success(isEditing ? 'Poslovnica je uspesno izmenjena.' : 'Nova poslovnica je uspesno kreirana.');
    setDialogOpen(false);
    resetForm();
    fetchBranches(currentPage, searchTerm);
  };

  const confirmDelete = async () => {
    if (!selectedBranch) {
      return;
    }

    setIsDeleting(true);
    const response = await branchesApi.delete(selectedBranch.id);
    setIsDeleting(false);

    if (!response.success) {
      toast.error(response.message || 'Nije moguce obrisati poslovnicu.');
      return;
    }

    toast.success('Poslovnica je uspesno obrisana.');
    setDeleteDialogOpen(false);
    setSelectedBranch(null);

    if (branches.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchBranches(currentPage, searchTerm);
    }
  };

  const activeBranches = branches.filter((branch) => branch.isActive).length;
  const inactiveBranches = branches.filter((branch) => !branch.isActive).length;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Poslovnice</h1>
          <p className="text-muted-foreground">Upravljanje poslovnicama i lokacijama</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova poslovnica
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno poslovnica</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivne na stranici</p>
                <p className="text-2xl font-bold text-success">{activeBranches}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center">
                <Building2 className="h-4 w-4 text-success" />
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neaktivne na stranici</p>
                <p className="text-2xl font-bold text-muted-foreground">{inactiveBranches}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista poslovnica</CardTitle>
              <CardDescription>Ukupno {totalItems} poslovnica</CardDescription>
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi po nazivu, gradu ili menadzeru..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Adresa</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead>Menadzer</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {branches.map((branch) => (
                <TableRow key={branch.id}>
                  <TableCell className="font-medium">{branch.name}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-muted-foreground" />
                      {branch.address}
                    </div>
                  </TableCell>
                  <TableCell>{branch.city}</TableCell>
                  <TableCell>{branch.manager}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Phone className="h-4 w-4 text-muted-foreground" />
                      {branch.phone}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={branch.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                      {branch.isActive ? 'Aktivna' : 'Neaktivna'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(branch)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && branches.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nema poslovnica za prikaz.
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

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena poslovnice' : 'Nova poslovnica'}</DialogTitle>
            <DialogDescription>Unesite podatke o poslovnici</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv poslovnice *</Label>
              <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa *</Label>
              <Input id="address" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Grad *</Label>
              <Input id="city" value={formData.city} onChange={(event) => setFormData({ ...formData, city: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Menadzer</Label>
              <Input id="manager" value={formData.manager} onChange={(event) => setFormData({ ...formData, manager: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input id="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktivna poslovnica</Label>
              <Switch id="active" checked={formData.isActive} onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Otkazi</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Cuvanje...' : isEditing ? 'Sacuvaj izmene' : 'Kreiraj poslovnicu'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija ce trajno obrisati poslovnicu <strong>{selectedBranch?.name}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkazi</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? 'Brisanje...' : 'Obrisi poslovnicu'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Branches;
