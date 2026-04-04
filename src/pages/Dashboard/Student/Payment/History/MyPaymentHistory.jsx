import React, { useEffect, useState } from 'react'
import useAxiosSecure from '../../../../../hooks/useAxiosSecure';
import useUser from '../../../../../hooks/useUser';
import { Pagination } from '@mui/material';
import { FaDownload, FaCheckCircle } from 'react-icons/fa';
import Swal from 'sweetalert2';

const MyPaymentHistory = () => {
  const axiosSecure = useAxiosSecure();
  const { currentUser } = useUser();
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [paginatedPayments, setPaginatedPayments] = useState([]);
  const totalItem = payments.length;
  const [page, setPage] = useState(1);
  let totalPage = Math.ceil(totalItem / 5);
  let itemsPerPage = 5;

  const handleChange = (event, value) => {
    setPage(value);
  }

  // ✅ FIX: Fetch payment history
  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }

    const fetchPaymentHistory = async () => {
      try {
        console.log('📋 Fetching payment history for:', currentUser.email);
        
        // ✅ FIX: Remove /api prefix - axiosSecure adds it
        const res = await axiosSecure.get(`/payment-history/${currentUser.email}`);
        console.log('✅ Payment history fetched:', res.data);
        
        const paymentData = Array.isArray(res.data?.data)
          ? res.data.data
          : Array.isArray(res.data)
            ? res.data
            : [];
        
        setPayments(paymentData);
        setLoading(false);
      } catch (error) {
        console.error('❌ Error fetching payment history:', error);
        Swal.fire('Error', 'Gagal memuat riwayat pembayaran', 'error');
        setPayments([]);
        setLoading(false);
      }
    };

    fetchPaymentHistory();
  }, [axiosSecure, currentUser?.email]);

  // ✅ Update pagination
  useEffect(() => {
    const lastIndex = page * itemsPerPage;
    const firstIndex = lastIndex - itemsPerPage;
    setPaginatedPayments(payments.slice(firstIndex, lastIndex));
  }, [page, payments]);

  const totalPaidAmount = payments.reduce(
    (acc, curr) => acc + (curr?.amount || 0),
    0
  );

  // ✅ Download receipt function
  const handleDownloadReceipt = (payment) => {
    // Create a simple receipt
    const receiptText = `
BUKTI PEMBAYARAN
=====================================
Tanggal: ${new Date(payment.date).toLocaleDateString('id-ID')}
ID Transaksi: ${payment._id}
Email: ${payment.userEmail}
Jumlah: Rp${payment.amount.toLocaleString('id-ID')}
Status: ${payment.status || 'Berhasil'}
=====================================
    `;

    // Download as text file
    const element = document.createElement('a');
    element.setAttribute('href', 'data:text/plain;charset=utf-8,' + encodeURIComponent(receiptText));
    element.setAttribute('download', `bukti-pembayaran-${payment._id}.txt`);
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);

    Swal.fire('✅ Berhasil', 'Bukti pembayaran berhasil diunduh', 'success');
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat riwayat pembayaran...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4">
      {/* Header */}
      <div className="text-center mt-6 mb-16">
        <p className="text-gray-400">
          Halo,{" "}
          <span className="text-secondary font-bold">{currentUser?.name}</span>{" "}
          Selamat datang!
        </p>
        <h1 className="text-4xl font-bold">
          <span className="text-secondary">Riwayat</span> Pembayaran Saya
        </h1>
        <p className="text-gray-500 text-sm my-3">
          Anda dapat melihat riwayat pembayaran Anda di sini
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <p className="text-gray-600 text-sm">Total Transaksi</p>
          <p className="text-2xl font-bold text-blue-600">{payments.length}</p>
        </div>
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
          <p className="text-gray-600 text-sm">Total Dibayarkan</p>
          <p className="text-2xl font-bold text-green-600">Rp{totalPaidAmount.toLocaleString('id-ID')}</p>
        </div>
      </div>

      {/* Empty State */}
      {payments.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-gray-600 text-lg">Belum ada riwayat pembayaran</p>
          <p className="text-gray-500 text-sm mt-2">Mulai daftar kelas untuk melihat riwayat pembayaran</p>
        </div>
      ) : (
        <>
          {/* Payment Table */}
          <div className="overflow-x-auto bg-white rounded-lg shadow">
            <table className="w-full">
              <thead className="bg-gray-100 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">No</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Jumlah</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Kelas</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Tanggal</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Status</th>
                  <th className="px-6 py-4 text-left text-xs font-semibold text-gray-700 uppercase">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {paginatedPayments.map((payment, idx) => (
                  <tr key={payment._id || idx} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {(page - 1) * itemsPerPage + idx + 1}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap font-semibold text-secondary">
                      Rp{payment.amount?.toLocaleString('id-ID') || '0'}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {payment.classesId && Array.isArray(payment.classesId) 
                        ? payment.classesId.join(', ') 
                        : payment.className || 'Tidak ada data kelas'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm">
                      {new Date(payment.date).toLocaleDateString('id-ID', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric'
                      })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 rounded-full text-xs font-semibold">
                        <FaCheckCircle /> Berhasil
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleDownloadReceipt(payment)}
                        className="flex items-center gap-1 px-3 py-1 text-blue-600 hover:bg-blue-50 rounded transition-colors"
                        title="Download bukti pembayaran"
                      >
                        <FaDownload className="text-sm" />
                        <span className="text-xs">Bukti</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          {totalPage > 1 && (
            <div className="mt-6 flex justify-center">
              <Pagination 
                count={totalPage} 
                page={page} 
                onChange={handleChange} 
                color="primary" 
              />
            </div>
          )}
        </>
      )}
    </div>
  );
}

export default MyPaymentHistory;