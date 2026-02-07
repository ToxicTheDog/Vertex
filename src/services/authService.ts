// Auth Service - autentifikacija i autorizacija
import { DEMO_MODE, API_ENDPOINTS } from '@/config/api';
import { logService } from './logService';

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'admin' | 'accountant' | 'viewer';
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

const USERS_STORAGE_KEY = 'erp_users';
const CURRENT_USER_KEY = 'current_user';
const AUTH_TOKEN_KEY = 'auth_token';

// Demo korisnici
const defaultUsers: User[] = [
  {
    id: 'admin-1',
    email: 'admin@vertex.com',
    name: 'Admin Korisnik',
    role: 'admin',
    isActive: true,
    createdAt: '2024-01-01T00:00:00Z',
    lastLogin: new Date().toISOString()
  },
  {
    id: 'accountant-1',
    email: 'knjigov@vertex.com',
    name: 'Marko Marković',
    role: 'accountant',
    isActive: true,
    createdAt: '2024-02-15T00:00:00Z'
  }
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
    admin: false
  }
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
    admin: true
  }
};

class AuthService {
  constructor() {
    this.initializeDefaultUsers();
  }

  private initializeDefaultUsers(): void {
    const users = localStorage.getItem(USERS_STORAGE_KEY);
    if (!users) {
      localStorage.setItem(USERS_STORAGE_KEY, JSON.stringify(defaultUsers));
      // Postavi default dozvole
      localStorage.setItem('erp_permissions_admin-1', JSON.stringify(adminPermissions));
      localStorage.setItem('erp_permissions_accountant-1', JSON.stringify(defaultPermissions));
    }
    
    // Za demo, automatski postavi admin korisnika
    if (DEMO_MODE && !this.getCurrentUser()) {
      this.setCurrentUser(defaultUsers[0]);
    }
  }

  async login(email: string, password: string): Promise<{ success: boolean; user?: User; error?: string }> {
    logService.log({
      action: 'login',
      resource: 'auth',
      details: `Pokušaj prijave: ${email}`,
      userId: 'unknown',
      userName: email
    });

    if (DEMO_MODE) {
      // U demo modu, prihvati bilo koji email sa passwordom "demo"
      const users = this.getUsers();
      let user = users.find(u => u.email === email);
      
      if (!user && password === 'demo') {
        // Kreiraj novog korisnika za demo
        user = {
          id: crypto.randomUUID(),
          email,
          name: email.split('@')[0],
          role: 'viewer',
          isActive: true,
          createdAt: new Date().toISOString(),
          lastLogin: new Date().toISOString()
        };
      }

      if (user && password === 'demo') {
        user.lastLogin = new Date().toISOString();
        this.setCurrentUser(user);
        return { success: true, user };
      }

      return { success: false, error: 'Pogrešan email ili lozinka' };
    }

    try {
      const response = await fetch(API_ENDPOINTS.auth.login, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      if (!response.ok) {
        const data = await response.json();
        return { success: false, error: data.message || 'Greška pri prijavi' };
      }

      const data = await response.json();
      localStorage.setItem(AUTH_TOKEN_KEY, data.token);
      this.setCurrentUser(data.user);
      return { success: true, user: data.user };
    } catch (error) {
      return { success: false, error: 'Nije moguće povezati se sa serverom' };
    }
  }

  logout(): void {
    const user = this.getCurrentUser();
    if (user) {
      logService.log({
        action: 'logout',
        resource: 'auth',
        details: 'Korisnik se odjavio',
        userId: user.id,
        userName: user.name
      });
    }

    localStorage.removeItem(CURRENT_USER_KEY);
    localStorage.removeItem(AUTH_TOKEN_KEY);

    if (!DEMO_MODE) {
      fetch(API_ENDPOINTS.auth.logout, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${this.getToken()}` }
      }).catch(() => {});
    }
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

  getToken(): string {
    return localStorage.getItem(AUTH_TOKEN_KEY) || '';
  }

  isAuthenticated(): boolean {
    return !!this.getCurrentUser();
  }

  isAdmin(): boolean {
    const user = this.getCurrentUser();
    return user?.role === 'admin';
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
      createdAt: new Date().toISOString()
    };
    users.push(newUser);
    this.saveUsers(users);
    
    // Postavi default dozvole
    localStorage.setItem(`erp_permissions_${newUser.id}`, JSON.stringify(defaultPermissions));
    
    return newUser;
  }

  updateUser(id: string, updates: Partial<User>): User | null {
    const users = this.getUsers();
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    
    users[index] = { ...users[index], ...updates };
    this.saveUsers(users);
    return users[index];
  }

  deleteUser(id: string): boolean {
    const users = this.getUsers();
    const filtered = users.filter(u => u.id !== id);
    if (filtered.length === users.length) return false;
    
    this.saveUsers(filtered);
    localStorage.removeItem(`erp_permissions_${id}`);
    return true;
  }

  getUserPermissions(userId: string): UserPermissions {
    try {
      const stored = localStorage.getItem(`erp_permissions_${userId}`);
      if (stored) return JSON.parse(stored);
      
      const user = this.getUsers().find(u => u.id === userId);
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
