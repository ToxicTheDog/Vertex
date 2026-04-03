 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, Search, Eye, Edit, Trash2, Plane, Calendar, MapPin, DollarSign } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { employeesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface BusinessTrip {
   id: string;
   employeeName: string;
   destination: string;
   purpose: string;
   startDate: string;
   endDate: string;
   status: 'planned' | 'in_progress' | 'completed' | 'cancelled';
   budget: number;
   expenses: number;
 }
 
 const initialTrips: BusinessTrip[] = [
   { id: '1', employeeName: 'Marko Marković', destination: 'Beograd', purpose: 'Sastanak sa klijentom', startDate: '2024-02-15', endDate: '2024-02-17', status: 'completed', budget: 50000, expenses: 45000 },
   { id: '2', employeeName: 'Ana Petrović', destination: 'Novi Sad', purpose: 'Konferencija', startDate: '2024-03-01', endDate: '2024-03-03', status: 'planned', budget: 35000, expenses: 0 },
   { id: '3', employeeName: 'Jovan Jovanović', destination: 'Niš', purpose: 'Obuka', startDate: '2024-02-20', endDate: '2024-02-22', status: 'in_progress', budget: 40000, expenses: 25000 },
 ];
 
 const BusinessTrips = () => {
   const { data: trips, setData: setTrips } = useFetchData(() => employeesApi.getAll(), initialTrips);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingTrip, setEditingTrip] = useState<BusinessTrip | null>(null);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     employeeName: '',
     destination: '',
     purpose: '',
     startDate: '',
     endDate: '',
     status: 'planned' as BusinessTrip['status'],
     budget: 0,
   });
 
   const filteredTrips = trips.filter(trip =>
     trip.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     trip.destination.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getStatusBadge = (status: BusinessTrip['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       planned: { label: 'Planirano', variant: 'outline' },
       in_progress: { label: 'U toku', variant: 'default' },
       completed: { label: 'Završeno', variant: 'secondary' },
       cancelled: { label: 'Otkazano', variant: 'destructive' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const handleSubmit = () => {
     if (editingTrip) {
       setTrips(trips.map(t => t.id === editingTrip.id ? { ...t, ...formData } : t));
       toast({ title: 'Putovanje ažurirano', description: 'Službeno putovanje je uspešno izmenjeno.' });
     } else {
       const newTrip: BusinessTrip = { ...formData, id: Date.now().toString(), expenses: 0 };
       setTrips([...trips, newTrip]);
       toast({ title: 'Putovanje kreirano', description: 'Novo službeno putovanje je dodato.' });
     }
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ employeeName: '', destination: '', purpose: '', startDate: '', endDate: '', status: 'planned', budget: 0 });
     setEditingTrip(null);
   };
 
   const openEdit = (trip: BusinessTrip) => {
     setEditingTrip(trip);
     setFormData({ ...trip });
     setDialogOpen(true);
   };
 
   const handleDelete = (id: string) => {
     setTrips(trips.filter(t => t.id !== id));
     toast({ title: 'Putovanje obrisano', description: 'Službeno putovanje je uklonjeno.' });
   };
 
   const totalBudget = trips.reduce((sum, t) => sum + t.budget, 0);
   const totalExpenses = trips.reduce((sum, t) => sum + t.expenses, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Službena putovanja</h1>
           <p className="text-muted-foreground">Evidencija i praćenje službenih putovanja</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Novo putovanje
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno putovanja</CardTitle>
             <Plane className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{trips.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">U toku</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{trips.filter(t => t.status === 'in_progress').length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupan budžet</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalBudget.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupni troškovi</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalExpenses.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista putovanja</CardTitle>
               <CardDescription>Pregled svih službenih putovanja</CardDescription>
             </div>
             <div className="relative w-64">
               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Pretraži..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Zaposleni</TableHead>
                 <TableHead>Destinacija</TableHead>
                 <TableHead>Svrha</TableHead>
                 <TableHead>Period</TableHead>
                 <TableHead>Budžet</TableHead>
                 <TableHead>Troškovi</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Akcije</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredTrips.map(trip => (
                 <TableRow key={trip.id}>
                   <TableCell className="font-medium">{trip.employeeName}</TableCell>
                   <TableCell><MapPin className="inline h-3 w-3 mr-1" />{trip.destination}</TableCell>
                   <TableCell>{trip.purpose}</TableCell>
                   <TableCell>{trip.startDate} - {trip.endDate}</TableCell>
                   <TableCell>{trip.budget.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{trip.expenses.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{getStatusBadge(trip.status)}</TableCell>
                   <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => openEdit(trip)}><Edit className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(trip.id)}><Trash2 className="h-4 w-4" /></Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
 
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingTrip ? 'Izmeni putovanje' : 'Novo putovanje'}</DialogTitle>
             <DialogDescription>Unesite podatke o službenom putovanju</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Zaposleni</Label>
               <Input value={formData.employeeName} onChange={e => setFormData({ ...formData, employeeName: e.target.value })} />
             </div>
             <div className="grid gap-2">
               <Label>Destinacija</Label>
               <Input value={formData.destination} onChange={e => setFormData({ ...formData, destination: e.target.value })} />
             </div>
             <div className="grid gap-2">
               <Label>Svrha putovanja</Label>
               <Input value={formData.purpose} onChange={e => setFormData({ ...formData, purpose: e.target.value })} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Datum polaska</Label>
                 <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Datum povratka</Label>
                 <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
               </div>
             </div>
             <div className="grid gap-2">
               <Label>Budžet (RSD)</Label>
               <Input type="number" value={formData.budget} onChange={e => setFormData({ ...formData, budget: Number(e.target.value) })} />
             </div>
             <div className="grid gap-2">
               <Label>Status</Label>
               <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as BusinessTrip['status'] })}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="planned">Planirano</SelectItem>
                   <SelectItem value="in_progress">U toku</SelectItem>
                   <SelectItem value="completed">Završeno</SelectItem>
                   <SelectItem value="cancelled">Otkazano</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>{editingTrip ? 'Sačuvaj' : 'Kreiraj'}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default BusinessTrips;