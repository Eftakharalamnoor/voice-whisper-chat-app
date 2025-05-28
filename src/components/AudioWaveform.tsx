
import React from 'react';
import { cn } from '@/lib/utils';

interface AudioWaveformProps {
  audioLevel: number;
  isRecording: boolean;
  className?: string;
}

const AudioWaveform: React.FC<AudioWaveformProps> = ({ audioLevel, isRecording, className }) => {
  const bars = Array.from({ length: 30 }, (_, i) => {
    const baseHeight = 4;
    const maxHeight = 40;
    
    if (isRecording) {
      // Create live waveform that responds to voice input
      const distanceFromCenter = Math.abs(i - 15) / 15; // Distance from center (0-1)
      const centerBoost = 1 - distanceFromCenter * 0.5; // Boost center bars
      
      // Add some randomness for natural look
      const randomFactor = 0.7 + Math.random() * 0.6;
      
      // Calculate height based on audio level
      const intensity = audioLevel * centerBoost * randomFactor;
      const height = baseHeight + (intensity * (maxHeight - baseHeight));
      
      return Math.max(baseHeight, Math.min(maxHeight, height));
    } else {
      // Static waveform for completed recording
      const staticHeights = [
        8, 12, 16, 20, 24, 32, 28, 24, 20, 16, 12, 8, 16, 24, 36, 
        32, 28, 24, 20, 16, 12, 8, 16, 20, 24, 28, 20, 16, 12, 8
      ];
      return staticHeights[i] || baseHeight;
    }
  });

  return (
    <div className={cn("flex items-center justify-center gap-0.5 h-10", className)}>
      {bars.map((height, index) => (
        <div
          key={index}
          className={cn(
            "w-1 rounded-full transition-all duration-75 ease-out",
            isRecording 
              ? "bg-red-500" 
              : "bg-emerald-500"
          )}
          style={{
            height: `${height}px`,
            transform: isRecording && audioLevel > 0.1 ? `scaleY(${0.8 + audioLevel * 0.4})` : 'scaleY(1)',
            transition: isRecording ? 'height 75ms ease-out, transform 75ms ease-out' : 'height 200ms ease-out'
          }}
        />
      ))}
    </div>
  );
};

export default AudioWaveform;
