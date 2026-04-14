import { createContext, useContext, useState } from 'react';
import type { AuthContextType, LoginFormData, User } from '../types/auth.types.ts';
import type { ReactNode } from 'react';
const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);

  const login = async (data: LoginFormData) => {
    // TODO: remplacer par ton appel API réel
    console.log('Login avec :', data);
    // Simulation temporaire
    setUser({
      id: '1',
      email: data.email,
      role: 'admin',
      nom: 'ZANNOU',
      prenom: 'Jean',
    });
  };

  const logout = () => setUser(null);

  return (
    <AuthContext.Provider value={{ user, isAuthenticated: !!user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth doit être utilisé dans AuthProvider');
  return ctx;
};
