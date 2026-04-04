import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import useUser from '../../../../hooks/useUser';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const EnrolledClasses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
    // ✅ FIX: Validate state is always array
    if (!Array.isArray(data)) {
      setData([]);
    }
  }, [data]);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      setError('User email tidak ditemukan');
      setData([]);
      return;
    }

    console.log('🔄 Fetching enrolled classes for:', currentUser.email);

    axiosSecure
      .get(`/enrolled-classes/${currentUser.email}`)
      .then(res => {
        console.log('✅ Enrolled classes fetched:', res.data);
        
        // ✅ FIX: Ensure data is always an array
        let enrolledData = [];
        if (Array.isArray(res.data)) {
          enrolledData = res.data;
        } else if (Array.isArray(res.data?.data)) {
          enrolledData = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
          // If it's a single object, wrap it in array
          enrolledData = [res.data];
        }
        
        // ✅ FIX: Filter out invalid entries
        enrolledData = enrolledData.filter(item => item && (item._id || item.id));
        
        setData(enrolledData);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching enrolled classes:', err);
        
        let errorMsg = 'Gagal memuat kelas terdaftar';
        if (err.response?.status === 401) {
          errorMsg = 'Sesi expired, silakan login kembali';
        } else if (err.response?.status === 404) {
          errorMsg = 'Belum ada kelas terdaftar';
        } else if (err.response?.status === 403) {
          errorMsg = 'Akses ditolak. Silakan login kembali';
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        setError(errorMsg);
        setData([]);
        setLoading(false);
      });
  }, [currentUser?.email, axiosSecure]);

  const handleRetry = () => {
    setRetryCount(0);
    setLoading(true);
    setError(null);
  };

  const handleReLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access-token');
    window.location.href = '/login';
  };

  // ✅ FIX: Navigate ke CoursesStudy dengan state (bukan query param)
  const handleStartLearning = (classId) => {
    if (!classId) {
      Swal.fire('Error', 'ID kelas tidak valid', 'error');
      return;
    }
    console.log('🎓 Starting course:', classId);
    navigate('/dashboard/courses-study', { 
      state: { classId } 
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat kelas Anda...</p>
          <p className="text-gray-500 text-sm mt-2">Harap tunggu sebentar</p>
        </div>
      </div>
    );
  }

  if (error && (!Array.isArray(data) || data.length === 0)) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          {error.includes('expired') || error.includes('Akses ditolak') ? (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">🔐</div>
              <p className="text-red-800 font-medium mb-4">{error}</p>
              <button
                onClick={handleReLogin}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                🔑 Login Kembali
              </button>
            </div>
          ) : (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
              <div className="text-5xl mb-4">⚠️</div>
              <p className="text-yellow-800 font-medium mb-4">{error}</p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Link 
                  to="/classes" 
                  className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors text-center"
                >
                  🔍 Jelajahi Kelas
                </Link>
                <button
                  onClick={handleRetry}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-6 rounded-lg transition-colors"
                >
                  🔄 Coba Lagi
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className='text-4xl font-bold text-gray-800 mb-2'>📚 Kelas Saya</h1>
        <p className="text-gray-600">
          Anda telah terdaftar di {Array.isArray(data) ? data.length : 0} kelas
        </p>
      </div>

      {/* Empty State */}
      {!Array.isArray(data) || data.length === 0 ? (
        <div className="text-center py-16 bg-gradient-to-br from-gray-50 to-gray-100 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Belum ada kelas terdaftar</h2>
          <p className="text-gray-600 mb-8 max-w-md mx-auto">
            Jelajahi koleksi kursus kami yang beragam dan mulai perjalanan belajar Anda sekarang!
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/classes" 
              className="inline-block bg-secondary hover:bg-secondary-dark text-white font-medium py-3 px-8 rounded-lg transition-colors"
            >
              🔍 Jelajahi Kursus
            </Link>
            <Link 
              to="/dashboard" 
              className="inline-block bg-gray-300 hover:bg-gray-400 text-gray-800 font-medium py-3 px-8 rounded-lg transition-colors"
            >
              ← Kembali ke Dashboard
            </Link>
          </div>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {Array.isArray(data) && data.map((item, index) => {
            // ✅ FIX: Safely extract class data
            const classData = item?.classes || item || {};
            const classId = classData?._id || classData?.id || item?._id;
            const className = classData?.name || 'Unnamed Class';
            const classPrice = classData?.price || 0;
            const instructorName = classData?.instructorName || classData?.instructor?.name || 'Unknown Instructor';
            const classImage = classData?.image || null;

            // ✅ FIX: Validate class data before rendering
            if (!classId) {
              console.warn('⚠️ Skipping class without ID at index', index);
              return null;
            }

            return (
              <div 
                key={classId}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-[420px] border border-gray-100"
              >
                {/* Image Container */}
                <div className="h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 relative">
                  {classImage ? (
                    <img 
                      src={classImage} 
                      alt={className} 
                      className="w-full h-full object-cover hover:scale-105 transition-transform duration-300"
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gradient-to-br from-gray-300 to-gray-400"><span class="text-white text-center font-medium">📷 No Image</span></div>';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gradient-to-br from-gray-300 to-gray-400">
                      <span className="text-white font-medium">📷 No Image</span>
                    </div>
                  )}
                  {/* Badge */}
                  <div className="absolute top-3 right-3">
                    <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold">
                      ✅ Enrolled
                    </span>
                  </div>
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-2 leading-snug">
                      {className}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">
                      👨‍🏫 {instructorName}
                    </p>
                    {classData?.description && (
                      <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                        {classData.description}
                      </p>
                    )}
                  </div>

                  {/* Stats & Footer */}
                  <div>
                    {classData?.totalStudents && (
                      <div className="mb-3 pb-3 border-b border-gray-100">
                        <p className="text-xs text-gray-600">
                          👥 {classData.totalStudents} peserta belajar
                        </p>
                      </div>
                    )}
                    
                    <div className="flex justify-between items-center gap-2">
                      <p className="font-bold text-secondary text-lg">
                        Rp{classPrice.toLocaleString('id-ID')}
                      </p>
                      {/* ✅ FIX: Use onClick handler instead of Link */}
                      <button
                        onClick={() => handleStartLearning(classId)}
                        className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 text-sm whitespace-nowrap hover:shadow-md"
                      >
                        ▶️ Belajar
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          }).filter(Boolean)} {/* Filter out null values */}
        </div>
      )}

      {/* Error Recovery Info */}
      {error && Array.isArray(data) && data.length > 0 && (
        <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-yellow-800 text-sm">
            ⚠️ <span className="font-medium">Ada masalah</span>: {error}. 
            Namun beberapa data mungkin masih ditampilkan. Silakan refresh halaman jika ada masalah.
          </p>
        </div>
      )}
    </div>
  );
};

export default EnrolledClasses;