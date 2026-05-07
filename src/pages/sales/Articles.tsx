import { useEffect, useState } from 'react';
import { Plus, Search, MoreHorizontal, Edit, Trash2, AlertTriangle, Package } from 'lucide-react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { useToast } from '@/hooks/use-toast';
import { articlesApi, categoriesApi } from '@/services/apiService';

const PAGE_SIZE = 10;

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const emptyForm = {
  code: '',
  name: '',
  description: '',
  category: '',
  price: '',
  unit: 'kom',
  vatRate: '20',
  stock: '0',
  minStock: '0',
};

const Articles = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [selectedArticle, setSelectedArticle] = useState<any | null>(null);
  const [formData, setFormData] = useState(emptyForm);
  const { toast } = useToast();

  const fetchCategories = async () => {
    const response = await categoriesApi.getAll();
    if (response.success && response.data) {
      setCategories(response.data.map((category: any) => category.name));
    }
  };

  const fetchArticles = async (page = currentPage, search = searchTerm, category = categoryFilter) => {
    const response = await articlesApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      search,
      category: category === 'all' ? undefined : category,
    });

    setArticles(response.success ? response.data : []);
    setTotalItems(response.success ? response.total : 0);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  useEffect(() => {
    fetchArticles(currentPage, searchTerm, categoryFilter);
  }, [currentPage, searchTerm, categoryFilter]);

  const lowStockCount = articles.filter((article) => Number(article.stock) <= Number(article.minStock)).length;
  const totalValue = articles.reduce((sum, article) => sum + ((Number(article.stock) || 0) * (Number(article.price) || 0)), 0);

  const openCreateDialog = () => {
    setSelectedArticle(null);
    setFormData(emptyForm);
    setIsDialogOpen(true);
  };

  const openEditDialog = (article: any) => {
    setSelectedArticle(article);
    setFormData({
      code: article.code || '',
      name: article.name || '',
      description: article.description || '',
      category: article.category || '',
      price: String(article.price || ''),
      unit: article.unit || 'kom',
      vatRate: String(article.vatRate || 20),
      stock: String(article.stock || 0),
      minStock: String(article.minStock || 0),
    });
    setIsDialogOpen(true);
  };

  const handleSubmit = async () => {
    if (!formData.code || !formData.name) {
      toast({ title: 'Greška', description: 'Šifra i naziv su obavezni', variant: 'destructive' });
      return;
    }

    const payload = {
      ...formData,
      price: Number(formData.price) || 0,
      vatRate: Number(formData.vatRate) || 0,
      stock: Number(formData.stock) || 0,
      minStock: Number(formData.minStock) || 0,
    };

    const response = selectedArticle
      ? await articlesApi.update(selectedArticle.id, payload)
      : await articlesApi.create(payload);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Čuvanje nije uspelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Uspešno', description: selectedArticle ? 'Artikal je izmenjen' : 'Artikal je dodat' });
    setIsDialogOpen(false);
    fetchArticles(currentPage, searchTerm, categoryFilter);
    fetchCategories();
  };

  const handleDelete = async (article: any) => {
    const response = await articlesApi.delete(article.id);

    if (!response.success) {
      toast({ title: 'Greška', description: response.message || 'Brisanje nije uspelo', variant: 'destructive' });
      return;
    }

    toast({ title: 'Uspešno', description: 'Artikal je obrisan' });

    if (articles.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchArticles(currentPage, searchTerm, categoryFilter);
    }

    fetchCategories();
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Artikli</h1>
          <p className="text-muted-foreground">Katalog proizvoda i usluga</p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={openCreateDialog}>
              <Plus className="mr-2 h-4 w-4" />
              Novi artikal
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[500px]">
            <DialogHeader>
              <DialogTitle>{selectedArticle ? 'Izmeni artikal' : 'Dodaj novi artikal'}</DialogTitle>
              <DialogDescription>Unesite podatke o artiklu</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="code">Šifra</Label>
                  <Input id="code" value={formData.code} onChange={(event) => setFormData({ ...formData, code: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Kategorija</Label>
                  <Select value={formData.category} onValueChange={(value) => setFormData({ ...formData, category: value })}>
                    <SelectTrigger>
                      <SelectValue placeholder="Izaberite" />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((category) => (
                        <SelectItem key={category} value={category}>{category}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid gap-2">
                <Label htmlFor="name">Naziv</Label>
                <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="description">Opis</Label>
                <Input id="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="grid gap-2">
                  <Label htmlFor="price">Cena</Label>
                  <Input id="price" type="number" value={formData.price} onChange={(event) => setFormData({ ...formData, price: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label>Jedinica</Label>
                  <Select value={formData.unit} onValueChange={(value) => setFormData({ ...formData, unit: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Label>PDV (%)</Label>
                  <Select value={formData.vatRate} onValueChange={(value) => setFormData({ ...formData, vatRate: value })}>
                    <SelectTrigger>
                      <SelectValue />
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
                  <Input id="stock" type="number" value={formData.stock} onChange={(event) => setFormData({ ...formData, stock: event.target.value })} />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="minStock">Min. zaliha</Label>
                  <Input id="minStock" type="number" value={formData.minStock} onChange={(event) => setFormData({ ...formData, minStock: event.target.value })} />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Otkaži</Button>
              <Button onClick={handleSubmit}>Sačuvaj</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Package className="h-6 w-6 text-primary" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Ukupno artikala</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-warning/10 p-3">
                <AlertTriangle className="h-6 w-6 text-warning" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Niske zalihe na stranici</p>
                <p className="text-2xl font-bold text-warning">{lowStockCount}</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="rounded-full bg-success/10 p-3">
                <Package className="h-6 w-6 text-success" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Vrednost na stranici</p>
                <p className="text-2xl font-bold">{formatCurrency(totalValue)}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:justify-between">
            <div className="relative max-w-sm flex-1">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po nazivu ili šifri..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
            <Select value={categoryFilter} onValueChange={(value) => {
              setCategoryFilter(value);
              setCurrentPage(1);
            }}>
              <SelectTrigger className="w-[200px]">
                <SelectValue placeholder="Kategorija" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Sve kategorije</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>{category}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
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
              {articles.map((article) => (
                <TableRow key={article.id}>
                  <TableCell className="font-mono">{article.code}</TableCell>
                  <TableCell className="font-medium">{article.name}</TableCell>
                  <TableCell>{article.category}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(article.price) || 0)}</TableCell>
                  <TableCell className="text-center">{article.vatRate}%</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-2">
                      <span className={Number(article.stock) <= Number(article.minStock) ? 'font-medium text-destructive' : ''}>
                        {article.stock}
                      </span>
                      {Number(article.stock) <= Number(article.minStock) && <AlertTriangle className="h-4 w-4 text-warning" />}
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
                        <DropdownMenuItem onClick={() => openEditDialog(article)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Izmeni
                        </DropdownMenuItem>
                        <DropdownMenuItem className="text-destructive" onClick={() => handleDelete(article)}>
                          <Trash2 className="mr-2 h-4 w-4" />
                          Obriši
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
              {articles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} className="py-10 text-center text-muted-foreground">
                    Nema artikala za prikaz.
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
    </div>
  );
};

export default Articles;
