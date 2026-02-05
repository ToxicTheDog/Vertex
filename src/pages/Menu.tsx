 import { Link } from 'react-router-dom';
 import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
 import { 
   DollarSign, Users, ShoppingCart, Users2, Megaphone, FolderKanban, Warehouse, Settings,
   LayoutDashboard, FileText, FilePlus, FileCheck, Receipt, RefreshCw, CreditCard, Building2,
   Landmark, Calculator, FileSpreadsheet, Scale, BookOpen, BarChart3, TrendingUp, PieChart,
   FileSignature, UserCircle, MessageSquare, Store, Monitor, ClipboardList, Package, Truck,
   Tag, Layers, Hash, Clock, Wallet, Calendar, Plane, Building, TrendingDown, RotateCcw,
   Mail, MessageCircle, CheckSquare, Bell, PackageSearch, ArrowUpDown, ClipboardCheck,
   Send, MessageSquareMore, FileBarChart, Percent, AlertTriangle, Zap
 } from 'lucide-react';
 
 interface MenuItem {
   title: string;
   url: string;
   icon: React.ComponentType<{ className?: string }>;
   description?: string;
 }
 
 interface MenuGroup {
   title: string;
   icon: React.ComponentType<{ className?: string }>;
   items: MenuItem[];
 }
 
 interface MenuCategory {
   category: string;
   icon: React.ComponentType<{ className?: string }>;
   color: string;
   groups: MenuGroup[];
 }
 
 const menuStructure: MenuCategory[] = [
   {
     category: 'Finansije',
     icon: DollarSign,
     color: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400',
     groups: [
       {
         title: 'Početna',
         icon: LayoutDashboard,
         items: [
           { title: 'Dashboard', url: '/', icon: LayoutDashboard, description: 'Pregled ključnih metrika' }
         ]
       },
       {
         title: 'Računi i fakture',
         icon: FileText,
         items: [
           { title: 'Izdati računi', url: '/invoices', icon: FileText, description: 'Upravljanje izlaznim fakturama' },
           { title: 'Kreiraj račun', url: '/invoices/create', icon: FilePlus, description: 'Kreiranje novog računa' },
           { title: 'Predračun', url: '/proforma', icon: FileCheck, description: 'Predračuni i ponude' },
           { title: 'Primljeni računi (SEF)', url: '/received-invoices', icon: Receipt, description: 'Ulazne fakture iz SEF-a' },
           { title: 'Automatske fakture', url: '/recurring-invoices', icon: RefreshCw, description: 'Ponavljajuće fakture' }
         ]
       },
       {
         title: 'Banka i plaćanja',
         icon: Landmark,
         items: [
           { title: 'Nalozi za plaćanje', url: '/payment-orders', icon: CreditCard, description: 'Kreiranje naloga' },
           { title: 'Plaćanja dobavljačima', url: '/supplier-payments', icon: Building2, description: 'Evidencija plaćanja' },
           { title: 'Izvodi banke', url: '/bank-statements', icon: Landmark, description: 'Bankarski izvodi' }
         ]
       },
       {
         title: 'Knjigovodstvo i porezi',
         icon: Calculator,
         items: [
           { title: 'PDV evidencija', url: '/vat', icon: Calculator, description: 'Evidencija PDV-a' },
           { title: 'Smanjenje PDV-a', url: '/vat-reduction', icon: TrendingDown, description: 'Troškovi za smanjenje' },
           { title: 'PPPDV obrasci', url: '/pppdv', icon: FileSpreadsheet, description: 'Poreske prijave' },
           { title: 'Porezi i doprinosi', url: '/taxes', icon: Scale, description: 'Obračun poreza' },
           { title: 'Knjiga ulaznih faktura', url: '/incoming-ledger', icon: BookOpen, description: 'KUF evidencija' },
           { title: 'Knjiga izlaznih faktura', url: '/outgoing-ledger', icon: BookOpen, description: 'KIF evidencija' }
         ]
       },
       {
         title: 'Analitike i izveštaji',
         icon: BarChart3,
         items: [
           { title: 'Finansijski izveštaji', url: '/financial-reports', icon: BarChart3, description: 'Bilans i izveštaji' },
           { title: 'Profitabilnost', url: '/profitability', icon: TrendingUp, description: 'Analiza profita' },
           { title: 'Izveštaji o prodaji', url: '/sales-reports', icon: ShoppingCart, description: 'Prodajne statistike' },
           { title: 'Kupci i dobavljači', url: '/client-reports', icon: Users, description: 'Izveštaji o partnerima' },
           { title: 'Keš flow', url: '/cash-flow', icon: PieChart, description: 'Tokovi novca' }
         ]
       },
       {
         title: 'Ugovori',
         icon: FileSignature,
         items: [
           { title: 'Evidencija ugovora', url: '/contracts', icon: FileSignature, description: 'Upravljanje ugovorima' }
         ]
       }
     ]
   },
   {
     category: 'Klijenti i poslovnice',
     icon: Users,
     color: 'bg-blue-500/10 text-blue-600 dark:text-blue-400',
     groups: [
       {
         title: 'Klijenti i kontakti',
         icon: UserCircle,
         items: [
           { title: 'Stranke', url: '/clients', icon: UserCircle, description: 'Baza klijenata' },
           { title: 'CRM beleške', url: '/crm-notes', icon: MessageSquare, description: 'Beleške o klijentima' }
         ]
       },
       {
         title: 'Poslovnice i fiskalizacija',
         icon: Store,
         items: [
           { title: 'Poslovnice', url: '/branches', icon: Store, description: 'Upravljanje poslovnicama' },
           { title: 'Fiskalne blagajne', url: '/fiscal-registers', icon: Calculator, description: 'Evidencija blagajni' },
           { title: 'POS terminali', url: '/pos-terminals', icon: Monitor, description: 'POS uređaji' }
         ]
       }
     ]
   },
   {
     category: 'Prodaja i kupovina',
     icon: ShoppingCart,
     color: 'bg-orange-500/10 text-orange-600 dark:text-orange-400',
     groups: [
       {
         title: 'Narudžbine',
         icon: ClipboardList,
         items: [
           { title: 'Primljene narudžbe', url: '/received-orders', icon: ClipboardList, description: 'Narudžbe od kupaca' },
           { title: 'Izdate narudžbe', url: '/issued-orders', icon: Package, description: 'Narudžbe dobavljačima' },
           { title: 'Dobavljači', url: '/suppliers', icon: Truck, description: 'Baza dobavljača' }
         ]
       },
       {
         title: 'Artikli i cene',
         icon: Tag,
         items: [
           { title: 'Artikli', url: '/articles', icon: Tag, description: 'Katalog proizvoda' },
           { title: 'Cenovnici', url: '/price-lists', icon: DollarSign, description: 'Upravljanje cenama' },
           { title: 'Zalihe', url: '/stock', icon: Layers, description: 'Stanje zaliha' },
           { title: 'Kategorije artikala', url: '/categories', icon: Layers, description: 'Organizacija artikala' },
           { title: 'Serijski brojevi/Lotovi', url: '/serial-numbers', icon: Hash, description: 'Praćenje serija' }
         ]
       }
     ]
   },
   {
     category: 'Ljudski resursi',
     icon: Users2,
     color: 'bg-purple-500/10 text-purple-600 dark:text-purple-400',
     groups: [
       {
         title: 'Radnici i evidencija',
         icon: Users2,
         items: [
           { title: 'Radnici', url: '/employees', icon: Users2, description: 'Evidencija zaposlenih' },
           { title: 'Evidencija radnog vremena', url: '/time-tracking', icon: Clock, description: 'Praćenje radnog vremena' },
           { title: 'Obračun zarada', url: '/payroll', icon: Wallet, description: 'Obračun plata' },
           { title: 'Odsustva', url: '/absences', icon: Calendar, description: 'Godišnji i bolovanja' }
         ]
       },
       {
         title: 'Službena putovanja',
         icon: Plane,
         items: [
           { title: 'Službena putovanja', url: '/business-trips', icon: Plane, description: 'Evidencija putovanja' },
           { title: 'Putni nalozi', url: '/travel-orders', icon: FileText, description: 'Kreiranje naloga' }
         ]
       },
       {
         title: 'Osnovna sredstva',
         icon: Building,
         items: [
           { title: 'Osnovna sredstva', url: '/fixed-assets', icon: Building, description: 'Evidencija imovine' },
           { title: 'Amortizacija', url: '/depreciation', icon: TrendingDown, description: 'Obračun amortizacije' },
           { title: 'Godišnje obrade', url: '/yearly-processing', icon: RotateCcw, description: 'Zatvaranje godine' }
         ]
       }
     ]
   },
   {
     category: 'Marketing i komunikacija',
     icon: Megaphone,
     color: 'bg-pink-500/10 text-pink-600 dark:text-pink-400',
     groups: [
       {
         title: 'Kampanje',
         icon: Mail,
         items: [
           { title: 'Email/SMS kampanje', url: '/campaigns', icon: Mail, description: 'Marketing kampanje' },
           { title: 'Promocije i popusti', url: '/promotions', icon: Megaphone, description: 'Upravljanje akcijama' },
           { title: 'Povratne informacije', url: '/feedback', icon: MessageCircle, description: 'Feedback korisnika' }
         ]
       }
     ]
   },
   {
     category: 'Projekti i zadaci',
     icon: FolderKanban,
     color: 'bg-cyan-500/10 text-cyan-600 dark:text-cyan-400',
     groups: [
       {
         title: 'Upravljanje',
         icon: CheckSquare,
         items: [
           { title: 'Zadaci / To-Do', url: '/tasks', icon: CheckSquare, description: 'Lista zadataka' },
           { title: 'Projekti', url: '/projects', icon: FolderKanban, description: 'Upravljanje projektima' },
           { title: 'Aktivnosti i podsetnici', url: '/reminders', icon: Bell, description: 'Podsetnici' }
         ]
       }
     ]
   },
   {
     category: 'Inventar i skladište',
     icon: Warehouse,
     color: 'bg-amber-500/10 text-amber-600 dark:text-amber-400',
     groups: [
       {
         title: 'Skladište',
         icon: Warehouse,
         items: [
           { title: 'Magacini', url: '/warehouses', icon: Warehouse, description: 'Upravljanje magacinima' },
           { title: 'Praćenje zaliha', url: '/inventory-tracking', icon: PackageSearch, description: 'Analitika zaliha' },
           { title: 'Ulaz/Izlaz robe', url: '/stock-movements', icon: ArrowUpDown, description: 'Kretanje robe' },
           { title: 'Inventurne liste', url: '/inventory-lists', icon: ClipboardCheck, description: 'Inventure' }
         ]
       }
     ]
   },
   {
     category: 'Automatizacija',
     icon: Settings,
     color: 'bg-slate-500/10 text-slate-600 dark:text-slate-400',
     groups: [
       {
         title: 'Podešavanja',
         icon: Zap,
         items: [
           { title: 'Auto slanje faktura', url: '/auto-invoices', icon: Send, description: 'Automatsko slanje' },
           { title: 'Email/SMS podsetnici', url: '/auto-reminders', icon: MessageSquareMore, description: 'Automatski podsetnici' },
           { title: 'Automatski izveštaji', url: '/auto-reports', icon: FileBarChart, description: 'Zakazani izveštaji' },
           { title: 'Obračun PDV/kamata', url: '/auto-vat', icon: Percent, description: 'Automatski obračun' },
           { title: 'Upozorenja za zalihe', url: '/stock-alerts', icon: AlertTriangle, description: 'Notifikacije za zalihe' },
           { title: 'Auto ponude', url: '/auto-quotes', icon: Zap, description: 'Automatske ponude' }
         ]
       }
     ]
   }
 ];
 
 const Menu = () => {
   return (
     <div className="min-h-screen bg-background">
       <div className="container mx-auto py-8 px-4">
         <div className="text-center mb-12">
           <h1 className="text-4xl font-bold mb-4">Navigacija</h1>
           <p className="text-xl text-muted-foreground">Izaberite modul za brz pristup svim funkcionalnostima</p>
         </div>
 
         <div className="grid gap-8">
           {menuStructure.map((category) => (
             <Card key={category.category} className="overflow-hidden">
               <CardHeader className={`${category.color} border-b`}>
                 <div className="flex items-center gap-3">
                   <category.icon className="h-8 w-8" />
                   <div>
                     <CardTitle className="text-2xl">{category.category}</CardTitle>
                     <CardDescription className="text-current/70">
                       {category.groups.reduce((acc, g) => acc + g.items.length, 0)} funkcionalnosti
                     </CardDescription>
                   </div>
                 </div>
               </CardHeader>
               <CardContent className="p-6">
                 <div className="grid gap-6">
                   {category.groups.map((group) => (
                     <div key={group.title}>
                       <div className="flex items-center gap-2 mb-3">
                         <group.icon className="h-5 w-5 text-muted-foreground" />
                         <h3 className="font-semibold text-lg">{group.title}</h3>
                       </div>
                       <div className="grid gap-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
                         {group.items.map((item) => (
                           <Link
                             key={item.url}
                             to={item.url}
                             className="flex items-start gap-3 p-3 rounded-lg border bg-card hover:bg-accent hover:border-accent-foreground/20 transition-colors group"
                           >
                             <item.icon className="h-5 w-5 mt-0.5 text-muted-foreground group-hover:text-foreground transition-colors" />
                             <div className="min-w-0">
                               <div className="font-medium text-sm group-hover:text-foreground transition-colors">{item.title}</div>
                               {item.description && (
                                 <div className="text-xs text-muted-foreground truncate">{item.description}</div>
                               )}
                             </div>
                           </Link>
                         ))}
                       </div>
                     </div>
                   ))}
                 </div>
               </CardContent>
             </Card>
           ))}
         </div>
       </div>
     </div>
   );
 };
 
 export default Menu;