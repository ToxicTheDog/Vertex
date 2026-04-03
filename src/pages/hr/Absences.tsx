import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, CalendarDays, Clock, CheckCircle, XCircle, Eye, Edit, Trash2, Check, X } from 'lucide-react';
import { toast } from 'sonner';
import { demoAbsences, demoEmployees, Absence } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { employeesApi } from '@/services/apiService';

const typeLabels: Record<string, string> = {
  vacation: 'Godišnji odmor',
  sick: 'Bolovanje',
  unpaid: 'Neplaćeno',
  maternity: 'Porodiljsko',
  other: 'Ostalo',
};

const typeColors: Record<string, string> = {
  vacation: 'bg-info text-info-foreground',
  sick: 'bg-destructive text-destructive-foreground',
  unpaid: 'bg-warning text-warning-foreground',
  maternity: 'bg-purple-500/10 text-purple-500',
  other: 'bg-muted text-muted-foreground',
};

const statusLabels: Record<string, string> = {
  pending: 'Na čekanju',
  approved: 'Odobreno',
  rejected: 'Odbijeno',
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning text-warning-foreground',
  approved: 'bg-success text-success-foreground',
  rejected: 'bg-destructive text-destructive-foreground',
};

const Absences = () => {
  const [absences, setAbsences] = useState<Absence[]>(demoAbsences);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedAbsence, setSelectedAbsence] = useState<Absence | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    employeeId: '',
    type: 'vacation' as Absence['type'],
    startDate: '',
    endDate: '',
    reason: '',
  });

  const handleSubmit = () => {
    const employee = demoEmployees.find(e => e.id === formData.employeeId);
    if (!employee) {
      toast.error('Izaberite zaposlenog');
      return;
    }

    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1;

    const newAbsence: Absence = {
      id: isEditing && selectedAbsence ? selectedAbsence.id : Date.now().toString(),
      employeeId: formData.employeeId,
      employeeName: `${employee.firstName} ${employee.lastName}`,
      type: formData.type,
      startDate: formData.startDate,
      endDate: formData.endDate,
      days,
      status: 'pending',
      reason: formData.reason,
    };

    if (isEditing && selectedAbsence) {
      setAbsences(absences.map(a => a.id === selectedAbsence.id ? newAbsence : a));
      toast.success('Zahtev je uspešno izmenjen');
    } else {
      setAbsences([newAbsence, ...absences]);
      toast.success('Zahtev za odsustvo je kreiran');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      employeeId: '',
      type: 'vacation',
      startDate: '',
      endDate: '',
      reason: '',
    });
    setIsEditing(false);
    setSelectedAbsence(null);
  };

  const handleEdit = (absence: Absence) => {
    setSelectedAbsence(absence);
    setFormData({
      employeeId: absence.employeeId,
      type: absence.type,
      startDate: absence.startDate,
      endDate: absence.endDate,
      reason: absence.reason,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setAbsences(absences.filter(a => a.id !== id));
    toast.success('Zahtev je obrisan');
  };

  const handleView = (absence: Absence) => {
    setSelectedAbsence(absence);
    setViewDialogOpen(true);
  };

  const handleApprove = (id: string) => {
    setAbsences(absences.map(a => a.id === id ? { ...a, status: 'approved' } : a));
    toast.success('Zahtev je odobren');
  };

  const handleReject = (id: string) => {
    setAbsences(absences.map(a => a.id === id ? { ...a, status: 'rejected' } : a));
    toast.success('Zahtev je odbijen');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Odsustva / Godišnji odmori</h1>
          <p className="text-muted-foreground">Upravljanje zahtevima za odsustvo</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Novi zahtev
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno zahteva</p>
                <p className="text-2xl font-bold">{absences.length}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Na čekanju</p>
                <p className="text-2xl font-bold text-warning">{absences.filter(a => a.status === 'pending').length}</p>
              </div>
              <Clock className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Odobreno</p>
                <p className="text-2xl font-bold text-success">{absences.filter(a => a.status === 'approved').length}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno dana</p>
                <p className="text-2xl font-bold">{absences.filter(a => a.status === 'approved').reduce((sum, a) => sum + a.days, 0)}</p>
              </div>
              <CalendarDays className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Zahtevi za odsustvo</CardTitle>
          <CardDescription>Svi zahtevi za godišnji odmor i odsustva</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Zaposleni</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Od</TableHead>
                <TableHead>Do</TableHead>
                <TableHead>Dana</TableHead>
                <TableHead>Razlog</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {absences.map((absence) => (
                <TableRow key={absence.id}>
                  <TableCell className="font-medium">{absence.employeeName}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[absence.type]}>
                      {typeLabels[absence.type]}
                    </Badge>
                  </TableCell>
                  <TableCell>{new Date(absence.startDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{new Date(absence.endDate).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{absence.days}</TableCell>
                  <TableCell className="max-w-[150px] truncate">{absence.reason}</TableCell>
                  <TableCell>
                    <Badge className={statusColors[absence.status]}>
                      {statusLabels[absence.status]}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(absence)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      {absence.status === 'pending' && (
                        <>
                          <Button variant="ghost" size="icon" onClick={() => handleApprove(absence.id)}>
                            <Check className="h-4 w-4 text-success" />
                          </Button>
                          <Button variant="ghost" size="icon" onClick={() => handleReject(absence.id)}>
                            <X className="h-4 w-4 text-destructive" />
                          </Button>
                        </>
                      )}
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(absence.id)}>
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

      {/* Dialog za novi/izmenu zahtev */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena zahteva' : 'Novi zahtev za odsustvo'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o odsustvu
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
              <Label>Tip odsustva</Label>
              <Select value={formData.type} onValueChange={(v: Absence['type']) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="startDate">Od</Label>
                <Input
                  id="startDate"
                  type="date"
                  value={formData.startDate}
                  onChange={(e) => setFormData({...formData, startDate: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="endDate">Do</Label>
                <Input
                  id="endDate"
                  type="date"
                  value={formData.endDate}
                  onChange={(e) => setFormData({...formData, endDate: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="reason">Razlog</Label>
              <Textarea
                id="reason"
                rows={3}
                value={formData.reason}
                onChange={(e) => setFormData({...formData, reason: e.target.value})}
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
            <DialogTitle>Detalji zahteva</DialogTitle>
          </DialogHeader>
          {selectedAbsence && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <CalendarDays className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedAbsence.employeeName}</h3>
                  <div className="flex gap-2 mt-1">
                    <Badge className={typeColors[selectedAbsence.type]}>
                      {typeLabels[selectedAbsence.type]}
                    </Badge>
                    <Badge className={statusColors[selectedAbsence.status]}>
                      {statusLabels[selectedAbsence.status]}
                    </Badge>
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Od</Label>
                  <p className="font-medium">{new Date(selectedAbsence.startDate).toLocaleDateString('sr-RS')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Do</Label>
                  <p className="font-medium">{new Date(selectedAbsence.endDate).toLocaleDateString('sr-RS')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ukupno</Label>
                  <p className="font-bold">{selectedAbsence.days} dana</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Razlog</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedAbsence.reason}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Absences;
