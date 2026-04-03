import { useState } from 'react';
import { Plus, Search, MoreHorizontal, Eye, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
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
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { demoArticles } from '@/data/demoData';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { articlesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const Articles = () => {
  const { data: articles } = useFetchData(() => articlesApi.getAll(), demoArticles);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const { toast } = useToast();

  const categories = [...new Set(articles.map(a => a.category))];

  const filteredArticles = articles.filter(article => {
    const matchesSearch = 
      article.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.code.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || article.category === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const handleAddArticle = () => {
    toast({
      title: "Artikal dodat",
      description: "Novi artikal je uspešno dodat u katalog"
    });
    setIsDialogOpen(false);
  };

  const lowStockCount = articles.filter(a => a.stock <= a.minStock).length;
  const totalValue = articles.reduce((sum, a) => sum + (a.stock * a.price), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artikli</h1>
          <p className="text-muted-foreground">Katalog proizvoda i usluga</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novi artikal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>Dodaj novi artikal</DialogTitle>
              <DialogDescription>
                Unesite podatke o novom artiklu
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Šifra</Label>
                  <Input id="code" placeholder="ART-001" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="category">Kategorija</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Naziv</Label>
                <Input id="name" placeholder="Naziv artikla" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Opis</Label>
                <Input id="description" placeholder="Kratak opis artikla" />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Cena (RSD)</Label>
                  <Input id="price" type="number" placeholder="1000" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="unit">Jedinica</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="kom">kom</SelectItem>
                      <SelectItem value="kg">kg</SelectItem>
                      <SelectItem value="l">l</SelectItem>
                      <SelectItem value="m">m</SelectItem>
                      <SelectItem value="sat">sat</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="vat">PDV (%)</Label>
                  <Select>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="20">20%</SelectItem>
                      <SelectItem value="10">10%</SelectItem>
                      <SelectItem value="0">0%</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="stock">Početna zaliha</Label>
                  <Input id="stock" type="number" placeholder="0" />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Min. zaliha</Label>
                  <Input id="minStock" type="number" placeholder="10" />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                Otkaži
              </Button>
              <Button onClick={handleAddArticle}>Sačuvaj</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-primary/10 rounded-full">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno artikala</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-warning/10 rounded-full">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Niske zalihe</p>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-success/10 rounded-full">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vrednost zaliha</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-4 justify-between">
            <div className="relative flex-1 max-w-sm">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po nazivu ili šifri..."
                className="pl-9"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
            <Select value={categoryFilter} onValueChange={setCategoryFilter}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map(cat => (
                  <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Šifra</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead className="text-right">Cena</TableHead>
                <TableHead className="text-center">PDV</TableHead>
                <TableHead className="text-center">Zaliha</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredArticles.map((article) => (
                <TableRow key={article.id} className="data-table-row">
                  <TableCell className="font-mono">{article.code}</TableCell>
                  <TableCell className="font-medium">{article.name}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(article.price)}</TableCell>
                  <TableCell className="text-center">{article.vatRate}%</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={article.stock <= article.minStock ? 'text-destructive font-medium' : ''}>
                        {article.stock}
                      </span>
                      {article.stock <= article.minStock && (
                        <AlertTriangle className="h-4 w-4 text-warning" />
                      )}
                    </div>
                  </TableCell>
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
                        <DropdownMenuItem>
                          <Eye className="mr-2 h-4 w-4" />
                          Detalji
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
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
        </CardContent>
      </Card>
    </div>
  );
};

export default Articles;
