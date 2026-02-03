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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface ContractFormData {
  id?: string;
  number: string;
  title: string;
  clientName: string;
  type: 'sales' | 'purchase' | 'service' | 'rental';
  status: 'draft' | 'active' | 'completed' | 'terminated';
  startDate: string;
  endDate: string;
  value: number;
  description: string;
}

interface ContractDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  contract?: ContractFormData | null;
  onSave: (data: ContractFormData) => void;
  mode: 'create' | 'edit' | 'view';
}

const emptyContract: ContractFormData = {
  number: '',
  title: '',
  clientName: '',
  type: 'sales',
  status: 'draft',
  startDate: new Date().toISOString().split('T')[0],
  endDate: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
  value: 0,
  description: ''
};

export const ContractDialog = ({ open, onOpenChange, contract, onSave, mode }: ContractDialogProps) => {
  const [formData, setFormData] = useState<ContractFormData>(emptyContract);

  useEffect(() => {
    if (contract) {
      setFormData(contract);
    } else {
      setFormData({
        ...emptyContract,
        number: `UGV-${new Date().getFullYear()}-${String(Math.floor(Math.random() * 1000)).padStart(3, '0')}`
      });
    }
  }, [contract, open]);

  const handleSubmit = () => {
    onSave(formData);
    onOpenChange(false);
  };

  const isViewMode = mode === 'view';
  const title = mode === 'create' ? 'Novi ugovor' : mode === 'edit' ? 'Izmena ugovora' : 'Pregled ugovora';

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('sr-RS', { style: 'currency', currency: 'RSD' }).format(amount);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>
            {mode === 'create' ? 'Unesite podatke o novom ugovoru' : 
             mode === 'edit' ? 'Izmenite podatke o ugovoru' : 
             'Detalji ugovora'}
          </DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="number">Broj ugovora</Label>
              <Input
                id="number"
                value={formData.number}
                onChange={(e) => setFormData({ ...formData, number: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="type">Tip ugovora</Label>
              <Select
                value={formData.type}
                onValueChange={(v) => setFormData({ ...formData, type: v as ContractFormData['type'] })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="sales">Prodaja</SelectItem>
                  <SelectItem value="purchase">Nabavka</SelectItem>
                  <SelectItem value="service">Usluge</SelectItem>
                  <SelectItem value="rental">Zakup</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="title">Naziv ugovora</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              disabled={isViewMode}
              placeholder="Unesite naziv ugovora"
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="clientName">Klijent / Partner</Label>
            <Input
              id="clientName"
              value={formData.clientName}
              onChange={(e) => setFormData({ ...formData, clientName: e.target.value })}
              disabled={isViewMode}
              placeholder="Naziv klijenta ili partnera"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="startDate">Datum početka</Label>
              <Input
                id="startDate"
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                disabled={isViewMode}
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="endDate">Datum završetka</Label>
              <Input
                id="endDate"
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                disabled={isViewMode}
              />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="grid gap-2">
              <Label htmlFor="value">Vrednost (RSD)</Label>
              <Input
                id="value"
                type="number"
                value={formData.value}
                onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) || 0 })}
                disabled={isViewMode}
                placeholder="0"
              />
              {isViewMode && (
                <p className="text-sm text-muted-foreground">{formatCurrency(formData.value)}</p>
              )}
            </div>
            <div className="grid gap-2">
              <Label htmlFor="status">Status</Label>
              <Select
                value={formData.status}
                onValueChange={(v) => setFormData({ ...formData, status: v as ContractFormData['status'] })}
                disabled={isViewMode}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="draft">Nacrt</SelectItem>
                  <SelectItem value="active">Aktivan</SelectItem>
                  <SelectItem value="completed">Završen</SelectItem>
                  <SelectItem value="terminated">Raskinut</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label htmlFor="description">Opis / Napomena</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              disabled={isViewMode}
              placeholder="Dodatne napomene o ugovoru..."
              rows={3}
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            {isViewMode ? 'Zatvori' : 'Otkaži'}
          </Button>
          {!isViewMode && (
            <Button onClick={handleSubmit}>
              {mode === 'create' ? 'Kreiraj' : 'Sačuvaj'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
