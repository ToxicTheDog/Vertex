// API Service - centralizovani servis za sve API pozive
import { DEMO_MODE, API_ENDPOINTS, REALTIME_UPDATE_INTERVAL } from '@/config/api';
import { logService, LogAction } from './logService';

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginatedResponse<T> {
  success: boolean;
  data: T[];
  total: number;
  page: number;
  pageSize: number;
}

// Helper za demo delay simulaciju
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

// Centralni API request handler
async function makeRequest<T>(
  endpoint: string,
  options: RequestInit = {},
  resourceType: string,
  action: LogAction
): Promise<ApiResponse<T>> {
  // Log akciju
  logService.log({
    action,
    resource: resourceType,
    details: `${options.method || 'GET'} ${endpoint}`,
    userId: getCurrentUserId(),
    userName: getCurrentUserName()
  });

  if (DEMO_MODE) {
    await simulateDelay();
    return {
      success: true,
      message: 'Demo mod - podaci nisu sačuvani na serveru'
    };
  }

  try {
    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${getAuthToken()}`,
        ...options.headers,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      return {
        success: false,
        error: errorData.message || `Greška: ${response.status}`,
        message: errorData.msg || 'Došlo je do greške prilikom obrade zahteva'
      };
    }

    const data = await response.json();
    return {
      success: true,
      data: data.data || data,
      message: data.message
    };
  } catch (error) {
    console.error('API Error:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Nepoznata greška',
      message: 'Nije moguće povezati se sa serverom'
    };
  }
}

// Helper funkcije za auth
function getAuthToken(): string {
  if (DEMO_MODE) return 'demo-token';
  return localStorage.getItem('auth_token') || '';
}

function getCurrentUserId(): string {
  if (DEMO_MODE) return 'demo-user';
  const user = localStorage.getItem('current_user');
  if (user) {
    try {
      return JSON.parse(user).id || 'unknown';
    } catch {
      return 'unknown';
    }
  }
  return 'unknown';
}

function getCurrentUserName(): string {
  if (DEMO_MODE) return 'Demo Korisnik';
  const user = localStorage.getItem('current_user');
  if (user) {
    try {
      return JSON.parse(user).name || 'Nepoznat';
    } catch {
      return 'Nepoznat';
    }
  }
  return 'Nepoznat';
}

// ==================== KLIJENTI ====================
export const clientsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.clients.list, { method: 'GET' }, 'clients', 'view');
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.clients.get(id), { method: 'GET' }, 'clients', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.clients.create,
      { method: 'POST', body: JSON.stringify(data) },
      'clients',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.clients.update(id),
      { method: 'PUT', body: JSON.stringify(data) },
      'clients',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.clients.delete(id),
      { method: 'DELETE' },
      'clients',
      'delete'
    );
  }
};

// ==================== FAKTURE ====================
export const invoicesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.invoices.list, { method: 'GET' }, 'invoices', 'view');
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.invoices.get(id), { method: 'GET' }, 'invoices', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.invoices.create,
      { method: 'POST', body: JSON.stringify(data) },
      'invoices',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.invoices.update(id),
      { method: 'PUT', body: JSON.stringify(data) },
      'invoices',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.invoices.delete(id),
      { method: 'DELETE' },
      'invoices',
      'delete'
    );
  },

  async send(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.invoices.send(id),
      { method: 'POST' },
      'invoices',
      'send'
    );
  },

  async markPaid(id: string, paidDate: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.invoices.markPaid(id),
      { method: 'POST', body: JSON.stringify({ paidDate }) },
      'invoices',
      'update'
    );
  }
};

// ==================== NALOZI ZA PLAĆANJE ====================
export const paymentOrdersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.paymentOrders.list, { method: 'GET' }, 'payment-orders', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.paymentOrders.create,
      { method: 'POST', body: JSON.stringify(data) },
      'payment-orders',
      'create'
    );
  },

  async approve(id: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.paymentOrders.approve(id),
      { method: 'PUT' },
      'payment-orders',
      'approve'
    );
  },

  async execute(id: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.paymentOrders.execute(id),
      { method: 'PUT' },
      'payment-orders',
      'execute'
    );
  },

  async reject(id: string, reason: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.paymentOrders.reject(id),
      { method: 'PUT', body: JSON.stringify({ reason }) },
      'payment-orders',
      'reject'
    );
  }
};

// ==================== ZAPOSLENI ====================
export const employeesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.employees.list, { method: 'GET' }, 'employees', 'view');
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.employees.get(id), { method: 'GET' }, 'employees', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.employees.create,
      { method: 'POST', body: JSON.stringify(data) },
      'employees',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.employees.update(id),
      { method: 'PUT', body: JSON.stringify(data) },
      'employees',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.employees.delete(id),
      { method: 'DELETE' },
      'employees',
      'delete'
    );
  }
};

// ==================== ARTIKLI ====================
export const articlesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.articles.list, { method: 'GET' }, 'articles', 'view');
  },

  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.articles.get(id), { method: 'GET' }, 'articles', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.articles.create,
      { method: 'POST', body: JSON.stringify(data) },
      'articles',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.articles.update(id),
      { method: 'PUT', body: JSON.stringify(data) },
      'articles',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.articles.delete(id),
      { method: 'DELETE' },
      'articles',
      'delete'
    );
  },

  async updateStock(id: string, quantity: number, type: 'add' | 'remove'): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.articles.updateStock(id),
      { method: 'PUT', body: JSON.stringify({ quantity, type }) },
      'articles',
      'update'
    );
  }
};

// ==================== UGOVORI ====================
export const contractsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.contracts.list, { method: 'GET' }, 'contracts', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.contracts.create,
      { method: 'POST', body: JSON.stringify(data) },
      'contracts',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.contracts.update(id),
      { method: 'PUT', body: JSON.stringify(data) },
      'contracts',
      'update'
    );
  },

  async terminate(id: string, reason: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.contracts.terminate(id),
      { method: 'PUT', body: JSON.stringify({ reason }) },
      'contracts',
      'terminate'
    );
  }
};

// ==================== POREZI ====================
export const taxesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.taxes.list, { method: 'GET' }, 'taxes', 'view');
  },

  async pay(id: string, paidDate: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.taxes.pay(id),
      { method: 'POST', body: JSON.stringify({ paidDate }) },
      'taxes',
      'pay'
    );
  },

  async getVatReport(period: string): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.taxes.vatReport}?period=${period}`,
      { method: 'GET' },
      'taxes',
      'view'
    );
  },

  async generatePPPDV(period: string): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.taxes.generatePPPDV,
      { method: 'POST', body: JSON.stringify({ period }) },
      'taxes',
      'generate'
    );
  }
};

// ==================== IZVODI BANKE ====================
export const bankStatementsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.bankStatements.list, { method: 'GET' }, 'bank-statements', 'view');
  },

  async import(file: File): Promise<ApiResponse<any>> {
    if (DEMO_MODE) {
      await simulateDelay();
      return { success: true, message: 'Demo mod - fajl nije uploadovan' };
    }
    
    const formData = new FormData();
    formData.append('file', file);
    
    return makeRequest(
      API_ENDPOINTS.bankStatements.import,
      { method: 'POST', body: formData, headers: {} },
      'bank-statements',
      'import'
    );
  },

  async getTransactions(id: string): Promise<ApiResponse<any[]>> {
    return makeRequest(
      API_ENDPOINTS.bankStatements.transactions(id),
      { method: 'GET' },
      'bank-statements',
      'view'
    );
  }
};

// ==================== IZVEŠTAJI ====================
export const reportsApi = {
  async getFinancial(from: string, to: string): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.reports.financial}?from=${from}&to=${to}`,
      { method: 'GET' },
      'reports',
      'view'
    );
  },

  async getSales(from: string, to: string, groupBy?: string): Promise<ApiResponse<any>> {
    let url = `${API_ENDPOINTS.reports.sales}?from=${from}&to=${to}`;
    if (groupBy) url += `&groupBy=${groupBy}`;
    return makeRequest(url, { method: 'GET' }, 'reports', 'view');
  },

  async getCashFlow(from: string, to: string): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.reports.cashFlow}?from=${from}&to=${to}`,
      { method: 'GET' },
      'reports',
      'view'
    );
  },

  async getProfitability(from: string, to: string): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.reports.profitability}?from=${from}&to=${to}`,
      { method: 'GET' },
      'reports',
      'view'
    );
  }
};

// ==================== DASHBOARD ====================
export const dashboardApi = {
  async getStats(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.dashboard.stats, { method: 'GET' }, 'dashboard', 'view');
  },

  async getRealtimeUpdates(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.dashboard.realtimeUpdates, { method: 'GET' }, 'dashboard', 'view');
  }
};

// ==================== PDV SMANJENJE ====================
export const vatReductionApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.vatReduction.list, { method: 'GET' }, 'vat-reduction', 'view');
  },

  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      API_ENDPOINTS.vatReduction.create,
      { method: 'POST', body: JSON.stringify(data) },
      'vat-reduction',
      'create'
    );
  },

  async getSummary(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.vatReduction.summary, { method: 'GET' }, 'vat-reduction', 'view');
  }
};

// ==================== ADMIN ====================
export const adminApi = {
  async getUsers(): Promise<ApiResponse<any[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const users = JSON.parse(localStorage.getItem('erp_users') || '[]');
      return { success: true, data: users };
    }
    return makeRequest(`${API_ENDPOINTS.auth.me}/users`, { method: 'GET' }, 'admin', 'view');
  },

  async createUser(data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.auth.login}/register`,
      { method: 'POST', body: JSON.stringify(data) },
      'admin',
      'create'
    );
  },

  async updateUser(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(
      `${API_ENDPOINTS.auth.me}/users/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      'admin',
      'update'
    );
  },

  async deleteUser(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      `${API_ENDPOINTS.auth.me}/users/${id}`,
      { method: 'DELETE' },
      'admin',
      'delete'
    );
  },

  async getUserPermissions(userId: string): Promise<ApiResponse<any>> {
    if (DEMO_MODE) {
      await simulateDelay();
      const permissions = JSON.parse(localStorage.getItem(`erp_permissions_${userId}`) || '{}');
      return { success: true, data: permissions };
    }
    return makeRequest(
      `${API_ENDPOINTS.auth.me}/users/${userId}/permissions`,
      { method: 'GET' },
      'admin',
      'view'
    );
  },

  async updateUserPermissions(userId: string, permissions: any): Promise<ApiResponse<any>> {
    if (DEMO_MODE) {
      await simulateDelay();
      localStorage.setItem(`erp_permissions_${userId}`, JSON.stringify(permissions));
      return { success: true, message: 'Dozvole sačuvane' };
    }
    return makeRequest(
      `${API_ENDPOINTS.auth.me}/users/${userId}/permissions`,
      { method: 'PUT', body: JSON.stringify(permissions) },
      'admin',
      'update'
    );
  },

  async getLogs(filters?: { from?: string; to?: string; action?: string; userId?: string }): Promise<ApiResponse<any[]>> {
    if (DEMO_MODE) {
      await simulateDelay();
      return { success: true, data: logService.getLogs() };
    }
    let url = `${API_ENDPOINTS.auth.me}/logs`;
    if (filters) {
      const params = new URLSearchParams();
      if (filters.from) params.append('from', filters.from);
      if (filters.to) params.append('to', filters.to);
      if (filters.action) params.append('action', filters.action);
      if (filters.userId) params.append('userId', filters.userId);
      url += `?${params.toString()}`;
    }
    return makeRequest(url, { method: 'GET' }, 'admin', 'view');
  }
};

// Real-time update helper
export function startRealtimeUpdates(callback: (data: any) => void, interval: number = REALTIME_UPDATE_INTERVAL) {
  if (DEMO_MODE) {
    // U demo modu, simuliraj random promene
    const intervalId = setInterval(() => {
      callback({
        type: 'demo_update',
        timestamp: new Date().toISOString(),
        data: {
          newInvoices: Math.floor(Math.random() * 3),
          newPayments: Math.floor(Math.random() * 5) * 1000,
          newClients: Math.floor(Math.random() * 2)
        }
      });
    }, interval);
    
    return () => clearInterval(intervalId);
  }

  // Za production, koristi polling ili WebSocket
  const intervalId = setInterval(async () => {
    const response = await dashboardApi.getRealtimeUpdates();
    if (response.success && response.data) {
      callback(response.data);
    }
  }, interval);

  return () => clearInterval(intervalId);
}
