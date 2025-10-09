// utilities/providers/AuthProvider.jsx - FINAL FIXED VERSION
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

export const AuthContext = createContext();

const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true); // ✅ UBAH loader → loading
  const [error, setError] = useState("");

  const auth = getAuth(app);

  // ✅ SIGN UP
  const signUp = async (email, password) => {
    try {
      setLoading(true);
      return await createUserWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  // ✅ LOGIN
  const login = async (email, password) => {
    try {
      setLoading(true);
      return await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  // ✅ LOGOUT
  const logout = async () => {
    try {
      setLoading(true);
      await signOut(auth);
      localStorage.removeItem('token'); // ✅ CONSISTENT: token
      setUser(null);
      setLoading(false);
    } catch (err) {
      setError(err.code);
      throw err;
    }
  };

  // ✅ UPDATE USER
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

  // ✅ GOOGLE LOGIN
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

  // ✅ AUTH STATE OBSERVER - FIXED VERSION
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      console.log('🔥 Auth State Changed:', currentUser);
      setUser(currentUser);

      if (currentUser) {
        // ✅ POST TOKEN TO BACKEND
        axios.post("https://frasa-backend.vercel.app/api/set-token", {
          email: currentUser.email,
          name: currentUser.displayName
        })
        .then((response) => {
          if (response.data.token) {
            localStorage.setItem('token', response.data.token); // ✅ CONSISTENT: token
            console.log('✅ Token saved to localStorage');
          }
          setLoading(false);
        })
        .catch((error) => {
          console.error('❌ Token API Error:', error);
          localStorage.removeItem('token');
          setLoading(false);
        });
      } else {
        localStorage.removeItem('token'); // ✅ CONSISTENT: token
        setLoading(false);
      }
    });

    return () => unsubscribe();
  }, [auth]);

  // ✅ CONTEXT VALUE - CONSISTENT NAMING
  const contextValue = {
    user,
    loading, // ✅ UBAH: loader → loading
    error,
    setError,
    signUp,
    login,
    logout,
    updateUser,
    googleLogin
  };

  console.log('🔐 AuthProvider State:', { user, loading });

  return (
    <AuthContext.Provider value={contextValue}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider;