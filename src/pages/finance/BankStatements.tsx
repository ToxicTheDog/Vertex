import { useState } from 'react';
import { Building2, Search, Upload, Eye, Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { demoBankStatements } from '@/data/demoData';
import { BankStatementDialog, BankStatementData } from '@/components/dialogs/BankStatementDialog';
import { useToast } from '@/hooks/use-toast';
import { API_ENDPOINTS } from '@/config/api';
import { bankStatementsApi } from '@/services/apiService';
import { useFetchData } from '@/hooks/useFetchData';

const BankStatements = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const { data: statements, setData: setStatements, isLoading: _isLoading, refetch } = useFetchData(() => bankStatementsApi.getAll(), demoBankStatements);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [selectedStatement, setSelectedStatement] = useState<BankStatementData | null>(null);
  const { toast } = useToast();

  const filteredStatements = statements.filter(statement => {
    return statement.bankName.toLowerCase().includes(searchTerm.toLowerCase()) ||
           statement.accountNumber.includes(searchTerm);
  });

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  const handleView = (statement: typeof statements[0]) => {
    setSelectedStatement(statement);
    setDialogOpen(true);
  };

  const handleDownload = (statement: BankStatementData) => {
    toast({
      title: "Preuzimanje izvoda",
      description: `Izvod za ${new Date(statement.date).toLocaleDateString('sr-RS')} se preuzima...`
    });
  };

  const handleImport = () => {
    // Simulate import
    const newStatement = {
      id: `bs-${Date.now()}`,
      date: new Date().toISOString().split('T')[0],
      bankName: 'Banka Intesa',
      accountNumber: '160-1234567890123-45',
      openingBalance: statements[0]?.closingBalance || 0,
      closingBalance: (statements[0]?.closingBalance || 0) + 150000,
      totalIncome: 250000,
      totalExpense: 100000,
      transactionsCount: 12
    };
    setStatements([newStatement, ...statements]);
    toast({
      title: "Izvod uvezen",
      description: `Novi izvod banke za ${new Date().toLocaleDateString('sr-RS')} je uspešno uvezen.`
    });
  };

  const latestStatement = statements[0];
  const totalIncome = statements.reduce((sum, s) => sum + s.totalIncome, 0);
  const totalExpense = statements.reduce((sum, s) => sum + s.totalExpense, 0);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Izvodi banke</h1>
          <p className="text-muted-foreground">Import i pregled bankovnih izvoda</p>
        </div>
        <Button onClick={handleImport}>
          <Upload className="mr-2 h-4 w-4" />
          Uvezi izvod
        </Button>
      </div>

      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Trenutni saldo</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatCurrency(latestStatement?.closingBalance || 0)}</div>
            <p className="text-xs text-muted-foreground">na dan {new Date(latestStatement?.date || '').toLocaleDateString('sr-RS')}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni prilivi</CardTitle>
            <ArrowDownRight className="h-4 w-4 text-success" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-success">{formatCurrency(totalIncome)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Ukupni odlivi</CardTitle>
            <ArrowUpRight className="h-4 w-4 text-destructive" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-destructive">{formatCurrency(totalExpense)}</div>
            <p className="text-xs text-muted-foreground">za prikazani period</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Broj izvoda</CardTitle>
            <Building2 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{statements.length}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Izvodi banke</CardTitle>
          <CardDescription>Pregled svih uvezenih bankovnih izvoda</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4 mb-6">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Pretraži po banci ili broju računa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Datum</TableHead>
                <TableHead>Banka</TableHead>
                <TableHead>Broj računa</TableHead>
                <TableHead className="text-right">Početno stanje</TableHead>
                <TableHead className="text-right">Prilivi</TableHead>
                <TableHead className="text-right">Odlivi</TableHead>
                <TableHead className="text-right">Krajnje stanje</TableHead>
                <TableHead>Transakcije</TableHead>
                <TableHead className="text-right">Akcije</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredStatements.map((statement) => (
                <TableRow key={statement.id}>
                  <TableCell className="font-medium">{new Date(statement.date).toLocaleDateString('sr-RS')}</TableCell>
                  <TableCell>{statement.bankName}</TableCell>
                  <TableCell className="font-mono text-sm">{statement.accountNumber}</TableCell>
                  <TableCell className="text-right">{formatCurrency(statement.openingBalance)}</TableCell>
                  <TableCell className="text-right text-success">{formatCurrency(statement.totalIncome)}</TableCell>
                  <TableCell className="text-right text-destructive">{formatCurrency(statement.totalExpense)}</TableCell>
                  <TableCell className="text-right font-medium">{formatCurrency(statement.closingBalance)}</TableCell>
                  <TableCell>{statement.transactionsCount}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-1">
                      <Button variant="ghost" size="icon" title="Prikaži detalje" onClick={() => handleView(statement)}>
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" title="Preuzmi" onClick={() => handleDownload(statement)}>
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <BankStatementDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        statement={selectedStatement}
        onDownload={handleDownload}
      />
    </div>
  );
};

export default BankStatements;
