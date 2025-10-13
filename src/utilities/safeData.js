// utils/safeData.js
export const safeArray = (data) => {
  return Array.isArray(data) ? data : [];
};

export const safeObject = (data) => {
  return data && typeof data === 'object' ? data : {};
};

export const safeString = (data, fallback = '') => {
  return typeof data === 'string' ? data : fallback;
};

export const safeNumber = (data, fallback = 0) => {
  const num = Number(data);
  return isNaN(num) ? fallback : num;
};

export const safeImage = (url, fallback = 'https://via.placeholder.com/400x300?text=No+Image') => {
  return url && typeof url === 'string' ? url : fallback;
};

// Validasi data kelas
export const validateClassData = (classData) => {
  if (!classData || typeof classData !== 'object') {
    return {
      isValid: false,
      errors: ['Invalid class data structure']
    };
  }

  const errors = [];
  
  if (!classData._id) errors.push('Missing class ID');
  if (!classData.name) errors.push('Missing class name');
  
  return {
    isValid: errors.length === 0,
    errors,
    data: {
      _id: classData._id,
      name: safeString(classData.name),
      image: safeImage(classData.image),
      instructorName: safeString(classData.instructorName, 'Instruktur Tidak Diketahui'),
      description: safeString(classData.description, 'Tidak ada deskripsi'),
      price: safeNumber(classData.price),
      availableSeats: safeNumber(classData.availableSeats),
      totalEnrolled: safeNumber(classData.totalEnrolled),
      level: safeString(classData.level, 'Tidak ditentukan'),
      category: safeString(classData.category, 'Tidak dikategorikan'),
      totalDuration: safeString(classData.totalDuration, 'Durasi tidak tersedia'),
      modules: safeArray(classData.modules),
      objectives: safeArray(classData.objectives),
      prerequisites: safeString(classData.prerequisites),
      targetAudience: safeString(classData.targetAudience),
      status: safeString(classData.status, 'unknown')
    }
  };
};