// components/DashboardNavigate.jsx - FINAL FIXED VERSION
import React from 'react';
import useUser from '../hooks/useUser';
import { Navigate } from 'react-router-dom';
import useAuth from '../hooks/useAuth';

const DashboardNavigate = () => {
  const { currentUser, isLoading, error } = useUser();
  const { user: authUser } = useAuth();

  console.log('🎯 ===== DASHBOARD NAVIGATE DEBUG =====');
  console.log('🔐 Auth User:', authUser);
  console.log('👤 Current User from DB:', currentUser);
  console.log('🎭 User Role:', currentUser?.role);
  console.log('⏳ Loading:', isLoading);
  console.log('❌ Error:', error);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
          <p className="text-sm text-gray-400 mt-2">Mengambil data user...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('❌ Dashboard Navigate Error:', error);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="bg-red-50 p-8 rounded-lg shadow-lg max-w-md text-center border border-red-200">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-xl font-bold text-red-700 mb-2">Gagal Memuat Dashboard</h2>
          <p className="text-red-600 mb-4">{error}</p>
          <div className="space-y-3">
            <button 
              onClick={() => window.location.reload()} 
              className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors w-full"
            >
              🔄 Coba Lagi
            </button>
            <button 
              onClick={() => {
                localStorage.removeItem('token');
                window.location.href = '/login';
              }} 
              className="bg-gray-500 text-white px-6 py-2 rounded-lg hover:bg-gray-600 transition-colors w-full"
            >
              🔑 Login Ulang
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No user data
  if (!currentUser) {
    console.log('⚠️ No current user, redirecting to login');
    return <Navigate to="/login" replace state={{ from: '/dashboard' }} />;
  }

  // Role-based redirection - NORMALISASI ROLE
  const role = currentUser.role?.toLowerCase().trim();
  
  console.log('📍 Redirecting to dashboard for role:', role);

  // Mapping role ke path yang benar
  const roleToPath = {
    'admin': '/dashboard/admin-home',
    'instructor': '/dashboard/instructor-cp',
    'user': '/dashboard/student-cp',
    'student': '/dashboard/student-cp'
  };

  const targetPath = roleToPath[role] || '/dashboard/student-cp';

  if (!roleToPath[role]) {
    console.warn(`⚠️ Unknown role "${role}", defaulting to student dashboard`);
  }

  console.log('✅ Redirecting to:', targetPath);
  return <Navigate to={targetPath} replace />;
};

export default DashboardNavigate;