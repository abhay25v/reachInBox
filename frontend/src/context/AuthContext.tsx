import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authApi } from '../api/auth';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    if (!loading && user !== null) {
      // Already have user, don't refetch
      return;
    }
    
    try {
      const userData = await authApi.getCurrentUser();
      setUser(userData);
    } catch (error) {
      console.error('Failed to fetch user:', error);
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    let isFetching = false;
    
    const loadUser = async () => {
      if (mounted && !isFetching) {
        isFetching = true;
        try {
          const userData = await authApi.getCurrentUser();
          if (mounted) {
            console.log('User fetched:', userData);
            setUser(userData);
          }
        } catch (error) {
          if (mounted) {
            console.error('Failed to fetch user:', error);
            setUser(null);
          }
        } finally {
          if (mounted) {
            setLoading(false);
          }
          isFetching = false;
        }
      }
    };
    
    loadUser();
    return () => { 
      mounted = false; 
    };
  }, []);

  const logout = async () => {
    await authApi.logout();
    setUser(null);
  };

  const refreshUser = async () => {
    await fetchUser();
  };

  return (
    <AuthContext.Provider value={{ user, loading, logout, refreshUser }}>
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
