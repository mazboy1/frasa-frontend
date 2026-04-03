import React, { createContext, useEffect, useState } from 'react';
import { app } from '../../config/firebase.init';
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  updateProfile,
  signOut,
  GoogleAuthProvider,
  signInWithPopup,
  onAuthStateChanged,
} from "firebase/auth";
import axios from 'axios';

export const AuthContext = createContext(null);

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [authInitialized, setAuthInitialized] = useState(false); // ✅ NEW: Track if Firebase auth is initialized

  const auth = getAuth(app);

  const signUp = async (email, password) => {
    try {
      setLoading(true);
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  const login = async (email, password) => {
    try {
      setLoading(true);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      localStorage.removeItem('token');
      localStorage.removeItem('access-token');
      setUser(null);
      setLoading(false);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  const updateUser = async (name, photo) => {
    try {
      await updateProfile(auth.currentUser, {
        displayName: name,
        photoURL: photo,
      });
      setUser(auth.currentUser);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  const googleProvider = new GoogleAuthProvider();
  const googleLogin = async () => {
    try {
      setLoading(true);
      return await signInWithPopup(auth, googleProvider);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      console.log('🔐 onAuthStateChanged triggered - currentUser:', currentUser?.email);
      
      try {
        if (currentUser) {
          console.log('✅ Firebase user authenticated:', currentUser.email);
          setUser(currentUser);

          const displayName = currentUser.displayName || currentUser.email.split('@')[0] || 'User';
          
          console.log('📤 Calling /api/set-token dengan email:', currentUser.email);

          // ✅ FIX: Add timeout dan better error handling
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 8000); // 8 second timeout

          try {
            const response = await axios.post(
              "https://frasa-backend.vercel.app/api/set-token",
              {
                email: currentUser.email,
                name: displayName
              },
              {
                signal: controller.signal,
                timeout: 8000
              }
            );

            clearTimeout(timeoutId);
            console.log('✅ Response dari /api/set-token:', response.data);
            
            const token = response.data?.token;
            
            if (token) {
              localStorage.setItem('access-token', token);
              localStorage.setItem('token', token);
              console.log('✅ Token berhasil disimpan ke localStorage');
              setError("");
            } else {
              console.error('❌ Token tidak ditemukan di response:', response.data);
              setError("Token tidak ditemukan dari server");
            }
          } catch (tokenError) {
            clearTimeout(timeoutId);
            console.error('❌ Token API Error:', tokenError.response?.data || tokenError.message);
            
            // ✅ FIX: Don't fail completely - use Firebase user as fallback
            if (tokenError.code === 'ECONNABORTED' || tokenError.message.includes('timeout')) {
              console.warn('⚠️ Token API timeout - menggunakan Firebase auth sebagai fallback');
            }
            
            // ✅ Keep user logged in even if token API fails - user can still use Firebase auth
            setError("");
          }

          // ✅ FIX: Set loading to false AFTER auth state is established
          setAuthInitialized(true);
          setLoading(false);
        } else {
          console.log('🔐 User logged out / not authenticated');
          localStorage.removeItem('token');
          localStorage.removeItem('access-token');
          setUser(null);
          setAuthInitialized(true);
          setLoading(false);
        }
      } catch (err) {
        console.error('❌ Error in onAuthStateChanged:', err);
        setError(err.message);
        setAuthInitialized(true);
        setLoading(false);
      }
    });

    // ✅ FIX: Add timeout untuk Firebase init jika Firebase lambat
    const firebaseTimeoutId = setTimeout(() => {
      if (!authInitialized) {
        console.warn('⚠️ Firebase init timeout - setting authInitialized');
        setAuthInitialized(true);
        setLoading(false);
      }
    }, 5000); // 5 second fallback timeout

    return () => {
      unsubscribe();
      clearTimeout(firebaseTimeoutId);
    };
  }, [auth]);

  const authInfo = {
    user,
    loading,
    error,
    setError,
    signUp,
    login,
    logout,
    updateUser,
    googleLogin,
    authInitialized // ✅ NEW: Export ini juga
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;