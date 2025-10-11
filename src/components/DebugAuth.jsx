// components/DebugAuth.jsx
import React from 'react';
import useAuth from '../hooks/useAuth';

const DebugAuth = () => {
  const { user, loading } = useAuth();

  const checkAuth = () => {
    console.log('🔍 Debug Auth Info:');
    console.log('User:', user);
    console.log('Loading:', loading);
    console.log('Token:', localStorage.getItem('token'));
    console.log('Token Length:', localStorage.getItem('token')?.length);
  };

  React.useEffect(() => {
    checkAuth();
  }, [user, loading]);

  return (
    <div style={{ position: 'fixed', top: 10, right: 10, background: 'red', color: 'white', padding: '10px', zIndex: 9999 }}>
      <button onClick={checkAuth}>Check Auth</button>
      <div>User: {user ? 'Yes' : 'No'}</div>
      <div>Token: {localStorage.getItem('token') ? 'Yes' : 'No'}</div>
    </div>
  );
};

export default DebugAuth;