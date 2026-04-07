import { Warehouse as WarehouseIcon, Package, ArrowUpDown, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { demoWarehouses, demoArticles } from '@/data/demoData';
import { API_ENDPOINTS } from '@/config/api';
import { warehousesApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const Warehouses = () => {
  const { data: warehouses } = useFetchData(() => warehousesApi.getAll(), demoWarehouses);
  const { data: allArticles } = useFetchData(() => warehousesApi.getAll(), demoArticles);
  const lowStockArticles = allArticles.filter(a => a.stock <= a.minStock);
  const lowStockItems = lowStockArticles.filter(a => a.stock <= a.minStock);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Magacini</h1>
          <p className="text-muted-foreground">Pregled lokacija skladištenja</p>
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        {warehouses.map((warehouse) => {
          const usagePercent = (warehouse.usedCapacity / warehouse.capacity) * 100;
          return (
            <Card key={warehouse.id} className="card-hover">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg">
                    <WarehouseIcon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{warehouse.name}</CardTitle>
                    <CardDescription>{warehouse.address}</CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-muted-foreground">Iskorišćenost</span>
                      <span className="font-medium">{usagePercent.toFixed(0)}%</span>
                    </div>
                    <Progress 
                      value={usagePercent} 
                      className={usagePercent > 80 ? 'bg-destructive/20' : ''} 
                    />
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Kapacitet</span>
                    <span>{warehouse.usedCapacity} / {warehouse.capacity} jedinica</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-warning" />
            Artikli sa niskim zalihama
          </CardTitle>
          <CardDescription>Proizvodi koji su ispod minimalne zalihe</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {lowStockItems.length === 0 ? (
              <p className="text-muted-foreground text-center py-4">Nema artikala sa niskim zalihama</p>
            ) : (
              lowStockItems.map((article) => (
                <div key={article.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Package className="h-4 w-4 text-muted-foreground" />
                    <div>
                      <p className="font-medium">{article.name}</p>
                      <p className="text-sm text-muted-foreground">{article.code}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="font-medium text-destructive">{article.stock} {article.unit}</p>
                    <p className="text-sm text-muted-foreground">Min: {article.minStock}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Warehouses;
