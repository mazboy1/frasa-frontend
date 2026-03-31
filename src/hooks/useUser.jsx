import { useEffect, useState, useRef } from 'react';
import useAuth from './useAuth';
import useAxiosFetch from './useAxiosFetch';

const useUser = () => {
  const { user } = useAuth();
  const axiosFetch = useAxiosFetch();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // ✅ Track if component is mounted dan last email fetched
  const isMounted = useRef(true);
  const lastEmailFetched = useRef(null);

  useEffect(() => {
    isMounted.current = true;
    
    return () => {
      isMounted.current = false;
    };
  }, []);

  useEffect(() => {
    const fetchUserData = async () => {
      setIsLoading(true);
      setError(null);
      
      try {
        if (!user?.email) {
          setCurrentUser(null);
          setIsLoading(false);
          lastEmailFetched.current = null;
          return;
        }

        // ✅ CEGAH FETCH BERULANG UNTUK EMAIL YANG SAMA
        if (lastEmailFetched.current === user.email) {
          console.log('⏭️ Skip fetch - Already fetched for:', user.email);
          setIsLoading(false);
          return;
        }

        console.log('🔄 Fetching user data for:', user.email);
        lastEmailFetched.current = user.email;
        
        const response = await axiosFetch.get(`/user/${user.email}`);
        
        if (!isMounted.current) return;

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
        console.error('❌ Error fetching user:', error.message);
        
        if (!isMounted.current) return;
        
        // ✅ FALLBACK: Gunakan data dari Firebase Auth
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
        if (isMounted.current) {
          setIsLoading(false);
        }
      }
    };

    // ✅ HANYA trigger ketika user.email berubah
    fetchUserData();
  }, [user?.email, axiosFetch]);

  return { currentUser, isLoading, error };
};

export default useUser;