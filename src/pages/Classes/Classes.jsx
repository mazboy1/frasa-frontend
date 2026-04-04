import React, { useEffect, useState } from 'react';
import useAxiosFetch from '../../hooks/useAxiosFetch';
import { Transition } from '@headlessui/react';
import { Link, useNavigate } from 'react-router-dom';
import useUser from '../../hooks/useUser';
import useAxiosSecure from '../../hooks/useAxiosSecure';
import { FaSearch, FaFilter, FaChair } from 'react-icons/fa';
import Swal from 'sweetalert2';

const Classes = () => {
  const [classes, setClasses] = useState([]);
  const { currentUser } = useUser();
  const role = currentUser?.role;
  const [hoveredCard, setHoveredCard] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterPrice, setFilterPrice] = useState('all');

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
        console.log("✅ Fetched classes:", res.data);
        
        if (res.data?.data && Array.isArray(res.data.data)) {
          setClasses(res.data.data);
        } else if (Array.isArray(res.data)) {
          setClasses(res.data);
        } else {
          setError("Format data tidak sesuai");
          setClasses([]);
        }
      })
      .catch(err => {
        console.error("❌ Error fetching classes:", err);
        setError(err.message || "Gagal memuat data kelas");
        setClasses([]);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  // ✅ FIX: Better handleSelect with proper error handling
  const handleSelect = async (id) => {
    if (!currentUser) {
      Swal.fire('Perhatian', 'Silakan login terlebih dahulu', 'warning');
      return navigate('/login');
    }

    try {
      console.log('🛒 [handleSelect] Adding to cart:', id, currentUser.email);

      // Check enrolled classes
      const enrolledRes = await axiosSecure.get(`/enrolled-classes/${currentUser.email}`);
      const enrolledData = Array.isArray(enrolledRes.data?.data) 
        ? enrolledRes.data.data 
        : Array.isArray(enrolledRes.data) 
          ? enrolledRes.data 
          : [];
      
      console.log('📚 Enrolled classes:', enrolledData.length);

      // Check if already enrolled
      const isEnrolled = enrolledData.some(item => 
        item?.classes?._id === id || item?._id === id || item?.classesId === id
      );

      if (isEnrolled) {
        Swal.fire('ℹ️ Info', 'Anda sudah terdaftar di kelas ini', 'info');
        return;
      }

      // Check if already in cart
      try {
        const cartRes = await axiosSecure.get(`/cart-item/${id}`, {
          params: { email: currentUser.email }
        });
        
        console.log('✅ Item already in cart');
        Swal.fire('ℹ️ Info', 'Kelas sudah ada di keranjang', 'info');
        return;
      } catch (cartErr) {
        // 404 is expected if item not in cart - that's good!
        if (cartErr.response?.status === 404) {
          console.log('✅ Item not in cart yet, proceed to add');
        } else {
          throw cartErr;
        }
      }

      // Add to cart
      const data = {
        classId: id,
        userMail: currentUser.email,
        date: new Date()
      };

      console.log('📤 Sending to cart:', data);
      
      const postRes = await axiosSecure.post('/add-to-cart', data);
      console.log('✅ Added to cart response:', postRes.data);
      
      Swal.fire({
        title: '✅ Berhasil',
        text: 'Kelas ditambahkan ke keranjang',
        icon: 'success',
        timer: 2000
      });
      
    } catch (err) {
      console.error('❌ Error in handleSelect:', err);
      
      const errorMsg = err.response?.data?.message || err.message || 'Gagal menambahkan ke keranjang';
      
      Swal.fire({
        title: '❌ Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Coba Lagi'
      });
    }
  };

  // Filter classes
  const filteredClasses = classes.filter(cls => {
    const matchesSearch = (cls.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (cls.instructorName || '').toLowerCase().includes(searchTerm.toLowerCase());
    
    if (filterPrice === 'all') return matchesSearch;
    if (filterPrice === 'free') return matchesSearch && cls.price === 0;
    if (filterPrice === 'paid') return matchesSearch && cls.price > 0;
    
    return matchesSearch;
  });

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600 font-medium">Memuat data kelas...</p>
        </div>
      </div>
    );
  }

  if (error && classes.length === 0) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gradient-to-br from-gray-50 to-gray-100 px-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="text-5xl mb-4">⚠️</div>
          <h2 className="text-2xl font-bold text-gray-800 mb-2">Terjadi Kesalahan</h2>
          <p className="text-gray-600 mb-6">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="px-6 py-3 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-colors"
          >
            Coba Lagi
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-12">
      {/* Header Section */}
      <div className="container mx-auto px-4 mb-12">
        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-gray-800 mb-2">
            Kelas <span className="text-secondary">Pilihan</span> Kami
          </h1>
          <p className="text-gray-600 text-lg max-w-2xl mx-auto">
            Pilih kelas terbaik dan raih skill yang Anda impikan
          </p>
        </div>

        {/* Search & Filter Section */}
        <div className="bg-white rounded-lg shadow-md p-6 max-w-4xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search Box */}
            <div className="md:col-span-2">
              <div className="relative">
                <FaSearch className="absolute left-4 top-3.5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Cari nama kelas atau instruktur..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary"
                />
              </div>
            </div>

            {/* Filter */}
            <div className="relative">
              <FaFilter className="absolute left-4 top-3.5 text-gray-400" />
              <select
                value={filterPrice}
                onChange={(e) => setFilterPrice(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-secondary appearance-none"
              >
                <option value="all">Semua Harga</option>
                <option value="free">Gratis</option>
                <option value="paid">Berbayar</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Classes Grid */}
      <div className="container mx-auto px-4">
        {filteredClasses.length === 0 ? (
          <div className="text-center py-16">
            <div className="text-6xl mb-4">🔍</div>
            <h2 className="text-2xl font-bold text-gray-800 mb-2">Tidak Ada Kelas</h2>
            <p className="text-gray-600">Coba ubah pencarian atau filter Anda</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {filteredClasses.map((cls, index) => (
              <div
                key={cls._id || index}
                className="bg-white rounded-xl shadow-md overflow-hidden transition-all duration-300 hover:shadow-xl hover:-translate-y-2 flex flex-col h-full border border-gray-100 group"
                onMouseEnter={() => setHoveredCard(index)}
                onMouseLeave={() => setHoveredCard(null)}
              >
                {/* Image Container */}
                <div className="relative h-48 overflow-hidden bg-gradient-to-br from-gray-200 to-gray-300">
                  <img 
                    src={cls.image || 'https://via.placeholder.com/300x200?text=Kelas'} 
                    alt={cls.name || 'Kelas'} 
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                    onError={(e) => {
                      e.target.src = 'https://via.placeholder.com/300x200?text=Kelas';
                    }}
                  />
                  
                  {/* Overlay & Button */}
                  <Transition
                    show={hoveredCard === index}
                    enter="transition-opacity duration-300"
                    enterFrom="opacity-0"
                    enterTo="opacity-100"
                    leave="transition-opacity duration-300"
                    leaveFrom="opacity-100"
                    leaveTo="opacity-0"
                  >
                    <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
                      <button
                        onClick={() => handleSelect(cls._id)}
                        disabled={role === 'admin' || role === 'instructor' || cls.availableSeats < 1}
                        className="px-6 py-3 bg-secondary text-white font-semibold rounded-lg hover:bg-secondary-dark disabled:bg-gray-400 disabled:cursor-not-allowed transition-all"
                      >
                        {cls.availableSeats < 1 ? '❌ Kursi Penuh' : '➕ Tambahkan'}
                      </button>
                    </div>
                  </Transition>

                  {/* Badge */}
                  {cls.availableSeats < 1 && (
                    <div className="absolute top-3 right-3 px-3 py-1 bg-red-500 text-white rounded-full text-xs font-semibold">
                      Penuh
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h3 className="font-bold text-lg text-gray-800 mb-2 line-clamp-2">
                      {cls.name || 'Kelas Tanpa Nama'}
                    </h3>
                    <p className="text-gray-600 text-sm mb-3">
                      👨‍🏫 {cls.instructorName || 'Tidak diketahui'}
                    </p>
                  </div>

                  {/* Footer Stats */}
                  <div className="space-y-3 pt-3 border-t border-gray-100">
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600 flex items-center gap-1">
                        <FaChair className="w-4 h-4" /> Kursi Tersedia
                      </span>
                      <span className="font-semibold text-gray-800">{cls.availableSeats ?? 0}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xl font-bold text-secondary">
                        {cls.price === 0 ? 'Gratis' : `Rp${cls.price.toLocaleString('id-ID')}`}
                      </span>
                    </div>

                    <div className="flex gap-2">
                      <Link to={`/class/${cls._id}`} className="flex-1">
                        <button className="w-full px-4 py-2 border-2 border-secondary text-secondary font-semibold rounded-lg hover:bg-secondary hover:text-white transition-all">
                          Detail
                        </button>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Classes;