import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useUser from '../../../hooks/useUser';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import WelcomeImg from "../../../assets/dashboard/urban-welcome.svg";
import AdminStats from './AdminStats';
// ✅ FIX: Replace FaPendingActions with MdPendingActions
import { FaUsers, FaBook, FaCheckCircle, FaCog } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';

const AdminHome = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token check in AdminHome:', token ? `✅ (${token.length} chars)` : '❌ MISSING');
    
    axiosSecure.get('/users')
      .then(res => {
        console.log('✅ Users fetched:', res.data)
        setUsers(res.data?.data || [])
      })
      .catch(err => {
        console.error('❌ Error fetching users:', err.response?.status, err.response?.data)
        setError(err.response?.data?.message || 'Gagal memuat user list')
      })
      .finally(() => setLoading(false))
  }, [axiosSecure])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-l-4 border-secondary">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/3">
              <img 
                onContextMenu={e => e.preventDefault()} 
                src={WelcomeImg} 
                alt="Welcome" 
                className='h-[180px] mx-auto' 
              />
            </div>
            <div className="md:w-2/3">
              <h1 className='text-4xl font-bold mb-2'>
                Selamat datang, <span className='text-secondary'>{currentUser?.name}!</span>
              </h1>
              <p className='text-gray-600 text-lg mb-4'>
                Kelola platform Frasa Academy dan pantau semua aktivitas dengan dashboard lengkap ini.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link 
                  to="/dashboard/manage-users"
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all"
                >
                  👥 Kelola Pengguna
                </Link>
                <Link 
                  to="/dashboard/manage-class"
                  className="px-6 py-2 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all"
                >
                  📚 Kelola Kelas
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Admin Statistics */}
        {error && (
          <div className="mb-8 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
            ⚠️ {error}
          </div>
        )}
        
        <AdminStats users={users} />

        {/* ✅ Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mt-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Action 1: Manage Users */}
            <Link 
              to="/dashboard/manage-users"
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaUsers className="text-2xl text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Kelola Pengguna</h3>
              <p className="text-sm text-gray-600">Atur role & data pengguna</p>
            </Link>

            {/* Action 2: Manage Classes */}
            <Link 
              to="/dashboard/manage-class"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaBook className="text-2xl text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Kelola Kelas</h3>
              <p className="text-sm text-gray-600">Setujui/tolak kelas</p>
            </Link>

            {/* Action 3: Admin Settings */}
            <Link 
              to="/dashboard/admin-status"
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaCog className="text-2xl text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Statistik</h3>
              <p className="text-sm text-gray-600">Lihat laporan detail</p>
            </Link>

            {/* Action 4: User Applications */}
            <Link 
              to="/dashboard/manage-users"
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                {/* ✅ FIX: Use MdPendingActions instead of FaPendingActions */}
                <MdPendingActions className="text-2xl text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Aplikasi</h3>
              <p className="text-sm text-gray-600">Review aplikasi instructor</p>
            </Link>
          </div>
        </div>

        {/* ✅ Tips for Admins */}
        <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg shadow-md p-8 mt-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Tips Administrasi</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold mb-2">Persetujuan Kelas</h3>
              <p className="text-gray-100 text-sm">
                Tinjau kelas dengan cermat sebelum menyetujui untuk memastikan kualitas konten pembelajaran.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Manajemen Pengguna</h3>
              <p className="text-gray-100 text-sm">
                Pantau pengguna yang mencurigakan dan pastikan platform tetap aman untuk semua.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Laporan & Analytics</h3>
              <p className="text-gray-100 text-sm">
                Gunakan dashboard statistik untuk menganalisis pertumbuhan platform dan aktivitas pengguna.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default AdminHome;