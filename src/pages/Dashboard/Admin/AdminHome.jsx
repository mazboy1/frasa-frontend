import React, { useEffect, useState } from 'react'
import useUser from '../../../hooks/useUser'
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import AdminStats from './AdminStats';

const AdminHome = () => {
  const { currentUser } = useUser();
  const axiosSecure = useAxiosSecure();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    console.log('🔑 Token check in AdminHome:', token ? `✅ (${token.length} chars)` : '❌ MISSING');
    
    axiosSecure.get('/users')
      .then(res => {
        console.log('✅ Users fetched:', res.data)
        setUsers(res.data?.data || [])
      })
      .catch(err => {
        console.error('❌ Error fetching users:', err.response?.status, err.response?.data)
        setError(err.response?.data?.message || 'Gagal memuat user list')
      })
      .finally(() => setLoading(false))
  }, [axiosSecure])

  return (
    <div>
        <div>
        <h1 className='text-4xl font-bold my-7'>Selamat Datang Kembali, <span className='text-secondary'>{currentUser?.name}</span></h1>
        {error && (
          <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
            ⚠️ {error}
          </div>
        )}
        <AdminStats users={users} />
        </div>
    </div>
    )
}

export default AdminHome