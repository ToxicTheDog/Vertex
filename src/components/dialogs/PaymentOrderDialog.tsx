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
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { DatePickerField } from '@/components/shared/DatePickerField';

export interface PaymentOrderFormData {
  id?: string;
  number: string;
  date: string;
  recipientName: string;
  recipientAccount: string;
  amount: number;
  purpose: string;
  referenceNumber?: string;
  status: 'pending' | 'approved' | 'executed' | 'rejected';
}

interface PaymentOrderDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  paymentOrder?: PaymentOrderFormData | null;
  onSave: (data: PaymentOrderFormData) => void;
  mode: 'create' | 'view';
}

const emptyPaymentOrder: PaymentOrderFormData = {
  number: '',
  date: new Date().toISOString().split('T')[0],
  recipientName: '',
  recipientAccount: '',
  amount: 0,
  purpose: '',
  referenceNumber: '',
  status: 'pending'
};

const statusColors: Record<string, string> = {
  pending: 'bg-warning/20 text-warning',
  approved: 'bg-primary/20 text-primary',
  executed: 'bg-success/20 text-success',
  rejected: 'bg-destructive/20 text-destructive'
};

const statusLabels: Record<string, string> = {
  pending: 'Na čekanju',
  approved: 'Odobren',
  executed: 'Izvršen',
  rejected: 'Odbijen'
};

export const PaymentOrderDialog = ({ open, onOpenChange, paymentOrder, onSave, mode }: PaymentOrderDialogProps) => {
  const [formData, setFormData] = useState<PaymentOrderFormData>(emptyPaymentOrder);

  useEffect(() => {
    if (paymentOrder) {
      setFormData(paymentOrder);
    } else {
      setFormData({
        ...emptyPaymentOrder,
        number: `NP-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 10000)).padStart(4, '0')}`
      });
    }
  }, [paymentOrder, open]);

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Novi nalog za plaćanje' : 'Pregled naloga';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[550px]">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <div>
              <DialogTitle>{title}</DialogTitle>
              <DialogDescription>
                {mode === 'create' ? 'Unesite podatke za novi nalog' : `Nalog ${formData.number}`}
              </DialogDescription>
            </div>
            {isViewMode && (
              <Badge className={statusColors[formData.status]}>
                {statusLabels[formData.status]}
              </Badge>
            )}
          </div>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="number">Broj naloga</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="date">Datum</Label>
              <DatePickerField
                value={formData.date}
                onChange={(value) => setFormData({ ...formData, date: value })}
                disabled={isViewMode}
              />
            </div>
          </div>

          <Separator />

          <div className="grid gap-2">
            <Label htmlFor="recipientName">Naziv primaoca</Label>
            <Input
              id="recipientName"
              value={formData.recipientName}
              onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
              disabled={isViewMode}
              placeholder="Naziv firme ili fizičkog lica"
            />
          </div>

          <div className="grid gap-2">
            <Label htmlFor="recipientAccount">Račun primaoca</Label>
            <Input
              id="recipientAccount"
              value={formData.recipientAccount}
              onChange={(e) => setFormData({ ...formData, recipientAccount: e.target.value })}
              disabled={isViewMode}
              placeholder="265-1234567890123-12"
              className="font-mono"
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
                disabled={isViewMode}
                placeholder="0"
              />
              {isViewMode && (
                <p className="text-lg font-bold">{formatCurrency(formData.amount)}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="referenceNumber">Poziv na broj</Label>
              <Input
                id="referenceNumber"
                value={formData.referenceNumber || ''}
                onChange={(e) => setFormData({ ...formData, referenceNumber: e.target.value })}
                disabled={isViewMode}
                placeholder="00-123-456"
                className="font-mono"
              />
            </div>
          </div>

          <div className="grid gap-2">
            <Label htmlFor="purpose">Svrha plaćanja</Label>
            <Textarea
              id="purpose"
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              disabled={isViewMode}
              placeholder="Unesite svrhu plaćanja..."
              rows={2}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Zatvori' : 'Otkaži'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSubmit}>Kreiraj nalog</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
