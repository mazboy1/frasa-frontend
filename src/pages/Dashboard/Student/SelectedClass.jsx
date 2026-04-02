import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import SectionTitle from '../../../components/SectionTitle';
import { useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';

const formatCurrency = (amount) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
  }).format(amount);
};

const SelectedClass = () => {
  const { currentUser } = useUser();
  const [loading, setLoading] = useState(true);
  const [classes, setClasses] = useState([]);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      setError('Email pengguna tidak ditemukan');
      return;
    }

    console.log('🔄 Fetching cart for:', currentUser.email);

    axiosSecure
      .get(`/cart/${currentUser.email}`)
      .then((res) => {
        console.log('✅ Cart fetched:', res.data);
        
        // ✅ FIX: Ensure data is always an array
        const cartData = Array.isArray(res.data) ? res.data : res.data?.data ? res.data.data : [];
        setClasses(cartData);
        setError(null);
        setLoading(false);
      })
      .catch((error) => {
        console.error('❌ Error fetching cart:', error);
        
        let errorMsg = 'Gagal memuat keranjang';
        if (error.response?.status === 401) {
          errorMsg = 'Session expired, silakan login kembali';
        } else if (error.response?.status === 404) {
          errorMsg = 'Keranjang kosong';
        } else if (error.message) {
          errorMsg = error.message;
        }
        
        setError(errorMsg);
        setClasses([]);
        setLoading(false);
      });
  }, [currentUser?.email, axiosSecure]);

  // ✅ FIX: Ensure classes is array before using reduce
  const totalPrice = Array.isArray(classes) 
    ? classes.reduce((acc, item) => acc + parseFloat(item?.price || 0), 0)
    : 0;
  
  const totalTax = totalPrice * 0.01;
  const grandTotal = totalPrice + totalTax;

  // Handle payment untuk semua kelas
  const handlePayAll = () => {
    if (classes.length === 0) {
      Swal.fire('⚠️ Peringatan', 'Keranjang Anda kosong', 'warning');
      return;
    }

    navigate('/dashboard/user/payment', { 
      state: { 
        price: grandTotal,
        items: classes.map(item => item._id),
        type: 'multiple'
      } 
    });
  };

  // Handle payment per kelas
  const handlePay = (id) => {
    const item = classes.find((item) => item._id === id);
    if (!item) {
      Swal.fire('❌ Error', 'Kelas tidak ditemukan', 'error');
      return;
    }

    navigate('/dashboard/user/payment', { 
      state: { 
        price: item.price, 
        itemId: id,
        type: 'single'
      } 
    });
  };

  // Handle delete
  const handleDelete = (id) => {
    Swal.fire({
      title: "Hapus Kelas?",
      text: "Anda akan menghapus kelas ini dari keranjang",
      icon: "warning",
      showCancelButton: true,
      confirmButtonColor: "#d33",
      cancelButtonColor: "#3085d6",
      confirmButtonText: "Ya, Hapus!",
      cancelButtonText: "Batal"
    }).then((result) => {
      if (result.isConfirmed) {
        axiosSecure.delete(`/delete-cart-item/${id}`)
          .then(() => {
            Swal.fire(
              'Terhapus!',
              'Kelas telah dihapus dari keranjang.',
              'success'
            );
            setClasses(classes.filter((item) => item._id !== id));
          })
          .catch(error => {
            console.error('❌ Delete error:', error);
            Swal.fire(
              'Gagal!',
              'Terjadi kesalahan saat menghapus kelas.',
              'error'
            );
          });
      }
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat keranjang...</p>
        </div>
      </div>
    );
  }

  if (error && classes.length === 0) {
    return (
      <div className="px-4 py-8">
        <SectionTitle
          heading="Kelas Pilihan Saya"
          subHeading="Kelola kelas dalam keranjang Anda"
        />
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">⚠️ {error}</p>
          <button 
            onClick={() => navigate('/classes')}
            className="bg-yellow-600 hover:bg-yellow-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Jelajahi Kelas
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="px-4 py-8">
      <SectionTitle
        heading="🛒 Kelas Pilihan Saya"
        subHeading="Kelola kelas dalam keranjang Anda"
      />

      {classes.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl text-gray-600 mb-2">Keranjang Anda kosong</h2>
          <p className="text-gray-500 mb-6">Belum ada kelas yang dipilih</p>
          <button 
            onClick={() => navigate('/classes')}
            className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-6 rounded-lg"
          >
            🔍 Jelajahi Kelas
          </button>
        </div>
      ) : (
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Daftar Kelas */}
          <div className="lg:w-3/4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
              <h2 className="text-xl font-semibold mb-4 flex items-center">
                📚 {classes.length} Kelas dalam Keranjang
              </h2>
              
              <div className="space-y-4">
                {classes.map((item) => (
                  <div key={item._id} className="border border-gray-200 rounded-lg p-4 flex flex-col md:flex-row justify-between items-start md:items-center hover:shadow-md transition-shadow">
                    {/* Info Kelas */}
                    <div className="flex-1 mb-4 md:mb-0">
                      <h3 className="text-lg font-semibold text-gray-800 mb-1">
                        {item.name || 'Unnamed Class'}
                      </h3>
                      <p className="text-sm text-gray-600 mb-2">
                        👨‍🏫 {item.instructorName || 'Unknown Instructor'}
                      </p>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {item.description || 'No description'}
                      </p>
                    </div>

                    {/* Harga & Aksi */}
                    <div className="w-full md:w-auto md:ml-4 flex flex-col md:flex-row items-stretch md:items-center gap-3">
                      <div className="text-right">
                        <p className="text-sm text-gray-600">Harga</p>
                        <p className="text-xl font-bold text-secondary">
                          {formatCurrency(item.price || 0)}
                        </p>
                      </div>

                      {/* Buttons */}
                      <div className="flex gap-2">
                        <button
                          onClick={() => handlePay(item._id)}
                          className="flex-1 md:flex-initial bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          💳 Bayar
                        </button>
                        <button
                          onClick={() => handleDelete(item._id)}
                          className="flex-1 md:flex-initial bg-red-500 hover:bg-red-600 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                        >
                          🗑️ Hapus
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Summary Card */}
          <div className="lg:w-1/4">
            <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100 sticky top-6">
              <h3 className="text-lg font-semibold mb-4">📊 Ringkasan</h3>
              
              <div className="space-y-3 mb-6 pb-6 border-b border-gray-200">
                <div className="flex justify-between">
                  <span className="text-gray-600">Subtotal</span>
                  <span className="font-semibold">{formatCurrency(totalPrice)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Pajak (1%)</span>
                  <span className="font-semibold">{formatCurrency(totalTax)}</span>
                </div>
                <div className="flex justify-between text-lg">
                  <span className="font-bold">Total</span>
                  <span className="font-bold text-secondary">{formatCurrency(grandTotal)}</span>
                </div>
              </div>

              <button
                onClick={handlePayAll}
                className="w-full bg-secondary hover:bg-secondary-dark text-white font-bold py-3 px-4 rounded-lg transition-colors mb-3"
              >
                💳 Bayar Semua ({classes.length} kelas)
              </button>

              <button
                onClick={() => navigate('/classes')}
                className="w-full bg-gray-200 hover:bg-gray-300 text-gray-800 font-medium py-2 px-4 rounded-lg transition-colors"
              >
                ← Lanjut Belanja
              </button>

              {/* Info */}
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-xs text-blue-700">
                  ℹ️ Anda dapat membayar semua kelas sekaligus atau satu per satu
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SelectedClass;