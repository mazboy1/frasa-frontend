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
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching user data for:', user.email);
        
        const response = await axiosFetch.get(`/api/user/${user.email}`);
        
        if (response.data?.success && response.data?.data) {
          const userData = response.data.data;
          const role = userData.role || 'user';
          
          setCurrentUser({
            ...userData,
            role: role.toLowerCase(),
            name: userData.name || user.displayName || user.email?.split('@')[0] || '',
            email: userData.email || user.email,
            photoUrl: userData.photoUrl || user.photoURL || null
          });
        } else {
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user',
            photoUrl: user.photoURL || null,
            isFromAuth: true
          });
        }
      } catch (error) {
        console.error('❌ Error fetching user:', error);
        
        if (user?.email) {
          setCurrentUser({
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user',
            photoUrl: user.photoURL || null,
            isFromAuth: true
          });
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserData();
  }, [user, axiosFetch]);

  return { currentUser, isLoading, error };
};

export default useUser;