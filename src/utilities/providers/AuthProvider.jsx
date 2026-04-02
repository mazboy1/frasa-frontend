import React, { createContext, useEffect, useState } from 'react';
import { app } from '../../config/firebase.init';  // ✅ CORRECT IMPORT
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
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔐 onAuthStateChanged - currentUser:', currentUser?.email);
      setUser(currentUser);

      if (currentUser) {
        const displayName = currentUser.displayName || currentUser.email.split('@')[0] || 'User';
        
        console.log('📤 Calling /api/set-token dengan email:', currentUser.email);

        axios.post("https://frasa-backend.vercel.app/api/set-token", {
          email: currentUser.email,
          name: displayName
        })
        .then((response) => {
          console.log('✅ Response dari /api/set-token:', response.data);
          
          const token = response.data?.token;
          
          if (token) {
            localStorage.setItem('access-token', token);
            localStorage.setItem('token', token);
            console.log('✅ Token berhasil disimpan ke localStorage');
          } else {
            console.error('❌ Token tidak ditemukan di response:', response.data);
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('❌ Token API Error:', error.response?.data || error.message);
          setLoading(false);
        });
      } else {
        console.log('🔐 User logged out');
        localStorage.removeItem('token');
        localStorage.removeItem('access-token');
        setLoading(false);
      }
    });

    return () => unsubscribe();
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
    googleLogin
  };

  return (
    <AuthContext.Provider value={authInfo}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;