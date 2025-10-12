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
        console.log('🔄 MyClasses - Starting fetch for:', currentUser?.email);
        
        if (!currentUser?.email) {
          setError('User email not available');
          setIsLoading(false);
          return;
        }

        // ✅ GUNAKAN ENDPOINT BARU YANG FIXED
        const response = await axiosSecure.get('/api/instructor/my-classes', {
          params: { email: currentUser.email }
        });
        
        console.log('✅ MyClasses - API Response:', response.data);
        
        if (response.data.success) {
          setClasses(response.data.classes || []);
          setError(null);
        } else {
          setError(response.data.message || 'Failed to fetch classes');
        }
        
      } catch (error) {
        console.error('❌ MyClasses - Fetch error:', error);
        
        let errorMessage = 'Failed to load classes';
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
      } finally {
        setIsLoading(false);
      }
    };

    if (currentUser?.email) {
      fetchClasses();
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

  // Hitung statistik
  const stats = {
    total: classes.length,
    approved: classes.filter(c => c.status === 'approved').length,
    pending: classes.filter(c => c.status === 'pending').length,
    rejected: classes.filter(c => c.status === 'rejected').length
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading your classes...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16 bg-red-50 rounded-lg border border-red-200">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Classes</h2>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔄 Try Again
            </button>
            <button
              onClick={() => navigate('/dashboard/add-class')}
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
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold text-gray-800">
          My <span className="text-blue-600">Classes</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Manage all your created classes
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Classes</p>
              <p className="text-2xl font-bold text-gray-800">{stats.total}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">✅</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved</p>
              <p className="text-2xl font-bold text-gray-800">{stats.approved}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-yellow-500">
          <div className="flex items-center">
            <div className="bg-yellow-100 p-3 rounded-full">
              <span className="text-yellow-600 text-xl">⏳</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-gray-800">{stats.pending}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-red-500">
          <div className="flex items-center">
            <div className="bg-red-100 p-3 rounded-full">
              <span className="text-red-600 text-xl">❌</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Rejected</p>
              <p className="text-2xl font-bold text-gray-800">{stats.rejected}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-200">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="text-blue-700 font-medium">
              Instructor: <span className="font-bold">{currentUser?.name}</span>
            </p>
            <p className="text-sm text-blue-600">
              Email: {currentUser?.email}
            </p>
          </div>
          <button
            onClick={handleAddClass}
            className="mt-2 sm:mt-0 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-200 flex items-center"
          >
            <span className="mr-2">+</span> Add New Class
          </button>
        </div>
      </div>

      {/* Classes List */}
      {classes.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Classes Found</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            You haven't created any classes yet. Start by creating your first class and share your knowledge with students!
          </p>
          <button
            onClick={handleAddClass}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-8 rounded-lg transition duration-200 shadow-md text-lg"
          >
            🚀 Create Your First Class
          </button>
        </div>
      ) : (
        <div className="grid gap-6">
          {classes.map((cls) => (
            <div key={cls._id} className="bg-white rounded-xl shadow-md overflow-hidden hover:shadow-lg transition-all duration-300 border border-gray-200">
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
                        cls.status === "rejected" ? "bg-red-100 text-red-800" :
                        "bg-gray-100 text-gray-800"
                      }`}>
                        {cls.status === "approved" ? "✅ Approved" : 
                         cls.status === "pending" ? "⏳ Pending" :
                         cls.status === "rejected" ? "❌ Rejected" :
                         cls.status}
                      </span>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Students:</span>
                        <span className="font-semibold">{cls.totalEnrolled || 0}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Available Seats:</span>
                        <span className="font-semibold">{cls.availableSeats || 0}</span>
                      </p>
                    </div>
                    
                    <div className="space-y-2">
                      <p className="flex justify-between">
                        <span className="text-gray-600">Price:</span>
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
                        <span className="text-gray-600">Category:</span>
                        <span className="font-semibold">{cls.category}</span>
                      </p>
                      <p className="flex justify-between">
                        <span className="text-gray-600">Duration:</span>
                        <span className="font-semibold">{cls.totalDuration}</span>
                      </p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex flex-wrap gap-3 pt-4 border-t border-gray-200">
                    <button
                      onClick={() => window.open(`/class/${cls._id}`, '_blank')}
                      className="flex items-center px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors font-medium"
                    >
                      👁️ View Details
                    </button>
                    
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)}
                      className="flex items-center px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors font-medium"
                    >
                      ✏️ Update
                    </button>
                    
                    {cls.status === 'pending' && (
                      <span className="flex items-center px-4 py-2 bg-yellow-100 text-yellow-800 rounded-lg text-sm font-medium">
                        ⏳ Waiting Approval
                      </span>
                    )}
                    
                    {cls.status === 'approved' && cls.totalEnrolled > 0 && (
                      <span className="flex items-center px-4 py-2 bg-purple-100 text-purple-800 rounded-lg text-sm font-medium">
                        👥 {cls.totalEnrolled} Students
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