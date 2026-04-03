import { useState, useEffect } from 'react';
import { Plus, Building2, MapPin, Phone, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
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
import { DEMO_MODE } from '@/config/api';
import { demoBranches } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>([]);
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

  // Učitavanje poslovnica
  const fetchBranches = async () => {
    setIsLoading(true);

    if (DEMO_MODE) {
      setBranches(demoBranches);
      setIsLoading(false);
      return;
    }

    try {
      const response = await branchesApi.getAll();

      if (response.success && response.data) {
        setBranches(response.data);
      } else {
        toast.error(response.message || "Greška pri učitavanju poslovnica");
        setBranches(demoBranches); // fallback
      }
    } catch (error) {
      console.error("Error fetching branches:", error);
      toast.error("Nije moguće učitati poslovnice sa servera");
      setBranches(demoBranches); // fallback
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

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

  // Kreiranje ili ažuriranje
  const handleSubmit = async () => {
    if (!formData.name || !formData.address || !formData.city) {
      toast.error("Naziv, adresa i grad su obavezni!");
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && selectedBranch) {
        // UPDATE
        if (DEMO_MODE) {
          const updatedBranch: Branch = { ...selectedBranch, ...formData };
          setBranches(branches.map(b => b.id === selectedBranch.id ? updatedBranch : b));
          toast.success('Poslovnica je uspešno izmenjena');
        } else {
          const response = await branchesApi.update(selectedBranch.id, formData);
          if (response.success) {
            toast.success('Poslovnica je uspešno izmenjena');
            fetchBranches();
          } else {
            throw new Error(response.message || 'Greška pri ažuriranju');
          }
        }
      } else {
        // CREATE
        if (DEMO_MODE) {
          const newBranch: Branch = {
            id: Date.now().toString(),
            ...formData,
          };
          setBranches([newBranch, ...branches]);
          toast.success('Nova poslovnica je uspešno kreirana');
        } else {
          const response = await branchesApi.create(formData);
          if (response.success) {
            toast.success('Nova poslovnica je uspešno kreirana');
            fetchBranches();
          } else {
            throw new Error(response.message || 'Greška pri kreiranju');
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Došlo je do greške prilikom čuvanja");
    } finally {
      setIsSubmitting(false);
      setDialogOpen(false);
      resetForm();
    }
  };

  // Brisanje
  const confirmDelete = async () => {
    if (!selectedBranch) return;

    setIsDeleting(true);

    try {
      if (DEMO_MODE) {
        setBranches(branches.filter(b => b.id !== selectedBranch.id));
        toast.success('Poslovnica je uspešno obrisana');
      } else {
        const response = await branchesApi.delete(selectedBranch.id);
        if (response.success) {
          toast.success('Poslovnica je uspešno obrisana');
          fetchBranches();
        } else {
          throw new Error(response.message || 'Greška pri brisanju');
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Nije moguće obrisati poslovnicu");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedBranch(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-lg">
        Učitavanje poslovnica...
      </div>
    );
  }

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

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno poslovnica</p>
                <p className="text-2xl font-bold">{branches.length}</p>
              </div>
              <Building2 className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivne</p>
                <p className="text-2xl font-bold text-success">
                  {branches.filter(b => b.isActive).length}
                </p>
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
                <p className="text-sm text-muted-foreground">Neaktivne</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {branches.filter(b => !b.isActive).length}
                </p>
              </div>
              <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                <Building2 className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista poslovnica */}
      <Card>
        <CardHeader>
          <CardTitle>Lista poslovnica</CardTitle>
          <CardDescription>Sve registrovane poslovnice</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Adresa</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead>Menadžer</TableHead>
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
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(branch)}
                      >
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

      {/* Dialog za kreiranje / izmenu */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena poslovnice' : 'Nova poslovnica'}</DialogTitle>
            <DialogDescription>Unesite podatke o poslovnici</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv poslovnice *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa *</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="city">Grad *</Label>
              <Input
                id="city"
                value={formData.city}
                onChange={(e) => setFormData({ ...formData, city: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="manager">Menadžer</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({ ...formData, manager: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Telefon</Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
              />
            </div>
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktivna poslovnica</Label>
              <Switch
                id="active"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setDialogOpen(false); resetForm(); }}
            >
              Otkaži
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Čuvanje..."
                : isEditing
                  ? "Sačuvaj izmene"
                  : "Kreiraj poslovnicu"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Potvrda brisanja */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati poslovnicu <strong>{selectedBranch?.name}</strong>.<br />
              Ova radnja se ne može opozvati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Brisanje..." : "Obriši poslovnicu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Branches;