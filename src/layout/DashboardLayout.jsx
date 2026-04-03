import { Outlet } from "react-router-dom";
import useAuth from "../hooks/useAuth";
import Sidebar from "../components/Sidebar";
import { useNavigate } from "react-router-dom";
import { useEffect } from "react";

const DashboardLayout = () => {
  const { user, loading, authInitialized } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ FIX: Wait untuk authInitialized sebelum redirect
    if (authInitialized && !loading && !user) {
      console.warn('⚠️ User tidak authenticated, redirect ke login');
      navigate('/login');
    }
  }, [user, loading, authInitialized, navigate]);

  // ✅ FIX: Show loading hanya selama auth belum initialized
  if (!authInitialized || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Authenticating...</p>
        </div>
      </div>
    );
  }

  // ✅ FIX: Only show dashboard jika user sudah authenticated
  if (!user) {
    return null; // Di-handle oleh useEffect redirect
  }

  return (
    <div className="flex gap-4 bg-gray-100 min-h-screen p-4">
      <Sidebar/>
      <div className="flex-1">
        <Outlet/>
      </div>
    </div>
  );
};

export default DashboardLayout;