import React from 'react';
import useUser from '../hooks/useUser';
import { Navigate } from 'react-router-dom';

const DashboardNavigate = () => {
  const { currentUser, isLoading, error } = useUser();

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error || !currentUser) {
    return <Navigate to="/login" replace />;
  }

  const role = currentUser.role?.toLowerCase();
  
  const roleToPath = {
    'admin': '/dashboard/admin-home',
    'instructor': '/dashboard/instructor-cp',
    'user': '/dashboard/student-cp'
  };

  return <Navigate to={roleToPath[role] || '/dashboard/student-cp'} replace />;
};

export default DashboardNavigate;