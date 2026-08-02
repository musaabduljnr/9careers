import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../../infrastructure/api_client';
import { User, AuthResponse } from '../../domain/types';
import { LoginFormValues, RegisterFormValues } from '../../domain/validation';

interface OAuthValues {
  provider: 'google' | 'github';
  email: string;
  full_name: string;
  avatar_url?: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (values: LoginFormValues) => Promise<void>;
  register: (values: RegisterFormValues) => Promise<void>;
  loginOAuth: (values: OAuthValues) => Promise<void>;
  forgotPassword: (email: string) => Promise<string>;
  logout: () => void;
  updateProfile: (values: Partial<User>) => Promise<void>;
  clearError: () => void;
  error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('token'));
  const [refreshToken, setRefreshToken] = useState<string | null>(localStorage.getItem('refresh_token'));
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initAuth = async () => {
      if (token) {
        try {
          const res = await api.get<User>('/api/v1/auth/me');
          setUser(res.data);
          localStorage.setItem('user', JSON.stringify(res.data));
        } catch (err: any) {
          console.error('Failed to authenticate token', err);
          logout();
        }
      }
      setIsLoading(false);
    };
    initAuth();
  }, [token]);

  const login = async (values: LoginFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>('/api/v1/auth/login-json', values);
      const { access_token, refresh_token: rToken, user: userData } = res.data;
      
      localStorage.setItem('token', access_token);
      if (rToken) localStorage.setItem('refresh_token', rToken);
      localStorage.setItem('user', JSON.stringify(userData));
      
      setToken(access_token);
      if (rToken) setRefreshToken(rToken);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || 'Login failed. Please verify credentials.');
      setIsLoading(false);
      throw err;
    }
  };

  const register = async (values: RegisterFormValues) => {
    setIsLoading(true);
    setError(null);
    try {
      await api.post<User>('/api/v1/auth/register', values);
      await login({ email: values.email, password: values.password });
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please try again.');
      setIsLoading(false);
      throw err;
    }
  };

  const loginOAuth = async (values: OAuthValues) => {
    setIsLoading(true);
    setError(null);
    try {
      const res = await api.post<AuthResponse>('/api/v1/auth/oauth', values);
      const { access_token, refresh_token: rToken, user: userData } = res.data;

      localStorage.setItem('token', access_token);
      if (rToken) localStorage.setItem('refresh_token', rToken);
      localStorage.setItem('user', JSON.stringify(userData));

      setToken(access_token);
      if (rToken) setRefreshToken(rToken);
      setUser(userData);
    } catch (err: any) {
      setError(err.message || `${values.provider} sign-in failed.`);
      setIsLoading(false);
      throw err;
    }
  };

  const forgotPassword = async (email: string) => {
    setError(null);
    try {
      const res = await api.post<{ message: string; reset_token?: string }>('/api/v1/auth/forgot-password', { email });
      return res.data.message;
    } catch (err: any) {
      setError(err.message || 'Password reset request failed.');
      throw err;
    }
  };

  const updateProfile = async (values: Partial<User>) => {
    setError(null);
    try {
      const res = await api.put<User>('/api/v1/auth/profile', values);
      setUser(res.data);
      localStorage.setItem('user', JSON.stringify(res.data));
    } catch (err: any) {
      setError(err.message || 'Failed to update profile.');
      throw err;
    }
  };

  const logout = () => {
    api.post('/api/v1/auth/logout').catch(() => {});
    localStorage.removeItem('token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('user');
    setToken(null);
    setRefreshToken(null);
    setUser(null);
    setError(null);
    setIsLoading(false);
  };

  const clearError = () => setError(null);

  const value: AuthContextType = {
    user,
    token,
    refreshToken,
    isAuthenticated: !!user,
    isLoading,
    login,
    register,
    loginOAuth,
    forgotPassword,
    logout,
    updateProfile,
    clearError,
    error
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
