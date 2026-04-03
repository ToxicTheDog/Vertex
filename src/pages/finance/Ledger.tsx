import { useState } from 'react';
import { BookOpen, Search, Filter, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { demoLedgerEntries } from '@/data/demoData';
import { useLocation } from 'react-router-dom';
import { API_ENDPOINTS } from '@/config/api';
import { invoicesApi } from '@/services/apiService';

const documentTypeLabels = {
  invoice: 'Faktura',
  receipt: 'Uplata',
  payment: 'Isplata'
};

const Ledger = () => {
  const location = useLocation();
  const isIncoming = location.pathname.includes('incoming');
  
  const [searchTerm, setSearchTerm] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');

  // Filter based on incoming/outgoing
  const ledgerEntries = demoLedgerEntries.filter(entry => {
    if (isIncoming) {
      return entry.credit > 0; // Ulazne - primljene fakture
    }
    return entry.debit > 0; // Izlazne - izdate fakture
  });

  const filteredEntries = ledgerEntries.filter(entry => {
    const matchesSearch = entry.partnerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         entry.documentNumber.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesType = typeFilter === 'all' || entry.documentType === typeFilter;
    return matchesSearch && matchesType;
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const totalDebit = filteredEntries.reduce((sum, e) => sum + e.debit, 0);
  const totalCredit = filteredEntries.reduce((sum, e) => sum + e.credit, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">
            {isIncoming ? 'Knjiga ulaznih faktura' : 'Knjiga izlaznih faktura'}
          </h1>
          <p className="text-muted-foreground">
            {isIncoming ? 'Evidencija primljenih računa (KUF)' : 'Evidencija izdatih računa (KIF)'}
          </p>
        </div>
        <Button>
          <Download className="mr-2 h-4 w-4" />
          Izvezi u Excel
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupno stavki</CardTitle>
            <BookOpen className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{filteredEntries.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Duguje</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalDebit)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Potražuje</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(totalCredit)}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Knjiga faktura</CardTitle>
          <CardDescription>Detaljan pregled svih stavki u knjizi</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po partneru ili broju dokumenta..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={typeFilter} onValueChange={setTypeFilter}>
              <SelectTrigger className="w-48">
                <Filter className="h-4 w-4 mr-2" />
                <SelectValue placeholder="Tip dokumenta" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Svi tipovi</SelectItem>
                <SelectItem value="invoice">Faktura</SelectItem>
                <SelectItem value="receipt">Uplata</SelectItem>
                <SelectItem value="payment">Isplata</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>R.br.</TableHead>
                <TableHead>Datum</TableHead>
                <TableHead>Broj dokumenta</TableHead>
                <TableHead>Tip</TableHead>
                <TableHead>Partner</TableHead>
                <TableHead>Opis</TableHead>
                <TableHead className="text-right">Duguje</TableHead>
                <TableHead className="text-right">Potražuje</TableHead>
                <TableHead className="text-right">Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry, index) => (
                <TableRow key={entry.id}>
                  <TableCell>{index + 1}</TableCell>
                  <TableCell>{new Date(entry.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell className="font-medium">{entry.documentNumber}</TableCell>
                  <TableCell>
                    <Badge variant="outline">{documentTypeLabels[entry.documentType]}</Badge>
                  </TableCell>
                  <TableCell>{entry.partnerName}</TableCell>
                  <TableCell className="max-w-[200px] truncate">{entry.description}</TableCell>
                  <TableCell className="text-right">
                    {entry.debit > 0 ? formatCurrency(entry.debit) : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    {entry.credit > 0 ? formatCurrency(entry.credit) : '-'}
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {formatCurrency(entry.balance)}
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

export default Ledger;
