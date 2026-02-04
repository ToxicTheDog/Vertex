import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CreditCard, CheckCircle, XCircle, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoPosTerminals, demoBranches, PosTerminal } from '@/data/demoData';

const statusLabels: Record<string, string> = {
  active: 'Aktivan',
  inactive: 'Neaktivan',
};

const statusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
};

const PosTerminals = () => {
  const [terminals, setTerminals] = useState<PosTerminal[]>(demoPosTerminals);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedTerminal, setSelectedTerminal] = useState<PosTerminal | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    branchId: '',
    terminalId: '',
    provider: '',
    status: 'active' as PosTerminal['status'],
  });

  const handleSubmit = () => {
    const branch = demoBranches.find(b => b.id === formData.branchId);
    if (!branch) {
      toast.error('Izaberite poslovnicu');
      return;
    }

    const newTerminal: PosTerminal = {
      id: isEditing && selectedTerminal ? selectedTerminal.id : Date.now().toString(),
      branchId: formData.branchId,
      branchName: branch.name,
      terminalId: formData.terminalId,
      provider: formData.provider,
      status: formData.status,
    };

    if (isEditing && selectedTerminal) {
      setTerminals(terminals.map(t => t.id === selectedTerminal.id ? newTerminal : t));
      toast.success('POS terminal je uspešno izmenjen');
    } else {
      setTerminals([newTerminal, ...terminals]);
      toast.success('POS terminal je uspešno registrovan');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      branchId: '',
      terminalId: '',
      provider: '',
      status: 'active',
    });
    setIsEditing(false);
    setSelectedTerminal(null);
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

  const handleDelete = (id: string) => {
    setTerminals(terminals.filter(t => t.id !== id));
    toast.success('POS terminal je uklonjen');
  };

  const handleView = (terminal: PosTerminal) => {
    setSelectedTerminal(terminal);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS Terminali</h1>
          <p className="text-muted-foreground">Upravljanje POS terminalima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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
                <p className="text-2xl font-bold text-success">{terminals.filter(t => t.status === 'active').length}</p>
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
                <p className="text-2xl font-bold text-muted-foreground">{terminals.filter(t => t.status === 'inactive').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
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
                <TableHead>Provajder</TableHead>
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
                      <Button variant="ghost" size="icon" onClick={() => handleView(terminal)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(terminal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(terminal.id)}>
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
            <DialogTitle>{isEditing ? 'Izmena POS terminala' : 'Novi POS terminal'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o POS terminalu
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
              <Label htmlFor="terminalId">Terminal ID</Label>
              <Input
                id="terminalId"
                value={formData.terminalId}
                onChange={(e) => setFormData({...formData, terminalId: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provajder / Banka</Label>
              <Input
                id="provider"
                value={formData.provider}
                onChange={(e) => setFormData({...formData, provider: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(v: PosTerminal['status']) => setFormData({...formData, status: v})}>
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
            <DialogTitle>Detalji POS terminala</DialogTitle>
          </DialogHeader>
          {selectedTerminal && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CreditCard className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold font-mono">{selectedTerminal.terminalId}</h3>
                  <Badge className={statusColors[selectedTerminal.status]}>
                    {statusLabels[selectedTerminal.status]}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Provajder</Label>
                  <p className="font-medium">{selectedTerminal.provider}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Poslovnica</Label>
                  <p className="font-medium">{selectedTerminal.branchName}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default PosTerminals;
