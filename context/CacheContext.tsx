import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface CacheEntry<T> {
    data: T;
    timestamp: number;
}

interface CacheContextType {
    get: <T>(key: string) => T | null;
    set: <T>(key: string, data: T) => void;
    invalidate: (key: string) => void;
    invalidateAll: () => void;
    isStale: (key: string, maxAge?: number) => boolean;
}

const CacheContext = createContext<CacheContextType | undefined>(undefined);

const DEFAULT_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const CacheProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [cache, setCache] = useState<Map<string, CacheEntry<any>>>(new Map());

    const get = useCallback(<T,>(key: string): T | null => {
        const entry = cache.get(key);
        if (!entry) return null;
        return entry.data as T;
    }, [cache]);

    const set = useCallback(<T,>(key: string, data: T) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.set(key, {
                data,
                timestamp: Date.now()
            });
            return newCache;
        });
    }, []);

    const invalidate = useCallback((key: string) => {
        setCache(prev => {
            const newCache = new Map(prev);
            newCache.delete(key);
            return newCache;
        });
    }, []);

    const invalidateAll = useCallback(() => {
        setCache(new Map());
    }, []);

    const isStale = useCallback((key: string, maxAge: number = DEFAULT_MAX_AGE): boolean => {
        const entry = cache.get(key);
        if (!entry) return true;
        return Date.now() - entry.timestamp > maxAge;
    }, [cache]);

    const value = {
        get,
        set,
        invalidate,
        invalidateAll,
        isStale
    };

    return (
        <CacheContext.Provider value={value}>
            {children}
        </CacheContext.Provider>
    );
};

export const useCache = () => {
    const context = useContext(CacheContext);
    if (!context) {
        throw new Error('useCache must be used within a CacheProvider');
    }
    return context;
};
