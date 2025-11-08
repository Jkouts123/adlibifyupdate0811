import { Link } from 'react-router-dom';
import { Sparkles, User, Moon, Sun, Menu, X } from 'lucide-react';
import { Button } from '@/components/ui/button-variants';
import { useAuth } from '@/contexts/AuthContext';
import { useState } from 'react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface HeaderProps {
  onAuthClick: () => void;
  onUpgradeClick: () => void;
}

export const Header = ({ onAuthClick, onUpgradeClick }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const [theme, setTheme] = useState<'light' | 'dark'>('dark');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    document.documentElement.classList.toggle('dark');
  };

  const navItems = [
    { name: 'Home', path: '/' },
    { name: 'Studio', path: '/studio' },
    { name: 'History', path: '/history' },
  ];

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border/40 glass-luxury">
      <div className="container flex h-16 items-center justify-around px-4">

        {/* Mobile menu button */}
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden rounded-full"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
        >
          {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
        </Button>
        
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 transition-transform hover:scale-105">
          <Sparkles className="h-6 w-6 text-primary" />
          <span className="text-2xl font-display font-bold text-foreground">adlibify</span>
        </Link>

        

        {/* Center Nav - Desktop */}
        <nav className="hidden md:flex items-center gap-8">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              to={item.path} 
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              {item.name}
            </Link>
          ))}
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-4">
          {user && (
            <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-lg glass-luxury">
              <Sparkles className="h-4 w-4 text-primary" />
              <span className="text-sm font-semibold text-foreground">{user.credits} credits</span>
            </div>
          )}

          {user && (
            <Button 
              variant="luxury" 
              size="sm" 
              onClick={onUpgradeClick}
              className="hidden md:inline-flex"
            >
              Upgrade
            </Button>
          )}

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="rounded-full"
          >
            {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" size="icon" className="rounded-full">
                  <User className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="glass-luxury border-primary/20">
                <DropdownMenuLabel className="font-display">
                  {user.name || user.email}
                </DropdownMenuLabel>
                <DropdownMenuSeparator className="bg-primary/20" />
                <DropdownMenuItem className="text-sm">
                  <Sparkles className="mr-2 h-4 w-4" />
                  {user.credits} Credits
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => signOut()} className="text-destructive">
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button variant="luxury" onClick={onAuthClick} className="hidden md:inline-flex">
              Sign In
            </Button>
          )}
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-border/40 glass-luxury px-4 py-3">
          <nav className="flex flex-col gap-3">
            {navItems.map((item) => (
              <Link
                key={item.path}
                to={item.path}
                className="text-base font-medium text-foreground py-2 px-4 rounded-lg hover:bg-primary/10 transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                {item.name}
              </Link>
            ))}
            {!user && (
              <Button 
                variant="luxury" 
                onClick={() => {
                  setMobileMenuOpen(false);
                  onAuthClick();
                }} 
                className="mt-2"
              >
                Sign In
              </Button>
            )}
            {user && (
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between py-2 px-4 rounded-lg bg-primary/5">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-primary" />
                    <span className="text-sm font-semibold text-foreground">{user.credits} credits</span>
                  </div>
                  <Button 
                    variant="luxury" 
                    size="sm" 
                    onClick={() => {
                      setMobileMenuOpen(false);
                      onUpgradeClick();
                    }}
                  >
                    Upgrade
                  </Button>
                </div>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={() => signOut()}
                  className="border-destructive text-destructive hover:bg-destructive hover:text-destructive-foreground"
                >
                  Sign Out
                </Button>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};