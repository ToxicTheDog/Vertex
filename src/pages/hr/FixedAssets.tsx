 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Plus, Search, Building, Edit, Trash2, DollarSign, TrendingDown } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { fixedAssetsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface FixedAsset {
   id: string;
   name: string;
   category: string;
   purchaseDate: string;
   purchaseValue: number;
   currentValue: number;
   depreciationRate: number;
   location: string;
   status: 'active' | 'disposed' | 'written_off';
 }
 
 const initialAssets: FixedAsset[] = [
   { id: '1', name: 'Računar Dell OptiPlex', category: 'IT oprema', purchaseDate: '2023-01-15', purchaseValue: 150000, currentValue: 120000, depreciationRate: 20, location: 'Kancelarija 1', status: 'active' },
   { id: '2', name: 'Službeno vozilo VW Golf', category: 'Vozila', purchaseDate: '2022-06-01', purchaseValue: 2500000, currentValue: 2000000, depreciationRate: 15, location: 'Garaža', status: 'active' },
   { id: '3', name: 'Kancelarijski nameštaj', category: 'Nameštaj', purchaseDate: '2021-03-20', purchaseValue: 300000, currentValue: 200000, depreciationRate: 10, location: 'Kancelarija 2', status: 'active' },
   { id: '4', name: 'Stari server', category: 'IT oprema', purchaseDate: '2019-01-01', purchaseValue: 500000, currentValue: 0, depreciationRate: 25, location: 'Server soba', status: 'written_off' },
 ];
 
 const FixedAssets = () => {
   const { data: assets, setData: setAssets } = useFetchData(() => fixedAssetsApi.getAll(), initialAssets);
   const [searchTerm, setSearchTerm] = useState('');
   const [dialogOpen, setDialogOpen] = useState(false);
   const [editingAsset, setEditingAsset] = useState<FixedAsset | null>(null);
   const { toast } = useToast();
 
   const [formData, setFormData] = useState({
     name: '',
     category: '',
     purchaseDate: '',
     purchaseValue: 0,
     currentValue: 0,
     depreciationRate: 20,
     location: '',
     status: 'active' as FixedAsset['status'],
   });
 
   const filteredAssets = assets.filter(asset =>
     asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
     asset.category.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getStatusBadge = (status: FixedAsset['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' }> = {
       active: { label: 'Aktivno', variant: 'default' },
       disposed: { label: 'Prodato', variant: 'secondary' },
       written_off: { label: 'Otpisano', variant: 'destructive' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const handleSubmit = () => {
     if (editingAsset) {
       setAssets(assets.map(a => a.id === editingAsset.id ? { ...a, ...formData } : a));
       toast({ title: 'Sredstvo ažurirano', description: 'Osnovno sredstvo je uspešno izmenjeno.' });
     } else {
       const newAsset: FixedAsset = { ...formData, id: Date.now().toString() };
       setAssets([...assets, newAsset]);
       toast({ title: 'Sredstvo dodato', description: 'Novo osnovno sredstvo je evidentirano.' });
     }
     setDialogOpen(false);
     resetForm();
   };
 
   const resetForm = () => {
     setFormData({ name: '', category: '', purchaseDate: '', purchaseValue: 0, currentValue: 0, depreciationRate: 20, location: '', status: 'active' });
     setEditingAsset(null);
   };
 
   const openEdit = (asset: FixedAsset) => {
     setEditingAsset(asset);
     setFormData({ ...asset });
     setDialogOpen(true);
   };
 
   const handleDelete = (id: string) => {
     setAssets(assets.filter(a => a.id !== id));
     toast({ title: 'Sredstvo obrisano', description: 'Osnovno sredstvo je uklonjeno iz evidencije.' });
   };
 
   const totalPurchaseValue = assets.reduce((sum, a) => sum + a.purchaseValue, 0);
   const totalCurrentValue = assets.filter(a => a.status === 'active').reduce((sum, a) => sum + a.currentValue, 0);
   const totalDepreciation = totalPurchaseValue - totalCurrentValue;
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Osnovna sredstva</h1>
           <p className="text-muted-foreground">Evidencija i amortizacija osnovnih sredstava</p>
         </div>
         <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
           <Plus className="mr-2 h-4 w-4" /> Novo sredstvo
         </Button>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno sredstava</CardTitle>
             <Building className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{assets.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Nabavna vrednost</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalPurchaseValue.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Sadašnja vrednost</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{totalCurrentValue.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupna amortizacija</CardTitle>
             <TrendingDown className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">{totalDepreciation.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista osnovnih sredstava</CardTitle>
               <CardDescription>Pregled svih evidentiranih sredstava</CardDescription>
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
                 <TableHead>Kategorija</TableHead>
                 <TableHead>Datum nabavke</TableHead>
                 <TableHead>Nabavna vrednost</TableHead>
                 <TableHead>Sadašnja vrednost</TableHead>
                 <TableHead>Stopa amortizacije</TableHead>
                 <TableHead>Lokacija</TableHead>
                 <TableHead>Status</TableHead>
                 <TableHead className="text-right">Akcije</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredAssets.map(asset => (
                 <TableRow key={asset.id}>
                   <TableCell className="font-medium">{asset.name}</TableCell>
                   <TableCell>{asset.category}</TableCell>
                   <TableCell>{asset.purchaseDate}</TableCell>
                   <TableCell>{asset.purchaseValue.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{asset.currentValue.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{asset.depreciationRate}%</TableCell>
                   <TableCell>{asset.location}</TableCell>
                   <TableCell>{getStatusBadge(asset.status)}</TableCell>
                   <TableCell className="text-right">
                     <Button variant="ghost" size="icon" onClick={() => openEdit(asset)}><Edit className="h-4 w-4" /></Button>
                     <Button variant="ghost" size="icon" onClick={() => handleDelete(asset.id)}><Trash2 className="h-4 w-4" /></Button>
                   </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
 
       <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
         <DialogContent className="max-w-2xl">
           <DialogHeader>
             <DialogTitle>{editingAsset ? 'Izmeni sredstvo' : 'Novo osnovno sredstvo'}</DialogTitle>
             <DialogDescription>Unesite podatke o osnovnom sredstvu</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Naziv sredstva</Label>
                 <Input value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Kategorija</Label>
                 <Select value={formData.category} onValueChange={v => setFormData({ ...formData, category: v })}>
                   <SelectTrigger><SelectValue placeholder="Izaberite kategoriju" /></SelectTrigger>
                   <SelectContent>
                     <SelectItem value="IT oprema">IT oprema</SelectItem>
                     <SelectItem value="Vozila">Vozila</SelectItem>
                     <SelectItem value="Nameštaj">Nameštaj</SelectItem>
                     <SelectItem value="Mašine">Mašine</SelectItem>
                     <SelectItem value="Nekretnine">Nekretnine</SelectItem>
                   </SelectContent>
                 </Select>
               </div>
             </div>
             <div className="grid grid-cols-2 gap-4">
               <div className="grid gap-2">
                 <Label>Datum nabavke</Label>
                 <Input type="date" value={formData.purchaseDate} onChange={e => setFormData({ ...formData, purchaseDate: e.target.value })} />
               </div>
               <div className="grid gap-2">
                 <Label>Lokacija</Label>
                 <Input value={formData.location} onChange={e => setFormData({ ...formData, location: e.target.value })} />
               </div>
             </div>
             <div className="grid grid-cols-3 gap-4">
               <div className="grid gap-2">
                 <Label>Nabavna vrednost (RSD)</Label>
                 <Input type="number" value={formData.purchaseValue} onChange={e => setFormData({ ...formData, purchaseValue: Number(e.target.value) })} />
               </div>
               <div className="grid gap-2">
                 <Label>Sadašnja vrednost (RSD)</Label>
                 <Input type="number" value={formData.currentValue} onChange={e => setFormData({ ...formData, currentValue: Number(e.target.value) })} />
               </div>
               <div className="grid gap-2">
                 <Label>Stopa amortizacije (%)</Label>
                 <Input type="number" value={formData.depreciationRate} onChange={e => setFormData({ ...formData, depreciationRate: Number(e.target.value) })} />
               </div>
             </div>
             <div className="grid gap-2">
               <Label>Status</Label>
               <Select value={formData.status} onValueChange={v => setFormData({ ...formData, status: v as FixedAsset['status'] })}>
                 <SelectTrigger><SelectValue /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="active">Aktivno</SelectItem>
                   <SelectItem value="disposed">Prodato</SelectItem>
                   <SelectItem value="written_off">Otpisano</SelectItem>
                 </SelectContent>
               </Select>
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleSubmit}>{editingAsset ? 'Sačuvaj' : 'Kreiraj'}</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default FixedAssets;