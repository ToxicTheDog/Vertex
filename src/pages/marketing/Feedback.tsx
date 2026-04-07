 import { useState } from 'react';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { Button } from '@/components/ui/button';
 import { Input } from '@/components/ui/input';
 import { Textarea } from '@/components/ui/textarea';
 import { Badge } from '@/components/ui/badge';
 import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
 import { Label } from '@/components/ui/label';
 import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
 import { MessageCircle, Star, ThumbsUp, ThumbsDown, Search, Eye, Reply, Trash2 } from 'lucide-react';
 import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { feedbackApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
 
 interface FeedbackItem {
   id: string;
   customerName: string;
   email: string;
   type: 'suggestion' | 'complaint' | 'praise' | 'question';
   rating: number;
   subject: string;
   message: string;
   status: 'new' | 'in_progress' | 'resolved' | 'closed';
   createdAt: string;
   response?: string;
 }
 
 const initialFeedback: FeedbackItem[] = [
   { id: '1', customerName: 'Petar Petrović', email: 'petar@example.com', type: 'praise', rating: 5, subject: 'Odlična usluga', message: 'Veoma sam zadovoljan brzinom isporuke i kvalitetom proizvoda.', status: 'resolved', createdAt: '2024-02-10', response: 'Hvala vam na lepim rečima!' },
   { id: '2', customerName: 'Ana Anić', email: 'ana@example.com', type: 'complaint', rating: 2, subject: 'Kašnjenje isporuke', message: 'Paket je kasnio 5 dana. Nisam zadovoljna.', status: 'in_progress', createdAt: '2024-02-12' },
   { id: '3', customerName: 'Marko Marković', email: 'marko@example.com', type: 'suggestion', rating: 4, subject: 'Predlog za sajt', message: 'Bilo bi korisno dodati opciju za praćenje pošiljke.', status: 'new', createdAt: '2024-02-14' },
   { id: '4', customerName: 'Jovana Jovanović', email: 'jovana@example.com', type: 'question', rating: 3, subject: 'Pitanje o garanciji', message: 'Da li proizvod ima garanciju i koliko traje?', status: 'new', createdAt: '2024-02-15' },
 ];
 
 const Feedback = () => {
   const { data: feedback, setData: setFeedback } = useFetchData(() => clientsApi.getAll(), initialFeedback);
   const [searchTerm, setSearchTerm] = useState('');
   const [viewDialogOpen, setViewDialogOpen] = useState(false);
   const [replyDialogOpen, setReplyDialogOpen] = useState(false);
   const [selectedFeedback, setSelectedFeedback] = useState<FeedbackItem | null>(null);
   const [replyText, setReplyText] = useState('');
   const { toast } = useToast();
 
   const filteredFeedback = feedback.filter(f =>
     f.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
     f.subject.toLowerCase().includes(searchTerm.toLowerCase())
   );
 
   const getTypeBadge = (type: FeedbackItem['type']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       praise: { label: 'Pohvala', variant: 'default' },
       complaint: { label: 'Pritužba', variant: 'destructive' },
       suggestion: { label: 'Predlog', variant: 'outline' },
       question: { label: 'Pitanje', variant: 'secondary' },
     };
     return <Badge variant={variants[type].variant}>{variants[type].label}</Badge>;
   };
 
   const getStatusBadge = (status: FeedbackItem['status']) => {
     const variants: Record<string, { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }> = {
       new: { label: 'Novo', variant: 'default' },
       in_progress: { label: 'U obradi', variant: 'outline' },
       resolved: { label: 'Rešeno', variant: 'secondary' },
       closed: { label: 'Zatvoreno', variant: 'secondary' },
     };
     return <Badge variant={variants[status].variant}>{variants[status].label}</Badge>;
   };
 
   const renderStars = (rating: number) => {
     return Array.from({ length: 5 }).map((_, i) => (
       <Star key={i} className={`h-4 w-4 ${i < rating ? 'text-yellow-500 fill-yellow-500' : 'text-muted-foreground'}`} />
     ));
   };
 
   const openView = (item: FeedbackItem) => {
     setSelectedFeedback(item);
     setViewDialogOpen(true);
   };
 
   const openReply = (item: FeedbackItem) => {
     setSelectedFeedback(item);
     setReplyText(item.response || '');
     setReplyDialogOpen(true);
   };
 
   const handleReply = () => {
     if (selectedFeedback) {
       setFeedback(feedback.map(f => f.id === selectedFeedback.id ? { ...f, response: replyText, status: 'resolved' } : f));
       toast({ title: 'Odgovor poslat', description: 'Odgovor je uspešno poslat korisniku.' });
       setReplyDialogOpen(false);
     }
   };
 
   const handleDelete = (id: string) => {
     setFeedback(feedback.filter(f => f.id !== id));
     toast({ title: 'Obrisano', description: 'Povratna informacija je obrisana.' });
   };
 
   const avgRating = feedback.length > 0 ? (feedback.reduce((sum, f) => sum + f.rating, 0) / feedback.length).toFixed(1) : '0';
   const positiveCount = feedback.filter(f => f.rating >= 4).length;
   const negativeCount = feedback.filter(f => f.rating <= 2).length;
 
   return (
     <div className="space-y-6">
       <div className="flex items-center justify-between">
         <div>
           <h1 className="text-3xl font-bold">Povratne informacije</h1>
           <p className="text-muted-foreground">Pregled i odgovaranje na feedback kupaca</p>
         </div>
       </div>
 
       <div className="grid gap-4 md:grid-cols-4">
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Ukupno feedbacka</CardTitle>
             <MessageCircle className="h-4 w-4 text-muted-foreground" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{feedback.length}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Prosečna ocena</CardTitle>
             <Star className="h-4 w-4 text-yellow-500" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold">{avgRating} / 5</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Pozitivne</CardTitle>
             <ThumbsUp className="h-4 w-4 text-green-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-green-600">{positiveCount}</div></CardContent>
         </Card>
         <Card>
           <CardHeader className="flex flex-row items-center justify-between pb-2">
             <CardTitle className="text-sm font-medium">Negativne</CardTitle>
             <ThumbsDown className="h-4 w-4 text-red-600" />
           </CardHeader>
           <CardContent><div className="text-2xl font-bold text-red-600">{negativeCount}</div></CardContent>
         </Card>
       </div>
 
       <Card>
         <CardHeader>
           <div className="flex items-center justify-between">
             <div>
               <CardTitle>Lista povratnih informacija</CardTitle>
               <CardDescription>Pregled svih feedbacka od kupaca</CardDescription>
             </div>
             <div className="relative w-64">
               <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
               <Input placeholder="Pretraži..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="pl-8" />
             </div>
           </div>
         </CardHeader>
         <CardContent>
           <div className="space-y-4">
             {filteredFeedback.map(item => (
               <div key={item.id} className="flex items-start gap-4 p-4 border rounded-lg">
                 <div className="flex-1">
                   <div className="flex items-center gap-2 mb-1">
                     <span className="font-medium">{item.customerName}</span>
                     {getTypeBadge(item.type)}
                     {getStatusBadge(item.status)}
                   </div>
                   <div className="flex items-center gap-1 mb-2">{renderStars(item.rating)}</div>
                   <h4 className="font-medium">{item.subject}</h4>
                   <p className="text-sm text-muted-foreground line-clamp-2">{item.message}</p>
                   <p className="text-xs text-muted-foreground mt-2">{item.createdAt}</p>
                 </div>
                 <div className="flex gap-2">
                   <Button variant="ghost" size="icon" onClick={() => openView(item)}><Eye className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" onClick={() => openReply(item)}><Reply className="h-4 w-4" /></Button>
                   <Button variant="ghost" size="icon" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button>
                 </div>
               </div>
             ))}
           </div>
         </CardContent>
       </Card>
 
       <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Detalji feedbacka</DialogTitle>
           </DialogHeader>
           {selectedFeedback && (
             <div className="space-y-4">
               <div className="flex items-center gap-2">
                 <span className="font-medium">{selectedFeedback.customerName}</span>
                 <span className="text-muted-foreground">({selectedFeedback.email})</span>
               </div>
               <div className="flex items-center gap-1">{renderStars(selectedFeedback.rating)}</div>
               <div>
                 <Label>Tema</Label>
                 <p className="font-medium">{selectedFeedback.subject}</p>
               </div>
               <div>
                 <Label>Poruka</Label>
                 <p className="text-muted-foreground">{selectedFeedback.message}</p>
               </div>
               {selectedFeedback.response && (
                 <div className="bg-muted p-3 rounded">
                   <Label>Vaš odgovor</Label>
                   <p>{selectedFeedback.response}</p>
                 </div>
               )}
             </div>
           )}
         </DialogContent>
       </Dialog>
 
       <Dialog open={replyDialogOpen} onOpenChange={setReplyDialogOpen}>
         <DialogContent>
           <DialogHeader>
             <DialogTitle>Odgovori na feedback</DialogTitle>
             <DialogDescription>Pošaljite odgovor korisniku {selectedFeedback?.customerName}</DialogDescription>
           </DialogHeader>
           <div className="grid gap-4 py-4">
             <div className="grid gap-2">
               <Label>Vaš odgovor</Label>
               <Textarea value={replyText} onChange={e => setReplyText(e.target.value)} rows={4} placeholder="Unesite odgovor..." />
             </div>
           </div>
           <DialogFooter>
             <Button variant="outline" onClick={() => setReplyDialogOpen(false)}>Otkaži</Button>
             <Button onClick={handleReply}>Pošalji odgovor</Button>
           </DialogFooter>
         </DialogContent>
       </Dialog>
     </div>
   );
 };
 
 export default Feedback;