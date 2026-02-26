// /src/hooks/useUser.jsx - FINAL FIXED VERSION
import { useEffect, useState } from 'react';
import useAuth from './useAuth';
import useAxiosFetch from './useAxiosFetch';

const useUser = () => {
  const { user } = useAuth();
  const axiosFetch = useAxiosFetch();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user?.email) {
          console.log('⏳ useUser: No user email available');
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        console.log('🔄 useUser: Fetching user data for:', user.email);
        
        // Ambil data user dari database
        const response = await axiosFetch.get(`/api/user/${user.email}`);
        
        console.log('✅ useUser: API Response:', response.data);

        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          
          // Pastikan role ada, jika tidak default ke 'user'
          const role = userData.role || 'user';
          
          console.log('🎯 useUser: User role from DB:', role);
          
          setCurrentUser({
            ...userData,
            role: role.toLowerCase(), // Normalisasi ke huruf kecil
            name: userData.name || user.displayName || user.email?.split('@')[0] || '',
            email: userData.email || user.email,
            photoUrl: userData.photoUrl || user.photoURL || null
          });
        } else {
          console.warn('⚠️ useUser: No user data found, using auth data');
          
          // Fallback ke data auth jika tidak ada di database
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user', // Default role
            photoUrl: user.photoURL || null,
            isFromAuth: true
          });
        }
      } catch (error) {
        console.error('❌ useUser: Error fetching user:', error);
        setError(error.message || 'Failed to load user data');
        
        // Fallback ke data auth
        if (user?.email) {
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user',
            photoUrl: user.photoURL || null,
            isFromAuth: true,
            isError: true
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, axiosFetch]);

  // Debug log setiap kali currentUser berubah
  useEffect(() => {
    if (currentUser) {
      console.log('📊 useUser: Current user updated:', {
        email: currentUser.email,
        role: currentUser.role,
        name: currentUser.name,
        fromAuth: currentUser.isFromAuth
      });
    }
  }, [currentUser]);

  const refreshUser = async () => {
    setIsLoading(true);
    try {
      if (!user?.email) return;
      
      const response = await axiosFetch.get(`/api/user/${user.email}`);
      if (response.data?.success && response.data?.data) {
        setCurrentUser(response.data.data);
      }
    } catch (error) {
      console.error('❌ useUser: Error refreshing user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    currentUser, 
    isLoading, 
    error,
    refreshUser
  };
};

export default useUser;