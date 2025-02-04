import React, { useRef, useEffect, useState } from 'react';
import { Play, Pause, RotateCcw } from 'lucide-react';
import styles from '../styles/components/optimizedvideo.module.scss';

const OptimizedVideo = ({ src, className = '', style = {} }) => {
  const videoRef = useRef(null);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    setIsLoaded(false);
    setIsPlaying(true);
    if (videoRef.current) {
      videoRef.current.load();
    }
  }, [src]);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const restartVideo = () => {
    if (videoRef.current) {
      videoRef.current.currentTime = 0;
      videoRef.current.play();
      setIsPlaying(true);
    }
  };

  const onLoadedData = () => {
    setIsLoaded(true);
  };

  return (
    <div className={`${styles.videoWrapper} ${className}`}>
      {/* Video with loading state */}
      <div className={styles.videoContainer}>
        {!isLoaded && (
          <div className={styles.loadingOverlay} />
        )}
        <video
          ref={videoRef}
          className={styles.video}
          style={style}
          playsInline
          loop
          muted
          autoPlay
          preload="auto"
          onLoadedData={onLoadedData}
        >
          <source src={src} type="video/mp4" />
        </video>
      </div>

      {/* Controls overlay */}
      <div className={styles.controls}>
        <div className={styles.controlsInner}>
          <button
            onClick={togglePlay}
            className={styles.controlButton}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? <Pause size={24} /> : <Play size={24} />}
          </button>
          <button
            onClick={restartVideo}
            className={styles.controlButton}
            aria-label="Restart"
          >
            <RotateCcw size={24} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OptimizedVideo;