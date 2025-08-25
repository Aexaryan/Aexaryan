import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import api from '../utils/api';
import toast from 'react-hot-toast';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Configure api defaults
api.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5001/api';

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [csrfToken, setCsrfToken] = useState(null);

  // Set api auth header
  useEffect(() => {
    if (token) {
      api.defaults.headers.common['Authorization'] = `Bearer ${token}`;
    } else {
      delete api.defaults.headers.common['Authorization'];
    }
  }, [token]);

  // Fetch CSRF token
  const fetchCSRFToken = useCallback(async () => {
    try {
      const response = await api.get('/auth/csrf-token');
      setCsrfToken(response.data.csrfToken);
      // Set CSRF token in api defaults
      api.defaults.headers.common['X-CSRF-Token'] = response.data.csrfToken;
      // Store in localStorage for persistence
      localStorage.setItem('csrfToken', response.data.csrfToken);
    } catch (error) {
      console.error('Failed to fetch CSRF token:', error);
    }
  }, []);

  const checkAuth = useCallback(async () => {
    const savedToken = localStorage.getItem('token');
    if (!savedToken) {
      setLoading(false);
      return;
    }

    try {
      api.defaults.headers.common['Authorization'] = `Bearer ${savedToken}`;
      const response = await api.get('/auth/me');
      
      let userData = response.data.user;
      setProfile(response.data.profile);
      setToken(savedToken);

      // If user is a writer, fetch their profile image
      let updatedUserData = userData;
      if (userData.role === 'journalist') {
        try {
          const writerProfileResponse = await api.get('/writer/profile');
          if (writerProfileResponse.data.profileImage) {
            updatedUserData = { ...userData, profileImage: writerProfileResponse.data.profileImage };
          }
        } catch (profileError) {
          console.error('Failed to fetch writer profile:', profileError);
        }
      }

      setUser(updatedUserData);
    } catch (error) {
      console.error('Auth check failed:', error);
      localStorage.removeItem('token');
      delete api.defaults.headers.common['Authorization'];
    } finally {
      setLoading(false);
    }
  }, []);

  // Check authentication status on mount
  useEffect(() => {
    checkAuth();
    fetchCSRFToken();
  }, [checkAuth, fetchCSRFToken]);

  const login = async (email, password) => {
    try {
      // Ensure CSRF token is available
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      
      const response = await api.post('/auth/login', { email, password });
      
      const { token: newToken, user: userData } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch profile after login
      let updatedUserData = userData;
      try {
        const profileResponse = await api.get('/auth/me');
        setProfile(profileResponse.data.profile);
        
        // If user is a writer, fetch their profile image
        if (userData.role === 'journalist') {
          try {
            const writerProfileResponse = await api.get('/writer/profile');
            if (writerProfileResponse.data.profileImage) {
              updatedUserData = { ...userData, profileImage: writerProfileResponse.data.profileImage };
            }
          } catch (profileError) {
            console.error('Failed to fetch writer profile:', profileError);
          }
        }
      } catch (profileError) {
        console.error('Failed to fetch profile:', profileError);
      }
      
      setUser(updatedUserData);
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
      // Ensure CSRF token is available
      if (!csrfToken) {
        await fetchCSRFToken();
      }
      
      const response = await api.post('/auth/register', userData);
      
      const { token: newToken, user: newUser } = response.data;
      
      localStorage.setItem('token', newToken);
      setToken(newToken);
      setUser(newUser);
      
      api.defaults.headers.common['Authorization'] = `Bearer ${newToken}`;
      
      // Fetch profile after registration
      try {
        const profileResponse = await api.get('/auth/me');
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
      await api.post('/auth/logout');
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      setToken(null);
      setUser(null);
      setProfile(null);
      delete api.defaults.headers.common['Authorization'];
      toast.success('خروج موفقیت‌آمیز بود');
    }
  };

  const updateProfile = (newProfile) => {
    setProfile(newProfile);
  };

  const updateUser = (newUser) => {
    setUser(newUser);
  };

  const updateUserProfileImage = (profileImageUrl) => {
    if (user) {
      setUser({ ...user, profileImage: profileImageUrl });
    }
  };

  const value = {
    user,
    profile,
    loading,
    token,
    login,
    register,
    logout,
    updateProfile,
    updateUser,
    updateUserProfileImage,
    csrfToken,
    fetchCSRFToken,
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