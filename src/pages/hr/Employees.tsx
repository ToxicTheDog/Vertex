import { useEffect, useState } from 'react';
import { Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Clock, DollarSign } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { employeesApi } from '@/services/apiService';
import { DatePickerField } from '@/components/shared/DatePickerField';

const PAGE_SIZE = 10;

const statusColors: Record<string, string> = {
  active: 'bg-success text-success-foreground',
  inactive: 'bg-muted text-muted-foreground',
  'on-leave': 'bg-warning text-warning-foreground'
};

const statusLabels: Record<string, string> = {
  active: 'Aktivan',
  inactive: 'Neaktivan',
  'on-leave': 'Na odsustvu'
};

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const emptyForm = {
  firstName: '',
  lastName: '',
  jmbg: '',
  position: '',
  department: '',
  email: '',
  phone: '',
  salary: '',
  startDate: '',
  status: 'active',
};

const Employees = () => {
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  const fetchEmployees = async (page = currentPage, search = searchTerm) => {
    const response = await employeesApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      search,
    });

    setEmployees(response.success ? response.data : []);
    setTotalItems(response.success ? response.total : 0);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  useEffect(() => {
    fetchEmployees(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const activeEmployees = employees.filter((employee) => employee.status === 'active').length;
  const totalSalaries = employees.filter((employee) => employee.status === 'active').reduce((sum, employee) => sum + (Number(employee.salary) || 0), 0);

  const openCreateDialog = () => {
    setSelectedEmployee(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (employee: any) => {
    setSelectedEmployee(employee);
    setFormData({
      firstName: employee.firstName || '',
      lastName: employee.lastName || '',
      jmbg: employee.jmbg || '',
      position: employee.position || '',
      department: employee.department || '',
      email: employee.email || '',
      phone: employee.phone || '',
      salary: String(employee.salary || ''),
      startDate: employee.startDate || '',
      status: employee.status || 'active',
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.firstName || !formData.lastName) {
      toast({ title: 'Greška', description: 'Ime i prezime su obavezni', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    const payload = {
      ...formData,
      salary: Number(formData.salary) || 0,
    };

    const response = selectedEmployee
      ? await employeesApi.update(selectedEmployee.id, payload)
      : await employeesApi.create(payload);

    setIsSubmitting(false);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Čuvanje nije uspelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Uspešno', description: selectedEmployee ? 'Radnik je izmenjen' : 'Radnik je dodat' });
    setIsDialogOpen(false);
    fetchEmployees(currentPage, searchTerm);
  };

  const handleDelete = async (employee: any) => {
    const response = await employeesApi.delete(employee.id);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Brisanje nije uspelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Uspešno', description: 'Radnik je obrisan' });

    if (employees.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchEmployees(currentPage, searchTerm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Radnici</h1>
          <p className="text-muted-foreground">Pregled i upravljanje zaposlenima</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <UserPlus className="mr-2 h-4 w-4" />
              Novi radnik
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedEmployee ? 'Izmeni radnika' : 'Dodaj novog radnika'}</DialogTitle>
              <DialogDescription>Unesite podatke o zaposlenom</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Ime</Label>
                  <Input id="firstName" value={formData.firstName} onChange={(event) => setFormData({ ...formData, firstName: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Prezime</Label>
                  <Input id="lastName" value={formData.lastName} onChange={(event) => setFormData({ ...formData, lastName: event.target.value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jmbg">JMBG</Label>
                <Input id="jmbg" value={formData.jmbg} onChange={(event) => setFormData({ ...formData, jmbg: event.target.value })} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Pozicija</Label>
                  <Input id="position" value={formData.position} onChange={(event) => setFormData({ ...formData, position: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Odeljenje</Label>
                  <Input id="department" value={formData.department} onChange={(event) => setFormData({ ...formData, department: event.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salary">Plata (RSD)</Label>
                  <Input id="salary" type="number" value={formData.salary} onChange={(event) => setFormData({ ...formData, salary: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Datum zaposlenja</Label>
                  <DatePickerField value={formData.startDate} onChange={(value) => setFormData({ ...formData, startDate: value })} />
                </div>
              </div>
              <div className="grid gap-2">
                <Label>Status</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Aktivan</SelectItem>
                    <SelectItem value="inactive">Neaktivan</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleSubmit} disabled={isSubmitting}>
                {isSubmitting ? 'Čuvanje...' : 'Sačuvaj'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno radnika</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/10 p-3">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktivni na stranici</p>
                <p className="text-2xl font-bold">{activeEmployees}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/10 p-3">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Plate na stranici</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu, poziciji..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Ime i prezime</TableHead>
                <TableHead>Pozicija</TableHead>
                <TableHead>Odeljenje</TableHead>
                <TableHead>Email</TableHead>
                <TableHead className="text-right">Plata</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {employees.map((employee) => (
                <TableRow key={employee.id}>
                  <TableCell className="font-medium">{employee.firstName} {employee.lastName}</TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(employee.salary) || 0)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.status] || statusColors.inactive}>
                      {statusLabels[employee.status] || employee.status}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akcije</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Dosije
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditDialog(employee)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(employee)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {employees.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema radnika za prikaz.
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
    </div>
  );
};

export default Employees;
