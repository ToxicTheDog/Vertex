 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Badge } from '@/components/ui/badge';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { PackageSearch, AlertTriangle, TrendingUp, TrendingDown, Search, BarChart3 } from 'lucide-react';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line } from 'recharts';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface InventoryItem {
   id: string;
   sku: string;
   name: string;
   category: string;
   currentStock: number;
   minStock: number;
   maxStock: number;
   avgDailySales: number;
   daysUntilStockout: number;
   lastRestocked: string;
   status: 'ok' | 'low' | 'critical' | 'overstock';
 }
 
 const inventoryData: InventoryItem[] = [
   { id: '1', sku: 'SKU001', name: 'Laptop Dell XPS 15', category: 'Elektronika', currentStock: 45, minStock: 10, maxStock: 100, avgDailySales: 2, daysUntilStockout: 22, lastRestocked: '2024-02-01', status: 'ok' },
   { id: '2', sku: 'SKU002', name: 'Monitor Samsung 27"', category: 'Elektronika', currentStock: 8, minStock: 15, maxStock: 50, avgDailySales: 3, daysUntilStockout: 3, lastRestocked: '2024-01-20', status: 'critical' },
   { id: '3', sku: 'SKU003', name: 'Tastatura Logitech MX', category: 'Periferija', currentStock: 12, minStock: 10, maxStock: 40, avgDailySales: 1, daysUntilStockout: 12, lastRestocked: '2024-02-05', status: 'low' },
   { id: '4', sku: 'SKU004', name: 'Miš Razer DeathAdder', category: 'Periferija', currentStock: 85, minStock: 20, maxStock: 60, avgDailySales: 2, daysUntilStockout: 42, lastRestocked: '2024-02-10', status: 'overstock' },
   { id: '5', sku: 'SKU005', name: 'USB Hub 7-port', category: 'Dodaci', currentStock: 30, minStock: 15, maxStock: 50, avgDailySales: 1.5, daysUntilStockout: 20, lastRestocked: '2024-02-08', status: 'ok' },
 ];
 
 const trendData = [
   { name: 'Jan', ulaz: 120, izlaz: 100 },
   { name: 'Feb', ulaz: 150, izlaz: 130 },
   { name: 'Mar', ulaz: 100, izlaz: 140 },
   { name: 'Apr', ulaz: 180, izlaz: 160 },
   { name: 'Maj', ulaz: 140, izlaz: 120 },
   { name: 'Jun', ulaz: 160, izlaz: 150 },
 ];
 
 const InventoryTracking = () => {
   const [searchTerm, setSearchTerm] = useState('');
   const [categoryFilter, setCategoryFilter] = useState('all');
   const { data: items } = useFetchData(() => articlesApi.getAll(), inventoryData);
 
   const filteredItems = items.filter(item => {
     const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) || item.sku.toLowerCase().includes(searchTerm.toLowerCase());
     const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
     return matchesSearch && matchesCategory;
   });
 
   const getStatusBadge = (status: InventoryItem['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       ok: { label: 'U redu', variant: 'default' },
       low: { label: 'Nisko', variant: 'outline' },
       critical: { label: 'Kritično', variant: 'destructive' },
       overstock: { label: 'Višak', variant: 'secondary' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const criticalCount = items.filter(i => i.status === 'critical').length;
   const lowCount = items.filter(i => i.status === 'low').length;
   const totalValue = items.reduce((sum, i) => sum + i.currentStock, 0);
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Praćenje zaliha</h1>
           <p className="text-muted-foreground">Analitika i praćenje stanja zaliha u realnom vremenu</p>
         </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno artikala</CardTitle>
             <PackageSearch className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{items.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Kritično stanje</CardTitle>
             <AlertTriangle className="h-4 w-4 text-red-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">{criticalCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Nisko stanje</CardTitle>
             <TrendingDown className="h-4 w-4 text-orange-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-orange-600">{lowCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupna količina</CardTitle>
             <BarChart3 className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalValue}</div></CardContent>
         </Card>
       </div>
 
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Trend ulaza/izlaza</CardTitle>
             <CardDescription>Mesečni pregled kretanja robe</CardDescription>
           </CardHeader>
           <CardContent>
             <ResponsiveContainer width="100%" height={250}>
               <LineChart data={trendData}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip />
                 <Legend />
                 <Line type="monotone" dataKey="ulaz" stroke="hsl(var(--primary))" name="Ulaz" />
                 <Line type="monotone" dataKey="izlaz" stroke="hsl(var(--destructive))" name="Izlaz" />
               </LineChart>
             </ResponsiveContainer>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle>Stanje po kategorijama</CardTitle>
             <CardDescription>Distribucija zaliha</CardDescription>
           </CardHeader>
           <CardContent>
             <ResponsiveContainer width="100%" height={250}>
               <BarChart data={[
                 { category: 'Elektronika', kolicina: items.filter(i => i.category === 'Elektronika').reduce((s, i) => s + i.currentStock, 0) },
                 { category: 'Periferija', kolicina: items.filter(i => i.category === 'Periferija').reduce((s, i) => s + i.currentStock, 0) },
                 { category: 'Dodaci', kolicina: items.filter(i => i.category === 'Dodaci').reduce((s, i) => s + i.currentStock, 0) },
               ]}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="category" />
                 <YAxis />
                 <Tooltip />
                 <Bar dataKey="kolicina" fill="hsl(var(--primary))" name="Količina" />
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Detaljna evidencija zaliha</CardTitle>
               <CardDescription>Pregled svih artikala sa analizom</CardDescription>
             </div>
             <div className="flex items-center gap-4">
               <Select value={categoryFilter} onValueChange={setCategoryFilter}>
                 <SelectTrigger className="w-40"><SelectValue placeholder="Kategorija" /></SelectTrigger>
                 <SelectContent>
                   <SelectItem value="all">Sve kategorije</SelectItem>
                   <SelectItem value="Elektronika">Elektronika</SelectItem>
                   <SelectItem value="Periferija">Periferija</SelectItem>
                   <SelectItem value="Dodaci">Dodaci</SelectItem>
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
                 <TableHead>SKU</TableHead>
                 <TableHead>Naziv</TableHead>
                 <TableHead>Kategorija</TableHead>
                 <TableHead>Stanje</TableHead>
                 <TableHead>Min/Max</TableHead>
                 <TableHead>Dnevna prodaja</TableHead>
                 <TableHead>Dana do nestašice</TableHead>
                 <TableHead>Status</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {filteredItems.map(item => (
                 <TableRow key={item.id}>
                   <TableCell className="font-mono">{item.sku}</TableCell>
                   <TableCell className="font-medium">{item.name}</TableCell>
                   <TableCell>{item.category}</TableCell>
                   <TableCell className="font-bold">{item.currentStock}</TableCell>
                   <TableCell>{item.minStock} / {item.maxStock}</TableCell>
                   <TableCell>{item.avgDailySales}</TableCell>
                   <TableCell className={item.daysUntilStockout < 7 ? 'text-red-600 font-bold' : ''}>{item.daysUntilStockout} dana</TableCell>
                   <TableCell>{getStatusBadge(item.status)}</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default InventoryTracking;