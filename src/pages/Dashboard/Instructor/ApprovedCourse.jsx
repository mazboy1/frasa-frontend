// components/ApprovedCourse.jsx - FINAL COMPLETE FIXED VERSION
import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import { useNavigate } from 'react-router-dom';

const ApprovedCourse = () => {
  const [approvedClasses, setApprovedClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retryCount, setRetryCount] = useState(0);
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

        // ✅ GUNAKAN ENDPOINT BARU
        const response = await axiosSecure.get('/api/instructor/approved-classes', {
          params: { email: currentUser.email }
        });
        
        console.log('✅ ApprovedCourse - API Response:', response.data);
        
        if (response.data.success) {
          setApprovedClasses(response.data.data.classes || []);
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
        
        // Auto-retry
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

  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  // Hitung total students dan revenue
  const totalStudents = approvedClasses.reduce((total, cls) => total + (cls.totalEnrolled || 0), 0);
  const totalRevenue = approvedClasses.reduce((total, cls) => total + (cls.price * (cls.totalEnrolled || 0)), 0);

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-green-500 mx-auto mb-4"></div>
          <p className="text-gray-600 text-lg">Loading approved classes...</p>
          {retryCount > 0 && (
            <p className="text-sm text-gray-500 mt-2">Retrying... ({retryCount}/2)</p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center py-16 bg-red-50 rounded-lg border border-red-200">
          <div className="text-6xl mb-4">❌</div>
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error Loading Approved Classes</h2>
          <p className="text-red-500 mb-2 font-medium">{error}</p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleRetry}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔄 Try Again
            </button>
            <button
              onClick={handleReLogin}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              🔑 Login Again
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
          Approved <span className="text-green-600">Classes</span>
        </h1>
        <p className="text-gray-600 mt-2">
          Your classes that are live and available for students
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-green-500">
          <div className="flex items-center">
            <div className="bg-green-100 p-3 rounded-full">
              <span className="text-green-600 text-xl">📚</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Approved Classes</p>
              <p className="text-2xl font-bold text-gray-800">{approvedClasses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-blue-500">
          <div className="flex items-center">
            <div className="bg-blue-100 p-3 rounded-full">
              <span className="text-blue-600 text-xl">👥</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Students</p>
              <p className="text-2xl font-bold text-gray-800">{totalStudents}</p>
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
          <div className="flex items-center">
            <div className="bg-purple-100 p-3 rounded-full">
              <span className="text-purple-600 text-xl">💰</span>
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Total Revenue</p>
              <p className="text-2xl font-bold text-gray-800">Rp {new Intl.NumberFormat('id-ID').format(totalRevenue)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Bar */}
      <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
        <div className="flex flex-col sm:flex-row justify-between items-center">
          <div>
            <p className="text-green-700 font-medium">
              🎉 Your approved classes are live and available for students to enroll!
            </p>
            <p className="text-sm text-green-600">
              Monitor your class performance and student engagement
            </p>
          </div>
          <button
            onClick={handleAddClass}
            className="mt-2 sm:mt-0 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            + Create Another Class
          </button>
        </div>
      </div>

      {approvedClasses.length === 0 ? (
        <div className="text-center py-16 bg-gray-50 rounded-lg border border-gray-200">
          <div className="text-6xl mb-4">📚</div>
          <h3 className="text-2xl font-bold text-gray-600 mb-4">No Approved Classes Yet</h3>
          <p className="text-gray-500 mb-8 max-w-md mx-auto">
            Your classes are still under review or waiting for approval. Once approved, they will appear here and be available for students.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <button
              onClick={handleAddClass}
              className="bg-green-500 hover:bg-green-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              ➕ Create New Class
            </button>
            <button
              onClick={() => navigate('/dashboard/my-classes')}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-6 rounded-lg transition duration-200"
            >
              📋 View All Classes
            </button>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {approvedClasses.map((cls) => (
            <div key={cls._id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-200 border border-green-200">
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
                  <span className="px-3 py-1 bg-green-500 text-white rounded-full text-sm font-medium">
                    ✅ Approved
                  </span>
                </div>
                {cls.totalEnrolled > 0 && (
                  <div className="absolute top-4 left-4">
                    <span className="px-3 py-1 bg-blue-500 text-white rounded-full text-sm font-medium">
                      👥 {cls.totalEnrolled} Students
                    </span>
                  </div>
                )}
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
                    <span className="text-gray-600">Enrolled:</span>
                    <span className="font-semibold">{cls.totalEnrolled || 0} students</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Available:</span>
                    <span className="font-semibold">{cls.availableSeats} seats</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Level:</span>
                    <span className="font-semibold capitalize">{cls.level}</span>
                  </div>
                </div>
                
                <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-500">
                    Approved: {new Date(cls.updatedAt || cls.submitted).toLocaleDateString('id-ID')}
                  </p>
                  <div className="flex gap-2">
                    <button
                      onClick={() => window.open(`/class/${cls._id}`, '_blank')}
                      className="px-3 py-1 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors text-sm"
                    >
                      View
                    </button>
                    <button
                      onClick={() => navigate(`/dashboard/update-class/${cls._id}`)}
                      className="px-3 py-1 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors text-sm"
                    >
                      Edit
                    </button>
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

export default ApprovedCourse;