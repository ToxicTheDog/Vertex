import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Calendar, User, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { employeesApi, timeTrackingApi } from '@/services/apiService';
import { DatePickerField } from '@/components/shared/DatePickerField';

const PAGE_SIZE = 10;

const TimeTracking = () => {
  const [entries, setEntries] = useState<any[]>([]);
  const [employees, setEmployees] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<any | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    description: '',
    projectName: '',
  });

  const fetchEntries = async (page = currentPage, search = searchTerm) => {
    const response = await timeTrackingApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      search,
    });

    setEntries(response.success ? response.data : []);
    setTotalItems(response.success ? response.total : 0);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  const fetchEmployees = async () => {
    const response = await employeesApi.getAll();
    setEmployees(response.success && response.data ? response.data : []);
  };

  useEffect(() => {
    fetchEmployees();
  }, []);

  useEffect(() => {
    fetchEntries(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const totalHours = entries.reduce((sum, entry) => sum + (Number(entry.hoursWorked) || 0), 0);
  const today = new Date().toISOString().split('T')[0];
  const todayHours = entries.filter((entry) => entry.date === today).reduce((sum, entry) => sum + (Number(entry.hoursWorked) || 0), 0);
  const averageHours = entries.length > 0 ? (totalHours / entries.length).toFixed(1) : '0.0';

  const resetForm = () => {
    setFormData({
      employeeId: '',
      date: new Date().toISOString().split('T')[0],
      startTime: '08:00',
      endTime: '16:00',
      description: '',
      projectName: '',
    });
    setIsEditing(false);
    setSelectedEntry(null);
  };

  const handleSubmit = async () => {
    const payload = {
      employeeId: formData.employeeId,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      description: formData.description,
      projectName: formData.projectName,
    };

    const response = isEditing && selectedEntry
      ? await timeTrackingApi.update(selectedEntry.id, payload)
      : await timeTrackingApi.create(payload);

    if (!response.success) {
      toast.error(response.message || 'Čuvanje nije uspelo');
      return;
    }

    toast.success(isEditing ? 'Unos je uspešno izmenjen' : 'Radno vreme je uspešno evidentirano');
    setDialogOpen(false);
    resetForm();
    fetchEntries(currentPage, searchTerm);
  };

  const handleEdit = (entry: any) => {
    setSelectedEntry(entry);
    setFormData({
      employeeId: entry.employeeId,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      description: entry.description || '',
      projectName: entry.projectName || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (entry: any) => {
    const response = await timeTrackingApi.delete(entry.id);

    if (!response.success) {
      toast.error(response.message || 'Brisanje nije uspelo');
      return;
    }

    toast.success('Unos je obrisan');

    if (entries.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchEntries(currentPage, searchTerm);
    }
  };

  const handleView = (entry: any) => {
    setSelectedEntry(entry);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Evidencija radnog vremena</h1>
          <p className="text-muted-foreground">Praćenje radnih sati zaposlenih</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi unos
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno unosa</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Sati na stranici</p>
                <p className="text-2xl font-bold">{totalHours}h</p>
              </div>
              <Clock className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Danas na stranici</p>
                <p className="text-2xl font-bold">{todayHours}h</p>
              </div>
              <Calendar className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prosek na stranici</p>
                <p className="text-2xl font-bold">{averageHours}h</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Evidencija</CardTitle>
              <CardDescription>Svi unosi radnog vremena</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
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
                <TableHead>Datum</TableHead>
                <TableHead>Zaposleni</TableHead>
                <TableHead>Početak</TableHead>
                <TableHead>Kraj</TableHead>
                <TableHead>Sati</TableHead>
                <TableHead>Projekat</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="font-medium">{entry.employeeName}</TableCell>
                  <TableCell>{entry.startTime}</TableCell>
                  <TableCell>{entry.endTime}</TableCell>
                  <TableCell><Badge variant="secondary">{entry.hoursWorked}h</Badge></TableCell>
                  <TableCell>{entry.projectName || '-'}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(entry)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(entry)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {entries.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
                    Nema unosa za prikaz.
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
            <DialogTitle>{isEditing ? 'Izmena unosa' : 'Novi unos radnog vremena'}</DialogTitle>
            <DialogDescription>Evidentirajte radno vreme</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Zaposleni</Label>
              <Select value={formData.employeeId} onValueChange={(value) => setFormData({ ...formData, employeeId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite zaposlenog" />
                </SelectTrigger>
                <SelectContent>
                  {employees.map((employee) => (
                    <SelectItem key={employee.id} value={employee.id}>{employee.firstName} {employee.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <DatePickerField value={formData.date} onChange={(value) => setFormData({ ...formData, date: value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Početak</Label>
                <Input id="startTime" type="time" value={formData.startTime} onChange={(event) => setFormData({ ...formData, startTime: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Kraj</Label>
                <Input id="endTime" type="time" value={formData.endTime} onChange={(event) => setFormData({ ...formData, endTime: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectName">Projekat (opciono)</Label>
              <Input id="projectName" value={formData.projectName} onChange={(event) => setFormData({ ...formData, projectName: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis aktivnosti</Label>
              <Input id="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Evidentiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji unosa</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Clock className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedEntry.employeeName}</h3>
                  <p className="text-muted-foreground">{new Date(selectedEntry.date).toLocaleDateString('sr-RS')}</p>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Početak</Label>
                  <p className="font-medium">{selectedEntry.startTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Kraj</Label>
                  <p className="font-medium">{selectedEntry.endTime}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ukupno</Label>
                  <p className="font-bold text-primary">{selectedEntry.hoursWorked}h</p>
                </div>
              </div>
              {selectedEntry.projectName && (
                <div>
                  <Label className="text-muted-foreground">Projekat</Label>
                  <p className="font-medium">{selectedEntry.projectName}</p>
                </div>
              )}
              <div>
                <Label className="text-muted-foreground">Opis</Label>
                <p className="font-medium">{selectedEntry.description}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TimeTracking;
