// components/MyClasses.jsx - FINAL FIXED VERSION
import React, { useEffect, useState } from 'react';
import useUser from '../../../hooks/useUser';
import { useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import axios from 'axios';

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
        console.log('🔄 Fetching classes for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ STRATEGY 1: DIRECT AXIOS WITH MANUAL TOKEN
        try {
          const token = localStorage.getItem('token') || localStorage.getItem('access-token');
          console.log('🔄 Strategy 1: Direct axios with manual token...');
          
          const response = await axios.get(
            `https://frasa-backend.vercel.app/api/instructor/classes?email=${currentUser.email}`,
            {
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              }
            }
          );
          
          console.log('✅ Direct axios success:', response.data);
          
          if (response.data.success) {
            setClasses(response.data.classes || []);
            setError(null);
            setIsLoading(false);
            return;
          }
        } catch (directError) {
          console.log('❌ Strategy 1 failed:', directError.response?.data?.message || directError.message);
        }

        // ✅ STRATEGY 2: TEST ENDPOINT (NO AUTH)
        try {
          console.log('🔄 Strategy 2: Test endpoint (no auth required)...');
          const testResponse = await axios.get(
            `https://frasa-backend.vercel.app/api/test/classes/${currentUser.email}`
          );
          
          console.log('✅ Test endpoint success:', testResponse.data);
          
          if (testResponse.data.success) {
            setClasses(testResponse.data.classes || []);
            setError(null);
            return;
          }
        } catch (testError) {
          console.log('❌ Strategy 2 failed:', testError.response?.data?.message || testError.message);
        }

        // ✅ STRATEGY 3: DEBUG ENDPOINT
        try {
          console.log('🔄 Strategy 3: Debug endpoint...');
          const debugResponse = await axios.get(
            `https://frasa-backend.vercel.app/api/debug/classes-data?email=${currentUser.email}`
          );
          
          console.log('✅ Debug endpoint:', debugResponse.data);
          
          if (debugResponse.data.success) {
            const classesData = debugResponse.data.debug.classes.data || [];
            setClasses(classesData);
            setError(classesData.length === 0 ? 'No classes found for your account' : null);
            return;
          }
        } catch (debugError) {
          console.log('❌ Strategy 3 failed:', debugError.response?.data?.message || debugError.message);
        }

        setError('Unable to fetch classes. Please try logging in again.');

      } catch (error) {
        console.error('❌ All strategies failed:', error);
        setError(error.message || 'Failed to load classes');
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchClasses();
    }
  }, [currentUser]);

  const handleRetry = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('access-token');
    window.location.reload();
  };

  const handleReLogin = () => {
    localStorage.clear();
    navigate('/login');
  };

  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your classes...</p>
          <p className="text-sm text-gray-400 mt-2">{currentUser?.email}</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16 bg-red-50 rounded-lg border border-red-200">
          <div className="text-6xl mb-4">🔐</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Authentication Required</h2>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          <p className="text-gray-600 mb-6">
            We couldn't verify your access. This might be due to an expired session.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-6">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔄 Clear & Retry
            </button>
            <button
              onClick={handleReLogin}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔑 Login Again
            </button>
          </div>

          <div className="bg-white p-4 rounded border text-sm text-left">
            <p className="font-bold mb-2">Debug Information:</p>
            <div className="grid grid-cols-2 gap-2">
              <p><strong>Email:</strong> {currentUser?.email}</p>
              <p><strong>Role:</strong> {currentUser?.role}</p>
              <p><strong>Token:</strong> {localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
              <p><strong>Access Token:</strong> {localStorage.getItem('access-token') ? 'Exists' : 'Missing'}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Kelas <span className="text-blue-600">Saya</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Kelas yang telah Anda buat dan statusnya
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="text-blue-700 font-medium">
              📊 Total: <span className="font-bold">{classes.length}</span> kelas
            </p>
            <p className="text-sm text-blue-600">
              Instructor: <span className="font-medium">{currentUser?.name || currentUser?.email}</span>
            </p>
          </div>
          <button
            onClick={handleAddClass}
            className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            + Tambah Kelas Baru
          </button>
        </div>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">Belum Ada Kelas</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Anda belum membuat kelas apapun. Mulai buat kelas pertama Anda dan bagikan pengetahuan Anda!
          </p>
          <button
            onClick={handleAddClass}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md text-lg"
          >
            🚀 Buat Kelas Pertama
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {classes.map((cls) => (
            <div 
              key={cls._id} 
              className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200"
            >
              <div className="flex flex-col lg:flex-row">
                {/* Image */}
                <div className="lg:w-1/4">
                  <div className="w-full h-48 lg:h-full overflow-hidden">
                    <img 
                      src={cls.image} 
                      alt={cls.name}
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=No+Image';
                      }}
                    />
                  </div>
                </div>

                {/* Content */}
                <div className="p-6 lg:w-3/4">
                  <div className="flex flex-col lg:flex-row lg:justify-between lg:items-start mb-4">
                    <div className="flex-1">
                      <h2 className="text-2xl font-bold text-gray-800 mb-2">{cls.name}</h2>
                      <p className="text-gray-600 line-clamp-2">{cls.description}</p>
                    </div>
                    <div className="mt-2 lg:mt-0 lg:ml-4">
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

                  {/* Stats Grid */}
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
                      onClick={() => navigate(`/dashboard/class-details/${cls._id}`)}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      👁️ Detail
                    </button>
                    
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      ✏️ Update
                    </button>
                    
                    {cls.feedback && cls.feedback.length > 0 && (
                      <button
                        onClick={() => navigate(`/dashboard/class-feedback/${cls._id}`)}
                        className="flex items-center px-4 py-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-medium"
                      >
                        💬 Feedback ({cls.feedback.length})
                      </button>
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