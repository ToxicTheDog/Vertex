import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Login from "./pages/auth/Login";
import Register from "./pages/auth/Register";
import Invoices from "./pages/finance/Invoices";
import CreateInvoice from "./pages/finance/CreateInvoice";
import Proforma from "./pages/finance/Proforma";
import ReceivedInvoices from "./pages/finance/ReceivedInvoices";
import RecurringInvoices from "./pages/finance/RecurringInvoices";
import PaymentOrders from "./pages/finance/PaymentOrders";
import SupplierPayments from "./pages/finance/SupplierPayments";
import BankStatements from "./pages/finance/BankStatements";
import VatRecords from "./pages/finance/VatRecords";
import VatReduction from "./pages/finance/VatReduction";
import PPPDV from "./pages/finance/PPPDV";
import Taxes from "./pages/finance/Taxes";
import Ledger from "./pages/finance/Ledger";
import FinancialReports from "./pages/finance/FinancialReports";
import Profitability from "./pages/finance/Profitability";
import SalesReports from "./pages/finance/SalesReports";
import ClientReports from "./pages/finance/ClientReports";
import CashFlow from "./pages/finance/CashFlow";
import Contracts from "./pages/finance/Contracts";
import Clients from "./pages/clients/Clients";
import CrmNotes from "./pages/clients/CrmNotes";
import Branches from "./pages/clients/Branches";
import FiscalRegisters from "./pages/clients/FiscalRegisters";
import PosTerminals from "./pages/clients/PosTerminals";
import ReceivedOrders from "./pages/sales/ReceivedOrders";
import IssuedOrders from "./pages/sales/IssuedOrders";
import Suppliers from "./pages/sales/Suppliers";
import Articles from "./pages/sales/Articles";
import PriceLists from "./pages/sales/PriceLists";
import Stock from "./pages/sales/Stock";
import Categories from "./pages/sales/Categories";
import SerialNumbers from "./pages/sales/SerialNumbers";
import Employees from "./pages/hr/Employees";
import TimeTracking from "./pages/hr/TimeTracking";
import Payroll from "./pages/hr/Payroll";
import Absences from "./pages/hr/Absences";
import Warehouses from "./pages/inventory/Warehouses";
import Tasks from "./pages/projects/Tasks";
import Projects from "./pages/projects/Projects";
import Campaigns from "./pages/marketing/Campaigns";
import AutomationSettings from "./pages/automation/AutomationSettings";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";
import Menu from "./pages/Menu";
import BusinessTrips from "./pages/hr/BusinessTrips";
import TravelOrders from "./pages/hr/TravelOrders";
import FixedAssets from "./pages/hr/FixedAssets";
import Depreciation from "./pages/hr/Depreciation";
import YearlyProcessing from "./pages/hr/YearlyProcessing";
import Promotions from "./pages/marketing/Promotions";
import Feedback from "./pages/marketing/Feedback";
import Reminders from "./pages/projects/Reminders";
import InventoryTracking from "./pages/inventory/InventoryTracking";
import StockMovements from "./pages/inventory/StockMovements";
import InventoryLists from "./pages/inventory/InventoryLists";
import Settings from "./pages/admin/Settings";
import Profile from "./pages/Profile";
import { MenuLayout } from "./components/layout/MenuLayout";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <ThemeProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route element={<MainLayout />}>
              {/* Dashboard */}
              <Route path="/" element={<Dashboard />} />
              
              {/* Finansije */}
              <Route path="/invoices" element={<Invoices />} />
              <Route path="/invoices/create" element={<CreateInvoice />} />
              <Route path="/proforma" element={<Proforma />} />
              <Route path="/received-invoices" element={<ReceivedInvoices />} />
              <Route path="/recurring-invoices" element={<RecurringInvoices />} />
              <Route path="/payment-orders" element={<PaymentOrders />} />
              <Route path="/supplier-payments" element={<SupplierPayments />} />
              <Route path="/bank-statements" element={<BankStatements />} />
              <Route path="/vat" element={<VatRecords />} />
              <Route path="/vat-reduction" element={<VatReduction />} />
              <Route path="/pppdv" element={<PPPDV />} />
              <Route path="/taxes" element={<Taxes />} />
              <Route path="/incoming-ledger" element={<Ledger />} />
              <Route path="/outgoing-ledger" element={<Ledger />} />
              <Route path="/financial-reports" element={<FinancialReports />} />
              <Route path="/profitability" element={<Profitability />} />
              <Route path="/sales-reports" element={<SalesReports />} />
              <Route path="/client-reports" element={<ClientReports />} />
              <Route path="/cash-flow" element={<CashFlow />} />
              <Route path="/contracts" element={<Contracts />} />
              
              {/* Klijenti */}
              <Route path="/clients" element={<Clients />} />
              <Route path="/crm-notes" element={<CrmNotes />} />
              <Route path="/branches" element={<Branches />} />
              <Route path="/fiscal-registers" element={<FiscalRegisters />} />
              <Route path="/pos-terminals" element={<PosTerminals />} />
              
              {/* Prodaja */}
              <Route path="/received-orders" element={<ReceivedOrders />} />
              <Route path="/issued-orders" element={<IssuedOrders />} />
              <Route path="/suppliers" element={<Suppliers />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/price-lists" element={<PriceLists />} />
              <Route path="/stock" element={<Stock />} />
              <Route path="/categories" element={<Categories />} />
              <Route path="/serial-numbers" element={<SerialNumbers />} />
              
              {/* Ljudski resursi */}
              <Route path="/employees" element={<Employees />} />
              <Route path="/time-tracking" element={<TimeTracking />} />
              <Route path="/payroll" element={<Payroll />} />
              <Route path="/absences" element={<Absences />} />
               <Route path="/business-trips" element={<BusinessTrips />} />
               <Route path="/travel-orders" element={<TravelOrders />} />
               <Route path="/fixed-assets" element={<FixedAssets />} />
               <Route path="/depreciation" element={<Depreciation />} />
               <Route path="/yearly-processing" element={<YearlyProcessing />} />
              
              {/* Marketing */}
              <Route path="/campaigns" element={<Campaigns />} />
               <Route path="/promotions" element={<Promotions />} />
               <Route path="/feedback" element={<Feedback />} />
              
              {/* Projekti */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/projects" element={<Projects />} />
               <Route path="/reminders" element={<Reminders />} />
              
              {/* Inventar */}
              <Route path="/warehouses" element={<Warehouses />} />
               <Route path="/inventory-tracking" element={<InventoryTracking />} />
               <Route path="/stock-movements" element={<StockMovements />} />
               <Route path="/inventory-lists" element={<InventoryLists />} />
              
              {/* Automatizacija */}
              <Route path="/auto-invoices" element={<AutomationSettings />} />
              <Route path="/auto-reminders" element={<AutomationSettings />} />
              <Route path="/auto-reports" element={<AutomationSettings />} />
              <Route path="/auto-vat" element={<AutomationSettings />} />
              <Route path="/stock-alerts" element={<AutomationSettings />} />
              <Route path="/auto-quotes" element={<AutomationSettings />} />
              
              {/* Admin */}
              <Route path="/settings" element={<Settings />} />
              <Route path="/profile" element={<Profile />} />
            </Route>
            
            {/* Menu - bez sidebar-a */}
            <Route element={<MenuLayout />}>
              <Route path="/menu" element={<Menu />} />
            </Route>

            {/* Auth stranice - bez sidebar-a */}
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
             
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
