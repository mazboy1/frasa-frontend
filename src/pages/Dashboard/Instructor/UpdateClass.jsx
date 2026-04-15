import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAxiosSecure from '../../../hooks/useAxiosSecure';
import useUser from '../../../hooks/useUser';
import Swal from 'sweetalert2';
import { HashLoader } from 'react-spinners';

const UpdateClass = () => {
    const { id } = useParams();
    const { currentUser } = useUser();
    const axiosSecure = useAxiosSecure();
    const navigate = useNavigate();
    
    // ✅ STATE MANAGEMENT
    const [course, setCourse] = useState(null);
    const [modules, setModules] = useState([{ title: '', lessons: [{ title: '', videoLink: '', duration: '' }] }]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState(null);

    // ✅ FETCH CLASS DATA ON MOUNT
    useEffect(() => {
        const fetchClassData = async () => {
            try {
                setIsLoading(true);
                console.log('🔄 Fetching class data for ID:', id);
                
                const response = await axiosSecure.get(`/class-detail/${id}`);
                
                console.log('✅ Class data fetched:', response.data);
                
                if (response.data.success) {
                    const courseData = response.data.data;
                    setCourse(courseData);
                    
                    // Set modules dengan data yang sudah ada
                    if (courseData.modules && Array.isArray(courseData.modules)) {
                        setModules(courseData.modules);
                    }
                    setError(null);
                } else {
                    throw new Error('Failed to fetch class data');
                }
            } catch (err) {
                console.error('❌ Error fetching class:', err);
                const errorMsg = err.response?.data?.message || err.message || 'Gagal memuat data kelas';
                setError(errorMsg);
                Swal.fire({
                    title: 'Error',
                    text: errorMsg,
                    icon: 'error',
                    confirmButtonText: 'Kembali'
                }).then(() => {
                    navigate('/dashboard/my-classes');
                });
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchClassData();
        }
    }, [id, axiosSecure, navigate]);

    const addModule = () => {
        setModules([...modules, { title: '', lessons: [{ title: '', videoLink: '', duration: '' }] }]);
    };

    const removeModule = (index) => {
        if (modules.length <= 1) return;
        const newModules = [...modules];
        newModules.splice(index, 1);
        setModules(newModules);
    };

    const updateModuleTitle = (index, title) => {
        const newModules = [...modules];
        newModules[index].title = title;
        setModules(newModules);
    };

    const addLesson = (moduleIndex) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons.push({ title: '', videoLink: '', duration: '' });
        setModules(newModules);
    };

    const removeLesson = (moduleIndex, lessonIndex) => {
        const newModules = [...modules];
        if (newModules[moduleIndex].lessons.length <= 1) return;
        newModules[moduleIndex].lessons.splice(lessonIndex, 1);
        setModules(newModules);
    };

    const updateLesson = (moduleIndex, lessonIndex, field, value) => {
        const newModules = [...modules];
        newModules[moduleIndex].lessons[lessonIndex][field] = value;
        setModules(newModules);
    };

    const handleFormSubmit = async (e) => {
        e.preventDefault();
        setIsSubmitting(true);
        
        try {
            const formData = new FormData(e.target);
            const name = formData.get('name');
            const availableSeats = parseInt(formData.get('availableSeats'));
            const price = parseFloat(formData.get('price'));
            const description = formData.get('description');
            const category = formData.get('category');
            const prerequisites = formData.get('prerequisites');
            const objectives = formData.get('objectives')?.split('\n').filter(obj => obj.trim() !== '') || [];
            const targetAudience = formData.get('targetAudience');
            const level = formData.get('level');

            // Validasi modules
            let hasEmptyModule = false;
            let hasEmptyLesson = false;
            
            modules.forEach(module => {
                if (!module.title.trim()) hasEmptyModule = true;
                
                module.lessons.forEach(lesson => {
                    if (!lesson.title.trim() || !lesson.videoLink.trim()) {
                        hasEmptyLesson = true;
                    }
                });
            });

            if (hasEmptyModule) {
                throw new Error('Semua modul harus memiliki judul');
            }

            if (hasEmptyLesson) {
                throw new Error('Semua pelajaran harus memiliki judul dan link video');
            }

            // Hitung total durasi dan pelajaran
            let totalDuration = 0;
            let totalLessons = 0;
            
            modules.forEach(module => {
                totalLessons += module.lessons.length;
                module.lessons.forEach(lesson => {
                    if (lesson.duration) {
                        const [hours, minutes] = lesson.duration.split(':').map(Number);
                        totalDuration += (hours * 60) + (isNaN(minutes) ? 0 : minutes);
                    }
                });
            });
            
            const hours = Math.floor(totalDuration / 60);
            const minutes = totalDuration % 60;
            const totalDurationText = `${hours} jam ${minutes} menit`;

            const classData = {
                name,
                instructorName: currentUser?.name,
                instructorEmail: currentUser?.email,
                availableSeats,
                price,
                description,
                category,
                prerequisites,
                objectives,
                targetAudience,
                modules,
                totalDuration: totalDurationText,
                totalLessons,
                level
            };

            const response = await axiosSecure.put(`/update-class/${course._id}`, classData);
            
            if (response.data.success) {
                Swal.fire({
                    title: 'Berhasil!',
                    text: 'Kelas berhasil diperbarui!',
                    icon: 'success',
                    confirmButtonText: 'OK'
                }).then(() => {
                    navigate('/dashboard/my-classes');
                });
            } else {
                throw new Error('Gagal memperbarui kelas');
            }
        } catch (error) {
            console.error("Error updating class:", error);
            Swal.fire({
                title: 'Error!',
                text: error.message || error.response?.data?.error || 'Gagal memperbarui kelas. Silakan coba lagi.',
                icon: 'error',
                confirmButtonText: 'OK'
            });
        } finally {
            setIsSubmitting(false);
        }
    };

    // ✅ LOADING STATE
    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen bg-gray-50">
                <div className="text-center">
                    <HashLoader color="#36d7b7" size={50} />
                    <p className="text-gray-600 font-medium mt-4">Memuat data kelas...</p>
                </div>
            </div>
        );
    }

    // ✅ ERROR STATE
    if (error && !course) {
        return (
            <div className="min-h-screen bg-gray-50 py-8">
                <div className="container mx-auto px-4">
                    <div className="max-w-2xl mx-auto bg-red-50 p-8 rounded-lg border border-red-200">
                        <div className="text-6xl mb-4">❌</div>
                        <h2 className="text-2xl font-bold text-red-800 mb-2">Gagal Memuat Data</h2>
                        <p className="text-red-700 mb-6">{error}</p>
                        <button
                            onClick={() => navigate('/dashboard/my-classes')}
                            className="bg-red-600 hover:bg-red-700 text-white font-bold py-3 px-6 rounded-lg transition"
                        >
                            ← Kembali
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    // ✅ FORM RENDER
    if (!course) {
        return null;
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 py-8">
            <div className="container mx-auto px-4">
                <div className="mb-8">
                    <h1 className="text-4xl font-bold text-gray-800 mb-2">✏️ Perbarui Kelas</h1>
                    <p className="text-gray-600">Edit detail kelas: <span className="font-bold text-secondary">{course.name}</span></p>
                </div>
                
                <form onSubmit={handleFormSubmit} className="mx-auto p-8 bg-white rounded-lg shadow-md max-w-6xl">
                    {/* Informasi Dasar */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Informasi Dasar Kursus</h2>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Nama Kelas */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="name">
                                    Judul Kursus *
                                </label>
                                <input
                                    type="text"
                                    required
                                    placeholder="Contoh: Pemrograman JavaScript dari Dasar hingga Mahir"
                                    name="name"
                                    id="name"
                                    defaultValue={course.name || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                />
                            </div>

                            {/* Kategori Kursus */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="category">
                                    Kategori Kursus *
                                </label>
                                <select
                                    required
                                    name="category"
                                    id="category"
                                    defaultValue={course.category || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Pilih Kategori</option>
                                    <option value="pemrograman">Pemrograman</option>
                                    <option value="desain">Desain</option>
                                    <option value="bisnis">Bisnis</option>
                                    <option value="marketing">Marketing</option>
                                    <option value="keuangan">Keuangan</option>
                                    <option value="musik">Musik</option>
                                    <option value="fotografi">Fotografi</option>
                                    <option value="kesehatan">Kesehatan & Kebugaran</option>
                                    <option value="lainnya">Lainnya</option>
                                </select>
                            </div>

                            {/* Kuota Peserta */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="availableSeats">
                                    Kuota Peserta *
                                </label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="number"
                                    required
                                    min="1"
                                    placeholder="Jumlah maksimal peserta"
                                    name="availableSeats"
                                    id="availableSeats"
                                    defaultValue={course.availableSeats || ''}
                                />
                            </div>

                            {/* Harga */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="price">
                                    Harga (Rp) *
                                </label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    type="number"
                                    required
                                    min="0"
                                    step="1000"
                                    placeholder="Harga kursus"
                                    name="price"
                                    id="price"
                                    defaultValue={course.price || ''}
                                />
                            </div>

                            {/* Tingkatan Kursus */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2" htmlFor="level">
                                    Tingkatan *
                                </label>
                                <select
                                    required
                                    name="level"
                                    id="level"
                                    defaultValue={course.level || ''}
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                >
                                    <option value="">Pilih Tingkatan</option>
                                    <option value="pemula">Pemula</option>
                                    <option value="menengah">Menengah</option>
                                    <option value="mahir">Mahir</option>
                                    <option value="semua tingkat">Semua Tingkat</option>
                                </select>
                            </div>

                            {/* Info Instruktur */}
                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Nama Instruktur
                                </label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    type="text"
                                    value={currentUser?.name || ''}
                                    readOnly
                                    disabled
                                />
                            </div>

                            <div>
                                <label className="block text-gray-700 font-bold mb-2">
                                    Email Instruktur
                                </label>
                                <input
                                    className="w-full px-4 py-2 border border-gray-300 rounded-lg bg-gray-100 cursor-not-allowed"
                                    type="text"
                                    value={currentUser?.email || ''}
                                    readOnly
                                    disabled
                                />
                            </div>
                        </div>
                    </div>

                    {/* Deskripsi */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Deskripsi Kursus</h2>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="description">
                                Deskripsi Kursus *
                            </label>
                            <textarea
                                placeholder="Jelaskan secara detail apa yang akan dipelajari dalam kursus ini..."
                                name="description"
                                id="description"
                                defaultValue={course.description || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="5"
                                required
                            ></textarea>
                        </div>

                        {/* Yang akan dipelajari */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="objectives">
                                Yang Akan Dipelajari Peserta
                            </label>
                            <textarea
                                placeholder="Masukkan poin-poin pembelajaran (satu poin per baris)"
                                name="objectives"
                                id="objectives"
                                defaultValue={course.objectives ? (Array.isArray(course.objectives) ? course.objectives.join('\n') : course.objectives) : ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="4"
                            ></textarea>
                        </div>

                        {/* Prasyarat */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="prerequisites">
                                Prasyarat atau Pengetahuan Awal yang Diperlukan
                            </label>
                            <textarea
                                placeholder="Jelaskan pengetahuan atau keahlian apa yang perlu dimiliki peserta..."
                                name="prerequisites"
                                id="prerequisites"
                                defaultValue={course.prerequisites || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                            ></textarea>
                        </div>

                        {/* Target Audiens */}
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2" htmlFor="targetAudience">
                                Target Audiens
                            </label>
                            <textarea
                                placeholder="Jelaskan untuk siapa kursus ini ditujukan..."
                                name="targetAudience"
                                id="targetAudience"
                                defaultValue={course.targetAudience || ''}
                                className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                rows="3"
                            ></textarea>
                        </div>
                    </div>

                    {/* Bagian modul dan pelajaran */}
                    <div className="mb-8">
                        <h2 className="text-xl font-bold mb-4 text-gray-800 border-b pb-2">Kurikulum Kursus</h2>
                        
                        <div className="mb-6">
                            <label className="block text-gray-700 font-bold mb-2">
                                Struktur Kursus (Modul dan Pelajaran) *
                            </label>
                            
                            {modules && modules.length > 0 && modules.map((module, moduleIndex) => (
                                <div key={moduleIndex} className="mb-6 p-4 border border-gray-300 rounded-lg bg-gray-50">
                                    <div className="flex justify-between items-center mb-4">
                                        <h3 className="font-semibold text-lg">📚 Modul {moduleIndex + 1}</h3>
                                        <button 
                                            type="button"
                                            onClick={() => removeModule(moduleIndex)}
                                            className="text-red-500 hover:text-red-700 text-sm font-medium"
                                            disabled={modules.length <= 1}
                                        >
                                            🗑️ Hapus Modul
                                        </button>
                                    </div>
                                    
                                    <div className="mb-4">
                                        <label className="block text-gray-700 font-bold mb-2">Judul Modul *</label>
                                        <input
                                            type="text"
                                            required
                                            placeholder="Contoh: Pengenalan JavaScript"
                                            value={module.title || ''}
                                            onChange={(e) => updateModuleTitle(moduleIndex, e.target.value)}
                                            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        />
                                    </div>
                                    
                                    <div className="mb-4">
                                        <div className="flex justify-between items-center mb-3">
                                            <label className="block text-gray-700 font-bold">Daftar Pelajaran</label>
                                            <button 
                                                type="button"
                                                onClick={() => addLesson(moduleIndex)}
                                                className="text-blue-500 hover:text-blue-700 text-sm font-medium bg-blue-50 px-3 py-1 rounded"
                                            >
                                                ➕ Tambah Pelajaran
                                            </button>
                                        </div>
                                        
                                        {module.lessons && module.lessons.map((lesson, lessonIndex) => (
                                            <div key={lessonIndex} className="mb-4 p-3 bg-white rounded-lg border border-gray-200">
                                                <div className="flex justify-between items-center mb-3">
                                                    <span className="text-sm font-bold text-gray-700">Pelajaran {lessonIndex + 1}</span>
                                                    <button 
                                                        type="button"
                                                        onClick={() => removeLesson(moduleIndex, lessonIndex)}
                                                        className="text-red-500 hover:text-red-700 text-xs font-medium"
                                                        disabled={module.lessons.length <= 1}
                                                    >
                                                        ✕ Hapus
                                                    </button>
                                                </div>
                                                
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-3">
                                                    <div>
                                                        <label className="block text-gray-600 text-sm mb-1">Judul Pelajaran *</label>
                                                        <input
                                                            type="text"
                                                            required
                                                            placeholder="Contoh: Variabel dan Tipe Data"
                                                            value={lesson.title || ''}
                                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'title', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                    <div>
                                                        <label className="block text-gray-600 text-sm mb-1">Durasi (HH:MM)</label>
                                                        <input
                                                            type="text"
                                                            placeholder="00:15"
                                                            value={lesson.duration || ''}
                                                            onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'duration', e.target.value)}
                                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                        />
                                                    </div>
                                                </div>
                                                
                                                <div>
                                                    <label className="block text-gray-600 text-sm mb-1">Link Video YouTube *</label>
                                                    <input
                                                        type="url"
                                                        required
                                                        placeholder="https://youtube.com/embed/xxx"
                                                        value={lesson.videoLink || ''}
                                                        onChange={(e) => updateLesson(moduleIndex, lessonIndex, 'videoLink', e.target.value)}
                                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm"
                                                    />
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            
                            <button
                                type="button"
                                onClick={addModule}
                                className="flex items-center gap-2 text-blue-600 hover:text-blue-700 font-bold bg-blue-50 px-4 py-2 rounded-lg"
                            >
                                <span>➕</span>
                                Tambah Modul Baru
                            </button>
                        </div>
                    </div>

                    {/* Tombol Submit */}
                    <div className="text-center pt-6 border-t border-gray-200">
                        <button
                            className={`bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-8 rounded-lg transition duration-200 w-full max-w-md mx-auto ${
                                isSubmitting ? 'opacity-70 cursor-not-allowed' : ''
                            }`}
                            type="submit"
                            disabled={isSubmitting}
                        >
                            {isSubmitting ? (
                                <div className="flex items-center justify-center gap-2">
                                    <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                                    Memperbarui...
                                </div>
                            ) : (
                                '✏️ Perbarui Kelas'
                            )}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default UpdateClass;