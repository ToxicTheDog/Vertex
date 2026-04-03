import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingDown, Receipt, Calculator, Trash2, Eye, Edit, FileText } from 'lucide-react';
import { toast } from 'sonner';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { API_ENDPOINTS } from '@/config/api';
import { vatReductionApi } from '@/services/apiService';

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

const initialPurchases: VatPurchase[] = [
  { id: '1', date: '2024-03-15', supplierName: 'Office Supplies d.o.o.', invoiceNumber: 'F-2024-0123', description: 'Kancelarijski materijal - papir, toneri', category: 'kancelarijski_materijal', netAmount: 45000, vatAmount: 9000, totalAmount: 54000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
  { id: '2', date: '2024-03-14', supplierName: 'IT Distribucija d.o.o.', invoiceNumber: 'R-2024-0456', description: 'Laptop za kancelariju', category: 'oprema', netAmount: 120000, vatAmount: 24000, totalAmount: 144000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
  { id: '3', date: '2024-03-12', supplierName: 'NIS Petrol', invoiceNumber: 'FR-123456', description: 'Gorivo za službeno vozilo', category: 'gorivo', netAmount: 15000, vatAmount: 3000, totalAmount: 18000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
  { id: '4', date: '2024-03-10', supplierName: 'Restoran Moskva', invoiceNumber: 'R-789', description: 'Poslovni ručak sa klijentom', category: 'reprezentacija', netAmount: 8000, vatAmount: 800, totalAmount: 8800, vatRate: 10, isDeductible: true, deductiblePercent: 50 },
  { id: '5', date: '2024-03-08', supplierName: 'Advokatska kancelarija Petrović', invoiceNumber: 'FAK-2024-055', description: 'Pravne usluge', category: 'usluge', netAmount: 50000, vatAmount: 10000, totalAmount: 60000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
  { id: '6', date: '2024-03-05', supplierName: 'Telefonija d.o.o.', invoiceNumber: 'TEL-2024-03', description: 'Mobilni telefoni za zaposlene', category: 'oprema', netAmount: 85000, vatAmount: 17000, totalAmount: 102000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
  { id: '7', date: '2024-03-01', supplierName: 'EPS Snabdevanje', invoiceNumber: 'EPS-03-2024', description: 'Električna energija za poslovni prostor', category: 'usluge', netAmount: 35000, vatAmount: 7000, totalAmount: 42000, vatRate: 20, isDeductible: true, deductiblePercent: 100 },
];

const formatCurrency = (value: number) => {
  return new Intl.NumberFormat('sr-RS', {
    style: 'currency',
    currency: 'RSD',
    minimumFractionDigits: 0
  }).format(value);
};

const VatReduction = () => {
  const [purchases, setPurchases] = useState<VatPurchase[]>(initialPurchases);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPurchase, setSelectedPurchase] = useState<VatPurchase | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  
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

  // Izračunavanje statistike
  const totalNetAmount = purchases.reduce((sum, p) => sum + p.netAmount, 0);
  const totalVatAmount = purchases.reduce((sum, p) => sum + p.vatAmount, 0);
  const totalDeductibleVat = purchases.reduce((sum, p) => sum + (p.vatAmount * p.deductiblePercent / 100), 0);
  const nonDeductibleVat = totalVatAmount - totalDeductibleVat;

  // Podaci za grafike
  const categoryData = Object.keys(categoryLabels).map(cat => {
    const categoryPurchases = purchases.filter(p => p.category === cat);
    const total = categoryPurchases.reduce((sum, p) => sum + p.vatAmount * p.deductiblePercent / 100, 0);
    return {
      name: categoryLabels[cat],
      value: total,
      color: categoryColors[cat],
    };
  }).filter(d => d.value > 0);

  const monthlyData = [
    { month: 'Jan', odbijenPdv: 45000, ukupnoPdv: 52000 },
    { month: 'Feb', odbijenPdv: 62000, ukupnoPdv: 70000 },
    { month: 'Mar', odbijenPdv: totalDeductibleVat, ukupnoPdv: totalVatAmount },
  ];

  const handleSubmit = () => {
    const netAmount = parseFloat(formData.netAmount);
    const vatRate = parseFloat(formData.vatRate);
    const vatAmount = netAmount * (vatRate / 100);
    const totalAmount = netAmount + vatAmount;
    const deductiblePercent = parseFloat(formData.deductiblePercent);

    const newPurchase: VatPurchase = {
      id: isEditing && selectedPurchase ? selectedPurchase.id : Date.now().toString(),
      date: formData.date,
      supplierName: formData.supplierName,
      invoiceNumber: formData.invoiceNumber,
      description: formData.description,
      category: formData.category,
      netAmount,
      vatAmount,
      totalAmount,
      vatRate,
      isDeductible: true,
      deductiblePercent,
    };

    if (isEditing && selectedPurchase) {
      setPurchases(purchases.map(p => p.id === selectedPurchase.id ? newPurchase : p));
      toast.success('Kupovina je uspešno izmenjena');
    } else {
      setPurchases([newPurchase, ...purchases]);
      toast.success('Kupovina je uspešno dodana');
    }

    setDialogOpen(false);
    resetForm();
  };

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
    setIsEditing(false);
    setSelectedPurchase(null);
  };

  const handleEdit = (purchase: VatPurchase) => {
    setSelectedPurchase(purchase);
    setFormData({
      date: purchase.date,
      supplierName: purchase.supplierName,
      invoiceNumber: purchase.invoiceNumber,
      description: purchase.description,
      category: purchase.category,
      netAmount: purchase.netAmount.toString(),
      vatRate: purchase.vatRate.toString(),
      deductiblePercent: purchase.deductiblePercent.toString(),
    });
    setIsEditing(true);
    setDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    setPurchases(purchases.filter(p => p.id !== id));
    toast.success('Kupovina je obrisana');
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
          <p className="text-muted-foreground">Kupovine na račun firme za smanjenje PDV obaveze</p>
        </div>
        <Button onClick={() => { resetForm(); setDialogOpen(true); }}>
          <Plus className="mr-2 h-4 w-4" />
          Nova kupovina
        </Button>
      </div>

      {/* KPI kartice */}
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
            <CardTitle className="text-sm font-medium">Neodbiv PDV</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-warning">{formatCurrency(nonDeductibleVat)}</div>
            <p className="text-xs text-muted-foreground mt-1">Reprezentacija i sl.</p>
          </CardContent>
        </Card>
      </div>

      {/* Grafici */}
      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Odbijeni PDV po kategorijama</CardTitle>
            <CardDescription>Struktura odbitka pretporeza</CardDescription>
          </CardHeader>
          <CardContent>
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
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Mesečni pregled PDV-a</CardTitle>
            <CardDescription>Ukupan vs odbijeni PDV</CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={monthlyData}>
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" />
                <XAxis dataKey="month" stroke="hsl(var(--muted-foreground))" />
                <YAxis stroke="hsl(var(--muted-foreground))" tickFormatter={(v) => `${v/1000}k`} />
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
          </CardContent>
        </Card>
      </div>

      {/* Tabela kupovina */}
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
                <TableHead>Dobavljač</TableHead>
                <TableHead>Broj računa</TableHead>
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
                  <TableCell>{new Date(purchase.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="font-medium">{purchase.supplierName}</TableCell>
                  <TableCell>{purchase.invoiceNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{categoryLabels[purchase.category]}</Badge>
                  </TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.netAmount)}</TableCell>
                  <TableCell className="text-right">{formatCurrency(purchase.vatAmount)}</TableCell>
                  <TableCell className="text-right">{purchase.deductiblePercent}%</TableCell>
                  <TableCell className="text-right text-success font-medium">
                    {formatCurrency(purchase.vatAmount * purchase.deductiblePercent / 100)}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleView(purchase)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleEdit(purchase)}>
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => handleDelete(purchase.id)}>
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

      {/* Dialog za novu/izmenu kupovine */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>{isEditing ? 'Izmena kupovine' : 'Nova kupovina'}</DialogTitle>
            <DialogDescription>
              Unesite podatke o kupovini za smanjenje PDV obaveze
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="date">Datum</Label>
                <Input
                  id="date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({...formData, date: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="invoiceNumber">Broj računa</Label>
                <Input
                  id="invoiceNumber"
                  value={formData.invoiceNumber}
                  onChange={(e) => setFormData({...formData, invoiceNumber: e.target.value})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="supplierName">Dobavljač</Label>
              <Input
                id="supplierName"
                value={formData.supplierName}
                onChange={(e) => setFormData({...formData, supplierName: e.target.value})}
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
              <Label>Kategorija</Label>
              <Select value={formData.category} onValueChange={(v: VatPurchase['category']) => setFormData({...formData, category: v})}>
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
                <Label htmlFor="netAmount">Neto iznos (RSD)</Label>
                <Input
                  id="netAmount"
                  type="number"
                  value={formData.netAmount}
                  onChange={(e) => setFormData({...formData, netAmount: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>PDV stopa</Label>
                <Select value={formData.vatRate} onValueChange={(v) => setFormData({...formData, vatRate: v})}>
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
                <Select value={formData.deductiblePercent} onValueChange={(v) => setFormData({...formData, deductiblePercent: v})}>
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
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Otkaži</Button>
            <Button onClick={handleSubmit}>{isEditing ? 'Sačuvaj' : 'Dodaj'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Dialog za pregled */}
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
                  <p className="font-medium">{new Date(selectedPurchase.date).toLocaleDateString('sr-RS')}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Broj računa</Label>
                  <p className="font-medium">{selectedPurchase.invoiceNumber}</p>
                </div>
              </div>
              <div>
                <Label className="text-muted-foreground">Dobavljač</Label>
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
                  <p className="font-medium">{formatCurrency(selectedPurchase.netAmount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">PDV ({selectedPurchase.vatRate}%)</Label>
                  <p className="font-medium">{formatCurrency(selectedPurchase.vatAmount)}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">Ukupno</Label>
                  <p className="font-medium">{formatCurrency(selectedPurchase.totalAmount)}</p>
                </div>
              </div>
              <div className="pt-4 border-t bg-success/10 p-4 rounded-lg">
                <div className="flex justify-between items-center">
                  <div>
                    <Label className="text-muted-foreground">Odbijeni PDV ({selectedPurchase.deductiblePercent}%)</Label>
                    <p className="text-2xl font-bold text-success">
                      {formatCurrency(selectedPurchase.vatAmount * selectedPurchase.deductiblePercent / 100)}
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
