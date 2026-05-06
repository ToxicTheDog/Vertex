import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { UserPlus, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

export default function Register() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const updateField = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const validate = (): string | null => {
    if (!formData.name.trim()) return 'Unesite ime i prezime';
    if (formData.name.trim().length < 2) return 'Ime mora imati najmanje 2 karaktera';
    if (!formData.email.trim()) return 'Unesite email adresu';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email.trim())) return 'Unesite validnu email adresu';
    if (!formData.password) return 'Unesite lozinku';
    if (formData.password.length < 6) return 'Lozinka mora imati najmanje 6 karaktera';
    if (formData.password !== formData.confirmPassword) return 'Lozinke se ne poklapaju';
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const error = validate();
    if (error) {
      toast({ title: 'Greška', description: error, variant: 'destructive' });
      return;
    }

    setIsLoading(true);
    try {
      if (DEMO_MODE) {
        // U demo modu, kreiraj korisnika lokalno
        const existingUsers = authService.getUsers();
        if (existingUsers.find((u) => u.email === formData.email.trim())) {
          toast({
            title: 'Greška',
            description: 'Korisnik sa ovim emailom već postoji',
            variant: 'destructive',
          });
          setIsLoading(false);
          return;
        }

        authService.createUser({
          name: formData.name.trim(),
          email: formData.email.trim(),
          role: 'viewer',
          isActive: true,
        });

        // Automatski prijavi korisnika
        const loginResult = await authService.login(formData.email.trim(), 'demo');
        if (loginResult.success) {
          toast({
            title: 'Nalog kreiran!',
            description: 'Uspešno ste se registrovali i prijavljeni ste.',
          });
          navigate('/');
          return;
        }
      }

      // Za produkciju - API poziv
      toast({
        title: 'Nalog kreiran!',
        description: 'Uspešno ste se registrovali. Možete se prijaviti.',
      });
      navigate('/login');
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće kreirati nalog. Pokušajte ponovo.',
        variant: 'destructive',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-background p-4">
      <div className="w-full max-w-md space-y-6">
        <div className="flex flex-col items-center gap-2">
          <div className="rounded-xl bg-primary p-3">
            <BarChart3 className="h-8 w-8 text-primary-foreground" />
          </div>
          <h1 className="text-2xl font-bold">Vertex ERP</h1>
          <p className="text-sm text-muted-foreground">Kreirajte novi nalog</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Registracija</CardTitle>
            <CardDescription>Popunite podatke za kreiranje naloga</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Ime i prezime</Label>
                <Input
                  id="name"
                  placeholder="Marko Marković"
                  value={formData.name}
                  onChange={(e) => updateField('name', e.target.value)}
                  autoComplete="name"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="marko@firma.rs"
                  value={formData.email}
                  onChange={(e) => updateField('email', e.target.value)}
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password">Lozinka</Label>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Najmanje 6 karaktera"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    autoComplete="new-password"
                    disabled={isLoading}
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-10 w-10"
                    onClick={() => setShowPassword(!showPassword)}
                    tabIndex={-1}
                  >
                    {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Potvrdite lozinku</Label>
                <Input
                  id="confirmPassword"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="Ponovite lozinku"
                  value={formData.confirmPassword}
                  onChange={(e) => updateField('confirmPassword', e.target.value)}
                  autoComplete="new-password"
                  disabled={isLoading}
                />
              </div>
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <UserPlus className="h-4 w-4" />
                {isLoading ? 'Kreiranje naloga...' : 'Registruj se'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Već imate nalog?{' '}
                <Link to="/login" className="text-primary hover:underline font-medium">
                  Prijavite se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>
      </div>
    </div>
  );
}
