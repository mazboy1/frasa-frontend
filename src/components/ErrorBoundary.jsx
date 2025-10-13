// components/ErrorBoundary.jsx - ENHANCED VERSION
import React from 'react';
import { useNavigate, useRouteError } from 'react-router-dom';

const ErrorBoundary = () => {
  const error = useRouteError();
  const navigate = useNavigate();

  console.error('🚨 Error Boundary Caught:', error);

  const handleReset = () => {
    // Clear problematic data
    localStorage.removeItem('problematic-data');
    sessionStorage.clear();
    window.location.reload();
  };

  const handleGoHome = () => {
    navigate('/');
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="max-w-md w-full bg-white p-8 rounded-lg shadow-md text-center">
        <div className="text-6xl mb-4">😵</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-4">Oops! Something went wrong</h1>
        
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6 text-left">
          <p className="text-red-800 font-medium mb-2">Error Details:</p>
          <p className="text-red-600 text-sm">
            {error?.message || 'Unknown error occurred'}
          </p>
          {error?.stack && (
            <details className="mt-2">
              <summary className="text-red-600 text-sm cursor-pointer">Technical Details</summary>
              <pre className="text-xs text-red-500 mt-2 overflow-auto">
                {error.stack}
              </pre>
            </details>
          )}
        </div>

        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <button
            onClick={() => window.location.reload()}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            🔄 Reload Page
          </button>
          <button
            onClick={handleReset}
            className="bg-orange-500 hover:bg-orange-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            🧹 Clear & Reset
          </button>
          <button
            onClick={handleGoHome}
            className="bg-gray-500 hover:bg-gray-600 text-white font-bold py-2 px-6 rounded transition duration-200"
          >
            🏠 Go Home
          </button>
        </div>

        <p className="text-xs text-gray-500 mt-6">
          If the problem persists, please contact support.
        </p>
      </div>
    </div>
  );
};

export default ErrorBoundary;