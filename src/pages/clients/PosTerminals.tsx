import { useEffect, useState } from 'react';
import { Plus, CreditCard, CheckCircle, XCircle, Edit, Trash2, Search } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
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
import { PosTerminal } from '@/data/demoData';
import { posTerminalsApi, branchesApi } from '@/services/apiService';

const PAGE_SIZE = 10;

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
  const [branches, setBranches] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  const fetchData = async (page = currentPage, search = searchTerm) => {
    setIsLoading(true);
    const [terminalsResponse, branchesResponse] = await Promise.all([
      posTerminalsApi.getPage({ page, pageSize: PAGE_SIZE, search }),
      branchesApi.getAll(),
    ]);

    setTerminals(terminalsResponse.success ? terminalsResponse.data : []);
    setTotalPages(terminalsResponse.success ? terminalsResponse.totalPages || 0 : 0);
    setTotalItems(terminalsResponse.success ? terminalsResponse.total || 0 : 0);
    setBranches(branchesResponse.success && branchesResponse.data ? branchesResponse.data : []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

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
      toast.error('Poslovnica, terminal ID i provajder su obavezni.');
      return;
    }

    const selectedBranch = branches.find((branch) => branch.id === formData.branchId);
    if (!selectedBranch) {
      toast.error('Izaberite validnu poslovnicu.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      branchId: formData.branchId,
      branchName: selectedBranch.name,
      terminalId: formData.terminalId,
      provider: formData.provider,
      status: formData.status,
    };
    const response = isEditing && selectedTerminal
      ? await posTerminalsApi.update(selectedTerminal.id, payload)
      : await posTerminalsApi.create(payload);
    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || 'POS terminal nije sacuvan.');
      return;
    }

    toast.success(isEditing ? 'POS terminal je uspesno izmenjen.' : 'Novi POS terminal je kreiran.');
    setDialogOpen(false);
    resetForm();
    fetchData(currentPage, searchTerm);
  };

  const confirmDelete = async () => {
    if (!selectedTerminal) {
      return;
    }

    setIsDeleting(true);
    const response = await posTerminalsApi.delete(selectedTerminal.id);
    setIsDeleting(false);

    if (!response.success) {
      toast.error(response.message || 'Nije moguce obrisati POS terminal.');
      return;
    }

    toast.success('POS terminal je uspesno obrisan.');
    setDeleteDialogOpen(false);
    setSelectedTerminal(null);

    if (terminals.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchData(currentPage, searchTerm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">POS terminali</h1>
          <p className="text-muted-foreground">Upravljanje POS terminalima</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Novi terminal
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno terminala</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <CreditCard className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Aktivni na stranici</p>
                <p className="text-2xl font-bold text-success">{terminals.filter((terminal) => terminal.status === 'active').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Neaktivni na stranici</p>
                <p className="text-2xl font-bold text-muted-foreground">{terminals.filter((terminal) => terminal.status === 'inactive').length}</p>
              </div>
              <XCircle className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista POS terminala</CardTitle>
              <CardDescription>Ukupno {totalItems} POS terminala</CardDescription>
            </div>
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi po terminalu, poslovnici ili banci..."
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
                    <Badge className={statusColors[terminal.status] || statusColors.inactive}>
                      {statusLabels[terminal.status] || terminal.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(terminal)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(terminal)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && terminals.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                    Nema POS terminala za prikaz.
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
            <DialogTitle>{isEditing ? 'Izmena POS terminala' : 'Novi POS terminal'}</DialogTitle>
            <DialogDescription>Unesite podatke o POS terminalu</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Poslovnica *</Label>
              <Select value={formData.branchId} onValueChange={(value) => setFormData({ ...formData, branchId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite poslovnicu" />
                </SelectTrigger>
                <SelectContent>
                  {branches.map((branch) => (
                    <SelectItem key={branch.id} value={branch.id}>{branch.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="terminalId">Terminal ID *</Label>
              <Input id="terminalId" value={formData.terminalId} onChange={(event) => setFormData({ ...formData, terminalId: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="provider">Provajder / Banka *</Label>
              <Input id="provider" value={formData.provider} onChange={(event) => setFormData({ ...formData, provider: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Status</Label>
              <Select value={formData.status} onValueChange={(value: PosTerminal['status']) => setFormData({ ...formData, status: value })}>
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
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Otkazi</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Cuvanje...' : isEditing ? 'Sacuvaj izmene' : 'Registruj terminal'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija ce trajno obrisati POS terminal <strong>{selectedTerminal?.terminalId}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkazi</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? 'Brisanje...' : 'Obrisi terminal'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default PosTerminals;
