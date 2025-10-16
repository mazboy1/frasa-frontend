// src/hooks/useUser.js - SIMPLE FIXED VERSION
import { useState, useEffect } from 'react';
import useAuth from './useAuth';

const useUser = () => {
  const { user } = useAuth();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadUser = async () => {
      try {
        setIsLoading(true);
        
        if (!user) {
          setCurrentUser(null);
          return;
        }

        // Simple user data extraction
        const userData = {
          _id: user.uid,
          name: user.displayName || 'User',
          email: user.email,
          role: 'user', // Default role
          photoUrl: user.photoURL || ''
        };

        setCurrentUser(userData);
        
      } catch (error) {
        console.error('Error in useUser:', error);
        setCurrentUser(null);
      } finally {
        setIsLoading(false);
      }
    };

    loadUser();
  }, [user]);

  return { 
    currentUser, 
    isLoading, 
    error: null, 
    refetch: () => console.log('refetch') 
  };
};

export default useUser;