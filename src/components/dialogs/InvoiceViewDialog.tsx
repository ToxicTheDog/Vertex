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
import { Download, Send, Printer } from 'lucide-react';

interface InvoiceItem {
  description: string;
  quantity: number;
  price: number;
  total: number;
}

export interface InvoiceData {
  id: string;
  number: string;
  clientName: string;
  clientAddress?: string;
  clientPib?: string;
  date: string;
  dueDate: string;
  status: 'draft' | 'sent' | 'paid' | 'overdue' | 'cancelled';
  total: number;
  items?: InvoiceItem[];
  notes?: string;
}

interface InvoiceViewDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice: InvoiceData | null;
  onSend?: (invoice: InvoiceData) => void;
  onDownload?: (invoice: InvoiceData) => void;
}

const statusColors: Record<string, string> = {
  paid: 'bg-success/20 text-success',
  sent: 'bg-primary/20 text-primary',
  overdue: 'bg-destructive/20 text-destructive',
  draft: 'bg-muted text-muted-foreground',
  cancelled: 'bg-muted text-muted-foreground'
};

const statusLabels: Record<string, string> = {
  paid: 'Plaćeno',
  sent: 'Poslato',
  overdue: 'Dospelo',
  draft: 'Nacrt',
  cancelled: 'Otkazano'
};

export const InvoiceViewDialog = ({ open, onOpenChange, invoice, onSend, onDownload }: InvoiceViewDialogProps) => {
  if (!invoice) return null;

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  // Mock items if not provided
  const items: InvoiceItem[] = invoice.items || [
    { description: 'Usluge konsaltinga', quantity: 10, price: 5000, total: 50000 },
    { description: 'Implementacija sistema', quantity: 1, price: invoice.total - 50000, total: invoice.total - 50000 }
  ];

  const subtotal = items.reduce((sum, item) => sum + item.total, 0);
  const vat = subtotal * 0.2;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle className="text-xl">Faktura {invoice.number}</DialogTitle>
              <DialogDescription>Pregled fakture</DialogDescription>
            </div>
            <Badge className={statusColors[invoice.status]}>
              {statusLabels[invoice.status]}
            </Badge>
          </div>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Header info */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <h4 className="font-semibold mb-2">Kupac</h4>
              <p className="font-medium">{invoice.clientName}</p>
              <p className="text-sm text-muted-foreground">{invoice.clientAddress || 'Adresa nije uneta'}</p>
              <p className="text-sm text-muted-foreground">PIB: {invoice.clientPib || 'N/A'}</p>
            </div>
            <div className="text-right">
              <div className="space-y-1">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Datum fakture:</span>
                  <span>{new Date(invoice.date).toLocaleDateString('sr-RS')}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rok plaćanja:</span>
                  <span>{new Date(invoice.dueDate).toLocaleDateString('sr-RS')}</span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Items table */}
          <div>
            <h4 className="font-semibold mb-3">Stavke</h4>
            <div className="border rounded-lg overflow-hidden">
              <table className="w-full">
                <thead className="bg-muted/50">
                  <tr>
                    <th className="text-left p-3 text-sm font-medium">Opis</th>
                    <th className="text-center p-3 text-sm font-medium">Količina</th>
                    <th className="text-right p-3 text-sm font-medium">Cena</th>
                    <th className="text-right p-3 text-sm font-medium">Ukupno</th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, index) => (
                    <tr key={index} className="border-t">
                      <td className="p-3">{item.description}</td>
                      <td className="p-3 text-center">{item.quantity}</td>
                      <td className="p-3 text-right">{formatCurrency(item.price)}</td>
                      <td className="p-3 text-right font-medium">{formatCurrency(item.total)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64 space-y-2">
              <div className="flex justify-between">
                <span className="text-muted-foreground">Osnovica:</span>
                <span>{formatCurrency(subtotal)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-muted-foreground">PDV (20%):</span>
                <span>{formatCurrency(vat)}</span>
              </div>
              <Separator />
              <div className="flex justify-between text-lg font-bold">
                <span>Ukupno:</span>
                <span>{formatCurrency(invoice.total)}</span>
              </div>
            </div>
          </div>

          {invoice.notes && (
            <>
              <Separator />
              <div>
                <h4 className="font-semibold mb-2">Napomene</h4>
                <p className="text-sm text-muted-foreground">{invoice.notes}</p>
              </div>
            </>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Zatvori
          </Button>
          <Button variant="outline" onClick={() => window.print()}>
            <Printer className="mr-2 h-4 w-4" />
            Štampaj
          </Button>
          {onDownload && (
            <Button variant="outline" onClick={() => onDownload(invoice)}>
              <Download className="mr-2 h-4 w-4" />
              PDF
            </Button>
          )}
          {onSend && invoice.status === 'draft' && (
            <Button onClick={() => onSend(invoice)}>
              <Send className="mr-2 h-4 w-4" />
              Pošalji
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
