// API konfiguracija
// Promenite DEMO_MODE na false kada je backend spreman

export const DEMO_MODE = true;

export const API_BASE_URL = 'https://api.vertex.com/';

// Interval za real-time ažuriranje (u milisekundama)
export const REALTIME_UPDATE_INTERVAL = 30000; // 30 sekundi

// API endpoints
export const API_ENDPOINTS = {
  // Autentifikacija
  auth: {
    login: `${API_BASE_URL}auth/login`,
    logout: `${API_BASE_URL}auth/logout`,
    me: `${API_BASE_URL}auth/me`,
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
  crm: {
    notes: `${API_BASE_URL}crm/notes`,
    createNote: `${API_BASE_URL}crm/notes`,
  },
  
  // Poslovnice
  branches: {
    list: `${API_BASE_URL}branches`,
    create: `${API_BASE_URL}branches`,
    update: (id: string) => `${API_BASE_URL}branches/${id}`,
  },
  
  // Fiskalne blagajne
  fiscalRegisters: {
    list: `${API_BASE_URL}fiscal-registers`,
    create: `${API_BASE_URL}fiscal-registers`,
  },
  
  // POS terminali
  posTerminals: {
    list: `${API_BASE_URL}pos-terminals`,
    create: `${API_BASE_URL}pos-terminals`,
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
    lists: `${API_BASE_URL}inventory/lists`,
    createList: `${API_BASE_URL}inventory/lists`,
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
