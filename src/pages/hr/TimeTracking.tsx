import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Clock, Calendar, User, Search, Eye, Edit, Trash2, Play, Pause } from 'lucide-react';
import { toast } from 'sonner';
import { demoTimeEntries, demoEmployees, TimeEntry } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { apiService } from '@/services/apiService';

const TimeTracking = () => {
  const [entries, setEntries] = useState<TimeEntry[]>(demoTimeEntries);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<TimeEntry | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    date: new Date().toISOString().split('T')[0],
    startTime: '08:00',
    endTime: '16:00',
    description: '',
    projectName: '',
  });

  const filteredEntries = entries.filter(e => 
    e.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.description.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const totalHours = entries.reduce((sum, e) => sum + e.hoursWorked, 0);
  const todayEntries = entries.filter(e => e.date === new Date().toISOString().split('T')[0]);
  const todayHours = todayEntries.reduce((sum, e) => sum + e.hoursWorked, 0);

  const handleSubmit = () => {
    const employee = demoEmployees.find(e => e.id === formData.employeeId);
    if (!employee) {
      toast.error('Izaberite zaposlenog');
      return;
    }

    const start = formData.startTime.split(':').map(Number);
    const end = formData.endTime.split(':').map(Number);
    const hoursWorked = (end[0] + end[1]/60) - (start[0] + start[1]/60);

    const newEntry: TimeEntry = {
      id: isEditing && selectedEntry ? selectedEntry.id : Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      date: formData.date,
      startTime: formData.startTime,
      endTime: formData.endTime,
      hoursWorked: Math.round(hoursWorked * 10) / 10,
      projectName: formData.projectName || undefined,
      description: formData.description,
    };

    if (isEditing && selectedEntry) {
      setEntries(entries.map(e => e.id === selectedEntry.id ? newEntry : e));
      toast.success('Unos je uspešno izmenjen');
    } else {
      setEntries([newEntry, ...entries]);
      toast.success('Radno vreme je uspešno evidentirano');
    }

    setDialogOpen(false);
    resetForm();
  };

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

  const handleEdit = (entry: TimeEntry) => {
    setSelectedEntry(entry);
    setFormData({
      employeeId: entry.employeeId,
      date: entry.date,
      startTime: entry.startTime,
      endTime: entry.endTime,
      description: entry.description,
      projectName: entry.projectName || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
    toast.success('Unos je obrisan');
  };

  const handleView = (entry: TimeEntry) => {
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

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno unosa</p>
                <p className="text-2xl font-bold">{entries.length}</p>
              </div>
              <Calendar className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno sati</p>
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
                <p className="text-sm text-muted-foreground">Danas</p>
                <p className="text-2xl font-bold">{todayHours}h</p>
              </div>
              <Play className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Prosek po danu</p>
                <p className="text-2xl font-bold">{(totalHours / entries.length).toFixed(1)}h</p>
              </div>
              <User className="h-8 w-8 text-muted-foreground" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
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
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
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
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{new Date(entry.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="font-medium">{entry.employeeName}</TableCell>
                  <TableCell>{entry.startTime}</TableCell>
                  <TableCell>{entry.endTime}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{entry.hoursWorked}h</Badge>
                  </TableCell>
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(entry.id)}>
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

      {/* Dialog za novi/izmenu unos */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena unosa' : 'Novi unos radnog vremena'}</DialogTitle>
            <DialogDescription>
              Evidentirajte radno vreme
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Zaposleni</Label>
              <Select value={formData.employeeId} onValueChange={(v) => setFormData({...formData, employeeId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite zaposlenog" />
                </SelectTrigger>
                <SelectContent>
                  {demoEmployees.map((emp) => (
                    <SelectItem key={emp.id} value={emp.id}>{emp.firstName} {emp.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Datum</Label>
              <Input
                id="date"
                type="date"
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
              />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startTime">Početak</Label>
                <Input
                  id="startTime"
                  type="time"
                  value={formData.startTime}
                  onChange={(e) => setFormData({...formData, startTime: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endTime">Kraj</Label>
                <Input
                  id="endTime"
                  type="time"
                  value={formData.endTime}
                  onChange={(e) => setFormData({...formData, endTime: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="projectName">Projekat (opciono)</Label>
              <Input
                id="projectName"
                value={formData.projectName}
                onChange={(e) => setFormData({...formData, projectName: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis aktivnosti</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Evidentiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji unosa</DialogTitle>
          </DialogHeader>
          {selectedEntry && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
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
