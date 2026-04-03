import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, UserPlus, Clock, DollarSign, Calendar } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { demoEmployees } from '@/data/demoData';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { employeesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

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

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const Employees = () => {
  const { data: employees } = useFetchData(() => employeesApi.getAll(), demoEmployees);
  const [searchTerm, setSearchTerm] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const filteredEmployees = employees.filter(emp =>
    `${emp.firstName} ${emp.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.position.toLowerCase().includes(searchTerm.toLowerCase()) ||
    emp.department.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleAddEmployee = () => {
    toast({
      title: "Radnik dodat",
      description: "Novi radnik je uspešno dodat u sistem"
    });
    setIsDialogOpen(false);
  };

  const totalSalaries = employees.filter(e => e.status === 'active').reduce((sum, e) => sum + e.salary, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Radnici</h1>
          <p className="text-muted-foreground">Pregled i upravljanje zaposlenima</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <UserPlus className="mr-2 h-4 w-4" />
              Novi radnik
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Dodaj novog radnika</DialogTitle>
              <DialogDescription>
                Unesite podatke o novom zaposlenom
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="firstName">Ime</Label>
                  <Input id="firstName" placeholder="Ime" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="lastName">Prezime</Label>
                  <Input id="lastName" placeholder="Prezime" />
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="jmbg">JMBG</Label>
                <Input id="jmbg" placeholder="0101990710001" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="position">Pozicija</Label>
                  <Input id="position" placeholder="Programer" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="department">Odeljenje</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="it">IT</SelectItem>
                      <SelectItem value="finance">Finansije</SelectItem>
                      <SelectItem value="hr">Ljudski resursi</SelectItem>
                      <SelectItem value="sales">Prodaja</SelectItem>
                      <SelectItem value="management">Uprava</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="email">Email</Label>
                  <Input id="email" type="email" placeholder="ime@firma.rs" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input id="phone" placeholder="+381 60 123 4567" />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="salary">Plata (RSD)</Label>
                  <Input id="salary" type="number" placeholder="100000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="startDate">Datum zaposlenja</Label>
                  <Input id="startDate" type="date" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={handleAddEmployee}>Sačuvaj</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <UserPlus className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno radnika</p>
                <p className="text-2xl font-bold">{employees.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <Clock className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Aktivni</p>
                <p className="text-2xl font-bold">{employees.filter(e => e.status === 'active').length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <DollarSign className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Mesečni troškovi plata</p>
                <p className="text-2xl font-bold">{formatCurrency(totalSalaries)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu, poziciji..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredEmployees.map((employee) => (
                <TableRow key={employee.id} className="data-table-row">
                  <TableCell className="font-medium">
                    {employee.firstName} {employee.lastName}
                  </TableCell>
                  <TableCell>{employee.position}</TableCell>
                  <TableCell>{employee.department}</TableCell>
                  <TableCell>{employee.email}</TableCell>
                  <TableCell className="text-right">{formatCurrency(employee.salary)}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[employee.status]}>
                      {statusLabels[employee.status]}
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
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Calendar className="mr-2 h-4 w-4" />
                          Odsustva
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Deaktiviraj
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Employees;
