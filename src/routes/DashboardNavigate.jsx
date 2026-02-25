// components/DashboardNavigate.jsx - FIXED
import React from 'react';
import useUser from '../hooks/useUser';
import { Navigate } from 'react-router-dom';

const DashboardNavigate = () => {
  const { currentUser, isLoading, error } = useUser();

  console.log('🎯 DashboardNavigate Debug:');
  console.log('User:', currentUser);
  console.log('Role from API:', currentUser?.role);
  console.log('Role type:', typeof currentUser?.role);
  console.log('Loading:', isLoading);
  console.log('Error:', error);

  // Loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-lg text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    console.error('Error:', error);
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-red-500 text-center">
          <p>Error loading dashboard</p>
          <button 
            onClick={() => window.location.reload()} 
            className="mt-4 bg-blue-500 text-white px-4 py-2 rounded"
          >
            Retry
          </button>
        </div>
      </div>
    );
  }

  // No user data
  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  // ✅ FIXED: Handle multiple possible role values
  const role = currentUser.role?.toLowerCase() || '';
  
  console.log('📍 Normalized role:', role);
  console.log('📍 Redirecting to based on role');

  // Check for admin
  if (role === 'admin') {
    console.log('➡️ Redirecting to admin dashboard');
    return <Navigate to="/dashboard/admin-home" replace />;
  }
  
  // Check for instructor
  if (role === 'instructor') {
    console.log('➡️ Redirecting to instructor dashboard');
    return <Navigate to="/dashboard/instructor-cp" replace />;
  }
  
  // Check for student (handle both 'user' and 'student')
  if (role === 'user' || role === 'student') {
    console.log('➡️ Redirecting to student dashboard');
    return <Navigate to="/dashboard/student-cp" replace />;
  }

  // Default fallback
  console.warn('Unknown role:', role, 'defaulting to student');
  return <Navigate to="/dashboard/student-cp" replace />;
};

export default DashboardNavigate;