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
            console.log('🔄 useUser: Fetching data for:', user?.email);
            
            if (!user?.email) {
                throw new Error('Email user tidak tersedia');
            }
            
            try {
                const res = await axiosSecure.get(`/user/${user?.email}`);
                console.log('✅ useUser: API Response:', res.data);
                
                let userData = res.data;
                
                // 🚨 EMERGENCY FIX: Jika role tidak ada
                if (!userData.role || !['admin', 'instructor', 'user'].includes(userData.role)) {
                    console.warn('⚠️ useUser: Role invalid/missing:', userData.role, 'Setting default: user');
                    
                    userData = {
                        ...userData,
                        role: "user" // Default role
                    };
                    
                    // Try to update backend
                    try {
                        await axiosSecure.patch(`/user/update-role/${user.email}`, {
                            role: "user"
                        });
                        console.log('✅ useUser: Backend role updated successfully');
                    } catch (updateError) {
                        console.error('❌ useUser: Failed to update backend role:', updateError);
                        // Continue dengan data lokal yang sudah difix
                    }
                }
                
                return userData;
                
            } catch (apiError) {
                console.error('❌ useUser: API Error:', apiError);
                
                // Fallback data jika API error
                const fallbackUser = {
                    name: user?.displayName || "User",
                    email: user?.email,
                    role: "user", // Guaranteed role
                    _id: user?.uid,
                    isFallback: true
                };
                
                console.log('🔄 useUser: Using fallback data:', fallbackUser);
                return fallbackUser;
            }
        },
        enabled: !!user?.email && !loading,
        retry: 2,
        staleTime: 5 * 60 * 1000,
    });

    // ✅ FINAL DATA dengan guaranteed role
    const finalUser = currentUser || {
        name: user?.displayName || "User",
        email: user?.email,
        role: "user", // Default fallback
        _id: user?.uid,
        isFallback: true
    };

    // Pastikan role selalu valid
    if (!['admin', 'instructor', 'user'].includes(finalUser.role)) {
        finalUser.role = "user";
    }

    console.log('🎯 useUser: Final Output:', {
        original: currentUser,
        final: finalUser,
        role: finalUser.role,
        loading: isLoading || loading,
        error: error
    });

    return { 
        currentUser: finalUser, 
        isLoading: isLoading || loading,
        error, 
        refetch 
    };
}; // ✅ CLOSING BRACKET YANG DIBUTUHKAN

export default useUser;