 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, Search, Megaphone, Edit, Trash2, Percent, Calendar, Tag } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { promotionsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface Promotion {
   id: string;
   name: string;
   type: 'percentage' | 'fixed' | 'bogo' | 'free_shipping';
   discount: number;
   code: string;
   startDate: string;
   endDate: string;
   usageCount: number;
   maxUsage: number;
   status: 'active' | 'scheduled' | 'expired' | 'paused';
 }
 
 const initialPromotions: Promotion[] = [
   { id: '1', name: 'Zimska rasprodaja', type: 'percentage', discount: 20, code: 'ZIMA20', startDate: '2024-01-01', endDate: '2024-02-28', usageCount: 150, maxUsage: 500, status: 'active' },
   { id: '2', name: 'Besplatna dostava', type: 'free_shipping', discount: 0, code: 'FREEDEL', startDate: '2024-02-01', endDate: '2024-03-31', usageCount: 80, maxUsage: 200, status: 'active' },
   { id: '3', name: 'Prolećna akcija', type: 'percentage', discount: 15, code: 'PROLECE15', startDate: '2024-03-01', endDate: '2024-04-30', usageCount: 0, maxUsage: 300, status: 'scheduled' },
   { id: '4', name: 'Fiksni popust', type: 'fixed', discount: 1000, code: 'FIX1000', startDate: '2023-11-01', endDate: '2023-12-31', usageCount: 200, maxUsage: 200, status: 'expired' },
 ];
 
 const Promotions = () => {
   const { data: promotions, setData: setPromotions } = useFetchData(() => promotionsApi.getAll(), initialPromotions);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingPromo, setEditingPromo] = useState<Promotion | null>(null);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     name: '',
     type: 'percentage' as Promotion['type'],
     discount: 0,
     code: '',
     startDate: '',
     endDate: '',
     maxUsage: 100,
     status: 'scheduled' as Promotion['status'],
   });
 
   const filteredPromotions = promotions.filter(promo =>
     promo.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     promo.code.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getStatusBadge = (status: Promotion['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       active: { label: 'Aktivna', variant: 'default' },
       scheduled: { label: 'Zakazana', variant: 'outline' },
       expired: { label: 'Istekla', variant: 'secondary' },
       paused: { label: 'Pauzirana', variant: 'destructive' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const getTypeLabel = (type: Promotion['type']) => {
     const labels: Record<string, string> = {
       percentage: 'Procenat',
       fixed: 'Fiksni iznos',
       bogo: 'Kupi 1 + 1 gratis',
       free_shipping: 'Besplatna dostava',
     };
     return labels[type];
   };
 
   const handleSubmit = () => {
     if (editingPromo) {
       setPromotions(promotions.map(p => p.id === editingPromo.id ? { ...p, ...formData, usageCount: p.usageCount } : p));
       toast({ title: 'Promocija ažurirana', description: 'Promocija je uspešno izmenjena.' });
     } else {
       const newPromo: Promotion = { ...formData, id: Date.now().toString(), usageCount: 0 };
       setPromotions([...promotions, newPromo]);
       toast({ title: 'Promocija kreirana', description: 'Nova promocija je uspešno dodata.' });
     }
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ name: '', type: 'percentage', discount: 0, code: '', startDate: '', endDate: '', maxUsage: 100, status: 'scheduled' });
     setEditingPromo(null);
   };
 
   const openEdit = (promo: Promotion) => {
     setEditingPromo(promo);
     setFormData({ ...promo });
     setDialogOpen(true);
   };
 
   const handleDelete = (id: string) => {
     setPromotions(promotions.filter(p => p.id !== id));
     toast({ title: 'Promocija obrisana', description: 'Promocija je uklonjena.' });
   };
 
   const activeCount = promotions.filter(p => p.status === 'active').length;
   const totalUsage = promotions.reduce((sum, p) => sum + p.usageCount, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Promocije i popusti</h1>
           <p className="text-muted-foreground">Upravljanje promocijama, kuponima i popustima</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Nova promocija
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno promocija</CardTitle>
             <Megaphone className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{promotions.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Aktivne</CardTitle>
             <Tag className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{activeCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno korišćenja</CardTitle>
             <Percent className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalUsage}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Zakazane</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{promotions.filter(p => p.status === 'scheduled').length}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista promocija</CardTitle>
               <CardDescription>Pregled svih promocija i kupona</CardDescription>
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
                 <TableHead>Naziv</TableHead>
                 <TableHead>Tip</TableHead>
                 <TableHead>Popust</TableHead>
                 <TableHead>Kod</TableHead>
                 <TableHead>Period</TableHead>
                 <TableHead>Korišćeno</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Akcije</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredPromotions.map(promo => (
                 <TableRow key={promo.id}>
                   <TableCell className="font-medium">{promo.name}</TableCell>
                   <TableCell>{getTypeLabel(promo.type)}</TableCell>
                   <TableCell>{promo.type === 'percentage' ? `${promo.discount}%` : promo.type === 'fixed' ? `${promo.discount.toLocaleString('sr-RS')} RSD` : '-'}</TableCell>
                   <TableCell><code className="bg-muted px-2 py-1 rounded">{promo.code}</code></TableCell>
                   <TableCell>{promo.startDate} - {promo.endDate}</TableCell>
                   <TableCell>{promo.usageCount} / {promo.maxUsage}</TableCell>
                   <TableCell>{getStatusBadge(promo.status)}</TableCell>
                   <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => openEdit(promo)}><Edit className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(promo.id)}><Trash2 className="h-4 w-4" /></Button>
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
             <DialogTitle>{editingPromo ? 'Izmeni promociju' : 'Nova promocija'}</DialogTitle>
             <DialogDescription>Unesite podatke o promociji</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Naziv promocije</Label>
               <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Tip</Label>
                 <Select value={formData.type} onValueChange={v => setFormData({ ...formData, type: v as Promotion['type'] })}>
                   <SelectTrigger><SelectValue /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="percentage">Procenat</SelectItem>
                     <SelectItem value="fixed">Fiksni iznos</SelectItem>
                     <SelectItem value="bogo">Kupi 1 + 1 gratis</SelectItem>
                     <SelectItem value="free_shipping">Besplatna dostava</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
               <div className="grid gap-2">
                 <Label>Popust</Label>
                 <Input type="number" value={formData.discount} onChange={e => setFormData({ ...formData, discount: Number(e.target.value) })} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Kod kupona</Label>
                 <Input value={formData.code} onChange={e => setFormData({ ...formData, code: e.target.value.toUpperCase() })} />
               </div>
               <div className="grid gap-2">
                 <Label>Max korišćenja</Label>
                 <Input type="number" value={formData.maxUsage} onChange={e => setFormData({ ...formData, maxUsage: Number(e.target.value) })} />
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Početak</Label>
                 <Input type="date" value={formData.startDate} onChange={e => setFormData({ ...formData, startDate: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Kraj</Label>
                 <Input type="date" value={formData.endDate} onChange={e => setFormData({ ...formData, endDate: e.target.value })} />
               </div>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>{editingPromo ? 'Sačuvaj' : 'Kreiraj'}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default Promotions;