import { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Check, Minus, Plus, Crown, Zap, Building2, Briefcase, Rocket, Settings2, ArrowLeft } from 'lucide-react';
import { cn } from '@/lib/utils';

// ── Data ──────────────────────────────────────────────

interface Subcategory {
  key: string;
  label: string;
  customPrice: number;
}

const SUBCATEGORIES: Subcategory[] = [
  { key: 'racuni', label: 'Računi i fakture', customPrice: 0 }, // included in Core
  { key: 'banka', label: 'Banka i plaćanja', customPrice: 10 },
  { key: 'knjig', label: 'Knjigovodstvo i porezi', customPrice: 15 },
  { key: 'analitike', label: 'Analitike i izveštaji', customPrice: 10 },
  { key: 'ugovori', label: 'Ugovori', customPrice: 5 },
  { key: 'klijenti', label: 'Klijenti i kontakti', customPrice: 6 },
  { key: 'poslovnice', label: 'Poslovnice i fiskalizacija', customPrice: 8 },
  { key: 'narudzbe', label: 'Narudžbine', customPrice: 6 },
  { key: 'artikli', label: 'Artikli i cene', customPrice: 7 },
  { key: 'radnici', label: 'Radnici i evidencija', customPrice: 12 },
  { key: 'putovanja', label: 'Službena putovanja', customPrice: 5 },
  { key: 'sredstva', label: 'Osnovna sredstva', customPrice: 7 },
  { key: 'kampanje', label: 'Kampanje', customPrice: 6 },
  { key: 'promocije', label: 'Promocije i popusti', customPrice: 4 },
  { key: 'povratne', label: 'Povratne informacije', customPrice: 3 },
  { key: 'upravljanje', label: 'Upravljanje (Projekti i zadaci)', customPrice: 5 },
  { key: 'skladiste', label: 'Skladište', customPrice: 10 },
  { key: 'automatizacija', label: 'Podešavanja (Automatizacija)', customPrice: 12 },
];

interface Plan {
  id: string;
  name: string;
  price: number;
  description: string;
  icon: React.ReactNode;
  includedKeys: string[];
  popular?: boolean;
}

const PLANS: Plan[] = [
  {
    id: 'core',
    name: 'Core',
    price: 29,
    description: 'Za malu firmu koja kreće sa fakturisanjem',
    icon: <Zap className="h-6 w-6" />,
    includedKeys: ['racuni'],
  },
  {
    id: 'operativa',
    name: 'Operativa',
    price: 49,
    description: 'Za prodaju i rad sa klijentima',
    icon: <Briefcase className="h-6 w-6" />,
    includedKeys: ['racuni', 'klijenti', 'narudzbe', 'artikli', 'upravljanje'],
  },
  {
    id: 'komercijala',
    name: 'Komercijala Plus',
    price: 69,
    description: 'Za robu, poslovnice i naplatu',
    icon: <Building2 className="h-6 w-6" />,
    includedKeys: ['racuni', 'klijenti', 'narudzbe', 'artikli', 'upravljanje', 'poslovnice', 'banka', 'skladiste', 'kampanje'],
    popular: true,
  },
  {
    id: 'administracija',
    name: 'Administracija',
    price: 89,
    description: 'Za finansije i HR',
    icon: <Crown className="h-6 w-6" />,
    includedKeys: ['racuni', 'klijenti', 'narudzbe', 'artikli', 'upravljanje', 'poslovnice', 'banka', 'skladiste', 'kampanje', 'knjig', 'analitike', 'ugovori', 'radnici'],
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    price: 119,
    description: 'Za kompletan sistem',
    icon: <Rocket className="h-6 w-6" />,
    includedKeys: SUBCATEGORIES.map(s => s.key),
  },
];

// ── Components ────────────────────────────────────────

function PlanCard({ plan, onSelect }: { plan: Plan; onSelect: () => void }) {
  return (
    <Card className={cn(
      'relative flex flex-col transition-all duration-200 hover:shadow-lg hover:-translate-y-1',
      plan.popular && 'border-primary shadow-md ring-2 ring-primary/20'
    )}>
      {plan.popular && (
        <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground px-3">
          Najpopularniji
        </Badge>
      )}
      <CardHeader className="text-center pb-2">
        <div className={cn(
          'mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl',
          plan.popular ? 'bg-primary text-primary-foreground' : 'bg-muted text-foreground'
        )}>
          {plan.icon}
        </div>
        <CardTitle className="text-xl">{plan.name}</CardTitle>
        <p className="text-sm text-muted-foreground">{plan.description}</p>
      </CardHeader>
      <CardContent className="flex flex-1 flex-col">
        <div className="text-center mb-4">
          <span className="text-4xl font-bold">{plan.price} €</span>
          <span className="text-muted-foreground"> / mesec</span>
        </div>

        <Separator className="mb-4" />

        <p className="text-xs text-muted-foreground mb-2 font-medium">Uključuje Core (1 viewer + 1 knjigovođa)</p>

        <ul className="space-y-2 flex-1 mb-6">
          {SUBCATEGORIES.map(sub => {
            const included = plan.includedKeys.includes(sub.key);
            return (
              <li key={sub.key} className={cn('flex items-center gap-2 text-sm', !included && 'text-muted-foreground/40')}>
                {included
                  ? <Check className="h-4 w-4 shrink-0 text-primary" />
                  : <Minus className="h-4 w-4 shrink-0" />}
                {sub.label}
              </li>
            );
          })}
        </ul>

        <Button
          onClick={onSelect}
          variant={plan.popular ? 'default' : 'outline'}
          className="w-full"
        >
          Izaberi {plan.name}
        </Button>
      </CardContent>
    </Card>
  );
}

function CustomConfigurator() {
  const [selected, setSelected] = useState<Set<string>>(new Set(['racuni']));
  const [extraViewers, setExtraViewers] = useState(0);
  const [extraAccountants, setExtraAccountants] = useState(0);

  const toggle = (key: string) => {
    if (key === 'racuni') return; // Core always checked
    setSelected(prev => {
      const next = new Set(prev);
      next.has(key) ? next.delete(key) : next.add(key);
      return next;
    });
  };

  const totalSubcategories = useMemo(
    () => SUBCATEGORIES.filter(s => selected.has(s.key)).reduce((sum, s) => sum + s.customPrice, 0),
    [selected]
  );

  const total = 29 + totalSubcategories + extraViewers * 4 + extraAccountants * 9;

  // Check if a standard plan would be cheaper
  const cheaperPlan = useMemo(() => {
    for (const plan of [...PLANS].reverse()) {
      if (plan.id === 'core') continue;
      const allIncluded = [...selected].every(k => plan.includedKeys.includes(k));
      if (allIncluded && plan.price < total) {
        return plan;
      }
    }
    return null;
  }, [selected, total]);

  return (
    <Card className="border-dashed border-2">
      <CardHeader className="text-center">
        <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-xl bg-muted text-foreground">
          <Settings2 className="h-6 w-6" />
        </div>
        <CardTitle className="text-xl">Custom</CardTitle>
        <p className="text-sm text-muted-foreground">Sastavi svoj paket — kreće od Core baze</p>
      </CardHeader>
      <CardContent>
        {/* Subcategory toggles */}
        <div className="grid gap-2 mb-6">
          {SUBCATEGORIES.map(sub => {
            const isCore = sub.key === 'racuni';
            const checked = selected.has(sub.key);
            return (
              <label
                key={sub.key}
                className={cn(
                  'flex items-center justify-between rounded-lg border px-4 py-2.5 cursor-pointer transition-colors',
                  checked ? 'border-primary/40 bg-primary/5' : 'border-border hover:bg-muted/50',
                  isCore && 'opacity-80 cursor-default'
                )}
                onClick={() => toggle(sub.key)}
              >
                <span className="flex items-center gap-2 text-sm">
                  {checked
                    ? <Check className="h-4 w-4 text-primary" />
                    : <div className="h-4 w-4 rounded border border-muted-foreground/30" />}
                  {sub.label}
                  {isCore && <Badge variant="secondary" className="text-[10px] ml-1">Obavezno</Badge>}
                </span>
                <span className="text-xs text-muted-foreground font-medium">
                  {isCore ? 'Uklj.' : `+${sub.customPrice} €`}
                </span>
              </label>
            );
          })}
        </div>

        <Separator className="mb-4" />

        {/* User seats */}
        <p className="text-sm font-medium mb-3">Dodatni korisnici</p>
        <p className="text-xs text-muted-foreground mb-4">Uključeno: 1 viewer + 1 knjigovođa · Admin = 0 €</p>

        <div className="space-y-3 mb-6">
          <SeatCounter label="Dodatni Viewer" price={4} value={extraViewers} onChange={setExtraViewers} />
          <SeatCounter label="Dodatni Knjigovođa" price={9} value={extraAccountants} onChange={setExtraAccountants} />
        </div>

        <Separator className="mb-4" />

        {/* Price summary */}
        <div className="space-y-1 text-sm mb-2">
          <div className="flex justify-between"><span>Core baza</span><span>29 €</span></div>
          {totalSubcategories > 0 && (
            <div className="flex justify-between"><span>Podkategorije</span><span>+{totalSubcategories} €</span></div>
          )}
          {extraViewers > 0 && (
            <div className="flex justify-between"><span>{extraViewers}× viewer</span><span>+{extraViewers * 4} €</span></div>
          )}
          {extraAccountants > 0 && (
            <div className="flex justify-between"><span>{extraAccountants}× knjigovođa</span><span>+{extraAccountants * 9} €</span></div>
          )}
        </div>
        <div className="flex justify-between items-baseline font-bold text-lg border-t pt-2 mt-2">
          <span>Ukupno</span>
          <span>{total} € <span className="text-sm font-normal text-muted-foreground">/ mesec</span></span>
        </div>

        {cheaperPlan && (
          <p className="text-xs text-warning mt-3 text-center">
            💡 Plan <strong>{cheaperPlan.name}</strong> pokriva sve izabrano za samo {cheaperPlan.price} € / mesec
          </p>
        )}

        <Button className="w-full mt-4">Kontaktirajte nas</Button>
      </CardContent>
    </Card>
  );
}

function SeatCounter({ label, price, value, onChange }: { label: string; price: number; value: number; onChange: (v: number) => void }) {
  return (
    <div className="flex items-center justify-between">
      <div>
        <span className="text-sm">{label}</span>
        <span className="text-xs text-muted-foreground ml-2">+{price} € / mesec</span>
      </div>
      <div className="flex items-center gap-2">
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onChange(Math.max(0, value - 1))} disabled={value === 0}>
          <Minus className="h-3 w-3" />
        </Button>
        <span className="w-6 text-center text-sm font-medium">{value}</span>
        <Button size="icon" variant="outline" className="h-7 w-7" onClick={() => onChange(value + 1)}>
          <Plus className="h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────

export default function Prices() {
  const navigate = useNavigate();
  const [showAnnual, setShowAnnual] = useState(false);

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b">
        <div className="mx-auto max-w-7xl px-4 py-4 flex items-center gap-4">
          <Button variant="ghost" size="icon" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Cene</h1>
            <p className="text-sm text-muted-foreground">Izaberite plan koji odgovara vašem poslovanju</p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 py-8 space-y-10">
        {/* Billing toggle */}
        <div className="flex items-center justify-center gap-3">
          <span className={cn('text-sm', !showAnnual && 'font-semibold')}>Mesečno</span>
          <Switch checked={showAnnual} onCheckedChange={setShowAnnual} />
          <span className={cn('text-sm', showAnnual && 'font-semibold')}>
            Godišnje <Badge variant="secondary" className="ml-1 text-[10px]">-20%</Badge>
          </span>
        </div>

        {/* Included seats info */}
        <div className="text-center space-y-1">
          <p className="text-sm text-muted-foreground">
            Svi planovi uključuju <strong>1 viewer + 1 knjigovođa</strong>. Admin nalog je besplatan.
          </p>
          <p className="text-sm text-muted-foreground">
            Dodatni viewer <strong>+4 €</strong> · Dodatni knjigovođa <strong>+9 €</strong> / mesec
          </p>
        </div>

        {/* Standard plans */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5">
          {PLANS.map(plan => {
            const displayPlan = showAnnual
              ? { ...plan, price: Math.round(plan.price * 0.8) }
              : plan;
            return (
              <PlanCard
                key={plan.id}
                plan={displayPlan}
                onSelect={() => navigate('/register')}
              />
            );
          })}
        </div>

        <Separator />

        {/* Custom configurator */}
        <div className="max-w-lg mx-auto">
          <div className="text-center mb-6">
            <h2 className="text-xl font-bold">Custom plan</h2>
            <p className="text-sm text-muted-foreground">Sastavite paket prema vašim potrebama</p>
          </div>
          <CustomConfigurator />
        </div>
      </div>
    </div>
  );
}
