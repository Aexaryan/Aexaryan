import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure axios defaults
axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));

  // Set axios auth header
  useEffect(() => {
    if (token) {
      axios.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete axios.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      axios.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      const response = await axios.get('/auth/me');
      
      setUser(response.data.user);
      setProfile(response.data.profile);
      setToken(savedToken);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete axios.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await axios.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(userData);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch profile after login
      try {
        const profileResponse = await axios.get('/auth/me');
        setProfile(profileResponse.data.profile);
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }
      
      toast.success('ورود موفقیت‌آمیز بود');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'خطا در ورود';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const register = async (userData) => {
    try {
      const response = await axios.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      axios.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch profile after registration
      try {
        const profileResponse = await axios.get('/auth/me');
        setProfile(profileResponse.data.profile);
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }
      
      toast.success('ثبت نام موفقیت‌آمیز بود');
      return { success: true };
    } catch (error) {
      const message = error.response?.data?.error || 'خطا در ثبت نام';
      toast.error(message);
      return { success: false, error: message };
    }
  };

  const logout = async () => {
    try {
      await axios.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setProfile(null);
      delete axios.defaults.headers.common['Authorization'];
      toast.success('خروج موفقیت‌آمیز بود');
    }
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  const value = {
    user,
    profile,
    loading,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    isAuthenticated: !!user,
    isTalent: user?.role === 'talent',
    isCastingDirector: user?.role === 'casting_director'
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};