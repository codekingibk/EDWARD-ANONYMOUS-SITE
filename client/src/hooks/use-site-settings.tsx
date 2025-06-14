import { createContext, useContext, ReactNode } from "react";
import { useQuery } from "@tanstack/react-query";

interface SiteSettings {
  siteName: string;
  footerText: string;
  logoUrl?: string;
}

interface SiteSettingsContextType {
  settings: SiteSettings | null;
  isLoading: boolean;
}

const SiteSettingsContext = createContext<SiteSettingsContextType | undefined>(undefined);

export function SiteSettingsProvider({ children }: { children: ReactNode }) {
  const { data: settingsData, isLoading } = useQuery({
    queryKey: ['/api/site-settings'],
  });

  const settings = (settingsData as any)?.settings || null;

  return (
    <SiteSettingsContext.Provider value={{ settings, isLoading }}>
      {children}
    </SiteSettingsContext.Provider>
  );
}

export function useSiteSettings() {
  const context = useContext(SiteSettingsContext);
  if (context === undefined) {
    throw new Error('useSiteSettings must be used within a SiteSettingsProvider');
  }
  return context;
}