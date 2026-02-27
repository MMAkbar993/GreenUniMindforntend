import React from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { logout } from '@/redux/features/auth/authSlice';

const ClearAuthTest: React.FC = () => {
  const dispatch = useAppDispatch();

  const clearAuth = () => {
    // Clear localStorage
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Clear Redux state
    dispatch(logout());
    
    console.log('🧹 Auth cleared - localStorage and Redux state reset');
    alert('Auth cleared! Please refresh and log in again.');
  };

  const checkTokens = () => {
    const accessToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    console.log('🔍 Token Check:', {
      accessToken: accessToken ? accessToken.substring(0, 50) + '...' : 'None',
      refreshToken: refreshToken ? refreshToken.substring(0, 50) + '...' : 'None',
      accessTokenLength: accessToken?.length,
      refreshTokenLength: refreshToken?.length
    });
    
    if (accessToken) {
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const now = Date.now() / 1000;
        console.log('🔍 Token Details:', {
          email: payload.email,
          role: payload.role,
          exp: payload.exp,
          iat: payload.iat,
          isExpired: payload.exp < now,
          expiresIn: Math.max(0, payload.exp - now),
          expiresAt: new Date(payload.exp * 1000).toISOString()
        });
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      right: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px'
    }}>
      <h4>🧹 Auth Debug Tools</h4>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button 
          onClick={checkTokens}
          style={{ 
            padding: '5px 10px', 
            fontSize: '10px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Check Tokens
        </button>
        <button 
          onClick={clearAuth}
          style={{ 
            padding: '5px 10px', 
            fontSize: '10px',
            background: '#dc3545',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Clear Auth & Logout
        </button>
      </div>
    </div>
  );
};

export default ClearAuthTest;
