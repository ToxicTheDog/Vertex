import { useEffect, useState } from 'react';
import { Search, Download, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { clientsApi } from '@/services/apiService';
import { Client } from '@/data/demoData';

const PAGE_SIZE = 10;

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    pib: '',
    maticniBroj: '',
    address: '',
    city: '',
    email: '',
    phone: '',
    contactPerson: '',
  });
  const { toast } = useToast();

  const fetchClients = async (page = currentPage, search = searchTerm) => {
    setIsLoading(true);

    try {
      const response = await clientsApi.getPage({
        page,
        pageSize: PAGE_SIZE,
        search,
      });

      if (!response.success) {
        toast({
          title: 'Greška',
          description: 'Nije moguće učitati klijente',
          variant: 'destructive',
        });
        setClients([]);
        setTotalItems(0);
        setTotalPages(0);
        return;
      }

      setClients(response.data as Client[]);
      setTotalItems(response.total || 0);
      setTotalPages(response.totalPages || 0);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchClients(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const resetForm = () => {
    setFormData({
      name: '',
      pib: '',
      maticniBroj: '',
      address: '',
      city: '',
      email: '',
      phone: '',
      contactPerson: '',
    });
    setSelectedClient(null);
    setIsEditing(false);
  };

  const handleAddNew = () => {
    resetForm();
    setIsDialogOpen(true);
  };

  const handleEdit = (client: Client) => {
    setSelectedClient(client);
    setFormData({
      name: client.name || '',
      pib: client.pib || '',
      maticniBroj: client.maticniBroj || '',
      address: client.address || '',
      city: client.city || '',
      email: client.email || '',
      phone: client.phone || '',
      contactPerson: client.contactPerson || '',
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.pib) {
      toast({
        title: 'Greška',
        description: 'Naziv firme i PIB su obavezni',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);

    try {
      const response = isEditing && selectedClient
        ? await clientsApi.update(selectedClient.id, formData)
        : await clientsApi.create(formData);

      if (!response.success) {
        throw new Error(response.message || 'Čuvanje nije uspelo');
      }

      toast({
        title: 'Uspešno',
        description: isEditing ? 'Klijent je uspešno izmenjen' : 'Novi klijent je kreiran',
      });

      setIsDialogOpen(false);
      resetForm();
      fetchClients(currentPage, searchTerm);
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Došlo je do greške prilikom čuvanja',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const confirmDelete = async () => {
    if (!selectedClient) {
      return;
    }

    setIsDeleting(true);

    try {
      const response = await clientsApi.delete(selectedClient.id);

      if (!response.success) {
        throw new Error(response.message || 'Brisanje nije uspelo');
      }

      toast({
        title: 'Uspešno',
        description: 'Klijent je uspešno obrisan',
      });

      if (clients.length === 1 && currentPage > 1) {
        setCurrentPage((page) => page - 1);
      } else {
        fetchClients(currentPage, searchTerm);
      }
    } catch (error: any) {
      toast({
        title: 'Greška',
        description: error.message || 'Nije moguće obrisati klijenta',
        variant: 'destructive',
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stranke</h1>
          <p className="text-muted-foreground">Pregled i upravljanje klijentima i partnerima</p>
        </div>
        <Button onClick={handleAddNew}>
          <UserPlus className="mr-2 h-4 w-4" />
          Novi klijent
        </Button>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu, PIB-u, gradu ili kontaktu..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Izvezi
            </Button>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>PIB</TableHead>
                <TableHead>Grad</TableHead>
                <TableHead>Kontakt osoba</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Telefon</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {clients.map((client) => (
                <TableRow key={client.id}>
                  <TableCell className="font-medium">{client.name}</TableCell>
                  <TableCell>{client.pib}</TableCell>
                  <TableCell>{client.city}</TableCell>
                  <TableCell>{client.contactPerson}</TableCell>
                  <TableCell className="text-sm">{client.email}</TableCell>
                  <TableCell>{client.phone}</TableCell>
                  <TableCell className="text-right">
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Akcije</DropdownMenuLabel>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => handleEdit(client)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDeleteClick(client)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {!isLoading && clients.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-12 text-center text-muted-foreground">
                    Nema pronađenih klijenata.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>

          {totalPages > 1 && (
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    className={currentPage <= 1 ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage > 1) {
                        setCurrentPage((page) => page - 1);
                      }
                    }}
                  />
                </PaginationItem>
                {Array.from({ length: totalPages }, (_, index) => index + 1)
                  .slice(Math.max(0, currentPage - 3), Math.max(0, currentPage - 3) + 5)
                  .map((pageNumber) => (
                    <PaginationItem key={pageNumber}>
                      <PaginationLink
                        href="#"
                        isActive={pageNumber === currentPage}
                        onClick={(event) => {
                          event.preventDefault();
                          setCurrentPage(pageNumber);
                        }}
                      >
                        {pageNumber}
                      </PaginationLink>
                    </PaginationItem>
                  ))}
                <PaginationItem>
                  <PaginationNext
                    href="#"
                    className={currentPage >= totalPages ? 'pointer-events-none opacity-50' : ''}
                    onClick={(event) => {
                      event.preventDefault();
                      if (currentPage < totalPages) {
                        setCurrentPage((page) => page + 1);
                      }
                    }}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          )}
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena klijenta' : 'Novi klijent'}</DialogTitle>
            <DialogDescription>
              {isEditing ? 'Izmenite podatke o postojećem klijentu' : 'Unesite podatke o novom klijentu'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Naziv firme *</Label>
              <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pib">PIB *</Label>
                <Input id="pib" value={formData.pib} onChange={(event) => setFormData({ ...formData, pib: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maticniBroj">Matični broj</Label>
                <Input id="maticniBroj" value={formData.maticniBroj} onChange={(event) => setFormData({ ...formData, maticniBroj: event.target.value })} />
              </div>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="address">Adresa</Label>
              <Input id="address" value={formData.address} onChange={(event) => setFormData({ ...formData, address: event.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Grad</Label>
                <Input id="city" value={formData.city} onChange={(event) => setFormData({ ...formData, city: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="contactPerson">Kontakt osoba</Label>
                <Input id="contactPerson" value={formData.contactPerson} onChange={(event) => setFormData({ ...formData, contactPerson: event.target.value })} />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input id="email" value={formData.email} onChange={(event) => setFormData({ ...formData, email: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input id="phone" value={formData.phone} onChange={(event) => setFormData({ ...formData, phone: event.target.value })} />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Čuvanje...' : isEditing ? 'Sačuvaj' : 'Kreiraj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Obrisati klijenta?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija se ne može poništiti.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Otkaži</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} disabled={isDeleting}>
              {isDeleting ? 'Brisanje...' : 'Obriši'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;
