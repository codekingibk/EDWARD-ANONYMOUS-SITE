import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { SiteSettingsProvider, useSiteSettings } from "@/hooks/use-site-settings";
import { Navigation } from "@/components/Navigation";
import { AuthModal } from "@/components/AuthModal";
import { useState, useEffect } from "react";
import Home from "@/pages/home";
import UserProfile from "@/pages/user-profile";
import NotFound from "@/pages/not-found";

function Router() {
  const [authModalOpen, setAuthModalOpen] = useState(false);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const { user } = useAuth();
  const { settings } = useSiteSettings();

  // Close modal when user successfully authenticates
  useEffect(() => {
    if (user && authModalOpen) {
      setAuthModalOpen(false);
    }
  }, [user, authModalOpen]);

  const openAuthModal = (mode: 'login' | 'register') => {
    setAuthMode(mode);
    setAuthModalOpen(true);
  };

  return (
    <div className="min-h-screen bg-background">
      <Navigation onOpenAuth={openAuthModal} />
      <main className="container mx-auto px-4 sm:px-6 lg:px-8">
        <Switch>
          <Route path="/" component={Home} />
          <Route path="/u/:username" component={UserProfile} />
          <Route path="/login">
            {() => {
              if (!user) {
                openAuthModal('login');
              }
              return <Home />;
            }}
          </Route>
          <Route path="/register">
            {() => {
              if (!user) {
                openAuthModal('register');
              }
              return <Home />;
            }}
          </Route>
          <Route component={NotFound} />
        </Switch>
      </main>

      <AuthModal
        isOpen={authModalOpen}
        onClose={() => setAuthModalOpen(false)}
        initialMode={authMode}
      />

      {/* Footer */}
      <footer className="theme-transition border-t border-border bg-card/80 glass-card mt-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="col-span-1 md:col-span-2">
              <div className="text-2xl font-bold gradient-text mb-4 flex items-center">
                {settings?.siteName || "Edwards Anonymous"}
              </div>
              <p className="text-muted-foreground mb-4 max-w-md">
                Connecting people authentically through anonymous communication. Built for the modern world of 2025.
              </p>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Platform</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">How it Works</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Community Guidelines</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Safety & Privacy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">FAQ</a></li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold mb-4">Support</h4>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Contact Us</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Terms of Service</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Privacy Policy</a></li>
                <li><a href="#" className="hover:text-primary transition-colors duration-200">Cookie Policy</a></li>
              </ul>
            </div>
          </div>
          <hr className="my-8 border-border" />
          <div className="flex flex-col md:flex-row justify-between items-center">
            <p className="text-sm text-muted-foreground">
              {settings?.footerText || "© 2025 Edwards Anonymous. All rights reserved. Made with 💜 for authentic connections."}
            </p>
            <div className="flex items-center mt-4 md:mt-0">
              <span className="status-indicator status-online mr-2"></span>
              <span className="text-sm text-muted-foreground">System Status: All Good</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="edwards-anonymous-theme">
        <SiteSettingsProvider>
          <AuthProvider>
            <TooltipProvider>
              <Toaster />
              <Router />
            </TooltipProvider>
          </AuthProvider>
        </SiteSettingsProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
