import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import useUser from '../../../../hooks/useUser';
import useAxiosSecure from '../../../../hooks/useAxiosSecure';
import { FaLevelUpAlt, FaClock, FaChalkboardTeacher, FaCheckCircle } from 'react-icons/fa';
import { MdPlayLesson } from 'react-icons/md';
import Swal from 'sweetalert2';

const CoursesStudy = () => {
  const { currentUser } = useUser();
  const location = useLocation();
  const navigate = useNavigate();
  const axiosSecure = useAxiosSecure();
  
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolledClasses, setEnrolledClasses] = useState([]);
  const [activeModule, setActiveModule] = useState(0);
  const [activeLesson, setActiveLesson] = useState(0);
  const [completedLessons, setCompletedLessons] = useState([]);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState(null);

  useEffect(() => {
    const initializeCourse = async () => {
      try {
        // Check if user is authenticated
        if (!currentUser?.email) {
          console.warn('⚠️ User not authenticated');
          setError('Silakan login terlebih dahulu');
          setTimeout(() => navigate('/login'), 2000);
          return;
        }

        // Check if classId exists
        if (!location.state?.classId) {
          console.warn('⚠️ No classId provided');
          navigate('/dashboard/enrolled-classes');
          return;
        }

        console.log('🔄 Initializing course:', location.state.classId);

        // Verify user is enrolled
        const enrollmentResponse = await axiosSecure.get(`/enrolled-classes/${currentUser.email}`);
        const isEnrolled = enrollmentResponse.data.some(
          enrolledClass => (enrolledClass.classes?._id || enrolledClass._id) === location.state.classId
        );
        
        if (!isEnrolled) {
          Swal.fire({
            title: '❌ Akses Ditolak',
            text: 'Anda belum terdaftar di kelas ini',
            icon: 'error',
            confirmButtonText: 'Kembali'
          }).then(() => {
            navigate('/dashboard/enrolled-classes');
          });
          return;
        }

        setEnrolledClasses(enrollmentResponse.data);
        
        // Fetch course with modules
        const courseResponse = await axiosSecure.get(`/class-with-modules/${location.state.classId}`);
        const courseData = courseResponse.data?.data || courseResponse.data;
        
        if (!courseData) {
          throw new Error('Data kursus tidak valid');
        }

        console.log('✅ Course loaded:', courseData.name);
        setCourse(courseData);
        
        // Load user progress
        loadUserProgress(courseData._id);
        setError(null);
      } catch (error) {
        console.error('❌ Error initializing course:', error);
        
        let errorMsg = 'Terjadi kesalahan saat memuat kursus';
        if (error.response?.status === 401) {
          errorMsg = 'Session expired, silakan login kembali';
        } else if (error.response?.status === 404) {
          errorMsg = 'Kursus tidak ditemukan';
        } else if (error.message) {
          errorMsg = error.message;
        }

        setError(errorMsg);
        Swal.fire({
          title: '❌ Error',
          text: errorMsg,
          icon: 'error',
          confirmButtonText: 'Kembali'
        }).then(() => {
          navigate('/dashboard/enrolled-classes');
        });
      } finally {
        setLoading(false);
      }
    };

    if (currentUser?.email) {
      initializeCourse();
    } else {
      setLoading(false);
    }
  }, [currentUser?.email, location.state?.classId, navigate, axiosSecure]);

  const loadUserProgress = async (courseId) => {
    try {
      const progressData = localStorage.getItem(`progress_${currentUser.email}_${courseId}`);
      if (progressData) {
        const { completed, progress: progressValue } = JSON.parse(progressData);
        setCompletedLessons(completed || []);
        setProgress(progressValue || 0);
      }
    } catch (error) {
      console.error('❌ Error loading progress:', error);
    }
  };

  const saveProgress = (lessonId, courseId) => {
    try {
      const newCompleted = [...completedLessons, lessonId];
      const totalLessons = course?.modules?.reduce((total, module) => total + (module.lessons?.length || 0), 0) || 1;
      const newProgress = Math.round((newCompleted.length / totalLessons) * 100);
      
      setCompletedLessons(newCompleted);
      setProgress(newProgress);
      
      localStorage.setItem(
        `progress_${currentUser.email}_${courseId}`, 
        JSON.stringify({ completed: newCompleted, progress: newProgress })
      );
      
      console.log(`✅ Progress saved: ${newProgress}%`);
    } catch (error) {
      console.error('❌ Error saving progress:', error);
    }
  };

  const extractYouTubeID = (url) => {
    if (!url) return null;
    const regExp = /^.*((youtu.be\/)|(v\/)|(\/u\/\w\/)|(embed\/)|(watch\?))\??v?=?([^#&?]*).*/;
    const match = url.match(regExp);
    return (match && match[7]?.length === 11) ? match[7] : null;
  };

  const isLessonCompleted = (moduleIndex, lessonIndex) => {
    const lessonId = `${moduleIndex}-${lessonIndex}`;
    return completedLessons.includes(lessonId);
  };

  const markAsCompleted = () => {
    const lessonId = `${activeModule}-${activeLesson}`;
    if (!isLessonCompleted(activeModule, activeLesson)) {
      saveProgress(lessonId, course._id);
      
      Swal.fire({
        title: '✅ Pelajaran Selesai!',
        text: 'Pelajaran telah ditandai sebagai selesai',
        icon: 'success',
        confirmButtonText: 'Lanjutkan',
        timer: 2000
      });
    }
  };

  const currentVideo = course?.modules?.[activeModule]?.lessons?.[activeLesson]?.videoLink;
  const currentLesson = course?.modules?.[activeModule]?.lessons?.[activeLesson];

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-secondary mx-auto mb-4"></div>
          <p className="text-gray-600">Memuat kursus...</p>
        </div>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="bg-red-50 border border-red-200 rounded-lg p-6 max-w-md text-center">
          <p className="text-red-800 mb-4">❌ {error || 'Gagal memuat kursus'}</p>
          <button 
            onClick={() => navigate('/dashboard/enrolled-classes')}
            className="bg-red-600 hover:bg-red-700 text-white font-medium py-2 px-6 rounded-lg"
          >
            Kembali
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header dengan Progress Bar */}
      <div className="bg-white shadow-sm sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button 
              onClick={() => navigate('/dashboard/enrolled-classes')}
              className="flex items-center text-secondary hover:text-secondary-dark font-medium transition-colors"
            >
              <FaLevelUpAlt className="rotate-90 mr-2" />
              ← Kembali
            </button>
            <div className="flex items-center gap-3">
              <div className="w-48 bg-gray-200 rounded-full h-2.5">
                <div 
                  className="bg-green-600 h-2.5 rounded-full transition-all" 
                  style={{ width: `${progress}%` }}
                ></div>
              </div>
              <span className="text-sm font-medium text-gray-700 whitespace-nowrap">{progress}% selesai</span>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Video Player */}
            {currentVideo ? (
              <div className="bg-white rounded-lg shadow-md p-6 mb-6">
                <div className="relative pb-[56.25%] h-0 bg-black rounded-lg overflow-hidden">
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${extractYouTubeID(currentVideo)}?rel=0`}
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    title={currentLesson?.title || "Video pelajaran"}
                  ></iframe>
                </div>

                {/* Lesson Info */}
                <div className="mt-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-gray-800">
                      {currentLesson?.title || 'Pelajaran'}
                    </h2>
                    <p className="text-sm text-gray-600 mt-1">
                      {currentLesson?.duration ? `⏱️ ${currentLesson.duration}` : ''}
                    </p>
                  </div>
                  <button
                    onClick={markAsCompleted}
                    disabled={isLessonCompleted(activeModule, activeLesson)}
                    className={`px-6 py-2 rounded-lg font-medium transition-colors ${
                      isLessonCompleted(activeModule, activeLesson)
                        ? 'bg-green-100 text-green-700 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white'
                    }`}
                  >
                    {isLessonCompleted(activeModule, activeLesson) ? '✅ Selesai' : 'Tandai Selesai'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-md p-12 text-center mb-6">
                <div className="text-5xl mb-4">📚</div>
                <h2 className="text-xl font-bold mb-2">Selamat Datang di {course?.name}</h2>
                <p className="text-gray-600">Pilih pelajaran dari sidebar untuk mulai belajar</p>
              </div>
            )}

            {/* Description */}
            {currentLesson?.description && (
              <div className="bg-white rounded-lg shadow-md p-6">
                <h3 className="text-xl font-semibold mb-4">📝 Deskripsi Pelajaran</h3>
                <p className="text-gray-700 leading-relaxed">{currentLesson.description}</p>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-lg shadow-md p-6 sticky top-24">
              <h2 className="text-xl font-bold mb-4">📖 {course?.name}</h2>
              
              <div className="flex items-center text-sm text-gray-600 mb-6 space-x-4">
                <span className="flex items-center">
                  <FaChalkboardTeacher className="mr-1" />
                  {course?.instructorName}
                </span>
                <span className="flex items-center">
                  <FaClock className="mr-1" />
                  {course?.totalDuration || '10h'}
                </span>
              </div>

              {/* Modules List */}
              {course?.modules && course.modules.length > 0 ? (
                <div className="max-h-96 overflow-y-auto">
                  <h4 className="font-semibold mb-3">📚 Kurikulum</h4>
                  <div className="space-y-2">
                    {course.modules.map((module, moduleIndex) => (
                      <div key={moduleIndex} className="border rounded-lg overflow-hidden">
                        <div className="p-3 bg-gray-50 font-medium text-sm">
                          Modul {moduleIndex + 1}: {module.title}
                        </div>
                        <div className="space-y-1 p-2 bg-white">
                          {module.lessons?.map((lesson, lessonIndex) => (
                            <button
                              key={lessonIndex}
                              onClick={() => {
                                setActiveModule(moduleIndex);
                                setActiveLesson(lessonIndex);
                              }}
                              className={`w-full text-left flex items-center p-2 rounded text-sm transition-colors ${
                                activeModule === moduleIndex && activeLesson === lessonIndex 
                                  ? 'bg-blue-100 text-blue-900' 
                                  : 'hover:bg-gray-50 text-gray-700'
                              }`}
                            >
                              <MdPlayLesson className={`mr-2 ${
                                isLessonCompleted(moduleIndex, lessonIndex) 
                                  ? 'text-green-500' 
                                  : 'text-gray-400'
                              }`} />
                              <span className="flex-1">{lesson.title}</span>
                              {isLessonCompleted(moduleIndex, lessonIndex) && (
                                <FaCheckCircle className="text-green-500 text-xs" />
                              )}
                            </button>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <p className="text-sm text-gray-500 text-center py-4">Belum ada modul</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CoursesStudy;