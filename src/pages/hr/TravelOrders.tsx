 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Plus, Search, FileText, Edit, Trash2, Printer, CheckCircle } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { travelOrdersApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface TravelOrder {
   id: string;
   orderNumber: string;
   employeeName: string;
   destination: string;
   purpose: string;
   departureDate: string;
   returnDate: string;
   advancePayment: number;
   status: 'draft' | 'approved' | 'settled' | 'rejected';
   createdAt: string;
 }
 
 const initialOrders: TravelOrder[] = [
   { id: '1', orderNumber: 'PN-2024-001', employeeName: 'Marko Marković', destination: 'Beograd', purpose: 'Poslovni sastanak', departureDate: '2024-02-15', returnDate: '2024-02-17', advancePayment: 30000, status: 'settled', createdAt: '2024-02-10' },
   { id: '2', orderNumber: 'PN-2024-002', employeeName: 'Ana Petrović', destination: 'Novi Sad', purpose: 'IT konferencija', departureDate: '2024-03-01', returnDate: '2024-03-03', advancePayment: 25000, status: 'approved', createdAt: '2024-02-20' },
   { id: '3', orderNumber: 'PN-2024-003', employeeName: 'Jovan Jovanović', destination: 'Niš', purpose: 'Obuka zaposlenih', departureDate: '2024-03-10', returnDate: '2024-03-12', advancePayment: 20000, status: 'draft', createdAt: '2024-02-25' },
 ];
 
 const TravelOrders = () => {
   const { data: orders, setData: setOrders } = useFetchData(() => employeesApi.getAll(), initialOrders);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingOrder, setEditingOrder] = useState<TravelOrder | null>(null);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     employeeName: '',
     destination: '',
     purpose: '',
     departureDate: '',
     returnDate: '',
     advancePayment: 0,
   });
 
   const filteredOrders = orders.filter(order =>
     order.employeeName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getStatusBadge = (status: TravelOrder['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       draft: { label: 'Nacrt', variant: 'outline' },
       approved: { label: 'Odobren', variant: 'default' },
       settled: { label: 'Obračunat', variant: 'secondary' },
       rejected: { label: 'Odbijen', variant: 'destructive' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const handleSubmit = () => {
     if (editingOrder) {
       setOrders(orders.map(o => o.id === editingOrder.id ? { ...o, ...formData } : o));
       toast({ title: 'Nalog ažuriran', description: 'Putni nalog je uspešno izmenjen.' });
     } else {
       const newOrder: TravelOrder = {
         ...formData,
         id: Date.now().toString(),
         orderNumber: `PN-2024-${String(orders.length + 1).padStart(3, '0')}`,
         status: 'draft',
         createdAt: new Date().toISOString().split('T')[0],
       };
       setOrders([...orders, newOrder]);
       toast({ title: 'Nalog kreiran', description: 'Novi putni nalog je dodat.' });
     }
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ employeeName: '', destination: '', purpose: '', departureDate: '', returnDate: '', advancePayment: 0 });
     setEditingOrder(null);
   };
 
   const openEdit = (order: TravelOrder) => {
     setEditingOrder(order);
     setFormData({ ...order });
     setDialogOpen(true);
   };
 
   const handleApprove = (id: string) => {
     setOrders(orders.map(o => o.id === id ? { ...o, status: 'approved' } : o));
     toast({ title: 'Nalog odobren', description: 'Putni nalog je odobren.' });
   };
 
   const handleDelete = (id: string) => {
     setOrders(orders.filter(o => o.id !== id));
     toast({ title: 'Nalog obrisan', description: 'Putni nalog je uklonjen.' });
   };
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Putni nalozi</h1>
           <p className="text-muted-foreground">Kreiranje i upravljanje putnim nalozima</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Novi nalog
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno naloga</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{orders.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Nacrti</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{orders.filter(o => o.status === 'draft').length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Odobreni</CardTitle>
             <CheckCircle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{orders.filter(o => o.status === 'approved').length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupan avans</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{orders.reduce((sum, o) => sum + o.advancePayment, 0).toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista putnih naloga</CardTitle>
               <CardDescription>Pregled svih putnih naloga</CardDescription>
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
                 <TableHead>Broj naloga</TableHead>
                 <TableHead>Zaposleni</TableHead>
                 <TableHead>Destinacija</TableHead>
                 <TableHead>Svrha</TableHead>
                 <TableHead>Period</TableHead>
                 <TableHead>Avans</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Akcije</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredOrders.map(order => (
                 <TableRow key={order.id}>
                   <TableCell className="font-medium">{order.orderNumber}</TableCell>
                   <TableCell>{order.employeeName}</TableCell>
                   <TableCell>{order.destination}</TableCell>
                   <TableCell>{order.purpose}</TableCell>
                   <TableCell>{order.departureDate} - {order.returnDate}</TableCell>
                   <TableCell>{order.advancePayment.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{getStatusBadge(order.status)}</TableCell>
                   <TableCell className="text-right">
                     {order.status === 'draft' && (
                       <Button variant="ghost" size="icon" onClick={() => handleApprove(order.id)}><CheckCircle className="h-4 w-4 text-green-600" /></Button>
                     )}
                     <Button variant="ghost" size="icon" onClick={() => openEdit(order)}><Edit className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" onClick={() => toast({ title: 'Štampa', description: 'Štampanje putnog naloga...' })}><Printer className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(order.id)}><Trash2 className="h-4 w-4" /></Button>
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
             <DialogTitle>{editingOrder ? 'Izmeni nalog' : 'Novi putni nalog'}</DialogTitle>
             <DialogDescription>Unesite podatke za putni nalog</DialogDescription>
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
                 <Input type="date" value={formData.departureDate} onChange={e => setFormData({ ...formData, departureDate: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Datum povratka</Label>
                 <Input type="date" value={formData.returnDate} onChange={e => setFormData({ ...formData, returnDate: e.target.value })} />
               </div>
             </div>
             <div className="grid gap-2">
               <Label>Avans (RSD)</Label>
               <Input type="number" value={formData.advancePayment} onChange={e => setFormData({ ...formData, advancePayment: Number(e.target.value) })} />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>{editingOrder ? 'Sačuvaj' : 'Kreiraj'}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default TravelOrders;