// Log Service - sistem za praćenje akcija korisnika

export type LogAction = 
  | 'view' 
  | 'create' 
  | 'update' 
  | 'delete' 
  | 'approve' 
  | 'reject' 
  | 'execute' 
  | 'send' 
  | 'import' 
  | 'export' 
  | 'login' 
  | 'logout' 
  | 'pay'
  | 'terminate'
  | 'generate';

export interface LogEntry {
  id: string;
  timestamp: string;
  action: LogAction;
  resource: string;
  resourceId?: string;
  details: string;
  userId: string;
  userName: string;
  ipAddress?: string;
  userAgent?: string;
}

const LOG_STORAGE_KEY = 'erp_activity_logs';
const MAX_LOGS = 1000;

class LogService {
  private logs: LogEntry[] = [];

  constructor() {
    this.loadLogs();
  }

  private loadLogs(): void {
    try {
      const stored = localStorage.getItem(LOG_STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch (error) {
      console.error('Error loading logs:', error);
      this.logs = [];
    }
  }

  private saveLogs(): void {
    try {
      // Zadrži samo poslednjih MAX_LOGS zapisa
      if (this.logs.length > MAX_LOGS) {
        this.logs = this.logs.slice(-MAX_LOGS);
      }
      localStorage.setItem(LOG_STORAGE_KEY, JSON.stringify(this.logs));
    } catch (error) {
      console.error('Error saving logs:', error);
    }
  }

  log(entry: Omit<LogEntry, 'id' | 'timestamp' | 'ipAddress' | 'userAgent'>): void {
    const newEntry: LogEntry = {
      ...entry,
      id: crypto.randomUUID(),
      timestamp: new Date().toISOString(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : undefined
    };

    this.logs.push(newEntry);
    this.saveLogs();
  }

  getLogs(filters?: {
    from?: string;
    to?: string;
    action?: LogAction;
    resource?: string;
    userId?: string;
  }): LogEntry[] {
    let filtered = [...this.logs];

    if (filters) {
      if (filters.from) {
        filtered = filtered.filter(log => log.timestamp >= filters.from!);
      }
      if (filters.to) {
        filtered = filtered.filter(log => log.timestamp <= filters.to!);
      }
      if (filters.action) {
        filtered = filtered.filter(log => log.action === filters.action);
      }
      if (filters.resource) {
        filtered = filtered.filter(log => log.resource === filters.resource);
      }
      if (filters.userId) {
        filtered = filtered.filter(log => log.userId === filters.userId);
      }
    }

    // Sortiraj po vremenu (najnoviji prvi)
    return filtered.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  getLogsByUser(userId: string): LogEntry[] {
    return this.getLogs({ userId });
  }

  getRecentLogs(count: number = 50): LogEntry[] {
    return this.getLogs().slice(0, count);
  }

  clearLogs(): void {
    this.logs = [];
    this.saveLogs();
  }

  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }

  getActionLabel(action: LogAction): string {
    const labels: Record<LogAction, string> = {
      view: 'Pregled',
      create: 'Kreiranje',
      update: 'Izmena',
      delete: 'Brisanje',
      approve: 'Odobrenje',
      reject: 'Odbijanje',
      execute: 'Izvršenje',
      send: 'Slanje',
      import: 'Uvoz',
      export: 'Izvoz',
      login: 'Prijava',
      logout: 'Odjava',
      pay: 'Plaćanje',
      terminate: 'Raskid',
      generate: 'Generisanje'
    };
    return labels[action] || action;
  }

  getResourceLabel(resource: string): string {
    const labels: Record<string, string> = {
      'clients': 'Klijenti',
      'invoices': 'Fakture',
      'payment-orders': 'Nalozi za plaćanje',
      'employees': 'Zaposleni',
      'articles': 'Artikli',
      'contracts': 'Ugovori',
      'taxes': 'Porezi',
      'bank-statements': 'Izvodi banke',
      'reports': 'Izveštaji',
      'dashboard': 'Kontrolna tabla',
      'vat-reduction': 'PDV smanjenje',
      'admin': 'Administracija',
      'auth': 'Autentifikacija'
    };
    return labels[resource] || resource;
  }
}

export const logService = new LogService();
