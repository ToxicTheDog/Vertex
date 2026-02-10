 import { Bell, Search, Moon, Sun, User, Menu, LayoutGrid } from 'lucide-react';
 import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useTheme } from '@/contexts/ThemeContext';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';

 interface HeaderProps {
   showSidebarTrigger?: boolean;
 }
 
 export function Header({ showSidebarTrigger = true }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="flex h-14 items-center gap-4 px-4">
         {showSidebarTrigger ? (
           <SidebarTrigger className="-ml-1">
             <Menu className="h-5 w-5" />
           </SidebarTrigger>
         ) : (
           <Link to="/" className="p-2 hover:bg-accent rounded-md">
             <Menu className="h-5 w-5" />
           </Link>
         )}
        
        <div className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-primary-foreground font-bold text-sm">
            ERP
          </div>
          <span className="hidden md:inline-block font-semibold text-lg">
            Knjigovodstvo
          </span>
        </div>

        <div className="flex-1 flex items-center justify-center max-w-md mx-auto">
          <div className="relative w-full">
            <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              type="search"
              placeholder="Pretraži..."
              className="w-full pl-9 bg-muted/50"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="relative"
          >
            {theme === 'dark' ? (
              <Sun className="h-5 w-5" />
            ) : (
              <Moon className="h-5 w-5" />
            )}
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="relative">
                <Bell className="h-5 w-5" />
                <Badge 
                  variant="destructive" 
                  className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 flex items-center justify-center text-xs"
                >
                  3
                </Badge>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80">
              <DropdownMenuLabel>Obaveštenja</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <span className="font-medium">Faktura dospela</span>
                <span className="text-sm text-muted-foreground">FAK-2024-003 je istekla pre 5 dana</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <span className="font-medium">Niske zalihe</span>
                <span className="text-sm text-muted-foreground">Toneri za štampač - ostalo 3 kom</span>
              </DropdownMenuItem>
              <DropdownMenuItem className="flex flex-col items-start gap-1 py-2">
                <span className="font-medium">Nova uplata</span>
                <span className="text-sm text-muted-foreground">Primljena uplata od 9,600 RSD</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon">
                <User className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>Moj nalog</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/profile">Profil</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link to="/settings">Podešavanja</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
             <DropdownMenuItem asChild>
               <Link to="/menu" className="flex items-center gap-2">
                 <LayoutGrid className="h-4 w-4" />
                 Meni navigacija
               </Link>
             </DropdownMenuItem>
             <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link to="/login" onClick={() => { import('@/services/authService').then(m => m.authService.logout()); }}>
                  Odjavi se
                </Link>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}
