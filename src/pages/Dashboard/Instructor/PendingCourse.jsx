// components/PendingCourse.jsx - FINAL FIXED VERSION
import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import { useNavigate } from 'react-router-dom';

const PendingCourse = () => {
  const [pendingClasses, setPendingClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPendingClasses = async () => {
      try {
        console.log('🔄 PendingCourse - Fetching for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ GUNAKAN ENDPOINT BARU
        const response = await axiosSecure.get('/api/instructor/pending-classes', {
          params: { email: currentUser.email }
        });
        
        console.log('✅ PendingCourse - API Response:', response.data);
        
        if (response.data.success) {
          setPendingClasses(response.data.classes || []);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch pending classes');
        }
        
      } catch (error) {
        console.error('❌ PendingCourse - Fetch error:', error);
        
        let errorMessage = 'Failed to load pending classes';
        if (error.response?.data?.message) {
          errorMessage = error.response.data.message;
        }
        
        setError(errorMessage);
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchPendingClasses();
    } else {
      setIsLoading(false);
      setError('User not authenticated');
    }
  }, [currentUser, axiosSecure]);

  const handleRetry = () => {
    window.location.reload();
  };

  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading pending classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16 bg-red-50 rounded-lg border border-red-200">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Pending Classes</h2>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleAddClass}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              ➕ Add New Class
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          Pending <span className="text-orange-500">Classes</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Your classes waiting for admin approval
        </p>
      </div>

      {/* Stats */}
      <div className="mb-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="text-orange-700 font-medium">
              📊 Total Pending: <span className="font-bold">{pendingClasses.length}</span> classes
            </p>
            <p className="text-sm text-orange-600">
              These classes are under review by our admin team
            </p>
          </div>
          <button
            onClick={handleAddClass}
            className="mt-2 sm:mt-0 bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            + Add New Class
          </button>
        </div>
      </div>

      {pendingClasses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">🎉</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Pending Classes</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Great! All your classes have been processed. You can create new classes or check your approved classes.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAddClass}
              className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              ➕ Create New Class
            </button>
            <button
              onClick={() => navigate('/dashboard/my-classes')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              📚 View All Classes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pendingClasses.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-orange-200">
              <div className="relative">
                <img 
                  src={cls.image} 
                  alt={cls.name} 
                  className="w-full h-48 object-cover"
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/400x300/4F46E5/FFFFFF?text=No+Image';
                  }}
                />
                <div className="absolute top-4 right-4">
                  <span className="px-3 py-1 bg-orange-500 text-white rounded-full text-sm font-medium">
                    ⏳ Pending
                  </span>
                </div>
              </div>
              <div className="p-6">
                <h3 className="text-xl font-bold text-gray-800 mb-2">{cls.name}</h3>
                <p className="text-gray-600 text-sm mb-4 line-clamp-2">{cls.description}</p>
                
                <div className="space-y-2 mb-4">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Price:</span>
                    <span className="font-semibold">Rp {new Intl.NumberFormat('id-ID').format(cls.price || 0)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Seats:</span>
                    <span className="font-semibold">{cls.availableSeats}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold capitalize">{cls.level}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Category:</span>
                    <span className="font-semibold">{cls.category}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Submitted: {new Date(cls.submitted).toLocaleDateString('id-ID')}
                  </p>
                  <button
                    onClick={() => navigate(`/dashboard/update-class/${cls._id}`)}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                  >
                    Edit
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PendingCourse;