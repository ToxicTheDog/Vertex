import { useState, useEffect } from 'react';
import { Plus, Phone, Mail, Users, FileText, Search, Eye, Edit, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { CrmNote } from '@/data/demoData';
import { crmNotesApi, clientsApi } from '@/services/apiService';
import { DEMO_MODE } from '@/config/api';
import { demoCrmNotes, demoClients } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';

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
  const [notes, setNotes] = useState<CrmNote[]>([]);
  const [clients, setClients] = useState(demoClients);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredNotes, setFilteredNotes] = useState<CrmNote[]>([]);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  const [selectedNote, setSelectedNote] = useState<CrmNote | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState({
    clientId: '',
    type: 'note' as CrmNote['type'],
    subject: '',
    content: '',
    author: 'Korisnik',
  });

  // Učitavanje podataka
  const fetchData = async () => {
    setIsLoading(true);

    if (DEMO_MODE) {
      setNotes(demoCrmNotes);
      setClients(demoClients);
      setIsLoading(false);
      return;
    }

    try {
      const [notesRes, clientsRes] = await Promise.all([
        crmNotesApi.getAll(),
        clientsApi.getAll(),
      ]);

      if (notesRes.success && notesRes.data) {
        setNotes(notesRes.data);
      }
      if (clientsRes.success && clientsRes.data) {
        setClients(clientsRes.data);
      }
    } catch (error) {
      console.error("Error fetching CRM data:", error);
      toast.error("Greška pri učitavanju podataka. Koristim demo podatke.");
      setNotes(demoCrmNotes);
      setClients(demoClients);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // Filtriranje beleški
  useEffect(() => {
    const filtered = notes.filter((note) =>
      note.clientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.subject.toLowerCase().includes(searchTerm.toLowerCase()) ||
      note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredNotes(filtered);
  }, [searchTerm, notes]);

  const resetForm = () => {
    setFormData({
      clientId: '',
      type: 'note',
      subject: '',
      content: '',
      author: 'Korisnik',
    });
    setSelectedNote(null);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setDialogOpen(true);
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

  const handleView = (note: CrmNote) => {
    setSelectedNote(note);
    setViewDialogOpen(true);
  };

  const handleDeleteClick = (note: CrmNote) => {
    setSelectedNote(note);
    setDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.clientId || !formData.subject || !formData.content) {
      toast.error("Klijent, predmet i sadržaj su obavezni!");
      return;
    }

    const selectedClient = clients.find((c) => c.id === formData.clientId);
    if (!selectedClient) {
      toast.error("Izaberite validnog klijenta");
      return;
    }

    setIsSubmitting(true);

    const noteData = {
      clientId: formData.clientId,
      clientName: selectedClient.name,
      type: formData.type,
      subject: formData.subject,
      content: formData.content,
      author: formData.author,
    };

    try {
      if (isEditing && selectedNote) {
        if (DEMO_MODE) {
          const updatedNote: CrmNote = { ...selectedNote, ...noteData, date: selectedNote.date };
          setNotes(notes.map((n) => (n.id === selectedNote.id ? updatedNote : n)));
          toast.success("Beleška uspešno izmenjena");
        } else {
          const response = await crmNotesApi.update(selectedNote.id, noteData);
          if (response.success) {
            toast.success("Beleška uspešno izmenjena");
            fetchData();
          } else {
            throw new Error(response.message || "Greška pri ažuriranju");
          }
        }
      } else {
        if (DEMO_MODE) {
          const newNote: CrmNote = {
            id: Date.now().toString(),
            date: new Date().toISOString().split("T")[0],
            ...noteData,
          };
          setNotes([newNote, ...notes]);
          toast.success("Nova beleška kreirana");
        } else {
          const response = await crmNotesApi.create(noteData);
          if (response.success) {
            toast.success("Nova beleška kreirana");
            fetchData();
          } else {
            throw new Error(response.message || "Greška pri kreiranju");
          }
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Došlo je do greške prilikom čuvanja");
    } finally {
      setIsSubmitting(false);
      setDialogOpen(false);
      resetForm();
    }
  };

  const confirmDelete = async () => {
    if (!selectedNote) return;

    setIsDeleting(true);

    try {
      if (DEMO_MODE) {
        setNotes(notes.filter((n) => n.id !== selectedNote.id));
        toast.success("Beleška uspešno obrisana");
      } else {
        const response = await crmNotesApi.delete(selectedNote.id);
        if (response.success) {
          toast.success("Beleška uspešno obrisana");
          fetchData();
        } else {
          throw new Error(response.message || "Greška pri brisanju");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Nije moguće obrisati belešku");
    } finally {
      setIsDeleting(false);
      setDeleteDialogOpen(false);
      setSelectedNote(null);
    }
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-96">Učitavanje CRM beleški...</div>;
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM Beleške</h1>
          <p className="text-muted-foreground">Evidencija komunikacije sa klijentima</p>
        </div>
        <Button onClick={handleAddNew}>
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
                  <p className="text-2xl font-bold">{notes.filter((n) => n.type === type).length}</p>
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
                placeholder="Pretraži beleške..."
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
                  <TableCell className="max-w-xs truncate">{note.subject}</TableCell>
                  <TableCell>{note.author}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(note)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(note)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDeleteClick(note)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredNotes.length === 0 && searchTerm && (
            <div className="text-center py-12 text-muted-foreground">
              Nema pronađenih beleški za zadatu pretragu.
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog za kreiranje / izmenu */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena beleške' : 'Nova beleška'}</DialogTitle>
            <DialogDescription>Zabeležite komunikaciju sa klijentom</DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Klijent *</Label>
              <Select value={formData.clientId} onValueChange={(v) => setFormData({ ...formData, clientId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite klijenta" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>
                      {client.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Tip komunikacije</Label>
              <Select value={formData.type} onValueChange={(v: CrmNote['type']) => setFormData({ ...formData, type: v })}>
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
              <Label htmlFor="subject">Predmet *</Label>
              <Input
                id="subject"
                value={formData.subject}
                onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
                placeholder="Tema komunikacije"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">Sadržaj beleške *</Label>
              <Textarea
                id="content"
                rows={5}
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                placeholder="Unesite detalje komunikacije..."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>
              Otkaži
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? "Čuvanje..." : isEditing ? "Sačuvaj izmene" : "Kreiraj belešku"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Pregled beleške */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji beleške</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={typeColors[selectedNote.type]}>
                  {typeIcons[selectedNote.type]} {typeLabels[selectedNote.type]}
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
                <p className="mt-2 p-4 bg-muted rounded-lg whitespace-pre-wrap">{selectedNote.content}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Autor</Label>
                <p className="font-medium">{selectedNote.author}</p>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>

      {/* Potvrda brisanja */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati belešku za klijenta <strong>{selectedNote?.clientName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Brisanje..." : "Obriši belešku"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CrmNotes;