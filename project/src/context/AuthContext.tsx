import React, { createContext, useContext, useReducer, useEffect } from 'react';
import { AuthState, User } from '../types';
import { api } from '../services/api';

// Initial state
const initialState: AuthState = {
  user: null,
  token: localStorage.getItem('token'),
  isAuthenticated: false,
  isLoading: true,
  error: null
};

// Action types
type AuthAction = 
  | { type: 'LOGIN_SUCCESS'; payload: { user: User; token: string } }
  | { type: 'LOGIN_FAIL'; payload: string }
  | { type: 'LOGOUT' }
  | { type: 'CLEAR_ERROR' }
  | { type: 'AUTH_LOADING' }
  | { type: 'AUTH_LOADED'; payload?: { user: User } };

// Reducer
const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case 'AUTH_LOADING':
      return {
        ...state,
        isLoading: true
      };
    case 'AUTH_LOADED':
      return {
        ...state,
        isLoading: false,
        isAuthenticated: action.payload ? true : false,
        user: action.payload?.user || null
      };
    case 'LOGIN_SUCCESS':
      localStorage.setItem('token', action.payload.token);
      localStorage.setItem('user', JSON.stringify(action.payload.user));
      return {
        ...state,
        isAuthenticated: true,
        isLoading: false,
        user: action.payload.user,
        token: action.payload.token,
        error: null
      };
    case 'LOGIN_FAIL':
      localStorage.removeItem('token');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null,
        error: action.payload
      };
    case 'LOGOUT':
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      return {
        ...state,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        user: null
      };
    case 'CLEAR_ERROR':
      return {
        ...state,
        error: null
      };
    default:
      return state;
  }
};

// Create context
interface AuthContextProps {
  state: AuthState;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

// Provider component
export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if token is valid on load
  useEffect(() => {
    const loadUser = async () => {
      const token = localStorage.getItem('token');
      const user = localStorage.getItem('user');
      
      if (!token || !user) {
        dispatch({ type: 'AUTH_LOADED' });
        return;
      }
      
      try {
        // Decode token to get user info
        // const decoded = jwtDecode<{ user: User }>(token);
        // const user = decoded.user;
        // console.log('Decoded User:', user);
        
        const parsedUser: User = JSON.parse(user);
        // Set auth token in axios headers
        api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
        
        dispatch({ 
          type: 'AUTH_LOADED', 
          payload: { user: parsedUser  } 
        });
      } catch (err) {
        dispatch({ type: 'LOGIN_FAIL', payload: 'Invalid token' });
      }
    };

    dispatch({ type: 'AUTH_LOADING' });
    loadUser();
  }, []);

  // const login = async (email: string, password: string) => {
  //   try {
  //     dispatch({ type: 'AUTH_LOADING' });
      
  //     // Demo credentials logic for development purposes
  //     let userData: User;
  //     let token: string;
      
  //     // Use demo credentials
  //     if (email === 'admin@demo.com' && password === 'admin123') {
  //       userData = { 
  //         id: '1', 
  //         name: 'Admin User', 
  //         email: 'admin@demo.com', 
  //         role: 'admin',
  //         registrationId: 'ADM001',
  //         country: 'Global'
  //       };
  //       token = 'admin-demo-token';
  //     } else if (email === 'prepress@demo.com' && password === 'prepress123') {
  //       userData = { 
  //         id: '2', 
  //         name: 'Pre Press Inspector', 
  //         email: 'prepress@demo.com', 
  //         role: 'pre_press',
  //         registrationId: 'PP001',
  //         country: 'India'
  //       };
  //       token = 'prepress-demo-token';
  //     } else if (email === 'press@demo.com' && password === 'press123') {
  //       userData = { 
  //         id: '3', 
  //         name: 'Press Inspector', 
  //         email: 'press@demo.com', 
  //         role: 'press',
  //         registrationId: 'PR001',
  //         country: 'USA'
  //       };
  //       token = 'press-demo-token';
  //     } else if (email === 'postpress@demo.com' && password === 'postpress123') {
  //       userData = { 
  //         id: '4', 
  //         name: 'Post Press Inspector', 
  //         email: 'postpress@demo.com', 
  //         role: 'post_press',
  //         registrationId: 'PP002',
  //         country: 'Germany'
  //       };
  //       token = 'postpress-demo-token';
  //     } else if (email === 'packaging@demo.com' && password === 'packaging123') {
  //       userData = { 
  //         id: '5', 
  //         name: 'Packaging Inspector', 
  //         email: 'packaging@demo.com', 
  //         role: 'packaging',
  //         registrationId: 'PK001',
  //         country: 'Japan'
  //       };
  //       token = 'packaging-demo-token';
  //     } else {
  //       throw new Error('Invalid credentials');
  //     }
      
  //     // In production, this would be an actual API call
  //     // const response = await api.post('/auth/login', { email, password });
  //     // const { user, token } = response.data;
      
  //     // Set auth token in axios headers
  //     api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
      
  //     dispatch({
  //       type: 'LOGIN_SUCCESS',
  //       payload: { user: userData, token }
  //     });
  //   } catch (err) {
  //     dispatch({
  //       type: 'LOGIN_FAIL',
  //       payload: err instanceof Error ? err.message : 'Login failed'
  //     });
  //   }
  // };

  // Login user
  const login = async (email: string, password: string) => {
    try {
      dispatch({ type: 'AUTH_LOADING' });
      
      const response = await api.post('/auth/login', { email, password });
      const { access_token, user } = response.data.data;
      // Set auth token in axios headers
      api.defaults.headers.common['Authorization'] = `Bearer ${access_token}`;
      
      dispatch({
        type: 'LOGIN_SUCCESS',
        payload: { user: user, token:access_token }
      });
    } catch (err) {
      dispatch({
        type: 'LOGIN_FAIL',
        payload: err instanceof Error ? err.message : 'Login failed'
      });
    }
  };
  

  // Logout user
  const logout = () => {
    dispatch({ type: 'LOGOUT' });
  };

  // Clear error
  const clearError = () => {
    dispatch({ type: 'CLEAR_ERROR' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout, clearError }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};