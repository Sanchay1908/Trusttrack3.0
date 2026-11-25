import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole } from '../types';
import { INITIAL_PROFILES } from '../data/seedData';
import { STORAGE_KEYS, supabase, isSupabaseConfigured } from '../lib/supabase';

interface AuthContextType {
  user: UserProfile | null;
  role: UserRole;
  isAuthenticated: boolean;
  login: (email: string, password?: string) => Promise<boolean>;
  loginAsRole: (role: UserRole) => void;
  logout: () => void;
  updateProfile: (updates: Partial<UserProfile>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(() => {
    const cached = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    if (cached) {
      try {
        return JSON.parse(cached);
      } catch (e) {
        console.error('Failed to parse cached user:', e);
      }
    }
    // Default to Admin Vikramaditya Roy for initial view
    return INITIAL_PROFILES[0];
  });

  useEffect(() => {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  }, [user]);

  const login = async (email: string, _password?: string): Promise<boolean> => {
    if (isSupabaseConfigured && supabase) {
      try {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password: _password || 'password123'
        });
        if (!error && data?.user) {
          const profile = INITIAL_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase()) || {
            id: data.user.id,
            email: data.user.email || email,
            full_name: data.user.user_metadata?.full_name || email.split('@')[0],
            role: (data.user.user_metadata?.role as UserRole) || 'admin',
            department: 'Risk Management',
            created_at: new Date().toISOString()
          };
          setUser(profile);
          return true;
        }
      } catch (err) {
        console.warn('Supabase remote signin fallback to local demo auth:', err);
      }
    }

    // Direct role profile match for rapid review
    const matched = INITIAL_PROFILES.find(p => p.email.toLowerCase() === email.toLowerCase());
    if (matched) {
      setUser(matched);
      return true;
    }

    // If new email, create session with requested role or admin default
    const newUser: UserProfile = {
      id: `usr_${Date.now()}`,
      email,
      full_name: email.split('@')[0].replace('.', ' ').replace(/\b\w/g, l => l.toUpperCase()),
      role: email.toLowerCase().includes('review') ? 'reviewer' : 'admin',
      department: email.toLowerCase().includes('review') ? 'Credit Underwriting Desk' : 'Risk Management & AI Compliance',
      created_at: new Date().toISOString()
    };
    setUser(newUser);
    return true;
  };

  const loginAsRole = (targetRole: UserRole) => {
    const profile = INITIAL_PROFILES.find(p => p.role === targetRole) || INITIAL_PROFILES[0];
    setUser(profile);
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  };

  const updateProfile = (updates: Partial<UserProfile>) => {
    if (!user) return;
    setUser({ ...user, ...updates });
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || 'admin',
        isAuthenticated: !!user,
        login,
        loginAsRole,
        logout,
        updateProfile
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
