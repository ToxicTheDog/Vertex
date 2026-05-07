import { useEffect, useState } from 'react';
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
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
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

const PAGE_SIZE = 10;

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
  note: 'BeleÅ¡ka',
};

const typeColors: Record<string, string> = {
  call: 'bg-blue-500/10 text-blue-500',
  email: 'bg-green-500/10 text-green-500',
  meeting: 'bg-purple-500/10 text-purple-500',
  note: 'bg-orange-500/10 text-orange-500',
};

const formatDate = (value?: string) => {
  if (!value) return '-';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('sr-RS');
};

const CrmNotes = () => {
  const [notes, setNotes] = useState<CrmNote[]>([]);
  const [clients, setClients] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
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

  const fetchNotes = async (page = currentPage, search = searchTerm) => {
    setIsLoading(true);
    const [notesResponse, clientsResponse] = await Promise.all([
      crmNotesApi.getPage({ page, pageSize: PAGE_SIZE, search }),
      clientsApi.getAll(),
    ]);

    setNotes(notesResponse.success ? notesResponse.data : []);
    setTotalPages(notesResponse.success ? notesResponse.totalPages || 0 : 0);
    setTotalItems(notesResponse.success ? notesResponse.total || 0 : 0);
    setClients(clientsResponse.success && clientsResponse.data ? clientsResponse.data : []);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchNotes(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

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
      toast.error('Klijent, predmet i sadrzaj su obavezni.');
      return;
    }

    const selectedClient = clients.find((client) => client.id === formData.clientId);
    if (!selectedClient) {
      toast.error('Izaberite validnog klijenta.');
      return;
    }

    setIsSubmitting(true);
    const payload = {
      clientId: formData.clientId,
      clientName: selectedClient.name,
      type: formData.type,
      subject: formData.subject,
      content: formData.content,
      author: formData.author,
    };

    const response = isEditing && selectedNote
      ? await crmNotesApi.update(selectedNote.id, payload)
      : await crmNotesApi.create(payload);
    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || 'CRM beleÅ¡ka nije sacuvana.');
      return;
    }

    toast.success(isEditing ? 'BeleÅ¡ka je uspesno izmenjena.' : 'Nova beleÅ¡ka je kreirana.');
    setDialogOpen(false);
    resetForm();
    fetchNotes(currentPage, searchTerm);
  };

  const confirmDelete = async () => {
    if (!selectedNote) {
      return;
    }

    setIsDeleting(true);
    const response = await crmNotesApi.delete(selectedNote.id);
    setIsDeleting(false);

    if (!response.success) {
      toast.error(response.message || 'Nije moguce obrisati beleÅ¡ku.');
      return;
    }

    toast.success('BeleÅ¡ka je uspesno obrisana.');
    setDeleteDialogOpen(false);
    setSelectedNote(null);

    if (notes.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchNotes(currentPage, searchTerm);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">CRM beleÅ¡ke</h1>
          <p className="text-muted-foreground">Evidencija komunikacije sa klijentima</p>
        </div>
        <Button onClick={handleAddNew}>
          <Plus className="mr-2 h-4 w-4" />
          Nova beleÅ¡ka
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        {Object.entries(typeLabels).map(([type, label]) => (
          <Card key={type}>
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground">{label}</p>
                  <p className="text-2xl font-bold">{notes.filter((note) => note.type === type).length}</p>
                </div>
                <div className={`p-3 rounded-full ${typeColors[type]}`}>
                  {typeIcons[type]}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <div className="flex items-center justify-between gap-4">
            <div>
              <CardTitle>Sve beleÅ¡ke</CardTitle>
              <CardDescription>Ukupno {totalItems} beleÅ¡ki</CardDescription>
            </div>
            <div className="relative w-64">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretrazi beleÅ¡ke..."
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
                className="pl-8"
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {notes.map((note) => (
                <TableRow key={note.id}>
                  <TableCell>{formatDate(note.date)}</TableCell>
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
              {!isLoading && notes.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="py-12 text-center text-muted-foreground">
                    Nema CRM beleÅ¡ki za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious href="#" className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''} onClick={(event) => {
                    event.preventDefault();
                    if (currentPage > 1) setCurrentPage((page) => page - 1);
                  }} />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                  .map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink href="#" isActive={pageNumber === currentPage} onClick={(event) => {
                        event.preventDefault();
                        setCurrentPage(pageNumber);
                      }}>
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext href="#" className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''} onClick={(event) => {
                    event.preventDefault();
                    if (currentPage < totalPages) setCurrentPage((page) => page + 1);
                  }} />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena beleÅ¡ke' : 'Nova beleÅ¡ka'}</DialogTitle>
            <DialogDescription>Zabelezite komunikaciju sa klijentom</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label>Klijent *</Label>
              <Select value={formData.clientId} onValueChange={(value) => setFormData({ ...formData, clientId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Izaberite klijenta" />
                </SelectTrigger>
                <SelectContent>
                  {clients.map((client) => (
                    <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Tip komunikacije</Label>
              <Select value={formData.type} onValueChange={(value: CrmNote['type']) => setFormData({ ...formData, type: value })}>
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
              <Input id="subject" value={formData.subject} onChange={(event) => setFormData({ ...formData, subject: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="content">Sadrzaj beleÅ¡ke *</Label>
              <Textarea id="content" rows={5} value={formData.content} onChange={(event) => setFormData({ ...formData, content: event.target.value })} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => { setDialogOpen(false); resetForm(); }}>Otkazi</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Cuvanje...' : isEditing ? 'Sacuvaj izmene' : 'Kreiraj beleÅ¡ku'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji beleÅ¡ke</DialogTitle>
          </DialogHeader>
          {selectedNote && (
            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <Badge className={typeColors[selectedNote.type]}>
                  {typeIcons[selectedNote.type]} {typeLabels[selectedNote.type]}
                </Badge>
                <span className="text-muted-foreground">{formatDate(selectedNote.date)}</span>
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
                <Label className="text-muted-foreground">Sadrzaj</Label>
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

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija ce trajno obrisati beleÅ¡ku za klijenta <strong>{selectedNote?.clientName}</strong>.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkazi</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting} className="bg-destructive hover:bg-destructive/90">
              {isDeleting ? 'Brisanje...' : 'Obrisi beleÅ¡ku'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default CrmNotes;
