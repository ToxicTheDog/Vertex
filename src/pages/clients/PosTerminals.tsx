import { useState, useEffect } from 'react';
import { Plus, CreditCard, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
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
import { PosTerminal } from '@/data/demoData';
import { posTerminalsApi, branchesApi } from '@/services/apiService';
import { DEMO_MODE } from '@/config/api';
import { demoPosTerminals, demoBranches } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';

const statusLabels: Record<string, string> = {
  active: 'Aktivan',
  inactive: 'Neaktivan',
};

const statusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
};

const PosTerminals = () => {
  const [terminals, setTerminals] = useState<PosTerminal[]>([]);
  const [branches, setBranches] = useState(demoBranches);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedTerminal, setSelectedTerminal] = useState<PosTerminal | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    branchId: '',
    terminalId: '',
    provider: '',
    status: 'active' as PosTerminal['status'],
  });

  // Učitavanje podataka
  const fetchData = async () => {
    setIsLoading(true);

    if (DEMO_MODE) {
      setTerminals(demoPosTerminals);
      setBranches(demoBranches);
      setIsLoading(false);
      return;
    }

    try {
      const [terminalsRes, branchesRes] = await Promise.all([
        posTerminalsApi.getAll(),
        branchesApi.getAll(),
      ]);

      if (terminalsRes.success && terminalsRes.data) setTerminals(terminalsRes.data);
      if (branchesRes.success && branchesRes.data) setBranches(branchesRes.data);
    } catch (error) {
      console.error("Error fetching POS terminals:", error);
      toast.error("Greška pri učitavanju podataka. Koristim demo podatke.");
      setTerminals(demoPosTerminals);
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
      terminalId: '',
      provider: '',
      status: 'active',
    });
    setSelectedTerminal(null);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
  };

  const handleEdit = (terminal: PosTerminal) => {
    setSelectedTerminal(terminal);
    setFormData({
      branchId: terminal.branchId,
      terminalId: terminal.terminalId,
      provider: terminal.provider,
      status: terminal.status,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDeleteClick = (terminal: PosTerminal) => {
    setSelectedTerminal(terminal);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.branchId || !formData.terminalId || !formData.provider) {
      toast.error("Poslovnica, Terminal ID i provajder su obavezni!");
      return;
    }

    const selectedBranch = branches.find(b => b.id === formData.branchId);
    if (!selectedBranch) {
      toast.error("Izaberite validnu poslovnicu");
      return;
    }

    setIsSubmitting(true);

    const terminalData = {
      branchId: formData.branchId,
      branchName: selectedBranch.name,
      terminalId: formData.terminalId,
      provider: formData.provider,
      status: formData.status,
    };

    try {
      if (isEditing && selectedTerminal) {
        if (DEMO_MODE) {
          const updated: PosTerminal = { ...selectedTerminal, ...terminalData };
          setTerminals(terminals.map(t => t.id === selectedTerminal.id ? updated : t));
          toast.success('POS terminal uspešno izmenjen');
        } else {
          const response = await posTerminalsApi.update(selectedTerminal.id, terminalData);
          if (response.success) {
            toast.success('POS terminal uspešno izmenjen');
            fetchData();
          } else {
            throw new Error(response.message || "Greška pri ažuriranju");
          }
        }
      } else {
        if (DEMO_MODE) {
          const newTerminal: PosTerminal = {
            id: Date.now().toString(),
            ...terminalData,
          };
          setTerminals([newTerminal, ...terminals]);
          toast.success('Novi POS terminal kreiran');
        } else {
          const response = await posTerminalsApi.create(terminalData);
          if (response.success) {
            toast.success('Novi POS terminal kreiran');
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
    if (!selectedTerminal) return;

    setIsDeleting(true);

    try {
      if (DEMO_MODE) {
        setTerminals(terminals.filter(t => t.id !== selectedTerminal.id));
        toast.success('POS terminal obrisan');
      } else {
        const response = await posTerminalsApi.delete(selectedTerminal.id);
        if (response.success) {
          toast.success('POS terminal obrisan');
          fetchData();
        } else {
          throw new Error(response.message || "Greška pri brisanju");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Nije moguće obrisati POS terminal");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedTerminal(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Učitavanje POS terminala...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS Terminali</h1>
          <p className="text-muted-foreground">Upravljanje POS terminalima</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novi terminal
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno terminala</p>
                <p className="text-2xl font-bold">{terminals.length}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivni</p>
                <p className="text-2xl font-bold text-success">
                  {terminals.filter(t => t.status === 'active').length}
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
                <p className="text-sm text-muted-foreground">Neaktivni</p>
                <p className="text-2xl font-bold text-muted-foreground">
                  {terminals.filter(t => t.status === 'inactive').length}
                </p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista POS terminala */}
      <Card>
        <CardHeader>
          <CardTitle>Lista POS terminala</CardTitle>
          <CardDescription>Svi registrovani POS terminali</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Terminal ID</TableHead>
                <TableHead>Provajder / Banka</TableHead>
                <TableHead>Poslovnica</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {terminals.map((terminal) => (
                <TableRow key={terminal.id}>
                  <TableCell className="font-mono font-medium">{terminal.terminalId}</TableCell>
                  <TableCell>{terminal.provider}</TableCell>
                  <TableCell>{terminal.branchName}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[terminal.status]}>
                      {statusLabels[terminal.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(terminal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDeleteClick(terminal)}
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
            <DialogTitle>{isEditing ? 'Izmena POS terminala' : 'Novi POS terminal'}</DialogTitle>
            <DialogDescription>Unesite podatke o POS terminalu</DialogDescription>
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
              <Label htmlFor="terminalId">Terminal ID *</Label>
              <Input
                id="terminalId"
                value={formData.terminalId}
                onChange={(e) => setFormData({ ...formData, terminalId: e.target.value })}
                placeholder="TID-001"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="provider">Provajder / Banka *</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                placeholder="Banka Intesa"
              />
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v: PosTerminal['status']) => setFormData({ ...formData, status: v })}
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
                  : "Registruj terminal"}
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
              Ova akcija će trajno obrisati POS terminal <strong>{selectedTerminal?.terminalId}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Brisanje..." : "Obriši terminal"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PosTerminals;