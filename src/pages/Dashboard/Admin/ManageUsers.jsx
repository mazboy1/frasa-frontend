import React, { useState, useEffect } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import Swal from 'sweetalert2';

// ✅ Utility function untuk convert imgBB URL
const convertImgBBUrl = (url) => {
  if (!url) return url;
  // Ubah i.ibb.co menjadi i.ibb.co.com
  return url.replace('i.ibb.co/', 'i.ibb.co.com/');
};

const ManageUsers = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  
  const [users, setUsers] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchEmail, setSearchEmail] = useState('');

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
        
        // Handle 401 - token invalid/expired
        if (err.response?.status === 401) {
          setError('Session expired. Please login again');
          // Redirect to login
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
        // Update local state
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
      text: `Apakah Anda yakin ingin menghapus ${userName}?`,
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

  const filteredUsers = users.filter(user => 
    user.email.toLowerCase().includes(searchEmail.toLowerCase()) ||
    user.name.toLowerCase().includes(searchEmail.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-red-50 p-6 rounded-lg border border-red-200">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Memuat Data</h2>
          <p className="text-red-500 mb-4">{error}</p>
          <button 
            onClick={fetchUsers}
            className="bg-red-500 hover:bg-red-600 text-white px-6 py-3 rounded-lg transition"
          >
            🔄 Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-gray-800 mb-2">
          Kelola Pengguna
        </h1>
        <p className="text-gray-600">
          Total Pengguna: <span className="font-bold">{users.length}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Cari berdasarkan nama atau email..."
          value={searchEmail}
          onChange={(e) => setSearchEmail(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {filteredUsers.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">😕 Tidak ada pengguna yang ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">No</th>
                <th className="px-6 py-4 text-left">Nama</th>
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
                          className="w-10 h-10 rounded-full object-cover"
                          onError={(e) => {
                            e.target.src = "https://via.placeholder.com/40?text=" + user.name.charAt(0).toUpperCase();
                          }}
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-bold">
                            {user.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{user.email}</td>
                  <td className="px-6 py-4">
                    <select 
                      value={user.role}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      className="px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 capitalize"
                    >
                      <option value="user">👤 User</option>
                      <option value="instructor">👨‍🏫 Instructor</option>
                      <option value="admin">👨‍💼 Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">
                    {user.createdAt 
                      ? new Date(user.createdAt).toLocaleDateString('id-ID')
                      : '-'
                    }
                  </td>
                  <td className="px-6 py-4 text-center">
                    <button 
                      onClick={() => handleDeleteUser(user._id, user.name)}
                      className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-lg transition font-medium text-sm"
                    >
                      🗑️ Hapus
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Stats Footer */}
      <div className="mt-6 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <div className="text-2xl font-bold text-blue-600">
            {users.filter(u => u.role === 'user').length}
          </div>
          <div className="text-gray-600 text-sm">👤 User Biasa</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {users.filter(u => u.role === 'instructor').length}
          </div>
          <div className="text-gray-600 text-sm">👨‍🏫 Instructor</div>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <div className="text-2xl font-bold text-purple-600">
            {users.filter(u => u.role === 'admin').length}
          </div>
          <div className="text-gray-600 text-sm">👨‍💼 Admin</div>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;