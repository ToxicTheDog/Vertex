import { useLocation, Link } from 'react-router-dom';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

const routeNames: Record<string, string> = {
  '': 'Početna',
  'invoices': 'Izdati računi',
  'create': 'Kreiraj',
  'proforma': 'Predračun',
  'received-invoices': 'Primljeni računi',
  'recurring-invoices': 'Automatske fakture',
  'payment-orders': 'Nalozi za plaćanje',
  'supplier-payments': 'Plaćanja dobavljačima',
  'bank-statements': 'Izvodi banke',
  'vat': 'PDV evidencija',
  'pppdv': 'PPPDV obrasci',
  'taxes': 'Porezi i doprinosi',
  'incoming-ledger': 'Knjiga ulaznih faktura',
  'outgoing-ledger': 'Knjiga izlaznih faktura',
  'financial-reports': 'Finansijski izveštaji',
  'profitability': 'Profitabilnost',
  'sales-reports': 'Izveštaji o prodaji',
  'client-reports': 'Kupci i dobavljači',
  'cash-flow': 'Keš flow',
  'contracts': 'Ugovori',
  'clients': 'Stranke',
  'crm-notes': 'CRM beleške',
  'branches': 'Poslovnice',
  'fiscal-registers': 'Fiskalne blagajne',
  'pos-terminals': 'POS terminali',
  'received-orders': 'Primljene narudžbe',
  'issued-orders': 'Izdate narudžbe',
  'suppliers': 'Dobavljači',
  'articles': 'Artikli',
  'price-lists': 'Cenovnici',
  'stock': 'Zalihe',
  'categories': 'Kategorije',
  'serial-numbers': 'Serijski brojevi',
  'employees': 'Radnici',
  'time-tracking': 'Evidencija radnog vremena',
  'payroll': 'Obračun zarada',
  'absences': 'Odsustva',
  'business-trips': 'Službena putovanja',
  'travel-orders': 'Putni nalozi',
  'fixed-assets': 'Osnovna sredstva',
  'depreciation': 'Amortizacija',
  'yearly-processing': 'Godišnje obrade',
  'campaigns': 'Kampanje',
  'promotions': 'Promocije',
  'feedback': 'Povratne informacije',
  'tasks': 'Zadaci',
  'projects': 'Projekti',
  'reminders': 'Podsetnici',
  'warehouses': 'Magacini',
  'inventory-tracking': 'Praćenje zaliha',
  'stock-movements': 'Ulaz/Izlaz robe',
  'inventory-lists': 'Inventurne liste',
  'auto-invoices': 'Auto fakture',
  'auto-reminders': 'Auto podsetnici',
  'auto-reports': 'Auto izveštaji',
  'auto-vat': 'Auto PDV',
  'stock-alerts': 'Upozorenja zaliha',
  'auto-quotes': 'Auto ponude'
};

export function PageBreadcrumb() {
  const location = useLocation();
  const pathSegments = location.pathname.split('/').filter(Boolean);

  if (pathSegments.length === 0) {
    return null;
  }

  return (
    <Breadcrumb className="mb-4">
      <BreadcrumbList>
        <BreadcrumbItem>
          <BreadcrumbLink asChild>
            <Link to="/">Početna</Link>
          </BreadcrumbLink>
        </BreadcrumbItem>
        {pathSegments.map((segment, index) => {
          const path = '/' + pathSegments.slice(0, index + 1).join('/');
          const isLast = index === pathSegments.length - 1;
          const name = routeNames[segment] || segment;

          return (
            <BreadcrumbItem key={path}>
              <BreadcrumbSeparator />
              {isLast ? (
                <BreadcrumbPage>{name}</BreadcrumbPage>
              ) : (
                <BreadcrumbLink asChild>
                  <Link to={path}>{name}</Link>
                </BreadcrumbLink>
              )}
            </BreadcrumbItem>
          );
        })}
      </BreadcrumbList>
    </Breadcrumb>
  );
}
