import { useMemo, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingDown, Receipt, Calculator, Eye, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { DatePickerField } from '@/components/shared/DatePickerField';
import { vatReductionApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

interface VatPurchase {
  id: string;
  date: string;
  supplierName: string;
  invoiceNumber: string;
  description: string;
  category: 'kancelarijski_materijal' | 'oprema' | 'gorivo' | 'reprezentacija' | 'usluge' | 'ostalo';
  netAmount: number;
  vatAmount: number;
  totalAmount: number;
  vatRate: number;
  isDeductible: boolean;
  deductiblePercent: number;
}

const categoryLabels: Record<string, string> = {
  kancelarijski_materijal: 'Kancelarijski materijal',
  oprema: 'Oprema i sredstva',
  gorivo: 'Gorivo',
  reprezentacija: 'Reprezentacija',
  usluge: 'Poslovne usluge',
  ostalo: 'Ostalo',
};

const categoryColors: Record<string, string> = {
  kancelarijski_materijal: 'hsl(var(--chart-1))',
  oprema: 'hsl(var(--chart-2))',
  gorivo: 'hsl(var(--chart-3))',
  reprezentacija: 'hsl(var(--chart-4))',
  usluge: 'hsl(var(--chart-5))',
  ostalo: 'hsl(var(--muted-foreground))',
};

const formatCurrency = (value: number) => new Intl.NumberFormat('sr-RS', {
  style: 'currency',
  currency: 'RSD',
  minimumFractionDigits: 0
}).format(value);

const formatDate = (value?: string) => {
  if (!value) {
    return '-';
  }

  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '-' : date.toLocaleDateString('sr-RS');
};

const createMonthBuckets = () => {
  const formatter = new Intl.DateTimeFormat('sr-RS', { month: 'short' });

  return Array.from({ length: 6 }, (_, index) => {
    const date = new Date();
    date.setDate(1);
    date.setMonth(date.getMonth() - (5 - index));

    return {
      key: `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`,
      month: formatter.format(date),
      odbijenPdv: 0,
      ukupnoPdv: 0,
    };
  });
};

const EmptyChartState = ({ message }: { message: string }) => (
  <div className="flex h-[300px] items-center justify-center text-sm text-muted-foreground">
    {message}
  </div>
);

const VatReduction = () => {
  const { data: purchases, refetch } = useFetchData<VatPurchase[]>(() => vatReductionApi.getAll(), []);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<VatPurchase | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [formData, setFormData] = useState({
    date: '',
    supplierName: '',
    invoiceNumber: '',
    description: '',
    category: 'ostalo' as VatPurchase['category'],
    netAmount: '',
    vatRate: '20',
    deductiblePercent: '100',
  });

  const totalNetAmount = purchases.reduce((sum, purchase) => sum + (Number(purchase.netAmount) || 0), 0);
  const totalVatAmount = purchases.reduce((sum, purchase) => sum + (Number(purchase.vatAmount) || 0), 0);
  const totalDeductibleVat = purchases.reduce((sum, purchase) => sum + ((Number(purchase.vatAmount) || 0) * (Number(purchase.deductiblePercent) || 0) / 100), 0);
  const nonDeductibleVat = totalVatAmount - totalDeductibleVat;

  const categoryData = Object.keys(categoryLabels).map((category) => {
    const total = purchases
      .filter((purchase) => purchase.category === category)
      .reduce((sum, purchase) => sum + ((Number(purchase.vatAmount) || 0) * (Number(purchase.deductiblePercent) || 0) / 100), 0);

    return {
      name: categoryLabels[category],
      value: total,
      color: categoryColors[category],
    };
  }).filter((entry) => entry.value > 0);

  const monthlyData = useMemo(() => {
    const buckets = createMonthBuckets();
    const map = new Map(buckets.map((bucket) => [bucket.key, bucket]));

    purchases.forEach((purchase) => {
      if (!purchase.date) {
        return;
      }

      const key = String(purchase.date).slice(0, 7);
      const bucket = map.get(key);
      if (!bucket) {
        return;
      }

      bucket.ukupnoPdv += Number(purchase.vatAmount) || 0;
      bucket.odbijenPdv += ((Number(purchase.vatAmount) || 0) * (Number(purchase.deductiblePercent) || 0)) / 100;
    });

    return buckets;
  }, [purchases]);

  const resetForm = () => {
    setFormData({
      date: '',
      supplierName: '',
      invoiceNumber: '',
      description: '',
      category: 'ostalo',
      netAmount: '',
      vatRate: '20',
      deductiblePercent: '100',
    });
  };

  const handleSubmit = async () => {
    if (!formData.date || !formData.supplierName || !formData.invoiceNumber || !formData.netAmount) {
      toast.error('Datum, dobavljac, broj racuna i neto iznos su obavezni.');
      return;
    }

    setIsSubmitting(true);

    const netAmount = parseFloat(formData.netAmount) || 0;
    const vatRate = parseFloat(formData.vatRate) || 0;
    const vatAmount = netAmount * (vatRate / 100);
    const totalAmount = netAmount + vatAmount;
    const deductiblePercent = parseFloat(formData.deductiblePercent) || 0;

    const response = await vatReductionApi.create({
      date: formData.date,
      supplierName: formData.supplierName,
      invoiceNumber: formData.invoiceNumber,
      description: formData.description,
      category: formData.category,
      netAmount,
      vatAmount,
      totalAmount,
      vatRate,
      isDeductible: deductiblePercent > 0,
      deductiblePercent,
    });

    setIsSubmitting(false);

    if (!response.success) {
      toast.error(response.message || 'Kupovina nije sacuvana.');
      return;
    }

    toast.success('Kupovina je uspesno sacuvana.');
    setDialogOpen(false);
    resetForm();
    refetch();
  };

  const handleView = (purchase: VatPurchase) => {
    setSelectedPurchase(purchase);
    setViewDialogOpen(true);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Smanjenje PDV-a</h1>
          <p className="text-muted-foreground">Kupovine na racun firme za smanjenje PDV obaveze</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova kupovina
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupna vrednost kupovina</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalNetAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Neto vrednost bez PDV-a</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Ukupan PDV</CardTitle>
            <Calculator className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalVatAmount)}</div>
            <p className="text-xs text-muted-foreground mt-1">Na svim kupovinama</p>
          </CardContent>
        </Card>
        <Card className="border-success/50 bg-success/5">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Odbijeni PDV</CardTitle>
            <TrendingDown className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalDeductibleVat)}</div>
            <p className="text-xs text-muted-foreground mt-1">Umanjenje PDV obaveze</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Neodbitni PDV</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(nonDeductibleVat)}</div>
            <p className="text-xs text-muted-foreground mt-1">Reprezentacija i slicno</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Odbijeni PDV po kategorijama</CardTitle>
            <CardDescription>Struktura odbitka pretporeza</CardDescription>
          </CardHeader>
          <CardContent>
            {categoryData.length === 0 ? (
              <EmptyChartState message="Nema kupovina za prikaz po kategorijama." />
            ) : (
              <>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={categoryData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={100}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {categoryData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip
                      contentStyle={{
                        backgroundColor: 'hsl(var(--popover))',
                        border: '1px solid hsl(var(--border))',
                        borderRadius: '8px'
                      }}
                      formatter={(value: number) => formatCurrency(value)}
                    />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap justify-center gap-4 mt-4">
                  {categoryData.map((entry, index) => (
                    <div key={index} className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                      <span className="text-sm text-muted-foreground">{entry.name}</span>
                    </div>
                  ))}
                </div>
              </>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mesecni pregled PDV-a</CardTitle>
            <CardDescription>Ukupan vs odbijeni PDV</CardDescription>
          </CardHeader>
          <CardContent>
            {monthlyData.every((entry) => entry.ukupnoPdv === 0 && entry.odbijenPdv === 0) ? (
              <EmptyChartState message="Nema mesecnih PDV podataka za prikaz." />
            ) : (
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                  <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                  <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(value) => `${value / 1000}k`} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: 'hsl(var(--popover))',
                      border: '1px solid hsl(var(--border))',
                      borderRadius: '8px'
                    }}
                    formatter={(value: number) => formatCurrency(value)}
                  />
                  <Legend />
                  <Bar dataKey="ukupnoPdv" name="Ukupan PDV" fill="hsl(var(--chart-1))" />
                  <Bar dataKey="odbijenPdv" name="Odbijeni PDV" fill="hsl(var(--chart-2))" />
                </BarChart>
              </ResponsiveContainer>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Evidencija kupovina</CardTitle>
          <CardDescription>Sve kupovine za smanjenje PDV obaveze</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Dobavljac</TableHead>
                <TableHead>Broj racuna</TableHead>
                <TableHead>Kategorija</TableHead>
                <TableHead className="text-right">Neto</TableHead>
                <TableHead className="text-right">PDV</TableHead>
                <TableHead className="text-right">Odbiv %</TableHead>
                <TableHead className="text-right">Odbijeno</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {purchases.map((purchase) => (
                <TableRow key={purchase.id}>
                  <TableCell>{formatDate(purchase.date)}</TableCell>
                  <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>{purchase.invoiceNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[purchase.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(purchase.netAmount) || 0)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(Number(purchase.vatAmount) || 0)}</TableCell>
                  <TableCell className="text-right">{Number(purchase.deductiblePercent) || 0}%</TableCell>
                  <TableCell className="text-right text-success font-medium">
                    {formatCurrency(((Number(purchase.vatAmount) || 0) * (Number(purchase.deductiblePercent) || 0)) / 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(purchase)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {purchases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={9} className="py-10 text-center text-muted-foreground">
                    Nema kupovina za prikaz.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Nova kupovina</DialogTitle>
            <DialogDescription>Unesite podatke o kupovini za smanjenje PDV obaveze</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <DatePickerField value={formData.date} onChange={(value) => setFormData({ ...formData, date: value })} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Broj racuna</Label>
                <Input id="invoiceNumber" value={formData.invoiceNumber} onChange={(event) => setFormData({ ...formData, invoiceNumber: event.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierName">Dobavljac</Label>
              <Input id="supplierName" value={formData.supplierName} onChange={(event) => setFormData({ ...formData, supplierName: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="description">Opis</Label>
              <Input id="description" value={formData.description} onChange={(event) => setFormData({ ...formData, description: event.target.value })} />
            </div>
            <div className="space-y-2">
              <Label>Kategorija</Label>
              <Select value={formData.category} onValueChange={(value: VatPurchase['category']) => setFormData({ ...formData, category: value })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(categoryLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label htmlFor="netAmount">Neto iznos</Label>
                <Input id="netAmount" type="number" value={formData.netAmount} onChange={(event) => setFormData({ ...formData, netAmount: event.target.value })} />
              </div>
              <div className="space-y-2">
                <Label>PDV stopa</Label>
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
              <div className="space-y-2">
                <Label>Odbiv %</Label>
                <Select value={formData.deductiblePercent} onValueChange={(value) => setFormData({ ...formData, deductiblePercent: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="100">100%</SelectItem>
                    <SelectItem value="50">50%</SelectItem>
                    <SelectItem value="0">0%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkazi</Button>
            <Button onClick={handleSubmit} disabled={isSubmitting}>
              {isSubmitting ? 'Cuvanje...' : 'Dodaj'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={viewDialogOpen} onOpenChange={setViewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalji kupovine</DialogTitle>
          </DialogHeader>
          {selectedPurchase && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">Datum</Label>
                  <p className="font-medium">{formatDate(selectedPurchase.date)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Broj racuna</Label>
                  <p className="font-medium">{selectedPurchase.invoiceNumber}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Dobavljac</Label>
                <p className="font-medium">{selectedPurchase.supplierName}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Opis</Label>
                <p className="font-medium">{selectedPurchase.description}</p>
              </div>
              <div>
                <Label className="text-muted-foreground">Kategorija</Label>
                <p><Badge variant="outline">{categoryLabels[selectedPurchase.category]}</Badge></p>
              </div>
              <div className="grid grid-cols-3 gap-4 pt-4 border-t">
                <div>
                  <Label className="text-muted-foreground">Neto iznos</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedPurchase.netAmount) || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PDV ({Number(selectedPurchase.vatRate) || 0}%)</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedPurchase.vatAmount) || 0)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ukupno</Label>
                  <p className="font-medium">{formatCurrency(Number(selectedPurchase.totalAmount) || 0)}</p>
                </div>
              </div>
              <div className="pt-4 border-t bg-success/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-muted-foreground">Odbijeni PDV ({Number(selectedPurchase.deductiblePercent) || 0}%)</Label>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(((Number(selectedPurchase.vatAmount) || 0) * (Number(selectedPurchase.deductiblePercent) || 0)) / 100)}
                    </p>
                  </div>
                  <TrendingDown className="h-8 w-8 text-success" />
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default VatReduction;
