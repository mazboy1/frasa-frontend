// components/MyClasses.jsx - ULTRA SAFE VERSION
import React from 'react';
import { useNavigate } from 'react-router-dom';

const MyClasses = () => {
  const navigate = useNavigate();

  // ✅ DIRECT SIMPLE FUNCTIONS - No hooks, no state
  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  const handleReload = () => {
    window.location.reload();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">My Classes</h1>
          <p className="text-gray-600">Class Management</p>
        </div>

        {/* Status Card */}
        <div className="max-w-2xl mx-auto bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
          <div className="flex items-center">
            <div className="text-2xl mr-4">🔧</div>
            <div>
              <h3 className="text-lg font-semibold text-blue-800">
                System Maintenance
              </h3>
              <p className="text-blue-700">
                We're improving the class loading system. You can still create new classes.
              </p>
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="max-w-md mx-auto space-y-4">
          <button
            onClick={handleAddClass}
            className="w-full bg-blue-500 hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            + Create New Class
          </button>
          
          <button
            onClick={handleReload}
            className="w-full bg-gray-500 hover:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition duration-200"
          >
            🔄 Refresh Page
          </button>
        </div>

        {/* Manual Check */}
        <div className="max-w-2xl mx-auto mt-8 bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold mb-4">Database Check</h3>
          <button
            onClick={() => {
              fetch('https://frasa-backend.vercel.app/api/test/classes/regza@gmail.com')
                .then(r => r.json())
                .then(data => {
                  if (data.success) {
                    alert(`Found ${data.classes?.length || 0} classes in database`);
                  } else {
                    alert('No classes found');
                  }
                })
                .catch(err => alert('Check failed: ' + err.message));
            }}
            className="bg-green-500 hover:bg-green-600 text-white px-4 py-2 rounded"
          >
            Check Database
          </button>
        </div>

      </div>
    </div>
  );
};

export default MyClasses;