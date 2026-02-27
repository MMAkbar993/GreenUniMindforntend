import React, { useState } from 'react';
import { useAppDispatch } from '@/redux/hooks';
import { logout, setUser } from '@/redux/features/auth/authSlice';
import { config } from '@/config';

const ForceReauth: React.FC = () => {
  const dispatch = useAppDispatch();
  const [isLoading, setIsLoading] = useState(false);

  const testGetMeApi = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('❌ No token found');
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/users/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ GetMe API successful!\n\nStatus: ${response.status}\nUser: ${data.data?.email || 'Unknown'}\nRole: ${data.data?.role || data.data?.user?.role || 'Unknown'}`);
        console.log('GetMe Response:', data);
      } else {
        alert(`❌ GetMe API failed!\n\nStatus: ${response.status}\nError: ${JSON.stringify(data, null, 2)}`);
        console.error('GetMe Error:', data);
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`);
      console.error('Network Error:', error);
    }
  };

  const testLecturesApi = async () => {
    const token = localStorage.getItem('accessToken');
    if (!token) {
      alert('❌ No token found');
      return;
    }

    try {
      const response = await fetch(`${config.apiBaseUrl}/lectures/685d022267247c70d81cbe33/get-lectures`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });

      const data = await response.json();

      if (response.ok) {
        alert(`✅ Lectures API successful!\n\nStatus: ${response.status}\nLectures: ${data.data?.length || 0} found`);
        console.log('Lectures Response:', data);
      } else {
        alert(`❌ Lectures API failed!\n\nStatus: ${response.status}\nError: ${JSON.stringify(data, null, 2)}`);
        console.error('Lectures Error:', data);
      }
    } catch (error) {
      alert(`❌ Network error: ${error}`);
      console.error('Network Error:', error);
    }
  };

  const forceTokenRefresh = async () => {
    setIsLoading(true);
    try {
      const refreshToken = localStorage.getItem('refreshToken');
      if (!refreshToken) {
        alert('❌ No refresh token found. Please login again.');
        return;
      }

      const response = await fetch(`${config.apiBaseUrl}/auth/refresh-token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${refreshToken}`
        },
        credentials: 'include',
        body: JSON.stringify({ refreshToken })
      });

      const result = await response.json();

      if (response.ok && result.data) {
        // Store new tokens
        if (result.data.accessToken) {
          localStorage.setItem('accessToken', result.data.accessToken);
        }
        if (result.data.refreshToken) {
          localStorage.setItem('refreshToken', result.data.refreshToken);
        }

        // Update Redux state with existing user data
        const currentUser = JSON.parse(localStorage.getItem('userData') || '{}');
        dispatch(setUser({ user: currentUser, token: result.data.accessToken }));

        alert('✅ Token refresh successful! Try the API test now.');
      } else {
        alert(`❌ Token refresh failed: ${result.message || 'Unknown error'}\n\nPlease login again.`);
      }
    } catch (error) {
      alert(`❌ Token refresh error: ${error}\n\nPlease login again.`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearAndRedirect = () => {
    // Clear all auth data
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userData');
    
    // Clear Redux state
    dispatch(logout());
    
    // Redirect to login
    window.location.href = '/auth/login';
  };

  return (
    <div style={{ 
      position: 'fixed', 
      bottom: '10px', 
      left: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '300px'
    }}>
      <h4>🔧 Force Re-auth Tools</h4>
      
      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={testGetMeApi}
          style={{
            padding: '5px 10px',
            fontSize: '10px',
            background: '#17a2b8',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test GetMe API
        </button>

        <button
          onClick={testLecturesApi}
          style={{
            padding: '5px 10px',
            fontSize: '10px',
            background: '#6f42c1',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Test Lectures API
        </button>
        
        <button
          onClick={forceTokenRefresh}
          disabled={isLoading}
          style={{
            padding: '5px 10px',
            fontSize: '10px',
            background: isLoading ? '#6c757d' : '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: isLoading ? 'not-allowed' : 'pointer'
          }}
        >
          {isLoading ? 'Refreshing...' : 'Force Token Refresh'}
        </button>
        
        <button 
          onClick={clearAndRedirect}
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
          Clear Auth & Go to Login
        </button>
      </div>
      
      <div style={{ marginTop: '10px', fontSize: '10px', color: '#666' }}>
        <p><strong>Steps:</strong></p>
        <p>1. Check token status first</p>
        <p>2. Try token refresh if expired</p>
        <p>3. Clear auth if refresh fails</p>
      </div>
    </div>
  );
};

export default ForceReauth;
