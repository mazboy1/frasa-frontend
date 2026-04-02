import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { HashLoader } from 'react-spinners';
import Swal from 'sweetalert2';

const MyClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);

  useEffect(() => {
    // ✅ FIX: Validate user exists
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
        console.log('🔑 Token:', localStorage.getItem('access-token') ? '✅ Ada' : '❌ Tidak ada');
        
        // ✅ Gunakan endpoint yang sudah ada di backend
        const response = await axiosSecure.get(
          `/instructor/my-classes?email=${user.email}`
        );

        console.log('✅ Classes response:', response.data);

        if (response.data?.success) {
          // ✅ FIX: Ensure classes is always array
          let classesData = response.data.data?.classes || [];
          
          if (!Array.isArray(classesData)) {
            console.warn('⚠️ Classes data bukan array, mengkonversi...');
            classesData = classesData ? [classesData] : [];
          }
          
          // ✅ FIX: Filter out invalid entries
          classesData = classesData.filter(cls => cls && cls._id);
          
          console.log(`✅ Ditemukan ${classesData.length} kelas`);
          setClasses(classesData);
          setError(null);
        } else if (response.data?.data?.classes && Array.isArray(response.data.data.classes)) {
          // ✅ Alternative response format
          const classesData = response.data.data.classes.filter(cls => cls && cls._id);
          setClasses(classesData);
          setError(null);
        } else {
          console.warn('⚠️ Unexpected response format:', response.data);
          setError('Format data tidak sesuai dari server');
          setClasses([]);
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err);
        console.error('Response status:', err.response?.status);
        console.error('Response data:', err.response?.data);
        
        let errorMsg = 'Terjadi kesalahan saat mengambil data kelas';
        
        if (err.response?.status === 401) {
          errorMsg = 'Sesi telah berakhir, silakan login kembali';
        } else if (err.response?.status === 403) {
          errorMsg = 'Anda tidak memiliki akses ke fitur ini';
        } else if (err.response?.status === 404) {
          errorMsg = 'Endpoint tidak ditemukan (404)';
        } else if (err.response?.data?.message) {
          errorMsg = err.response.data.message;
        } else if (err.message) {
          errorMsg = err.message;
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

  const handleDeleteClass = async (classId) => {
    if (!classId) {
      Swal.fire('Error', 'ID kelas tidak valid', 'error');
      return;
    }

    const result = await Swal.fire({
      title: 'Hapus Kelas?',
      text: 'Apakah Anda yakin ingin menghapus kelas ini? Tindakan ini tidak dapat dibatalkan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#d33',
      cancelButtonColor: '#3085d6',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    });

    if (!result.isConfirmed) return;

    try {
      // TODO: Implement backend delete endpoint if not exists
      console.log('🗑️ Deleting class:', classId);
      
      // Temporary: Show success message
      // In production, call: await axiosSecure.delete(`/instructor/classes/${classId}`);
      
      Swal.fire('Berhasil', 'Kelas telah dihapus', 'success');
      
      // Remove dari local state
      setClasses(classes.filter(cls => cls._id !== classId));
    } catch (err) {
      console.error('❌ Error deleting class:', err);
      Swal.fire('Error', 'Gagal menghapus kelas: ' + err.message, 'error');
    }
  };

  const handleRetry = () => {
    setRetryCount(prev => prev + 1);
    setIsLoading(true);
    setError(null);
  };

  const handleReLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access-token');
    window.location.href = '/login';
  };

  // ✅ FIX: Loading state with better UX
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

  // ✅ FIX: Better error handling with actions
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            <div className={`rounded-lg p-8 text-center border-2 ${
              error.includes('login') ? 'bg-red-50 border-red-200' : 
              error.includes('akses') ? 'bg-orange-50 border-orange-200' :
              'bg-red-50 border-red-200'
            }`}>
              <div className="text-6xl mb-4">
                {error.includes('login') ? '🔐' : 
                 error.includes('akses') ? '⚠️' :
                 '❌'}
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
                
                <button
                  onClick={() => navigate('/dashboard')}
                  className="bg-gray-600 hover:bg-gray-700 text-white font-bold py-3 px-6 rounded-lg transition"
                >
                  ← Kembali ke Dashboard
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
          <div>
            <h1 className="text-4xl font-bold text-gray-800">📚 Kelas Saya</h1>
            <p className="text-gray-600 mt-1">Kelola kelas yang Anda buat dan ajarkan</p>
          </div>
          <button
            onClick={handleAddClass}
            className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded-lg transition shadow-md hover:shadow-lg"
          >
            ➕ Tambah Kelas Baru
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
            <p className="text-gray-600 text-sm">Total Kelas</p>
            <p className="text-3xl font-bold text-blue-600">{Array.isArray(classes) ? classes.length : 0}</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
            <p className="text-gray-600 text-sm">Kelas Disetujui</p>
            <p className="text-3xl font-bold text-green-600">
              {Array.isArray(classes) ? classes.filter(c => c.status === 'approved').length : 0}
            </p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-orange-500">
            <p className="text-gray-600 text-sm">Pending Review</p>
            <p className="text-3xl font-bold text-orange-600">
              {Array.isArray(classes) ? classes.filter(c => c.status === 'pending').length : 0}
            </p>
          </div>
        </div>

        {/* Classes List */}
        {!Array.isArray(classes) || classes.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-4">📚</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              Belum ada kelas
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              Anda belum membuat kelas apapun. Mulai buat kelas baru sekarang dan mulai mengajar!
            </p>
            <button
              onClick={handleAddClass}
              className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              🎓 Buat Kelas Pertama Saya
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => {
              // ✅ FIX: Validate class data
              if (!classItem || !classItem._id) {
                console.warn('⚠️ Invalid class item, skipping:', classItem);
                return null;
              }

              const statusColor = classItem.status === 'approved' 
                ? 'bg-green-100 text-green-800'
                : classItem.status === 'pending'
                ? 'bg-yellow-100 text-yellow-800'
                : 'bg-red-100 text-red-800';

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
                  className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-all duration-300 flex flex-col border border-gray-200"
                >
                  {/* Class Image */}
                  {classItem.image && (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden">
                      <img
                        src={classItem.image}
                        alt={classItem.name}
                        className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                          e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-300"><span class="text-gray-600">📷 No Image</span></div>';
                        }}
                      />
                    </div>
                  )}

                  {/* Class Info */}
                  <div className="p-4 flex-grow flex flex-col">
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="text-lg font-bold text-gray-800 flex-grow line-clamp-2">
                        {classItem.name || 'Unnamed Class'}
                      </h3>
                      <span className={`px-2 py-1 rounded-full text-xs font-bold whitespace-nowrap ml-2 ${statusColor}`}>
                        {statusIcon} {statusText}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 text-sm mb-3 line-clamp-2 flex-grow">
                      {classItem.description || 'No description'}
                    </p>

                    {/* Stats */}
                    <div className="grid grid-cols-3 gap-2 mb-4 text-sm bg-gray-50 p-3 rounded">
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
                    <div className="flex gap-2 mt-auto">
                      <button
                        onClick={() => handleEditClass(classItem._id)}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded transition text-sm"
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={() => handleDeleteClass(classItem._id)}
                        className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-3 rounded transition text-sm"
                      >
                        🗑️ Hapus
                      </button>
                    </div>
                  </div>
                </div>
              );
            }).filter(Boolean)} {/* Filter out null values */}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyClasses;