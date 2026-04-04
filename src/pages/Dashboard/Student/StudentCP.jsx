import React, { useEffect, useState } from 'react';
import useUser from '../../../hooks/useUser';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import WelcomeImg from "../../../assets/dashboard/urban-welcome.svg";
import { Link } from 'react-router-dom';
import { FaBook, FaHeart, FaHistory, FaUserTie, FaChartLine, FaClock, FaUsers } from 'react-icons/fa';

const StudentCP = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  const [stats, setStats] = useState({
    enrolledClasses: 0,
    selectedClasses: 0,
    totalSpent: 0
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const fetchStats = async () => {
      try {
        // Fetch enrolled classes
        const enrolledRes = await axiosSecure.get(`/enrolled-classes/${currentUser.email}`);
        const enrolledCount = Array.isArray(enrolledRes.data?.data) ? enrolledRes.data.data.length : 0;

        // Fetch payment history
        const paymentRes = await axiosSecure.get(`/payment-history/${currentUser.email}`);
        const paymentData = Array.isArray(paymentRes.data?.data) ? paymentRes.data.data : [];
        const totalSpent = paymentData.reduce((acc, curr) => acc + (curr?.amount || 0), 0);

        setStats({
          enrolledClasses: enrolledCount,
          selectedClasses: 0, // bisa di-update jika ada endpoint
          totalSpent: totalSpent
        });
      } catch (error) {
        console.error('Error fetching stats:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchStats();
  }, [currentUser?.email, axiosSecure]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        
        {/* ✅ Welcome Section */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8 border-l-4 border-secondary">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="md:w-1/3">
              <img 
                onContextMenu={e => e.preventDefault()} 
                src={WelcomeImg} 
                alt="Welcome" 
                className='h-[180px] mx-auto' 
              />
            </div>
            <div className="md:w-2/3">
              <h1 className='text-4xl font-bold mb-2'>
                Selamat datang, <span className='text-secondary'>{currentUser?.name}!</span>
              </h1>
              <p className='text-gray-600 text-lg mb-4'>
                Senang melihat Anda kembali! Lanjutkan perjalanan belajar Anda dan raih kesuksesan bersama Frasa Academy.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link 
                  to="/dashboard/enrolled-classes"
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all"
                >
                  Buka Kelas Saya
                </Link>
                <Link 
                  to="/classes"
                  className="px-6 py-2 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all"
                >
                  Cari Kelas Baru
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Enrolled Classes */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Kelas Diambil</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {loading ? "..." : stats.enrolledClasses}
                </h3>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-blue-600" />
              </div>
            </div>
            <Link 
              to="/dashboard/enrolled-classes"
              className="text-blue-600 text-sm font-medium mt-4 hover:underline inline-flex items-center gap-1"
            >
              Lihat Kelas →
            </Link>
          </div>

          {/* Card 2: Total Learning Time */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Waktu Belajar</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {loading ? "..." : `${Math.floor(stats.enrolledClasses * 15)}h`}
                </h3>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaClock className="text-2xl text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Estimasi total jam pembelajaran
            </p>
          </div>

          {/* Card 3: Total Spent */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Investasi</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {loading ? "..." : `Rp${stats.totalSpent.toLocaleString('id-ID')}`}
                </h3>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Investasi untuk masa depan Anda
            </p>
          </div>
        </div>

        {/* ✅ Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Action 1 */}
            <Link 
              to="/dashboard/enrolled-classes"
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaBook className="text-2xl text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Kelas Saya</h3>
              <p className="text-sm text-gray-600">Lihat semua kelas yang sudah diambil</p>
            </Link>

            {/* Action 2 */}
            <Link 
              to="/dashboard/my-selected"
              className="p-6 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border-2 border-red-200 hover:border-red-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaHeart className="text-2xl text-red-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Yang Dipilih</h3>
              <p className="text-sm text-gray-600">Kelas yang sudah disimpan untuk nanti</p>
            </Link>

            {/* Action 3 */}
            <Link 
              to="/dashboard/my-payments"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaHistory className="text-2xl text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Riwayat Pembayaran</h3>
              <p className="text-sm text-gray-600">Lihat semua transaksi Anda</p>
            </Link>

            {/* Action 4 */}
            <Link 
              to="/dashboard/apply-instructor"
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaUserTie className="text-2xl text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Jadi Instruktur</h3>
              <p className="text-sm text-gray-600">Daftar untuk menjadi instruktur</p>
            </Link>
          </div>
        </div>

        {/* ✅ Learning Progress */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Progres Belajar Anda</h2>
          
          {stats.enrolledClasses === 0 ? (
            <div className="text-center py-12 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
              <FaBook className="text-5xl text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600 font-medium mb-4">Belum ada kelas yang diambil</p>
              <p className="text-gray-500 mb-6">Mulai perjalanan belajar Anda dengan bergabung di salah satu kelas kami</p>
              <Link 
                to="/classes"
                className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all inline-block"
              >
                Jelajahi Kelas
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-2">
                <p className="text-gray-600 font-medium">Tingkat Penyelesaian</p>
                <span className="text-secondary font-bold">75%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3">
                <div className="bg-gradient-to-r from-secondary to-secondary-dark h-3 rounded-full" style={{width: '75%'}}></div>
              </div>
              <p className="text-gray-600 text-sm mt-3">
                Anda sudah menyelesaikan {Math.floor(stats.enrolledClasses * 0.75)} dari {stats.enrolledClasses} kelas. Terus semangat!
              </p>
            </div>
          )}
        </div>

        {/* ✅ Tips & Resources */}
        <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Tips Belajar Efektif</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold mb-2">Konsistensi</h3>
              <p className="text-gray-100 text-sm">
                Belajar 15-30 menit setiap hari lebih efektif daripada belajar lama-lama hanya sekali seminggu.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Praktik Langsung</h3>
              <p className="text-gray-100 text-sm">
                Jangan hanya menonton video. Praktikkan langsung setiap teknik yang dipelajari dalam kelas.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Interaksi Komunitas</h3>
              <p className="text-gray-100 text-sm">
                Bergabunglah dengan forum diskusi dan komunitas untuk berbagi pengalaman dengan learner lain.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default StudentCP;