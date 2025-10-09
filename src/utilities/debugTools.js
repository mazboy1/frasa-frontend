// Utilities untuk debugging user role

export const debugUserRole = async (axiosSecure, email) => {
  try {
    console.log('🔧 === DEBUG TOOL ===');
    
    // Test endpoint debug
    const debugResponse = await axiosSecure.get(`/debug/user/${email}`);
    console.log('🔍 Debug Endpoint Response:', debugResponse.data);
    
    // Test current user data
    const userResponse = await axiosSecure.get(`/user/${email}`);
    console.log('👤 User Endpoint Response:', userResponse.data);
    
    // Check localStorage
    console.log('💾 LocalStorage Token:', localStorage.getItem('token') ? 'EXISTS' : 'MISSING');
    
    return {
      debug: debugResponse.data,
      user: userResponse.data,
      localStorage: {
        token: localStorage.getItem('token')
      }
    };
  } catch (error) {
    console.error('❌ Debug Tool Error:', error);
    return { error: error.message };
  }
};

export const emergencyFixRole = async (axiosSecure, email, role = 'user') => {
  try {
    console.log('🚨 EMERGENCY FIX: Updating role to', role);
    
    const response = await axiosSecure.patch(`/emergency/update-role/${email}`, {
      role: role
    });
    
    console.log('✅ Emergency Fix Result:', response.data);
    return response.data;
  } catch (error) {
    console.error('❌ Emergency Fix Failed:', error);
    return { error: error.message };
  }
};