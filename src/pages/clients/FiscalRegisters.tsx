import { useState, useEffect } from 'react';
import { Plus, Printer, Wrench, CheckCircle, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { FiscalRegister } from '@/data/demoData';
import { fiscalRegistersApi, branchesApi } from '@/services/apiService'; // ← dodajemo oba
import { DEMO_MODE } from '@/config/api';
import { demoFiscalRegisters, demoBranches } from '@/data/demoData';

const statusLabels: Record<string, string> = {
  active: 'Aktivna',
  inactive: 'Neaktivna',
  service: 'Na servisu',
};

const statusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
  service: 'bg-warning text-warning-foreground',
};

const FiscalRegisters = () => {
  const [registers, setRegisters] = useState<FiscalRegister[]>([]);
  const [branches, setBranches] = useState(demoBranches); // za select

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedRegister, setSelectedRegister] = useState<FiscalRegister | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    branchId: '',
    serialNumber: '',
    model: '',
    lastServiceDate: '',
    status: 'active' as FiscalRegister['status'],
  });

  // Učitavanje podataka
  const fetchData = async () => {
    setIsLoading(true);

    if (DEMO_MODE) {
      setRegisters(demoFiscalRegisters);
      setBranches(demoBranches);
      setIsLoading(false);
      return;
    }

    try {
      const [registersRes, branchesRes] = await Promise.all([
        fiscalRegistersApi.getAll(),
        branchesApi.getAll(),
      ]);

      if (registersRes.success && registersRes.data) setRegisters(registersRes.data);
      if (branchesRes.success && branchesRes.data) setBranches(branchesRes.data);
    } catch (error) {
      console.error("Error fetching fiscal registers:", error);
      toast.error("Greška pri učitavanju podataka. Koristim demo podatke.");
      setRegisters(demoFiscalRegisters);
      setBranches(demoBranches);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setFormData({
      branchId: '',
      serialNumber: '',
      model: '',
      lastServiceDate: '',
      status: 'active',
    });
    setSelectedRegister(null);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (register: FiscalRegister) => {
    setSelectedRegister(register);
    setFormData({
      branchId: register.branchId,
      serialNumber: register.serialNumber,
      model: register.model,
      lastServiceDate: register.lastServiceDate,
      status: register.status,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (register: FiscalRegister) => {
    setSelectedRegister(register);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.branchId || !formData.serialNumber || !formData.model) {
      toast.error("Poslovnica, serijski broj i model su obavezni!");
      return;
    }

    const selectedBranch = branches.find(b => b.id === formData.branchId);
    if (!selectedBranch) {
      toast.error("Izaberite validnu poslovnicu");
      return;
    }

    setIsSubmitting(true);

    const registerData = {
      branchId: formData.branchId,
      branchName: selectedBranch.name,
      serialNumber: formData.serialNumber,
      model: formData.model,
      lastServiceDate: formData.lastServiceDate,
      status: formData.status,
    };

    try {
      if (isEditing && selectedRegister) {
        if (DEMO_MODE) {
          const updated: FiscalRegister = { ...selectedRegister, ...registerData };
          setRegisters(registers.map(r => r.id === selectedRegister.id ? updated : r));
          toast.success('Fiskalna blagajna uspešno izmenjena');
        } else {
          const response = await fiscalRegistersApi.update(selectedRegister.id, registerData);
          if (response.success) {
            toast.success('Fiskalna blagajna uspešno izmenjena');
            fetchData();
          } else {
            throw new Error(response.message || "Greška pri ažuriranju");
          }
        }
      } else {
        if (DEMO_MODE) {
          const newRegister: FiscalRegister = {
            id: Date.now().toString(),
            ...registerData,
          };
          setRegisters([newRegister, ...registers]);
          toast.success('Nova fiskalna blagajna kreirana');
        } else {
          const response = await fiscalRegistersApi.create(registerData);
          if (response.success) {
            toast.success('Nova fiskalna blagajna kreirana');
            fetchData();
          } else {
            throw new Error(response.message || "Greška pri kreiranju");
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

  const confirmDelete = async () => {
    if (!selectedRegister) return;

    setIsDeleting(true);

    try {
      if (DEMO_MODE) {
        setRegisters(registers.filter(r => r.id !== selectedRegister.id));
        toast.success('Fiskalna blagajna obrisana');
      } else {
        const response = await fiscalRegistersApi.delete(selectedRegister.id);
        if (response.success) {
          toast.success('Fiskalna blagajna obrisana');
          fetchData();
        } else {
          throw new Error(response.message || "Greška pri brisanju");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Nije moguće obrisati fiskalnu blagajnu");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedRegister(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Učitavanje fiskalnih blagajni...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiskalne blagajne</h1>
          <p className="text-muted-foreground">Evidencija fiskalnih uređaja</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova blagajna
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno</p>
                <p className="text-2xl font-bold">{registers.length}</p>
              </div>
              <Printer className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivne</p>
                <p className="text-2xl font-bold text-success">
                  {registers.filter(r => r.status === 'active').length}
                </p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Na servisu</p>
                <p className="text-2xl font-bold text-warning">
                  {registers.filter(r => r.status === 'service').length}
                </p>
              </div>
              <Wrench className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neaktivne</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {registers.filter(r => r.status === 'inactive').length}
                </p>
              </div>
              <AlertTriangle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista fiskalnih blagajni</CardTitle>
          <CardDescription>Sve registrovane fiskalne blagajne</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Serijski broj</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Poslovnica</TableHead>
                <TableHead>Poslednji servis</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {registers.map((register) => (
                <TableRow key={register.id}>
                  <TableCell className="font-mono font-medium">{register.serialNumber}</TableCell>
                  <TableCell>{register.model}</TableCell>
                  <TableCell>{register.branchName}</TableCell>
                  <TableCell>
                    {register.lastServiceDate
                      ? new Date(register.lastServiceDate).toLocaleDateString('sr-RS')
                      : '-'}
                  </TableCell>
                  <TableCell>
                    <Badge className={statusColors[register.status]}>
                      {statusLabels[register.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(register)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(register)}
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

      {/* Dialog za novu/izmenu */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena fiskalne blagajne' : 'Nova fiskalna blagajna'}</DialogTitle>
            <DialogDescription>Unesite podatke o fiskalnom uređaju</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Poslovnica *</Label>
              <Select value={formData.branchId} onValueChange={(v) => setFormData({ ...formData, branchId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite poslovnicu" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>
                      {branch.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="serialNumber">Serijski broj *</Label>
              <Input
                id="serialNumber"
                value={formData.serialNumber}
                onChange={(e) => setFormData({ ...formData, serialNumber: e.target.value })}
                placeholder="FR-2024-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="model">Model *</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({ ...formData, model: e.target.value })}
                placeholder="GALEB GP-550"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="lastServiceDate">Datum poslednjeg servisa</Label>
              <Input
                id="lastServiceDate"
                type="date"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({ ...formData, lastServiceDate: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: FiscalRegister['status']) => setFormData({ ...formData, status: v })}
              >
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
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Otkaži
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Čuvanje..."
                : isEditing
                  ? "Sačuvaj izmene"
                  : "Registruj blagajnu"}
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
              Ova akcija će trajno obrisati fiskalnu blagajnu <strong>{selectedRegister?.serialNumber}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Brisanje..." : "Obriši blagajnu"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default FiscalRegisters;