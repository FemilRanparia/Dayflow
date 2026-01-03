import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, Employee } from '../types';
import { authService } from '../services/authService';

interface AuthContextType {
  user: User | null;
  employee: Employee | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (data: any) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      if (token) {
        try {
          const data = await authService.getMe();
          setUser(data.user);
          setEmployee(data.employee);
        } catch (error) {
          localStorage.removeItem('token');
        }
      }
      setIsLoading(false);
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string) => {
    const response = await authService.signin({ email, password });
    localStorage.setItem('token', response.token);
    setUser(response.user);
    const data = await authService.getMe();
    setEmployee(data.employee);
  };

  const signup = async (data: any) => {
    const response = await authService.signup(data);
    localStorage.setItem('token', response.token);
    setUser(response.user);
    const userData = await authService.getMe();
    setEmployee(userData.employee);
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
    setEmployee(null);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        employee,
        isAuthenticated: !!user,
        isLoading,
        login,
        signup,
        logout,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
