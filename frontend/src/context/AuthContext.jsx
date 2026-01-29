import { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';
import api from '../utils/api';

const AuthContext = createContext(null);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem('token') || null);
  const [userId, setUserId] = useState(localStorage.getItem('userId') || null);
  const [userEmail, setUserEmail] = useState(localStorage.getItem('userEmail') || null);
  const [userType, setUserType] = useState(localStorage.getItem('userType') || 'private');
  const [teamId, setTeamId] = useState(() => {
    const stored = localStorage.getItem('teamId');
    return (stored && stored !== 'null' && stored !== '') ? stored : null;
  });
  const [teamRole, setTeamRole] = useState(localStorage.getItem('teamRole') || null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUserId(decoded.userId);
        setUserEmail(decoded.email);
        setUserType(decoded.userType || 'private');
        setTeamId(decoded.teamId || null);
        setTeamRole(decoded.teamRole || null);

        localStorage.setItem('userId', decoded.userId);
        localStorage.setItem('userEmail', decoded.email);
        localStorage.setItem('userType', decoded.userType || 'private');
        if (decoded.teamId) {
          localStorage.setItem('teamId', decoded.teamId);
        } else {
          localStorage.removeItem('teamId');
        }
        localStorage.setItem('teamRole', decoded.teamRole || '');
      } catch (err) {
        // Invalid token
        logout();
      }
    }
    setLoading(false);
  }, [token]);

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token: newToken, user } = response.data;

      setToken(newToken);
      localStorage.setItem('token', newToken);

      const decoded = jwtDecode(newToken);
      setUserId(decoded.userId);
      setUserEmail(decoded.email);
      setUserType(decoded.userType || 'private');
      setTeamId(decoded.teamId || null);
      setTeamRole(decoded.teamRole || null);

      localStorage.setItem('userId', decoded.userId);
      localStorage.setItem('userEmail', decoded.email);
      localStorage.setItem('userType', decoded.userType || 'private');
      if (decoded.teamId) {
        localStorage.setItem('teamId', decoded.teamId);
      } else {
        localStorage.removeItem('teamId');
      }
      localStorage.setItem('teamRole', decoded.teamRole || '');

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Login failed',
      };
    }
  };

  const signup = async (email, password, userType = 'private', inviteCode = null) => {
    try {
      const payload = { email, password, userType };
      if (inviteCode) {
        payload.inviteCode = inviteCode;
      }

      const response = await api.post('/auth/signup', payload);
      return { success: true, message: response.data.message || 'Signup successful' };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.error || 'Signup failed',
      };
    }
  };

  const logout = () => {
    setToken(null);
    setUserId(null);
    setUserEmail(null);
    setUserType('private');
    setTeamId(null);
    setTeamRole(null);

    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('userEmail');
    localStorage.removeItem('userType');
    localStorage.removeItem('teamId');
    localStorage.removeItem('teamRole');
  };

  const refreshAuth = (newToken) => {
    console.log('🔄 refreshAuth called with token:', newToken ? 'present' : 'missing');

    setToken(newToken);
    localStorage.setItem('token', newToken);

    const decoded = jwtDecode(newToken);
    console.log('📦 Decoded JWT:', decoded);
    console.log('   - userId:', decoded.userId);
    console.log('   - email:', decoded.email);
    console.log('   - userType:', decoded.userType);
    console.log('   - teamId:', decoded.teamId);
    console.log('   - teamRole:', decoded.teamRole);

    setUserId(decoded.userId);
    setUserEmail(decoded.email);
    setUserType(decoded.userType || 'private');
    setTeamId(decoded.teamId || null);
    setTeamRole(decoded.teamRole || null);

    localStorage.setItem('userId', decoded.userId);
    localStorage.setItem('userEmail', decoded.email);
    localStorage.setItem('userType', decoded.userType || 'private');
    if (decoded.teamId) {
      console.log('✅ Storing teamId in localStorage:', decoded.teamId);
      localStorage.setItem('teamId', decoded.teamId);
    } else {
      console.log('⚠️  No teamId in JWT, removing from localStorage');
      localStorage.removeItem('teamId');
    }
    localStorage.setItem('teamRole', decoded.teamRole || '');

    console.log('✅ refreshAuth complete. New teamId state:', decoded.teamId || null);
  };

  const isAuthenticated = !!token;

  return (
    <AuthContext.Provider
      value={{
        token,
        userId,
        userEmail,
        userType,
        teamId,
        teamRole,
        login,
        signup,
        logout,
        refreshAuth,
        isAuthenticated,
        loading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};


