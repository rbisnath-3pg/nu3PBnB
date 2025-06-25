import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user is logged in on app start
    const token = localStorage.getItem('token');
    if (token) {
      // You could verify the token here if needed
      // For now, we'll just set a basic user object
      let userData = JSON.parse(localStorage.getItem('user') || 'null');
      if (userData) {
        // Normalize user object to always have _id
        if (userData.id && !userData._id) {
          userData._id = userData.id;
        }
        setUser(userData);
      }
    }
    setLoading(false);
  }, []);

  const login = (userData, token) => {
    // Normalize user object to always have _id
    if (userData.id && !userData._id) {
      userData._id = userData.id;
    }
    setUser(userData);
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const value = {
    user,
    login,
    logout,
    loading
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}; 