import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';

interface ThemeContextType {
  colorScheme: 'light' | 'dark';
  toggleColorScheme: () => void;
  setColorScheme: (scheme: 'light' | 'dark') => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

interface ThemeProviderProps {
  children: ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const deviceColorScheme = useColorScheme();
  const [colorScheme, setColorSchemeState] = useState<'light' | 'dark' | null>(null);

  useEffect(() => {
    // Load theme preference from storage or default to device theme
    const loadTheme = async () => {
      try {
        // For now, we'll default to device theme, but this could be extended to use AsyncStorage
        setColorSchemeState(deviceColorScheme || 'light');
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setColorSchemeState(deviceColorScheme || 'light');
      }
    };

    loadTheme();
  }, [deviceColorScheme]);

  const toggleColorScheme = () => {
    setColorSchemeState(prev => prev === 'light' ? 'dark' : 'light');
  };

  const setColorScheme = (scheme: 'light' | 'dark') => {
    setColorSchemeState(scheme);
  };

  if (colorScheme === null) {
    // Render nothing or a loading state while the theme is being loaded
    return null;
  }

  const contextValue: ThemeContextType = {
    colorScheme,
    toggleColorScheme,
    setColorScheme,
  };

  return (
    <ThemeContext.Provider value={contextValue}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};