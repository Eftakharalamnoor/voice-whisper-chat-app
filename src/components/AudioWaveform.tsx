
import React from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioLevel, isRecording, className }) => {
  const bars = Array.from({ length: 20 }, (_, i) => {
    const baseHeight = 4;
    const maxHeight = 32;
    
    if (isRecording) {
      // Create animated waveform during recording
      const intensity = audioLevel * (Math.random() * 0.5 + 0.5);
      const height = baseHeight + (intensity * (maxHeight - baseHeight));
      return Math.max(baseHeight, height);
    } else {
      // Static waveform for completed recording
      const staticHeights = [8, 16, 12, 24, 20, 32, 16, 8, 12, 28, 24, 16, 20, 12, 32, 8, 16, 24, 12, 20];
      return staticHeights[i] || baseHeight;
    }
  });

  return (
    <div className={cn("flex items-center gap-1 h-8", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-100",
            isRecording 
              ? "bg-red-500 animate-pulse" 
              : "bg-emerald-500"
          )}
          style={{
            height: `${height}px`,
            animationDelay: isRecording ? `${index * 50}ms` : '0ms'
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
