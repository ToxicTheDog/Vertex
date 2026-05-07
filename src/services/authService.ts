import { DEMO_MODE, API_ENDPOINTS, TOKEN_CONFIG } from '@/config/api';
import { logService } from './logService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'accountant' | 'viewer' | 'user';
  isActive: boolean;
  createdAt: string;
  lastLogin?: string;
}

export interface UserPermissions {
  categories: {
    finansije: boolean;
    klijenti: boolean;
    prodaja: boolean;
    hr: boolean;
    marketing: boolean;
    projekti: boolean;
    inventar: boolean;
    automatizacija: boolean;
    admin: boolean;
  };
}

export interface TokenData {
  accessToken: string;
  refreshToken: string;
  expiresAt: number;
}

interface AuthPayload {
  accessToken?: string;
  refreshToken?: string;
  expiresIn?: number;
  token?: string;
  user?: Partial<User> & { role?: User['role'] | 'user' };
  data?: {
    accessToken?: string;
    refreshToken?: string;
    expiresIn?: number;
    token?: string;
    user?: Partial<User> & { role?: User['role'] | 'user' };
  };
}

const USERS_STORAGE_KEY = 'erp_users';
const CURRENT_USER_KEY = 'current_user';
const TOKEN_DATA_KEY = 'erp_token_data';

const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@vertex.com',
    name: 'Admin Korisnik',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString(),
  },
  {
    id: 'accountant-1',
    email: 'knjigov@vertex.com',
    name: 'Marko Markovic',
    role: 'accountant',
    isActive: true,
    createdAt: '2024-02-15T00:00:00Z',
  },
];

const defaultPermissions: UserPermissions = {
  categories: {
    finansije: true,
    klijenti: true,
    prodaja: true,
    hr: true,
    marketing: true,
    projekti: true,
    inventar: true,
    automatizacija: true,
    admin: false,
  },
};

const adminPermissions: UserPermissions = {
  categories: {
    finansije: true,
    klijenti: true,
    prodaja: true,
    hr: true,
    marketing: true,
    projekti: true,
    inventar: true,
    automatizacija: true,
    admin: true,
  },
};

class AuthService {
  private refreshTimer: ReturnType<typeof setTimeout> | null = null;
  private isRefreshing = false;
  private refreshPromise: Promise<boolean> | null = null;

  constructor() {
    this.initializeDefaultUsers();
    this.setupAutoRefresh();
  }

  private initializeDefaultUsers(): void {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    if (!users) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      localStorage.setItem('erp_permissions_admin-1', JSON.stringify(adminPermissions));
      localStorage.setItem('erp_permissions_accountant-1', JSON.stringify(defaultPermissions));
    }

    if (DEMO_MODE && !this.getCurrentUser()) {
      this.setCurrentUser(defaultUsers[0]);
    }
  }

  private getTokenData(): TokenData | null {
    try {
      const stored = localStorage.getItem(TOKEN_DATA_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private setTokenData(tokenData: TokenData): void {
    localStorage.setItem(TOKEN_DATA_KEY, JSON.stringify(tokenData));
    this.scheduleTokenRefresh(tokenData.expiresAt);
  }

  private clearTokenData(): void {
    localStorage.removeItem(TOKEN_DATA_KEY);
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  private clearSession(): void {
    localStorage.removeItem(CURRENT_USER_KEY);
    this.clearTokenData();
  }

  private normalizeUser(user?: (Partial<User> & { role?: User['role'] | 'user' }) | null): User | undefined {
    if (!user?.id || !user.email || !user.name) {
      return undefined;
    }

    const normalizedRole: User['role'] =
      user.role === 'admin' || user.role === 'accountant' || user.role === 'user' || user.role === 'viewer'
        ? user.role
        : 'viewer';

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      role: normalizedRole,
      isActive: user.isActive ?? true,
      createdAt: user.createdAt || new Date().toISOString(),
      lastLogin: user.lastLogin,
    };
  }

  private extractAuthPayload(payload: AuthPayload) {
    const container = payload?.data && typeof payload.data === 'object' ? payload.data : payload;

    return {
      accessToken: payload?.accessToken || container?.accessToken || container?.token,
      refreshToken: payload?.refreshToken || container?.refreshToken,
      expiresInSeconds: payload?.expiresIn || container?.expiresIn || TOKEN_CONFIG.accessTokenExpiryMinutes * 60,
      user: this.normalizeUser(payload?.user || container?.user),
    };
  }

  private persistAuthPayload(payload: AuthPayload): User | undefined {
    const { accessToken, refreshToken, expiresInSeconds, user } = this.extractAuthPayload(payload);

    if (accessToken) {
      this.setTokenData({
        accessToken,
        refreshToken: refreshToken || this.getRefreshToken(),
        expiresAt: Date.now() + expiresInSeconds * 1000,
      });
    }

    if (user) {
      this.setCurrentUser(user);
    }

    return user;
  }

  getToken(): string {
    if (DEMO_MODE) return 'demo-token';
    return this.getTokenData()?.accessToken || '';
  }

  getRefreshToken(): string {
    return this.getTokenData()?.refreshToken || '';
  }

  isTokenExpired(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) return true;
    return Date.now() >= tokenData.expiresAt;
  }

  shouldRefreshToken(): boolean {
    const tokenData = this.getTokenData();
    if (!tokenData) return false;

    const refreshThreshold = TOKEN_CONFIG.refreshBeforeExpiryMinutes * 60 * 1000;
    return Date.now() >= tokenData.expiresAt - refreshThreshold;
  }

  private scheduleTokenRefresh(expiresAt: number): void {
    if (this.refreshTimer) {
      clearTimeout(this.refreshTimer);
    }

    const refreshThreshold = TOKEN_CONFIG.refreshBeforeExpiryMinutes * 60 * 1000;
    const refreshTime = expiresAt - refreshThreshold - Date.now();

    if (refreshTime > 0) {
      this.refreshTimer = setTimeout(() => {
        this.refreshAccessToken().catch(console.error);
      }, refreshTime);
    }
  }

  private setupAutoRefresh(): void {
    if (DEMO_MODE) return;

    const tokenData = this.getTokenData();
    if (!tokenData) return;

    if (!this.isTokenExpired()) {
      this.scheduleTokenRefresh(tokenData.expiresAt);
      return;
    }

    if (tokenData.refreshToken) {
      this.refreshAccessToken().catch(console.error);
    }
  }

  async refreshAccessToken(): Promise<boolean> {
    if (DEMO_MODE) return true;

    if (this.isRefreshing && this.refreshPromise) {
      return this.refreshPromise;
    }

    this.isRefreshing = true;
    this.refreshPromise = this.performTokenRefresh();

    try {
      return await this.refreshPromise;
    } finally {
      this.isRefreshing = false;
      this.refreshPromise = null;
    }
  }

  private async performTokenRefresh(): Promise<boolean> {
    const refreshToken = this.getRefreshToken();
    if (!refreshToken) {
      console.warn('[Auth] Nema refresh tokena za osvezavanje');
      return false;
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.refresh, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refreshToken }),
      });

      if (!response.ok) {
        this.clearSession();
        return false;
      }

      const data = await response.json();
      const user = this.persistAuthPayload(data);

      if (!this.getToken()) {
        return false;
      }

      if (user) {
        this.setCurrentUser(user);
      }

      return true;
    } catch (error) {
      console.error('[Auth] Greska pri osvezavanju tokena:', error);
      return false;
    }
  }

  async ensureValidToken(): Promise<string> {
    if (DEMO_MODE) return 'demo-token';

    if (this.isTokenExpired()) {
      const refreshed = await this.refreshAccessToken();
      if (!refreshed) {
        throw new Error('Sesija je istekla. Molimo prijavite se ponovo.');
      }
    } else if (this.shouldRefreshToken()) {
      this.refreshAccessToken().catch(console.error);
    }

    return this.getToken();
  }

  async register(name: string, email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    logService.log({
      action: 'create',
      resource: 'auth',
      details: `Pokusaj registracije: ${email}`,
      userId: 'unknown',
      userName: email,
    });

    if (DEMO_MODE) {
      const users = this.getUsers();
      if (users.find((existingUser) => existingUser.email === email)) {
        return { success: false, error: 'Korisnik sa ovim emailom vec postoji' };
      }

      const user = this.createUser({ name, email, role: 'viewer', isActive: true });
      this.setCurrentUser(user);
      return { success: true, user };
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.register, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || data.msg || 'Greska pri registraciji' };
      }

      const user = this.persistAuthPayload(data) || this.normalizeUser(data.user);
      return { success: true, user };
    } catch {
      return { success: false, error: 'Nije moguce povezati se sa serverom' };
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    logService.log({
      action: 'login',
      resource: 'auth',
      details: `Pokusaj prijave: ${email}`,
      userId: 'unknown',
      userName: email,
    });

    if (DEMO_MODE) {
      let user = this.getUsers().find((existingUser) => existingUser.email === email);

      if (!user && password === 'demo') {
        user = this.createUser({
          name: email.split('@')[0],
          email,
          role: 'viewer',
          isActive: true,
          lastLogin: new Date().toISOString(),
        });
      }

      if (user && password === 'demo') {
        user.lastLogin = new Date().toISOString();
        this.updateUser(user.id, { lastLogin: user.lastLogin });
        this.setCurrentUser(user);
        return { success: true, user };
      }

      return { success: false, error: 'Pogresan email ili lozinka' };
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();
      if (!response.ok) {
        return { success: false, error: data.message || data.msg || 'Greska pri prijavi' };
      }

      const user = this.persistAuthPayload(data) || this.normalizeUser(data.user);
      return { success: true, user };
    } catch {
      return { success: false, error: 'Nije moguce povezati se sa serverom' };
    }
  }

  logout(): void {
    const user = this.getCurrentUser();
    const accessToken = this.getToken();
    const refreshToken = this.getRefreshToken();

    if (user) {
      logService.log({
        action: 'logout',
        resource: 'auth',
        details: 'Korisnik se odjavio',
        userId: user.id,
        userName: user.name,
      });
    }

    if (!DEMO_MODE && (accessToken || refreshToken)) {
      fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(accessToken ? { Authorization: `Bearer ${accessToken}` } : {}),
        },
        body: JSON.stringify({ refreshToken }),
      }).catch(() => { });
    }

    this.clearSession();
  }

  getCurrentUser(): User | null {
    try {
      const stored = localStorage.getItem(CURRENT_USER_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  }

  private setCurrentUser(user: User): void {
    localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user));
  }

  isAuthenticated(): boolean {
    if (DEMO_MODE) return !!this.getCurrentUser();

    const user = this.getCurrentUser();
    const tokenData = this.getTokenData();
    if (!user || !tokenData) return false;

    return !this.isTokenExpired() || !!tokenData.refreshToken;
  }

  isAdmin(): boolean {
    return this.getCurrentUser()?.role === 'admin';
  }

  getUsers(): User[] {
    try {
      const stored = localStorage.getItem(USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  }

  saveUsers(users: User[]): void {
    localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(users));
  }

  createUser(userData: Omit<User, 'id' | 'createdAt'>): User {
    const users = this.getUsers();
    const newUser: User = {
      ...userData,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
    };

    users.push(newUser);
    this.saveUsers(users);
    localStorage.setItem(`erp_permissions_${newUser.id}`, JSON.stringify(defaultPermissions));
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex((user) => user.id === id);
    if (index === -1) return null;

    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter((user) => user.id !== id);
    if (filtered.length === users.length) return false;

    this.saveUsers(filtered);
    localStorage.removeItem(`erp_permissions_${id}`);
    return true;
  }

  getUserPermissions(userId: string): UserPermissions {
    try {
      const stored = localStorage.getItem(`erp_permissions_${userId}`);
      if (stored) return JSON.parse(stored);

      const user = this.getUsers().find((candidate) => candidate.id === userId);
      return user?.role === 'admin' ? adminPermissions : defaultPermissions;
    } catch {
      return defaultPermissions;
    }
  }

  setUserPermissions(userId: string, permissions: UserPermissions): void {
    localStorage.setItem(`erp_permissions_${userId}`, JSON.stringify(permissions));
  }

  canAccessCategory(category: keyof UserPermissions['categories']): boolean {
    const user = this.getCurrentUser();
    if (!user) return false;
    if (user.role === 'admin') return true;

    const permissions = this.getUserPermissions(user.id);
    return permissions.categories[category] ?? false;
  }
}

export const authService = new AuthService();
