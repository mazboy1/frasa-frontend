import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';

const ManageClasses = () => {
  const navigate = useNavigate();
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching all classes...');
        
        const response = await axiosFetch.get('/classes-manage');
        
        console.log('✅ Full Response:', response.data);
        
        // Handle response format: { success, data: [...], total }
        if (!response.data.success) {
          throw new Error('API returned error');
        }
        
        const classesData = response.data.data || [];
        
        if (!Array.isArray(classesData)) {
          throw new Error('Data bukan array');
        }
        
        console.log(`📚 Found ${classesData.length} classes`);
        
        setClasses(classesData);
        setError(null);
      } catch (err) {
        console.error('❌ Fetch error:', err);
        setError(err.message || 'Gagal memuat data kelas');
        setClasses([]);
      } finally {
        setLoading(false);
      }
    };

    fetchClasses();
  }, [axiosFetch]);

  const filteredClasses = classes.filter(cls => 
    (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.instructorName && cls.instructorName.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (cls.status && cls.status.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Setujui Kelas?',
        text: 'Anda akan menyetujui kelas ini',
        icon: 'question',
        showCancelButton: true,
        confirmButtonColor: '#10B981',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Setujui!',
        cancelButtonText: 'Batal'
      });

      if (result.isConfirmed) {
        const response = await axiosSecure.patch(`/change-status/${id}`, {
          status: 'approved'
        });

        if (response.data.success) {
          setClasses(prev => prev.map(cls => 
            cls._id === id ? { ...cls, status: 'approved' } : cls
          ));
          Swal.fire('Berhasil!', 'Kelas telah disetujui', 'success');
        }
      }
    } catch (err) {
      console.error('Approve error:', err);
      Swal.fire('Error', 'Gagal menyetujui kelas', 'error');
    }
  };

  const handleReject = async (id) => {
    try {
      const { value: reason } = await Swal.fire({
        title: 'Tolak Kelas?',
        input: 'textarea',
        inputLabel: 'Alasan Penolakan',
        inputPlaceholder: 'Masukkan alasan penolakan...',
        showCancelButton: true,
        confirmButtonColor: '#EF4444',
        cancelButtonColor: '#6B7280',
        confirmButtonText: 'Ya, Tolak!',
        cancelButtonText: 'Batal',
        inputValidator: (value) => !value && 'Harap masukkan alasan!'
      });

      if (reason) {
        const response = await axiosSecure.patch(`/change-status/${id}`, {
          status: 'rejected',
          reason
        });

        if (response.data.success) {
          setClasses(prev => prev.map(cls => 
            cls._id === id ? { ...cls, status: 'rejected' } : cls
          ));
          Swal.fire('Ditolak!', 'Kelas telah ditolak', 'success');
        }
      }
    } catch (err) {
      console.error('Reject error:', err);
      Swal.fire('Error', 'Gagal menolak kelas', 'error');
    }
  };

  const getStatusBadgeColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800';
      case 'rejected':
        return 'bg-red-100 text-red-800';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data kelas...</p>
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
            onClick={() => window.location.reload()}
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
          Kelola Kelas
        </h1>
        <p className="text-gray-600">
          Total Kelas: <span className="font-bold">{classes.length}</span>
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6">
        <input
          type="text"
          placeholder="🔍 Cari berdasarkan nama kelas, instruktur, atau status..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-200">
          <div className="text-2xl font-bold text-yellow-600">
            {classes.filter(c => c.status === 'pending').length}
          </div>
          <div className="text-gray-600 text-sm">⏳ Pending</div>
        </div>
        <div className="bg-green-50 p-4 rounded-lg border border-green-200">
          <div className="text-2xl font-bold text-green-600">
            {classes.filter(c => c.status === 'approved').length}
          </div>
          <div className="text-gray-600 text-sm">✅ Approved</div>
        </div>
        <div className="bg-red-50 p-4 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600">
            {classes.filter(c => c.status === 'rejected').length}
          </div>
          <div className="text-gray-600 text-sm">❌ Rejected</div>
        </div>
      </div>

      {/* Table */}
      <div className="overflow-x-auto bg-white rounded-lg shadow">
        {filteredClasses.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <p className="text-lg">😕 Tidak ada kelas yang ditemukan</p>
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
              <tr>
                <th className="px-6 py-4 text-left">No</th>
                <th className="px-6 py-4 text-left">Nama Kelas</th>
                <th className="px-6 py-4 text-left">Instruktur</th>
                <th className="px-6 py-4 text-left">Harga</th>
                <th className="px-6 py-4 text-left">Status</th>
                <th className="px-6 py-4 text-center">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredClasses.map((cls, index) => (
                <tr key={cls._id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-semibold text-gray-600">{index + 1}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      {cls.image ? (
                        <img 
                          src={cls.image} 
                          alt={cls.name}
                          className="w-10 h-10 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-10 h-10 rounded-lg bg-gray-300 flex items-center justify-center">
                          <span className="text-gray-600 font-bold">📚</span>
                        </div>
                      )}
                      <span className="font-medium text-gray-800">{cls.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-600 text-sm">{cls.instructorName || '-'}</td>
                  <td className="px-6 py-4 text-gray-600 text-sm font-semibold">
                    Rp {cls.price?.toLocaleString('id-ID') || '0'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusBadgeColor(cls.status)}`}>
                      {cls.status === 'pending' && '⏳ Pending'}
                      {cls.status === 'approved' && '✅ Approved'}
                      {cls.status === 'rejected' && '❌ Rejected'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {cls.status === 'pending' && (
                      <div className="flex gap-2 justify-center">
                        <button 
                          onClick={() => handleApprove(cls._id)}
                          className="bg-green-500 hover:bg-green-600 text-white px-3 py-1 rounded transition font-medium text-sm"
                        >
                          ✅ Terima
                        </button>
                        <button 
                          onClick={() => handleReject(cls._id)}
                          className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded transition font-medium text-sm"
                        >
                          ❌ Tolak
                        </button>
                      </div>
                    )}
                    {cls.status === 'approved' && (
                      <span className="text-green-600 font-semibold">Disetujui</span>
                    )}
                    {cls.status === 'rejected' && (
                      <div>
                        <span className="text-red-600 font-semibold">Ditolak</span>
                        {cls.reason && (
                          <p className="text-xs text-gray-500 mt-1">Alasan: {cls.reason}</p>
                        )}
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
};

export default ManageClasses;