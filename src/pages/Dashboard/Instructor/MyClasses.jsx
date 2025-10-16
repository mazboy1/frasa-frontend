// components/MyClasses.jsx - MINIMAL WORKING VERSION
import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const MyClasses = () => {
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  // ✅ SAFE USER DATA EXTRACTION
  const getCurrentUser = () => {
    try {
      const userData = JSON.parse(localStorage.getItem('user') || '{}');
      return {
        email: userData?.email || 'regza@gmail.com',
        name: userData?.name || 'Instructor',
        role: userData?.role || 'instructor'
      };
    } catch {
      return { email: 'regza@gmail.com', name: 'Instructor', role: 'instructor' };
    }
  };

  const currentUser = getCurrentUser();

  useEffect(() => {
    const fetchClasses = async () => {
      try {
        console.log('🔍 Fetching classes for:', currentUser.email);
        
        // ✅ USE ONLY PUBLIC ENDPOINT
        const response = await fetch(
          `https://frasa-backend.vercel.app/api/test/classes/${currentUser.email}`
        );
        
        if (response.ok) {
          const data = await response.json();
          console.log('✅ Classes data:', data);
          setClasses(data.classes || []);
        } else {
          console.log('❌ API error:', response.status);
          setClasses([]);
        }
      } catch (error) {
        console.error('❌ Fetch error:', error);
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchClasses();
  }, [currentUser.email]);

  if (isLoading) {
    return <div className="p-8 text-center">Loading classes...</div>;
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">My Classes</h1>
      
      <div className="mb-6">
        <button 
          onClick={() => navigate('/dashboard/add-class')}
          className="bg-blue-500 text-white px-4 py-2 rounded"
        >
          + Add New Class
        </button>
      </div>

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-gray-100 rounded-lg">
          <p className="text-gray-600">No classes found.</p>
          <p className="text-sm text-gray-500 mt-2">
            Create your first class to get started.
          </p>
        </div>
      ) : (
        <div className="grid gap-4">
          {classes.map((cls, index) => (
            <div key={index} className="border rounded-lg p-4 bg-white">
              <h3 className="font-bold text-lg">{cls.name}</h3>
              <p className="text-gray-600">Status: {cls.status}</p>
              <p className="text-gray-600">Students: {cls.totalEnrolled || 0}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyClasses;