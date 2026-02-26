// /src/components/DebugRole.jsx - BUAT FILE BARU INI
import React from 'react';
import useUser from '../hooks/useUser';
import useAuth from '../hooks/useAuth';

const DebugRole = () => {
  const { currentUser, isLoading } = useUser();
  const { user: authUser } = useAuth();

  if (isLoading) return null;

  // Hanya tampil di development
  if (process.env.NODE_ENV !== 'development') return null;

  return (
    <div className="fixed bottom-4 right-4 bg-black text-white p-4 rounded-lg shadow-lg z-50 text-xs opacity-80 max-w-xs">
      <h3 className="font-bold mb-2 border-b border-gray-700 pb-1">🔍 Debug Info</h3>
      <div className="space-y-1">
        <p><span className="text-gray-400">Auth Email:</span> {authUser?.email || 'null'}</p>
        <p><span className="text-gray-400">User Email:</span> {currentUser?.email || 'null'}</p>
        <p>
          <span className="text-gray-400">User Role:</span>{' '}
          <span className={`font-bold ${
            currentUser?.role === 'admin' ? 'text-red-400' :
            currentUser?.role === 'instructor' ? 'text-blue-400' :
            'text-green-400'
          }`}>
            {currentUser?.role || 'null'}
          </span>
        </p>
        <p><span className="text-gray-400">User Name:</span> {currentUser?.name || 'null'}</p>
        <p><span className="text-gray-400">From DB:</span> {currentUser?.isFromAuth ? '❌ No (using fallback)' : '✅ Yes'}</p>
        <div className="flex gap-2 mt-2 pt-2 border-t border-gray-700">
          <button 
            onClick={() => window.location.reload()}
            className="bg-blue-600 px-2 py-1 rounded text-white text-xs hover:bg-blue-700"
          >
            🔄 Refresh
          </button>
          <button 
            onClick={() => {
              localStorage.clear();
              window.location.href = '/login';
            }}
            className="bg-red-600 px-2 py-1 rounded text-white text-xs hover:bg-red-700"
          >
            🚪 Logout
          </button>
        </div>
      </div>
    </div>
  );
};

export default DebugRole;