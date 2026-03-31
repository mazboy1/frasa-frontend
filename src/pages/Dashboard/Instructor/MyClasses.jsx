import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useAuth from '../../../hooks/useAuth';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { HashLoader } from 'react-spinners';

const MyClasses = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const axiosSecure = useAxiosSecure();
  
  const [classes, setClasses] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!user?.email) {
      setIsLoading(false);
      return;
    }

    const fetchMyClasses = async () => {
      try {
        setIsLoading(true);
        setError(null);
        
        console.log('🔄 Fetching classes untuk instructor:', user.email);
        
        // ✅ Gunakan endpoint yang sudah ada di backend
        const response = await axiosSecure.get(
          `/instructor/my-classes?email=${user.email}`
        );

        console.log('✅ Classes response:', response.data);

        if (response.data?.success) {
          const classesData = response.data.data?.classes || [];
          console.log(`✅ Ditemukan ${classesData.length} kelas`);
          setClasses(classesData);
        } else {
          setError('Gagal mengambil data kelas');
          setClasses([]);
        }
      } catch (err) {
        console.error('❌ Error fetching classes:', err);
        setError(err.response?.data?.message || 'Terjadi kesalahan saat mengambil data');
        setClasses([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMyClasses();
  }, [user?.email, axiosSecure]);

  const handleAddClass = () => {
    navigate('/dashboard/add-class');
  };

  const handleEditClass = (classId) => {
    navigate(`/dashboard/update-class/${classId}`);
  };

  const handleDeleteClass = async (classId) => {
    if (window.confirm('Apakah Anda yakin ingin menghapus kelas ini?')) {
      try {
        // Tambahan: implementasi delete di backend jika perlu
        console.log('Delete class:', classId);
      } catch (err) {
        console.error('Error deleting class:', err);
      }
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen">
        <HashLoader color="#36d7b7" size={50} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="container mx-auto px-4">
        
        {/* Header */}
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-800">Kelas Saya</h1>
            <p className="text-gray-600">Kelola kelas yang Anda buat</p>
          </div>
          <button
            onClick={handleAddClass}
            className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg transition"
          >
            + Tambah Kelas Baru
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
            <p className="text-red-800">⚠️ {error}</p>
          </div>
        )}

        {/* Classes List */}
        {classes.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
            <div className="text-4xl mb-4">📚</div>
            <h3 className="text-xl font-semibold text-gray-800 mb-2">
              Belum ada kelas
            </h3>
            <p className="text-gray-600 mb-6">
              Anda belum membuat kelas apapun. Mulai buat kelas baru sekarang!
            </p>
            <button
              onClick={handleAddClass}
              className="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-6 rounded-lg"
            >
              Buat Kelas Pertama
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {classes.map((classItem) => (
              <div
                key={classItem._id}
                className="bg-white rounded-lg shadow-lg overflow-hidden hover:shadow-xl transition"
              >
                {/* Class Image */}
                {classItem.image && (
                  <div className="h-48 bg-gray-200 overflow-hidden">
                    <img
                      src={classItem.image}
                      alt={classItem.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Class Info */}
                <div className="p-4">
                  <h3 className="text-lg font-bold text-gray-800 mb-2">
                    {classItem.name}
                  </h3>
                  
                  <p className="text-gray-600 text-sm mb-3 line-clamp-2">
                    {classItem.description}
                  </p>

                  {/* Status Badge */}
                  <div className="flex items-center gap-2 mb-4">
                    <span
                      className={`px-3 py-1 rounded-full text-xs font-bold ${
                        classItem.status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : classItem.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                      }`}
                    >
                      {classItem.status === 'approved'
                        ? '✅ Disetujui'
                        : classItem.status === 'pending'
                        ? '⏳ Pending'
                        : '❌ Ditolak'}
                    </span>
                  </div>

                  {/* Stats */}
                  <div className="grid grid-cols-2 gap-2 mb-4 text-sm">
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Price</p>
                      <p className="font-bold text-gray-800">${classItem.price}</p>
                    </div>
                    <div className="bg-gray-50 p-2 rounded">
                      <p className="text-gray-600">Peserta</p>
                      <p className="font-bold text-gray-800">{classItem.totalEnrolled || 0}</p>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2">
                    <button
                      onClick={() => handleEditClass(classItem._id)}
                      className="flex-1 bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded transition text-sm"
                    >
                      ✏️ Edit
                    </button>
                    <button
                      onClick={() => handleDeleteClass(classItem._id)}
                      className="flex-1 bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded transition text-sm"
                    >
                      🗑️ Hapus
                    </button>
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

export default MyClasses;