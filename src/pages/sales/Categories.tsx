import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Plus, Folder, ChevronRight, Eye, Edit, Trash2, Search } from 'lucide-react';
import { toast } from 'sonner';
import { Category } from '@/data/demoData';
import { categoriesApi } from '@/services/apiService';

const PAGE_SIZE = 10;

const Categories = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const fetchCategories = async (page = currentPage, search = searchTerm) => {
    const response = await categoriesApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      search,
    });

    setCategories(response.success ? response.data as Category[] : []);
    setTotalItems(response.success ? response.total : 0);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  useEffect(() => {
    fetchCategories(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const handleSubmit = async () => {
    if (!formData.name) {
      toast.error('Naziv kategorije je obavezan');
      return;
    }

    const payload = {
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId || null,
    };

    const response = isEditing && selectedCategory
      ? await categoriesApi.update(selectedCategory.id, payload)
      : await categoriesApi.create(payload);

    if (!response.success) {
      toast.error(response.message || 'Čuvanje nije uspelo');
      return;
    }

    toast.success(isEditing ? 'Kategorija je uspešno izmenjena' : 'Kategorija je uspešno kreirana');
    setDialogOpen(false);
    resetForm();
    fetchCategories(currentPage, searchTerm);
  };

  const resetForm = () => {
    setFormData({ name: '', description: '', parentId: '' });
    setIsEditing(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description || '',
      parentId: category.parentId || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = async (category: Category) => {
    const response = await categoriesApi.delete(category.id);

    if (!response.success) {
      toast.error(response.message || 'Brisanje nije uspelo');
      return;
    }

    toast.success('Kategorija je obrisana');

    if (categories.length === 1 && currentPage > 1) {
      setCurrentPage((page) => page - 1);
    } else {
      fetchCategories(currentPage, searchTerm);
    }
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setViewDialogOpen(true);
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = categories.find((category) => category.id === parentId);
    return parent?.name || 'Druga stranica';
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kategorije artikala</h1>
          <p className="text-muted-foreground">Upravljanje kategorijama</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova kategorija
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno kategorija</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Folder className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Glavne na stranici</p>
                <p className="text-2xl font-bold">{categories.filter((category) => !category.parentId).length}</p>
              </div>
              <Folder className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Artikli na stranici</p>
                <p className="text-2xl font-bold">{categories.reduce((sum, category) => sum + (category.articlesCount || 0), 0)}</p>
              </div>
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-success/20 text-sm font-bold text-success">PK</div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Lista kategorija</CardTitle>
              <CardDescription>Sve kategorije artikala</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži kategorije..."
                className="pl-9"
                value={searchTerm}
                onChange={(event) => {
                  setSearchTerm(event.target.value);
                  setCurrentPage(1);
                }}
              />
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Naziv</TableHead>
                <TableHead>Roditeljska kategorija</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead>Broj artikala</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {categories.map((category) => (
                <TableRow key={category.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Folder className="h-4 w-4 text-primary" />
                      {category.name}
                    </div>
                  </TableCell>
                  <TableCell>
                    {category.parentId ? (
                      <div className="flex items-center gap-1 text-muted-foreground">
                        <ChevronRight className="h-4 w-4" />
                        {getParentName(category.parentId)}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell>{category.description}</TableCell>
                  <TableCell>
                    <Badge variant="secondary">{category.articlesCount}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(category)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(category)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category)}>
                        <Trash2 className="h-4 w-4 text-destructive" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {categories.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-10 text-center text-muted-foreground">
                    Nema kategorija za prikaz.
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
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena kategorije' : 'Nova kategorija'}</DialogTitle>
            <DialogDescription>Unesite podatke o kategoriji</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv kategorije</Label>
              <Input id="name" value={formData.name} onChange={(event) => setFormData({ ...formData, name: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Input id="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Roditeljska kategorija (opciono)</Label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={(event) => setFormData({ ...formData, parentId: event.target.value })}
                className="h-10 w-full rounded-md border border-input bg-background px-3 py-2"
              >
                <option value="">Bez roditeljske kategorije</option>
                {categories.filter((category) => !category.parentId && category.id !== selectedCategory?.id).map((category) => (
                  <option key={category.id} value={category.id}>{category.name}</option>
                ))}
              </select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Kreiraj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji kategorije</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                  <Folder className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                  {selectedCategory.parentId && (
                    <p className="flex items-center gap-1 text-muted-foreground">
                      <ChevronRight className="h-4 w-4" />
                      {getParentName(selectedCategory.parentId)}
                    </p>
                  )}
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4 pt-4">
                <div>
                  <Label className="text-muted-foreground">Opis</Label>
                  <p className="font-medium">{selectedCategory.description}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Broj artikala</Label>
                  <p className="font-medium">{selectedCategory.articlesCount}</p>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Categories;
