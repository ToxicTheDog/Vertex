import { useState, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Check, Star, Zap, Shield, Crown, Settings2, Users, Calculator, ChevronRight } from 'lucide-react';

// ── Tipovi ──
interface Plan {
  name: string;
  price: number;
  icon: React.ReactNode;
  description: string;
  highlight?: boolean;
  badge?: string;
  seats: { admin: number; knjigovođa: number; viewer: number };
  features: string[];
}

interface CustomModule {
  key: string;
  label: string;
  price: number;
  category: string;
}

// ── Podaci ──
const standardPlans: Plan[] = [
  {
    name: 'Core',
    price: 29,
    icon: <Shield className="h-6 w-6" />,
    description: 'Računi, fakture i osnovno knjigovodstvo',
    seats: { admin: 1, knjigovođa: 1, viewer: 1 },
    features: [
      'Računi i fakture (kompletno)',
      'Dashboard & Profil',
      '1 Knjigovođa + 1 Viewer uključeni',
      'Admin se ne naplaćuje',
    ],
  },
  {
    name: 'Operativa',
    price: 49,
    icon: <Zap className="h-6 w-6" />,
    description: 'Core + klijenti, banka, PDV',
    seats: { admin: 1, knjigovođa: 1, viewer: 2 },
    features: [
      'Sve iz Core plana',
      'Klijenti & CRM beleške',
      'Banka (izvodi, nalozi)',
      'PDV evidencija & PPPDV',
      '2 Viewer-a uključena',
    ],
  },
  {
    name: 'Komercijala Plus',
    price: 69,
    icon: <Star className="h-6 w-6" />,
    description: 'Operativa + prodaja, nabavka, lager',
    highlight: true,
    badge: 'Popularno',
    seats: { admin: 1, knjigovođa: 2, viewer: 3 },
    features: [
      'Sve iz Operativa plana',
      'Prodaja & Nabavka',
      'Artikli, Cenovnici, Kategorije',
      'Lager & Serijski brojevi',
      '2 Knjigovođe + 3 Viewer-a',
    ],
  },
  {
    name: 'Administracija',
    price: 89,
    icon: <Users className="h-6 w-6" />,
    description: 'Komercijala + HR, plate, inventar',
    seats: { admin: 1, knjigovođa: 3, viewer: 5 },
    features: [
      'Sve iz Komercijala Plus plana',
      'Zaposleni, evidencija rada',
      'Plate & odsustva',
      'Skladišta & inventar',
      '3 Knjigovođe + 5 Viewer-a',
    ],
  },
  {
    name: 'Enterprise',
    price: 119,
    icon: <Crown className="h-6 w-6" />,
    description: 'Sve funkcionalnosti + automatizacija',
    badge: 'Kompletno',
    seats: { admin: 1, knjigovođa: 5, viewer: 10 },
    features: [
      'Sve iz Administracija plana',
      'Marketing & kampanje',
      'Projekti & taskovi',
      'Automatizacija (fakture, PDV, izvještaji)',
      'Osnovna sredstva & amortizacija',
      '5 Knjigovođa + 10 Viewer-a',
    ],
  },
];

const customModules: CustomModule[] = [
  { key: 'racuni', label: 'Računi i fakture', price: 15, category: 'Finansije' },
  { key: 'banka', label: 'Banka', price: 8, category: 'Finansije' },
  { key: 'pdv', label: 'PDV evidencija', price: 7, category: 'Finansije' },
  { key: 'pppdv', label: 'PPPDV', price: 5, category: 'Finansije' },
  { key: 'porezi', label: 'Porezi', price: 6, category: 'Finansije' },
  { key: 'knjig', label: 'Knjigovodstvo (KUF/KIF)', price: 8, category: 'Finansije' },
  { key: 'klijenti', label: 'Klijenti & CRM', price: 7, category: 'Klijenti' },
  { key: 'prodaja', label: 'Prodaja & narudžbe', price: 10, category: 'Prodaja' },
  { key: 'nabavka', label: 'Nabavka & dobavljači', price: 8, category: 'Prodaja' },
  { key: 'artikli', label: 'Artikli & cenovnici', price: 6, category: 'Prodaja' },
  { key: 'lager', label: 'Lager & serijski br.', price: 7, category: 'Prodaja' },
  { key: 'skladiste', label: 'Skladišta & inventar', price: 8, category: 'Inventar' },
  { key: 'zaposleni', label: 'Zaposleni & evidencija', price: 9, category: 'HR' },
  { key: 'plate', label: 'Plate & odsustva', price: 10, category: 'HR' },
  { key: 'marketing', label: 'Marketing & kampanje', price: 8, category: 'Marketing' },
  { key: 'projekti', label: 'Projekti & taskovi', price: 7, category: 'Projekti' },
  { key: 'automatizacija', label: 'Automatizacija', price: 12, category: 'Premium' },
];

const EXTRA_VIEWER_PRICE = 3;
const EXTRA_KNJIGOVODJA_PRICE = 7;

const Prices = () => {
  const [annual, setAnnual] = useState(false);
  const [selectedModules, setSelectedModules] = useState<Set<string>>(new Set(['racuni']));
  const [extraViewers, setExtraViewers] = useState(0);
  const [extraKnjigovodje, setExtraKnjigovodje] = useState(0);

  const discount = annual ? 0.8 : 1;

  const customTotal = useMemo(() => {
    let base = 0;
    selectedModules.forEach((key) => {
      const mod = customModules.find((m) => m.key === key);
      if (mod) base += mod.price;
    });
    base += extraViewers * EXTRA_VIEWER_PRICE;
    base += extraKnjigovodje * EXTRA_KNJIGOVODJA_PRICE;
    return Math.round(base * discount);
  }, [selectedModules, extraViewers, extraKnjigovodje, discount]);

  const suggestedPlan = useMemo(() => {
    return standardPlans.find((p) => Math.round(p.price * discount) <= customTotal + 5);
  }, [customTotal, discount]);

  const toggleModule = (key: string) => {
    if (key === 'racuni') return; // Core obavezan
    setSelectedModules((prev) => {
      const next = new Set(prev);
      if (next.has(key)) next.delete(key);
      else next.add(key);
      return next;
    });
  };

  const categories = [...new Set(customModules.map((m) => m.category))];

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold tracking-tight mb-3">VERTEX Cenovnik</h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Izaberite standardni plan ili kreirajte Custom paket prema vašim potrebama.
          </p>

          {/* Billing toggle */}
          <div className="flex items-center justify-center gap-3 mt-6">
            <Label className={!annual ? 'font-semibold' : 'text-muted-foreground'}>Mesečno</Label>
            <Switch checked={annual} onCheckedChange={setAnnual} />
            <Label className={annual ? 'font-semibold' : 'text-muted-foreground'}>
              Godišnje
              <Badge variant="secondary" className="ml-2 text-xs">-20%</Badge>
            </Label>
          </div>
        </div>

        {/* ── Standardni planovi ── */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 mb-16">
          {standardPlans.map((plan) => (
            <Card
              key={plan.name}
              className={`relative flex flex-col ${
                plan.highlight
                  ? 'border-primary shadow-lg shadow-primary/10 ring-2 ring-primary/20'
                  : ''
              }`}
            >
              {plan.badge && (
                <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground">
                  {plan.badge}
                </Badge>
              )}
              <CardHeader className="text-center pb-2">
                <div className="mx-auto mb-2 h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                  {plan.icon}
                </div>
                <CardTitle className="text-xl">{plan.name}</CardTitle>
                <CardDescription className="text-sm min-h-[40px]">{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 flex flex-col">
                <div className="text-center mb-4">
                  <span className="text-4xl font-bold">{Math.round(plan.price * discount)}€</span>
                  <span className="text-muted-foreground text-sm">/mesečno</span>
                </div>
                <div className="text-xs text-muted-foreground text-center mb-4">
                  {plan.seats.admin} Admin (besplatan) · {plan.seats.knjigovođa} Knjigovođa · {plan.seats.viewer} Viewer
                </div>
                <ul className="space-y-2 flex-1">
                  {plan.features.map((f, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                      <span>{f}</span>
                    </li>
                  ))}
                </ul>
                <Button className="w-full mt-6" variant={plan.highlight ? 'default' : 'outline'}>
                  Izaberi {plan.name}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* ── Custom konfigurator ── */}
        <div id="custom" className="scroll-mt-8">
          <div className="text-center mb-8">
            <div className="inline-flex items-center gap-2 mb-2">
              <Settings2 className="h-6 w-6 text-primary" />
              <h2 className="text-3xl font-bold">Custom Plan</h2>
            </div>
            <p className="text-muted-foreground">Sastavite sopstveni paket — plaćate samo ono što koristite.</p>
          </div>

          <div className="grid gap-8 lg:grid-cols-3">
            {/* Moduli */}
            <div className="lg:col-span-2 space-y-6">
              {categories.map((cat) => (
                <Card key={cat}>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-base">{cat}</CardTitle>
                  </CardHeader>
                  <CardContent className="grid gap-3 sm:grid-cols-2">
                    {customModules
                      .filter((m) => m.category === cat)
                      .map((mod) => {
                        const isCore = mod.key === 'racuni';
                        const active = selectedModules.has(mod.key);
                        return (
                          <button
                            key={mod.key}
                            onClick={() => toggleModule(mod.key)}
                            className={`flex items-center justify-between rounded-lg border p-3 text-left transition-colors ${
                              active
                                ? 'border-primary bg-primary/5'
                                : 'border-border hover:border-primary/40'
                            } ${isCore ? 'opacity-80 cursor-default' : 'cursor-pointer'}`}
                          >
                            <div className="flex items-center gap-2">
                              <div
                                className={`h-4 w-4 rounded border flex items-center justify-center ${
                                  active ? 'bg-primary border-primary' : 'border-muted-foreground/40'
                                }`}
                              >
                                {active && <Check className="h-3 w-3 text-primary-foreground" />}
                              </div>
                              <span className="text-sm font-medium">{mod.label}</span>
                              {isCore && (
                                <Badge variant="outline" className="text-[10px] ml-1">
                                  Obavezno
                                </Badge>
                              )}
                            </div>
                            <span className="text-sm font-semibold text-primary">{mod.price}€</span>
                          </button>
                        );
                      })}
                  </CardContent>
                </Card>
              ))}

              {/* Dodaci korisnika */}
              <Card>
                <CardHeader className="pb-3">
                  <CardTitle className="text-base">Dodatni korisnici</CardTitle>
                  <CardDescription>Core uključuje 1 Knjigovođu + 1 Viewer-a. Admin je besplatan.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label>Dodatni Viewer-i ({EXTRA_VIEWER_PRICE}€/kom)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExtraViewers(Math.max(0, extraViewers - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">{extraViewers}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExtraViewers(extraViewers + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between">
                    <Label>Dodatne Knjigovođe ({EXTRA_KNJIGOVODJA_PRICE}€/kom)</Label>
                    <div className="flex items-center gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExtraKnjigovodje(Math.max(0, extraKnjigovodje - 1))}
                      >
                        -
                      </Button>
                      <span className="w-8 text-center font-semibold">{extraKnjigovodje}</span>
                      <Button
                        variant="outline"
                        size="icon"
                        className="h-8 w-8"
                        onClick={() => setExtraKnjigovodje(extraKnjigovodje + 1)}
                      >
                        +
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Rekapitulacija */}
            <div>
              <Card className="sticky top-6 border-primary/30">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Calculator className="h-5 w-5" />
                    Vaš Custom plan
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2 text-sm">
                    {[...selectedModules].map((key) => {
                      const mod = customModules.find((m) => m.key === key);
                      if (!mod) return null;
                      return (
                        <li key={key} className="flex justify-between">
                          <span>{mod.label}</span>
                          <span className="font-medium">{mod.price}€</span>
                        </li>
                      );
                    })}
                    {extraViewers > 0 && (
                      <li className="flex justify-between">
                        <span>{extraViewers}× Viewer</span>
                        <span className="font-medium">{extraViewers * EXTRA_VIEWER_PRICE}€</span>
                      </li>
                    )}
                    {extraKnjigovodje > 0 && (
                      <li className="flex justify-between">
                        <span>{extraKnjigovodje}× Knjigovođa</span>
                        <span className="font-medium">{extraKnjigovodje * EXTRA_KNJIGOVODJA_PRICE}€</span>
                      </li>
                    )}
                  </ul>

                  <div className="border-t pt-3">
                    {annual && (
                      <p className="text-xs text-muted-foreground mb-1">Godišnji popust: -20%</p>
                    )}
                    <div className="flex items-end justify-between">
                      <span className="text-sm font-medium">Ukupno</span>
                      <div className="text-right">
                        <span className="text-3xl font-bold">{customTotal}€</span>
                        <span className="text-muted-foreground text-sm">/mes</span>
                      </div>
                    </div>
                  </div>

                  {suggestedPlan && Math.round(suggestedPlan.price * discount) <= customTotal && (
                    <div className="rounded-lg bg-primary/5 border border-primary/20 p-3 text-sm">
                      <p className="font-medium text-primary mb-1">💡 Preporuka</p>
                      <p className="text-muted-foreground">
                        Plan <strong>{suggestedPlan.name}</strong> ({Math.round(suggestedPlan.price * discount)}€/mes)
                        nudi više funkcionalnosti za sličnu ili nižu cenu.
                      </p>
                    </div>
                  )}

                  <Button className="w-full" size="lg">
                    Započni sa Custom planom
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Prices;
