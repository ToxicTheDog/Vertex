import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, ArrowUpRight, ArrowDownRight } from 'lucide-react';

interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  type: 'income' | 'expense';
}

export interface BankStatementData {
  id: string;
  date: string;
  bankName: string;
  accountNumber: string;
  openingBalance: number;
  closingBalance: number;
  totalIncome: number;
  totalExpense: number;
  transactionsCount: number;
}

interface BankStatementDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  statement: BankStatementData | null;
  onDownload?: (statement: BankStatementData) => void;
}

export const BankStatementDialog = ({ open, onOpenChange, statement, onDownload }: BankStatementDialogProps) => {
  if (!statement) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  // Mock transactions
  const transactions: Transaction[] = [
    { id: '1', date: statement.date, description: 'Uplata od klijenta - TechCorp d.o.o.', amount: statement.totalIncome * 0.4, type: 'income' },
    { id: '2', date: statement.date, description: 'Uplata od klijenta - Mega Store', amount: statement.totalIncome * 0.35, type: 'income' },
    { id: '3', date: statement.date, description: 'Ostale uplate', amount: statement.totalIncome * 0.25, type: 'income' },
    { id: '4', date: statement.date, description: 'Isplata dobavljaču - Delta Supply', amount: statement.totalExpense * 0.5, type: 'expense' },
    { id: '5', date: statement.date, description: 'Komunalne usluge', amount: statement.totalExpense * 0.2, type: 'expense' },
    { id: '6', date: statement.date, description: 'Bankarske provizije', amount: statement.totalExpense * 0.1, type: 'expense' },
    { id: '7', date: statement.date, description: 'Ostali troškovi', amount: statement.totalExpense * 0.2, type: 'expense' },
  ];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Izvod banke - {new Date(statement.date).toLocaleDateString('sr-RS')}</DialogTitle>
          <DialogDescription>{statement.bankName} - {statement.accountNumber}</DialogDescription>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-muted/50 rounded-lg">
              <p className="text-sm text-muted-foreground">Početno stanje</p>
              <p className="text-lg font-bold">{formatCurrency(statement.openingBalance)}</p>
            </div>
            <div className="p-4 bg-success/10 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowDownRight className="h-4 w-4 text-success" />
                <p className="text-sm text-muted-foreground">Prilivi</p>
              </div>
              <p className="text-lg font-bold text-success">{formatCurrency(statement.totalIncome)}</p>
            </div>
            <div className="p-4 bg-destructive/10 rounded-lg">
              <div className="flex items-center gap-2">
                <ArrowUpRight className="h-4 w-4 text-destructive" />
                <p className="text-sm text-muted-foreground">Odlivi</p>
              </div>
              <p className="text-lg font-bold text-destructive">{formatCurrency(statement.totalExpense)}</p>
            </div>
            <div className="p-4 bg-primary/10 rounded-lg">
              <p className="text-sm text-muted-foreground">Krajnje stanje</p>
              <p className="text-lg font-bold">{formatCurrency(statement.closingBalance)}</p>
            </div>
          </div>

          <Separator />

          {/* Transactions */}
          <div>
            <h4 className="font-semibold mb-3">Transakcije ({statement.transactionsCount})</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Datum</th>
                    <th className="text-left p-3 text-sm font-medium">Opis</th>
                    <th className="text-right p-3 text-sm font-medium">Iznos</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx) => (
                    <tr key={tx.id} className="border-t">
                      <td className="p-3 text-sm">{new Date(tx.date).toLocaleDateString('sr-RS')}</td>
                      <td className="p-3">{tx.description}</td>
                      <td className={`p-3 text-right font-medium ${tx.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                        {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
          {onDownload && (
            <Button onClick={() => onDownload(statement)}>
              <Download className="mr-2 h-4 w-4" />
              Preuzmi PDF
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
