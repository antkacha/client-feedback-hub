import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { User, AuthState } from '../types';
import { authService } from '../services/authService';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterData) => Promise<void>;
  logout: () => Promise<void>;
  refreshToken: () => Promise<void>;
  updateUser: (user: User) => void;
}

interface RegisterData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
}

interface AuthProviderProps {
  children: ReactNode;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth має використовуватися в AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    accessToken: localStorage.getItem('accessToken'),
  });

  // Перевірка автентифікації при завантаженні додатку
  useEffect(() => {
    const initAuth = async () => {
      try {
        if (authService.isAuthenticated()) {
          // Спробуємо отримати поточного користувача з timeout
          const user = await Promise.race([
            authService.getCurrentUser(),
            new Promise((_, reject) => 
              setTimeout(() => reject(new Error('Timeout')), 5000)
            )
          ]) as User;
          
          setState(prev => ({
            ...prev,
            user,
            isAuthenticated: true,
            isLoading: false,
            accessToken: authService.getAccessToken(),
          }));
        } else {
          setState(prev => ({
            ...prev,
            isLoading: false,
          }));
        }
      } catch (error) {
        console.warn('Auth initialization error:', error);
        // Якщо є токен, але не можемо отримати користувача - очищуємо стан
        authService.clearTokens();
        setState(prev => ({
          ...prev,
          user: null,
          isAuthenticated: false,
          accessToken: null,
          isLoading: false,
        }));
      }
    };

    // Запускаємо ініціалізацію з невеликою затримкою
    const timeoutId = setTimeout(initAuth, 100);
    
    return () => clearTimeout(timeoutId);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const { user, accessToken } = await authService.login({ email, password });

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        accessToken,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      throw error;
    }
  };

  const register = async (data: RegisterData) => {
    try {
      // Надсилаємо тільки потрібні поля бекенду (без confirmPassword)
      const registerData = {
        email: data.email,
        password: data.password,
        firstName: data.firstName,
        lastName: data.lastName
      };
      
      const { user, accessToken } = await authService.register(registerData);

      setState(prev => ({
        ...prev,
        user,
        isAuthenticated: true,
        accessToken,
        isLoading: false,
      }));
    } catch (error) {
      setState(prev => ({
        ...prev,
        isLoading: false,
      }));
      throw error;
    }
  };

  const logout = async () => {
    // Викликаємо authService для повного logout
    await authService.logout();
    
    setState({
      user: null,
      isAuthenticated: false,
      accessToken: null,
      isLoading: false,
    });
  };

  const refreshToken = async () => {
    try {
      const accessToken = await authService.refreshToken();

      setState(prev => ({
        ...prev,
        accessToken,
      }));
    } catch (error) {
      // Не вдалося оновити токен, виходимо
      await logout();
      throw error;
    }
  };

  const updateUser = (user: User) => {
    setState(prev => ({
      ...prev,
      user,
    }));
  };

  const contextValue: AuthContextType = {
    ...state,
    login,
    register,
    logout,
    refreshToken,
    updateUser,
  };

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};