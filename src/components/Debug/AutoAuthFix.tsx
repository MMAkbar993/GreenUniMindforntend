import React, { useEffect, useState } from 'react';
import { useAppDispatch, useAppSelector } from '@/redux/hooks';
import { selectCurrentToken, selectCurrentUser, setUser } from '@/redux/features/auth/authSlice';
import { config } from '@/config';

const AutoAuthFix: React.FC = () => {
  const dispatch = useAppDispatch();
  const currentToken = useAppSelector(selectCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const [status, setStatus] = useState<string>('Checking authentication...');
  const [isFixing, setIsFixing] = useState(false);

  useEffect(() => {
    checkAndFixAuth();
  }, []);

  const checkAndFixAuth = async () => {
    try {
      setStatus('🔍 Checking authentication status...');
      
      // Step 1: Check if we have tokens
      const accessToken = localStorage.getItem('accessToken');
      const refreshToken = localStorage.getItem('refreshToken');
      
      if (!accessToken) {
        setStatus('❌ No access token found. Please login.');
        return;
      }

      // Step 2: Check if token is expired
      let isExpired = false;
      try {
        const payload = JSON.parse(atob(accessToken.split('.')[1]));
        const now = Date.now() / 1000;
        isExpired = payload.exp < now;
        
        if (isExpired) {
          setStatus('⚠️ Access token expired. Attempting refresh...');
        } else {
          setStatus('✅ Access token is valid. Testing API...');
        }
      } catch (error) {
        setStatus('❌ Invalid token format. Please login again.');
        return;
      }

      // Step 3: Test API with current token
      if (!isExpired) {
        const apiTest = await testGetMeAPI(accessToken);
        if (apiTest.success) {
          setStatus('✅ Authentication working! API calls successful.');
          return;
        } else {
          setStatus('⚠️ API call failed. Attempting token refresh...');
          isExpired = true; // Force refresh
        }
      }

      // Step 4: Try to refresh token if expired or API failed
      if (isExpired && refreshToken) {
        setIsFixing(true);
        setStatus('🔄 Refreshing access token...');
        
        const refreshResult = await refreshAccessToken(refreshToken);
        if (refreshResult.success) {
          setStatus('✅ Token refreshed successfully! Testing API...');
          
          // Test API with new token
          const apiTest = await testGetMeAPI(refreshResult.newToken);
          if (apiTest.success) {
            setStatus('✅ Authentication fixed! Lectures should now load.');
          } else {
            setStatus('❌ API still failing after refresh. Please login again.');
          }
        } else {
          setStatus('❌ Token refresh failed. Please login again.');
        }
        setIsFixing(false);
      } else if (isExpired && !refreshToken) {
        setStatus('❌ No refresh token available. Please login again.');
      }
      
    } catch (error) {
      setStatus(`❌ Error during auth check: ${error}`);
      setIsFixing(false);
    }
  };

  const testGetMeAPI = async (token: string): Promise<{ success: boolean; error?: string }> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        console.log('✅ GetMe API successful:', data);
        return { success: true };
      } else {
        const errorData = await response.json();
        console.error('❌ GetMe API failed:', response.status, errorData);
        return { success: false, error: `${response.status}: ${errorData.message}` };
      }
    } catch (error) {
      console.error('❌ GetMe API network error:', error);
      return { success: false, error: `Network error: ${error}` };
    }
  };

  const refreshAccessToken = async (refreshToken: string): Promise<{ success: boolean; newToken?: string; error?: string }> => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      });

      if (response.ok) {
        const result = await response.json();
        
        if (result.data?.accessToken) {
          // Store new tokens
          localStorage.setItem('accessToken', result.data.accessToken);
          if (result.data.refreshToken) {
            localStorage.setItem('refreshToken', result.data.refreshToken);
          }

          // Update Redux state
          const userData = localStorage.getItem('userData');
          if (userData) {
            const user = JSON.parse(userData);
            dispatch(setUser({ user, token: result.data.accessToken }));
          }

          console.log('✅ Token refresh successful');
          return { success: true, newToken: result.data.accessToken };
        } else {
          console.error('❌ No access token in refresh response');
          return { success: false, error: 'No access token in response' };
        }
      } else {
        const errorData = await response.json();
        console.error('❌ Token refresh failed:', response.status, errorData);
        return { success: false, error: `${response.status}: ${errorData.message}` };
      }
    } catch (error) {
      console.error('❌ Token refresh network error:', error);
      return { success: false, error: `Network error: ${error}` };
    }
  };

  const getStatusColor = () => {
    if (status.includes('✅')) return '#28a745';
    if (status.includes('⚠️') || status.includes('🔄')) return '#ffc107';
    if (status.includes('❌')) return '#dc3545';
    return '#17a2b8';
  };

  return (
    <div style={{ 
      position: 'fixed', 
      top: '50%', 
      left: '50%', 
      transform: 'translate(-50%, -50%)',
      background: 'white', 
      border: '2px solid #007bff', 
      borderRadius: '8px',
      padding: '20px',
      zIndex: 10000,
      fontSize: '14px',
      maxWidth: '500px',
      textAlign: 'center',
      boxShadow: '0 4px 20px rgba(0,0,0,0.3)'
    }}>
      <h3 style={{ margin: '0 0 15px 0', color: '#007bff' }}>🔧 Auto Authentication Fix</h3>
      
      <div style={{ 
        padding: '10px', 
        background: '#f8f9fa', 
        borderRadius: '4px', 
        marginBottom: '15px',
        color: getStatusColor(),
        fontWeight: 'bold'
      }}>
        {status}
      </div>

      {isFixing && (
        <div style={{ marginBottom: '15px' }}>
          <div style={{ 
            width: '100%', 
            height: '4px', 
            background: '#e9ecef', 
            borderRadius: '2px',
            overflow: 'hidden'
          }}>
            <div style={{ 
              width: '100%', 
              height: '100%', 
              background: '#007bff',
              animation: 'loading 1.5s ease-in-out infinite'
            }} />
          </div>
        </div>
      )}

      <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
        <button 
          onClick={checkAndFixAuth}
          disabled={isFixing}
          style={{ 
            padding: '8px 16px', 
            fontSize: '12px',
            background: isFixing ? '#6c757d' : '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: isFixing ? 'not-allowed' : 'pointer'
          }}
        >
          {isFixing ? 'Fixing...' : 'Retry Check'}
        </button>
        
        <button 
          onClick={() => window.location.href = '/auth/login'}
          style={{ 
            padding: '8px 16px', 
            fontSize: '12px',
            background: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Go to Login
        </button>
      </div>

      <style>{`
        @keyframes loading {
          0% { transform: translateX(-100%); }
          50% { transform: translateX(0%); }
          100% { transform: translateX(100%); }
        }
      `}</style>
    </div>
  );
};

export default AutoAuthFix;
