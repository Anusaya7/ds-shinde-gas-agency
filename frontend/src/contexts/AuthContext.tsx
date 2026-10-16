import React, { createContext, useContext, useState, useEffect } from 'react';
import { User } from '../types';
import { authService, LoginPayload, RegisterPayload } from '../services/auth.service';
import toast from 'react-hot-toast';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  isAuthenticated: boolean;
  login: (data: LoginPayload) => Promise<User>;
  register: (data: RegisterPayload) => Promise<User>;
  logout: () => Promise<void>;
  updateUser: (updatedUser: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const saved = localStorage.getItem('user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });

  const [token, setToken] = useState<string | null>(() => {
    return localStorage.getItem('token');
  });

  const [loading, setLoading] = useState<boolean>(true);

  // Initialize and check current user on mount
  useEffect(() => {
    const initAuth = async () => {
      const storedToken = localStorage.getItem('token');
      if (storedToken && storedToken !== 'undefined' && storedToken !== 'null') {
        try {
          const currentUser = await authService.getMe();
          setUser(currentUser);
          localStorage.setItem('user', JSON.stringify(currentUser));
        } catch (error) {
          // If token invalid, keep cached user only if in demo mode or clear
          const cachedUser = localStorage.getItem('user');
          if (!cachedUser) {
            localStorage.removeItem('token');
            setToken(null);
            setUser(null);
          }
        }
      } else {
        localStorage.removeItem('token');
        setToken(null);
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  const login = async (data: LoginPayload): Promise<User> => {
    try {
      const response =
        data.type === 'OTP' && data.otp
          ? await authService.verifyOtp(
              data.identifier,
              data.otp,
              data.role || 'CUSTOMER',
              data.purpose || 'LOGIN',
              data.name
            )
          : await authService.login(data);
      const authToken = response.token || response.accessToken || '';
      setToken(authToken);
      setUser(response.user);
      localStorage.setItem('token', authToken);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success(`Welcome back, ${response.user.name}!`);
      return response.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Login failed. Please check credentials.';
      toast.error(msg);
      throw err;
    }
  };

  const register = async (data: RegisterPayload): Promise<User> => {
    try {
      const response = await authService.register(data);
      setToken(response.token);
      setUser(response.user);
      localStorage.setItem('token', response.token);
      localStorage.setItem('user', JSON.stringify(response.user));
      toast.success('Registration successful!');
      return response.user;
    } catch (err: any) {
      const msg = err.response?.data?.message || err.message || 'Registration failed.';
      toast.error(msg);
      throw err;
    }
  };

  const logout = async () => {
    try {
      await authService.logout();
    } catch {
      // ignore
    } finally {
      setToken(null);
      setUser(null);
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      toast.success('Logged out successfully');
    }
  };

  const updateUser = (updatedFields: Partial<User>) => {
    if (!user) return;
    const updated = { ...user, ...updatedFields };
    setUser(updated);
    localStorage.setItem('user', JSON.stringify(updated));
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!user && !!token,
        login,
        register,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
