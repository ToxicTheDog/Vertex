 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, Search, ClipboardCheck, Eye, Edit, Trash2, Play, CheckCircle } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';
 
 interface InventoryList {
   id: string;
   listNumber: string;
   warehouse: string;
   startDate: string;
   endDate?: string;
   status: 'draft' | 'in_progress' | 'completed' | 'approved';
   itemCount: number;
   discrepancyCount: number;
   createdBy: string;
 }
 
 const initialLists: InventoryList[] = [
   { id: '1', listNumber: 'INV-2024-001', warehouse: 'Magacin A', startDate: '2024-02-01', endDate: '2024-02-03', status: 'approved', itemCount: 150, discrepancyCount: 3, createdBy: 'Marko M.' },
   { id: '2', listNumber: 'INV-2024-002', warehouse: 'Magacin B', startDate: '2024-02-10', endDate: '2024-02-12', status: 'completed', itemCount: 80, discrepancyCount: 1, createdBy: 'Ana P.' },
   { id: '3', listNumber: 'INV-2024-003', warehouse: 'Magacin A', startDate: '2024-02-15', status: 'in_progress', itemCount: 45, discrepancyCount: 0, createdBy: 'Jovan J.' },
   { id: '4', listNumber: 'INV-2024-004', warehouse: 'Magacin C', startDate: '2024-02-20', status: 'draft', itemCount: 0, discrepancyCount: 0, createdBy: 'Marko M.' },
 ];
 
 const InventoryLists = () => {
   const [lists, setLists] = useState<InventoryList[]>(initialLists);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     warehouse: '',
     startDate: '',
   });
 
   const filteredLists = lists.filter(l =>
     l.listNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
     l.warehouse.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getStatusBadge = (status: InventoryList['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       draft: { label: 'Nacrt', variant: 'outline' },
       in_progress: { label: 'U toku', variant: 'default' },
       completed: { label: 'Završeno', variant: 'secondary' },
       approved: { label: 'Odobreno', variant: 'default' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const handleSubmit = () => {
     const newList: InventoryList = {
       ...formData,
       id: Date.now().toString(),
       listNumber: `INV-2024-${String(lists.length + 1).padStart(3, '0')}`,
       status: 'draft',
       itemCount: 0,
       discrepancyCount: 0,
       createdBy: 'Korisnik',
     };
     setLists([...lists, newList]);
     toast({ title: 'Lista kreirana', description: 'Nova inventurna lista je kreirana.' });
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ warehouse: '', startDate: '' });
   };
 
   const startInventory = (id: string) => {
     setLists(lists.map(l => l.id === id ? { ...l, status: 'in_progress' } : l));
     toast({ title: 'Inventura pokrenuta', description: 'Inventurna lista je aktivirana.' });
   };
 
   const completeInventory = (id: string) => {
     setLists(lists.map(l => l.id === id ? { ...l, status: 'completed', endDate: new Date().toISOString().split('T')[0] } : l));
     toast({ title: 'Inventura završena', description: 'Inventurna lista je označena kao završena.' });
   };
 
   const approveInventory = (id: string) => {
     setLists(lists.map(l => l.id === id ? { ...l, status: 'approved' } : l));
     toast({ title: 'Inventura odobrena', description: 'Inventurna lista je odobrena.' });
   };
 
   const handleDelete = (id: string) => {
     setLists(lists.filter(l => l.id !== id));
     toast({ title: 'Lista obrisana', description: 'Inventurna lista je uklonjena.' });
   };
 
   const completedCount = lists.filter(l => l.status === 'completed' || l.status === 'approved').length;
   const totalDiscrepancies = lists.reduce((sum, l) => sum + l.discrepancyCount, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Inventurne liste</h1>
           <p className="text-muted-foreground">Kreiranje i praćenje inventura</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Nova inventura
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno inventura</CardTitle>
             <ClipboardCheck className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{lists.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">U toku</CardTitle>
             <Play className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-blue-600">{lists.filter(l => l.status === 'in_progress').length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Završene</CardTitle>
             <CheckCircle className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{completedCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupna odstupanja</CardTitle>
             <ClipboardCheck className="h-4 w-4 text-orange-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-orange-600">{totalDiscrepancies}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista inventura</CardTitle>
               <CardDescription>Pregled svih inventurnih lista</CardDescription>
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
                 <TableHead>Broj liste</TableHead>
                 <TableHead>Magacin</TableHead>
                 <TableHead>Datum početka</TableHead>
                 <TableHead>Datum završetka</TableHead>
                 <TableHead>Broj stavki</TableHead>
                 <TableHead>Odstupanja</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead>Kreirao</TableHead>
                 <TableHead className="text-right">Akcije</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredLists.map(list => (
                 <TableRow key={list.id}>
                   <TableCell className="font-mono font-medium">{list.listNumber}</TableCell>
                   <TableCell>{list.warehouse}</TableCell>
                   <TableCell>{list.startDate}</TableCell>
                   <TableCell>{list.endDate || '-'}</TableCell>
                   <TableCell>{list.itemCount}</TableCell>
                   <TableCell className={list.discrepancyCount > 0 ? 'text-orange-600 font-bold' : ''}>{list.discrepancyCount}</TableCell>
                   <TableCell>{getStatusBadge(list.status)}</TableCell>
                   <TableCell>{list.createdBy}</TableCell>
                   <TableCell className="text-right">
                     {list.status === 'draft' && (
                       <Button variant="ghost" size="icon" onClick={() => startInventory(list.id)}><Play className="h-4 w-4 text-blue-600" /></Button>
                     )}
                     {list.status === 'in_progress' && (
                       <Button variant="ghost" size="icon" onClick={() => completeInventory(list.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                     )}
                     {list.status === 'completed' && (
                       <Button variant="ghost" size="icon" onClick={() => approveInventory(list.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                     )}
                     <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Pregled', description: 'Otvaranje detalja inventure...' })}><Eye className="h-4 w-4" /></Button>
                     {list.status === 'draft' && (
                       <Button variant="ghost" size="icon" onClick={() => handleDelete(list.id)}><Trash2 className="h-4 w-4" /></Button>
                     )}
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
             <DialogTitle>Nova inventurna lista</DialogTitle>
             <DialogDescription>Kreirajte novu inventuru za magacin</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Magacin</Label>
               <Select value={formData.warehouse} onValueChange={v => setFormData({ ...formData, warehouse: v })}>
                 <SelectTrigger><SelectValue placeholder="Izaberite magacin" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="Magacin A">Magacin A</SelectItem>
                   <SelectItem value="Magacin B">Magacin B</SelectItem>
                   <SelectItem value="Magacin C">Magacin C</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid gap-2">
               <Label>Datum početka</Label>
               <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>Kreiraj</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default InventoryLists;