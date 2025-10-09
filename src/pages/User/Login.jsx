import React, { useState } from 'react';
import { 
  MdOutlineRemoveRedEye, 
  MdOutlineVisibilityOff,
  MdLockOutline
} from "react-icons/md";
import { FiMail, FiLock } from "react-icons/fi";
import { Link, useLocation, useNavigate } from 'react-router-dom';
import GoogleLogin from '../../components/Social/GoogleLogin';
import useAuth from '../../hooks/useAuth';
import Swal from 'sweetalert2';

// Fallback auth for safety
const fallbackAuth = {
  login: async (email, password) => {
    console.log("🔄 Fallback login called");
    throw new Error("Authentication system is temporarily unavailable");
  },
  user: null,
  loading: false,
  error: null,
  setError: () => {},
  setLoading: () => {}
};

const Login = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isFocused, setIsFocused] = useState({ email: false, password: false });
  const [localError, setLocalError] = useState('');
  const [localLoading, setLocalLoading] = useState(false);
  
  const location = useLocation();
  const navigate = useNavigate();

  // Safe auth with fallback
  let auth;
  try {
    auth = useAuth();
    if (auth._isFallback || typeof auth.login !== 'function') {
      auth = fallbackAuth;
    }
  } catch (error) {
    auth = fallbackAuth;
    setLocalError("Authentication system error");
  }

  const { login, error: authError, setError, loading: authLoading, setLoading } = auth;
  
  // Use local state if auth state is problematic
  const error = authError || localError;
  const loading = (authLoading && typeof authLoading === 'boolean') ? authLoading : localLoading;

  const showSuccessAlert = () => {
    Swal.fire({
      title: 'Login Berhasil! 🎉',
      text: 'Selamat datang kembali di Frasa ID',
      icon: 'success',
      confirmButtonText: 'Lanjutkan',
      confirmButtonColor: '#4f46e5',
      timer: 2000,
    });
  };

  const showErrorAlert = (message) => {
    Swal.fire({
      title: 'Login Gagal! 😢',
      text: message,
      icon: 'error',
      confirmButtonText: 'Coba Lagi',
      confirmButtonColor: '#ef4444',
    });
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLocalError('');
    setError?.('');
    
    try {
      setLocalLoading(true);
      setLoading?.(true);

      const data = new FormData(e.target);
      const formData = Object.fromEntries(data);
      
      console.log("🔄 Login attempt:", formData.email);
      
      // Validate inputs
      if (!formData.email || !formData.password) {
        throw new Error("Email dan password harus diisi");
      }

      await login(formData.email, formData.password);
      showSuccessAlert();
      navigate(location.state?.from || "/dashboard");
      
    } catch (err) {
      console.error("❌ Login error:", err);
      const errorMessage = err.message || "Terjadi kesalahan saat login";
      setLocalError(errorMessage);
      setError?.(errorMessage);
      showErrorAlert(errorMessage);
    } finally {
      setLocalLoading(false);
      setLoading?.(false);
    }
  };

  const handleFocus = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: true }));
  };

  const handleBlur = (field) => {
    setIsFocused(prev => ({ ...prev, [field]: false }));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-8">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-secondary rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <MdLockOutline className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-800 mb-2">
            Selamat Datang Kembali
          </h1>
          <p className="text-gray-600 text-sm">
            Masuk ke akun Anda untuk melanjutkan pembelajaran
          </p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg text-sm mb-6 flex items-center">
              <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Email Input */}
            <div className="space-y-2">
              <label htmlFor="email" className="text-sm font-medium text-gray-700 flex items-center">
                <FiMail className="w-4 h-4 mr-2" />
                Alamat Email
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.email ? 'ring-2 ring-secondary ring-opacity-50' : ''
              } rounded-lg`}>
                <input 
                  type="email" 
                  id="email"
                  name="email" 
                  placeholder="email@contoh.com" 
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-11 pr-4 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors duration-200"
                  required
                  disabled={loading}
                  onFocus={() => handleFocus('email')}
                  onBlur={() => handleBlur('email')}
                />
                <FiMail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              </div>
            </div>

            {/* Password Input */}
            <div className="space-y-2">
              <label htmlFor="password" className="text-sm font-medium text-gray-700 flex items-center">
                <FiLock className="w-4 h-4 mr-2" />
                Kata Sandi
              </label>
              <div className={`relative transition-all duration-200 ${
                isFocused.password ? 'ring-2 ring-secondary ring-opacity-50' : ''
              } rounded-lg`}>
                <input 
                  type={showPassword ? 'text' : 'password'} 
                  id="password"
                  name="password" 
                  placeholder="Masukkan kata sandi"
                  className="w-full border border-gray-300 rounded-lg px-4 py-3 pl-11 pr-12 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-secondary transition-colors duration-200"
                  required
                  disabled={loading}
                  onFocus={() => handleFocus('password')}
                  onBlur={() => handleBlur('password')}
                />
                <FiLock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors duration-200"
                  disabled={loading}
                >
                  {showPassword ? (
                    <MdOutlineVisibilityOff className="h-5 w-5" />
                  ) : (
                    <MdOutlineRemoveRedEye className="h-5 w-5" />
                  )}
                </button>
              </div>
              <div className="flex justify-end">
                <Link 
                  to="/forgot-password" 
                  className="text-sm text-secondary hover:text-secondary-dark transition-colors duration-200"
                >
                  Lupa kata sandi?
                </Link>
              </div>
            </div>

            {/* Submit Button */}
            <button 
              type="submit" 
              disabled={loading}
              className={`w-full bg-gradient-to-r from-secondary to-secondary-dark text-white py-3 px-4 rounded-lg font-medium transition-all duration-200 ${
                loading 
                  ? 'opacity-70 cursor-not-allowed' 
                  : 'hover:shadow-lg hover:from-secondary-dark hover:to-secondary'
              } flex items-center justify-center space-x-2`}
            >
              {loading ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>Sedang masuk...</span>
                </>
              ) : (
                <span>Masuk ke Akun</span>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="my-6 flex items-center">
            <div className="flex-1 border-t border-gray-200" />
            <span className="px-3 text-sm text-gray-500">atau</span>
            <div className="flex-1 border-t border-gray-200" />
          </div>

          {/* Google Login */}
          <GoogleLogin text="Lanjutkan dengan Google" />

          {/* Sign Up Link */}
          <div className="text-center mt-6 pt-6 border-t border-gray-100">
            <p className="text-sm text-gray-600">
              Belum punya akun?{' '}
              <Link 
                to="/register" 
                className="font-medium text-secondary hover:text-secondary-dark transition-colors duration-200"
              >
                Daftar sekarang
              </Link>
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6">
          <p className="text-xs text-gray-500">
            © 2024 Frasa ID. All rights reserved.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;