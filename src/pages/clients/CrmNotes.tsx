import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Phone, Mail, Users, FileText, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoCrmNotes, demoClients, CrmNote } from '@/data/demoData';

const typeIcons: Record<string, React.ReactNode> = {
  call: <Phone className="h-4 w-4" />,
  email: <Mail className="h-4 w-4" />,
  meeting: <Users className="h-4 w-4" />,
  note: <FileText className="h-4 w-4" />,
};

const typeLabels: Record<string, string> = {
  call: 'Poziv',
  email: 'Email',
  meeting: 'Sastanak',
  note: 'Beleška',
};

const typeColors: Record<string, string> = {
  call: 'bg-blue-500/10 text-blue-500',
  email: 'bg-green-500/10 text-green-500',
  meeting: 'bg-purple-500/10 text-purple-500',
  note: 'bg-orange-500/10 text-orange-500',
};

const CrmNotes = () => {
  const [notes, setNotes] = useState<CrmNote[]>(demoCrmNotes);
  const [searchTerm, setSearchTerm] = useState('');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedNote, setSelectedNote] = useState<CrmNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    clientId: '',
    type: 'note' as CrmNote['type'],
    subject: '',
    content: '',
    author: 'Korisnik',
  });

  const filteredNotes = notes.filter(note => 
    note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
    note.content.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSubmit = () => {
    const client = demoClients.find(c => c.id === formData.clientId);
    if (!client) {
      toast.error('Izaberite klijenta');
      return;
    }

    const newNote: CrmNote = {
      id: isEditing && selectedNote ? selectedNote.id : Date.now().toString(),
      clientId: formData.clientId,
      clientName: client.name,
      date: new Date().toISOString().split('T')[0],
      type: formData.type,
      subject: formData.subject,
      content: formData.content,
      author: formData.author,
    };

    if (isEditing && selectedNote) {
      setNotes(notes.map(n => n.id === selectedNote.id ? newNote : n));
      toast.success('Beleška je uspešno izmenjena');
    } else {
      setNotes([newNote, ...notes]);
      toast.success('Beleška je uspešno kreirana');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      clientId: '',
      type: 'note',
      subject: '',
      content: '',
      author: 'Korisnik',
    });
    setIsEditing(false);
    setSelectedNote(null);
  };

  const handleEdit = (note: CrmNote) => {
    setSelectedNote(note);
    setFormData({
      clientId: note.clientId,
      type: note.type,
      subject: note.subject,
      content: note.content,
      author: note.author,
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setNotes(notes.filter(n => n.id !== id));
    toast.success('Beleška je obrisana');
  };

  const handleView = (note: CrmNote) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Beleške</h1>
          <p className="text-muted-foreground">Evidencija komunikacije sa klijentima</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova beleška
        </Button>
      </div>

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <Card key={type}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{notes.filter(n => n.type === type).length}</p>
                </div>
                <div className={`p-3 rounded-full ${typeColors[type]}`}>
                  {typeIcons[type]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Lista beleški */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Sve beleške</CardTitle>
              <CardDescription>Ukupno {notes.length} beleški</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Klijent</TableHead>
                <TableHead>Predmet</TableHead>
                <TableHead>Autor</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredNotes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{new Date(note.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>
                    <Badge className={typeColors[note.type]}>
                      <span className="flex items-center gap-1">
                        {typeIcons[note.type]}
                        {typeLabels[note.type]}
                      </span>
                    </Badge>
                  </TableCell>
                  <TableCell className="font-medium">{note.clientName}</TableCell>
                  <TableCell>{note.subject}</TableCell>
                  <TableCell>{note.author}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(note)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(note.id)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dialog za novu/izmenu beleške */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena beleške' : 'Nova beleška'}</DialogTitle>
            <DialogDescription>
              Zabeležite komunikaciju sa klijentom
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Klijent</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({...formData, clientId: v})}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite klijenta" />
                </SelectTrigger>
                <SelectContent>
                  {demoClients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tip</Label>
              <Select value={formData.type} onValueChange={(v: CrmNote['type']) => setFormData({...formData, type: v})}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(typeLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="subject">Predmet</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({...formData, subject: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Sadržaj</Label>
              <Textarea
                id="content"
                rows={4}
                value={formData.content}
                onChange={(e) => setFormData({...formData, content: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji beleške</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={typeColors[selectedNote.type]}>
                  <span className="flex items-center gap-1">
                    {typeIcons[selectedNote.type]}
                    {typeLabels[selectedNote.type]}
                  </span>
                </Badge>
                <span className="text-muted-foreground">
                  {new Date(selectedNote.date).toLocaleDateString('sr-RS')}
                </span>
              </div>
              <div>
                <Label className="text-muted-foreground">Klijent</Label>
                <p className="font-medium">{selectedNote.clientName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Predmet</Label>
                <p className="font-medium">{selectedNote.subject}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Sadržaj</Label>
                <p className="mt-1 p-3 bg-muted rounded-lg">{selectedNote.content}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Autor</Label>
                <p className="font-medium">{selectedNote.author}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default CrmNotes;
