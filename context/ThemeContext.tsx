import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
    // Load theme preference from storage or default to light mode
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem('theme');
        if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark')) {
          setColorSchemeState(savedTheme);
        } else {
          // Default to light mode (not device theme)
          setColorSchemeState('light');
        }
      } catch (error) {
        console.error('Failed to load theme preference:', error);
        setColorSchemeState('light'); // Default to light on error
      }
    };

    loadTheme();
  }, []);

  const toggleColorScheme = async () => {
    const newScheme = colorScheme === 'light' ? 'dark' : 'light';
    setColorSchemeState(newScheme);
    try {
      await AsyncStorage.setItem('theme', newScheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
  };

  const setColorScheme = async (scheme: 'light' | 'dark') => {
    setColorSchemeState(scheme);
    try {
      await AsyncStorage.setItem('theme', scheme);
    } catch (error) {
      console.error('Failed to save theme preference:', error);
    }
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