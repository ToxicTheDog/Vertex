import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from '@/components/ui/pagination';
import { Package, AlertTriangle, TrendingUp, Search } from 'lucide-react';
import { Link } from 'react-router-dom';
import { articlesApi, warehousesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';
import { demoWarehouses } from '@/data/demoData';

const PAGE_SIZE = 10;

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const Stock = () => {
  const [articles, setArticles] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(0);
  const { data: warehouses } = useFetchData(() => warehousesApi.getAll(), demoWarehouses);

  const fetchArticles = async (page = currentPage, search = searchTerm) => {
    const response = await articlesApi.getPage({
      page,
      pageSize: PAGE_SIZE,
      search,
    });

    setArticles(response.success ? response.data : []);
    setTotalItems(response.success ? response.total : 0);
    setTotalPages(response.success ? response.totalPages || 0 : 0);
  };

  useEffect(() => {
    fetchArticles(currentPage, searchTerm);
  }, [currentPage, searchTerm]);

  const lowStockItems = articles.filter((article) => Number(article.stock) <= Number(article.minStock));
  const totalStockValue = articles.reduce((sum, article) => sum + ((Number(article.stock) || 0) * (Number(article.price) || 0)), 0);
  const totalUnits = articles.reduce((sum, article) => sum + (Number(article.stock) || 0), 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Zalihe</h1>
          <p className="text-muted-foreground">Pregled stanja zaliha</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/articles">Artikli</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link to="/warehouses">Magacini</Link>
          </Button>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno artikala</p>
                <p className="text-2xl font-bold">{totalItems}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Jedinica na stranici</p>
                <p className="text-2xl font-bold">{totalUnits.toLocaleString('sr-RS')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vrednost na stranici</p>
                <p className="text-2xl font-bold">{formatCurrency(totalStockValue)}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-info" />
            </div>
          </CardContent>
        </Card>
        <Card className={lowStockItems.length > 0 ? 'border-warning' : ''}>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Niske zalihe na stranici</p>
                <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {lowStockItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Upozorenja za niske zalihe
            </CardTitle>
            <CardDescription>Artikli koji zahtevaju dopunu na trenutno prikazanoj strani</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((article) => (
                <div key={article.id} className="flex items-center justify-between rounded-lg border p-4">
                  <div>
                    <p className="font-medium">{article.name}</p>
                    <p className="text-sm text-muted-foreground">{article.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-warning">{article.stock} / {article.minStock}</p>
                    <p className="text-sm text-muted-foreground">Trenutno / Minimum</p>
                  </div>
                  <Button variant="outline" size="sm">Naruči</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-4 md:grid-cols-3">
        {warehouses.map((warehouse) => {
          const usagePercent = warehouse.capacity > 0 ? (warehouse.usedCapacity / warehouse.capacity) * 100 : 0;
          return (
            <Card key={warehouse.id}>
              <CardHeader>
                <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                <CardDescription>{warehouse.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="mb-2 flex justify-between text-sm">
                      <span>Iskorišćenost</span>
                      <span>{usagePercent.toFixed(0)}%</span>
                    </div>
                    <Progress value={usagePercent} className="h-2" />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kapacitet</span>
                    <span>{warehouse.usedCapacity} / {warehouse.capacity}</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div>
              <CardTitle>Stanje zaliha po artiklima</CardTitle>
              <CardDescription>Svi artikli sa trenutnim stanjem</CardDescription>
            </div>
            <div className="relative w-full md:w-72">
              <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži artikle..."
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
                <TableHead>Šifra</TableHead>
                <TableHead>Naziv</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead className="text-right">Zaliha</TableHead>
                <TableHead className="text-right">Min. zaliha</TableHead>
                <TableHead className="text-right">Cena</TableHead>
                <TableHead className="text-right">Vrednost</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {articles.map((article) => {
                const isLowStock = Number(article.stock) <= Number(article.minStock);
                const stockValue = (Number(article.stock) || 0) * (Number(article.price) || 0);
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono">{article.code}</TableCell>
                    <TableCell className="font-medium">{article.name}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell className="text-right">{article.stock} {article.unit}</TableCell>
                    <TableCell className="text-right">{article.minStock} {article.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(Number(article.price) || 0)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stockValue)}</TableCell>
                    <TableCell>
                      <Badge className={isLowStock ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}>
                        {isLowStock ? 'Niska zaliha' : 'OK'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {articles.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="py-10 text-center text-muted-foreground">
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

export default Stock;
