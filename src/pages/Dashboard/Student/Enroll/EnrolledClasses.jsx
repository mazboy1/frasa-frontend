import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import useUser from '../../../../hooks/useUser';
import { Link } from 'react-router-dom';
import Swal from 'sweetalert2';

const EnrolledClasses = () => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      setError('User email tidak ditemukan');
      return;
    }

    console.log('🔄 Fetching enrolled classes for:', currentUser.email);

    axiosSecure.get(`/enrolled-classes/${currentUser.email}`)
      .then(res => {
        console.log('✅ Enrolled classes fetched:', res.data);
        setData(res.data?.data || res.data || []);
        setError(null);
        setLoading(false);
      })
      .catch(err => {
        console.error('❌ Error fetching enrolled classes:', err);
        
        let errorMsg = 'Gagal memuat kelas terdaftar';
        if (err.response?.status === 401) {
          errorMsg = 'Session expired, silakan login kembali';
        } else if (err.response?.status === 404) {
          errorMsg = 'Belum ada kelas terdaftar';
        } else if (err.message) {
          errorMsg = err.message;
        }
        
        setError(errorMsg);
        setData([]);
        setLoading(false);
      });
  }, [currentUser?.email, axiosSecure]);

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kelas Anda...</p>
        </div>
      </div>
    );
  }

  if (error && data.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6 text-center">
          <p className="text-yellow-800 mb-4">⚠️ {error}</p>
          <Link 
            to="/classes" 
            className="inline-block bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            Jelajahi Kelas
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className='text-3xl font-bold mb-8 text-gray-800'>📚 Kelas Saya</h1>
      
      {data.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg">
          <div className="text-5xl mb-4">📚</div>
          <h2 className="text-xl text-gray-600 mb-2">Belum ada kelas terdaftar</h2>
          <p className="text-gray-500 mb-6">Jelajahi kursus kami dan mulai belajar sekarang!</p>
          <Link 
            to="/classes" 
            className="inline-block bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-6 rounded-lg transition-colors"
          >
            🔍 Jelajahi Kursus
          </Link>
        </div>
      ) : (
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
          {data.map((item, index) => {
            const classData = item.classes || item;
            
            return (
              <div 
                key={item._id || index}
                className="bg-white rounded-xl shadow-lg overflow-hidden transition-transform duration-300 hover:shadow-xl hover:-translate-y-1 flex flex-col h-[400px]"
              >
                {/* Image */}
                <div className="h-48 overflow-hidden bg-gray-200">
                  {classData.image ? (
                    <img 
                      src={classData.image} 
                      alt={classData.name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.style.display = 'none';
                        e.target.parentElement.innerHTML = '<div class="flex items-center justify-center h-full bg-gray-300"><span class="text-gray-500">📷 Gambar tidak tersedia</span></div>';
                      }}
                    />
                  ) : (
                    <div className="flex items-center justify-center h-full bg-gray-300">
                      <span className="text-gray-500">📷 Gambar tidak tersedia</span>
                    </div>
                  )}
                </div>

                {/* Content */}
                <div className="p-5 flex flex-col flex-grow justify-between">
                  <div>
                    <h2 className="font-bold text-lg text-gray-800 mb-1 line-clamp-1">
                      {classData.name || 'Unnamed Class'}
                    </h2>
                    <p className="text-gray-600 text-sm mb-3">
                      👨‍🏫 {classData.instructorName || 'Unknown Instructor'}
                    </p>
                  </div>

                  {/* Footer */}
                  <div className="flex justify-between items-center mt-auto pt-3 border-t border-gray-100">
                    <p className="font-bold text-secondary text-lg">
                      Rp{(classData.price || 0).toLocaleString('id-ID')}
                    </p>
                    <Link 
                      to="/dashboard/courses-study" 
                      state={{ classId: classData._id }}
                      className="bg-secondary hover:bg-secondary-dark text-white font-medium py-2 px-4 rounded-lg transition-colors text-sm"
                    >
                      ▶️ Belajar
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default EnrolledClasses;