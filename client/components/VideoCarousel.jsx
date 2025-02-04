import React, { useState, useEffect } from 'react';
import OptimizedVideo from './OptimizedVideo';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import styles from '../styles/components/videocarousel.module.scss';

const VideoCarousel = ({ videos, className = '', maxHeight }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  const handleNext = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((current) => (current + 1) % videos.length);
  };

  const handlePrevious = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setCurrentIndex((current) => (current - 1 + videos.length) % videos.length);
  };

  const containerStyle = {
    ...(maxHeight ? { maxHeight } : {}),
    width: '100%',
    aspectRatio: '16/9',
  };

  console.log(currentIndex);

  return (
    <div 
      className={`${styles.container} ${className}`}
      style={containerStyle}
    >
      <div className={styles.videoWrapper}>
        <OptimizedVideo 
          src={`/videos/${videos[currentIndex]}`} 
          style={{ maxHeight: '100%', width: '100%', height: '100%' }}
        />
      </div>
      
      <div className={styles.navigationContainer}>
        <button
          onClick={handlePrevious}
          className={styles.navigationButton}
          aria-label="Previous video"
        >
          <ChevronLeft size={28} />
        </button>
        
        <button
          onClick={handleNext}
          className={styles.navigationButton}
          aria-label="Next video"
        >
          <ChevronRight size={28} />
        </button>
      </div>
      
      <div className={styles.dotsContainer}>
        {videos.map((_, index) => (
          <button
            key={index}
            className={`${styles.dot} ${index === currentIndex ? styles.active : ''}`}
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              setCurrentIndex(index);
            }}
            aria-label={`Switch to video ${index + 1}`}
          />
        ))}
      </div>
    </div>
  );
};

export default VideoCarousel; 