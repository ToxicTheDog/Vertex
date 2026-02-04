import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Printer, Wrench, CheckCircle, AlertTriangle, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoFiscalRegisters, demoBranches, FiscalRegister } from '@/data/demoData';

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
  const [registers, setRegisters] = useState<FiscalRegister[]>(demoFiscalRegisters);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedRegister, setSelectedRegister] = useState<FiscalRegister | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    branchId: '',
    serialNumber: '',
    model: '',
    lastServiceDate: '',
    status: 'active' as FiscalRegister['status'],
  });

  const handleSubmit = () => {
    const branch = demoBranches.find(b => b.id === formData.branchId);
    if (!branch) {
      toast.error('Izaberite poslovnicu');
      return;
    }

    const newRegister: FiscalRegister = {
      id: isEditing && selectedRegister ? selectedRegister.id : Date.now().toString(),
      branchId: formData.branchId,
      branchName: branch.name,
      serialNumber: formData.serialNumber,
      model: formData.model,
      lastServiceDate: formData.lastServiceDate,
      status: formData.status,
    };

    if (isEditing && selectedRegister) {
      setRegisters(registers.map(r => r.id === selectedRegister.id ? newRegister : r));
      toast.success('Fiskalna blagajna je uspešno izmenjena');
    } else {
      setRegisters([newRegister, ...registers]);
      toast.success('Fiskalna blagajna je uspešno registrovana');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      branchId: '',
      serialNumber: '',
      model: '',
      lastServiceDate: '',
      status: 'active',
    });
    setIsEditing(false);
    setSelectedRegister(null);
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

  const handleDelete = (id: string) => {
    setRegisters(registers.filter(r => r.id !== id));
    toast.success('Fiskalna blagajna je uklonjena');
  };

  const handleView = (register: FiscalRegister) => {
    setSelectedRegister(register);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Fiskalne blagajne</h1>
          <p className="text-muted-foreground">Evidencija fiskalnih uređaja</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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
                <p className="text-2xl font-bold text-success">{registers.filter(r => r.status === 'active').length}</p>
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
                <p className="text-2xl font-bold text-warning">{registers.filter(r => r.status === 'service').length}</p>
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
                <p className="text-2xl font-bold text-muted-foreground">{registers.filter(r => r.status === 'inactive').length}</p>
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
                  <TableCell>{new Date(register.lastServiceDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[register.status]}>
                      {statusLabels[register.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(register)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(register)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(register.id)}>
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
            <DialogDescription>
              Unesite podatke o fiskalnom uređaju
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Poslovnica</Label>
              <Select value={formData.branchId} onValueChange={(v) => setFormData({...formData, branchId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite poslovnicu" />
                </SelectTrigger>
                <SelectContent>
                  {demoBranches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
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
            <div className="space-y-2">
              <Label htmlFor="model">Model</Label>
              <Input
                id="model"
                value={formData.model}
                onChange={(e) => setFormData({...formData, model: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="lastServiceDate">Datum poslednjeg servisa</Label>
              <Input
                id="lastServiceDate"
                type="date"
                value={formData.lastServiceDate}
                onChange={(e) => setFormData({...formData, lastServiceDate: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: FiscalRegister['status']) => setFormData({...formData, status: v})}>
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
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Registruj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji fiskalne blagajne</DialogTitle>
          </DialogHeader>
          {selectedRegister && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Printer className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono">{selectedRegister.serialNumber}</h3>
                  <Badge className={statusColors[selectedRegister.status]}>
                    {statusLabels[selectedRegister.status]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Model</Label>
                  <p className="font-medium">{selectedRegister.model}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Poslovnica</Label>
                  <p className="font-medium">{selectedRegister.branchName}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Poslednji servis</Label>
                  <p className="font-medium">{new Date(selectedRegister.lastServiceDate).toLocaleDateString('sr-RS')}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FiscalRegisters;
