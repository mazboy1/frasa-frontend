import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../hooks/useAxiosFetch';
import { Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import useAxiosSecure from '../../hooks/useAxiosSecure';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const { currentUser } = useUser();
  const role = currentUser?.role;
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();
  const navigate = useNavigate();

  // Fetch classes
  useEffect(() => {
    setLoading(true);
    setError(null);
    
    axiosFetch
      .get('/classes')
      .then(res => {
        console.log("Fetched classes:", res.data);
        
        // Ambil data dari res.data.data (karena response: {success: true, data: [...]})
        if (res.data?.data && Array.isArray(res.data.data)) {
          console.log("Jumlah kelas:", res.data.data.length);
          setClasses(res.data.data);
        } 
        else if (Array.isArray(res.data)) {
          console.log("Jumlah kelas (array langsung):", res.data.length);
          setClasses(res.data);
        }
        else {
          console.error("Format data tidak dikenal:", res.data);
          setError("Format data tidak sesuai");
          setClasses([]);
        }
      })
      .catch(err => {
        console.error("Error fetching classes:", err);
        setError(err.message || "Gagal memuat data kelas");
        setClasses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const handleHover = (index) => {
    setHoveredCard(index);
  };

  const handleSelect = async (id) => {
    if (!currentUser) {
      alert("Silakan Login Terlebih Dahulu");
      return navigate('/login');
    }

    try {
      // Cek apakah user sudah enrolled
      const enrolledRes = await axiosSecure.get(`/enrolled-classes/${currentUser.email}`);
      const enrolledData = enrolledRes.data;
      setEnrolledClasses(enrolledData);

      // Cek apakah kelas sudah ada di cart
      const cartRes = await axiosSecure.get(`/cart-item/${id}?email=${currentUser.email}`);
      
      if (cartRes.data.classId === id) {
        return alert("Kelas sudah ada di keranjang");
      } 
      
      if (enrolledData.find(item => item.classes?._id === id || item._id === id)) {
        return alert("Anda sudah terdaftar di kelas ini");
      }

      // Tambah ke cart
      const data = {
        classId: id,
        userMail: currentUser.email,
        date: new Date()
      };
      
      const postRes = await axiosSecure.post('/add-to-cart', data);
      alert('Berhasil ditambahkan ke keranjang');
      console.log(postRes.data);
      
    } catch (err) {
      console.error("Error in handleSelect:", err);
      if (err.response?.status === 404) {
        // Jika endpoint cart-item tidak ditemukan, langsung coba tambahkan
        try {
          const data = {
            classId: id,
            userMail: currentUser.email,
            date: new Date()
          };
          const postRes = await axiosSecure.post('/add-to-cart', data);
          alert('Berhasil ditambahkan ke keranjang');
          console.log(postRes.data);
        } catch (postErr) {
          console.error("Error adding to cart:", postErr);
          alert("Gagal menambahkan ke keranjang");
        }
      } else {
        alert("Terjadi kesalahan");
      }
    }
  };

  // Tampilkan loading
  if (loading) {
    return (
      <div className="mt-20 text-center">
        <div className="flex justify-center items-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
        </div>
        <p className="text-gray-500 mt-4">Memuat data kelas...</p>
      </div>
    );
  }

  // Tampilkan error
  if (error) {
    return (
      <div className="mt-20 text-center text-red-500">
        <p className="text-xl">Error: {error}</p>
        <button 
          onClick={() => window.location.reload()} 
          className="mt-4 px-4 py-2 bg-secondary text-white rounded hover:bg-primary"
        >
          Coba Lagi
        </button>
      </div>
    );
  }

  // Tampilkan pesan jika tidak ada kelas
  if (!classes.length) {
    return (
      <div className="mt-20 text-center">
        <p className="text-gray-500 text-xl">Tidak ada kelas tersedia saat ini</p>
        <p className="text-gray-400 mt-2">Silakan cek kembali nanti</p>
      </div>
    );
  }

  return (
    <div>
      <div className="mt-20 pt-3 text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">
          Kelas <span className="text-secondary">Pilihan</span> Kami
        </h1>
        <p className="text-gray-600 max-w-2xl mx-auto">
          Pilih kelas terbaik, raih skill terbaik
        </p>
      </div>

      <div className="my-16 w-[90%] mx-auto grid sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-8">
        {classes.map((cls, index) => (
          <div
            key={cls._id || index}
            className={`relative hover:-translate-y-2 duration-150 hover:ring-[2px] hover:ring-secondary w-64 mx-auto ${
              cls.availableSeats < 1 ? 'bg-red-100' : 'bg-white'
            } dark:bg-slate-600 rounded-lg shadow-lg overflow-hidden cursor-pointer`}
            onMouseEnter={() => handleHover(index)}
            onMouseLeave={() => setHoveredCard(null)}
          >
            <div className="relative h-48">
              <div className={`absolute inset-0 bg-black transition-opacity duration-300 ${
                hoveredCard === index ? "opacity-60" : "opacity-0"
              }`} />
              
              {/* Gambar dengan fallback */}
              <img 
                src={cls.image || 'https://via.placeholder.com/300x200?text=Kelas'} 
                alt={cls.name || 'Kelas'} 
                className="object-cover w-full h-full"
                onError={(e) => {
                  e.target.onerror = null;
                  e.target.src = 'https://via.placeholder.com/300x200?text=Kelas';
                }}
              />
              
              <Transition
                show={hoveredCard === index}
                enter="transition-opacity duration-300"
                enterFrom="opacity-0"
                enterTo="opacity-100"
                leave="transition-opacity duration-300"
                leaveFrom="opacity-100"
                leaveTo="opacity-0"
              >
                <div className="absolute inset-0 flex items-center justify-center">
                  <button
                    onClick={() => handleSelect(cls._id)}
                    title={
                      role === 'admin' || role === 'instructor'
                        ? 'Instruktur/Admin tidak dapat memilih'
                        : cls.availableSeats < 1
                          ? 'Kursi tidak tersedia'
                          : 'Klik untuk menambahkan ke keranjang'
                    }
                    disabled={role === 'admin' || role === 'instructor' || cls.availableSeats < 1}
                    className="px-4 py-2 text-white disabled:bg-gray-400 disabled:cursor-not-allowed bg-secondary duration-300 rounded hover:bg-primary"
                  >
                    {cls.availableSeats < 1 ? 'Kursi Penuh' : 'Tambahkan'}
                  </button>
                </div>
              </Transition>
            </div>
            
            <div className="px-6 py-2">
              <h3 className="font-semibold mb-1 line-clamp-1">{cls.name || 'Kelas Tanpa Nama'}</h3>
              <p className="text-gray-500 text-xs">
                Instruktur: {cls.instructorName || 'Tidak diketahui'}
              </p>
              <div className="flex items-center justify-between mt-4">
                <span className="text-gray-600 text-xs">
                  Kursi Tersedia: {cls.availableSeats ?? 0}
                </span>
                <span className="text-green-500 font-semibold">
                  Rp {cls.price?.toLocaleString('id-ID') || '0'}
                </span>
              </div>
              
              <Link to={`/class/${cls._id}`}>
                <button className="px-4 py-2 mt-4 mb-2 w-full mx-auto text-white bg-secondary duration-300 rounded hover:bg-primary">
                  Lihat Detail
                </button>
              </Link>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Classes;