
import React, { createContext, useContext, useState, useEffect } from 'react';
import { authApi } from '@/services/api';

const AuthContext = createContext(undefined);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Check for existing session on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('user');
    const token = localStorage.getItem('token');
    
    if (storedUser && token) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
    }
    
    setIsLoading(false);
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Add the token from registration if available
      const regToken = localStorage.getItem('regToken');
      const response = await authApi.login(email, password, regToken);
      
      if (response.token) {
        // Store the token
        localStorage.setItem('token', response.token);
        
        // Format and store user info
        const userData = {
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
          role: response.user.role,
        };
        
        localStorage.setItem('user', JSON.stringify(userData));
        setUser(userData);
        return true;
      } else {
        throw new Error('Login failed - no token received');
      }
    } catch (error) {
      console.error('Login error:', error);
      setError('Invalid credentials. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const signup = async (name, email, password) => {
    setIsLoading(true);
    setError(null);
    
    try {
      const response = await authApi.register(name, email, password);
      
      if (response.success) {
        // Extract and store the registration token (if available)
        if (response.token) {
          // Parse the token format "Bearer token_id"
          const tokenValue = response.token.startsWith('Bearer ') 
            ? response.token.substring(7) 
            : response.token;
          
          localStorage.setItem('regToken', tokenValue);
        }
        
        // Auto-login after successful signup
        return await login(email, password);
      } else {
        throw new Error('Signup failed');
      }
    } catch (error) {
      console.error('Signup error:', error);
      setError('Registration failed. Please try again.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    localStorage.removeItem('regToken');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, error, login, signup, logout }}>
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
