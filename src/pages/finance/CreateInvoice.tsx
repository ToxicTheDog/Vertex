import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Send } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  TableFooter,
} from '@/components/ui/table';
import { demoClients, demoArticles } from '@/data/demoData';
import { useFetchData } from '@/hooks/useFetchData';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi, clientsApi, invoicesApi } from '@/services/apiService';

interface InvoiceItem {
  id: string;
  articleId: string;
  name: string;
  quantity: number;
  unit: string;
  price: number;
  vatRate: number;
  total: number;
}

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const CreateInvoice = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [selectedClient, setSelectedClient] = useState('');
  const [invoiceDate, setInvoiceDate] = useState(new Date().toISOString().split('T')[0]);
  const [dueDate, setDueDate] = useState('');
  const [items, setItems] = useState<InvoiceItem[]>([]);
  const [notes, setNotes] = useState('');
  const { data: clients } = useFetchData(() => clientsApi.getAll(), demoClients);
  const { data: articles } = useFetchData(() => articlesApi.getAll(), demoArticles);

  const addItem = () => {
    const newItem: InvoiceItem = {
      id: Date.now().toString(),
      articleId: '',
      name: '',
      quantity: 1,
      unit: 'kom',
      price: 0,
      vatRate: 20,
      total: 0
    };
    setItems([...items, newItem]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(items.map(item => {
      if (item.id === id) {
        const updated = { ...item, [field]: value };
        if (field === 'articleId') {
          const article = articles.find(a => a.id === value);
          if (article) {
            updated.name = article.name;
            updated.price = article.price;
            updated.unit = article.unit;
            updated.vatRate = article.vatRate;
          }
        }
        updated.total = updated.quantity * updated.price;
        return updated;
      }
      return item;
    }));
  };

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vatAmount = items.reduce((sum, item) => sum + (item.total * item.vatRate / 100), 0);
  const total = subtotal + vatAmount;

  const handleSave = (send: boolean = false) => {
    if (!selectedClient) {
      toast({
        title: "Greška",
        description: "Molimo izaberite klijenta",
        variant: "destructive"
      });
      return;
    }
    if (items.length === 0) {
      toast({
        title: "Greška",
        description: "Dodajte bar jednu stavku",
        variant: "destructive"
      });
      return;
    }

    toast({
      title: send ? "Faktura poslata" : "Faktura sačuvana",
      description: send ? "Faktura je uspešno kreirana i poslata klijentu" : "Faktura je sačuvana kao nacrt"
    });
    navigate('/invoices');
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kreiraj račun</h1>
          <p className="text-muted-foreground">Kreiranje nove fakture</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => handleSave(false)}>
            <Save className="mr-2 h-4 w-4" />
            Sačuvaj nacrt
          </Button>
          <Button onClick={() => handleSave(true)}>
            <Send className="mr-2 h-4 w-4" />
            Sačuvaj i pošalji
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Podaci o klijentu</CardTitle>
            <CardDescription>Izaberite klijenta za fakturu</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label>Klijent</Label>
              <Select value={selectedClient} onValueChange={setSelectedClient}>
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
            {selectedClient && (
              <div className="p-4 bg-muted rounded-lg space-y-1">
                {(() => {
                  const client = clients.find(c => c.id === selectedClient);
                  if (!client) return null;
                  return (
                    <>
                      <p className="font-medium">{client.name}</p>
                      <p className="text-sm text-muted-foreground">{client.address}, {client.city}</p>
                      <p className="text-sm text-muted-foreground">PIB: {client.pib}</p>
                      <p className="text-sm text-muted-foreground">MB: {client.maticniBroj}</p>
                    </>
                  );
                })()}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Podaci o fakturi</CardTitle>
            <CardDescription>Datumi i napomene</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Datum fakture</Label>
                <Input
                  type="date"
                  value={invoiceDate}
                  onChange={(e) => setInvoiceDate(e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <Label>Rok plaćanja</Label>
                <Input
                  type="date"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label>Napomena</Label>
              <Textarea
                placeholder="Dodatne napomene..."
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>Stavke fakture</CardTitle>
            <CardDescription>Dodajte proizvode ili usluge</CardDescription>
          </div>
          <Button onClick={addItem}>
            <Plus className="mr-2 h-4 w-4" />
            Dodaj stavku
          </Button>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[300px]">Artikal</TableHead>
                <TableHead>Količina</TableHead>
                <TableHead>Jedinica</TableHead>
                <TableHead>Cena</TableHead>
                <TableHead>PDV %</TableHead>
                <TableHead className="text-right">Ukupno</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center text-muted-foreground py-8">
                    Nema stavki. Kliknite "Dodaj stavku" da dodate artikle.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>
                      <Select
                        value={item.articleId}
                        onValueChange={(value) => updateItem(item.id, 'articleId', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Izaberite artikal" />
                        </SelectTrigger>
                        <SelectContent>
                          {articles.map((article) => (
                            <SelectItem key={article.id} value={article.id}>
                              {article.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, 'quantity', parseInt(e.target.value) || 0)}
                        className="w-20"
                      />
                    </TableCell>
                    <TableCell>{item.unit}</TableCell>
                    <TableCell>
                      <Input
                        type="number"
                        value={item.price}
                        onChange={(e) => updateItem(item.id, 'price', parseFloat(e.target.value) || 0)}
                        className="w-28"
                      />
                    </TableCell>
                    <TableCell>{item.vatRate}%</TableCell>
                    <TableCell className="text-right font-medium">
                      {formatCurrency(item.total)}
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => removeItem(item.id)}
                      >
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
            {items.length > 0 && (
              <TableFooter>
                <TableRow>
                  <TableCell colSpan={5} className="text-right">Osnovica:</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(subtotal)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right">PDV:</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(vatAmount)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
                <TableRow>
                  <TableCell colSpan={5} className="text-right font-bold">UKUPNO:</TableCell>
                  <TableCell className="text-right font-bold text-lg">{formatCurrency(total)}</TableCell>
                  <TableCell></TableCell>
                </TableRow>
              </TableFooter>
            )}
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default CreateInvoice;
