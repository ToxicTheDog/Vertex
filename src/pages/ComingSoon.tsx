import { useLocation } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Construction, ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';

const routeNames: Record<string, string> = {
  'proforma': 'Predračun',
  'received-invoices': 'Primljeni računi (SEF)',
  'recurring-invoices': 'Automatske fakture',
  'payment-orders': 'Nalozi za plaćanje',
  'supplier-payments': 'Plaćanja dobavljačima',
  'bank-statements': 'Izvodi banke',
  'pppdv': 'PPPDV obrasci',
  'taxes': 'Porezi i doprinosi',
  'incoming-ledger': 'Knjiga ulaznih faktura',
  'outgoing-ledger': 'Knjiga izlaznih faktura',
  'profitability': 'Profitabilnost i troškovi',
  'sales-reports': 'Izveštaji o prodaji',
  'client-reports': 'Kupci i dobavljači',
  'cash-flow': 'Keš flow izveštaji',
  'contracts': 'Evidencija ugovora',
  'crm-notes': 'CRM beleške',
  'branches': 'Poslovnice',
  'fiscal-registers': 'Fiskalne blagajne',
  'pos-terminals': 'POS terminali',
  'received-orders': 'Primljene narudžbe',
  'issued-orders': 'Izdate narudžbe',
  'suppliers': 'Dobavljači',
  'price-lists': 'Cenovnici',
  'stock': 'Zalihe',
  'categories': 'Kategorije artikala',
  'serial-numbers': 'Serijski brojevi / Lotovi',
  'time-tracking': 'Evidencija radnog vremena',
  'payroll': 'Obračun zarada',
  'absences': 'Odsustva / Godišnji odmori',
  'business-trips': 'Službena putovanja',
  'travel-orders': 'Putni nalozi',
  'fixed-assets': 'Osnovna sredstva',
  'depreciation': 'Amortizacija',
  'yearly-processing': 'Godišnje obrade',
  'promotions': 'Promocije i popusti',
  'feedback': 'Povratne informacije',
  'reminders': 'Aktivnosti i podsetnici',
  'inventory-tracking': 'Praćenje zaliha',
  'stock-movements': 'Ulaz / Izlaz robe',
  'inventory-lists': 'Inventurne liste',
  'auto-invoices': 'Automatsko slanje faktura',
  'auto-reminders': 'Email/SMS podsetnici',
  'auto-reports': 'Automatski izveštaji',
  'auto-vat': 'Obračun PDV/kamata',
  'stock-alerts': 'Upozorenja za zalihe',
  'auto-quotes': 'Automatske ponude'
};

const ComingSoon = () => {
  const location = useLocation();
  const path = location.pathname.split('/').pop() || '';
  const pageName = routeNames[path] || 'Ova stranica';

  return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-primary/10 rounded-full">
              <Construction className="h-12 w-12 text-primary" />
            </div>
          </div>
          <CardTitle className="text-2xl">{pageName}</CardTitle>
          <CardDescription>
            Ova funkcionalnost će uskoro biti dostupna u demo verziji sistema.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-muted-foreground mb-6">
            Radimo na implementaciji svih modula. U međuvremenu, možete istražiti 
            ostale dostupne funkcionalnosti sistema.
          </p>
          <Button asChild>
            <Link to="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Nazad na početnu
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
};

export default ComingSoon;
