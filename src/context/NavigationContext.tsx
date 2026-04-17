import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { NavigationState, Page } from '../types';

interface NavigationContextType {
  nav: NavigationState;
  navigate: (page: Page, id?: string) => void;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export function NavigationProvider({ children }: { children: ReactNode }) {
  const [nav, setNav] = useState<NavigationState>({ page: 'dashboard' });

  function navigate(page: Page, id?: string) {
    setNav({ page, selectedId: id });
    window.scrollTo(0, 0);
  }

  return (
    <NavigationContext.Provider value={{ nav, navigate }}>
      {children}
    </NavigationContext.Provider>
  );
}

export function useNavigation() {
  const ctx = useContext(NavigationContext);
  if (!ctx) throw new Error('useNavigation must be used within NavigationProvider');
  return ctx;
}
