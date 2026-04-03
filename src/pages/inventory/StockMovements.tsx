 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, Search, ArrowUpDown, ArrowUp, ArrowDown, Package } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';
 
 interface StockMovement {
   id: string;
   date: string;
   type: 'in' | 'out' | 'transfer';
   documentNumber: string;
   productName: string;
   productSku: string;
   quantity: number;
   fromWarehouse?: string;
   toWarehouse?: string;
   reason: string;
   createdBy: string;
 }
 
 const initialMovements: StockMovement[] = [
   { id: '1', date: '2024-02-15', type: 'in', documentNumber: 'PRI-2024-001', productName: 'Laptop Dell XPS 15', productSku: 'SKU001', quantity: 20, toWarehouse: 'Magacin A', reason: 'Nabavka od dobavljača', createdBy: 'Marko M.' },
   { id: '2', date: '2024-02-14', type: 'out', documentNumber: 'OTP-2024-015', productName: 'Monitor Samsung 27"', productSku: 'SKU002', quantity: 5, fromWarehouse: 'Magacin A', reason: 'Prodaja kupcu', createdBy: 'Ana P.' },
   { id: '3', date: '2024-02-14', type: 'transfer', documentNumber: 'TRN-2024-003', productName: 'Tastatura Logitech MX', productSku: 'SKU003', quantity: 10, fromWarehouse: 'Magacin A', toWarehouse: 'Magacin B', reason: 'Interno premeštanje', createdBy: 'Jovan J.' },
   { id: '4', date: '2024-02-13', type: 'in', documentNumber: 'PRI-2024-002', productName: 'Miš Razer DeathAdder', productSku: 'SKU004', quantity: 50, toWarehouse: 'Magacin B', reason: 'Nabavka od dobavljača', createdBy: 'Marko M.' },
   { id: '5', date: '2024-02-12', type: 'out', documentNumber: 'OTP-2024-014', productName: 'USB Hub 7-port', productSku: 'SKU005', quantity: 8, fromWarehouse: 'Magacin A', reason: 'Otpis - oštećena roba', createdBy: 'Ana P.' },
 ];
 
 const StockMovements = () => {
   const [movements, setMovements] = useState<StockMovement[]>(initialMovements);
   const [searchTerm, setSearchTerm] = useState('');
   const [typeFilter, setTypeFilter] = useState('all');
   const [dialogOpen, setDialogOpen] = useState(false);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     type: 'in' as StockMovement['type'],
     productName: '',
     productSku: '',
     quantity: 0,
     fromWarehouse: '',
     toWarehouse: '',
     reason: '',
   });
 
   const filteredMovements = movements.filter(m => {
     const matchesSearch = m.productName.toLowerCase().includes(searchTerm.toLowerCase()) || m.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesType = typeFilter === 'all' || m.type === typeFilter;
     return matchesSearch && matchesType;
   });
 
   const getTypeBadge = (type: StockMovement['type']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive'; icon: React.ReactNode }> = {
       in: { label: 'Ulaz', variant: 'default', icon: <ArrowDown className="h-3 w-3 mr-1" /> },
       out: { label: 'Izlaz', variant: 'destructive', icon: <ArrowUp className="h-3 w-3 mr-1" /> },
       transfer: { label: 'Transfer', variant: 'secondary', icon: <ArrowUpDown className="h-3 w-3 mr-1" /> },
     };
     return <Badge variant={variants[type].variant} className="flex items-center w-fit">{variants[type].icon}{variants[type].label}</Badge>;
   };
 
   const handleSubmit = () => {
     const newMovement: StockMovement = {
       ...formData,
       id: Date.now().toString(),
       date: new Date().toISOString().split('T')[0],
       documentNumber: `${formData.type === 'in' ? 'PRI' : formData.type === 'out' ? 'OTP' : 'TRN'}-2024-${String(movements.length + 1).padStart(3, '0')}`,
       createdBy: 'Korisnik',
     };
     setMovements([newMovement, ...movements]);
     toast({ title: 'Kretanje evidentirano', description: 'Novo kretanje robe je uspešno zabeleženo.' });
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ type: 'in', productName: '', productSku: '', quantity: 0, fromWarehouse: '', toWarehouse: '', reason: '' });
   };
 
   const totalIn = movements.filter(m => m.type === 'in').reduce((sum, m) => sum + m.quantity, 0);
   const totalOut = movements.filter(m => m.type === 'out').reduce((sum, m) => sum + m.quantity, 0);
   const totalTransfer = movements.filter(m => m.type === 'transfer').reduce((sum, m) => sum + m.quantity, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Ulaz / Izlaz robe</h1>
           <p className="text-muted-foreground">Evidencija kretanja robe kroz magacine</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Novo kretanje
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno kretanja</CardTitle>
             <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{movements.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ulaz (kom)</CardTitle>
             <ArrowDown className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{totalIn}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Izlaz (kom)</CardTitle>
             <ArrowUp className="h-4 w-4 text-red-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">{totalOut}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Transfer (kom)</CardTitle>
             <Package className="h-4 w-4 text-blue-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-blue-600">{totalTransfer}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Evidencija kretanja</CardTitle>
               <CardDescription>Pregled svih ulaza, izlaza i transfera</CardDescription>
             </div>
             <div className="flex items-center gap-4">
               <Select value={typeFilter} onValueChange={setTypeFilter}>
                 <SelectTrigger className="w-32"><SelectValue placeholder="Tip" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Svi</SelectItem>
                   <SelectItem value="in">Ulaz</SelectItem>
                   <SelectItem value="out">Izlaz</SelectItem>
                   <SelectItem value="transfer">Transfer</SelectItem>
                 </SelectContent>
               </Select>
               <div className="relative w-64">
                 <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
                 <Input placeholder="Pretraži..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
               </div>
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Datum</TableHead>
                 <TableHead>Dokument</TableHead>
                 <TableHead>Tip</TableHead>
                 <TableHead>Proizvod</TableHead>
                 <TableHead>SKU</TableHead>
                 <TableHead>Količina</TableHead>
                 <TableHead>Iz magacina</TableHead>
                 <TableHead>U magacin</TableHead>
                 <TableHead>Razlog</TableHead>
                 <TableHead>Kreirao</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredMovements.map(movement => (
                 <TableRow key={movement.id}>
                   <TableCell>{movement.date}</TableCell>
                   <TableCell className="font-mono">{movement.documentNumber}</TableCell>
                   <TableCell>{getTypeBadge(movement.type)}</TableCell>
                   <TableCell className="font-medium">{movement.productName}</TableCell>
                   <TableCell className="font-mono">{movement.productSku}</TableCell>
                   <TableCell className="font-bold">{movement.quantity}</TableCell>
                   <TableCell>{movement.fromWarehouse || '-'}</TableCell>
                   <TableCell>{movement.toWarehouse || '-'}</TableCell>
                   <TableCell className="max-w-[150px] truncate">{movement.reason}</TableCell>
                   <TableCell>{movement.createdBy}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
 
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Novo kretanje robe</DialogTitle>
             <DialogDescription>Evidentirajte ulaz, izlaz ili transfer robe</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Tip kretanja</Label>
               <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as StockMovement['type'] })}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="in">Ulaz</SelectItem>
                   <SelectItem value="out">Izlaz</SelectItem>
                   <SelectItem value="transfer">Transfer</SelectItem>
                 </SelectContent>
               </Select>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Naziv proizvoda</Label>
                 <Input value={formData.productName} onChange={e => setFormData({ ...formData, productName: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>SKU</Label>
                 <Input value={formData.productSku} onChange={e => setFormData({ ...formData, productSku: e.target.value })} />
               </div>
             </div>
             <div className="grid gap-2">
               <Label>Količina</Label>
               <Input type="number" value={formData.quantity} onChange={e => setFormData({ ...formData, quantity: Number(e.target.value) })} />
             </div>
             {(formData.type === 'out' || formData.type === 'transfer') && (
               <div className="grid gap-2">
                 <Label>Iz magacina</Label>
                 <Select value={formData.fromWarehouse} onValueChange={v => setFormData({ ...formData, fromWarehouse: v })}>
                   <SelectTrigger><SelectValue placeholder="Izaberite magacin" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Magacin A">Magacin A</SelectItem>
                     <SelectItem value="Magacin B">Magacin B</SelectItem>
                     <SelectItem value="Magacin C">Magacin C</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}
             {(formData.type === 'in' || formData.type === 'transfer') && (
               <div className="grid gap-2">
                 <Label>U magacin</Label>
                 <Select value={formData.toWarehouse} onValueChange={v => setFormData({ ...formData, toWarehouse: v })}>
                   <SelectTrigger><SelectValue placeholder="Izaberite magacin" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="Magacin A">Magacin A</SelectItem>
                     <SelectItem value="Magacin B">Magacin B</SelectItem>
                     <SelectItem value="Magacin C">Magacin C</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             )}
             <div className="grid gap-2">
               <Label>Razlog</Label>
               <Input value={formData.reason} onChange={e => setFormData({ ...formData, reason: e.target.value })} placeholder="npr. Nabavka od dobavljača, Prodaja..." />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>Evidentiraj</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default StockMovements;