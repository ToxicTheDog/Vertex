import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Progress } from '@/components/ui/progress';
import { Package, AlertTriangle, TrendingUp, TrendingDown, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import { demoArticles, demoWarehouses } from '@/data/demoData';

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const Stock = () => {
  const articles = demoArticles;
  const warehouses = demoWarehouses;

  const lowStockItems = articles.filter(a => a.stock <= a.minStock);
  const totalStockValue = articles.reduce((sum, a) => sum + (a.stock * a.price), 0);
  const totalItems = articles.reduce((sum, a) => sum + a.stock, 0);

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

      {/* Statistika */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno artikala</p>
                <p className="text-2xl font-bold">{articles.length}</p>
              </div>
              <Package className="h-8 w-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Ukupno jedinica</p>
                <p className="text-2xl font-bold">{totalItems.toLocaleString('sr-RS')}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Vrednost zaliha</p>
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
                <p className="text-sm text-muted-foreground">Niske zalihe</p>
                <p className="text-2xl font-bold text-warning">{lowStockItems.length}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-warning" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Upozorenja za niske zalihe */}
      {lowStockItems.length > 0 && (
        <Card className="border-warning">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-warning">
              <AlertTriangle className="h-5 w-5" />
              Upozorenja za niske zalihe
            </CardTitle>
            <CardDescription>Artikli koji zahtevaju dopunu</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {lowStockItems.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <div>
                    <p className="font-medium">{article.name}</p>
                    <p className="text-sm text-muted-foreground">{article.code}</p>
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-warning">{article.stock} / {article.minStock}</p>
                    <p className="text-sm text-muted-foreground">Trenutno / Minimum</p>
                  </div>
                  <Button variant="outline" size="sm">
                    Naruči
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Magacini */}
      <div className="grid gap-4 md:grid-cols-3">
        {warehouses.map((warehouse) => {
          const usagePercent = (warehouse.usedCapacity / warehouse.capacity) * 100;
          return (
            <Card key={warehouse.id}>
              <CardHeader>
                <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                <CardDescription>{warehouse.address}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
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

      {/* Lista zaliha */}
      <Card>
        <CardHeader>
          <CardTitle>Stanje zaliha po artiklima</CardTitle>
          <CardDescription>Svi artikli sa trenutnim stanjem</CardDescription>
        </CardHeader>
        <CardContent>
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
                const isLowStock = article.stock <= article.minStock;
                const stockValue = article.stock * article.price;
                return (
                  <TableRow key={article.id}>
                    <TableCell className="font-mono">{article.code}</TableCell>
                    <TableCell className="font-medium">{article.name}</TableCell>
                    <TableCell>{article.category}</TableCell>
                    <TableCell className="text-right">{article.stock} {article.unit}</TableCell>
                    <TableCell className="text-right">{article.minStock} {article.unit}</TableCell>
                    <TableCell className="text-right">{formatCurrency(article.price)}</TableCell>
                    <TableCell className="text-right">{formatCurrency(stockValue)}</TableCell>
                    <TableCell>
                      <Badge className={isLowStock ? 'bg-warning text-warning-foreground' : 'bg-success text-success-foreground'}>
                        {isLowStock ? 'Niska zaliha' : 'OK'}
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
};

export default Stock;
