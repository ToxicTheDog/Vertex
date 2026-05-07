import { useState } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  ChevronDown,
  ChevronRight,
  LayoutDashboard,
  LayoutGrid,
  FileText,
  FilePlus,
  FileCheck,
  Receipt,
  RefreshCw,
  Building2,
  CreditCard,
  Landmark,
  Calculator,
  FileSpreadsheet,
  Scale,
  BookOpen,
  BarChart3,
  TrendingUp,
  ShoppingCart,
  Users,
  PieChart,
  DollarSign,
  FileSignature,
  UserCircle,
  MessageSquare,
  Store,
  Monitor,
  ClipboardList,
  Package,
  Truck,
  Tag,
  Layers,
  Hash,
  Users2,
  Clock,
  Wallet,
  Calendar,
  Plane,
  FileText as TravelDoc,
  Wrench,
  Building,
  TrendingDown,
  RotateCcw,
  Mail,
  Megaphone,
  MessageCircle,
  CheckSquare,
  FolderKanban,
  Bell,
  Warehouse,
  PackageSearch,
  ArrowUpDown,
  ClipboardCheck,
  Settings,
  Send,
  MessageSquareMore,
  FileBarChart,
  Percent,
  AlertTriangle,
  Zap,
  ShieldCheck
} from 'lucide-react';
import { authService } from '@/services/authService';
import { cn } from '@/lib/utils';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  useSidebar,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface MenuItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface MenuGroup {
  title: string;
  icon: React.ComponentType<{ className?: string }>;
  items: MenuItem[];
}

interface MenuCategory {
  category: string;
  icon: React.ComponentType<{ className?: string }>;
  groups: MenuGroup[];
}

// Link za Meni iznad kategorija
const menuLink = {
  title: 'Meni',
  url: '/menu',
  icon: LayoutGrid
};

// Admin podešavanja (samo za admine)
const adminLink = {
  title: 'Podešavanja',
  url: '/settings',
  icon: ShieldCheck
};

const menuStructure: MenuCategory[] = [
  {
    category: 'Finansije',
    icon: DollarSign,
    groups: [
      {
        title: 'Početna',
        icon: LayoutDashboard,
        items: [
          { title: 'Dashboard', url: '/', icon: LayoutDashboard }
        ]
      },
      {
        title: 'Računi i fakture',
        icon: FileText,
        items: [
          { title: 'Izdati računi', url: '/invoices', icon: FileText },
          { title: 'Kreiraj račun', url: '/invoices/create', icon: FilePlus },
          { title: 'Predračun', url: '/proforma', icon: FileCheck },
          { title: 'Primljeni računi (SEF)', url: '/received-invoices', icon: Receipt },
          { title: 'Automatske fakture', url: '/recurring-invoices', icon: RefreshCw }
        ]
      },
      {
        title: 'Banka i plaćanja',
        icon: Landmark,
        items: [
          { title: 'Nalozi za plaćanje', url: '/payment-orders', icon: CreditCard },
          { title: 'Plaćanja dobavljačima', url: '/supplier-payments', icon: Building2 },
          { title: 'Izvodi banke', url: '/bank-statements', icon: Landmark }
        ]
      },
      {
        title: 'Knjigovodstvo i porezi',
        icon: Calculator,
        items: [
          { title: 'PDV evidencija', url: '/vat', icon: Calculator },
          { title: 'Smanjenje PDV-a', url: '/vat-reduction', icon: TrendingDown },
          { title: 'PPPDV obrasci', url: '/pppdv', icon: FileSpreadsheet },
          { title: 'Porezi i doprinosi', url: '/taxes', icon: Scale },
          { title: 'Knjiga ulaznih faktura', url: '/incoming-ledger', icon: BookOpen },
          { title: 'Knjiga izlaznih faktura', url: '/outgoing-ledger', icon: BookOpen }
        ]
      },
      {
        title: 'Analitike i izveštaji',
        icon: BarChart3,
        items: [
          { title: 'Finansijski izveštaji', url: '/financial-reports', icon: BarChart3 },
          { title: 'Profitabilnost', url: '/profitability', icon: TrendingUp },
          { title: 'Izveštaji o prodaji', url: '/sales-reports', icon: ShoppingCart },
          { title: 'Kupci i dobavljači', url: '/client-reports', icon: Users },
          { title: 'Keš flow', url: '/cash-flow', icon: PieChart }
        ]
      },
      {
        title: 'Ugovori',
        icon: FileSignature,
        items: [
          { title: 'Evidencija ugovora', url: '/contracts', icon: FileSignature }
        ]
      }
    ]
  },
  {
    category: 'Klijenti i poslovnice',
    icon: Users,
    groups: [
      {
        title: 'Klijenti i kontakti',
        icon: UserCircle,
        items: [
          { title: 'Stranke', url: '/clients', icon: UserCircle },
          { title: 'CRM beleške', url: '/crm-notes', icon: MessageSquare }
        ]
      },
      {
        title: 'Poslovnice i fiskalizacija',
        icon: Store,
        items: [
          { title: 'Poslovnice', url: '/branches', icon: Store },
          { title: 'Fiskalne blagajne', url: '/fiscal-registers', icon: Calculator },
          { title: 'POS terminali', url: '/pos-terminals', icon: Monitor }
        ]
      }
    ]
  },
  {
    category: 'Prodaja i kupovina',
    icon: ShoppingCart,
    groups: [
      {
        title: 'Narudžbine',
        icon: ClipboardList,
        items: [
          { title: 'Primljene narudžbe', url: '/received-orders', icon: ClipboardList },
          { title: 'Izdate narudžbe', url: '/issued-orders', icon: Package },
          { title: 'Dobavljači', url: '/suppliers', icon: Truck }
        ]
      },
      {
        title: 'Artikli i cene',
        icon: Tag,
        items: [
          { title: 'Artikli', url: '/articles', icon: Tag },
          { title: 'Cenovnici', url: '/price-lists', icon: DollarSign },
          { title: 'Zalihe', url: '/stock', icon: Layers },
          { title: 'Kategorije artikala', url: '/categories', icon: Layers },
          { title: 'Serijski brojevi/Lotovi', url: '/serial-numbers', icon: Hash }
        ]
      }
    ]
  },
  {
    category: 'Ljudski resursi',
    icon: Users2,
    groups: [
      {
        title: 'Radnici i evidencija',
        icon: Users2,
        items: [
          { title: 'Radnici', url: '/employees', icon: Users2 },
          { title: 'Evidencija radnog vremena', url: '/time-tracking', icon: Clock },
          { title: 'Obračun zarada', url: '/payroll', icon: Wallet },
          { title: 'Odsustva', url: '/absences', icon: Calendar }
        ]
      },
      {
        title: 'Službena putovanja',
        icon: Plane,
        items: [
          { title: 'Službena putovanja', url: '/business-trips', icon: Plane },
          { title: 'Putni nalozi', url: '/travel-orders', icon: TravelDoc }
        ]
      },
      {
        title: 'Osnovna sredstva',
        icon: Building,
        items: [
          { title: 'Osnovna sredstva', url: '/fixed-assets', icon: Building },
          { title: 'Amortizacija', url: '/depreciation', icon: TrendingDown },
          { title: 'Godišnje obrade', url: '/yearly-processing', icon: RotateCcw }
        ]
      }
    ]
  },
  {
    category: 'Marketing i komunikacija',
    icon: Megaphone,
    groups: [
      {
        title: 'Kampanje',
        icon: Mail,
        items: [
          { title: 'Email/SMS kampanje', url: '/campaigns', icon: Mail },
          { title: 'Promocije i popusti', url: '/promotions', icon: Megaphone },
          { title: 'Povratne informacije', url: '/feedback', icon: MessageCircle }
        ]
      }
    ]
  },
  {
    category: 'Projekti i zadaci',
    icon: FolderKanban,
    groups: [
      {
        title: 'Upravljanje',
        icon: CheckSquare,
        items: [
          { title: 'Zadaci / To-Do', url: '/tasks', icon: CheckSquare },
          { title: 'Projekti', url: '/projects', icon: FolderKanban },
          { title: 'Aktivnosti i podsetnici', url: '/reminders', icon: Bell }
        ]
      }
    ]
  },
  {
    category: 'Inventar i skladište',
    icon: Warehouse,
    groups: [
      {
        title: 'Skladište',
        icon: Warehouse,
        items: [
          { title: 'Magacini', url: '/warehouses', icon: Warehouse },
          { title: 'Praćenje zaliha', url: '/inventory-tracking', icon: PackageSearch },
          { title: 'Ulaz/Izlaz robe', url: '/stock-movements', icon: ArrowUpDown },
          { title: 'Inventurne liste', url: '/inventory-lists', icon: ClipboardCheck }
        ]
      }
    ]
  },
  {
    category: 'Automatizacija',
    icon: Settings,
    groups: [
      {
        title: 'Podešavanja',
        icon: Zap,
        items: [
          { title: 'Auto slanje faktura', url: '/auto-invoices', icon: Send },
          { title: 'Email/SMS podsetnici', url: '/auto-reminders', icon: MessageSquareMore },
          { title: 'Automatski izveštaji', url: '/auto-reports', icon: FileBarChart },
          { title: 'Obračun PDV/kamata', url: '/auto-vat', icon: Percent },
          { title: 'Upozorenja za zalihe', url: '/stock-alerts', icon: AlertTriangle },
          { title: 'Auto ponude', url: '/auto-quotes', icon: Zap }
        ]
      }
    ]
  }
];

export function AppSidebar() {
  const location = useLocation();
  const { state } = useSidebar();
  const collapsed = state === 'collapsed';
  const [openCategories, setOpenCategories] = useState<string[]>(['Finansije']);
  const [openGroups, setOpenGroups] = useState<string[]>(['Početna']);
  
  const isAdmin = authService.isAdmin();

  const toggleCategory = (category: string) => {
    setOpenCategories(prev => 
      prev.includes(category) 
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  const toggleGroup = (group: string) => {
    setOpenGroups(prev => 
      prev.includes(group) 
        ? prev.filter(g => g !== group)
        : [...prev, group]
    );
  };

  const isActiveRoute = (url: string) => {
    if (url === '/') return location.pathname === '/';
    return location.pathname === url || location.pathname.startsWith(`${url}/`);
  };

  return (
    <Sidebar className="border-r border-sidebar-border">
      <SidebarContent className="py-2">
        {/* MENI LINK - iznad svih kategorija */}
        <SidebarGroup>
          <SidebarMenu>
            <SidebarMenuItem>
              <SidebarMenuButton asChild>
                <NavLink
                  to={menuLink.url}
                  className={cn(
                    "flex items-center gap-2 w-full font-medium",
                    isActiveRoute(menuLink.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                  )}
                >
                  <menuLink.icon className="h-4 w-4" />
                  {!collapsed && <span>{menuLink.title}</span>}
                </NavLink>
              </SidebarMenuButton>
            </SidebarMenuItem>
            {isAdmin && (
              <SidebarMenuItem>
                <SidebarMenuButton asChild>
                  <NavLink
                    to={adminLink.url}
                    className={cn(
                      "flex items-center gap-2 w-full font-medium text-primary",
                      isActiveRoute(adminLink.url) && "bg-sidebar-accent text-sidebar-accent-foreground"
                    )}
                  >
                    <adminLink.icon className="h-4 w-4" />
                    {!collapsed && <span>{adminLink.title}</span>}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            )}
          </SidebarMenu>
        </SidebarGroup>

        {menuStructure.map((category) => (
          <SidebarGroup key={category.category}>
            <Collapsible
              open={openCategories.includes(category.category)}
              onOpenChange={() => toggleCategory(category.category)}
            >
              <CollapsibleTrigger asChild>
                <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:bg-sidebar-accent rounded-md px-2 py-1.5 text-xs font-semibold uppercase tracking-wider text-sidebar-foreground/70">
                  <div className="flex items-center gap-2">
                    <category.icon className="h-4 w-4" />
                    {!collapsed && <span>{category.category}</span>}
                  </div>
                  {!collapsed && (
                    openCategories.includes(category.category) 
                      ? <ChevronDown className="h-4 w-4" />
                      : <ChevronRight className="h-4 w-4" />
                  )}
                </SidebarGroupLabel>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.groups.map((group) => (
                      <Collapsible
                        key={group.title}
                        open={openGroups.includes(group.title)}
                        onOpenChange={() => toggleGroup(group.title)}
                      >
                        <SidebarMenuItem>
                          <CollapsibleTrigger asChild>
                            <SidebarMenuButton className="w-full justify-between">
                              <div className="flex items-center gap-2">
                                <group.icon className="h-4 w-4" />
                                {!collapsed && <span>{group.title}</span>}
                              </div>
                              {!collapsed && (
                                openGroups.includes(group.title) 
                                  ? <ChevronDown className="h-3 w-3" />
                                  : <ChevronRight className="h-3 w-3" />
                              )}
                            </SidebarMenuButton>
                          </CollapsibleTrigger>
                          <CollapsibleContent>
                            <SidebarMenuSub>
                              {group.items.map((item) => (
                                <SidebarMenuSubItem key={item.url}>
                                  <SidebarMenuSubButton asChild>
                                    <NavLink
                                      to={item.url}
                                      className={cn(
                                        "flex items-center gap-2 w-full",
                                        isActiveRoute(item.url) && "bg-sidebar-accent text-sidebar-accent-foreground font-medium"
                                      )}
                                    >
                                      <item.icon className="h-3.5 w-3.5" />
                                      {!collapsed && <span>{item.title}</span>}
                                    </NavLink>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              ))}
                            </SidebarMenuSub>
                          </CollapsibleContent>
                        </SidebarMenuItem>
                      </Collapsible>
                    ))}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </Collapsible>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
