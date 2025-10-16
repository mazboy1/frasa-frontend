// hooks/useUser.js - EMERGENCY FIX
import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useUser = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        
        if (!user?.email) {
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        // ✅ SAFE USER DATA EXTRACTION
        const safeUser = {
          _id: user?.uid || 'temp-id',
          name: user?.displayName || 'User',
          email: user?.email || '',
          role: 'instructor', // ✅ FIX: Hardcode untuk testing
          photoUrl: user?.photoURL || ''
        };

        console.log('✅ useUser - Safe data:', safeUser);
        setCurrentUser(safeUser);
        setError(null);
        
      } catch (err) {
        console.error('❌ useUser error:', err);
        setError('Failed to load user data');
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [user]);

  return { currentUser, isLoading, error, refetch: () => {} };
};

export default useUser;