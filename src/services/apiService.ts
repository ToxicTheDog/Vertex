// API Service - centralizovani servis za sve API pozive
// Svi zahtevi idu preko backend API-ja - NIKADA direktno na bazu
import { DEMO_MODE, API_ENDPOINTS, REALTIME_UPDATE_INTERVAL } from '@/config/api';
import { logService, LogAction } from './logService';
import { authService } from './authService';
import { Branch, CrmNote, FiscalRegister, PosTerminal } from '@/data/demoData';

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

// Centralni API request handler sa automatskim token refresh-om
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
    // Osiguraj validan token pre svakog zahteva
    const token = await authService.ensureValidToken();

    const response = await fetch(endpoint, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...options.headers,
      },
    });

    // Ako je 401, pokušaj refresh i ponovi zahtev
    if (response.status === 401) {
      console.warn('[API] 401 Unauthorized - pokušaj refresh tokena');
      const refreshed = await authService.refreshAccessToken();

      if (refreshed) {
        // Ponovi originalni zahtev sa novim tokenom
        const newToken = authService.getToken();
        const retryResponse = await fetch(endpoint, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${newToken}`,
            ...options.headers,
          },
        });

        if (!retryResponse.ok) {
          const errorData = await retryResponse.json().catch(() => ({}));
          return {
            success: false,
            error: errorData.message || `Greška: ${retryResponse.status}`,
            message: errorData.msg || 'Došlo je do greške prilikom obrade zahteva'
          };
        }

        const data = await retryResponse.json();
        return {
          success: true,
          data: data.data || data,
          message: data.message
        };
      } else {
        // Refresh nije uspeo - korisnik mora ponovo da se prijavi
        return {
          success: false,
          error: 'Sesija je istekla',
          message: 'Vaša sesija je istekla. Molimo prijavite se ponovo.'
        };
      }
    }

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
function getCurrentUserId(): string {
  if (DEMO_MODE) return 'demo-user';
  const user = authService.getCurrentUser();
  return user?.id || 'unknown';
}

function getCurrentUserName(): string {
  if (DEMO_MODE) return 'Demo Korisnik';
  const user = authService.getCurrentUser();
  return user?.name || 'Nepoznat';
}

// ==================== POSLOVNICE (BRANCHES) ====================
export const branchesApi = {
  async getAll(): Promise<ApiResponse<Branch[]>> {
    return makeRequest(API_ENDPOINTS.branches?.list || '/api/branches', { method: 'GET' }, 'branches', 'view');
  },

  async getById(id: string): Promise<ApiResponse<Branch>> {
    return makeRequest(API_ENDPOINTS.branches?.get(id) || `/api/branches/${id}`, { method: 'GET' }, 'branches', 'view');
  },

  async create(data: any): Promise<ApiResponse<Branch>> {
    return makeRequest(
      API_ENDPOINTS.branches?.create || '/api/branches',
      { method: 'POST', body: JSON.stringify(data) },
      'branches',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<Branch>> {
    return makeRequest(
      API_ENDPOINTS.branches?.update(id) || `/api/branches/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      'branches',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.branches?.delete(id) || `/api/branches/${id}`,
      { method: 'DELETE' },
      'branches',
      'delete'
    );
  },

  async toggleActive(id: string, isActive: boolean): Promise<ApiResponse<Branch>> {
    return makeRequest(
      API_ENDPOINTS.branches?.toggleActive(id) || `/api/branches/${id}/toggle`,
      { method: 'PATCH', body: JSON.stringify({ isActive }) },
      'branches',
      'update'
    );
  }
};

// ==================== POS TERMINALI ====================
export const posTerminalsApi = {
  async getAll(): Promise<ApiResponse<PosTerminal[]>> {
    return makeRequest(
      API_ENDPOINTS.posTerminals?.list || '/api/pos-terminals',
      { method: 'GET' },
      'pos-terminals',
      'view'
    );
  },

  async getById(id: string): Promise<ApiResponse<PosTerminal>> {
    return makeRequest(
      API_ENDPOINTS.posTerminals?.get(id) || `/api/pos-terminals/${id}`,
      { method: 'GET' },
      'pos-terminals',
      'view'
    );
  },

  async create(data: any): Promise<ApiResponse<PosTerminal>> {
    return makeRequest(
      API_ENDPOINTS.posTerminals?.create || '/api/pos-terminals',
      { method: 'POST', body: JSON.stringify(data) },
      'pos-terminals',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<PosTerminal>> {
    return makeRequest(
      API_ENDPOINTS.posTerminals?.update(id) || `/api/pos-terminals/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      'pos-terminals',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.posTerminals?.delete(id) || `/api/pos-terminals/${id}`,
      { method: 'DELETE' },
      'pos-terminals',
      'delete'
    );
  }
};

// ==================== FISKALNE BLAGAJNE ====================
export const fiscalRegistersApi = {
  async getAll(): Promise<ApiResponse<FiscalRegister[]>> {
    return makeRequest(
      API_ENDPOINTS.fiscalRegisters?.list || '/api/fiscal-registers',
      { method: 'GET' },
      'fiscal-registers',
      'view'
    );
  },

  async getById(id: string): Promise<ApiResponse<FiscalRegister>> {
    return makeRequest(
      API_ENDPOINTS.fiscalRegisters?.get(id) || `/api/fiscal-registers/${id}`,
      { method: 'GET' },
      'fiscal-registers',
      'view'
    );
  },

  async create(data: any): Promise<ApiResponse<FiscalRegister>> {
    return makeRequest(
      API_ENDPOINTS.fiscalRegisters?.create || '/api/fiscal-registers',
      { method: 'POST', body: JSON.stringify(data) },
      'fiscal-registers',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<FiscalRegister>> {
    return makeRequest(
      API_ENDPOINTS.fiscalRegisters?.update(id) || `/api/fiscal-registers/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      'fiscal-registers',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.fiscalRegisters?.delete(id) || `/api/fiscal-registers/${id}`,
      { method: 'DELETE' },
      'fiscal-registers',
      'delete'
    );
  }
};

// ==================== CRM BELEŠKE ====================
export const crmNotesApi = {
  async getAll(): Promise<ApiResponse<CrmNote[]>> {
    return makeRequest(API_ENDPOINTS.crmNotes?.list || '/api/crm-notes', { method: 'GET' }, 'crm-notes', 'view');
  },

  async getById(id: string): Promise<ApiResponse<CrmNote>> {
    return makeRequest(
      API_ENDPOINTS.crmNotes?.get(id) || `/api/crm-notes/${id}`,
      { method: 'GET' },
      'crm-notes',
      'view'
    );
  },

  async create(data: any): Promise<ApiResponse<CrmNote>> {
    return makeRequest(
      API_ENDPOINTS.crmNotes?.create || '/api/crm-notes',
      { method: 'POST', body: JSON.stringify(data) },
      'crm-notes',
      'create'
    );
  },

  async update(id: string, data: any): Promise<ApiResponse<CrmNote>> {
    return makeRequest(
      API_ENDPOINTS.crmNotes?.update(id) || `/api/crm-notes/${id}`,
      { method: 'PUT', body: JSON.stringify(data) },
      'crm-notes',
      'update'
    );
  },

  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(
      API_ENDPOINTS.crmNotes?.delete(id) || `/api/crm-notes/${id}`,
      { method: 'DELETE' },
      'crm-notes',
      'delete'
    );
  }
};

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

// ==================== PROFAKTURE ====================
export const proformaApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.proforma.list, { method: 'GET' }, 'proforma', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.proforma.get(id), { method: 'GET' }, 'proforma', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.proforma.create, { method: 'POST', body: JSON.stringify(data) }, 'proforma', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.proforma.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'proforma', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.proforma.delete(id), { method: 'DELETE' }, 'proforma', 'delete');
  },
  async convertToInvoice(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.proforma.convertToInvoice(id), { method: 'POST' }, 'proforma', 'create');
  },
  async send(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.proforma.send(id), { method: 'POST' }, 'proforma', 'send');
  }
};

// ==================== PRIMLJENE FAKTURE ====================
export const receivedInvoicesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.list, { method: 'GET' }, 'received-invoices', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.get(id), { method: 'GET' }, 'received-invoices', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.create, { method: 'POST', body: JSON.stringify(data) }, 'received-invoices', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'received-invoices', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.delete(id), { method: 'DELETE' }, 'received-invoices', 'delete');
  },
  async approve(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.receivedInvoices.approve(id), { method: 'PUT' }, 'received-invoices', 'approve');
  }
};

// ==================== PONAVLJAJUĆE FAKTURE ====================
export const recurringInvoicesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.list, { method: 'GET' }, 'recurring-invoices', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.get(id), { method: 'GET' }, 'recurring-invoices', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.create, { method: 'POST', body: JSON.stringify(data) }, 'recurring-invoices', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'recurring-invoices', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.delete(id), { method: 'DELETE' }, 'recurring-invoices', 'delete');
  },
  async toggle(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.recurringInvoices.toggle(id), { method: 'PUT' }, 'recurring-invoices', 'update');
  }
};

// ==================== KNJIGA EVIDENCIJE (LEDGER) ====================
export const ledgerApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.ledger.list, { method: 'GET' }, 'ledger', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.ledger.get(id), { method: 'GET' }, 'ledger', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.ledger.create, { method: 'POST', body: JSON.stringify(data) }, 'ledger', 'create');
  },
  async getSummary(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.ledger.summary, { method: 'GET' }, 'ledger', 'view');
  },
  async export(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.ledger.export, { method: 'GET' }, 'ledger', 'export');
  }
};

// ==================== IZVEŠTAJI PO KLIJENTIMA ====================
export const clientReportsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.clientReports.list, { method: 'GET' }, 'client-reports', 'view');
  },
  async getById(clientId: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.clientReports.get(clientId), { method: 'GET' }, 'client-reports', 'view');
  },
  async export(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.clientReports.export, { method: 'GET' }, 'client-reports', 'export');
  }
};

// ==================== PLAĆANJA DOBAVLJAČIMA ====================
export const supplierPaymentsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.supplierPayments.list, { method: 'GET' }, 'supplier-payments', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.supplierPayments.create, { method: 'POST', body: JSON.stringify(data) }, 'supplier-payments', 'create');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.supplierPayments.get(id), { method: 'GET' }, 'supplier-payments', 'view');
  },
  async approve(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.supplierPayments.approve(id), { method: 'PUT' }, 'supplier-payments', 'approve');
  }
};

// ==================== PDV EVIDENCIJA ====================
export const vatRecordsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.vatRecords.list, { method: 'GET' }, 'vat-records', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.vatRecords.create, { method: 'POST', body: JSON.stringify(data) }, 'vat-records', 'create');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.vatRecords.get(id), { method: 'GET' }, 'vat-records', 'view');
  },
  async export(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.vatRecords.export, { method: 'GET' }, 'vat-records', 'export');
  }
};

// ==================== PPPDV ====================
export const pppdvApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.pppdv.list, { method: 'GET' }, 'pppdv', 'view');
  },
  async generate(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.pppdv.generate, { method: 'POST', body: JSON.stringify(data) }, 'pppdv', 'create');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.pppdv.get(id), { method: 'GET' }, 'pppdv', 'view');
  },
  async submit(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.pppdv.submit(id), { method: 'POST' }, 'pppdv', 'create');
  },
  async export(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.pppdv.export(id), { method: 'GET' }, 'pppdv', 'export');
  }
};

// ==================== DOBAVLJAČI ====================
export const suppliersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.suppliers.list, { method: 'GET' }, 'suppliers', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.suppliers.create, { method: 'POST', body: JSON.stringify(data) }, 'suppliers', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.suppliers.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'suppliers', 'update');
  }
};

// ==================== NARUDŽBE ====================
export const ordersApi = {
  async getReceived(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.orders.received, { method: 'GET' }, 'orders', 'view');
  },
  async getIssued(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.orders.issued, { method: 'GET' }, 'orders', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.orders.create, { method: 'POST', body: JSON.stringify(data) }, 'orders', 'create');
  },
  async updateStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.orders.updateStatus(id), { method: 'PUT', body: JSON.stringify({ status }) }, 'orders', 'update');
  }
};

// ==================== CENOVNICI ====================
export const priceListsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.priceLists.list, { method: 'GET' }, 'price-lists', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.priceLists.create, { method: 'POST', body: JSON.stringify(data) }, 'price-lists', 'create');
  }
};

// ==================== KATEGORIJE ====================
export const categoriesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.categories.list, { method: 'GET' }, 'categories', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.categories.create, { method: 'POST', body: JSON.stringify(data) }, 'categories', 'create');
  }
};

// ==================== SERIJSKI BROJEVI ====================
export const serialNumbersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.serialNumbers.list, { method: 'GET' }, 'serial-numbers', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.serialNumbers.create, { method: 'POST', body: JSON.stringify(data) }, 'serial-numbers', 'create');
  }
};

// ==================== ZALIHE (STOCK) ====================
export const stockApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.stock.list, { method: 'GET' }, 'stock', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.stock.get(id), { method: 'GET' }, 'stock', 'view');
  },
  async adjust(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.stock.adjust(id), { method: 'PUT', body: JSON.stringify(data) }, 'stock', 'update');
  },
  async transfer(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.stock.transfer, { method: 'POST', body: JSON.stringify(data) }, 'stock', 'create');
  },
  async getLowStock(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.stock.lowStock, { method: 'GET' }, 'stock', 'view');
  }
};

// ==================== MAGACINI ====================
export const warehousesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.warehouses.list, { method: 'GET' }, 'warehouses', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.warehouses.get(id), { method: 'GET' }, 'warehouses', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.warehouses.create, { method: 'POST', body: JSON.stringify(data) }, 'warehouses', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.warehouses.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'warehouses', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.warehouses.delete(id), { method: 'DELETE' }, 'warehouses', 'delete');
  },
  async getStock(id: string): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.warehouses.stock(id), { method: 'GET' }, 'warehouses', 'view');
  }
};

// ==================== INVENTAR ====================
export const inventoryApi = {
  async getMovements(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.inventory.movements, { method: 'GET' }, 'inventory', 'view');
  },
  async createMovement(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.inventory.createMovement, { method: 'POST', body: JSON.stringify(data) }, 'inventory', 'create');
  },
  async getLists(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.inventory.lists, { method: 'GET' }, 'inventory', 'view');
  },
  async createList(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.inventory.createList, { method: 'POST', body: JSON.stringify(data) }, 'inventory', 'create');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.inventory.get(id), { method: 'GET' }, 'inventory', 'view');
  },
  async getTracking(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.inventory.tracking, { method: 'GET' }, 'inventory', 'view');
  }
};

// ==================== PROJEKTI ====================
export const projectsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.projects.list, { method: 'GET' }, 'projects', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.projects.get(id), { method: 'GET' }, 'projects', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.projects.create, { method: 'POST', body: JSON.stringify(data) }, 'projects', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.projects.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'projects', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.projects.delete(id), { method: 'DELETE' }, 'projects', 'delete');
  }
};

// ==================== ZADACI ====================
export const tasksApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.tasks.list, { method: 'GET' }, 'tasks', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.tasks.get(id), { method: 'GET' }, 'tasks', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.tasks.create, { method: 'POST', body: JSON.stringify(data) }, 'tasks', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.tasks.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'tasks', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.tasks.delete(id), { method: 'DELETE' }, 'tasks', 'delete');
  },
  async updateStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.tasks.updateStatus(id), { method: 'PUT', body: JSON.stringify({ status }) }, 'tasks', 'update');
  },
  async getByProject(projectId: string): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.tasks.byProject(projectId), { method: 'GET' }, 'tasks', 'view');
  }
};

// ==================== PODSETNICI ====================
export const remindersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.reminders.list, { method: 'GET' }, 'reminders', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.reminders.create, { method: 'POST', body: JSON.stringify(data) }, 'reminders', 'create');
  },
  async complete(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.reminders.complete(id), { method: 'PUT' }, 'reminders', 'update');
  }
};

// ==================== KAMPANJE ====================
export const campaignsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.campaigns.list, { method: 'GET' }, 'campaigns', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.campaigns.get(id), { method: 'GET' }, 'campaigns', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.campaigns.create, { method: 'POST', body: JSON.stringify(data) }, 'campaigns', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.campaigns.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'campaigns', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.campaigns.delete(id), { method: 'DELETE' }, 'campaigns', 'delete');
  },
  async getStats(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.campaigns.stats(id), { method: 'GET' }, 'campaigns', 'view');
  }
};

// ==================== PROMOCIJE ====================
export const promotionsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.promotions.list, { method: 'GET' }, 'promotions', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.promotions.create, { method: 'POST', body: JSON.stringify(data) }, 'promotions', 'create');
  }
};

// ==================== POVRATNE INFORMACIJE ====================
export const feedbackApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.feedback.list, { method: 'GET' }, 'feedback', 'view');
  },
  async updateStatus(id: string, status: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.feedback.updateStatus(id), { method: 'PUT', body: JSON.stringify({ status }) }, 'feedback', 'update');
  }
};

// ==================== HR - EVIDENCIJA RADNOG VREMENA ====================
export const timeTrackingApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.timeTracking.list, { method: 'GET' }, 'time-tracking', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.timeTracking.create, { method: 'POST', body: JSON.stringify(data) }, 'time-tracking', 'create');
  }
};

// ==================== HR - OBRAČUN ZARADA ====================
export const payrollApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.payroll.list, { method: 'GET' }, 'payroll', 'view');
  },
  async calculate(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.payroll.calculate, { method: 'POST', body: JSON.stringify(data) }, 'payroll', 'create');
  },
  async approve(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.payroll.approve(id), { method: 'PUT' }, 'payroll', 'approve');
  }
};

// ==================== HR - ODSUSTVA ====================
export const absencesApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.absences.list, { method: 'GET' }, 'absences', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.absences.create, { method: 'POST', body: JSON.stringify(data) }, 'absences', 'create');
  },
  async approve(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.absences.approve(id), { method: 'PUT' }, 'absences', 'approve');
  }
};

// ==================== HR - SLUŽBENA PUTOVANJA ====================
export const businessTripsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.businessTrips.list, { method: 'GET' }, 'business-trips', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.businessTrips.create, { method: 'POST', body: JSON.stringify(data) }, 'business-trips', 'create');
  }
};

// ==================== HR - PUTNI NALOZI ====================
export const travelOrdersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.travelOrders.list, { method: 'GET' }, 'travel-orders', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.travelOrders.create, { method: 'POST', body: JSON.stringify(data) }, 'travel-orders', 'create');
  }
};

// ==================== OSNOVNA SREDSTVA ====================
export const fixedAssetsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.fixedAssets.list, { method: 'GET' }, 'fixed-assets', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.fixedAssets.create, { method: 'POST', body: JSON.stringify(data) }, 'fixed-assets', 'create');
  }
};

// ==================== AMORTIZACIJA ====================
export const depreciationApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.depreciation.list, { method: 'GET' }, 'depreciation', 'view');
  },
  async calculate(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.depreciation.calculate, { method: 'POST', body: JSON.stringify(data) }, 'depreciation', 'create');
  }
};

// ==================== GODIŠNJA OBRADA ====================
export const yearlyProcessingApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.yearlyProcessing.list, { method: 'GET' }, 'yearly-processing', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.yearlyProcessing.create, { method: 'POST', body: JSON.stringify(data) }, 'yearly-processing', 'create');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.yearlyProcessing.get(id), { method: 'GET' }, 'yearly-processing', 'view');
  },
  async execute(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.yearlyProcessing.execute(id), { method: 'POST' }, 'yearly-processing', 'execute');
  }
};

// ==================== AUTOMATIZACIJA ====================
export const automationApi = {
  async getRules(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.automation.rules, { method: 'GET' }, 'automation', 'view');
  },
  async getRule(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.automation.getRule(id), { method: 'GET' }, 'automation', 'view');
  },
  async createRule(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.automation.createRule, { method: 'POST', body: JSON.stringify(data) }, 'automation', 'create');
  },
  async updateRule(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.automation.updateRule(id), { method: 'PUT', body: JSON.stringify(data) }, 'automation', 'update');
  },
  async deleteRule(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.automation.deleteRule(id), { method: 'DELETE' }, 'automation', 'delete');
  },
  async toggleRule(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.automation.toggleRule(id), { method: 'PUT' }, 'automation', 'update');
  },
  async getLogs(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.automation.logs, { method: 'GET' }, 'automation', 'view');
  }
};

// ==================== LOGOVI ====================
export const logsApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.logs.list, { method: 'GET' }, 'logs', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.logs.get(id), { method: 'GET' }, 'logs', 'view');
  },
  async clear(): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.logs.clear, { method: 'DELETE' }, 'logs', 'delete');
  },
  async export(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.logs.export, { method: 'GET' }, 'logs', 'export');
  }
};

// ==================== KORISNICI (ADMIN) ====================
export const usersApi = {
  async getAll(): Promise<ApiResponse<any[]>> {
    return makeRequest(API_ENDPOINTS.users.list, { method: 'GET' }, 'users', 'view');
  },
  async getById(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.users.get(id), { method: 'GET' }, 'users', 'view');
  },
  async create(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.users.create, { method: 'POST', body: JSON.stringify(data) }, 'users', 'create');
  },
  async update(id: string, data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.users.update(id), { method: 'PUT', body: JSON.stringify(data) }, 'users', 'update');
  },
  async delete(id: string): Promise<ApiResponse<void>> {
    return makeRequest(API_ENDPOINTS.users.delete(id), { method: 'DELETE' }, 'users', 'delete');
  },
  async getPermissions(id: string): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.users.permissions(id), { method: 'GET' }, 'users', 'view');
  },
  async updatePermissions(id: string, permissions: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.users.updatePermissions(id), { method: 'PUT', body: JSON.stringify(permissions) }, 'users', 'update');
  }
};

// ==================== PROFIL ====================
export const profileApi = {
  async get(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.profile.get, { method: 'GET' }, 'profile', 'view');
  },
  async update(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.profile.update, { method: 'PUT', body: JSON.stringify(data) }, 'profile', 'update');
  },
  async changePassword(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.profile.changePassword, { method: 'POST', body: JSON.stringify(data) }, 'profile', 'update');
  },
  async getNotifications(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.profile.notifications, { method: 'GET' }, 'profile', 'view');
  },
  async updateNotifications(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.profile.updateNotifications, { method: 'PUT', body: JSON.stringify(data) }, 'profile', 'update');
  }
};

// ==================== PODEŠAVANJA ====================
export const settingsApi = {
  async get(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.settings.get, { method: 'GET' }, 'settings', 'view');
  },
  async update(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.settings.update, { method: 'PUT', body: JSON.stringify(data) }, 'settings', 'update');
  },
  async getCompany(): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.settings.company, { method: 'GET' }, 'settings', 'view');
  },
  async updateCompany(data: any): Promise<ApiResponse<any>> {
    return makeRequest(API_ENDPOINTS.settings.updateCompany, { method: 'PUT', body: JSON.stringify(data) }, 'settings', 'update');
  }
};

// Real-time update helper
export function startRealtimeUpdates(callback: (data: any) => void, interval: number = REALTIME_UPDATE_INTERVAL) {
  if (DEMO_MODE) {
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

  const intervalId = setInterval(async () => {
    const response = await dashboardApi.getRealtimeUpdates();
    if (response.success && response.data) {
      callback(response.data);
    }
  }, interval);

  return () => clearInterval(intervalId);
}
