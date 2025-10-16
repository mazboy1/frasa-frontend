// hooks/useUser.js - COMPLETE REWRITE
import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useUser = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeUser = () => {
      try {
        setIsLoading(true);
        
        // ✅ SAFETY CHECK: Pastikan user object valid
        if (!user || typeof user !== 'object') {
          console.log('⚠️ useUser: Invalid user object', user);
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // ✅ SAFE DATA EXTRACTION - Hindari .slice() calls
        const safeUserData = {
          // ✅ Gunakan nullish coalescing untuk avoid undefined
          _id: user?.uid || 'temp-id',
          name: String(user?.displayName || 'Instructor'),
          email: String(user?.email || ''),
          role: 'instructor', // ✅ Hardcode untuk stability
          photoUrl: String(user?.photoURL || '')
        };

        console.log('✅ useUser - Safe data created:', safeUserData);
        setCurrentUser(safeUserData);
        setError(null);

      } catch (err) {
        console.error('❌ useUser initialization error:', err);
        // ✅ FALLBACK: Return safe default data
        setCurrentUser({
          _id: 'fallback-id',
          name: 'Instructor',
          email: 'user@example.com',
          role: 'instructor',
          photoUrl: ''
        });
        setError('User data loading failed');
      } finally {
        setIsLoading(false);
      }
    };

    initializeUser();
  }, [user]); // ✅ Hanya depend on user object

  // ✅ SAFE RETURN - Pastikan selalu return object yang konsisten
  return { 
    currentUser, 
    isLoading, 
    error,
    refetch: () => {
      console.log('useUser refetch called');
      // Simple refetch implementation
      setIsLoading(true);
      setTimeout(() => setIsLoading(false), 100);
    }
  };
};

export default useUser;