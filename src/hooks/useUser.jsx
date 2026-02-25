// src/hooks/useUser.js - FIXED VERSION
import { useState, useEffect } from 'react';
import useAuth from './useAuth';
import useAxiosSecure from './useAxiosSecure';

const useUser = () => {
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchUserFromDatabase = async () => {
      try {
        setIsLoading(true);
        
        // Jika tidak ada user yang login
        if (!user?.email) {
          console.log('useUser: No user logged in');
          setCurrentUser(null);
          setIsLoading(false);
          return;
        }

        console.log('useUser: Fetching user data for:', user.email);

        // 🔥 AMBIL DATA USER DARI DATABASE
        const response = await axiosSecure.get(`/user/${user.email}`);
        
        console.log('useUser: Database response:', response.data);

        if (response.data) {
          // Data ditemukan di database
          const userData = {
            _id: response.data._id || user.uid,
            name: response.data.name || user.displayName || user.email?.split('@')[0] || 'User',
            email: response.data.email || user.email,
            role: response.data.role || 'user', // Gunakan role dari database, default 'user'
            photoUrl: response.data.photoUrl || user.photoURL || '',
            phone: response.data.phone || '',
            address: response.data.address || '',
            skills: response.data.skills || '',
            about: response.data.about || '',
            verified: response.data.verified || false,
            createdAt: response.data.createdAt || new Date()
          };
          
          console.log('✅ useUser: User role from database:', userData.role);
          setCurrentUser(userData);
          setError(null);
        } else {
          // Data tidak ditemukan - fallback
          console.log('useUser: User not found in database');
          const fallbackUser = {
            _id: user.uid,
            name: user.displayName || user.email?.split('@')[0] || 'User',
            email: user.email,
            role: 'user', // Default role
            photoUrl: user.photoURL || '',
            phone: '',
            address: '',
            skills: '',
            about: '',
            verified: false,
            createdAt: new Date()
          };
          setCurrentUser(fallbackUser);
        }
        
      } catch (error) {
        console.error('❌ useUser: Error fetching user:', error);
        
        // Jika error 404 (user tidak ditemukan)
        if (error.response?.status === 404) {
          console.log('useUser: User not found (404)');
          setCurrentUser({
            _id: user?.uid,
            name: user?.displayName || user?.email?.split('@')[0] || 'User',
            email: user?.email,
            role: 'user',
            photoUrl: user?.photoURL || '',
            phone: '',
            address: '',
            skills: '',
            about: '',
            verified: false,
            createdAt: new Date()
          });
          setError(null);
        } else {
          setError(error.message || 'Failed to fetch user data');
          setCurrentUser(null);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchUserFromDatabase();
  }, [user?.email, axiosSecure]); // Perhatikan dependency array

  // Fungsi untuk refresh data user
  const refetch = async () => {
    setIsLoading(true);
    try {
      if (user?.email) {
        const response = await axiosSecure.get(`/user/${user.email}`);
        if (response.data) {
          const userData = {
            _id: response.data._id || user.uid,
            name: response.data.name || user.displayName,
            email: response.data.email || user.email,
            role: response.data.role || 'user',
            photoUrl: response.data.photoUrl || user.photoURL,
            phone: response.data.phone || '',
            address: response.data.address || '',
            skills: response.data.skills || '',
            about: response.data.about || '',
            verified: response.data.verified || false,
            createdAt: response.data.createdAt
          };
          setCurrentUser(userData);
        }
      }
    } catch (error) {
      console.error('Error refetching user:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return { 
    currentUser, 
    isLoading, 
    error,
    refetch 
  };
};

export default useUser;