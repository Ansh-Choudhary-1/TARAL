import { createContext, useCallback, useContext, useMemo, useState, ReactNode } from 'react';
import { get, set, remove, STORAGE_KEYS } from '../lib/storage';

export interface User {
  id: string;
  name: string;
  type: 'msme' | 'admin';
  industry?: string;
  company?: string;
  email: string;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => get<User | null>(STORAGE_KEYS.user, null));

  const login = useCallback((userData: User) => {
    setUser(userData);
    set(STORAGE_KEYS.user, userData);
  }, []);

  const logout = useCallback(() => {
    // Intentionally only clears the session key. Orders, marketplace stock,
    // fleet and monitoring data stay in localStorage so they persist across
    // logins for the account that created them.
    setUser(null);
    remove(STORAGE_KEYS.user);
  }, []);

  const updateUser = useCallback((updates: Partial<User>) => {
    setUser((prev) => {
      if (!prev) return prev;
      const next = { ...prev, ...updates };
      set(STORAGE_KEYS.user, next);
      // Keep the account registry in sync so the profile survives re-login.
      const accounts = get<Record<string, User>>(STORAGE_KEYS.accounts, {});
      accounts[next.email] = next;
      set(STORAGE_KEYS.accounts, accounts);
      return next;
    });
  }, []);

  const value = useMemo(() => ({ user, login, logout, updateUser }), [user, login, logout, updateUser]);

  return <UserContext.Provider value={value}>{children}</UserContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}
