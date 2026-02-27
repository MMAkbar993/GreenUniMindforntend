import React, { useEffect, useState } from 'react';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentToken, selectCurrentUser } from '@/redux/features/auth/authSlice';

const AuthStatusTest: React.FC = () => {
  const currentToken = useAppSelector(selectCurrentToken);
  const currentUser = useAppSelector(selectCurrentUser);
  const [tokenInfo, setTokenInfo] = useState<any>(null);

  useEffect(() => {
    const localStorageToken = localStorage.getItem('accessToken');
    const refreshToken = localStorage.getItem('refreshToken');
    
    let decodedToken = null;
    if (localStorageToken) {
      try {
        // Decode JWT token to check expiration
        const tokenParts = localStorageToken.split('.');
        if (tokenParts.length === 3) {
          const payload = JSON.parse(atob(tokenParts[1]));
          const now = Date.now() / 1000;
          decodedToken = {
            ...payload,
            isExpired: payload.exp < now,
            expiresIn: Math.max(0, payload.exp - now),
            expiresAt: new Date(payload.exp * 1000).toISOString()
          };
        }
      } catch (error) {
        console.error('Error decoding token:', error);
      }
    }

    setTokenInfo({
      reduxToken: currentToken,
      localStorageToken,
      refreshToken,
      decodedToken,
      user: currentUser
    });

    console.log('🔐 Auth Status Debug:', {
      reduxToken: currentToken ? 'Present' : 'Missing',
      localStorageToken: localStorageToken ? 'Present' : 'Missing',
      refreshToken: refreshToken ? 'Present' : 'Missing',
      decodedToken,
      user: currentUser
    });
  }, [currentToken, currentUser]);

  return (
    <div style={{ 
      position: 'fixed', 
      top: '10px', 
      left: '10px', 
      background: 'white', 
      border: '1px solid #ccc', 
      padding: '10px',
      zIndex: 9999,
      fontSize: '12px',
      maxWidth: '400px',
      maxHeight: '500px',
      overflow: 'auto'
    }}>
      <h4>🔐 Auth Status Test</h4>
      
      <div style={{ marginBottom: '10px' }}>
        <p><strong>Redux Token:</strong> {currentToken ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>LocalStorage Token:</strong> {localStorage.getItem('accessToken') ? '✅ Present' : '❌ Missing'}</p>
        <p><strong>Refresh Token:</strong> {localStorage.getItem('refreshToken') ? '✅ Present' : '❌ Missing'}</p>
      </div>

      {tokenInfo?.decodedToken && (
        <div style={{ marginBottom: '10px', fontSize: '10px' }}>
          <p><strong>Token Status:</strong></p>
          <p>• Expired: {tokenInfo.decodedToken.isExpired ? '❌ Yes' : '✅ No'}</p>
          <p>• Expires At: {tokenInfo.decodedToken.expiresAt}</p>
          <p>• Expires In: {Math.floor(tokenInfo.decodedToken.expiresIn)} seconds</p>
          <p>• Email: {tokenInfo.decodedToken.email}</p>
          <p>• Role: {tokenInfo.decodedToken.role}</p>
        </div>
      )}

      {currentUser && (
        <div style={{ marginBottom: '10px', fontSize: '10px' }}>
          <p><strong>Current User:</strong></p>
          <p>• Email: {currentUser.email}</p>
          <p>• Role: {currentUser.role || currentUser.user?.role}</p>
          <p>• Name: {currentUser.name?.firstName} {currentUser.name?.lastName}</p>
        </div>
      )}

      <div style={{ display: 'flex', flexDirection: 'column', gap: '5px' }}>
        <button
          onClick={() => {
            console.log('Full auth state:', tokenInfo);
            alert('Check console for full auth state');
          }}
          style={{
            padding: '5px 10px',
            fontSize: '10px',
            background: '#007bff',
            color: 'white',
            border: 'none',
            borderRadius: '3px',
            cursor: 'pointer'
          }}
        >
          Log Full State
        </button>

        <button
          onClick={() => {
            const accessToken = localStorage.getItem('accessToken');
            if (accessToken) {
              try {
                const payload = JSON.parse(atob(accessToken.split('.')[1]));
                const now = Date.now() / 1000;
                const isExpired = payload.exp < now;
                const expiresIn = Math.max(0, payload.exp - now);

                if (isExpired) {
                  alert(`❌ TOKEN EXPIRED!\n\nExpired at: ${new Date(payload.exp * 1000).toISOString()}\n\nPlease use "Clear Auth & Logout" and login again.`);
                } else {
                  alert(`✅ TOKEN VALID\n\nExpires in: ${Math.floor(expiresIn)} seconds\nExpires at: ${new Date(payload.exp * 1000).toISOString()}\nEmail: ${payload.email}\nRole: ${payload.role}`);
                }
              } catch (error) {
                alert('❌ Error decoding token - token may be malformed');
              }
            } else {
              alert('❌ No access token found in localStorage');
            }
          }}
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
          Check Token Status
        </button>
      </div>
    </div>
  );
};

export default AuthStatusTest;
