import { useState } from 'react';
import { Save, User, Lock, Bell, Palette, LogOut } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useTheme } from '@/contexts/ThemeContext';
import { authService } from '@/services/authService';
import { useNavigate } from 'react-router-dom';

const roleLabels: Record<string, string> = {
  admin: 'Administrator',
  accountant: 'Knjigovođa',
  viewer: 'Pregled'
};

export default function Profile() {
  const { toast } = useToast();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();
  const currentUser = authService.getCurrentUser();

  const [profileData, setProfileData] = useState({
    name: currentUser?.name || '',
    email: currentUser?.email || '',
    phone: '',
    company: '',
  });

  const [passwords, setPasswords] = useState({
    current: '',
    new: '',
    confirm: '',
  });

  const [notifications, setNotifications] = useState({
    email: true,
    invoiceDue: true,
    lowStock: true,
    newPayment: true,
    systemUpdates: false,
    weeklyReport: true,
  });

  const handleSaveProfile = () => {
    if (!profileData.name || !profileData.email) {
      toast({ title: 'Greška', description: 'Ime i email su obavezni', variant: 'destructive' });
      return;
    }

    if (currentUser) {
      authService.updateUser(currentUser.id, {
        name: profileData.name,
        email: profileData.email,
      });
    }

    toast({ title: 'Profil sačuvan', description: 'Vaši podaci su uspešno ažurirani' });
  };

  const handleChangePassword = () => {
    if (!passwords.current || !passwords.new || !passwords.confirm) {
      toast({ title: 'Greška', description: 'Sva polja su obavezna', variant: 'destructive' });
      return;
    }
    if (passwords.new.length < 8) {
      toast({ title: 'Greška', description: 'Nova lozinka mora imati minimum 8 karaktera', variant: 'destructive' });
      return;
    }
    if (passwords.new !== passwords.confirm) {
      toast({ title: 'Greška', description: 'Lozinke se ne poklapaju', variant: 'destructive' });
      return;
    }

    // U demo modu samo simuliramo
    setPasswords({ current: '', new: '', confirm: '' });
    toast({ title: 'Lozinka promenjena', description: 'Vaša lozinka je uspešno ažurirana' });
  };

  const handleSaveNotifications = () => {
    toast({ title: 'Notifikacije sačuvane', description: 'Podešavanja obaveštenja su ažurirana' });
  };

  const handleLogout = () => {
    authService.logout();
    navigate('/login');
  };

  const initials = currentUser?.name
    ?.split(' ')
    .map(n => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2) || 'U';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Profil</h1>
          <p className="text-muted-foreground">Upravljajte vašim nalogom i podešavanjima</p>
        </div>
        <Button variant="outline" onClick={handleLogout} className="gap-2 text-destructive hover:text-destructive">
          <LogOut className="h-4 w-4" />
          Odjavi se
        </Button>
      </div>

      {/* Profil kartica */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarFallback className="bg-primary text-primary-foreground text-xl font-bold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className="text-xl font-semibold">{currentUser?.name || 'Korisnik'}</h2>
              <p className="text-muted-foreground">{currentUser?.email}</p>
              <Badge variant="secondary" className="mt-1">
                {roleLabels[currentUser?.role || 'viewer']}
              </Badge>
            </div>
            <div className="ml-auto text-right text-sm text-muted-foreground">
              <p>Nalog kreiran: {currentUser?.createdAt ? new Date(currentUser.createdAt).toLocaleDateString('sr-RS') : '-'}</p>
              <p>Poslednja prijava: {currentUser?.lastLogin ? new Date(currentUser.lastLogin).toLocaleDateString('sr-RS', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' }) : '-'}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs defaultValue="personal" className="space-y-4">
        <TabsList>
          <TabsTrigger value="personal" className="gap-2">
            <User className="h-4 w-4" />
            Lični podaci
          </TabsTrigger>
          <TabsTrigger value="security" className="gap-2">
            <Lock className="h-4 w-4" />
            Bezbednost
          </TabsTrigger>
          <TabsTrigger value="notifications" className="gap-2">
            <Bell className="h-4 w-4" />
            Obaveštenja
          </TabsTrigger>
          <TabsTrigger value="appearance" className="gap-2">
            <Palette className="h-4 w-4" />
            Izgled
          </TabsTrigger>
        </TabsList>

        {/* LIČNI PODACI */}
        <TabsContent value="personal">
          <Card>
            <CardHeader>
              <CardTitle>Lični podaci</CardTitle>
              <CardDescription>Ažurirajte vaše ime, email i kontakt informacije</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Ime i prezime</Label>
                  <Input
                    id="name"
                    value={profileData.name}
                    onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">Email adresa</Label>
                  <Input
                    id="email"
                    type="email"
                    value={profileData.email}
                    onChange={(e) => setProfileData({ ...profileData, email: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="phone">Telefon</Label>
                  <Input
                    id="phone"
                    value={profileData.phone}
                    onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                    placeholder="+381 60 000 0000"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="company">Kompanija</Label>
                  <Input
                    id="company"
                    value={profileData.company}
                    onChange={(e) => setProfileData({ ...profileData, company: e.target.value })}
                    placeholder="Naziv kompanije"
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveProfile} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sačuvaj izmene
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* BEZBEDNOST */}
        <TabsContent value="security">
          <Card>
            <CardHeader>
              <CardTitle>Promena lozinke</CardTitle>
              <CardDescription>Ažurirajte vašu lozinku za pristup nalogu</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="max-w-md space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Trenutna lozinka</Label>
                  <Input
                    id="current-password"
                    type="password"
                    value={passwords.current}
                    onChange={(e) => setPasswords({ ...passwords, current: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="new-password">Nova lozinka</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={passwords.new}
                    onChange={(e) => setPasswords({ ...passwords, new: e.target.value })}
                  />
                  <p className="text-xs text-muted-foreground">Minimum 8 karaktera</p>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Potvrdi novu lozinku</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={passwords.confirm}
                    onChange={(e) => setPasswords({ ...passwords, confirm: e.target.value })}
                  />
                </div>
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleChangePassword} className="gap-2">
                  <Lock className="h-4 w-4" />
                  Promeni lozinku
                </Button>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-4">
            <CardHeader>
              <CardTitle>Sesija</CardTitle>
              <CardDescription>Informacije o vašoj trenutnoj sesiji</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Status</span>
                  <Badge variant="default">Aktivna</Badge>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Uloga</span>
                  <span>{roleLabels[currentUser?.role || 'viewer']}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Token osvežavanje</span>
                  <span>Automatski svakih 30 min</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* OBAVEŠTENJA */}
        <TabsContent value="notifications">
          <Card>
            <CardHeader>
              <CardTitle>Podešavanja obaveštenja</CardTitle>
              <CardDescription>Izaberite koja obaveštenja želite da primate</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Email obaveštenja</p>
                  <p className="text-sm text-muted-foreground">Primaj obaveštenja na email</p>
                </div>
                <Switch
                  checked={notifications.email}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, email: checked })}
                />
              </div>
              <Separator />
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Dospele fakture</p>
                  <p className="text-sm text-muted-foreground">Obavesti me kada faktura dospe na naplatu</p>
                </div>
                <Switch
                  checked={notifications.invoiceDue}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, invoiceDue: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Niske zalihe</p>
                  <p className="text-sm text-muted-foreground">Upozori me kada zalihe padnu ispod minimuma</p>
                </div>
                <Switch
                  checked={notifications.lowStock}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, lowStock: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nove uplate</p>
                  <p className="text-sm text-muted-foreground">Obavesti me o novim primljenim uplatama</p>
                </div>
                <Switch
                  checked={notifications.newPayment}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, newPayment: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Sistemska ažuriranja</p>
                  <p className="text-sm text-muted-foreground">Informacije o novim funkcionalnostima</p>
                </div>
                <Switch
                  checked={notifications.systemUpdates}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, systemUpdates: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <div>
                  <p className="font-medium">Nedeljni izveštaj</p>
                  <p className="text-sm text-muted-foreground">Primaj nedeljni rezime aktivnosti</p>
                </div>
                <Switch
                  checked={notifications.weeklyReport}
                  onCheckedChange={(checked) => setNotifications({ ...notifications, weeklyReport: checked })}
                />
              </div>
              <Separator />
              <div className="flex justify-end">
                <Button onClick={handleSaveNotifications} className="gap-2">
                  <Save className="h-4 w-4" />
                  Sačuvaj podešavanja
                </Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* IZGLED */}
        <TabsContent value="appearance">
          <Card>
            <CardHeader>
              <CardTitle>Tema aplikacije</CardTitle>
              <CardDescription>Prilagodite izgled aplikacije vašim preferencama</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <button
                  onClick={() => setTheme('light')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    theme === 'light'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-white border border-gray-200 flex items-center justify-center">
                      <span className="text-lg">☀️</span>
                    </div>
                    <div>
                      <p className="font-semibold">Svetla tema</p>
                      <p className="text-sm text-muted-foreground">Klasičan svetao izgled</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[hsl(221.2,83.2%,53.3%)]" />
                    <div className="h-3 w-3 rounded-full bg-[hsl(210,40%,96.1%)]" />
                    <div className="h-3 w-3 rounded-full bg-[hsl(0,0%,100%)]" />
                  </div>
                </button>
                <button
                  onClick={() => setTheme('dark')}
                  className={`p-4 rounded-lg border-2 transition-all text-left ${
                    theme === 'dark'
                      ? 'border-primary bg-primary/5'
                      : 'border-border hover:border-muted-foreground/30'
                  }`}
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 rounded-lg bg-[hsl(222.2,84%,4.9%)] border border-[hsl(217.2,32.6%,17.5%)] flex items-center justify-center">
                      <span className="text-lg">🌙</span>
                    </div>
                    <div>
                      <p className="font-semibold">Tamna tema</p>
                      <p className="text-sm text-muted-foreground">Elegantan taman izgled</p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <div className="h-3 w-3 rounded-full bg-[hsl(217.2,91.2%,59.8%)]" />
                    <div className="h-3 w-3 rounded-full bg-[hsl(217.2,32.6%,17.5%)]" />
                    <div className="h-3 w-3 rounded-full bg-[hsl(222.2,84%,4.9%)]" />
                  </div>
                </button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
