import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import Swal from 'sweetalert2';
import { HashLoader } from 'react-spinners';
import { FaSearch, FaTrash, FaUser, FaChalkboardTeacher, FaShieldAlt } from 'react-icons/fa';

// ✅ Utility function untuk convert imgBB URL
const convertImgBBUrl = (url) => {
  if (!url) return url;
  return url.replace('i.ibb.co/', 'i.ibb.co.com/');
};

const ManageUsers = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('all');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setIsLoading(true);
      console.log('📊 Fetching all users...');
      console.log('Current token:', localStorage.getItem('access-token') || 'NO TOKEN');
      
      const response = await axiosSecure.get('/users');
      
      console.log('✅ Users fetched:', response.data);
      
      setUsers(response.data.data || []);
      setError(null);
    } catch (err) {
      console.error('❌ Error fetching users:', err);
      console.error('Error response:', err.response?.data);
      console.error('Error status:', err.response?.status);
      
      if (err.response?.status === 401) {
        setError('Session expired. Please login again');
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        setError(err.response?.data?.message || err.message || 'Failed to load users');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRoleChange = async (userId, newRole) => {
    try {
      console.log(`🔄 Updating role for ${userId} to ${newRole}`);
      
      const response = await axiosSecure.patch(`/users/${userId}/role`, { role: newRole });
      
      if (response.data.success) {
        setUsers(users.map(user => 
          user._id === userId ? { ...user, role: newRole } : user
        ));
        
        Swal.fire({
          icon: 'success',
          title: 'Berhasil',
          text: 'Role pengguna telah diperbarui',
          timer: 1500
        });
      }
    } catch (err) {
      console.error('❌ Error updating role:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal mengupdate role'
      });
    }
  };

  const handleDeleteUser = async (userId, userName) => {
    const result = await Swal.fire({
      title: 'Hapus Pengguna?',
      text: `Apakah Anda yakin ingin menghapus ${userName}? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });
    
    if (!result.isConfirmed) return;
    
    try {
      console.log(`🗑️ Deleting user ${userId}`);
      
      const response = await axiosSecure.delete(`/users/${userId}`);
      
      if (response.data.success) {
        setUsers(users.filter(user => user._id !== userId));
        
        Swal.fire({
          icon: 'success',
          title: 'Dihapus',
          text: 'Pengguna telah dihapus',
          timer: 1500
        });
      }
    } catch (err) {
      console.error('❌ Error deleting user:', err);
      Swal.fire({
        icon: 'error',
        title: 'Gagal',
        text: err.response?.data?.message || 'Gagal menghapus pengguna'
      });
    }
  };

  const filteredUsers = users.filter(user => {
    const matchesSearch = (user.email && user.email.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (user.name && user.name.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterRole === 'all') return matchesSearch;
    return matchesSearch && user.role === filterRole;
  });

  const userStats = {
    total: users.length,
    regularUsers: users.filter(u => u.role === 'user').length,
    instructors: users.filter(u => u.role === 'instructor').length,
    admins: users.filter(u => u.role === 'admin').length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50} />
          <p className="text-gray-600 font-medium mt-4">Memuat data pengguna...</p>
          <p className="text-gray-500 text-sm mt-2">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className="rounded-lg p-8 text-center border-2 bg-red-50 border-red-200">
              <div className="text-6xl mb-4">❌</div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Terjadi Kesalahan</h2>
              <p className="text-red-700 mb-6 font-medium">{error}</p>
              
              <button 
                onClick={fetchUsers}
                className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
              >
                🔄 Coba Lagi
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
      <div className="container mx-auto px-4">
        
        {/* ✅ Header Section */}
        <div className="mb-8">
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>👥 Kelola Pengguna</h1>
          <p className="text-gray-600 text-lg">
            Total <span className="font-bold text-secondary">{userStats.total}</span> pengguna
          </p>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Pengguna</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{userStats.total}</h3>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaUser className="text-2xl text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">User Biasa</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">{userStats.regularUsers}</h3>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaUser className="text-2xl text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Instructor</p>
                <h3 className="text-3xl font-bold text-purple-600 mt-2">{userStats.instructors}</h3>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <FaChalkboardTeacher className="text-2xl text-purple-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Admin</p>
                <h3 className="text-3xl font-bold text-orange-600 mt-2">{userStats.admins}</h3>
              </div>
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
                <FaShieldAlt className="text-2xl text-orange-600" />
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama atau email pengguna..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterRole}
                onChange={(e) => setFilterRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Role</option>
                <option value="user">��� User</option>
                <option value="instructor">👨‍🏫 Instructor</option>
                <option value="admin">👨‍💼 Admin</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          {filteredUsers.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">
                {users.length === 0 ? 'Belum ada pengguna' : 'Tidak ada hasil pencarian'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">No</th>
                  <th className="px-6 py-4 text-left">Pengguna</th>
                  <th className="px-6 py-4 text-left">Email</th>
                  <th className="px-6 py-4 text-left">Role</th>
                  <th className="px-6 py-4 text-left">Tanggal Daftar</th>
                  <th className="px-6 py-4 text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredUsers.map((user, index) => (
                  <tr key={user._id} className="hover:bg-gray-50 transition">
                    <td className="px-6 py-4 font-semibold text-gray-600">{index + 1}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {user.photoUrl ? (
                          <img 
                            src={convertImgBBUrl(user.photoUrl)}
                            alt={user.name}
                            className="w-10 h-10 rounded-full object-cover border-2 border-gray-200"
                            onError={(e) => {
                              e.target.src = "https://via.placeholder.com/40?text=" + user.name.charAt(0).toUpperCase();
                            }}
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-400 to-blue-600 flex items-center justify-center border-2 border-gray-200">
                            <span className="text-white font-bold text-sm">
                              {user.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <p className="font-bold text-gray-800">{user.name}</p>
                          <p className="text-xs text-gray-500">ID: {user._id?.substring(0, 8)}...</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                    <td className="px-6 py-4">
                      <select 
                        value={user.role}
                        onChange={(e) => handleRoleChange(user._id, e.target.value)}
                        className={`px-3 py-2 border-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium text-sm ${
                          user.role === 'admin' ? 'bg-orange-50 border-orange-300 text-orange-800' :
                          user.role === 'instructor' ? 'bg-purple-50 border-purple-300 text-purple-800' :
                          'bg-blue-50 border-blue-300 text-blue-800'
                        }`}
                      >
                        <option value="user">👤 User</option>
                        <option value="instructor">👨‍🏫 Instructor</option>
                        <option value="admin">👨‍💼 Admin</option>
                      </select>
                    </td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {user.createdAt 
                        ? new Date(user.createdAt).toLocaleDateString('id-ID', {
                            year: 'numeric',
                            month: 'short',
                            day: 'numeric'
                          })
                        : '-'
                      }
                    </td>
                    <td className="px-6 py-4 text-center">
                      <button 
                        onClick={() => handleDeleteUser(user._id, user.name)}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium text-sm flex items-center gap-2 justify-center mx-auto"
                      >
                        <FaTrash className="w-4 h-4" />
                        Hapus
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>

        {/* ✅ Role Distribution Info */}
        <div className="mt-8 bg-white rounded-lg shadow-md p-8">
          <h2 className="text-xl font-bold text-gray-800 mb-4">📊 Distribusi Role Pengguna</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg border-l-4 border-blue-500">
              <p className="text-gray-700 font-medium mb-2">User Biasa</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-blue-600">{userStats.regularUsers}</p>
                <p className="text-sm text-gray-600 mb-1">
                  ({Math.round((userStats.regularUsers / userStats.total) * 100)}%)
                </p>
              </div>
              <div className="mt-3 bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all"
                  style={{width: `${(userStats.regularUsers / userStats.total) * 100}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-lg border-l-4 border-purple-500">
              <p className="text-gray-700 font-medium mb-2">Instructor</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-purple-600">{userStats.instructors}</p>
                <p className="text-sm text-gray-600 mb-1">
                  ({Math.round((userStats.instructors / userStats.total) * 100)}%)
                </p>
              </div>
              <div className="mt-3 bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-purple-600 h-2 rounded-full transition-all"
                  style={{width: `${(userStats.instructors / userStats.total) * 100}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg border-l-4 border-orange-500">
              <p className="text-gray-700 font-medium mb-2">Admin</p>
              <div className="flex items-end gap-2">
                <p className="text-3xl font-bold text-orange-600">{userStats.admins}</p>
                <p className="text-sm text-gray-600 mb-1">
                  ({Math.round((userStats.admins / userStats.total) * 100)}%)
                </p>
              </div>
              <div className="mt-3 bg-gray-300 rounded-full h-2">
                <div 
                  className="bg-orange-600 h-2 rounded-full transition-all"
                  style={{width: `${(userStats.admins / userStats.total) * 100}%`}}
                ></div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg border-l-4 border-green-500">
              <p className="text-gray-700 font-medium mb-2">Total Aktif</p>
              <p className="text-3xl font-bold text-green-600">{userStats.total}</p>
              <p className="text-sm text-gray-600 mt-3">
                Pengguna terdaftar di sistem
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ManageUsers;