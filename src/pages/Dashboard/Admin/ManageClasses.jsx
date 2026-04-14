import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAxiosFetch from '../../../hooks/useAxiosFetch';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import Swal from 'sweetalert2';
import { HashLoader } from 'react-spinners';
import { FaSearch, FaCheck, FaTimes } from 'react-icons/fa';

// ✅ Utility function untuk convert imgBB URL
const convertImgBBUrl = (url) => {
  if (!url) return url;
  return url.replace('i.ibb.co/', 'i.ibb.co.com/');
};

const ManageClasses = () => {
  const navigate = useNavigate();
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const [classes, setClasses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        setLoading(true);
        console.log('📊 Fetching all classes...');
        
        const response = await axiosFetch.get('/classes-manage');
        
        console.log('✅ Full Response:', response.data);
        
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

  const handleApprove = async (id) => {
    try {
      const result = await Swal.fire({
        title: 'Setujui Kelas?',
        text: 'Kelas akan langsung tersedia untuk peserta',
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

  const filteredClasses = classes.filter(cls => {
    const matchesSearch = (cls.name && cls.name.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (cls.instructorName && cls.instructorName.toLowerCase().includes(searchTerm.toLowerCase()));
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && cls.status === filterStatus;
  });

  const pendingCount = classes.filter(c => c.status === 'pending').length;
  const approvedCount = classes.filter(c => c.status === 'approved').length;
  const rejectedCount = classes.filter(c => c.status === 'rejected').length;

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50} />
          <p className="text-gray-600 font-medium mt-4">Memuat data kelas...</p>
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
                onClick={() => window.location.reload()}
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
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>📚 Kelola Kelas</h1>
          <p className="text-gray-600 text-lg">
            Total <span className="font-bold text-secondary">{classes.length}</span> kelas
          </p>
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
                  placeholder="Cari nama kelas atau instruktur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="all">Semua Status</option>
                <option value="pending">⏳ Pending</option>
                <option value="approved">✅ Disetujui</option>
                <option value="rejected">❌ Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-orange-50 p-6 rounded-lg border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm font-medium">Menunggu Persetujuan</p>
            <h3 className="text-3xl font-bold text-orange-600 mt-2">{pendingCount}</h3>
          </div>
          
          <div className="bg-green-50 p-6 rounded-lg border-l-4 border-green-500">
            <p className="text-gray-600 text-sm font-medium">Disetujui</p>
            <h3 className="text-3xl font-bold text-green-600 mt-2">{approvedCount}</h3>
          </div>

          <div className="bg-red-50 p-6 rounded-lg border-l-4 border-red-500">
            <p className="text-gray-600 text-sm font-medium">Ditolak</p>
            <h3 className="text-3xl font-bold text-red-600 mt-2">{rejectedCount}</h3>
          </div>
        </div>

        {/* ✅ Table */}
        <div className="overflow-x-auto bg-white rounded-lg shadow-md">
          {filteredClasses.length === 0 ? (
            <div className="p-12 text-center">
              <div className="text-5xl mb-4">🔍</div>
              <p className="text-gray-500 text-lg">
                {classes.length === 0 ? 'Belum ada kelas' : 'Tidak ada hasil pencarian'}
              </p>
            </div>
          ) : (
            <table className="w-full">
              <thead className="bg-gradient-to-r from-blue-500 to-blue-600 text-white">
                <tr>
                  <th className="px-6 py-4 text-left">No</th>
                  <th className="px-6 py-4 text-left">Kelas</th>
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
                            src={convertImgBBUrl(cls.image)}
                            alt={cls.name}
                            className="w-10 h-10 rounded-lg object-cover"
                            onError={(e) => {
                              e.target.style.display = 'none';
                            }}
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
                      Rp{(cls.price || 0).toLocaleString('id-ID')}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                        cls.status === 'pending' ? 'bg-orange-100 text-orange-800' :
                        cls.status === 'approved' ? 'bg-green-100 text-green-800' :
                        'bg-red-100 text-red-800'
                      }`}>
                        {cls.status === 'pending' && '⏳ Pending'}
                        {cls.status === 'approved' && '✅ Disetujui'}
                        {cls.status === 'rejected' && '❌ Ditolak'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-center">
                      {cls.status === 'pending' && (
                        <div className="flex gap-2 justify-center">
                          <button 
                            onClick={() => handleApprove(cls._id)}
                            className="bg-green-500 hover:bg-green-600 text-white px-3 py-2 rounded-lg transition font-medium text-sm flex items-center gap-1"
                          >
                            <FaCheck className="w-4 h-4" />
                            Terima
                          </button>
                          <button 
                            onClick={() => handleReject(cls._id)}
                            className="bg-red-500 hover:bg-red-600 text-white px-3 py-2 rounded-lg transition font-medium text-sm flex items-center gap-1"
                          >
                            <FaTimes className="w-4 h-4" />
                            Tolak
                          </button>
                        </div>
                      )}
                      {cls.status === 'approved' && (
                        <span className="text-green-600 font-semibold text-sm">✓ Disetujui</span>
                      )}
                      {cls.status === 'rejected' && (
                        <div className="text-xs">
                          <span className="text-red-600 font-semibold">✗ Ditolak</span>
                          {cls.reason && (
                            <p className="text-gray-500 mt-1">Alasan: {cls.reason}</p>
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
    </div>
  );
};

export default ManageClasses;