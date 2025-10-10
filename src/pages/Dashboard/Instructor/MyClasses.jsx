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
        console.log('🔄 Starting to fetch classes for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ EMERGENCY: ENSURE TOKEN CONSISTENCY
        const accessToken = localStorage.getItem('access-token');
        const mainToken = localStorage.getItem('token');
        
        if (accessToken && !mainToken) {
          console.log('🔄 Copying access-token to token for consistency...');
          localStorage.setItem('token', accessToken);
        }

        // ✅ STRATEGY 1: TRY AUTH ENDPOINT WITH AXIOS SECURE
        try {
          console.log('🔄 Strategy 1: Trying authenticated endpoint...');
          const response = await axiosSecure.get(`/api/instructor/classes?email=${currentUser.email}`);
          console.log('✅ Authenticated endpoint success:', response.data);
          
          if (response.data.success) {
            setClasses(response.data.classes || []);
            setError(null);
            setIsLoading(false);
            return;
          }
        } catch (authError) {
          console.log('❌ Strategy 1 failed:', authError.message);
        }

        // ✅ STRATEGY 2: TRY OLD ENDPOINT
        try {
          console.log('🔄 Strategy 2: Trying old endpoint...');
          const oldResponse = await axiosSecure.get(`/api/classes/${currentUser.email}`);
          console.log('✅ Old endpoint success:', oldResponse.data);
          
          setClasses(oldResponse.data || []);
          setError(null);
        } catch (oldError) {
          console.log('❌ Strategy 2 failed:', oldError.message);
          throw new Error('All authenticated endpoints failed');
        }
        
      } catch (error) {
        console.error('❌ All strategies failed:', error);
        setError(error.message);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [currentUser, axiosSecure]);

  // Debug information
  useEffect(() => {
    console.log('🔍 DEBUG - Current User:', currentUser);
    console.log('🔍 DEBUG - Token exists:', !!localStorage.getItem('token'));
    console.log('🔍 DEBUG - Access-token exists:', !!localStorage.getItem('access-token'));
  }, [currentUser]);

  const handleFeedback = (classId) => {
    navigate(`/dashboard/class-feedback/${classId}`);
  };

  const handleViewDetails = (classId) => {
    navigate(`/dashboard/class-details/${classId}`);
  };

  const handleRetry = () => {
    setError(null);
    setIsLoading(true);
    setTimeout(() => {
      window.location.reload();
    }, 1000);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading your classes...</p>
          <p className="text-sm text-gray-400 mt-2">Checking authentication...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-red-50 rounded-lg border border-red-200">
          <div className="text-2xl font-bold text-red-600 mb-4">Unable to Load Classes</div>
          <p className="text-red-500 mb-2">{error}</p>
          <p className="text-sm text-gray-600 mb-6">
            There seems to be an authentication issue. Please try logging in again.
          </p>
          <div className="space-y-4 mb-6">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded mr-2 transition duration-200"
            >
              Try Again
            </button>
            <button
              onClick={() => navigate('/login')}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition duration-200"
            >
              Re-login
            </button>
          </div>
          <div className="text-xs text-gray-500 bg-white p-3 rounded border">
            <p><strong>Debug Info:</strong></p>
            <p>User: {currentUser?.email || 'Not available'}</p>
            <p>Role: {currentUser?.role || 'Not set'}</p>
            <p>Token: {localStorage.getItem('token') ? 'Exists' : 'Missing'}</p>
            <p>Access-token: {localStorage.getItem('access-token') ? 'Exists' : 'Missing'}</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold">Kelas <span className="text-secondary">Saya</span></h1>
        <p className="text-sm text-gray-500 mt-2">
          Kelas yang telah Anda tambahkan dan statusnya
        </p>
      </div>

      {/* Success Debug Info */}
      <div className="mb-4 p-4 bg-green-50 rounded-lg border border-green-200">
        <p className="text-sm text-green-700">
          <strong>✅ Loaded Successfully:</strong> User: {currentUser?.email} | 
          Role: {currentUser?.role} | 
          Total Classes: {classes.length}
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-2xl font-bold text-gray-500 mb-4">
            📚 Belum Ada Kelas
          </div>
          <p className="text-gray-600 mb-6">
            Anda belum menambahkan kelas apapun. Mulai buat kelas pertama Anda!
          </p>
          <button
            onClick={() => navigate('/dashboard/add-class')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200 shadow-md"
          >
            + Tambah Kelas Baru
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div 
              key={cls._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-gray-200"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/3">
                  <div className="w-full h-48 md:h-full overflow-hidden">
                    <img 
                      src={cls.image} 
                      alt={cls.name} 
                      className="w-full h-full object-cover transition-transform duration-300 hover:scale-105"
                      onError={(e) => {
                        e.target.src = 'https://via.placeholder.com/400x300?text=Gambar+Tidak+Tersedia';
                      }}
                    />
                  </div>
                </div>

                {/* Content Section */}
                <div className="p-6 md:w-2/3">
                  <h2 className="text-2xl font-bold text-gray-800 mb-3">{cls.name}</h2>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                    {/* Class Info */}
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Status:</span>
                        <span className={`font-semibold ${
                          cls.status === "approved" ? "text-green-600" :
                          cls.status === "pending" ? "text-orange-500" :
                          cls.status === "denied" ? "text-red-600" :
                          "text-gray-600"
                        }`}>
                          {cls.status === "approved" ? "Disetujui" : 
                           cls.status === "pending" ? "Menunggu" :
                           cls.status === "denied" ? "Ditolak" :
                           cls.status}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Siswa:</span>
                        <span className="font-medium">{cls.totalEnrolled || 0}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Kuota:</span>
                        <span className="font-medium">{cls.availableSeats}</span>
                      </p>
                    </div>

                    {/* Price & Date */}
                    <div className="space-y-2">
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Harga:</span>
                        <span className="font-medium">
                          Rp {new Intl.NumberFormat('id-ID').format(cls.price || 0)}
                        </span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Level:</span>
                        <span className="font-medium capitalize">{cls.level}</span>
                      </p>
                      <p className="flex items-center">
                        <span className="text-gray-600 w-32">Dibuat:</span>
                        <span className="font-medium text-sm">
                          {cls.submitted ? new Date(cls.submitted).toLocaleDateString('id-ID') : 'N/A'}
                        </span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t">
                    <button
                      onClick={() => handleFeedback(cls._id)}
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm font-medium"
                    >
                      💬 Feedback
                    </button>
                    <button
                      onClick={() => handleViewDetails(cls._id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm font-medium"
                    >
                      👁️ Details
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)} 
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm font-medium"
                    >
                      ✏️ Update
                    </button>
                    {cls.status === 'pending' && (
                      <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-md text-sm font-medium border border-orange-200">
                        ⏳ Menunggu Review
                      </span>
                    )}
                    {cls.status === 'approved' && (
                      <span className="px-3 py-2 bg-green-100 text-green-800 rounded-md text-sm font-medium border border-green-200">
                        ✅ Disetujui
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