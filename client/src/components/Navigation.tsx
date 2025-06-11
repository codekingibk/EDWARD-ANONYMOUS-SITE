import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useTheme } from "@/components/ui/theme-provider";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sun, Moon, VenetianMask, LogOut, Menu } from "lucide-react";
import { useState } from "react";

interface NavigationProps {
  onOpenAuth: (mode: 'login' | 'register') => void;
}

export function Navigation({ onOpenAuth }: NavigationProps) {
  const { user, logout } = useAuth();
  const { theme, setTheme } = useTheme();
  const [location] = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const toggleTheme = () => {
    setTheme(theme === 'light' ? 'dark' : 'light');
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  return (
    <header className="theme-transition border-b border-border bg-card/80 glass-card backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <div className="flex items-center">
            <Link href="/" className="text-2xl font-bold gradient-text hover:scale-105 transition-transform duration-200 flex items-center">
              <VenetianMask className="mr-2 h-6 w-6" />
              Edwards Anonymous
            </Link>
          </div>
          
          <nav className="hidden md:flex items-center space-x-6">
            <Link href="/" className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium">
              Home
            </Link>
            <a href="#features" className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium">
              Features
            </a>
            <a href="#about" className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium">
              About
            </a>
            <a href="#contact" className="text-foreground/70 hover:text-primary transition-colors duration-200 font-medium">
              Contact
            </a>
          </nav>
          
          <div className="flex items-center space-x-4">
            <Button
              variant="outline"
              size="icon"
              onClick={toggleTheme}
              className="bg-muted hover:bg-muted/80 transition-colors duration-200"
            >
              <Sun className="h-4 w-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
              <Moon className="absolute h-4 w-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
              <span className="sr-only">Toggle theme</span>
            </Button>
            
            {user ? (
              <div className="flex items-center space-x-3">
                <Avatar className="h-8 w-8 bg-primary">
                  <AvatarFallback className="bg-primary text-primary-foreground text-sm font-bold">
                    {user.username.substring(0, 2).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="font-medium">{user.username}</span>
                {user.isAdmin && (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => window.location.reload()}
                    className="text-xs"
                  >
                    Admin
                  </Button>
                )}
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={handleLogout}
                  className="h-8 w-8"
                >
                  <LogOut className="h-4 w-4" />
                </Button>
              </div>
            ) : (
              <div className="flex items-center space-x-2">
                <Button variant="ghost" onClick={() => onOpenAuth('login')}>
                  Sign In
                </Button>
                <Button onClick={() => onOpenAuth('register')}>
                  Get Started
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
