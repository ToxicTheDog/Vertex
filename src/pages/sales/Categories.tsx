import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Plus, Folder, ChevronRight, Eye, Edit, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { demoCategories, Category } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { categoriesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const Categories = () => {
  const { data: categories, setData: setCategories, isLoading: _isLoading, refetch } = useFetchData(() => articlesApi.getAll(), demoCategories);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    parentId: '',
  });

  const handleSubmit = () => {
    const newCategory: Category = {
      id: isEditing && selectedCategory ? selectedCategory.id : Date.now().toString(),
      name: formData.name,
      description: formData.description,
      parentId: formData.parentId || undefined,
      articlesCount: isEditing && selectedCategory ? selectedCategory.articlesCount : 0,
    };

    if (isEditing && selectedCategory) {
      setCategories(categories.map(c => c.id === selectedCategory.id ? newCategory : c));
      toast.success('Kategorija je uspešno izmenjena');
    } else {
      setCategories([newCategory, ...categories]);
      toast.success('Kategorija je uspešno kreirana');
    }

    setDialogOpen(false);
    resetForm();
  };

  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      parentId: '',
    });
    setIsEditing(false);
    setSelectedCategory(null);
  };

  const handleEdit = (category: Category) => {
    setSelectedCategory(category);
    setFormData({
      name: category.name,
      description: category.description,
      parentId: category.parentId || '',
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setCategories(categories.filter(c => c.id !== id));
    toast.success('Kategorija je obrisana');
  };

  const handleView = (category: Category) => {
    setSelectedCategory(category);
    setViewDialogOpen(true);
  };

  const getParentName = (parentId?: string) => {
    if (!parentId) return null;
    const parent = categories.find(c => c.id === parentId);
    return parent?.name;
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

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno kategorija</p>
                <p className="text-2xl font-bold">{categories.length}</p>
              </div>
              <Folder className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Glavne kategorije</p>
                <p className="text-2xl font-bold">{categories.filter(c => !c.parentId).length}</p>
              </div>
              <Folder className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno artikala</p>
                <p className="text-2xl font-bold">{categories.reduce((sum, c) => sum + c.articlesCount, 0)}</p>
              </div>
              <div className="h-8 w-8 rounded-full bg-success/20 flex items-center justify-center text-success font-bold">
                📦
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Lista */}
      <Card>
        <CardHeader>
          <CardTitle>Lista kategorija</CardTitle>
          <CardDescription>Sve kategorije artikala</CardDescription>
        </CardHeader>
        <CardContent>
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
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(category.id)}>
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

      {/* Dialog za novu/izmenu kategorije */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena kategorije' : 'Nova kategorija'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o kategoriji
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Naziv kategorije</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Input
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="parentId">Roditeljska kategorija (opciono)</Label>
              <select
                id="parentId"
                value={formData.parentId}
                onChange={(e) => setFormData({...formData, parentId: e.target.value})}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background"
              >
                <option value="">Bez roditeljske kategorije</option>
                {categories.filter(c => !c.parentId && c.id !== selectedCategory?.id).map((cat) => (
                  <option key={cat.id} value={cat.id}>{cat.name}</option>
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

      {/* Dialog za pregled */}
      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji kategorije</DialogTitle>
          </DialogHeader>
          {selectedCategory && (
            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                  <Folder className="h-8 w-8 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold">{selectedCategory.name}</h3>
                  {selectedCategory.parentId && (
                    <p className="text-muted-foreground flex items-center gap-1">
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
