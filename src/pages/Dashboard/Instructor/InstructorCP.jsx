import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import WelcomeImg from "../../../assets/dashboard/urban-welcome.svg";
import { FaBook, FaCheckCircle, FaClock, FaUsers, FaChartLine, FaPlus } from 'react-icons/fa';
import { MdPendingActions } from 'react-icons/md';

const InstructorCP = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    totalStudents: 0,
    totalRevenue: 0
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!currentUser?.email) return;

    const fetchStats = async () => {
      try {
        console.log('📊 Fetching instructor stats for:', currentUser.email);
        
        // Get my-classes
        const myClassesRes = await axiosSecure.get('/instructor/my-classes', {
          params: { email: currentUser.email }
        });
        
        // Get approved-classes
        const approvedRes = await axiosSecure.get('/instructor/approved-classes', {
          params: { email: currentUser.email }
        });
        
        // Get pending-classes
        const pendingRes = await axiosSecure.get('/instructor/pending-classes', {
          params: { email: currentUser.email }
        });
        
        // Get rejected-classes
        const rejectedRes = await axiosSecure.get('/instructor/rejected-classes', {
          params: { email: currentUser.email }
        });

        const total = myClassesRes.data?.data?.total || myClassesRes.data?.data?.classes?.length || 0;
        const approved = approvedRes.data?.data?.total || approvedRes.data?.data?.classes?.length || 0;
        const pending = pendingRes.data?.data?.total || pendingRes.data?.data?.classes?.length || 0;
        const rejected = rejectedRes.data?.data?.total || rejectedRes.data?.data?.classes?.length || 0;

        // Calculate total students and revenue
        const approvedClasses = Array.isArray(approvedRes.data?.data?.classes) ? approvedRes.data.data.classes : [];
        const totalStudents = approvedClasses.reduce((sum, cls) => sum + (cls.totalEnrolled || 0), 0);
        const totalRevenue = approvedClasses.reduce((sum, cls) => sum + ((cls.price || 0) * (cls.totalEnrolled || 0)), 0);

        console.log('✅ Stats fetched:', { total, approved, pending, rejected, totalStudents, totalRevenue });

        setStats({ total, approved, pending, rejected, totalStudents, totalRevenue });
        setIsLoading(false);
      } catch (error) {
        console.error('❌ Error fetching stats:', error);
        setIsLoading(false);
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
                Semangat terus mengajar! Lihat progres kelas dan siswa Anda di sini.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link 
                  to="/dashboard/add-class"
                  className="px-6 py-2 bg-secondary text-white rounded-lg hover:bg-secondary-dark transition-all"
                >
                  ➕ Buat Kelas Baru
                </Link>
                <Link 
                  to="/dashboard/my-classes"
                  className="px-6 py-2 border-2 border-secondary text-secondary rounded-lg hover:bg-secondary hover:text-white transition-all"
                >
                  Lihat Kelas Saya
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* ✅ Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Card 1: Total Kelas */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Kelas</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {isLoading ? "..." : stats.total}
                </h3>
              </div>
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
                <FaBook className="text-2xl text-blue-600" />
              </div>
            </div>
            <Link 
              to="/dashboard/my-classes"
              className="text-blue-600 text-sm font-medium mt-4 hover:underline inline-flex items-center gap-1"
            >
              Lihat Semua →
            </Link>
          </div>

          {/* Card 2: Total Peserta */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Peserta</p>
                <h3 className="text-3xl font-bold text-gray-800 mt-2">
                  {isLoading ? "..." : stats.totalStudents}
                </h3>
              </div>
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
                <FaUsers className="text-2xl text-green-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Dari kelas yang disetujui
            </p>
          </div>

          {/* Card 3: Total Revenue */}
          <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Pendapatan</p>
                <h3 className="text-2xl font-bold text-gray-800 mt-2">
                  {isLoading ? "..." : `Rp${stats.totalRevenue.toLocaleString('id-ID')}`}
                </h3>
              </div>
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
                <FaChartLine className="text-2xl text-purple-600" />
              </div>
            </div>
            <p className="text-gray-600 text-sm mt-4">
              Dari penjualan kelas
            </p>
          </div>
        </div>

        {/* ✅ Quick Actions */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Action 1: Tambah Kelas */}
            <Link 
              to="/dashboard/add-class"
              className="p-6 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border-2 border-blue-200 hover:border-blue-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaPlus className="text-2xl text-blue-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Buat Kelas</h3>
              <p className="text-sm text-gray-600">Mulai kelas baru</p>
            </Link>

            {/* Action 2: Kelas Saya */}
            <Link 
              to="/dashboard/my-classes"
              className="p-6 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border-2 border-green-200 hover:border-green-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaBook className="text-2xl text-green-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Kelas Saya</h3>
              <p className="text-sm text-gray-600">Kelola semua kelas</p>
            </Link>

            {/* Action 3: Pending */}
            <Link 
              to="/dashboard/my-pending"
              className="p-6 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border-2 border-orange-200 hover:border-orange-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <MdPendingActions className="text-2xl text-orange-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Menunggu Review</h3>
              <p className="text-sm text-gray-600">Kelas pending approval</p>
            </Link>

            {/* Action 4: Approved */}
            <Link 
              to="/dashboard/my-approved"
              className="p-6 bg-gradient-to-br from-purple-50 to-purple-100 rounded-lg border-2 border-purple-200 hover:border-purple-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-center gap-3 mb-2">
                <FaCheckCircle className="text-2xl text-purple-600 group-hover:scale-110 transition-transform" />
              </div>
              <h3 className="font-bold text-gray-800 mb-1">Disetujui</h3>
              <p className="text-sm text-gray-600">Kelas yang aktif</p>
            </Link>
          </div>
        </div>

        {/* ✅ Status Overview */}
        <div className="bg-white rounded-lg shadow-md p-8 mb-8">
          <h2 className="text-2xl font-bold text-gray-800 mb-6">Status Kelas Anda</h2>
          
          {isLoading ? (
            <div className="flex justify-center items-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary"></div>
            </div>
          ) : (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 bg-gradient-to-br from-blue-50 to-blue-100 rounded-lg border border-blue-200">
                <div className="text-3xl font-bold text-blue-600">{stats.total}</div>
                <div className="text-gray-600 text-sm mt-1">📚 Total Kelas</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-green-50 to-green-100 rounded-lg border border-green-200">
                <div className="text-3xl font-bold text-green-600">{stats.approved}</div>
                <div className="text-gray-600 text-sm mt-1">✅ Disetujui</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-orange-50 to-orange-100 rounded-lg border border-orange-200">
                <div className="text-3xl font-bold text-orange-600">{stats.pending}</div>
                <div className="text-gray-600 text-sm mt-1">⏳ Pending</div>
              </div>
              <div className="text-center p-4 bg-gradient-to-br from-red-50 to-red-100 rounded-lg border border-red-200">
                <div className="text-3xl font-bold text-red-600">{stats.rejected}</div>
                <div className="text-gray-600 text-sm mt-1">❌ Ditolak</div>
              </div>
            </div>
          )}
        </div>

        {/* ✅ Tips for Instructors */}
        <div className="bg-gradient-to-r from-secondary to-secondary-dark rounded-lg shadow-md p-8 text-white">
          <h2 className="text-2xl font-bold mb-4">💡 Tips Mengajar Efektif</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold mb-2">Konten Berkualitas</h3>
              <p className="text-gray-100 text-sm">
                Pastikan video pembelajaran berkualitas tinggi dengan penjelasan yang jelas dan mudah dipahami.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Interaksi dengan Peserta</h3>
              <p className="text-gray-100 text-sm">
                Balas pertanyaan peserta dengan cepat dan tunjukkan antusiasme untuk membantu pembelajaran mereka.
              </p>
            </div>
            <div>
              <h3 className="font-bold mb-2">Update Konten Berkala</h3>
              <p className="text-gray-100 text-sm">
                Perbarui materi pembelajaran sesuai perkembangan tren industri agar tetap relevan.
              </p>
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default InstructorCP;