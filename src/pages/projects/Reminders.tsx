 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Badge } from '@/components/ui/badge';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Textarea } from '@/components/ui/textarea';
 import { Plus, Search, Bell, Clock, Calendar, Edit, Trash2, CheckCircle } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { clientsApi } from '@/services/apiService';
 
 interface Reminder {
   id: string;
   title: string;
   description: string;
   dueDate: string;
   dueTime: string;
   priority: 'low' | 'medium' | 'high';
   category: string;
   completed: boolean;
   recurring: boolean;
 }
 
 const initialReminders: Reminder[] = [
   { id: '1', title: 'Pozovi klijenta ABC', description: 'Dogovoriti sastanak za sledeću nedelju', dueDate: '2024-02-15', dueTime: '10:00', priority: 'high', category: 'Prodaja', completed: false, recurring: false },
   { id: '2', title: 'Platiti porez', description: 'Mesečni porez na promet', dueDate: '2024-02-20', dueTime: '12:00', priority: 'high', category: 'Finansije', completed: false, recurring: true },
   { id: '3', title: 'Tim meeting', description: 'Sedmični sastanak tima', dueDate: '2024-02-16', dueTime: '09:00', priority: 'medium', category: 'Interni', completed: false, recurring: true },
   { id: '4', title: 'Poslati ponudu', description: 'Ponuda za projekat XYZ', dueDate: '2024-02-14', dueTime: '14:00', priority: 'medium', category: 'Prodaja', completed: true, recurring: false },
 ];
 
 const Reminders = () => {
   const [reminders, setReminders] = useState<Reminder[]>(initialReminders);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     title: '',
     description: '',
     dueDate: '',
     dueTime: '',
     priority: 'medium' as Reminder['priority'],
     category: '',
     recurring: false,
   });
 
   const filteredReminders = reminders.filter(r =>
     r.title.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getPriorityBadge = (priority: Reminder['priority']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
       high: { label: 'Visok', variant: 'destructive' },
       medium: { label: 'Srednji', variant: 'default' },
       low: { label: 'Nizak', variant: 'secondary' },
     };
     return <Badge variant={variants[priority].variant}>{variants[priority].label}</Badge>;
   };
 
   const toggleComplete = (id: string) => {
     setReminders(reminders.map(r => r.id === id ? { ...r, completed: !r.completed } : r));
   };
 
   const handleSubmit = () => {
     if (editingReminder) {
       setReminders(reminders.map(r => r.id === editingReminder.id ? { ...r, ...formData, completed: r.completed } : r));
       toast({ title: 'Podsetnik ažuriran', description: 'Podsetnik je uspešno izmenjen.' });
     } else {
       const newReminder: Reminder = { ...formData, id: Date.now().toString(), completed: false };
       setReminders([...reminders, newReminder]);
       toast({ title: 'Podsetnik kreiran', description: 'Novi podsetnik je dodat.' });
     }
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ title: '', description: '', dueDate: '', dueTime: '', priority: 'medium', category: '', recurring: false });
     setEditingReminder(null);
   };
 
   const openEdit = (reminder: Reminder) => {
     setEditingReminder(reminder);
     setFormData({ ...reminder });
     setDialogOpen(true);
   };
 
   const handleDelete = (id: string) => {
     setReminders(reminders.filter(r => r.id !== id));
     toast({ title: 'Podsetnik obrisan', description: 'Podsetnik je uklonjen.' });
   };
 
   const pendingReminders = reminders.filter(r => !r.completed);
   const completedReminders = reminders.filter(r => r.completed);
   const highPriorityCount = reminders.filter(r => r.priority === 'high' && !r.completed).length;
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Aktivnosti i podsetnici</h1>
           <p className="text-muted-foreground">Upravljanje podsetnicima i zakazanim aktivnostima</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Novi podsetnik
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno</CardTitle>
             <Bell className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{reminders.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Na čekanju</CardTitle>
             <Clock className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-orange-600">{pendingReminders.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Visok prioritet</CardTitle>
             <Bell className="h-4 w-4 text-red-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">{highPriorityCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Završeno</CardTitle>
             <CheckCircle className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{completedReminders.length}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista podsetnika</CardTitle>
               <CardDescription>Pregled svih podsetnika</CardDescription>
             </div>
             <div className="relative w-64">
               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Pretraži..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-3">
             {filteredReminders.map(reminder => (
               <div key={reminder.id} className={`flex items-center gap-4 p-4 border rounded-lg ${reminder.completed ? 'opacity-60' : ''}`}>
                 <Checkbox checked={reminder.completed} onCheckedChange={() => toggleComplete(reminder.id)} />
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <span className={`font-medium ${reminder.completed ? 'line-through' : ''}`}>{reminder.title}</span>
                     {getPriorityBadge(reminder.priority)}
                     {reminder.recurring && <Badge variant="outline">Ponavljajući</Badge>}
                   </div>
                   <p className="text-sm text-muted-foreground">{reminder.description}</p>
                   <div className="flex items-center gap-4 mt-1 text-xs text-muted-foreground">
                     <span className="flex items-center gap-1"><Calendar className="h-3 w-3" />{reminder.dueDate}</span>
                     <span className="flex items-center gap-1"><Clock className="h-3 w-3" />{reminder.dueTime}</span>
                     <Badge variant="secondary">{reminder.category}</Badge>
                   </div>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="icon" onClick={() => openEdit(reminder)}><Edit className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(reminder.id)}><Trash2 className="h-4 w-4" /></Button>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>{editingReminder ? 'Izmeni podsetnik' : 'Novi podsetnik'}</DialogTitle>
             <DialogDescription>Unesite podatke o podsetniku</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Naslov</Label>
               <Input value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
             </div>
             <div className="grid gap-2">
               <Label>Opis</Label>
               <Textarea value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Datum</Label>
                 <Input type="date" value={formData.dueDate} onChange={e => setFormData({ ...formData, dueDate: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Vreme</Label>
                 <Input type="time" value={formData.dueTime} onChange={e => setFormData({ ...formData, dueTime: e.target.value })} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Prioritet</Label>
                 <Select value={formData.priority} onValueChange={v => setFormData({ ...formData, priority: v as Reminder['priority'] })}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="high">Visok</SelectItem>
                     <SelectItem value="medium">Srednji</SelectItem>
                     <SelectItem value="low">Nizak</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid gap-2">
                 <Label>Kategorija</Label>
                 <Input value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} placeholder="npr. Prodaja, Finansije..." />
               </div>
             </div>
             <div className="flex items-center gap-2">
               <Checkbox checked={formData.recurring} onCheckedChange={c => setFormData({ ...formData, recurring: !!c })} />
               <Label>Ponavljajući podsetnik</Label>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>{editingReminder ? 'Sačuvaj' : 'Kreiraj'}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default Reminders;