// hooks/useUser.js - FINAL FIXED VERSION
import { useQuery } from '@tanstack/react-query';
import useAxiosSecure from "./useAxiosSecure";
import useAuth from './useAuth';

const useUser = () => {
    const { user, loading } = useAuth();
    const axiosSecure = useAxiosSecure();
    
    const { 
        data: currentUser, 
        isLoading, 
        error,
        refetch 
    } = useQuery({
        queryKey: ['user', user?.email],
        queryFn: async () => {
            console.log('🔄 Fetching user data for:', user?.email);
            
            if (!user?.email) {
                throw new Error('No user email available');
            }
            
            const res = await axiosSecure.get(`/user/${user?.email}`);
            console.log('✅ User API Response:', res.data);
            return res.data;
        },
        enabled: !!user?.email && !loading, // ✅ Wait for auth to be ready
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });

    // ✅ COMPREHENSIVE DEBUG LOGS
    console.log('🔍 useUser Hook Debug:');
    console.log('Auth User:', user);
    console.log('Auth Loading:', loading);
    console.log('API User Data:', currentUser);
    console.log('Query Loading:', isLoading);
    console.log('Error:', error);
    console.log('Final Role:', currentUser?.role);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('-------------------');

    return { 
        currentUser, 
        isLoading: isLoading || loading, // ✅ Combine both loading states
        error, 
        refetch 
    };
}

export default useUser;