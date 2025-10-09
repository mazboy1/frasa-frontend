import React from 'react';
import useUser from '../hooks/useUser';
import { Navigate } from 'react-router-dom';

const DashboardNavigate = () => {
  const { currentUser, isLoading, error } = useUser();

  // ✅ COMPREHENSIVE DEBUGGING
  console.log('🎯 DashboardNavigate Debug:');
  console.log('isLoading:', isLoading);
  console.log('currentUser:', currentUser);
  console.log('userRole:', currentUser?.role);
  console.log('error:', error);
  console.log('hasValidRole:', currentUser?.role && ['admin', 'instructor', 'user'].includes(currentUser.role));
  console.log('-------------------');

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Memuat dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Mohon tunggu sebentar</p>
        </div>
      </div>
    );
  }

  // ✅ ERROR STATE
  if (error) {
    console.error('❌ Dashboard Error:', error);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center max-w-md p-6 bg-red-50 rounded-lg border border-red-200">
          <p className="text-xl font-bold text-red-600">Error Memuat Dashboard</p>
          <p className="mt-2 text-red-500">Terjadi kesalahan saat memuat data user.</p>
          <p className="mt-1 text-sm text-gray-600">Silakan coba refresh halaman.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Refresh Halaman
          </button>
        </div>
      </div>
    );
  }

  // ✅ NO USER DATA
  if (!currentUser) {
    console.log('🚫 No user data, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // ✅ ROLE-BASED REDIRECTION dengan fallback
  const role = currentUser.role?.toLowerCase() || 'user';
  
  console.log('📍 DashboardNavigate: Final Decision - Role:', role);

  switch(role) {
    case 'admin':
      console.log('➡️ Redirecting to: Admin Dashboard');
      return <Navigate to="/dashboard/admin-home" replace />;
    case 'instructor':
      console.log('➡️ Redirecting to: Instructor Dashboard');
      return <Navigate to="/dashboard/instructor-cp" replace />;
    case 'user':
      console.log('➡️ Redirecting to: Student Dashboard');
      return <Navigate to="/dashboard/student-cp" replace />;
    default:
      console.warn('⚠️ Unknown role, defaulting to student. Role was:', role);
      return <Navigate to="/dashboard/student-cp" replace />;
  }
};

export default DashboardNavigate;