import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { demoClients } from '@/data/demoData';

export interface RecurringInvoiceFormData {
  id?: string;
  clientId: string;
  clientName: string;
  articleDescription: string;
  amount: number;
  frequency: 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  nextDate: string;
  isActive: boolean;
}

interface RecurringInvoiceDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  invoice?: RecurringInvoiceFormData | null;
  onSave: (data: RecurringInvoiceFormData) => void;
  mode: 'create' | 'edit';
}

const emptyInvoice: RecurringInvoiceFormData = {
  clientId: '',
  clientName: '',
  articleDescription: '',
  amount: 0,
  frequency: 'monthly',
  nextDate: new Date().toISOString().split('T')[0],
  isActive: true
};

const frequencyLabels = {
  weekly: 'Nedeljno',
  monthly: 'Mesečno',
  quarterly: 'Kvartalno',
  yearly: 'Godišnje'
};

export const RecurringInvoiceDialog = ({ open, onOpenChange, invoice, onSave, mode }: RecurringInvoiceDialogProps) => {
  const [formData, setFormData] = useState<RecurringInvoiceFormData>(emptyInvoice);

  useEffect(() => {
    if (invoice) {
      setFormData(invoice);
    } else {
      setFormData(emptyInvoice);
    }
  }, [invoice, open]);

  const handleClientChange = (clientId: string) => {
    const client = demoClients.find(c => c.id === clientId);
    setFormData({
      ...formData,
      clientId,
      clientName: client?.name || ''
    });
  };

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const title = mode === 'create' ? 'Nova automatska faktura' : 'Izmena automatske fakture';

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' 
              ? 'Podesite automatsku fakturisu koja će se generisati po rasporedu'
              : 'Izmenite podešavanja automatske fakture'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="client">Klijent</Label>
            <Select value={formData.clientId} onValueChange={handleClientChange}>
              <SelectTrigger>
                <SelectValue placeholder="Izaberite klijenta" />
              </SelectTrigger>
              <SelectContent>
                {demoClients.map(client => (
                  <SelectItem key={client.id} value={client.id}>{client.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="description">Opis usluge/proizvoda</Label>
            <Input
              id="description"
              value={formData.articleDescription}
              onChange={(e) => setFormData({ ...formData, articleDescription: e.target.value })}
              placeholder="Mesečna pretplata na usluge..."
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="amount">Iznos (RSD)</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                placeholder="0"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="frequency">Učestalost</Label>
              <Select
                value={formData.frequency}
                onValueChange={(v) => setFormData({ ...formData, frequency: v as RecurringInvoiceFormData['frequency'] })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(frequencyLabels).map(([value, label]) => (
                    <SelectItem key={value} value={value}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="nextDate">Sledeći datum generisanja</Label>
            <Input
              id="nextDate"
              type="date"
              value={formData.nextDate}
              onChange={(e) => setFormData({ ...formData, nextDate: e.target.value })}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Otkaži
          </Button>
          <Button onClick={handleSubmit} disabled={!formData.clientId || !formData.articleDescription}>
            {mode === 'create' ? 'Kreiraj' : 'Sačuvaj'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
