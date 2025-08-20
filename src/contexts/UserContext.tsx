import React, { createContext, useContext, useState, ReactNode, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  type: 'msme' | 'admin';
  industry?: string;
  company?: string;
  email: string;
  carbonCredits?: number;
  cleanFuelStars?: number;
}

interface UserContextType {
  user: User | null;
  login: (userData: User) => void;
  logout: () => void;
  updateUser: (updates: Partial<User>) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    // Initialize user state from localStorage on component mount
    const savedUser = localStorage.getItem('user');
    console.log('Initializing user state from localStorage:', savedUser);
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData: User) => {
    console.log('Logging in user:', userData);
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    console.log('Logging out user');
    setUser(null);
    localStorage.removeItem('user');
  };

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  // Restore user data from localStorage on component mount
  useEffect(() => {
    console.log('UserProvider useEffect running, checking localStorage...');
    const savedUser = localStorage.getItem('user');
    console.log('Found saved user in localStorage:', savedUser);
    
    if (savedUser) {
      try {
        const parsedUser = JSON.parse(savedUser);
        console.log('Successfully parsed user data:', parsedUser);
        setUser(parsedUser);
      } catch (error) {
        console.error('Error parsing saved user data:', error);
        localStorage.removeItem('user');
      }
    } else {
      console.log('No saved user found in localStorage');
    }
  }, []);

  console.log('Current user state:', user);

  return (
    <UserContext.Provider value={{ user, login, logout, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
}