import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "@/contexts/ThemeContext";
import { MainLayout } from "@/components/layout/MainLayout";

// Pages
import Dashboard from "./pages/Dashboard";
import Invoices from "./pages/finance/Invoices";
import CreateInvoice from "./pages/finance/CreateInvoice";
import FinancialReports from "./pages/finance/FinancialReports";
import VatRecords from "./pages/finance/VatRecords";
import Clients from "./pages/clients/Clients";
import Employees from "./pages/hr/Employees";
import Articles from "./pages/sales/Articles";
import Warehouses from "./pages/inventory/Warehouses";
import Tasks from "./pages/projects/Tasks";
import Projects from "./pages/projects/Projects";
import Campaigns from "./pages/marketing/Campaigns";
import AutomationSettings from "./pages/automation/AutomationSettings";
import ComingSoon from "./pages/ComingSoon";
import NotFound from "./pages/NotFound";

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
              <Route path="/proforma" element={<ComingSoon />} />
              <Route path="/received-invoices" element={<ComingSoon />} />
              <Route path="/recurring-invoices" element={<ComingSoon />} />
              <Route path="/payment-orders" element={<ComingSoon />} />
              <Route path="/supplier-payments" element={<ComingSoon />} />
              <Route path="/bank-statements" element={<ComingSoon />} />
              <Route path="/vat" element={<VatRecords />} />
              <Route path="/pppdv" element={<ComingSoon />} />
              <Route path="/taxes" element={<ComingSoon />} />
              <Route path="/incoming-ledger" element={<ComingSoon />} />
              <Route path="/outgoing-ledger" element={<ComingSoon />} />
              <Route path="/financial-reports" element={<FinancialReports />} />
              <Route path="/profitability" element={<ComingSoon />} />
              <Route path="/sales-reports" element={<ComingSoon />} />
              <Route path="/client-reports" element={<ComingSoon />} />
              <Route path="/cash-flow" element={<ComingSoon />} />
              <Route path="/contracts" element={<ComingSoon />} />
              
              {/* Klijenti */}
              <Route path="/clients" element={<Clients />} />
              <Route path="/crm-notes" element={<ComingSoon />} />
              <Route path="/branches" element={<ComingSoon />} />
              <Route path="/fiscal-registers" element={<ComingSoon />} />
              <Route path="/pos-terminals" element={<ComingSoon />} />
              
              {/* Prodaja */}
              <Route path="/received-orders" element={<ComingSoon />} />
              <Route path="/issued-orders" element={<ComingSoon />} />
              <Route path="/suppliers" element={<ComingSoon />} />
              <Route path="/articles" element={<Articles />} />
              <Route path="/price-lists" element={<ComingSoon />} />
              <Route path="/stock" element={<ComingSoon />} />
              <Route path="/categories" element={<ComingSoon />} />
              <Route path="/serial-numbers" element={<ComingSoon />} />
              
              {/* Ljudski resursi */}
              <Route path="/employees" element={<Employees />} />
              <Route path="/time-tracking" element={<ComingSoon />} />
              <Route path="/payroll" element={<ComingSoon />} />
              <Route path="/absences" element={<ComingSoon />} />
              <Route path="/business-trips" element={<ComingSoon />} />
              <Route path="/travel-orders" element={<ComingSoon />} />
              <Route path="/fixed-assets" element={<ComingSoon />} />
              <Route path="/depreciation" element={<ComingSoon />} />
              <Route path="/yearly-processing" element={<ComingSoon />} />
              
              {/* Marketing */}
              <Route path="/campaigns" element={<Campaigns />} />
              <Route path="/promotions" element={<ComingSoon />} />
              <Route path="/feedback" element={<ComingSoon />} />
              
              {/* Projekti */}
              <Route path="/tasks" element={<Tasks />} />
              <Route path="/projects" element={<Projects />} />
              <Route path="/reminders" element={<ComingSoon />} />
              
              {/* Inventar */}
              <Route path="/warehouses" element={<Warehouses />} />
              <Route path="/inventory-tracking" element={<ComingSoon />} />
              <Route path="/stock-movements" element={<ComingSoon />} />
              <Route path="/inventory-lists" element={<ComingSoon />} />
              
              {/* Automatizacija */}
              <Route path="/auto-invoices" element={<AutomationSettings />} />
              <Route path="/auto-reminders" element={<AutomationSettings />} />
              <Route path="/auto-reports" element={<AutomationSettings />} />
              <Route path="/auto-vat" element={<AutomationSettings />} />
              <Route path="/stock-alerts" element={<AutomationSettings />} />
              <Route path="/auto-quotes" element={<AutomationSettings />} />
            </Route>
            
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </ThemeProvider>
  </QueryClientProvider>
);

export default App;
