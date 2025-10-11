import React from 'react';
import { useNavigate } from 'react-router-dom';

const ErrorBoundary = ({ children }) => {
  const [hasError, setHasError] = React.useState(false);
  const navigate = useNavigate();

  React.useEffect(() => {
    const handleError = (error) => {
      console.error('🚨 Global Error Caught:', error);
      
      if (error?.response?.status === 403) {
        setHasError(true);
        localStorage.removeItem('token');
        navigate('/login');
      }
    };

    // ✅ GLOBAL ERROR HANDLER
    window.addEventListener('unhandledrejection', (event) => {
      handleError(event.reason);
    });

    return () => {
      window.removeEventListener('unhandledrejection', handleError);
    };
  }, [navigate]);

  if (hasError) {
    return (
      <div className="flex justify-center items-center h-screen">
        <div className="text-center p-6 bg-yellow-50 border border-yellow-200 rounded-lg">
          <h2 className="text-xl font-bold text-yellow-600">Session Expired</h2>
          <p className="mt-2 text-yellow-500">Your session has expired. Please login again.</p>
          <button 
            onClick={() => {
              localStorage.removeItem('token');
              navigate('/login');
            }}
            className="mt-4 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return children;
};

export default ErrorBoundary;