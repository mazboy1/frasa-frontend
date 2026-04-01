import React, { useEffect, useState, useCallback } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { useNavigate } from 'react-router-dom';
import { FiEdit, FiTrash2, FiUser, FiMail, FiKey, FiSearch, FiRefreshCw } from 'react-icons/fi';
import { MdVerified } from 'react-icons/md';
import Swal from 'sweetalert2';
import SectionTitle from '../../../components/SectioniTitle';

const ManageUsers = () => {
  const axiosSecure = useAxiosSecure(); // ✅ GANTI dari axiosFetch ke axiosSecure
  const navigate = useNavigate();
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [usersPerPage] = useState(10);
  const [processing, setProcessing] = useState(null);

  // Fetch users data
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = useCallback(() => {
    setLoading(true);
    console.log('📊 Fetching all users...');
    
    axiosSecure.get('/users')
      .then(res => {
        console.log('✅ Users response:', res.data);
        
        // Handle response format
        let usersData = [];
        
        if (res.data?.success && Array.isArray(res.data?.data)) {
          usersData = res.data.data;
        } else if (Array.isArray(res.data?.data)) {
          usersData = res.data.data;
        } else if (Array.isArray(res.data)) {
          usersData = res.data;
        }

        console.log(`✅ Processed ${usersData.length} users`);
        setUsers(usersData);
      })
      .catch(error => {
        console.error('❌ Error fetching users:', error);
        
        let errorMessage = 'Gagal memuat data pengguna.';
        
        if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.status === 403) {
          errorMessage = 'Anda tidak memiliki akses admin.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        Swal.fire('Error!', errorMessage, 'error');
      })
      .finally(() => setLoading(false));
  }, [axiosSecure]);


  // Filter users based on search term
  const filteredUsers = users.filter(user => 
    (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
    (user.role || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Pagination logic
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const currentUsers = (filteredUsers || []).slice(indexOfFirstUser, indexOfLastUser);
  const totalPages = Math.ceil((filteredUsers?.length || 0) / usersPerPage);

  const handleDelete = (id) => {
    Swal.fire({
      title: 'Konfirmasi Hapus',
      text: "Apakah Anda yakin ingin menghapus pengguna ini?",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        setProcessing(id);
        
        axiosSecure.delete(`/delete-user/${id}`)
          .then(res => {
            if (res.data.deletedCount > 0) {
              Swal.fire(
                'Terhapus!',
                'Pengguna berhasil dihapus.',
                'success'
              );
              setUsers(users.filter(user => user._id !== id));
            } else {
              Swal.fire(
                'Gagal!',
                'Pengguna tidak ditemukan.',
                'error'
              );
            }
          })
          .catch(err => {
            console.error('❌ Delete error:', err);
            Swal.fire(
              'Error!',
              err.response?.data?.message || 'Gagal menghapus pengguna.',
              'error'
            );
          })
          .finally(() => setProcessing(null));
      }
    });
  };

  const handleRoleChange = (id, newRole) => {
    setProcessing(id);
    
    axiosSecure.patch(`/change-user-role/${id}`, { role: newRole })
      .then(res => {
        if (res.data.modifiedCount > 0) {
          Swal.fire('Sukses!', 'Role pengguna berhasil diubah.', 'success');
          setUsers(users.map(user => 
            user._id === id ? { ...user, role: newRole } : user
          ));
        }
      })
      .catch(err => {
        console.error('❌ Role change error:', err);
        Swal.fire(
          'Error!',
          err.response?.data?.message || 'Gagal mengubah role.',
          'error'
        );
      })
      .finally(() => setProcessing(null));
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data pengguna...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <SectionTitle title="Kelola Pengguna" subtitle="Manage all users in the system"/>
      
      {/* Search Bar */}
      <div className="mb-6 flex gap-4">
        <div className="flex-1 relative">
          <FiSearch className="absolute left-3 top-3 text-gray-400" />
          <input
            type="text"
            placeholder="Cari nama, email, atau role..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-orange-500"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
          />
        </div>
        <button
          onClick={() => fetchUsers()}
          className="px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition"
        >
          <FiRefreshCw className="inline mr-2" /> Refresh
        </button>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-100 border-b">
            <tr>
              <th className="px-6 py-3 text-left text-sm font-semibold">Nama</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Email</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Role</th>
              <th className="px-6 py-3 text-left text-sm font-semibold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {currentUsers && currentUsers.length > 0 ? (
              currentUsers.map((user) => (
                <tr key={user._id} className="border-b hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiUser className="text-gray-400" />
                      {user.name || 'N/A'}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <FiMail className="text-gray-400" />
                      {user.email}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <select
                      value={user.role || 'user'}
                      onChange={(e) => handleRoleChange(user._id, e.target.value)}
                      disabled={processing === user._id}
                      className="px-3 py-1 border rounded bg-white cursor-pointer"
                    >
                      <option value="user">User</option>
                      <option value="instructor">Instructor</option>
                      <option value="admin">Admin</option>
                    </select>
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleDelete(user._id)}
                      disabled={processing === user._id}
                      className="text-red-500 hover:text-red-700 transition disabled:opacity-50"
                      title="Hapus pengguna"
                    >
                      <FiTrash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="4" className="px-6 py-8 text-center text-gray-500">
                  Tidak ada pengguna ditemukan
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-6 flex justify-center gap-2">
          {Array.from({ length: totalPages }, (_, i) => (
            <button
              key={i + 1}
              onClick={() => setCurrentPage(i + 1)}
              className={`px-3 py-2 rounded ${
                currentPage === i + 1
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-200 hover:bg-gray-300'
              }`}
            >
              {i + 1}
            </button>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="mt-8 grid grid-cols-3 gap-4">
        <div className="bg-blue-50 p-4 rounded-lg border border-blue-200">
          <p className="text-sm text-blue-600">Total Pengguna</p>
          <p className="text-3xl font-bold text-blue-700">{users.length}</p>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <p className="text-sm text-green-600">Instructor</p>
          <p className="text-3xl font-bold text-green-700">{users.filter(u => u.role === 'instructor').length}</p>
        </div>
        <div className="bg-purple-50 p-4 rounded-lg border border-purple-200">
          <p className="text-sm text-purple-600">Admin</p>
          <p className="text-3xl font-bold text-purple-700">{users.filter(u => u.role === 'admin').length}</p>
        </div>
      </div>
    </div>
  );
};

export default ManageUsers;