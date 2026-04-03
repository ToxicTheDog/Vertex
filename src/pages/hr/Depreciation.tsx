 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { TrendingDown, Calculator, DollarSign, Calendar, Play } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
 import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface DepreciationRecord {
   id: string;
   assetName: string;
   category: string;
   purchaseValue: number;
   accumulatedDepreciation: number;
   currentValue: number;
   yearlyDepreciation: number;
   depreciationRate: number;
 }
 
 const depreciationData: DepreciationRecord[] = [
   { id: '1', assetName: 'Računar Dell OptiPlex', category: 'IT oprema', purchaseValue: 150000, accumulatedDepreciation: 30000, currentValue: 120000, yearlyDepreciation: 30000, depreciationRate: 20 },
   { id: '2', assetName: 'Službeno vozilo VW Golf', category: 'Vozila', purchaseValue: 2500000, accumulatedDepreciation: 500000, currentValue: 2000000, yearlyDepreciation: 375000, depreciationRate: 15 },
   { id: '3', assetName: 'Kancelarijski nameštaj', category: 'Nameštaj', purchaseValue: 300000, accumulatedDepreciation: 100000, currentValue: 200000, yearlyDepreciation: 30000, depreciationRate: 10 },
   { id: '4', assetName: 'Klima uređaj', category: 'Oprema', purchaseValue: 80000, accumulatedDepreciation: 24000, currentValue: 56000, yearlyDepreciation: 16000, depreciationRate: 20 },
   { id: '5', assetName: 'Štampač HP LaserJet', category: 'IT oprema', purchaseValue: 45000, accumulatedDepreciation: 18000, currentValue: 27000, yearlyDepreciation: 9000, depreciationRate: 20 },
 ];
 
 const chartData = [
   { name: 'Jan', amortizacija: 45000 },
   { name: 'Feb', amortizacija: 45000 },
   { name: 'Mar', amortizacija: 45000 },
   { name: 'Apr', amortizacija: 45000 },
   { name: 'Maj', amortizacija: 45000 },
   { name: 'Jun', amortizacija: 45000 },
   { name: 'Jul', amortizacija: 45000 },
   { name: 'Avg', amortizacija: 45000 },
   { name: 'Sep', amortizacija: 45000 },
   { name: 'Okt', amortizacija: 45000 },
   { name: 'Nov', amortizacija: 45000 },
   { name: 'Dec', amortizacija: 45000 },
 ];
 
 const Depreciation = () => {
   const [year, setYear] = useState('2024');
   const { data: records } = useFetchData(() => articlesApi.getAll(), depreciationData);
   const { toast } = useToast();
 
   const totalPurchaseValue = records.reduce((sum, r) => sum + r.purchaseValue, 0);
   const totalAccumulated = records.reduce((sum, r) => sum + r.accumulatedDepreciation, 0);
   const totalCurrent = records.reduce((sum, r) => sum + r.currentValue, 0);
   const totalYearly = records.reduce((sum, r) => sum + r.yearlyDepreciation, 0);
 
   const runDepreciation = () => {
     toast({ title: 'Obračun pokrenut', description: `Amortizacija za ${year}. godinu je uspešno obračunata.` });
   };
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Amortizacija</h1>
           <p className="text-muted-foreground">Obračun amortizacije osnovnih sredstava</p>
         </div>
         <div className="flex items-center gap-4">
           <Select value={year} onValueChange={setYear}>
             <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
             <SelectContent>
               <SelectItem value="2024">2024</SelectItem>
               <SelectItem value="2023">2023</SelectItem>
               <SelectItem value="2022">2022</SelectItem>
             </SelectContent>
           </Select>
           <Button onClick={runDepreciation}>
             <Play className="mr-2 h-4 w-4" /> Pokreni obračun
           </Button>
         </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Nabavna vrednost</CardTitle>
             <DollarSign className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{totalPurchaseValue.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Akumulirana amortizacija</CardTitle>
             <TrendingDown className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-orange-600">{totalAccumulated.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Sadašnja vrednost</CardTitle>
             <Calculator className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{totalCurrent.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Godišnja amortizacija</CardTitle>
             <Calendar className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-blue-600">{totalYearly.toLocaleString('sr-RS')} RSD</div></CardContent>
         </Card>
       </div>
 
       <div className="grid gap-6 md:grid-cols-2">
         <Card>
           <CardHeader>
             <CardTitle>Mesečna amortizacija - {year}</CardTitle>
             <CardDescription>Raspored troškova amortizacije po mesecima</CardDescription>
           </CardHeader>
           <CardContent>
             <ResponsiveContainer width="100%" height={300}>
               <BarChart data={chartData}>
                 <CartesianGrid strokeDasharray="3 3" />
                 <XAxis dataKey="name" />
                 <YAxis />
                 <Tooltip formatter={(value) => `${Number(value).toLocaleString('sr-RS')} RSD`} />
                 <Legend />
                 <Bar dataKey="amortizacija" fill="hsl(var(--primary))" name="Amortizacija" />
               </BarChart>
             </ResponsiveContainer>
           </CardContent>
         </Card>
 
         <Card>
           <CardHeader>
             <CardTitle>Struktura po kategorijama</CardTitle>
             <CardDescription>Amortizacija po vrstama sredstava</CardDescription>
           </CardHeader>
           <CardContent>
             <div className="space-y-4">
               {['IT oprema', 'Vozila', 'Nameštaj', 'Oprema'].map(cat => {
                 const catRecords = records.filter(r => r.category === cat);
                 const catTotal = catRecords.reduce((sum, r) => sum + r.yearlyDepreciation, 0);
                 const percentage = totalYearly > 0 ? (catTotal / totalYearly) * 100 : 0;
                 return (
                   <div key={cat} className="space-y-2">
                     <div className="flex justify-between text-sm">
                       <span>{cat}</span>
                       <span className="font-medium">{catTotal.toLocaleString('sr-RS')} RSD ({percentage.toFixed(1)}%)</span>
                     </div>
                     <div className="h-2 bg-muted rounded-full overflow-hidden">
                       <div className="h-full bg-primary rounded-full" style={{ width: `${percentage}%` }} />
                     </div>
                   </div>
                 );
               })}
             </div>
           </CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <CardTitle>Detaljna evidencija amortizacije</CardTitle>
           <CardDescription>Pregled amortizacije po svakom sredstvu</CardDescription>
         </CardHeader>
         <CardContent>
           <Table>
             <TableHeader>
               <TableRow>
                 <TableHead>Naziv sredstva</TableHead>
                 <TableHead>Kategorija</TableHead>
                 <TableHead>Nabavna vrednost</TableHead>
                 <TableHead>Akumulirana amortizacija</TableHead>
                 <TableHead>Sadašnja vrednost</TableHead>
                 <TableHead>Godišnja amortizacija</TableHead>
                 <TableHead>Stopa</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {records.map(record => (
                 <TableRow key={record.id}>
                   <TableCell className="font-medium">{record.assetName}</TableCell>
                   <TableCell>{record.category}</TableCell>
                   <TableCell>{record.purchaseValue.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell className="text-orange-600">{record.accumulatedDepreciation.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell className="text-green-600">{record.currentValue.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell className="text-blue-600">{record.yearlyDepreciation.toLocaleString('sr-RS')} RSD</TableCell>
                   <TableCell>{record.depreciationRate}%</TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default Depreciation;