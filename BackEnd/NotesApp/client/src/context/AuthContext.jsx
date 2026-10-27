import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('notes_user_data');
    return saved ? JSON.parse(saved) : null;
  });
  const [token, setToken] = useState(() => localStorage.getItem('notes_auth_token'));
  const [loading, setLoading] = useState(true);

  // Synchronize authentication state on initial load
  useEffect(() => {
    const verifyToken = async () => {
      const storedToken = localStorage.getItem('notes_auth_token');
      if (storedToken) {
        try {
          const res = await api.get('/auth/me');
          setUser(res.data.data);
          localStorage.setItem('notes_user_data', JSON.stringify(res.data.data));
        } catch (err) {
          console.warn('Saved token verification failed:', err.response?.data?.message || err.message);
          logout();
        }
      }
      setLoading(false);
    };

    verifyToken();

    const handleUnauthorized = () => {
      setUser(null);
      setToken(null);
    };

    window.addEventListener('auth:unauthorized', handleUnauthorized);
    return () => window.removeEventListener('auth:unauthorized', handleUnauthorized);
  }, []);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    const { token: receivedToken, ...userData } = res.data.data;

    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('notes_auth_token', receivedToken);
    localStorage.setItem('notes_user_data', JSON.stringify(userData));
    return userData;
  };

  const register = async (name, email, password, avatarUrl) => {
    const res = await api.post('/auth/register', { name, email, password, avatarUrl });
    const { token: receivedToken, ...userData } = res.data.data;

    setToken(receivedToken);
    setUser(userData);
    localStorage.setItem('notes_auth_token', receivedToken);
    localStorage.setItem('notes_user_data', JSON.stringify(userData));
    return userData;
  };

  const logout = () => {
    localStorage.removeItem('notes_auth_token');
    localStorage.removeItem('notes_user_data');
    setToken(null);
    setUser(null);
  };

  const updateProfile = async (name, avatarUrl) => {
    const res = await api.put('/users/me', { name, avatarUrl });
    const updated = res.data.data;
    setUser(updated);
    localStorage.setItem('notes_user_data', JSON.stringify(updated));
    return updated;
  };

  const changePassword = async (currentPassword, newPassword) => {
    const res = await api.put('/users/me/password', { currentPassword, newPassword });
    return res.data;
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        isAuthenticated: !!token,
        login,
        register,
        logout,
        updateProfile,
        changePassword
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
