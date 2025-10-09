// components/DashboardNavigate.jsx - FINAL FIXED VERSION
import React from 'react';
import useUser from '../hooks/useUser';
import { Navigate } from 'react-router-dom';

const DashboardNavigate = () => {
  const { currentUser, isLoading, error } = useUser();

  // ✅ COMPREHENSIVE DEBUG
  console.log('🎯 DashboardNavigate Debug:');
  console.log('isLoading:', isLoading);
  console.log('currentUser:', currentUser);
  console.log('error:', error);
  console.log('Role:', currentUser?.role);
  console.log('Token:', localStorage.getItem('token'));
  console.log('-------------------');

  // ✅ LOADING STATE
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading user data...</p>
          <p className="text-sm text-gray-400 mt-2">Please wait while we load your dashboard</p>
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
          <p className="text-xl font-bold text-red-600">Error Loading Dashboard</p>
          <p className="mt-2 text-red-500">Unable to load your user information.</p>
          <p className="mt-1 text-sm text-gray-600">Please check your connection and try again.</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // ✅ NO USER DATA
  if (!currentUser) {
    console.log('🚫 No user data available, redirecting to login');
    return <Navigate to="/login" replace />;
  }

  // ✅ ROLE-BASED REDIRECTION
  const role = currentUser.role?.toLowerCase();
  
  console.log('📍 Final Role Decision:', role);

  switch(role) {
    case 'admin':
      console.log('➡️ Redirecting to Admin Dashboard');
      return <Navigate to="/dashboard/admin-home" replace />;
    case 'instructor':
      console.log('➡️ Redirecting to Instructor Dashboard');
      return <Navigate to="/dashboard/instructor-cp" replace />;
    case 'user':
      console.log('➡️ Redirecting to Student Dashboard');
      return <Navigate to="/dashboard/student-cp" replace />;
    default:
      console.warn('⚠️ Unknown role:', role, 'defaulting to student');
      return <Navigate to="/dashboard/student-cp" replace />;
  }
};

export default DashboardNavigate;