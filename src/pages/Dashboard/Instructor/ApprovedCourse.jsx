import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import { HashLoader } from 'react-spinners';
import { FaEdit, FaEye, FaSearch } from 'react-icons/fa';

// ✅ Utility function untuk convert imgBB URL
const convertImgBBUrl = (url) => {
  if (!url) return url;
  return url.replace('i.ibb.co/', 'i.ibb.co.com/');
};

const ApprovedCourse = () => {
  const [approvedClasses, setApprovedClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchApprovedClasses = async () => {
      try {
        console.log('🔄 ApprovedCourse - Fetching for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        const response = await axiosSecure.get('/instructor/approved-classes', {
          params: { email: currentUser.email }
        });
        
        console.log('✅ ApprovedCourse - API Response:', response.data);
        
        if (response.data.success) {
          let classesData = response.data.data?.classes || [];
          if (!Array.isArray(classesData)) {
            classesData = classesData ? [classesData] : [];
          }
          classesData = classesData.filter(cls => cls && cls._id);
          setApprovedClasses(classesData);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch approved classes');
        }
        
      } catch (error) {
        console.error('❌ ApprovedCourse - Fetch error:', error);
        
        let errorMessage = 'Failed to load approved classes';
        if (error.response?.status === 403) {
          errorMessage = 'Access denied. Please login again.';
        } else if (error.response?.status === 401) {
          errorMessage = 'Session expired. Please login again.';
        } else if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        } else if (error.message) {
          errorMessage = error.message;
        }
        
        setError(errorMessage);
        
        if (retryCount < 2) {
          setTimeout(() => {
            setRetryCount(prev => prev + 1);
          }, 2000);
        }
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchApprovedClasses();
    } else {
      setIsLoading(false);
      setError('User not authenticated');
    }
  }, [currentUser, axiosSecure, retryCount]);

  const handleRetry = () => {
    setRetryCount(0);
    setIsLoading(true);
    setError(null);
  };

  const handleReLogin = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access-token');
    navigate('/login');
  };

  // Calculate stats
  const totalStudents = Array.isArray(approvedClasses)
    ? approvedClasses.reduce((total, cls) => total + (cls.totalEnrolled || 0), 0)
    : 0;
  
  const totalRevenue = Array.isArray(approvedClasses)
    ? approvedClasses.reduce((total, cls) => total + ((cls.price || 0) * (cls.totalEnrolled || 0)), 0)
    : 0;

  // Filter classes
  const filteredClasses = approvedClasses.filter(cls =>
    (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-50">
        <div className="text-center">
          <HashLoader color="#36d7b7" size={50} />
          <p className="text-gray-600 font-medium mt-4">Memuat kelas yang disetujui...</p>
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
          <h1 className='text-4xl font-bold text-gray-800 mb-2'>✅ Kelas Disetujui</h1>
          <p className="text-gray-600 text-lg">
            Kelas Anda yang sudah aktif dan dapat diakses peserta
          </p>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Kelas</p>
                <h3 className="text-3xl font-bold text-green-600 mt-2">
                  {Array.isArray(approvedClasses) ? approvedClasses.length : 0}
                </h3>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">📚</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Peserta</p>
                <h3 className="text-3xl font-bold text-blue-600 mt-2">{totalStudents}</h3>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">👥</span>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-purple-600 mt-2">
                  Rp{totalRevenue.toLocaleString('id-ID')}
                </h3>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-2xl">💰</span>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Search Box */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="relative">
            <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
            <input
              type="text"
              placeholder="Cari nama kelas..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
            />
          </div>
        </div>

        {/* ✅ Empty State */}
        {!Array.isArray(approvedClasses) || approvedClasses.length === 0 || filteredClasses.length === 0 ? (
          <div className="bg-white rounded-lg border-2 border-dashed border-gray-300 p-12 text-center">
            <div className="text-5xl mb-4">🎉</div>
            <h3 className="text-2xl font-bold text-gray-800 mb-2">
              {filteredClasses.length === 0 && approvedClasses.length > 0 
                ? 'Tidak ada hasil pencarian' 
                : 'Belum ada kelas yang disetujui'}
            </h3>
            <p className="text-gray-600 mb-8 max-w-md mx-auto">
              {filteredClasses.length === 0 && approvedClasses.length > 0
                ? 'Coba ubah kata kunci pencarian'
                : 'Kelas Anda masih dalam proses review. Setelah disetujui, kelas akan muncul di sini.'}
            </p>
            <button
              onClick={() => navigate('/dashboard/add-class')}
              className="bg-green-600 hover:bg-green-700 text-white font-bold py-3 px-8 rounded-lg transition"
            >
              ➕ Buat Kelas Baru
            </button>
          </div>
        ) : (
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
            {Array.isArray(filteredClasses) && filteredClasses.map((classItem) => {
              if (!classItem || !classItem._id) return null;

              return (
                <div
                  key={classItem._id}
                  className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-2xl hover:-translate-y-2 flex flex-col h-full border border-green-100 group"
                >
                  {/* Class Image */}
                  {classItem.image && (
                    <div className="h-48 bg-gradient-to-br from-gray-200 to-gray-300 overflow-hidden relative">
                      <img
                        src={convertImgBBUrl(classItem.image)}
                        alt={classItem.name}
                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                        onError={(e) => {
                          e.target.style.display = 'none';
                        }}
                      />
                      
                      {/* Status Badge */}
                      <div className="absolute top-3 right-3 px-3 py-1 bg-green-500 text-white rounded-full text-xs font-semibold flex items-center gap-1 border border-green-600">
                        ✅ Disetujui
                      </div>

                      {/* Student Count */}
                      {classItem.totalEnrolled > 0 && (
                        <div className="absolute top-3 left-3 px-3 py-1 bg-blue-500 text-white rounded-full text-xs font-semibold">
                          👥 {classItem.totalEnrolled} siswa
                        </div>
                      )}

                      {/* Overlay */}
                      <div className="absolute inset-0 bg-black opacity-0 group-hover:opacity-30 transition-opacity duration-300"></div>
                    </div>
                  )}

                  {/* Class Info */}
                  <div className="p-5 flex flex-col flex-grow justify-between">
                    <div>
                      <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 leading-snug group-hover:text-green-600 transition-colors">
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
                        <p className="text-gray-600 text-xs">Kursi</p>
                        <p className="font-bold text-gray-800">{classItem.availableSeats || 0}</p>
                      </div>
                    </div>

                    {/* Additional Info */}
                    <div className="mb-4 pb-3 border-b border-gray-200 text-xs">
                      <div className="flex justify-between mb-1">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-semibold capitalize">{classItem.level || '-'}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-gray-600">Disetujui:</span>
                        <span className="font-semibold">
                          {new Date(classItem.updatedAt || classItem.submitted).toLocaleDateString('id-ID')}
                        </span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2">
                      <button
                        onClick={() => window.open(`/class/${classItem._id}`, '_blank')}
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                      >
                        <FaEye className="w-4 h-4" />
                        Lihat
                      </button>
                      <button
                        onClick={() => navigate(`/dashboard/update-class/${classItem._id}`)}
                        className="flex-1 bg-green-600 hover:bg-green-700 text-white font-bold py-2 px-3 rounded-lg transition text-sm flex items-center justify-center gap-2"
                      >
                        <FaEdit className="w-4 h-4" />
                        Edit
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

export default ApprovedCourse;