// /src/hooks/useUser.jsx
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
        
        // URL endpoint - pastikan menggunakan /api/user/:email
        const response = await axiosFetch.get(`/api/user/${user.email}`);
        
        console.log('✅ useUser: API Response:', response.data);

        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          const role = userData.role || 'user';
          
          console.log('🎯 useUser: User role from DB:', role);
          
          setCurrentUser({
            ...userData,
            role: role.toLowerCase(),
            name: userData.name || user.displayName || user.email?.split('@')[0] || '',
            email: userData.email || user.email,
            photoUrl: userData.photoUrl || user.photoURL || null
          });
        } else {
          console.warn('⚠️ useUser: No user data found, using auth data');
          
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user',
            photoUrl: user.photoURL || null,
            isFromAuth: true
          });
        }
      } catch (error) {
        console.error('❌ useUser: Error fetching user:', error);
        
        // Cek status error
        if (error.response?.status === 404) {
          setError('Endpoint user tidak ditemukan. Periksa konfigurasi API.');
        } else {
          setError(error.message || 'Failed to load user data');
        }
        
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

  return { 
    currentUser, 
    isLoading, 
    error
  };
};

export default useUser;