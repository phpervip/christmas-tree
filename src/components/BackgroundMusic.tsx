import React, { useState, useEffect, useRef } from 'react';

const BackgroundMusic: React.FC = () => {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    const audio = audioRef.current;
    if (audio) {
      // 尝试自动播放
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise
          .then(() => {
            setIsPlaying(true);
          })
          .catch((error) => {
            console.log('Auto-play prevented:', error);
            // 即使自动播放被阻止，也要保持控件可见
            setIsVisible(true);
            // 设置初始状态为未播放
            setIsPlaying(false);
          });
      }
    }

    // 页面可见性变化时处理音频播放/暂停
    const handleVisibilityChange = () => {
      if (document.hidden && audioRef.current) {
        audioRef.current.pause();
        setIsPlaying(false);
      } else if (!document.hidden && audioRef.current && isPlaying) {
        audioRef.current.play().catch(error => console.log('Play failed:', error));
      }
    };

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, []);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      audio.play().catch(error => console.log('Play failed:', error));
      setIsPlaying(true);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    // 即使隐藏控件，也要继续播放音乐
    const audio = audioRef.current;
    if (audio && !isPlaying) {
      audio.play().catch(error => console.log('Play failed:', error));
      setIsPlaying(true);
    }
  };

  if (!isVisible) return null;

  return (
    <>
      <audio 
        ref={audioRef} 
        loop 
        preload="auto"
      >
        <source src="/music/bg.mp3" type="audio/mpeg" />
        Your browser does not support the audio element.
      </audio>
      
      <div className="fixed top-3/4 left-2 transform -translate-y-1/2 z-50 bg-black/30 backdrop-blur-sm rounded-full p-1 flex flex-col items-center gap-2">
        <button
          onClick={togglePlay}
          className="w-10 h-10 flex items-center justify-center rounded-full bg-gradient-to-r from-pink-500 to-yellow-500 text-white hover:scale-105 transition-transform"
          aria-label={isPlaying ? "Pause music" : "Play music"}
        >
          {isPlaying ? (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zM7 8a1 1 0 012 0v4a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v4a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
              <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM9.555 7.168A1 1 0 008 8v4a1 1 0 001.555.832l3-2a1 1 0 000-1.664l-3-2z" clipRule="evenodd" />
            </svg>
          )}
        </button>
        
        {/* <button
          onClick={handleClose}
          className="ml-2 w-6 h-6 flex items-center justify-center rounded-full bg-gray-600 text-white hover:bg-gray-700"
          aria-label="Close music control"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
          </svg>
        </button> */}
      </div>
    </>
  );
};

export default BackgroundMusic;