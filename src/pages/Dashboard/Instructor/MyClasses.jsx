// components/MyClasses.jsx - FINAL FIXED VERSION
import React, { useEffect, useState } from 'react';
import useUser from '../../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUser();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('🔄 Starting to fetch classes for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ FIX 1: TOKEN CONSISTENCY CHECK
        const accessToken = localStorage.getItem('access-token');
        const mainToken = localStorage.getItem('token');
        
        console.log('🔐 Token Debug:', {
          accessToken: accessToken ? 'Exists' : 'Missing',
          mainToken: mainToken ? 'Exists' : 'Missing',
          userEmail: currentUser.email,
          userRole: currentUser.role
        });

        // ✅ FIX 2: STRATEGY 1 - NEW AUTH ENDPOINT
        try {
          console.log('🔄 Strategy 1: Trying /api/instructor/classes...');
          const response = await axiosSecure.get(`/api/instructor/classes?email=${currentUser.email}`);
          console.log('✅ Authenticated endpoint response:', response.data);
          
          if (response.data.success && response.data.classes) {
            setClasses(response.data.classes);
            setError(null);
            setIsLoading(false);
            return;
          }
        } catch (authError) {
          console.log('❌ Strategy 1 failed:', authError.response?.data || authError.message);
        }

        // ✅ FIX 3: STRATEGY 2 - OLD ENDPOINT  
        try {
          console.log('🔄 Strategy 2: Trying /api/classes/:email...');
          const oldResponse = await axiosSecure.get(`/api/classes/${currentUser.email}`);
          console.log('✅ Old endpoint response:', oldResponse.data);
          
          setClasses(oldResponse.data || []);
          setError(null);
        } catch (oldError) {
          console.log('❌ Strategy 2 failed:', oldError.response?.data || oldError.message);
        }

        // ✅ FIX 4: STRATEGY 3 - TEST ENDPOINT (NO AUTH)
        try {
          console.log('🔄 Strategy 3: Trying test endpoint...');
          const testResponse = await axiosSecure.get(`/api/test/classes/${currentUser.email}`);
          console.log('✅ Test endpoint response:', testResponse.data);
          
          if (testResponse.data.success) {
            setClasses(testResponse.data.classes || []);
            setError(null);
            return;
          }
        } catch (testError) {
          console.log('❌ Strategy 3 failed:', testError.response?.data || testError.message);
        }

        // ✅ FIX 5: STRATEGY 4 - DEBUG ENDPOINT
        try {
          console.log('🔄 Strategy 4: Trying debug endpoint...');
          const debugResponse = await axiosSecure.get(`/api/debug/classes-data?email=${currentUser.email}`);
          console.log('✅ Debug endpoint response:', debugResponse.data);
          
          if (debugResponse.data.success) {
            setClasses(debugResponse.data.debug.classes.data || []);
            setError(null);
            return;
          }
        } catch (debugError) {
          console.log('❌ Strategy 4 failed:', debugError.response?.data || debugError.message);
        }

        // Jika semua gagal
        throw new Error('All endpoints failed to fetch classes');

      } catch (error) {
        console.error('❌ All strategies failed:', error);
        setError(error.message || 'Failed to load classes');
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchClasses();
    }
  }, [currentUser, axiosSecure]);

  // ✅ COMPREHENSIVE DEBUG INFO
  useEffect(() => {
    console.log('🔍 COMPREHENSIVE DEBUG INFO:');
    console.log('Current User:', currentUser);
    console.log('User Role:', currentUser?.role);
    console.log('User Email:', currentUser?.email);
    console.log('Token exists:', !!localStorage.getItem('token'));
    console.log('Access-token exists:', !!localStorage.getItem('access-token'));
    console.log('Classes loaded:', classes.length);
    console.log('Loading state:', isLoading);
    console.log('Error state:', error);
    console.log('-------------------');
  }, [currentUser, classes, isLoading, error]);

  const handleFeedback = (classId) => {
    navigate(`/dashboard/class-feedback/${classId}`);
  };

  const handleViewDetails = (classId) => {
    navigate(`/dashboard/class-details/${classId}`);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    // Refresh setelah 1 detik
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  const handleManualCheck = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Test endpoint langsung
      const response = await fetch(`https://frasa-backend.vercel.app/api/test/classes/${currentUser.email}`);
      const data = await response.json();
      
      console.log('🔧 Manual check result:', data);
      
      if (data.success) {
        setClasses(data.classes || []);
      } else {
        setError(data.message || 'Manual check failed');
      }
    } catch (err) {
      setError('Manual check error: ' + err.message);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your classes...</p>
          <p className="text-sm text-gray-400 mt-2">
            Checking database for instructor: {currentUser?.email}
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600 mb-4">
            ❌ Unable to Load Classes
          </div>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          <p className="text-sm text-gray-600 mb-6 max-w-2xl mx-auto">
            There seems to be an issue fetching your classes from the database. 
            This could be due to authentication problems or no classes found for your account.
          </p>
          
          <div className="space-y-4 mb-8">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg mr-3 transition duration-200 shadow-md"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleManualCheck}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg mr-3 transition duration-200 shadow-md"
            >
              🔧 Manual Check
            </button>
            <button
              onClick={() => navigate('/dashboard/add-class')}
              className="bg-purple-500 hover:bg-purple-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md"
            >
              ➕ Add First Class
            </button>
          </div>

          {/* Enhanced Debug Info */}
          <div className="text-xs text-gray-600 bg-white p-4 rounded border max-w-2xl mx-auto text-left">
            <p className="font-bold mb-2">🔧 Debug Information:</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
              <p><strong>User Email:</strong> {currentUser?.email || 'Not available'}</p>
              <p><strong>User Role:</strong> {currentUser?.role || 'Not set'}</p>
              <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
              <p><strong>Access-token:</strong> {localStorage.getItem('access-token') ? 'Exists' : 'Missing'}</p>
              <p><strong>Classes Found:</strong> {classes.length}</p>
              <p><strong>API Base:</strong> https://frasa-backend.vercel.app</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Kelas <span className="text-blue-600">Saya</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Kelas yang telah Anda buat dan statusnya
        </p>
      </div>

      {/* Success Stats */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex flex-wrap items-center justify-between">
          <div>
            <p className="text-green-700 font-medium">
              ✅ Berhasil memuat {classes.length} kelas
            </p>
            <p className="text-sm text-green-600">
              Instructor: {currentUser?.name || currentUser?.email}
            </p>
          </div>
          <button
            onClick={() => navigate('/dashboard/add-class')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition duration-200"
          >
            + Tambah Kelas Baru
          </button>
        </div>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <div className="text-2xl font-bold text-gray-600 mb-4">
            Belum Ada Kelas
          </div>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Anda belum membuat kelas apapun. Mulai buat kelas pertama Anda dan bagikan pengetahuan Anda!
          </p>
          <button
            onClick={() => navigate('/dashboard/add-class')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md text-lg"
          >
            🚀 Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div 
              key={cls._id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image Section */}
                <div className="lg:w-1/4">
                  <div className="w-full h-48 lg:h-full overflow-hidden">
                    <img 
                      src={cls.image} 
                      alt={cls.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=Gambar+Tidak+Tersedia';
                      }}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 lg:w-3/4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div>
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{cls.name}</h2>
                      <p className="text-gray-600 line-clamp-2">{cls.description}</p>
                    </div>
                    <div className="mt-2 lg:mt-0">
                      <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                        cls.status === "approved" ? "bg-green-100 text-green-800" :
                        cls.status === "pending" ? "bg-yellow-100 text-yellow-800" :
                        cls.status === "denied" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {cls.status === "approved" ? "✅ Disetujui" : 
                         cls.status === "pending" ? "⏳ Menunggu" :
                         cls.status === "denied" ? "❌ Ditolak" :
                         cls.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Siswa:</span>
                        <span className="font-semibold">{cls.totalEnrolled || 0}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Kuota:</span>
                        <span className="font-semibold">{cls.availableSeats || 0}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Harga:</span>
                        <span className="font-semibold">
                          Rp {new Intl.NumberFormat('id-ID').format(cls.price || 0)}
                        </span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Level:</span>
                        <span className="font-semibold capitalize">{cls.level}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Kategori:</span>
                        <span className="font-semibold">{cls.category}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Durasi:</span>
                        <span className="font-semibold">{cls.totalDuration}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => handleViewDetails(cls._id)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      👁️ Detail Kelas
                    </button>
                    
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      ✏️ Update Kelas
                    </button>
                    
                    {cls.feedback && cls.feedback.length > 0 && (
                      <button
                        onClick={() => handleFeedback(cls._id)}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        💬 Feedback ({cls.feedback.length})
                      </button>
                    )}
                    
                    {cls.status === 'approved' && (
                      <span className="flex items-center px-3 py-2 bg-green-100 text-green-800 rounded-lg font-medium border border-green-200">
                        ✅ Live
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClasses;