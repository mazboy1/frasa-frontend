// hooks/useAuth.js - FINAL FIXED VERSION
import { useContext } from "react";
import { AuthContext } from "../utilities/providers/AuthProvider";

const useAuth = () => {
  const auth = useContext(AuthContext);
  
  // ✅ VALIDATE AUTH CONTEXT
  if (!auth) {
    throw new Error('useAuth must be used within an AuthProvider');
  }

  console.log('🔐 useAuth Debug:', { 
    user: auth.user, 
    loading: auth.loading 
  });

  return auth;
}

export default useAuth;