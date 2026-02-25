import React from 'react';
import { Navigate } from 'react-router-dom';

// TERIMA USER DARI PROPS - JANGAN PAKAI useUser() LAGI!
const DashboardNavigate = ({ user }) => {
  console.log('🎯 DashboardNavigate Debug:');
  console.log('User dari props:', user);
  console.log('Role dari props:', user?.role);

  // KALO TIDAK ADA USER, REDIRECT KE LOGIN
  if (!user) {
    console.log('❌ Tidak ada user, redirect ke login');
    return <Navigate to="/login" replace />;
  }

  // CEK ROLE DAN REDIRECT SESUAI
  const role = user.role?.toLowerCase();
  
  console.log('📍 Redirecting berdasarkan role:', role);

  switch(role) {
    case 'admin':
      console.log('✅ Redirect ke admin dashboard');
      return <Navigate to="/dashboard/admin-home" replace />;
      
    case 'instructor':
      console.log('✅ Redirect ke instructor dashboard');
      return <Navigate to="/dashboard/instructor-cp" replace />;
      
    case 'user':
      console.log('✅ Redirect ke student dashboard');
      return <Navigate to="/dashboard/student-cp" replace />;
      
    default:
      console.warn('⚠️ Role tidak dikenal:', role, 'default ke student');
      return <Navigate to="/dashboard/student-cp" replace />;
  }
};

export default DashboardNavigate;