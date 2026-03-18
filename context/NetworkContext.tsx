import React, { createContext, useContext, useEffect, useState } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { Platform } from 'react-native';

interface NetworkContextType {
  isConnected: boolean;
  isInternetReachable: boolean;
  networkType: string | null;
  checkConnectivity: () => Promise<boolean>;
}

const NetworkContext = createContext<NetworkContextType | undefined>(undefined);

export const NetworkProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(true);
  const [isInternetReachable, setIsInternetReachable] = useState(true);
  const [networkType, setNetworkType] = useState<string | null>(null);

  useEffect(() => {
    // Web — use native browser events instead of NetInfo
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        setIsConnected(true);
        setIsInternetReachable(true);
      };
      const handleOffline = () => {
        setIsConnected(false);
        setIsInternetReachable(false);
      };

      // Set initial state from browser
      setIsConnected(navigator.onLine);
      setIsInternetReachable(navigator.onLine);

      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }

    // Mobile — use NetInfo as before
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(!!state.isConnected);
      setIsInternetReachable(!!state.isInternetReachable);
      setNetworkType(state.type);
    });

    return () => unsubscribe();
  }, []);

  const checkConnectivity = async (): Promise<boolean> => {
    // Web — trust the browser's navigator.onLine
    if (Platform.OS === 'web') {
      return navigator.onLine;
    }

    // Mobile — use NetInfo as before
    const state = await NetInfo.fetch();
    return !!state.isConnected && !!state.isInternetReachable;
  };

  return (
    <NetworkContext.Provider value={{
      isConnected,
      isInternetReachable,
      networkType,
      checkConnectivity
    }}>
      {children}
    </NetworkContext.Provider>
  );
};

export const useNetwork = () => {
  const context = useContext(NetworkContext);
  if (context === undefined) {
    throw new Error('useNetwork must be used within a NetworkProvider');
  }
  return context;
};