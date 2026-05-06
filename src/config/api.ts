// ============================================================
// API Konfiguracija
// ============================================================
// 
// ARHITEKTURA:
// Frontend -> Backend API -> Baza podataka
// 
// Frontend NIKADA nema direktan pristup bazi podataka.
// Sva komunikacija ide isključivo preko REST API-ja.
// Backend je odgovoran za:
//   - Autentifikaciju (JWT)
//   - Autorizaciju (provera dozvola)
//   - Validaciju podataka
//   - Upite na bazu
//
// TOKEN STRATEGIJA:
//   - Access token: traje 30 minuta
//   - Refresh token: traje 7 dana
//   - Automatski refresh pre isteka access tokena
//
// ============================================================

// Promenite na false kada je backend API spreman
export const DEMO_MODE = false;

// Jedina tačka komunikacije sa serverom
// Frontend NIKADA ne komunicira direktno sa bazom podataka
export const API_BASE_URL = 'http://localhost:3000';

// Token konfiguracija
export const TOKEN_CONFIG = {
  // Access token traje 30 minuta
  accessTokenExpiryMinutes: 30,
  // Refresh token 5 minuta pre isteka access tokena
  refreshBeforeExpiryMinutes: 5,
  // Refresh token traje 7 dana
  refreshTokenExpiryDays: 7,
};

// Interval za real-time ažuriranje (u milisekundama)
export const REALTIME_UPDATE_INTERVAL = 30000; // 30 sekundi

// API endpoints
export const API_ENDPOINTS = {
  // Autentifikacija
  auth: {
    login: `${API_BASE_URL}auth/login`,
    logout: `${API_BASE_URL}auth/logout`,
    me: `${API_BASE_URL}auth/me`,
    refresh: `${API_BASE_URL}auth/refresh`, // Refresh token endpoint
  },

  // Klijenti
  clients: {
    list: `${API_BASE_URL}clients`,
    get: (id: string) => `${API_BASE_URL}clients/${id}`,
    create: `${API_BASE_URL}clients`,
    update: (id: string) => `${API_BASE_URL}clients/${id}`,
    delete: (id: string) => `${API_BASE_URL}clients/${id}`,
  },

  // Fakture
  invoices: {
    list: `${API_BASE_URL}invoices`,
    get: (id: string) => `${API_BASE_URL}invoices/${id}`,
    create: `${API_BASE_URL}invoices`,
    update: (id: string) => `${API_BASE_URL}invoices/${id}`,
    delete: (id: string) => `${API_BASE_URL}invoices/${id}`,
    send: (id: string) => `${API_BASE_URL}invoices/${id}/send`,
    markPaid: (id: string) => `${API_BASE_URL}invoices/${id}/mark-paid`,
  },

  // Nalozi za plaćanje
  paymentOrders: {
    list: `${API_BASE_URL}payment-orders`,
    create: `${API_BASE_URL}payment-orders`,
    approve: (id: string) => `${API_BASE_URL}payment-orders/${id}/approve`,
    execute: (id: string) => `${API_BASE_URL}payment-orders/${id}/execute`,
    reject: (id: string) => `${API_BASE_URL}payment-orders/${id}/reject`,
  },

  // Zaposleni
  employees: {
    list: `${API_BASE_URL}employees`,
    get: (id: string) => `${API_BASE_URL}employees/${id}`,
    create: `${API_BASE_URL}employees`,
    update: (id: string) => `${API_BASE_URL}employees/${id}`,
    delete: (id: string) => `${API_BASE_URL}employees/${id}`,
  },

  // Artikli
  articles: {
    list: `${API_BASE_URL}articles`,
    get: (id: string) => `${API_BASE_URL}articles/${id}`,
    create: `${API_BASE_URL}articles`,
    update: (id: string) => `${API_BASE_URL}articles/${id}`,
    delete: (id: string) => `${API_BASE_URL}articles/${id}`,
    updateStock: (id: string) => `${API_BASE_URL}articles/${id}/stock`,
  },

  // Ugovori
  contracts: {
    list: `${API_BASE_URL}contracts`,
    create: `${API_BASE_URL}contracts`,
    update: (id: string) => `${API_BASE_URL}contracts/${id}`,
    terminate: (id: string) => `${API_BASE_URL}contracts/${id}/terminate`,
  },

  // Porezi
  taxes: {
    list: `${API_BASE_URL}taxes`,
    pay: (id: string) => `${API_BASE_URL}taxes/${id}/pay`,
    vatReport: `${API_BASE_URL}taxes/vat-report`,
    generatePPPDV: `${API_BASE_URL}taxes/pppdv/generate`,
  },

  // Izvodi banke
  bankStatements: {
    list: `${API_BASE_URL}bank-statements`,
    import: `${API_BASE_URL}bank-statements/import`,
    transactions: (id: string) => `${API_BASE_URL}bank-statements/${id}/transactions`,
  },

  // Izveštaji
  reports: {
    financial: `${API_BASE_URL}reports/financial`,
    sales: `${API_BASE_URL}reports/sales`,
    cashFlow: `${API_BASE_URL}reports/cash-flow`,
    profitability: `${API_BASE_URL}reports/profitability`,
  },

  // Dashboard
  dashboard: {
    stats: `${API_BASE_URL}dashboard/stats`,
    realtimeUpdates: `${API_BASE_URL}dashboard/realtime`,
  },

  // PDV Smanjenje (kupovine na račun firme)
  vatReduction: {
    list: `${API_BASE_URL}vat-reduction/purchases`,
    create: `${API_BASE_URL}vat-reduction/purchases`,
    summary: `${API_BASE_URL}vat-reduction/summary`,
  },

  // CRM
  crmNotes: {
    list: `${API_BASE_URL}crm-notes`,
    get: (id: string) => `${API_BASE_URL}crm-notes/${id}`,
    create: `${API_BASE_URL}crm-notes`,
    update: (id: string) => `${API_BASE_URL}crm-notes/${id}`,
    delete: (id: string) => `${API_BASE_URL}crm-notes/${id}`,
  },

  // Poslovnice
  branches: {
    list: `${API_BASE_URL}branches`,
    get: (id: string) => `${API_BASE_URL}branches/${id}`,
    create: `${API_BASE_URL}branches`,
    update: (id: string) => `${API_BASE_URL}branches/${id}`,
    delete: (id: string) => `${API_BASE_URL}branches/${id}`,
    toggleActive: (id: string) => `${API_BASE_URL}branches/${id}/toggle`,
  },

  // Fiskalne blagajne
  fiscalRegisters: {
    list: `${API_BASE_URL}fiscal-registers`,
    get: (id: string) => `${API_BASE_URL}fiscal-registers/${id}`,
    create: `${API_BASE_URL}fiscal-registers`,
    update: (id: string) => `${API_BASE_URL}fiscal-registers/${id}`,
    delete: (id: string) => `${API_BASE_URL}fiscal-registers/${id}`,
  },

  // POS terminali
  posTerminals: {
    list: `${API_BASE_URL}pos-terminals`,
    get: (id: string) => `${API_BASE_URL}pos-terminals/${id}`,
    create: `${API_BASE_URL}pos-terminals`,
    update: (id: string) => `${API_BASE_URL}pos-terminals/${id}`,
    delete: (id: string) => `${API_BASE_URL}pos-terminals/${id}`,
  },

  // Narudžbe
  orders: {
    received: `${API_BASE_URL}orders/received`,
    issued: `${API_BASE_URL}orders/issued`,
    create: `${API_BASE_URL}orders`,
    updateStatus: (id: string) => `${API_BASE_URL}orders/${id}/status`,
  },

  // Dobavljači
  suppliers: {
    list: `${API_BASE_URL}suppliers`,
    create: `${API_BASE_URL}suppliers`,
    update: (id: string) => `${API_BASE_URL}suppliers/${id}`,
  },

  // Cenovnici
  priceLists: {
    list: `${API_BASE_URL}price-lists`,
    create: `${API_BASE_URL}price-lists`,
  },

  // Kategorije
  categories: {
    list: `${API_BASE_URL}categories`,
    create: `${API_BASE_URL}categories`,
  },

  // Serijski brojevi
  serialNumbers: {
    list: `${API_BASE_URL}serial-numbers`,
    create: `${API_BASE_URL}serial-numbers`,
  },

  // HR - Evidencija radnog vremena
  timeTracking: {
    list: `${API_BASE_URL}time-tracking`,
    create: `${API_BASE_URL}time-tracking`,
  },

  // HR - Obračun zarada
  payroll: {
    list: `${API_BASE_URL}payroll`,
    calculate: `${API_BASE_URL}payroll/calculate`,
    approve: (id: string) => `${API_BASE_URL}payroll/${id}/approve`,
  },

  // HR - Odsustva
  absences: {
    list: `${API_BASE_URL}absences`,
    create: `${API_BASE_URL}absences`,
    approve: (id: string) => `${API_BASE_URL}absences/${id}/approve`,
  },

  // HR - Službena putovanja
  businessTrips: {
    list: `${API_BASE_URL}business-trips`,
    create: `${API_BASE_URL}business-trips`,
  },

  // HR - Putni nalozi
  travelOrders: {
    list: `${API_BASE_URL}travel-orders`,
    create: `${API_BASE_URL}travel-orders`,
  },

  // Osnovna sredstva
  fixedAssets: {
    list: `${API_BASE_URL}fixed-assets`,
    create: `${API_BASE_URL}fixed-assets`,
  },

  // Amortizacija
  depreciation: {
    list: `${API_BASE_URL}depreciation`,
    calculate: `${API_BASE_URL}depreciation/calculate`,
  },

  // Promocije
  promotions: {
    list: `${API_BASE_URL}promotions`,
    create: `${API_BASE_URL}promotions`,
  },

  // Povratne informacije
  feedback: {
    list: `${API_BASE_URL}feedback`,
    updateStatus: (id: string) => `${API_BASE_URL}feedback/${id}/status`,
  },

  // Podsetnici
  reminders: {
    list: `${API_BASE_URL}reminders`,
    create: `${API_BASE_URL}reminders`,
    complete: (id: string) => `${API_BASE_URL}reminders/${id}/complete`,
  },

  // Inventar
  inventory: {
    movements: `${API_BASE_URL}inventory/movements`,
    createMovement: `${API_BASE_URL}inventory/movements`,
    lists: `${API_BASE_URL}inventory/lists`,
    createList: `${API_BASE_URL}inventory/lists`,
    get: (id: string) => `${API_BASE_URL}inventory/lists/${id}`,
    tracking: `${API_BASE_URL}inventory/tracking`,
  },

  // Magacini
  warehouses: {
    list: `${API_BASE_URL}warehouses`,
    get: (id: string) => `${API_BASE_URL}warehouses/${id}`,
    create: `${API_BASE_URL}warehouses`,
    update: (id: string) => `${API_BASE_URL}warehouses/${id}`,
    delete: (id: string) => `${API_BASE_URL}warehouses/${id}`,
    stock: (id: string) => `${API_BASE_URL}warehouses/${id}/stock`,
  },

  // Projekti
  projects: {
    list: `${API_BASE_URL}projects`,
    get: (id: string) => `${API_BASE_URL}projects/${id}`,
    create: `${API_BASE_URL}projects`,
    update: (id: string) => `${API_BASE_URL}projects/${id}`,
    delete: (id: string) => `${API_BASE_URL}projects/${id}`,
  },

  // Zadaci
  tasks: {
    list: `${API_BASE_URL}tasks`,
    get: (id: string) => `${API_BASE_URL}tasks/${id}`,
    create: `${API_BASE_URL}tasks`,
    update: (id: string) => `${API_BASE_URL}tasks/${id}`,
    delete: (id: string) => `${API_BASE_URL}tasks/${id}`,
    updateStatus: (id: string) => `${API_BASE_URL}tasks/${id}/status`,
    byProject: (projectId: string) => `${API_BASE_URL}projects/${projectId}/tasks`,
  },

  // Profakture
  proforma: {
    list: `${API_BASE_URL}proforma`,
    get: (id: string) => `${API_BASE_URL}proforma/${id}`,
    create: `${API_BASE_URL}proforma`,
    update: (id: string) => `${API_BASE_URL}proforma/${id}`,
    delete: (id: string) => `${API_BASE_URL}proforma/${id}`,
    convertToInvoice: (id: string) => `${API_BASE_URL}proforma/${id}/convert`,
    send: (id: string) => `${API_BASE_URL}proforma/${id}/send`,
  },

  // Primljene fakture
  receivedInvoices: {
    list: `${API_BASE_URL}received-invoices`,
    get: (id: string) => `${API_BASE_URL}received-invoices/${id}`,
    create: `${API_BASE_URL}received-invoices`,
    update: (id: string) => `${API_BASE_URL}received-invoices/${id}`,
    delete: (id: string) => `${API_BASE_URL}received-invoices/${id}`,
    approve: (id: string) => `${API_BASE_URL}received-invoices/${id}/approve`,
  },

  // Ponavljajuće fakture
  recurringInvoices: {
    list: `${API_BASE_URL}recurring-invoices`,
    get: (id: string) => `${API_BASE_URL}recurring-invoices/${id}`,
    create: `${API_BASE_URL}recurring-invoices`,
    update: (id: string) => `${API_BASE_URL}recurring-invoices/${id}`,
    delete: (id: string) => `${API_BASE_URL}recurring-invoices/${id}`,
    toggle: (id: string) => `${API_BASE_URL}recurring-invoices/${id}/toggle`,
  },

  // Knjiga evidencije (Ledger)
  ledger: {
    list: `${API_BASE_URL}ledger`,
    get: (id: string) => `${API_BASE_URL}ledger/${id}`,
    create: `${API_BASE_URL}ledger`,
    summary: `${API_BASE_URL}ledger/summary`,
    export: `${API_BASE_URL}ledger/export`,
  },

  // Izveštaji po klijentima
  clientReports: {
    list: `${API_BASE_URL}reports/clients`,
    get: (clientId: string) => `${API_BASE_URL}reports/clients/${clientId}`,
    export: `${API_BASE_URL}reports/clients/export`,
  },

  // Plaćanja dobavljačima
  supplierPayments: {
    list: `${API_BASE_URL}supplier-payments`,
    create: `${API_BASE_URL}supplier-payments`,
    get: (id: string) => `${API_BASE_URL}supplier-payments/${id}`,
    approve: (id: string) => `${API_BASE_URL}supplier-payments/${id}/approve`,
  },

  // PDV evidencija
  vatRecords: {
    list: `${API_BASE_URL}vat-records`,
    create: `${API_BASE_URL}vat-records`,
    get: (id: string) => `${API_BASE_URL}vat-records/${id}`,
    export: `${API_BASE_URL}vat-records/export`,
  },

  // PPPDV
  pppdv: {
    list: `${API_BASE_URL}pppdv`,
    generate: `${API_BASE_URL}pppdv/generate`,
    get: (id: string) => `${API_BASE_URL}pppdv/${id}`,
    submit: (id: string) => `${API_BASE_URL}pppdv/${id}/submit`,
    export: (id: string) => `${API_BASE_URL}pppdv/${id}/export`,
  },

  // Zalihe (Stock)
  stock: {
    list: `${API_BASE_URL}stock`,
    get: (id: string) => `${API_BASE_URL}stock/${id}`,
    adjust: (id: string) => `${API_BASE_URL}stock/${id}/adjust`,
    transfer: `${API_BASE_URL}stock/transfer`,
    lowStock: `${API_BASE_URL}stock/low-stock`,
  },

  // Kampanje
  campaigns: {
    list: `${API_BASE_URL}campaigns`,
    get: (id: string) => `${API_BASE_URL}campaigns/${id}`,
    create: `${API_BASE_URL}campaigns`,
    update: (id: string) => `${API_BASE_URL}campaigns/${id}`,
    delete: (id: string) => `${API_BASE_URL}campaigns/${id}`,
    stats: (id: string) => `${API_BASE_URL}campaigns/${id}/stats`,
  },

  // HR - Godišnja obrada
  yearlyProcessing: {
    list: `${API_BASE_URL}yearly-processing`,
    create: `${API_BASE_URL}yearly-processing`,
    get: (id: string) => `${API_BASE_URL}yearly-processing/${id}`,
    execute: (id: string) => `${API_BASE_URL}yearly-processing/${id}/execute`,
  },

  // Automatizacija
  automation: {
    rules: `${API_BASE_URL}automation/rules`,
    getRule: (id: string) => `${API_BASE_URL}automation/rules/${id}`,
    createRule: `${API_BASE_URL}automation/rules`,
    updateRule: (id: string) => `${API_BASE_URL}automation/rules/${id}`,
    deleteRule: (id: string) => `${API_BASE_URL}automation/rules/${id}`,
    toggleRule: (id: string) => `${API_BASE_URL}automation/rules/${id}/toggle`,
    logs: `${API_BASE_URL}automation/logs`,
  },

  // Logovi sistema
  logs: {
    list: `${API_BASE_URL}logs`,
    get: (id: string) => `${API_BASE_URL}logs/${id}`,
    clear: `${API_BASE_URL}logs/clear`,
    export: `${API_BASE_URL}logs/export`,
  },

  // Upravljanje korisnicima (Admin)
  users: {
    list: `${API_BASE_URL}users`,
    get: (id: string) => `${API_BASE_URL}users/${id}`,
    create: `${API_BASE_URL}users`,
    update: (id: string) => `${API_BASE_URL}users/${id}`,
    delete: (id: string) => `${API_BASE_URL}users/${id}`,
    permissions: (id: string) => `${API_BASE_URL}users/${id}/permissions`,
    updatePermissions: (id: string) => `${API_BASE_URL}users/${id}/permissions`,
  },

  // Profil korisnika
  profile: {
    get: `${API_BASE_URL}profile`,
    update: `${API_BASE_URL}profile`,
    changePassword: `${API_BASE_URL}profile/change-password`,
    notifications: `${API_BASE_URL}profile/notifications`,
    updateNotifications: `${API_BASE_URL}profile/notifications`,
  },

  // Podešavanja
  settings: {
    get: `${API_BASE_URL}settings`,
    update: `${API_BASE_URL}settings`,
    company: `${API_BASE_URL}settings/company`,
    updateCompany: `${API_BASE_URL}settings/company`,
  },
};

// Helper funkcija za API pozive
export async function apiRequest<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  if (DEMO_MODE) {
    throw new Error('API nije dostupan u demo modu');
  }

  const response = await fetch(endpoint, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    throw new Error(`API greška: ${response.status}`);
  }

  return response.json();
}
