import React, { useEffect, useState } from 'react'
import useUser from '../../../../hooks/useUser'
import useAxiosFetch from '../../../../hooks/useAxiosFetch';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { FiUser, FiMail, FiBriefcase, FiSend } from "react-icons/fi";
import { motion } from 'framer-motion';
import Swal from 'sweetalert2';

const AsInstructor = () => {
  const { currentUser } = useUser();
  const [submittedData, setSubmittedData] = useState({});
  const [loading, setLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const axiosFetch = useAxiosFetch();
  const axiosSecure = useAxiosSecure();

  const inputVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: { opacity: 1, y: 0 }
  };

  const buttonVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 }
  };

  // ✅ FIX: Proper form submission with error handling
  const onSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setIsSubmitting(true);
      
      // Validation
      const name = e.target.name.value?.trim();
      const email = e.target.email.value?.trim();
      const experience = e.target.experience.value?.trim();
      
      console.log('📝 Form data:', { name, email, experience });
      
      if (!name || !email || !experience) {
        Swal.fire('Error', 'Semua field harus diisi', 'error');
        setIsSubmitting(false);
        return;
      }
      
      if (experience.length < 10) {
        Swal.fire('Error', 'Pengalaman minimal 10 karakter', 'error');
        setIsSubmitting(false);
        return;
      }
      
      const data = {
        name, 
        email, 
        experience,
        submitted: new Date().toISOString()
      };
      
      console.log('📤 Sending data:', data);
      
      // Try with axiosSecure first (dengan JWT)
      try {
        const res = await axiosSecure.post(`/api/as-instructor`, data);
        console.log('✅ Success (axiosSecure):', res.data);
        
        Swal.fire({
          title: '✅ Berhasil!',
          text: 'Aplikasi Anda telah dikirim. Admin akan meninjaunya segera.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        setSubmittedData(data);
        e.target.reset();
      } catch (err) {
        console.warn('⚠️ axiosSecure failed, trying axiosFetch...');
        
        // Fallback: try with axiosFetch
        const res = await axiosFetch.post(`/as-instructor`, data);
        console.log('✅ Success (axiosFetch):', res.data);
        
        Swal.fire({
          title: '✅ Berhasil!',
          text: 'Aplikasi Anda telah dikirim. Admin akan meninjaunya segera.',
          icon: 'success',
          confirmButtonText: 'OK'
        });
        
        setSubmittedData(data);
        e.target.reset();
      }
    } catch (error) {
      console.error('❌ Error submitting form:', error);
      
      const errorMsg = error.response?.data?.message || error.message || 'Gagal mengirim aplikasi';
      
      Swal.fire({
        title: '❌ Error',
        text: errorMsg,
        icon: 'error',
        confirmButtonText: 'Coba Lagi'
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (!currentUser?.email) {
      setLoading(false);
      return;
    }
    
    const fetchApplicationStatus = async () => {
      try {
        console.log('🔍 Checking application status for:', currentUser.email);
        
        try {
          const res = await axiosSecure.get(`/api/applied-instructors/${currentUser.email}`);
          console.log('✅ Application status (axiosSecure):', res.data);
          setSubmittedData(res.data?.data || res.data);
        } catch (err) {
          console.warn('⚠️ axiosSecure failed, trying axiosFetch...');
          
          const res = await axiosFetch.get(`/applied-instructors/${currentUser.email}`);
          console.log('✅ Application status (axiosFetch):', res.data);
          setSubmittedData(res.data?.data || res.data);
        }
      } catch (err) {
        console.warn('⚠️ Error fetching application status:', err.message);
        // Don't block if fetch fails
        setSubmittedData({});
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplicationStatus();
  }, [currentUser?.email]);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-96">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className='my-20'>
      <div className="container mx-auto px-4">
        {submittedData?.name ? (
          // ✅ Already applied
          <div className="max-w-2xl mx-auto bg-green-50 border border-green-200 rounded-lg p-8 text-center">
            <div className="text-5xl mb-4">✅</div>
            <h2 className="text-2xl font-bold text-green-800 mb-2">Aplikasi Sudah Dikirim</h2>
            <p className="text-green-700 mb-4">
              Terima kasih telah mendaftar sebagai instruktur. Admin kami akan meninjau aplikasi Anda segera.
            </p>
            <div className="text-left bg-white p-4 rounded mt-4">
              <p className="text-gray-700"><strong>Nama:</strong> {submittedData.name}</p>
              <p className="text-gray-700"><strong>Email:</strong> {submittedData.email}</p>
              <p className="text-gray-700"><strong>Pengalaman:</strong></p>
              <p className="text-gray-600 ml-4">{submittedData.experience}</p>
            </div>
          </div>
        ) : (
          // ✅ Form untuk apply
          <div className="max-w-2xl mx-auto">
            <h1 className="text-3xl font-bold mb-6 text-gray-800">🎓 Daftar sebagai Instruktur</h1>
            <p className="text-gray-600 mb-8">Isi formulir di bawah untuk mendaftar menjadi instruktur di platform kami.</p>
            
            <form onSubmit={onSubmit} className="bg-white p-8 rounded-lg shadow-md">
              {/* Name Field */}
              <div className="mb-6">
                <label className="text-gray-700 font-semibold block mb-2" htmlFor="name">
                  Nama Lengkap
                </label>
                <div className="flex items-center">
                  <FiUser className="text-gray-500 mr-2" />
                  <input
                    defaultValue={currentUser?.name || ''}
                    className="w-full border-b border-gray-300 focus:border-secondary outline-none py-2 bg-gray-50 px-2 rounded"
                    type="text"
                    id="name"
                    name="name"
                    required
                  />
                </div>
              </div>

              {/* Email Field */}
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.1 }}
                className="mb-6"
              >
                <label className="text-gray-700 font-semibold block mb-2" htmlFor="email">
                  Email
                </label>
                <div className="flex items-center">
                  <FiMail className="text-gray-500 mr-2" />
                  <input
                    defaultValue={currentUser?.email || ''}
                    className="w-full border-b border-gray-300 focus:border-secondary outline-none py-2 bg-gray-50 px-2 rounded"
                    type="email"
                    id="email"
                    name="email"
                    required
                  />
                </div>
              </motion.div>

              {/* Experience Field */}
              <motion.div
                variants={inputVariants}
                initial="hidden"
                animate="visible"
                transition={{ duration: 0.5, delay: 0.3 }}
                className="mb-6"
              >
                <label className="text-gray-700 font-semibold block mb-2" htmlFor="experience">
                  Pengalaman Mengajar
                </label>
                <div className="flex items-start">
                  <FiBriefcase className="text-gray-500 mr-2 mt-2" />
                  <textarea
                    placeholder="Ceritakan tentang pengalaman mengajar Anda, keahlian, dan area yang ingin Anda ajarkan..."
                    className="w-full border border-gray-300 focus:border-secondary outline-none rounded-lg px-3 py-2 resize-none"
                    id="experience"
                    name="experience"
                    rows="5"
                    required
                    minLength="10"
                  ></textarea>
                </div>
                <p className="text-xs text-gray-500 mt-1">Minimal 10 karakter</p>
              </motion.div>

              {/* Submit Button */}
              <div className="flex justify-center mt-8">
                <motion.button
                  variants={buttonVariants}
                  initial="hidden"
                  animate="visible"
                  transition={{ duration: 0.5, delay: 0.4 }}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center px-8 py-3 bg-secondary hover:bg-secondary-dark text-white rounded-lg font-semibold transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <FiSend className="mr-2" />
                  {isSubmitting ? 'Mengirim...' : 'Kirim Aplikasi'}
                </motion.button>
              </div>
            </form>
          </div>
        )}
      </div>
    </div>
  );
}

export default AsInstructor;