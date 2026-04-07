 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { Checkbox } from '@/components/ui/checkbox';
 import { Label } from '@/components/ui/label';
 import { Progress } from '@/components/ui/progress';
 import { RotateCcw, Play, CheckCircle, Clock, AlertTriangle, FileText } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { yearlyProcessingApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface ProcessingTask {
   id: string;
   name: string;
   description: string;
   status: 'pending' | 'running' | 'completed' | 'error';
   progress: number;
 }
 
 const YearlyProcessing = () => {
  // API integracija: podaci se učitavaju sa servera kada DEMO_MODE === false
   const [year, setYear] = useState('2024');
   const [selectedTasks, setSelectedTasks] = useState<string[]>([]);
   const [isRunning, setIsRunning] = useState(false);
   const { toast } = useToast();
 
   const [tasks, setTasks] = useState<ProcessingTask[]>([
     { id: '1', name: 'Zatvaranje poslovne godine', description: 'Zaključivanje svih knjiga za tekuću godinu', status: 'pending', progress: 0 },
     { id: '2', name: 'Obračun godišnje amortizacije', description: 'Finalni obračun amortizacije za sva osnovna sredstva', status: 'pending', progress: 0 },
     { id: '3', name: 'Prenos salda', description: 'Prenos početnih stanja u novu poslovnu godinu', status: 'pending', progress: 0 },
     { id: '4', name: 'Generisanje godišnjih izveštaja', description: 'Kreiranje bilansa stanja i uspeha', status: 'pending', progress: 0 },
     { id: '5', name: 'Arhiviranje dokumentacije', description: 'Arhiviranje svih dokumenata za tekuću godinu', status: 'pending', progress: 0 },
     { id: '6', name: 'Obračun godišnjeg poreza', description: 'Priprema poreske prijave i obračun poreza', status: 'pending', progress: 0 },
   ]);
 
   const toggleTask = (taskId: string) => {
     setSelectedTasks(prev => prev.includes(taskId) ? prev.filter(id => id !== taskId) : [...prev, taskId]);
   };
 
   const selectAll = () => {
     if (selectedTasks.length === tasks.length) {
       setSelectedTasks([]);
     } else {
       setSelectedTasks(tasks.map(t => t.id));
     }
   };
 
   const runProcessing = () => {
     if (selectedTasks.length === 0) {
       toast({ title: 'Greška', description: 'Izaberite bar jednu obradu.', variant: 'destructive' });
       return;
     }
 
     setIsRunning(true);
     let currentIndex = 0;
 
     const processNext = () => {
       if (currentIndex >= selectedTasks.length) {
         setIsRunning(false);
         toast({ title: 'Obrada završena', description: 'Sve izabrane godišnje obrade su uspešno završene.' });
         return;
       }
 
       const taskId = selectedTasks[currentIndex];
       setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'running', progress: 0 } : t));
 
       let progress = 0;
       const interval = setInterval(() => {
         progress += 10;
         setTasks(prev => prev.map(t => t.id === taskId ? { ...t, progress } : t));
         if (progress >= 100) {
           clearInterval(interval);
           setTasks(prev => prev.map(t => t.id === taskId ? { ...t, status: 'completed', progress: 100 } : t));
           currentIndex++;
           setTimeout(processNext, 500);
         }
       }, 200);
     };
 
     processNext();
   };
 
   const getStatusIcon = (status: ProcessingTask['status']) => {
     switch (status) {
       case 'completed': return <CheckCircle className="h-5 w-5 text-green-600" />;
       case 'running': return <Clock className="h-5 w-5 text-blue-600 animate-spin" />;
       case 'error': return <AlertTriangle className="h-5 w-5 text-red-600" />;
       default: return <Clock className="h-5 w-5 text-muted-foreground" />;
     }
   };
 
   const completedCount = tasks.filter(t => t.status === 'completed').length;
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Godišnje obrade</h1>
           <p className="text-muted-foreground">Zatvaranje godine i godišnji obračuni</p>
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
           <Button onClick={runProcessing} disabled={isRunning || selectedTasks.length === 0}>
             <Play className="mr-2 h-4 w-4" /> {isRunning ? 'U toku...' : 'Pokreni obrade'}
           </Button>
         </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-3">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Godina obrade</CardTitle>
             <RotateCcw className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{year}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Izabrane obrade</CardTitle>
             <FileText className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{selectedTasks.length} / {tasks.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Završene obrade</CardTitle>
             <CheckCircle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{completedCount}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista godišnjih obrada</CardTitle>
               <CardDescription>Izaberite obrade koje želite da pokrenete</CardDescription>
             </div>
             <Button variant="outline" onClick={selectAll}>
               {selectedTasks.length === tasks.length ? 'Poništi sve' : 'Izaberi sve'}
             </Button>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {tasks.map(task => (
               <div key={task.id} className="flex items-center gap-4 p-4 border rounded-lg">
                 <Checkbox
                   id={task.id}
                   checked={selectedTasks.includes(task.id)}
                   onCheckedChange={() => toggleTask(task.id)}
                   disabled={isRunning}
                 />
                 <div className="flex-1">
                   <div className="flex items-center gap-2">
                     <Label htmlFor={task.id} className="font-medium cursor-pointer">{task.name}</Label>
                     {getStatusIcon(task.status)}
                   </div>
                   <p className="text-sm text-muted-foreground">{task.description}</p>
                   {task.status === 'running' && (
                     <Progress value={task.progress} className="mt-2 h-2" />
                   )}
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Card>
         <CardHeader>
           <CardTitle>Napomena</CardTitle>
         </CardHeader>
         <CardContent>
           <div className="text-sm text-muted-foreground space-y-2">
             <p>• Zatvaranje poslovne godine je nepovratan proces. Proverite sve podatke pre pokretanja.</p>
             <p>• Preporučujemo da napravite rezervnu kopiju baze podataka pre pokretanja godišnjih obrada.</p>
             <p>• Nakon zatvaranja godine, izmene u prethodnoj godini neće biti moguće bez posebne dozvole.</p>
           </div>
         </CardContent>
       </Card>
     </div>
   );
 };
 
 export default YearlyProcessing;