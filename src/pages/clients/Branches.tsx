import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Plus, Building2, MapPin, Phone, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoBranches, Branch } from '@/data/demoData';

const Branches = () => {
  const [branches, setBranches] = useState<Branch[]>(demoBranches);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
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

  const handleSubmit = () => {
    const newBranch: Branch = {
      id: isEditing && selectedBranch ? selectedBranch.id : Date.now().toString(),
      ...formData,
    };

    if (isEditing && selectedBranch) {
      setBranches(branches.map(b => b.id === selectedBranch.id ? newBranch : b));
      toast.success('Poslovnica je uspešno izmenjena');
    } else {
      setBranches([newBranch, ...branches]);
      toast.success('Poslovnica je uspešno kreirana');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      address: '',
      city: '',
      manager: '',
      phone: '',
      isActive: true,
    });
    setIsEditing(false);
    setSelectedBranch(null);
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

  const handleDelete = (id: string) => {
    setBranches(branches.filter(b => b.id !== id));
    toast.success('Poslovnica je obrisana');
  };

  const handleView = (branch: Branch) => {
    setSelectedBranch(branch);
    setViewDialogOpen(true);
  };

  const toggleActive = (id: string) => {
    setBranches(branches.map(b => 
      b.id === id ? { ...b, isActive: !b.isActive } : b
    ));
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Poslovnice</h1>
          <p className="text-muted-foreground">Upravljanje poslovnicama i lokacijama</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
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
                <p className="text-2xl font-bold text-success">{branches.filter(b => b.isActive).length}</p>
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
                <p className="text-2xl font-bold text-muted-foreground">{branches.filter(b => !b.isActive).length}</p>
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
                      <Button variant="ghost" size="icon" onClick={() => handleView(branch)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(branch)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(branch.id)}>
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

      {/* Dialog za novu/izmenu poslovnice */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena poslovnice' : 'Nova poslovnica'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o poslovnici
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv poslovnice</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({...formData, address: e.target.value})}
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
            <div className="space-y-2">
              <Label htmlFor="manager">Menadžer</Label>
              <Input
                id="manager"
                value={formData.manager}
                onChange={(e) => setFormData({...formData, manager: e.target.value})}
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
            <div className="flex items-center justify-between">
              <Label htmlFor="active">Aktivna poslovnica</Label>
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
            <DialogTitle>Detalji poslovnice</DialogTitle>
          </DialogHeader>
          {selectedBranch && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Building2 className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedBranch.name}</h3>
                  <Badge className={selectedBranch.isActive ? 'bg-success text-success-foreground' : 'bg-muted text-muted-foreground'}>
                    {selectedBranch.isActive ? 'Aktivna' : 'Neaktivna'}
                  </Badge>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Adresa</Label>
                  <p className="font-medium">{selectedBranch.address}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Grad</Label>
                  <p className="font-medium">{selectedBranch.city}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Menadžer</Label>
                  <p className="font-medium">{selectedBranch.manager}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Telefon</Label>
                  <p className="font-medium">{selectedBranch.phone}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Branches;
