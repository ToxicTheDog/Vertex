import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { LogIn, Eye, EyeOff, BarChart3 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { authService } from '@/services/authService';

export default function Login() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email.trim() || !password.trim()) {
      toast({
        title: 'Greška',
        description: 'Unesite email i lozinku',
        variant: 'destructive',
      });
      return;
    }

    setIsLoading(true);
    try {
      const result = await authService.login(email.trim(), password);
      if (result.success) {
        toast({
          title: 'Dobrodošli!',
          description: `Prijavljeni ste kao ${result.user?.name}`,
        });
        navigate('/');
      } else {
        toast({
          title: 'Greška pri prijavi',
          description: result.error || 'Pogrešan email ili lozinka',
          variant: 'destructive',
        });
      }
    } catch {
      toast({
        title: 'Greška',
        description: 'Nije moguće povezati se sa serverom',
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
          <p className="text-sm text-muted-foreground">Knjigovodstveni sistem</p>
        </div>

        <Card>
          <CardHeader className="text-center">
            <CardTitle>Prijava</CardTitle>
            <CardDescription>Unesite svoje podatke za pristup sistemu</CardDescription>
          </CardHeader>
          <form onSubmit={handleSubmit}>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="ime@firma.rs"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    autoComplete="current-password"
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
            </CardContent>
            <CardFooter className="flex flex-col gap-4">
              <Button type="submit" className="w-full gap-2" disabled={isLoading}>
                <LogIn className="h-4 w-4" />
                {isLoading ? 'Prijavljivanje...' : 'Prijavi se'}
              </Button>
              <p className="text-sm text-muted-foreground text-center">
                Nemate nalog?{' '}
                <Link to="/register" className="text-primary hover:underline font-medium">
                  Registrujte se
                </Link>
              </p>
            </CardFooter>
          </form>
        </Card>

        <p className="text-xs text-center text-muted-foreground">
          Demo pristup: bilo koji email sa lozinkom <span className="font-mono font-medium">demo</span>
        </p>
      </div>
    </div>
  );
}
