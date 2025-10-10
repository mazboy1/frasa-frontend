// components/InstructorCP.jsx - EXAMPLE
import React from 'react';
import { Link } from 'react-router-dom';

const InstructorCP = () => {
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Dashboard Instruktur</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        <Link 
          to="/dashboard/add-class" 
          className="bg-blue-500 hover:bg-blue-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">➕ Tambah Kelas</h3>
          <p>Buat kelas baru</p>
        </Link>
        
        <Link 
          to="/dashboard/my-classes" 
          className="bg-green-500 hover:bg-green-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">📚 Kelas Saya</h3>
          <p>Lihat semua kelas</p>
        </Link>
        
        <Link 
          to="/dashboard/pending-classes" 
          className="bg-orange-500 hover:bg-orange-600 text-white p-6 rounded-lg text-center transition duration-200"
        >
          <h3 className="text-xl font-bold mb-2">⏳ Kelas Pending</h3>
          <p>Kelas menunggu persetujuan</p>
        </Link>
      </div>

      {/* Quick Stats */}
      <div className="bg-gray-50 p-6 rounded-lg">
        <h2 className="text-2xl font-bold mb-4">Statistik Cepat</h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-blue-600">0</div>
            <div className="text-gray-600">Total Kelas</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-green-600">0</div>
            <div className="text-gray-600">Disetujui</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-orange-600">0</div>
            <div className="text-gray-600">Pending</div>
          </div>
          <div className="text-center p-4 bg-white rounded-lg shadow">
            <div className="text-2xl font-bold text-red-600">0</div>
            <div className="text-gray-600">Ditolak</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default InstructorCP;