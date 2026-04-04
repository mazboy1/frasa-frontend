import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import useUser from '../../../../hooks/useUser';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { FaPlay, FaClock, FaUsers, FaStar, FaCheckCircle, FaSearch } from 'react-icons/fa';

const EnrolledClasses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // all, inProgress, completed
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();
  const navigate = useNavigate();

  useEffect(() => {
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
        
        let enrolledData = [];
        if (Array.isArray(res.data)) {
          enrolledData = res.data;
        } else if (Array.isArray(res.data?.data)) {
          enrolledData = res.data.data;
        } else if (res.data && typeof res.data === 'object') {
          enrolledData = [res.data];
        }
        
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
        }
        
        setError(errorMsg);
        setData([]);
        setLoading(false);
      });
  }, [currentUser?.email, axiosSecure]);

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

  // Filter classes
  const filteredData = data.filter(item => {
    const classData = item?.classes || item || {};
    const className = (classData?.name || '').toLowerCase();
    const instructorName = (classData?.instructorName || classData?.instructor?.name || '').toLowerCase();
    
    const matchesSearch = className.includes(searchTerm.toLowerCase()) || 
                         instructorName.includes(searchTerm.toLowerCase());
    
    if (filterStatus === 'all') return matchesSearch;
    if (filterStatus === 'inProgress') return matchesSearch; // Can add actual progress tracking
    if (filterStatus === 'completed') return matchesSearch;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium text-lg">Memuat kelas Anda...</p>
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
            <div className="bg-red-50 border border-red-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">🔐</div>
              <h2 className="text-2xl font-bold text-red-800 mb-2">Akses Ditolak</h2>
              <p className="text-red-700 mb-6">{error}</p>
              <button
                onClick={() => {
                  localStorage.removeItem('token');
                  localStorage.removeItem('access-token');
                  window.location.href = '/login';
                }}
                className="bg-red-600 hover:bg-red-700 text-white font-medium py-3 px-8 rounded-lg transition-colors"
              >
                🔑 Login Kembali
              </button>
            </div>
          ) : (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
              <div className="text-6xl mb-4">📚</div>
              <h2 className="text-2xl font-bold text-blue-800 mb-2">Belum Ada Kelas Terdaftar</h2>
              <p className="text-blue-700 mb-8">
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
          )}
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
            Anda telah terdaftar di <span className="font-bold text-secondary">{Array.isArray(data) ? data.length : 0}</span> kelas
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
                <option value="all">Semua Kelas</option>
                <option value="inProgress">Sedang Belajar</option>
                <option value="completed">Selesai</option>
              </select>
            </div>
          </div>
        </div>

        {/* ✅ Empty State */}
        {filteredData.length === 0 && !error ? (
          <div className="text-center py-16 bg-white rounded-lg border-2 border-dashed border-gray-300">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tidak Ada Kelas</h2>
            <p className="text-gray-600 mb-8">
              {searchTerm ? 'Tidak ada hasil pencarian yang cocok' : 'Belum ada kelas terdaftar'}
            </p>
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
              >
                Bersihkan Pencarian
              </button>
            )}
          </div>
        ) : (
          <>
            {/* ✅ Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-blue-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Total Kelas</p>
                    <h3 className="text-3xl font-bold text-gray-800">{data.length}</h3>
                  </div>
                  <FaUsers className="text-4xl text-blue-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-green-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Sedang Belajar</p>
                    <h3 className="text-3xl font-bold text-gray-800">{data.length}</h3>
                  </div>
                  <FaClock className="text-4xl text-green-500 opacity-20" />
                </div>
              </div>

              <div className="bg-white rounded-lg shadow-md p-4 border-l-4 border-purple-500">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-gray-600 text-sm">Rata-rata Rating</p>
                    <h3 className="text-3xl font-bold text-gray-800">4.8⭐</h3>
                  </div>
                  <FaStar className="text-4xl text-purple-500 opacity-20" />
                </div>
              </div>
            </div>

            {/* ✅ Classes Grid */}
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {Array.isArray(filteredData) && filteredData.map((item, index) => {
                const classData = item?.classes || item || {};
                const classId = classData?._id || classData?.id || item?._id;
                const className = classData?.name || 'Unnamed Class';
                const classPrice = classData?.price || 0;
                const instructorName = classData?.instructorName || classData?.instructor?.name || 'Unknown Instructor';
                const classImage = classData?.image || null;
                const rating = classData?.rating || 4.8;
                const students = classData?.totalStudents || 0;

                if (!classId) {
                  console.warn('⚠️ Skipping class without ID at index', index);
                  return null;
                }

                return (
                  <div 
                    key={classId}
                    className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full border border-gray-100 group"
                  >
                    {/* Image Container */}
                    <div className="h-52 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300 relative">
                      {classImage ? (
                        <img 
                          src={classImage} 
                          alt={className} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                          onError={(e) => {
                            e.target.style.display = 'none';
                          }}
                        />
                      ) : (
                        <div className="flex items-center justify-center h-full bg-gradient-to-br from-secondary to-secondary-dark">
                          <span className="text-white text-4xl">📚</span>
                        </div>
                      )}
                      
                      {/* Badge */}
                      <div className="absolute top-3 right-3 flex gap-2">
                        <span className="px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1">
                          <FaCheckCircle className="w-3 h-3" /> Enrolled
                        </span>
                      </div>

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    </div>

                    {/* Content */}
                    <div className="p-5 flex flex-col flex-grow justify-between">
                      <div>
                        <h2 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-secondary transition-colors">
                          {className}
                        </h2>
                        
                        {/* Instructor & Rating */}
                        <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
                          <span className="text-gray-600 text-sm">👨‍🏫 {instructorName}</span>
                          <div className="flex items-center gap-1">
                            <FaStar className="text-yellow-400 w-4 h-4" />
                            <span className="text-sm font-semibold text-gray-700">{rating}</span>
                          </div>
                        </div>

                        {/* Students & Description */}
                        {students > 0 && (
                          <p className="text-xs text-gray-600 mb-2">
                            👥 {students.toLocaleString('id-ID')} peserta belajar
                          </p>
                        )}

                        {classData?.description && (
                          <p className="text-gray-500 text-xs line-clamp-2 mb-3">
                            {classData.description}
                          </p>
                        )}
                      </div>

                      {/* Footer - Price & Button */}
                      <div className="flex justify-between items-center gap-3 pt-3 border-t border-gray-100">
                        <div>
                          <p className="text-xs text-gray-500">Harga</p>
                          <p className="font-bold text-secondary text-lg">
                            Rp{classPrice.toLocaleString('id-ID')}
                          </p>
                        </div>
                        <button
                          onClick={() => handleStartLearning(classId)}
                          className="flex-1 bg-gradient-to-r from-secondary to-secondary-dark hover:from-secondary-dark hover:to-secondary text-white font-semibold py-2 px-4 rounded-lg transition-all duration-200 flex items-center justify-center gap-2 hover:shadow-md"
                        >
                          <FaPlay className="w-4 h-4" />
                          Mulai
                        </button>
                      </div>
                    </div>
                  </div>
                );
              }).filter(Boolean)}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default EnrolledClasses;