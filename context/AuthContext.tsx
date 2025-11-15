import React, { createContext, useState, useEffect, useContext, useMemo } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import DummyApiService from '@/services/dummyApiService';

interface AuthContextType {
  sessionToken: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (firstname: string, lastname: string, email: string, telephone: string, password: string) => Promise<boolean>;
  signOut: () => Promise<void>;
  loadingAuth: boolean;
  apiService: DummyApiService;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [sessionToken, setSessionToken] = useState<string | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loadingAuth, setLoadingAuth] = useState(true);

  const apiService = useMemo(() => new DummyApiService(sessionToken), [sessionToken]);

  useEffect(() => {
    const loadSession = async () => {
      try {
        const storedToken = await AsyncStorage.getItem('sessionToken');
        if (storedToken) {
          setSessionToken(storedToken);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error("Failed to load session token:", error);
      } finally {
        setLoadingAuth(false);
      }
    };
    loadSession();
  }, []);

  useEffect(() => {
    apiService.setSessionToken(sessionToken);
  }, [sessionToken, apiService]);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.login(email, password);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        setSessionToken(token);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("Login failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Login API error:", error);
      return false;
    }
  };

  const register = async (firstname: string, lastname: string, email: string, telephone: string, password: string): Promise<boolean> => {
    try {
      const response = await apiService.register(firstname, lastname, email, telephone, password);
      if (response.token) {
        const token = response.token;
        await AsyncStorage.setItem('sessionToken', token);
        setSessionToken(token);
        setIsAuthenticated(true);
        return true;
      } else {
        console.error("Registration failed:", response);
        return false;
      }
    } catch (error) {
      console.error("Registration API error:", error);
      return false;
    }
  };

  const signOut = async () => {
    try {
      await AsyncStorage.removeItem('sessionToken');
      setSessionToken(null);
      setIsAuthenticated(false);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  };

  return (
    <AuthContext.Provider value={{ sessionToken, isAuthenticated, login, register, signOut, loadingAuth, apiService }}>
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