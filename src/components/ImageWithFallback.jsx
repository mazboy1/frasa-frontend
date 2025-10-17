import React, { useState } from 'react';

const ImageWithFallback = ({ 
  src, 
  alt, 
  className, 
  fallbackSrc = 'https://via.placeholder.com/300x200?text=Gambar+Tidak+Tersedia',
  ...props 
}) => {
  const [imgSrc, setImgSrc] = useState(() => {
    // Validasi src sebelum digunakan
    if (!src || typeof src !== 'string' || src.trim() === '') {
      return fallbackSrc;
    }
    return src;
  });

  const [hasError, setHasError] = useState(false);

  const handleError = () => {
    if (!hasError) {
      setHasError(true);
      setImgSrc(fallbackSrc);
    }
  };

  // Pastikan src selalu string yang valid
  const finalSrc = hasError ? fallbackSrc : imgSrc;

  return (
    <img
      src={finalSrc}
      alt={alt || 'Image'}
      className={className}
      onError={handleError}
      {...props}
    />
  );
};

export default ImageWithFallback;