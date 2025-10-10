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
        console.log('🔄 Fetching classes for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ COBA ENDPOINT BARU PERTAMA
        try {
          const response = await axiosSecure.get(`/api/instructor/classes?email=${currentUser.email}`);
          console.log('✅ New endpoint response:', response.data);
          
          if (response.data.success) {
            setClasses(response.data.classes || []);
            setError(null);
          } else {
            throw new Error(response.data.message || 'Failed to fetch classes');
          }
        } catch (newEndpointError) {
          console.log('❌ New endpoint failed, trying old endpoint...');
          
          // ✅ FALLBACK KE ENDPOINT LAMA
          const fallbackResponse = await axiosSecure.get(`/api/classes/${currentUser.email}`);
          console.log('✅ Old endpoint response:', fallbackResponse.data);
          
          setClasses(fallbackResponse.data || []);
          setError(null);
        }
        
      } catch (error) {
        console.error('❌ All endpoints failed:', error);
        setError(error.message);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [currentUser, axiosSecure]);

  const handleFeedback = (classId) => {
    navigate(`/dashboard/class-feedback/${classId}`);
  };

  const handleViewDetails = (classId) => {
    navigate(`/dashboard/class-details/${classId}`);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center py-20 bg-red-50 rounded-lg">
          <div className="text-2xl font-bold text-red-600 mb-4">Error</div>
          <p className="text-red-500 mb-6">{error}</p>
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded"
          >
            Try Again
          </button>
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

      {/* Debug Info */}
      <div className="mb-4 p-4 bg-blue-50 rounded-lg">
        <p className="text-sm text-blue-700">
          <strong>Debug Info:</strong> User: {currentUser?.email} | 
          Role: {currentUser?.role} | 
          Total Classes: {classes.length}
        </p>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-20 bg-gray-50 rounded-lg">
          <div className="text-2xl font-bold text-gray-500 mb-4">
            📚 Belum Ada Kelas
          </div>
          <p className="text-gray-600 mb-6">
            Anda belum menambahkan kelas apapun. Mulai buat kelas pertama Anda!
          </p>
          <button
            onClick={() => navigate('/dashboard/add-class')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
          >
            + Tambah Kelas Baru
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {classes.map((cls) => (
            <div 
              key={cls._id} 
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border"
            >
              <div className="flex flex-col md:flex-row">
                {/* Image Section */}
                <div className="md:w-1/3">
                  <div className="w-full h-48 md:h-full overflow-hidden">
                    <img 
                      src={cls.image} 
                      alt={cls.name} 
                      className="w-full h-full object-cover"
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
                      className="px-4 py-2 bg-orange-500 text-white rounded-md hover:bg-orange-600 transition-colors text-sm"
                    >
                      💬 Feedback
                    </button>
                    <button
                      onClick={() => handleViewDetails(cls._id)}
                      className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      👁️ Details
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)} 
                      className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      ✏️ Update
                    </button>
                    {cls.status === 'pending' && (
                      <span className="px-3 py-2 bg-orange-100 text-orange-800 rounded-md text-sm">
                        ⏳ Menunggu Review
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