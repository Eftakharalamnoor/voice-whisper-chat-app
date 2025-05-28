
import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause } from 'lucide-react';
import { cn } from '@/lib/utils';

interface AudioPlayerProps {
  audioBlob: Blob;
  duration: number;
  className?: string;
}

const AudioPlayer: React.FC<AudioPlayerProps> = ({ audioBlob, duration, className }) => {
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [audioUrl, setAudioUrl] = useState<string>('');
  
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const url = URL.createObjectURL(audioBlob);
    setAudioUrl(url);
    
    return () => {
      URL.revokeObjectURL(url);
    };
  }, [audioBlob]);

  useEffect(() => {
    if (audioRef.current) {
      const audio = audioRef.current;
      
      const updateTime = () => setCurrentTime(audio.currentTime);
      const handleEnded = () => {
        setIsPlaying(false);
        setCurrentTime(0);
      };
      
      audio.addEventListener('timeupdate', updateTime);
      audio.addEventListener('ended', handleEnded);
      
      return () => {
        audio.removeEventListener('timeupdate', updateTime);
        audio.removeEventListener('ended', handleEnded);
      };
    }
  }, [audioUrl]);

  const togglePlay = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause();
      } else {
        audioRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const progress = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <div className={cn("flex items-center gap-3 p-3 bg-white rounded-2xl shadow-sm border", className)}>
      <button
        onClick={togglePlay}
        className="p-2 bg-emerald-500 hover:bg-emerald-600 text-white rounded-full transition-all duration-200 hover:scale-105"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 flex items-center gap-3">
        <div className="flex-1 bg-gray-200 rounded-full h-2 relative overflow-hidden">
          <div 
            className="bg-emerald-500 h-full rounded-full transition-all duration-100"
            style={{ width: `${progress}%` }}
          />
        </div>
        
        <span className="text-sm text-gray-600 font-medium min-w-[40px]">
          {formatTime(isPlaying ? currentTime : duration)}
        </span>
      </div>
      
      {audioUrl && (
        <audio
          ref={audioRef}
          src={audioUrl}
          preload="metadata"
        />
      )}
    </div>
  );
};

export default AudioPlayer;
