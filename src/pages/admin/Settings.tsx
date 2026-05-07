import { useState, useEffect } from 'react';
import { Plus, Pencil, Trash2, Shield, Eye, EyeOff, Save, History, Download, RefreshCw } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { authService, User, UserPermissions } from '@/services/authService';
import { logService, LogEntry, LogAction } from '@/services/logService';
import { EmptyState } from '@/components/EmptyState';

const categoryLabels: Record<keyof UserPermissions['categories'], string> = {
  finansije: 'Finansije',
  klijenti: 'Klijenti i poslovnice',
  prodaja: 'Prodaja i kupovina',
  hr: 'Ljudski resursi',
  marketing: 'Marketing i komunikacija',
  projekti: 'Projekti i zadaci',
  inventar: 'Inventar i skladište',
  automatizacija: 'Automatizacija',
  admin: 'Administracija'
};

const roleLabels: Record<User['role'], string> = {
  admin: 'Administrator',
  accountant: 'Knjigovođa',
  user: 'Korisnik',
  viewer: 'Pregled'
};

export default function Settings() {
  const { toast } = useToast();
  const [users, setUsers] = useState<User[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [userPermissions, setUserPermissions] = useState<UserPermissions | null>(null);
  const [isUserDialogOpen, setIsUserDialogOpen] = useState(false);
  const [isPermissionsDialogOpen, setIsPermissionsDialogOpen] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [newUser, setNewUser] = useState({
    email: '',
    name: '',
    password: '',
    role: 'accountant' as User['role']
  });
  const [logFilters, setLogFilters] = useState({
    action: '' as LogAction | '',
    userId: ''
  });

  useEffect(() => {
    loadUsers();
    loadLogs();
  }, []);

  const loadUsers = () => {
    setUsers(authService.getUsers());
  };

  const loadLogs = () => {
    setLogs(logService.getRecentLogs(100));
  };

  const handleCreateUser = () => {
    if (!newUser.email || !newUser.name || !newUser.password) {
      toast({
        title: 'Greška',
        description: 'Sva polja su obavezna',
        variant: 'destructive'
      });
      return;
    }

    const user = authService.createUser({
      email: newUser.email,
      name: newUser.name,
      role: newUser.role,
      isActive: true
    });

    toast({
      title: 'Korisnik kreiran',
      description: `Korisnik ${user.name} je uspešno kreiran`
    });

    setNewUser({ email: '', name: '', password: '', role: 'accountant' });
    setIsUserDialogOpen(false);
    loadUsers();
  };

  const handleUpdateUser = (id: string, updates: Partial<User>) => {
    authService.updateUser(id, updates);
    toast({
      title: 'Korisnik ažuriran',
      description: 'Podaci korisnika su uspešno ažurirani'
    });
    loadUsers();
  };

  const handleDeleteUser = (id: string) => {
    if (confirm('Da li ste sigurni da želite da obrišete ovog korisnika?')) {
      authService.deleteUser(id);
      toast({
        title: 'Korisnik obrisan',
        description: 'Korisnik je uspešno obrisan'
      });
      loadUsers();
    }
  };

  const handleOpenPermissions = (user: User) => {
    setSelectedUser(user);
    setUserPermissions(authService.getUserPermissions(user.id));
    setIsPermissionsDialogOpen(true);
  };

  const handleSavePermissions = () => {
    if (selectedUser && userPermissions) {
      authService.setUserPermissions(selectedUser.id, userPermissions);
      toast({
        title: 'Dozvole sačuvane',
        description: `Dozvole za ${selectedUser.name} su uspešno ažurirane`
      });
      setIsPermissionsDialogOpen(false);
    }
  };

  const handleExportLogs = () => {
    const data = logService.exportLogs();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `erp-logs-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredLogs = logs.filter(log => {
    if (logFilters.action && log.action !== logFilters.action) return false;
    if (logFilters.userId && log.userId !== logFilters.userId) return false;
    return true;
  });

  const currentUser = authService.getCurrentUser();
  const isAdmin = currentUser?.role === 'admin';

  if (!isAdmin) {
    return (
      <div className="space-y-6">
        <EmptyState
          title="Pristup odbijen"
          description="Nemate dozvolu za pristup ovoj stranici. Samo administratori mogu pristupiti podešavanjima."
          icon="warning"
          showRetry={false}
        />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Podešavanja</h1>
        <p className="text-muted-foreground">Upravljanje korisnicima, dozvolama i sistemskim logovima</p>
      </div>

      <Tabs defaultValue="users" className="space-y-4">
        <TabsList>
          <TabsTrigger value="users" className="gap-2">
            <Shield className="h-4 w-4" />
            Korisnici
          </TabsTrigger>
          <TabsTrigger value="logs" className="gap-2">
            <History className="h-4 w-4" />
            Logovi
          </TabsTrigger>
        </TabsList>

        {/* KORISNICI TAB */}
        <TabsContent value="users" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Upravljanje korisnicima</h2>
            <Button onClick={() => setIsUserDialogOpen(true)} className="gap-2">
              <Plus className="h-4 w-4" />
              Novi korisnik
            </Button>
          </div>

          <Card>
            <CardContent className="p-0">
              {users.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="Nema korisnika"
                    description="Dodajte prvog korisnika klikom na dugme 'Novi korisnik'"
                    showRetry={false}
                  />
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Ime</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Uloga</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Poslednja prijava</TableHead>
                      <TableHead className="text-right">Akcije</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {users.map((user) => (
                      <TableRow key={user.id}>
                        <TableCell className="font-medium">{user.name}</TableCell>
                        <TableCell>{user.email}</TableCell>
                        <TableCell>
                          <Badge variant={user.role === 'admin' ? 'default' : 'secondary'}>
                            {roleLabels[user.role]}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={user.isActive ? 'default' : 'outline'}>
                            {user.isActive ? 'Aktivan' : 'Neaktivan'}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {user.lastLogin 
                            ? new Date(user.lastLogin).toLocaleDateString('sr-RS', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit'
                              })
                            : '-'
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleOpenPermissions(user)}
                              title="Dozvole"
                            >
                              <Shield className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleUpdateUser(user.id, { isActive: !user.isActive })}
                              title={user.isActive ? 'Deaktiviraj' : 'Aktiviraj'}
                            >
                              {user.isActive ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                            </Button>
                            {user.role !== 'admin' && (
                              <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => handleDeleteUser(user.id)}
                                title="Obriši"
                              >
                                <Trash2 className="h-4 w-4 text-destructive" />
                              </Button>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* LOGOVI TAB */}
        <TabsContent value="logs" className="space-y-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold">Sistemski logovi</h2>
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  if (confirm('Da li ste sigurni da želite da obrišete sve logove?')) {
                    logService.clearLogs();
                    loadLogs();
                    toast({ title: 'Logovi obrisani', description: 'Svi sistemski logovi su obrisani.' });
                  }
                }}
                className="gap-2 text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
                Obriši sve
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportLogs} className="gap-2">
                <Download className="h-4 w-4" />
                Izvoz logova
              </Button>
            </div>
          </div>

          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Filteri</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-4">
              <div className="w-48">
                <Label className="text-xs text-muted-foreground">Akcija</Label>
                <Select
                  value={logFilters.action || 'all'}
                  onValueChange={(value) => setLogFilters({ ...logFilters, action: value === 'all' ? '' : value as LogAction })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Sve akcije" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Sve akcije</SelectItem>
                    <SelectItem value="view">Pregled</SelectItem>
                    <SelectItem value="create">Kreiranje</SelectItem>
                    <SelectItem value="update">Izmena</SelectItem>
                    <SelectItem value="delete">Brisanje</SelectItem>
                    <SelectItem value="login">Prijava</SelectItem>
                    <SelectItem value="logout">Odjava</SelectItem>
                    <SelectItem value="approve">Odobrenje</SelectItem>
                    <SelectItem value="reject">Odbijanje</SelectItem>
                    <SelectItem value="export">Izvoz</SelectItem>
                    <SelectItem value="import">Uvoz</SelectItem>
                    <SelectItem value="send">Slanje</SelectItem>
                    <SelectItem value="pay">Plaćanje</SelectItem>
                    <SelectItem value="generate">Generisanje</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="w-48">
                <Label className="text-xs text-muted-foreground">Korisnik</Label>
                <Select
                  value={logFilters.userId || 'all'}
                  onValueChange={(value) => setLogFilters({ ...logFilters, userId: value === 'all' ? '' : value })}
                >
                  <SelectTrigger className="mt-1">
                    <SelectValue placeholder="Svi korisnici" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Svi korisnici</SelectItem>
                    {users.map(user => (
                      <SelectItem key={user.id} value={user.id}>{user.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              {(logFilters.action || logFilters.userId) && (
                <div className="flex items-end">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogFilters({ action: '', userId: '' })}
                    className="text-muted-foreground"
                  >
                    Resetuj filtere
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardDescription>
                  {filteredLogs.length} {filteredLogs.length === 1 ? 'zapis' : 'zapisa'} ukupno
                </CardDescription>
                <Button variant="ghost" size="sm" onClick={loadLogs} className="gap-1 h-7 text-xs">
                  <RefreshCw className="h-3 w-3" />
                  Osveži
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredLogs.length === 0 ? (
                <div className="p-6">
                  <EmptyState
                    title="Nema logova"
                    description="Sistemski logovi će se prikazati ovde kada korisnici počnu da koriste sistem"
                    showRetry={false}
                  />
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[180px]">Vreme</TableHead>
                        <TableHead className="w-[150px]">Korisnik</TableHead>
                        <TableHead className="w-[120px]">Akcija</TableHead>
                        <TableHead className="w-[150px]">Resurs</TableHead>
                        <TableHead>Detalji</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredLogs.map((log) => {
                        const actionVariant = (() => {
                          switch (log.action) {
                            case 'create': return 'default';
                            case 'delete': return 'destructive';
                            case 'login':
                            case 'logout': return 'secondary';
                            default: return 'outline';
                          }
                        })();
                        return (
                          <TableRow key={log.id}>
                            <TableCell className="whitespace-nowrap text-xs font-mono text-muted-foreground">
                              {new Date(log.timestamp).toLocaleDateString('sr-RS', {
                                day: '2-digit',
                                month: '2-digit',
                                year: 'numeric',
                                hour: '2-digit',
                                minute: '2-digit',
                                second: '2-digit'
                              })}
                            </TableCell>
                            <TableCell className="font-medium text-sm">{log.userName}</TableCell>
                            <TableCell>
                              <Badge variant={actionVariant as any}>
                                {logService.getActionLabel(log.action)}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-sm">{logService.getResourceLabel(log.resource)}</TableCell>
                            <TableCell className="max-w-xs truncate text-sm text-muted-foreground" title={log.details}>
                              {log.details}
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* DIALOG - NOVI KORISNIK */}
      <Dialog open={isUserDialogOpen} onOpenChange={setIsUserDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Novi korisnik</DialogTitle>
            <DialogDescription>
              Kreirajte novi korisnički nalog za knjigovođu ili drugog člana tima
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="name">Ime i prezime</Label>
              <Input
                id="name"
                value={newUser.name}
                onChange={(e) => setNewUser({ ...newUser, name: e.target.value })}
                placeholder="Marko Marković"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                value={newUser.email}
                onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                placeholder="marko@firma.rs"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Lozinka</Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={newUser.password}
                  onChange={(e) => setNewUser({ ...newUser, password: e.target.value })}
                  placeholder="••••••••"
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0"
                  onClick={() => setShowPassword(!showPassword)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="role">Uloga</Label>
              <Select
                value={newUser.role}
                onValueChange={(value: User['role']) => setNewUser({ ...newUser, role: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="accountant">Knjigovođa</SelectItem>
                  <SelectItem value="viewer">Samo pregled</SelectItem>
                  <SelectItem value="admin">Administrator</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsUserDialogOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleCreateUser}>Kreiraj korisnika</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* DIALOG - DOZVOLE */}
      <Dialog open={isPermissionsDialogOpen} onOpenChange={setIsPermissionsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Dozvole - {selectedUser?.name}</DialogTitle>
            <DialogDescription>
              Kontrolišite koje kategorije korisnik može da vidi
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            {userPermissions && Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center justify-between">
                <Label htmlFor={key} className="flex-1">{label}</Label>
                <Switch
                  id={key}
                  checked={userPermissions.categories[key as keyof UserPermissions['categories']]}
                  onCheckedChange={(checked) => {
                    setUserPermissions({
                      ...userPermissions,
                      categories: {
                        ...userPermissions.categories,
                        [key]: checked
                      }
                    });
                  }}
                  disabled={key === 'admin' && selectedUser?.role !== 'admin'}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsPermissionsDialogOpen(false)}>
              Otkaži
            </Button>
            <Button onClick={handleSavePermissions} className="gap-2">
              <Save className="h-4 w-4" />
              Sačuvaj
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
