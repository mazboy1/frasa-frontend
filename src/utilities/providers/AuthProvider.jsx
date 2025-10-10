// DI AuthProvider.jsx - PASTIKAN BAGIAN INI
useEffect(() => {
  const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
    setUser(currentUser);

    if (currentUser) {
      axios.post("https://frasa-backend.vercel.app/api/set-token", {
        email: currentUser.email,
        name: currentUser.displayName
      })
      .then((response) => {
        if (response.data.token) {
          // ✅ GUNAKAN 'token' SECARA KONSISTEN
          localStorage.setItem('token', response.data.token);
          console.log('✅ Token saved as "token" in localStorage');
        }
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Token API Error:', error);
        localStorage.removeItem('token');
        setLoading(false);
      });
    } else {
      // ✅ HAPUS SEMUA TOKEN
      localStorage.removeItem('token');
      localStorage.removeItem('access-token');
      setLoading(false);
    }
  });

  return () => unsubscribe();
}, [auth]);