import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';

const InstructorCP = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchStats = async () => {
      try {
        console.log('📊 Fetching instructor stats for:', currentUser.email);
        
        // Get my-classes
        const myClassesRes = await axiosSecure.get('/instructor/my-classes', {
          params: { email: currentUser.email }
        });
        
        // Get approved-classes
        const approvedRes = await axiosSecure.get('/instructor/approved-classes', {
          params: { email: currentUser.email }
        });
        
        // Get pending-classes
        const pendingRes = await axiosSecure.get('/instructor/pending-classes', {
          params: { email: currentUser.email }
        });
        
        // Get rejected-classes
        const rejectedRes = await axiosSecure.get('/instructor/rejected-classes', {
          params: { email: currentUser.email }
        });

        const total = myClassesRes.data?.data?.total || 0;
        const approved = approvedRes.data?.data?.total || 0;
        const pending = pendingRes.data?.data?.total || 0;
        const rejected = rejectedRes.data?.data?.total || 0;

        console.log('✅ Stats fetched:', { total, approved, pending, rejected });

        setStats({ total, approved, pending, rejected });
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        setIsLoading(false);
      }
    };

    fetchStats();
  }, [currentUser?.email, axiosSecure]);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Instruktur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link 
          to="/dashboard/add-class" 
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">➕ Tambah Kelas</h3>
          <p>Buat kelas baru</p>
        </Link>
        
        <Link 
          to="/dashboard/my-classes" 
          className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">📚 Kelas Saya</h3>
          <p>Lihat semua kelas</p>
        </Link>
        
        <Link 
          to="/dashboard/my-pending" 
          className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">⏳ Kelas Pending</h3>
          <p>Kelas menunggu persetujuan</p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Statistik Cepat</h2>
        
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-blue-600">{stats.total}</div>
              <div className="text-gray-600">Total Kelas</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-green-600">{stats.approved}</div>
              <div className="text-gray-600">Disetujui</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-orange-600">{stats.pending}</div>
              <div className="text-gray-600">Pending</div>
            </div>
            <div className="text-center p-4 bg-white rounded-lg shadow">
              <div className="text-2xl font-bold text-red-600">{stats.rejected}</div>
              <div className="text-gray-600">Ditolak</div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCP;