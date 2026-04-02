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
    axiosSecure.get('/users')
      .then(res => {
        setUsers(res.data?.data || [])
        console.log('✅ Users fetched:', res.data?.data)
      })
      .catch(err => {
        console.error('❌ Error fetching users:', err)
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