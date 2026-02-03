import { useState } from 'react';
import { FileText, Plus, Search, Filter, Eye, Edit, Calendar, DollarSign, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoContracts } from '@/data/demoData';
import { ContractDialog, ContractFormData } from '@/components/dialogs/ContractDialog';
import { ConfirmDialog } from '@/components/dialogs/ConfirmDialog';
import { useToast } from '@/hooks/use-toast';

const statusColors = {
  draft: 'bg-muted text-muted-foreground',
  active: 'bg-success/20 text-success',
  completed: 'bg-primary/20 text-primary',
  terminated: 'bg-destructive/20 text-destructive'
};

const statusLabels = {
  draft: 'Nacrt',
  active: 'Aktivan',
  completed: 'Završen',
  terminated: 'Raskinut'
};

const typeLabels = {
  sales: 'Prodaja',
  purchase: 'Nabavka',
  service: 'Usluge',
  rental: 'Zakup'
};

const Contracts = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [typeFilter, setTypeFilter] = useState('all');
  const [contracts, setContracts] = useState(demoContracts);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [dialogMode, setDialogMode] = useState<'create' | 'edit' | 'view'>('create');
  const [selectedContract, setSelectedContract] = useState<ContractFormData | null>(null);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [contractToDelete, setContractToDelete] = useState<string | null>(null);
  const { toast } = useToast();

  const filteredContracts = contracts.filter(contract => {
    const matchesSearch = contract.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         contract.number.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = statusFilter === 'all' || contract.status === statusFilter;
    const matchesType = typeFilter === 'all' || contract.type === typeFilter;
    return matchesSearch && matchesStatus && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const handleCreate = () => {
    setSelectedContract(null);
    setDialogMode('create');
    setDialogOpen(true);
  };

  const handleView = (contract: typeof demoContracts[0]) => {
    setSelectedContract({
      id: contract.id,
      number: contract.number,
      title: contract.title,
      clientName: contract.clientName,
      type: contract.type,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      value: contract.value,
      description: ''
    });
    setDialogMode('view');
    setDialogOpen(true);
  };

  const handleEdit = (contract: typeof demoContracts[0]) => {
    setSelectedContract({
      id: contract.id,
      number: contract.number,
      title: contract.title,
      clientName: contract.clientName,
      type: contract.type,
      status: contract.status,
      startDate: contract.startDate,
      endDate: contract.endDate,
      value: contract.value,
      description: ''
    });
    setDialogMode('edit');
    setDialogOpen(true);
  };

  const handleSave = (data: ContractFormData) => {
    if (dialogMode === 'create') {
      const newContract = {
        ...data,
        id: `contract-${Date.now()}`,
        clientId: `client-${Date.now()}`
      };
      setContracts([newContract, ...contracts]);
      toast({
        title: "Ugovor kreiran",
        description: `Ugovor ${data.number} je uspešno kreiran.`
      });
    } else if (dialogMode === 'edit' && data.id) {
      const existingContract = contracts.find(c => c.id === data.id);
      setContracts(contracts.map(c => c.id === data.id ? { ...c, ...data, clientId: existingContract?.clientId || c.clientId } : c));
      toast({
        title: "Ugovor ažuriran",
        description: `Ugovor ${data.number} je uspešno ažuriran.`
      });
    }
  };

  const handleDelete = (id: string) => {
    setContractToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (contractToDelete) {
      setContracts(contracts.filter(c => c.id !== contractToDelete));
      toast({
        title: "Ugovor obrisan",
        description: "Ugovor je uspešno obrisan."
      });
      setContractToDelete(null);
    }
  };

  const activeContracts = contracts.filter(c => c.status === 'active');
  const totalValue = activeContracts.reduce((sum, c) => sum + c.value, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evidencija ugovora</h1>
          <p className="text-muted-foreground">Upravljanje ugovorima sa klijentima i dobavljačima</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="mr-2 h-4 w-4" />
          Novi ugovor
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno ugovora</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{contracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Aktivni</CardTitle>
            <FileText className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeContracts.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Vrednost aktivnih</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalValue)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ističe uskoro</CardTitle>
            <Calendar className="h-4 w-4 text-warning" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">2</div>
            <p className="text-xs text-muted-foreground">u narednih 30 dana</p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista ugovora</CardTitle>
          <CardDescription>Pregled svih ugovora sa pretragom i filterima</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po nazivu, broju ili klijentu..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-40">
                <SelectValue placeholder="Tip" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="sales">Prodaja</SelectItem>
                <SelectItem value="purchase">Nabavka</SelectItem>
                <SelectItem value="service">Usluge</SelectItem>
                <SelectItem value="rental">Zakup</SelectItem>
              </SelectContent>
            </Select>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-40">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi statusi</SelectItem>
                <SelectItem value="draft">Nacrt</SelectItem>
                <SelectItem value="active">Aktivan</SelectItem>
                <SelectItem value="completed">Završen</SelectItem>
                <SelectItem value="terminated">Raskinut</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Broj</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Klijent</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Početak</TableHead>
                <TableHead>Kraj</TableHead>
                <TableHead className="text-right">Vrednost</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredContracts.map((contract) => (
                <TableRow key={contract.id}>
                  <TableCell className="font-medium">{contract.number}</TableCell>
                  <TableCell>{contract.title}</TableCell>
                  <TableCell>{contract.clientName}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{typeLabels[contract.type]}</Badge>
                  </TableCell>
                  <TableCell>{new Date(contract.startDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(contract.endDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(contract.value)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[contract.status]}>
                      {statusLabels[contract.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Prikaži" onClick={() => handleView(contract)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Izmeni" onClick={() => handleEdit(contract)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Obriši" onClick={() => handleDelete(contract.id)}>
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

      <ContractDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        contract={selectedContract}
        onSave={handleSave}
        mode={dialogMode}
      />

      <ConfirmDialog
        open={deleteDialogOpen}
        onOpenChange={setDeleteDialogOpen}
        title="Obrisati ugovor?"
        description="Da li ste sigurni da želite da obrišete ovaj ugovor? Ova akcija se ne može poništiti."
        confirmLabel="Obriši"
        variant="destructive"
        onConfirm={confirmDelete}
      />
    </div>
  );
};

export default Contracts;
