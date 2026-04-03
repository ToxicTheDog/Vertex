import { useState, useEffect } from 'react';
import { Plus, Search, Download, MoreHorizontal, Edit, Trash2, UserPlus } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
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
import { useToast } from '@/hooks/use-toast';
import { clientsApi } from '@/services/apiService';
import { Client } from '@/data/demoData';
import { DEMO_MODE } from '@/config/api';

// Import demo podataka za DEMO_MODE
import { demoClients } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [filteredClients, setFilteredClients] = useState<Client[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

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

  // Učitavanje klijenata
  const fetchClients = async () => {
    setIsLoading(true);

    if (DEMO_MODE) {
      setClients(demoClients);
      setFilteredClients(demoClients);
      setIsLoading(false);
      return;
    }

    try {
      const response = await clientsApi.getAll();
      if (response.success && response.data) {
        setClients(response.data);
        setFilteredClients(response.data);
      } else {
        toast({
          title: "Greška",
          description: response.message || "Nije moguće učitati klijente",
          variant: "destructive",
        });
      }
    } catch (error) {
      console.error("Error fetching clients:", error);
      toast({
        title: "Greška",
        description: "Došlo je do greške prilikom učitavanja klijenata",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  // Filtriranje po pretrazi
  useEffect(() => {
    const filtered = clients.filter((client) =>
      client.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.pib.includes(searchTerm) ||
      client.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
      client.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredClients(filtered);
  }, [searchTerm, clients]);

  // Učitaj podatke pri mount-u
  useEffect(() => {
    fetchClients();
  }, []);

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
      name: client.name,
      pib: client.pib,
      maticniBroj: client.maticniBroj,
      address: client.address,
      city: client.city,
      email: client.email,
      phone: client.phone,
      contactPerson: client.contactPerson,
    });
    setIsEditing(true);
    setIsDialogOpen(true);
  };

  const handleDeleteClick = (client: Client) => {
    setSelectedClient(client);
    setIsDeleteDialogOpen(true);
  };

  // Kreiranje ili ažuriranje klijenta
  const handleSubmit = async () => {
    if (!formData.name || !formData.pib) {
      toast({
        title: "Greška",
        description: "Naziv firme i PIB su obavezni!",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      if (isEditing && selectedClient) {
        // UPDATE
        if (DEMO_MODE) {
          const updated = { ...selectedClient, ...formData };
          setClients(clients.map((c) => (c.id === selectedClient.id ? updated : c)));
          toast({ title: "Uspešno", description: "Klijent je izmenjen (demo mod)" });
        } else {
          const response = await clientsApi.update(selectedClient.id, formData);
          if (response.success) {
            toast({ title: "Uspešno", description: "Klijent je uspešno izmenjen" });
            fetchClients();
          } else {
            throw new Error(response.message || "Greška pri ažuriranju");
          }
        }
      } else {
        // CREATE
        if (DEMO_MODE) {
          const newClient: Client = {
            id: Date.now().toString(),
            ...formData,
            createdAt: new Date().toISOString().split('T')[0],
          };
          setClients([newClient, ...clients]);
          toast({ title: "Uspešno", description: "Novi klijent je dodat (demo mod)" });
        } else {
          const response = await clientsApi.create(formData);
          if (response.success) {
            toast({ title: "Uspešno", description: "Novi klijent je kreiran" });
            fetchClients();
          } else {
            throw new Error(response.message || "Greška pri kreiranju");
          }
        }
      }
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Došlo je do greške prilikom čuvanja",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
      setIsDialogOpen(false);
      resetForm();
    }
  };

  // Brisanje klijenta
  const confirmDelete = async () => {
    if (!selectedClient) return;

    setIsDeleting(true);

    try {
      if (DEMO_MODE) {
        setClients(clients.filter((c) => c.id !== selectedClient.id));
        toast({ title: "Uspešno", description: "Klijent je obrisan (demo mod)" });
      } else {
        const response = await clientsApi.delete(selectedClient.id);
        if (response.success) {
          toast({ title: "Uspešno", description: "Klijent je uspešno obrisan" });
          fetchClients();
        } else {
          throw new Error(response.message || "Greška pri brisanju");
        }
      }
    } catch (error: any) {
      toast({
        title: "Greška",
        description: error.message || "Nije moguće obrisati klijenta",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteDialogOpen(false);
      setSelectedClient(null);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-96 text-lg">
        Učitavanje klijenata...
      </div>
    );
  }

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
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po imenu, PIB-u, gradu ili kontaktu..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Button variant="outline">
              <Download className="mr-2 h-4 w-4" />
              Izvezi
            </Button>
          </div>
        </CardHeader>

        <CardContent>
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
              {filteredClients.map((client) => (
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
                        <DropdownMenuItem
                          className="text-destructive"
                          onClick={() => handleDeleteClick(client)}
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {filteredClients.length === 0 && (
            <div className="text-center py-12 text-muted-foreground">
              Nema pronađenih klijenata.
            </div>
          )}
        </CardContent>
      </Card>

      {/* === DIALOG ZA DODAVANJE / IZMENU === */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[520px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena klijenta' : 'Novi klijent'}</DialogTitle>
            <DialogDescription>
              {isEditing
                ? 'Izmenite podatke o postojećem klijentu'
                : 'Unesite podatke o novom klijentu'}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="name">Naziv firme *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="Naziv firme d.o.o."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="pib">PIB *</Label>
                <Input
                  id="pib"
                  value={formData.pib}
                  onChange={(e) => setFormData({ ...formData, pib: e.target.value })}
                  placeholder="123456789"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="maticniBroj">Matični broj</Label>
                <Input
                  id="maticniBroj"
                  value={formData.maticniBroj}
                  onChange={(e) => setFormData({ ...formData, maticniBroj: e.target.value })}
                  placeholder="12345678"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="address">Adresa</Label>
              <Input
                id="address"
                value={formData.address}
                onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                placeholder="Ulica i broj"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="grid gap-2">
                <Label htmlFor="city">Grad</Label>
                <Input
                  id="city"
                  value={formData.city}
                  onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                  placeholder="Beograd"
                />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="phone">Telefon</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  placeholder="+381 11 123 4567"
                />
              </div>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="info@firma.rs"
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="contactPerson">Kontakt osoba</Label>
              <Input
                id="contactPerson"
                value={formData.contactPerson}
                onChange={(e) => setFormData({ ...formData, contactPerson: e.target.value })}
                placeholder="Ime i prezime"
              />
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => { setIsDialogOpen(false); resetForm(); }}
            >
              Otkaži
            </Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting
                ? "Čuvanje..."
                : isEditing
                  ? "Sačuvaj izmene"
                  : "Kreiraj klijenta"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* === ALERT DIALOG ZA BRISANJE === */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Da li ste sigurni?</AlertDialogTitle>
            <AlertDialogDescription>
              Ova akcija će trajno obrisati klijenta <strong>{selectedClient?.name}</strong>.<br />
              Ova radnja se ne može opozvati.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Otkaži</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDelete}
              disabled={isDeleting}
              className="bg-destructive hover:bg-destructive/90"
            >
              {isDeleting ? "Brisanje..." : "Obriši klijenta"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default Clients;