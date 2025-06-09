
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

  // Generate static waveform bars for voice message
  const waveformBars = Array.from({ length: 20 }, (_, i) => {
    const heights = [8, 12, 16, 20, 24, 18, 14, 10, 6, 8, 12, 18, 22, 16, 12, 8, 6, 10, 14, 8];
    return heights[i] || 8;
  });

  return (
    <div className={cn("flex items-center gap-3 py-1", className)}>
      <button
        onClick={togglePlay}
        className="p-2 bg-[#128C7E] hover:bg-[#0F7B6C] text-white rounded-full transition-all duration-200 flex-shrink-0"
      >
        {isPlaying ? (
          <Pause className="w-4 h-4" />
        ) : (
          <Play className="w-4 h-4 ml-0.5" />
        )}
      </button>
      
      <div className="flex-1 flex items-center gap-2">
        {/* WhatsApp-style waveform */}
        <div className="flex items-center gap-0.5 flex-1">
          {waveformBars.map((height, index) => {
            const isActive = (index / waveformBars.length) * 100 <= progress;
            return (
              <div
                key={index}
                className={cn(
                  "w-1 rounded-full transition-colors duration-200",
                  isActive ? "bg-[#128C7E]" : "bg-gray-300"
                )}
                style={{ height: `${height}px` }}
              />
            );
          })}
        </div>
        
        <span className="text-xs text-gray-600 font-medium min-w-[35px] text-right">
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
