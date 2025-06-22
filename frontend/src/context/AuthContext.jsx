// src/context/AuthContext.jsx
import React, { createContext, useContext, useEffect, useState } from 'react';
import api, { register as registerApi, googleLogin } from '../utils/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchUser = async () => {
    const token = localStorage.getItem('token');

    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const { data } = await api.get('/auth/me');
      setUser(data.user);
    } catch (error) {
      localStorage.removeItem('token');
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUser();
  }, []);

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  // Register function
  const register = async (userData) => {
    try {
      const response = await registerApi(userData);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  // Google Auth function
  const googleAuth = async (accessToken) => {
    try {
      const response = await googleLogin(accessToken);
      if (response.data?.token) {
        localStorage.setItem('token', response.data.token);
        setUser(response.data.user);
      }
      return response;
    } catch (error) {
      throw error;
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      setUser, 
      loading, 
      logout, 
      register, 
      googleAuth 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// ✅ Export BOTH
export const useAuth = () => useContext(AuthContext);
export { AuthContext };
