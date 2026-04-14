import React, { useEffect, useState } from 'react';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import { FaChalkboardTeacher, FaBookOpen, FaUsers } from "react-icons/fa";
import { MdPendingActions } from "react-icons/md";
import { HashLoader } from 'react-spinners';

const AdminStats = ({ users }) => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const axiosSecure = useAxiosSecure();

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token check in AdminStats:', token ? `✅ (${token.length} chars)` : '❌ MISSING');
    
    axiosSecure.get('/admin-stats')
      .then(res => {
        console.log('✅ Admin stats:', res.data);
        setData(res.data?.data || res.data);
        setError(null);
      })
      .catch(err => {
        console.error('❌ Error fetching stats:', err.response?.status, err.response?.data);
        setError(err.response?.data?.message || 'Gagal mengambil statistik');
        setData({
          approvedClasses: 0,
          pendingClasses: 0,
          instructors: 0
        });
      })
      .finally(() => setLoading(false));
  }, [axiosSecure]);

  if (loading) {
    return (
      <div className="flex justify-center items-center py-12">
        <HashLoader color="#36d7b7" size={50} />
      </div>
    );
  }

  return (
    <div>
      {error && (
        <div className="mb-6 p-4 bg-red-50 border border-red-200 text-red-700 rounded-lg">
          ⚠️ {error}
        </div>
      )}
      
      <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
        {/* Total Members Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-blue-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Pengguna</p>
              <h3 className="text-3xl font-bold text-blue-600 mt-2">
                {users?.length || 0}
              </h3>
            </div>
            <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center">
              <FaUsers className="text-2xl text-blue-600" />
            </div>
          </div>
        </div>

        {/* Approved Classes Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-green-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Kelas Disetujui</p>
              <h3 className="text-3xl font-bold text-green-600 mt-2">
                {data?.approvedClasses || 0}
              </h3>
            </div>
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <FaBookOpen className="text-2xl text-green-600" />
            </div>
          </div>
        </div>

        {/* Instructors Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-purple-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Total Instruktur</p>
              <h3 className="text-3xl font-bold text-purple-600 mt-2">
                {data?.instructors || 0}
              </h3>
            </div>
            <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center">
              <FaChalkboardTeacher className="text-2xl text-purple-600" />
            </div>
          </div>
        </div>

        {/* Pending Classes Card */}
        <div className="bg-white rounded-lg shadow-md p-6 border-t-4 border-orange-500 hover:shadow-lg transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-gray-600 text-sm font-medium">Menunggu Persetujuan</p>
              <h3 className="text-3xl font-bold text-orange-600 mt-2">
                {data?.pendingClasses || 0}
              </h3>
            </div>
            <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center">
              <MdPendingActions className="text-2xl text-orange-600" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminStats;