import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { HashLoader } from 'react-spinners';
import Swal from 'sweetalert2';
import { FaEdit, FaTrash, FaPlus, FaSearch } from 'react-icons/fa';

const MyClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    if (!user?.email) {
      console.warn('⚠️ User email tidak ditemukan');
      setIsLoading(false);
      setError('Silakan login terlebih dahulu');
      setClasses([]);
      return;
    }

    const fetchMyClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Fetching classes untuk instructor:', user.email);
        
        const response = await axiosSecure.get(
          `/instructor/my-classes?email=${user.email}`
        );

        console.log('✅ Classes response:', response.data);

        if (response.data?.success) {
          let classesData = response.data.data?.classes || [];
          
          if (!Array.isArray(classesData)) {
            console.warn('⚠️ Classes data bukan array, mengkonversi...');
            classesData = classesData ? [classesData] : [];
          }
          
          classesData = classesData.filter(cls => cls && cls._id);
          
          console.log(`✅ Ditemukan ${classesData.length} kelas`);
          setClasses(classesData);
          setError(null);
        } else {
          console.warn('⚠️ Unexpected response format:', response.data);
          setError('Format data tidak sesuai dari server');
          setClasses([]);
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err);
        
        let errorMsg = 'Terjadi kesalahan saat mengambil data kelas';
        
        if (err.response?.status === 401) {
          errorMsg = 'Sesi telah berakhir, silakan login kembali';
        } else if (err.response?.status === 403) {
          errorMsg = 'Anda tidak memiliki akses ke fitur ini';
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        }
        
        setError(errorMsg);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyClasses();
  }, [user?.email, axiosSecure]);

  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  const handleEditClass = (classId) => {
    if (!classId) {
      Swal.fire('Error', 'ID kelas tidak valid', 'error');
      return;
    }
    navigate(`/dashboard/update-class/${classId}`);
  };

  const handleDeleteClass = async (classId, className) => {
    if (!classId) {
      Swal.fire('Error', 'ID kelas tidak valid', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Hapus Kelas?',
      text: `Apakah Anda yakin ingin menghapus "${className}"? Tindakan ini tidak dapat dibatalkan.`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      console.log('🗑️ Deleting class:', classId);
      
      Swal.fire('Berhasil', 'Kelas telah dihapus', 'success');
      setClasses(classes.filter(cls => cls._id !== classId));
    } catch (err) {
      console.error('❌ Error deleting class:', err);
      Swal.fire('Error', 'Gagal menghapus kelas: ' + err.message, 'error');
    }
  };

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
    setError(null);
  };

  const handleReLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access-token');
    window.location.href = '/login';
  };

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    return matchesSearch && cls.status === filterStatus;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50} />
          <p className="text-gray-600 font-medium mt-4">Memuat kelas Anda...</p>
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
            <div className={`rounded-lg p-8 text-center border-2 ${
              error.includes('login') ? 'bg-red-50 border-red-200' : 
              'bg-red-50 border-red-200'
            }`}>
              <div className="text-6xl mb-4">
                {error.includes('login') ? '🔐' : '❌'}
              </div>
              <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
              <p className="text-gray-700 mb-6 font-medium">{error}</p>
              
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                {error.includes('login') && (
                  <button
                    onClick={handleReLogin}
                    className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
                  >
                    🔑 Login Kembali
                  </button>
                )}
                
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  🔄 Coba Lagi
                </button>
              </div>
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
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>📚 Kelas Saya</h1>
          <p className="text-gray-600 text-lg">
            Anda memiliki <span className="font-bold text-secondary">{Array.isArray(classes) ? classes.length : 0}</span> kelas
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
                  placeholder="Cari nama kelas..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            {/* Filter */}
            <div>
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
              >
                <option value="all">Semua Status</option>
                <option value="approved">✅ Disetujui</option>
                <option value="pending">⏳ Pending</option>
                <option value="rejected">❌ Ditolak</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Stats Bar */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Kelas</p>
            <h3 className="text-3xl font-bold text-blue-600">{Array.isArray(classes) ? classes.length : 0}</h3>
          </div>
          
          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Disetujui</p>
            <h3 className="text-3xl font-bold text-green-600">
              {Array.isArray(classes) ? classes.filter(c => c.status === 'approved').length : 0}
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <h3 className="text-3xl font-bold text-orange-600">
              {Array.isArray(classes) ? classes.filter(c => c.status === 'pending').length : 0}
            </h3>
          </div>

          <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-red-500">
            <p className="text-gray-600 text-sm">Ditolak</p>
            <h3 className="text-3xl font-bold text-red-600">
              {Array.isArray(classes) ? classes.filter(c => c.status === 'rejected').length : 0}
            </h3>
          </div>
        </div>

        {/* ✅ Empty State */}
        {!Array.isArray(classes) || classes.length === 0 || filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {filteredClasses.length === 0 && classes.length > 0 ? 'Tidak ada hasil pencarian' : 'Belum ada kelas'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filteredClasses.length === 0 && classes.length > 0 
                ? 'Coba ubah filter atau cari dengan kata kunci yang berbeda'
                : 'Anda belum membuat kelas apapun. Mulai buat kelas baru sekarang dan mulai mengajar!'}
            </p>
            <button
              onClick={handleAddClass}
              className="bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-8 rounded-lg transition"
            >
              🎓 Buat Kelas Pertama Saya
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.isArray(filteredClasses) && filteredClasses.map((classItem) => {
              if (!classItem || !classItem._id) {
                return null;
              }

              const statusColor = classItem.status === 'approved' 
                ? 'bg-green-100 text-green-800 border-green-300'
                : classItem.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800 border-yellow-300'
                : 'bg-red-100 text-red-800 border-red-300';

              const statusIcon = classItem.status === 'approved'
                ? '✅'
                : classItem.status === 'pending'
                ? '⏳'
                : '❌';

              const statusText = classItem.status === 'approved'
                ? 'Disetujui'
                : classItem.status === 'pending'
                ? 'Pending'
                : 'Ditolak';

              return (
                <div
                  key={classItem._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full border border-gray-100 group"
                >
                  {/* Class Image */}
                  {classItem.image && (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative">
                      <img
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div className={`absolute top-3 right-3 px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1 ${statusColor} border`}>
                        {statusIcon} {statusText}
                      </div>
                    </div>
                  )}

                  {/* Class Info */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                        {classItem.name || 'Unnamed Class'}
                      </h3>
                      
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                        {classItem.description || 'No description'}
                      </p>
                    </div>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm bg-gray-50 p-3 rounded border border-gray-100">
                      <div>
                        <p className="text-gray-600 text-xs">Harga</p>
                        <p className="font-bold text-gray-800">Rp{(classItem.price || 0).toLocaleString('id-ID')}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Peserta</p>
                        <p className="font-bold text-gray-800">{classItem.totalEnrolled || 0}</p>
                      </div>
                      <div>
                        <p className="text-gray-600 text-xs">Level</p>
                        <p className="font-bold text-gray-800 capitalize">{classItem.level || '-'}</p>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleEditClass(classItem._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem._id, classItem.name)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                      >
                        <FaTrash className="w-4 h-4" />
                        Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClasses;